import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { getUnixTime, sha256Hex } from '../lib/crypto';
import { generateSecureToken } from '../lib/tokens';
import { serializeCartItems, deserializeCartItems, mergeCartItems } from '../lib/cart';
import type { Env } from '../types/env';
import type { CartItem, CustomerSessionData } from '../types/auth';

const cart = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();
const CUSTOMER_COOKIE = 'customer_session';

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

async function ensureSession(c: any) {
  const tenantId = c.get('tenantId');
  if (!tenantId) return c.json({ success: false, error: 'Tenant not found' }, 404);
  let tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  let session = tokenCookie ? await loadSession(c.env, tokenCookie) : null;
  if (!session || session.tenantId !== tenantId) {
    const token = generateSecureToken();
    const tokenHash = await sha256Hex(token);
    const now = getUnixTime();
    const expiresAt = now + 2592000;
    const cartId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO carts (id, tenant_id, customer_id, items, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(cartId, tenantId, null, '[]', now, now).run();
    await c.env.DB.prepare(
      'INSERT INTO store_sessions (token_hash, customer_id, tenant_id, cart_id, expires_at, revoked_at, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)'
    ).bind(tokenHash, null, tenantId, cartId, expiresAt, now).run();
    const data: CustomerSessionData = { tenantId, customerId: null, cartId, isGuest: true };
    await c.env.SESSION.put(`customer_session:${token}`, JSON.stringify(data), { expirationTtl: 2592000 });
    setCookie(c, CUSTOMER_COOKIE, token, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 2592000 });
    return { session: data, cartId, items: [] as CartItem[] };
  }
  let cartItems: CartItem[] = [];
  if (session.cartId) {
    const cartRow = await c.env.DB.prepare('SELECT items FROM carts WHERE id = ? AND tenant_id = ?').bind(session.cartId, tenantId).first() as { items: string } | null;
    cartItems = deserializeCartItems(cartRow?.items || '[]');
  } else {
    const cartId = crypto.randomUUID();
    const now = getUnixTime();
    await c.env.DB.prepare('INSERT INTO carts (id, tenant_id, customer_id, items, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').bind(cartId, tenantId, session.customerId, '[]', now, now).run();
    session.cartId = cartId;
  }
  return { session, cartId: session.cartId, items: cartItems };
}

cart.get('/', async (c) => {
  const res = await ensureSession(c);
  if (res instanceof Response) return res;
  return c.json({ success: true, data: { items: res.items, cartId: res.cartId, isGuest: res.session.isGuest } });
});

cart.put('/', async (c) => {
  const res = await ensureSession(c);
  if (res instanceof Response) return res;
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const items = Array.isArray(body.items) ? (body.items as any[]).map((i) => ({ productId: String(i.productId), quantity: Math.max(0, Math.floor(Number(i.quantity))) })).filter((i) => i.quantity > 0) : [];
  const now = getUnixTime();
  await c.env.DB.prepare('UPDATE carts SET items = ?, updated_at = ? WHERE id = ? AND tenant_id = ?').bind(serializeCartItems(items), now, res.cartId, c.get('tenantId')).run();
  return c.json({ success: true, data: { items, cartId: res.cartId } });
});

cart.post('/merge', async (c) => {
  const res = await ensureSession(c);
  if (res instanceof Response) return res;
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const incoming: CartItem[] = Array.isArray(body.items) ? body.items : [];
  const merged = mergeCartItems(res.items, incoming);
  const now = getUnixTime();
  await c.env.DB.prepare('UPDATE carts SET items = ?, updated_at = ? WHERE id = ? AND tenant_id = ?').bind(serializeCartItems(merged), now, res.cartId, c.get('tenantId')).run();
  return c.json({ success: true, data: { items: merged, cartId: res.cartId } });
});

export default cart;
