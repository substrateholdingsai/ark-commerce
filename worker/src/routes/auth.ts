import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { getUnixTime, sha256Hex, hashPasswordForClient, verifyPbkdf2, verifyLegacySha256 } from '../lib/crypto';
import { generateSecureToken } from '../lib/tokens';
import { sendEmail } from '../lib/email';
import { serializeCartItems, deserializeCartItems, mergeCartItems } from '../lib/cart';
import type { Env } from '../types/env';
import type { CustomerSessionData } from '../types/auth';

const auth = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();
const CUSTOMER_COOKIE = 'customer_session';

async function getOrCreateCart(env: Env, tenantId: string, customerId: string | null) {
  const now = getUnixTime();
  if (customerId) {
    const existing = await env.DB.prepare(
      'SELECT id FROM carts WHERE tenant_id = ? AND customer_id = ? ORDER BY updated_at DESC LIMIT 1'
    )
      .bind(tenantId, customerId)
      .first<{ id: string }>();
    if (existing) return existing.id;
  }
  const cartId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO carts (id, tenant_id, customer_id, items, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(cartId, tenantId, customerId, '[]', now, now)
    .run();
  return cartId;
}

async function writeCustomerSession(env: Env, tenantId: string, customerId: string | null, cartId: string | null, ttlSeconds = 2592000) {
  const token = generateSecureToken();
  const tokenHash = await sha256Hex(token);
  const now = getUnixTime();
  const expiresAt = now + ttlSeconds;

  await env.DB.prepare(
    'INSERT INTO store_sessions (token_hash, customer_id, tenant_id, cart_id, expires_at, revoked_at, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)'
  )
    .bind(tokenHash, customerId, tenantId, cartId, expiresAt, now)
    .run();

  await env.SESSION.put(
    `customer_session:${token}`,
    JSON.stringify({ tenantId, customerId, cartId, isGuest: customerId == null } as CustomerSessionData),
    { expirationTtl: ttlSeconds }
  );
  return { token, expiresAt };
}

async function loadSession(env: Env, token: string): Promise<CustomerSessionData | null> {
  const raw = await env.SESSION.get(`customer_session:${token}`);
  if (raw) return JSON.parse(raw);
  const tokenHash = await sha256Hex(token);
  const s = await env.DB.prepare(
    'SELECT customer_id, tenant_id, cart_id, expires_at, revoked_at FROM store_sessions WHERE token_hash = ?'
  )
    .bind(tokenHash)
    .first<{ customer_id: string | null; tenant_id: string; cart_id: string | null; expires_at: number; revoked_at: number | null }>();
  if (!s || s.revoked_at || s.expires_at < getUnixTime()) return null;
  const data: CustomerSessionData = { tenantId: s.tenant_id, customerId: s.customer_id, cartId: s.cart_id, isGuest: s.customer_id == null };
  await env.SESSION.put(`customer_session:${token}`, JSON.stringify(data), { expirationTtl: Math.max(60, s.expires_at - getUnixTime()) });
  return data;
}

async function requireTenant(c: any) {
  const tid = c.get('tenantId');
  if (!tid) return c.json({ success: false, error: 'Tenant not found' }, 404);
  return null;
}

async function mergeGuestCartOnLogin(env: Env, tenantId: string, guestCartId: string | null, customerId: string) {
  if (!guestCartId) return null;
  const now = getUnixTime();
  const guestCart = await env.DB.prepare('SELECT items FROM carts WHERE id = ? AND tenant_id = ?').bind(guestCartId, tenantId).first<{ items: string }>();
  if (!guestCart) return null;
  const existing = await env.DB.prepare('SELECT id, items FROM carts WHERE tenant_id = ? AND customer_id = ? ORDER BY updated_at DESC LIMIT 1').bind(tenantId, customerId).first<{ id: string; items: string }>();
  if (existing) {
    const merged = mergeCartItems(deserializeCartItems(guestCart.items), deserializeCartItems(existing.items));
    await env.DB.prepare('UPDATE carts SET items = ?, updated_at = ? WHERE id = ?').bind(serializeCartItems(merged), now, existing.id).run();
    return existing.id;
  } else {
    await env.DB.prepare('UPDATE carts SET customer_id = ?, updated_at = ? WHERE id = ?').bind(customerId, now, guestCartId).run();
    return guestCartId;
  }
}

// 1. Invitado
auth.post('/guest', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const cartId = await getOrCreateCart(c.env, tenantId, null);
  const { token } = await writeCustomerSession(c.env, tenantId, null, cartId);
  setCookie(c, CUSTOMER_COOKIE, token, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 2592000 });
  return c.json({ success: true, data: { isGuest: true, cartId } });
});

