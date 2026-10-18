import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { getUnixTime, sha256Hex, hashPasswordForClient, verifyPbkdf2, verifyLegacySha256 } from '../lib/crypto';
import { generateSecureToken } from '../lib/tokens';
import { sendEmail } from '../lib/email';
import { serializeCartItems, deserializeCartItems, mergeCartItems } from '../lib/cart';
import type { Env } from '../types/env';
import type { CartItem, CustomerSessionData } from '../types/auth';

const auth = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();
const CUSTOMER_COOKIE = 'customer_session';

async function getOrCreateCart(env: Env, tenantId: string, customerId: string | null) {
  const now = getUnixTime();
  const cartId = crypto.randomUUID();

  if (customerId) {
    const existing = await env.DB.prepare(
      'SELECT id FROM carts WHERE tenant_id = ? AND customer_id = ? ORDER BY updated_at DESC LIMIT 1'
    )
      .bind(tenantId, customerId)
      .first<{ id: string }>();
    if (existing) return existing.id;
  }

  await env.DB.prepare(
    'INSERT INTO carts (id, tenant_id, customer_id, items, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(cartId, tenantId, customerId, '[]', now, now)
    .run();
  return cartId;
}

async function writeCustomerSession(
  env: Env,
  tenantId: string,
  customerId: string | null,
  cartId: string | null,
  ttlSeconds = 60 * 60 * 24 * 30
) {
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
    JSON.stringify({
      tenantId,
      customerId,
      cartId,
      isGuest: customerId == null,
    } as CustomerSessionData),
    { expirationTtl: ttlSeconds }
  );

  return { token, expiresAt };
}

async function mergeGuestCartOnLogin(env: Env, tenantId: string, guestCartId: string | null, customerId: string) {
  if (!guestCartId) return;
  const now = getUnixTime();
  const guestCart = await env.DB.prepare('SELECT items, customer_id FROM carts WHERE id = ? AND tenant_id = ?')
    .bind(guestCartId, tenantId)
    .first<{ items: string; customer_id: string | null }>();
  if (!guestCart) return;

  let customerCartId: string | null = null;
  const existing = await env.DB.prepare('SELECT id, items FROM carts WHERE tenant_id = ? AND customer_id = ? ORDER BY updated_at DESC LIMIT 1')
    .bind(tenantId, customerId)
    .first<{ id: string; items: string }>();
  if (existing) {
    customerCartId = existing.id;
    const merged = mergeCartItems(deserializeCartItems(guestCart.items), deserializeCartItems(existing.items));
    await env.DB.prepare('UPDATE carts SET items = ?, updated_at = ? WHERE id = ?').bind(serializeCartItems(merged), now, existing.id).run();
  } else {
    customerCartId = guestCartId;
    await env.DB.prepare('UPDATE carts SET customer_id = ?, updated_at = ? WHERE id = ?').bind(customerId, now, guestCartId).run();
  }
  return customerCartId;
}
