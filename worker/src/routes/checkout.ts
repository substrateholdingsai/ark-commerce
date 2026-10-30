import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { CheckoutSchema } from '../schemas/checkout';
import { getUnixTime, sha256Hex } from '../lib/crypto';
import type { Env, CheckoutMessage } from '../types/env';
import type { CustomerSessionData } from '../types/auth';
import { notificarArkangel } from '../lib/arkangel';

type ProductRow = { id: string; name: string; price: number };

const checkout = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();
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

checkout.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  if (!tenantId) return c.json({ success: false, error: 'Tenant not found' }, 404);

  let body: unknown;
  try { body = await c.req.json(); } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const validation = CheckoutSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, error: 'Invalid input', details: validation.error.flatten() }, 400);
  }

  const { customerName, customerEmail, customerAddress, customerPhone, paymentMethod, items, notes, shippingCost, shippingCarrier, shippingService } = validation.data;

  let customerId: string | null = null;
  const tokenCookie = getCookie(c, CUSTOMER_COOKIE);
  if (tokenCookie) {
    const sess = await loadSession(c.env, tokenCookie);
    if (sess && sess.tenantId === tenantId) {
      customerId = sess.customerId;
    }
  }

  try {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const placeholders = productIds.map(() => '?').join(', ');
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, price FROM products WHERE id IN (${placeholders}) AND tenant_id = ? AND active = 1`
    ).bind(...productIds, tenantId).all<ProductRow>();

    const productsById = new Map(results.map((p) => [p.id, p]));
    if (productsById.size !== productIds.length) {
      return c.json({ success: false, error: 'Some products are not available' }, 400);
    }

    let total = 0;
    const orderItems = items.map((item) => {
      const product = productsById.get(item.productId)!;
      total += product.price * item.quantity;
      return { productId: product.id, name: product.name, quantity: item.quantity, price: product.price };
    });

    const shippingAmount = typeof shippingCost === 'number' && shippingCost > 0 ? shippingCost : 0;
    total += shippingAmount;

    const orderId = crypto.randomUUID();
    const orderNumber = `${tenantId.toUpperCase().slice(0,3)}-${orderId.toUpperCase().slice(0,8)}`;
    const statements = [
      c.env.DB.prepare(`INSERT INTO orders (id, order_number, tenant_id, customer_id, customer_name, customer_address, customer_phone, customer_email, customer_notes, payment_method, total, shipping_cost, shipping_carrier, shipping_service, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")`)
        .bind(orderId, orderNumber, tenantId, customerId, customerName, customerAddress, customerPhone, customerEmail, notes ?? null, paymentMethod, total, shippingAmount, shippingCarrier ?? null, shippingService ?? null),
      ...orderItems.map((item) =>
        c.env.DB.prepare(`INSERT INTO order_items (id, order_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?, ?)`)
          .bind(crypto.randomUUID(), orderId, item.productId, item.quantity, item.price, item.name)
      ),
    ];
    await c.env.DB.batch(statements);
    const message: CheckoutMessage = { orderId, customerName, customerEmail, total, items: orderItems };
    await c.env.ORDER_QUEUE.send(message);
    const tenant = c.get('tenant');
    if (customerPhone) {
      const p = notificarArkangel(c.env, {
        tenant_id: tenant?.slug ?? tenantId,
        to: customerPhone,
        channel: 'whatsapp',
        tipo: 'order_confirmation',
        order_id: orderId,
        body: `¡Hola ${customerName}! Tu pedido #${orderId} en ${tenant?.name ?? ''} ha sido confirmado por un total de $${total}. Te notificaremos en cuanto vaya en camino.`,
         variables: {
           nombre: customerName,
           orden: orderId,
           total: `$${total} MXN`,
           envio: shippingAmount > 0 ? `$${shippingAmount} MXN` : 'Por acordar',
         },
      });
      if (c.executionCtx?.waitUntil) c.executionCtx.waitUntil(p); else await p;
    }
    if (customerId) {
      const now = getUnixTime();
      await c.env.DB.prepare('UPDATE carts SET items = ?, updated_at = ? WHERE tenant_id = ? AND customer_id = ?').bind('[]', now, tenantId, customerId).run();
      if (tokenCookie) {
        const sess = await loadSession(c.env, tokenCookie);
        if (sess?.cartId) {
          await c.env.DB.prepare('UPDATE carts SET items = ?, updated_at = ? WHERE id = ?').bind('[]', now, sess.cartId).run();
        }
      }
    }
    return c.json({ success: true, data: { orderId, orderNumber, total, status: 'pending', message: 'Order created successfully' } }, 201);
  } catch (error) {
    console.error('Checkout error:', error);
    return c.json({ success: false, error: 'Failed to process checkout' }, 500);
  }
});
export default checkout;