// 2. Registro con Contraseña
auth.post('/register', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const { email, password, fullName, phone } = body || {};
  if (!email || !password || !fullName) return c.json({ success: false, error: 'Missing required fields' }, 400);
  const now = getUnixTime();
  const existing = await c.env.DB.prepare('SELECT id FROM customers WHERE tenant_id = ? AND lower(email)=lower(?)').bind(tenantId, email).first();
  if (existing) return c.json({ success: false, error: 'Email already registered' }, 409);
  const customerId = crypto.randomUUID();
  const pwd = await hashPasswordForClient(password);
  await c.env.DB.prepare(
    'INSERT INTO customers (id, tenant_id, email, password_hash, full_name, phone, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)'
  ).bind(customerId, tenantId, email, pwd, fullName, phone || null, now, now).run();
  let cartId = await getOrCreateCart(c.env, tenantId, customerId);
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (tokenCookie) {
    const s = await loadSession(c.env, tokenCookie);
    if (s && s.tenantId === tenantId && s.customerId == null && s.cartId) {
      const merged = await mergeGuestCartOnLogin(c.env, tenantId, s.cartId, customerId);
      if (merged) cartId = merged;
      const th = await sha256Hex(tokenCookie);
      await c.env.DB.prepare('UPDATE store_sessions SET customer_id = ?, cart_id = ?, revoked_at = ? WHERE token_hash = ?').bind(customerId, cartId, now, th).run();
      await c.env.SESSION.delete(`customer_session:${tokenCookie}`);
      deleteCookie(c, CUSTOMER_COOKIE);
    }
  }
  const { token } = await writeCustomerSession(c.env, tenantId, customerId, cartId);
  setCookie(c, CUSTOMER_COOKIE, token, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 2592000 });
  return c.json({ success: true, data: { customerId, cartId, isGuest: false } }, 201);
});

// 3. Login
auth.post('/login', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const { email, password } = body || {};
  if (!email || !password) return c.json({ success: false, error: 'Missing credentials' }, 400);
  const customer = await c.env.DB.prepare('SELECT id, password_hash FROM customers WHERE tenant_id = ? AND lower(email)=lower(?)').bind(tenantId, email).first<{ id: string; password_hash: string | null }>();
  if (!customer || !customer.password_hash) return c.json({ success: false, error: 'Invalid credentials' }, 401);
  let ok = false;
  if (customer.password_hash.startsWith('pbkdf2$')) {
    ok = await verifyPbkdf2(password, customer.password_hash);
  } else {
    ok = await verifyLegacySha256(customer.password_hash, password);
    if (ok) {
      const now = getUnixTime();
      const newHash = await hashPasswordForClient(password);
      await c.env.DB.prepare('UPDATE customers SET password_hash = ?, updated_at = ? WHERE id = ?').bind(newHash, now, customer.id).run();
    }
  }
  if (!ok) return c.json({ success: false, error: 'Invalid credentials' }, 401);
  let cartId = await getOrCreateCart(c.env, tenantId, customer.id);
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (tokenCookie) {
    const s = await loadSession(c.env, tokenCookie);
    if (s && s.tenantId === tenantId && s.customerId == null && s.cartId) {
      const merged = await mergeGuestCartOnLogin(c.env, tenantId, s.cartId, customer.id);
      if (merged) cartId = merged;
      const th = await sha256Hex(tokenCookie);
      await c.env.DB.prepare('UPDATE store_sessions SET customer_id = ?, cart_id = ?, revoked_at = ? WHERE token_hash = ?').bind(customer.id, cartId, getUnixTime(), th).run();
      await c.env.SESSION.delete(`customer_session:${tokenCookie}`);
      deleteCookie(c, CUSTOMER_COOKIE);
    }
  }
  const { token } = await writeCustomerSession(c.env, tenantId, customer.id, cartId);
  setCookie(c, CUSTOMER_COOKIE, token, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 2592000 });
  return c.json({ success: true, data: { customerId: customer.id, cartId, isGuest: false } });
});

// 4. Logout
auth.post('/logout', async (c) => {
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (tokenCookie) {
    const th = await sha256Hex(tokenCookie);
    await c.env.DB.prepare('UPDATE store_sessions SET revoked_at = ? WHERE token_hash = ?').bind(getUnixTime(), th).run();
    await c.env.SESSION.delete(`customer_session:${tokenCookie}`);
    deleteCookie(c, CUSTOMER_COOKIE);
  }
  return c.json({ success: true });
});

