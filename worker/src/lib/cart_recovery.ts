import type { Env } from '../types/env';
import { notificarArkangel } from './arkangel';
import { deserializeCartItems } from './cart';
import { getUnixTime } from './crypto';

export interface CartRecoveryOptions {
  tenantId?: string; // Filtrar por tenant opcional (o procesar todos)
  minInactivityHours?: number; // Tiempo mínimo abandonado (default: 1 hora)
  maxInactivityHours?: number; // Tiempo máximo (default: 48 horas)
  limit?: number; // Límite por corrida (default: 25)
}

export interface CartRecoverySummary {
  success: boolean;
  checked: number;
  sent: number;
  skipped: number;
  errors: string[];
  recoveries: Array<{
    cart_id: string;
    tenant: string;
    customer: string;
    phone: string;
    total: number;
    message_id?: string;
  }>;
}

/**
 * Asegura que la tabla cart_recoveries exista para control de idempotencia y métricas.
 */
async function ensureRecoveryTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS cart_recoveries (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      customer_id TEXT,
      phone TEXT NOT NULL,
      items_count INTEGER NOT NULL DEFAULT 1,
      cart_total REAL NOT NULL DEFAULT 0.0,
      sent_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent'
    )`
  ).run();

  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_cart_recoveries_cart ON cart_recoveries (cart_id)`
  ).run();
}

/**
 * Procesa y notifica carritos abandonados a través del motor Arkangel.
 */
export async function procesarCarritosAbandonados(
  env: Env,
  options: CartRecoveryOptions = {}
): Promise<CartRecoverySummary> {
  await ensureRecoveryTable(env);

  const minHours = options.minInactivityHours ?? 1;
  const maxHours = options.maxInactivityHours ?? 48;
  const limit = options.limit ?? 25;

  const now = getUnixTime();
  const maxUpdateTimestamp = now - minHours * 3600; // e.g. al menos 1 hora de inactividad
  const minUpdateTimestamp = now - maxHours * 3600; // e.g. no más de 48 horas de antigüedad

  let query = `
    SELECT 
      c.id AS cart_id,
      c.tenant_id,
      c.items,
      c.updated_at,
      cust.id AS customer_id,
      cust.full_name AS customer_name,
      cust.phone AS customer_phone,
      cust.email AS customer_email,
      t.name AS tenant_name,
      t.slug AS tenant_slug
    FROM carts c
    JOIN customers cust ON c.customer_id = cust.id
    JOIN tenants t ON c.tenant_id = t.id
    LEFT JOIN cart_recoveries cr ON c.id = cr.cart_id
    WHERE c.items != '[]'
      AND c.items != ''
      AND cust.phone IS NOT NULL
      AND trim(cust.phone) != ''
      AND c.updated_at <= ?
      AND c.updated_at >= ?
      AND cr.id IS NULL
  `;

  const binds: any[] = [maxUpdateTimestamp, minUpdateTimestamp];

  if (options.tenantId) {
    query += ` AND (c.tenant_id = ? OR t.slug = ?)`;
    binds.push(options.tenantId, options.tenantId);
  }

  query += ` ORDER BY c.updated_at DESC LIMIT ?`;
  binds.push(limit);

  const { results } = await env.DB.prepare(query).bind(...binds).all<any>();
  const rows = results || [];

  const summary: CartRecoverySummary = {
    success: true,
    checked: rows.length,
    sent: 0,
    skipped: 0,
    errors: [],
    recoveries: [],
  };

  for (const row of rows) {
    try {
      const items = deserializeCartItems(row.items);
      if (!items || items.length === 0) {
        summary.skipped++;
        continue;
      }

      // Calcular total del carrito
      const total = items.reduce(
        (acc: number, it: any) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
      );

      // Resumen de artículos (máx 3 para legibilidad)
      const itemNames = items
        .slice(0, 3)
        .map((it: any) => `${it.quantity || 1}x ${it.name}`)
        .join(', ');
      const itemsSummary = items.length > 3 ? `${itemNames} y más...` : itemNames;

      // URL de recuperación directa
      const storeBase = `https://tiendas.arksystems.site/${row.tenant_slug}`;
      const recoveryUrl = `${storeBase}?cart=${row.cart_id}&utm_source=whatsapp&utm_medium=cart_recovery`;

      const bodyTexto =
        `¡Hola ${row.customer_name}! 🛒 Guardamos los productos que dejaste en tu carrito de ${row.tenant_name} (${itemsSummary}) por un total de $${total.toFixed(2)} MXN.\n\n` +
        `Puedes completar tu pedido directamente aquí: ${recoveryUrl}`;

      // Despachar a Arkangel
      const res = await notificarArkangel(env, {
        tenant_id: row.tenant_slug,
        channel: 'whatsapp',
        tipo: 'cart_recovery',
        to: row.customer_phone,
        body: bodyTexto,
        variables: {
          nombre: row.customer_name,
          marca: row.tenant_name,
          resumen_items: itemsSummary,
          total: `$${total.toFixed(2)} MXN`,
          link_recuperacion: recoveryUrl,
        },
        metadata: {
          cart_id: row.cart_id,
          customer_id: row.customer_id,
          items_count: items.length,
          total_amount: total,
        },
      });

      if (res.ok) {
        summary.sent++;
        // Registrar en cart_recoveries para no volver a enviar
        const recoveryId = `rec_${now}_${Math.random().toString(36).substring(2, 8)}`;
        await env.DB.prepare(
          `INSERT INTO cart_recoveries (id, cart_id, tenant_id, customer_id, phone, items_count, cart_total, sent_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent')`
        )
          .bind(
            recoveryId,
            row.cart_id,
            row.tenant_id,
            row.customer_id,
            row.customer_phone,
            items.length,
            total,
            now
          )
          .run();

        summary.recoveries.push({
          cart_id: row.cart_id,
          tenant: row.tenant_slug,
          customer: row.customer_name,
          phone: row.customer_phone,
          total,
          message_id: res.message_id,
        });
      } else {
        summary.errors.push(`Error en cart ${row.cart_id}: ${res.error || 'Fallo desconocido'}`);
      }
    } catch (err: any) {
      summary.errors.push(`Excepción procesando cart ${row.cart_id}: ${err.message}`);
    }
  }

  return summary;
}
