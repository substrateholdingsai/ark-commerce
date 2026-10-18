import { Hono } from 'hono';
import { z } from 'zod';
import { EnviaService } from '../lib/envia';
import type { Env, Tenant } from '../types/env';

const shipping = new Hono<{ Bindings: Env; Variables: { tenant: Tenant | null; tenantId: string | null } }>();

const QuoteInputSchema = z.object({
  postalCode: z.string().min(5).max(10),
  state: z.string().min(2).max(10).optional().default('CMX'),
  city: z.string().min(2).max(100).optional().default('Ciudad de México'),
  street: z.string().optional().default('Dirección de entrega'),
  number: z.string().optional().default('S/N'),
  district: z.string().optional().default('Centro'),
  items: z.array(z.object({
    productId: z.string().optional(),
    weight: z.number().optional().default(1),
    quantity: z.number().int().positive().default(1),
  })).optional(),
  packageWeight: z.number().positive().optional().default(1.5),
});

const GenerateLabelSchema = z.object({
  orderId: z.string().min(1),
  carrier: z.string().min(2),
  service: z.string().min(2),
});

/**
 * POST /api/shipping/quote
 * Obtiene cotizaciones en tiempo real de paqueterías mexicanas para el carrito/pedido.
 */
shipping.post('/quote', async (c) => {
  const tenant = c.get('tenant');
  if (!tenant) return c.json({ success: false, error: 'Tenant not found' }, 404);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const parsed = QuoteInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid quote input', details: parsed.error.flatten() }, 400);
  }

  const { postalCode, state, city, street, number, district, packageWeight } = parsed.data;

  const envia = new EnviaService(c.env, tenant);
  const origin = envia.getTenantOrigin(tenant);

  const destination = {
    name: 'Cliente Final',
    phone: tenant.whatsapp || '525500000000',
    street,
    number,
    district,
    city,
    state,
    country: 'MX',
    postalCode,
  };

  const packages = [
    {
      content: 'Productos de tienda ' + tenant.name,
      amount: 1,
      type: 'box',
      weight: packageWeight,
      weightUnit: 'KG' as const,
      lengthUnit: 'CM' as const,
      dimensions: {
        length: 25,
        width: 20,
        height: 15,
      },
    },
  ];

  try {
    const rates = await envia.quoteRates(origin, destination, packages);
    return c.json({
      success: true,
      data: {
        origin: { city: origin.city, state: origin.state, postalCode: origin.postalCode },
        destination: { city, state, postalCode },
        rates,
      },
    });
  } catch (error: any) {
    console.error('Shipping quote error:', error);
    return c.json({ success: false, error: 'Failed to quote shipping rates' }, 500);
  }
});

/**
 * POST /api/shipping/label
 * Genera la guía de envío y actualiza la orden en D1 con el número de guía y PDF.
 */
shipping.post('/label', async (c) => {
  const tenant = c.get('tenant');
  if (!tenant) return c.json({ success: false, error: 'Tenant not found' }, 404);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const parsed = GenerateLabelSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid label input', details: parsed.error.flatten() }, 400);
  }

  const { orderId, carrier, service } = parsed.data;

  // 1. Obtener la orden desde D1
  const order = await c.env.DB.prepare(
    'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND tenant_id = ?'
  )
    .bind(orderId, orderId, tenant.id)
    .first<any>();

  if (!order) {
    return c.json({ success: false, error: 'Order not found' }, 404);
  }

  const envia = new EnviaService(c.env, tenant);
  const origin = envia.getTenantOrigin(tenant);

  // Parsear dirección del cliente si es posible o usar valores por defecto
  const destAddress = order.customer_address || 'Av Reforma 123, CDMX';
  const destZipMatch = destAddress.match(/\b\d{5}\b/);
  const destPostalCode = destZipMatch ? destZipMatch[0] : '06600';

  const destination = {
    name: order.customer_name || 'Cliente',
    email: order.customer_email || 'cliente@email.com',
    phone: order.customer_phone || '525500000000',
    street: destAddress,
    number: 'S/N',
    city: 'Destino',
    state: 'CMX',
    country: 'MX',
    postalCode: destPostalCode,
  };

  const packages = [
    {
      content: `Orden ${order.order_number}`,
      amount: 1,
      type: 'box',
      weight: 2.0,
      weightUnit: 'KG' as const,
      lengthUnit: 'CM' as const,
      dimensions: { length: 25, width: 20, height: 15 },
    },
  ];

  try {
    const labelResult = await envia.generateLabel(origin, destination, packages, carrier, service);

    // 2. Guardar en D1
    await c.env.DB.prepare(`
      UPDATE orders SET
        shipping_carrier = ?,
        shipping_service = ?,
        shipping_tracking_number = ?,
        shipping_tracking_url = ?,
        shipping_label_url = ?,
        shipping_cost = ?,
        status = 'shipped',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
      .bind(
        labelResult.carrier,
        labelResult.service,
        labelResult.trackingNumber,
        labelResult.trackingUrl,
        labelResult.labelUrl,
        labelResult.totalCost,
        order.id
      )
      .run();

    return c.json({
      success: true,
      message: 'Guía de envío generada con éxito',
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        trackingNumber: labelResult.trackingNumber,
        trackingUrl: labelResult.trackingUrl,
        labelUrl: labelResult.labelUrl,
        carrier: labelResult.carrier,
        service: labelResult.service,
        totalCost: labelResult.totalCost,
        isSimulated: labelResult.isSimulated,
      },
    });
  } catch (err: any) {
    console.error('Generate label error:', err);
    return c.json({ success: false, error: 'Failed to generate shipping label' }, 500);
  }
});

/**
 * GET /api/shipping/track/:carrier/:trackingNumber
 * Rastrea un envío por transportista y número de guía.
 */
shipping.get('/track/:carrier/:trackingNumber', async (c) => {
  const tenant = c.get('tenant');
  const carrier = c.req.param('carrier');
  const trackingNumber = c.req.param('trackingNumber');

  const envia = new EnviaService(c.env, tenant);
  const result = await envia.trackShipment(carrier, trackingNumber);

  return c.json({ success: true, data: result });
});

export default shipping;