// 5. Perfil / Sesión actual
auth.get('/me', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (!tokenCookie) return c.json({ success: true, data: { isGuest: true } });
  const s = await loadSession(c.env, tokenCookie);
  if (!s) {
    deleteCookie(c, CUSTOMER_COOKIE);
    return c.json({ success: true, data: { isGuest: true } });
  }
  if (!s.customerId) return c.json({ success: true, data: { isGuest: true, cartId: s.cartId } });
  const cust = await c.env.DB.prepare('SELECT id, email, full_name, phone, default_address_line1, default_address_line2, default_city, default_state, default_postal_code FROM customers WHERE id = ?').bind(s.customerId).first();
  return c.json({ success: true, data: { isGuest: false, customer: cust, cartId: s.cartId } });
});

// 6. Magic Link - Solicitud
auth.post('/magic/request', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const { email, fullName } = body || {};
  if (!email) return c.json({ success: false, error: 'Email required' }, 400);
  const now = getUnixTime();
  let customer = await c.env.DB.prepare('SELECT id FROM customers WHERE tenant_id = ? AND lower(email)=lower(?)').bind(tenantId, email).first<{ id: string }>();
  if (!customer) {
    const customerId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO customers (id, tenant_id, email, password_hash, full_name, phone, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)'
    ).bind(customerId, tenantId, email, null, fullName || email, null, now, now).run();
    customer = { id: customerId };
  }
  const token = generateSecureToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = now + 900;
  await c.env.DB.prepare(
    'INSERT INTO action_tokens (id, tenant_id, customer_id, token_hash, action, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)'
  ).bind(crypto.randomUUID(), tenantId, customer.id, tokenHash, 'magic_login', expiresAt, now).run();
  
  const origin = new URL(c.req.url).origin;
  const url = `${origin}/api/auth/magic/callback?token=${token}`;
  await sendEmail(c.env, { 
    to: email, 
    subject: 'Acceso a tu cuenta', 
    text: `Haz clic en el siguiente enlace para iniciar sesión: ${url}` 
  });
  return c.json({ success: true });
});

// 7. Magic Link - Callback
auth.get('/magic/callback', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const token = c.req.query('token') || '';
  if (!token) return c.json({ success: false, error: 'Missing token' }, 400);
  const tokenHash = await sha256Hex(token);
  const now = getUnixTime();
  const t = await c.env.DB.prepare('SELECT id, customer_id, expires_at, used_at FROM action_tokens WHERE tenant_id = ? AND token_hash = ? AND action = ?').bind(tenantId, tokenHash, 'magic_login').first<any>();
  if (!t || t.used_at || t.expires_at < now) return c.json({ success: false, error: 'Invalid or expired token' }, 400);
  await c.env.DB.prepare('UPDATE action_tokens SET used_at = ? WHERE id = ?').bind(now, t.id).run();
  let cartId = await getOrCreateCart(c.env, tenantId, t.customer_id);
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (tokenCookie) {
    const s = await loadSession(c.env, tokenCookie);
    if (s && s.tenantId === tenantId && s.customerId == null && s.cartId) {
      const merged = await mergeGuestCartOnLogin(c.env, tenantId, s.cartId, t.customer_id);
      if (merged) cartId = merged;
      const th = await sha256Hex(tokenCookie);
      await c.env.DB.prepare('UPDATE store_sessions SET customer_id = ?, cart_id = ?, revoked_at = ? WHERE token_hash = ?').bind(t.customer_id, cartId, now, th).run();
      await c.env.SESSION.delete(`customer_session:${tokenCookie}`);
      deleteCookie(c, CUSTOMER_COOKIE);
    }
  }
  const { token: sessToken } = await writeCustomerSession(c.env, tenantId, t.customer_id, cartId);
  setCookie(c, CUSTOMER_COOKIE, sessToken, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 2592000 });
  const url = new URL(c.req.url);
  const redirect = url.searchParams.get('redirect') || '/';
  return c.redirect(redirect);
});

