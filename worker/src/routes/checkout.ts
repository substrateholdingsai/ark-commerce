import { Hono } from 'hono';
import { CheckoutSchema } from '../schemas/checkout';
import type { Env, CheckoutMessage } from '../types/env';

type ProductRow = { id: string; name: string; price: number };

const checkout = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();

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

  const { customerName, customerEmail, customerAddress, customerPhone, paymentMethod, items, notes } = validation.data;

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

    const orderId = crypto.randomUUID();
    const orderNumber = `${tenantId.toUpperCase().slice(0,3)}-${orderId.toUpperCase().slice(0,8)}`;
    const statements = [
      c.env.DB.prepare(
        `INSERT INTO orders (id, order_number, tenant_id, customer_name, customer_address, customer_phone, customer_notes, payment_method, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      ).bind(orderId, orderNumber, tenantId, customerName, customerAddress, customerPhone, notes ?? null, paymentMethod, total),
      ...orderItems.map((item) =>
        c.env.DB.prepare(
          `INSERT INTO order_items (id, order_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(crypto.randomUUID(), orderId, item.productId, item.quantity, item.price, item.name)
      ),
    ];
    await c.env.DB.batch(statements);

    const message: CheckoutMessage = { orderId, customerName, customerEmail, total, items: orderItems };
    await c.env.ORDER_QUEUE.send(message);

    return c.json({ success: true, data: { orderId, orderNumber, total, status: 'pending', message: 'Order created successfully' } }, 201);
  } catch (error) {
    console.error('Checkout error:', error);
    return c.json({ success: false, error: 'Failed to process checkout' }, 500);
  }
});

export default checkout;