// 8. Historial de pedidos del cliente
auth.get('/orders', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (!tokenCookie) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const s = await loadSession(c.env, tokenCookie);
  if (!s || !s.customerId) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT id, order_number, total, status, payment_method, customer_address, customer_phone, customer_email, created_at
     FROM orders
     WHERE tenant_id = ? AND customer_id = ?
     ORDER BY created_at DESC
     LIMIT 50`
  ).bind(tenantId, s.customerId).all();
  const orders = [];
  for (const o of results as any[]) {
    const items = await c.env.DB.prepare(
      `SELECT product_id, name, quantity, price FROM order_items WHERE order_id = ? ORDER BY id`
    ).bind(o.id).all();
    orders.push({ ...o, items: items.results });
  }
  return c.json({ success: true, data: orders });
});

// 9. Direcciones guardadas
auth.get('/addresses', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (!tokenCookie) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const s = await loadSession(c.env, tokenCookie);
  if (!s || !s.customerId) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM customer_addresses WHERE tenant_id = ? AND customer_id = ? ORDER BY is_default DESC, created_at DESC`
  ).bind(tenantId, s.customerId).all();
  return c.json({ success: true, data: results });
});

auth.post('/addresses', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (!tokenCookie) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const s = await loadSession(c.env, tokenCookie);
  if (!s || !s.customerId) return c.json({ success: false, error: 'Unauthorized' }, 401);
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const { address_line1, address_line2, city, state, postal_code, country, is_default } = body || {};
  if (!address_line1) return c.json({ success: false, error: 'address_line1 required' }, 400);
  const now = getUnixTime();
  const id = crypto.randomUUID();
  if (is_default) {
    await c.env.DB.prepare('UPDATE customer_addresses SET is_default = 0, updated_at = ? WHERE tenant_id = ? AND customer_id = ?').bind(now, tenantId, s.customerId).run();
  }
  await c.env.DB.prepare(
    `INSERT INTO customer_addresses (id, tenant_id, customer_id, address_line1, address_line2, city, state, postal_code, country, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, tenantId, s.customerId, address_line1, address_line2 || null, city || null, state || null, postal_code || null, country || 'MX', is_default ? 1 : 0, now, now).run();
  const addr = await c.env.DB.prepare('SELECT * FROM customer_addresses WHERE id = ?').bind(id).first();
  return c.json({ success: true, data: addr }, 201);
});

auth.put('/addresses/:id/default', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (!tokenCookie) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const s = await loadSession(c.env, tokenCookie);
  if (!s || !s.customerId) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const now = getUnixTime();
  await c.env.DB.prepare('UPDATE customer_addresses SET is_default = 0, updated_at = ? WHERE tenant_id = ? AND customer_id = ?').bind(now, tenantId, s.customerId).run();
  await c.env.DB.prepare('UPDATE customer_addresses SET is_default = 1, updated_at = ? WHERE id = ? AND customer_id = ? AND tenant_id = ?').bind(now, id, s.customerId, tenantId).run();
  return c.json({ success: true });
});

// 10. Actualizar Perfil
auth.put('/profile', async (c) => {
  const tenantErr = await requireTenant(c);
  if (tenantErr) return tenantErr;
  const tenantId = c.get('tenantId');
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (!tokenCookie) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const s = await loadSession(c.env, tokenCookie);
  if (!s || !s.customerId) return c.json({ success: false, error: 'Unauthorized' }, 401);
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const now = getUnixTime();
  const sets: string[] = [];
  const vals: any[] = [];
  if (body.fullName !== undefined) { sets.push('full_name = ?'); vals.push(body.fullName); }
  if (body.phone !== undefined) { sets.push('phone = ?'); vals.push(body.phone); }
  if (body.default_address_line1 !== undefined) { sets.push('default_address_line1 = ?'); vals.push(body.default_address_line1); }
  if (body.default_address_line2 !== undefined) { sets.push('default_address_line2 = ?'); vals.push(body.default_address_line2); }
  if (body.default_city !== undefined) { sets.push('default_city = ?'); vals.push(body.default_city); }
  if (body.default_state !== undefined) { sets.push('default_state = ?'); vals.push(body.default_state); }
  if (body.default_postal_code !== undefined) { sets.push('default_postal_code = ?'); vals.push(body.default_postal_code); }
  if (sets.length > 0) {
    sets.push('updated_at = ?');
    vals.push(now);
    vals.push(s.customerId);
    await c.env.DB.prepare(`UPDATE customers SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  }
  const cust = await c.env.DB.prepare('SELECT id, email, full_name, phone, default_address_line1, default_address_line2, default_city, default_state, default_postal_code FROM customers WHERE id = ?').bind(s.customerId).first();
  return c.json({ success: true, data: cust });
});

export default auth;
