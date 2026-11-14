import { Hono } from 'hono';
import { z } from 'zod';
import type { Env, Tenant } from '../types/env';
import {
  verifyStayPuftKey,
  logStayPuftAction,
  maskSecret,
  STAYPUFT_OPERATOR,
} from '../lib/staypuft';

type Variables = {
  tenant: Tenant | null;
  tenantId: string | null;
};

const internal = new Hono<{ Bindings: Env; Variables: Variables }>();

const PAGINATION_DEFAULT = 20;
const PAGINATION_CAP = 100;

const PaginationSchema = z
  .object({
    page: z.string().optional().default('1'),
    perPage: z.string().optional().default(String(PAGINATION_DEFAULT)),
  })
  .transform((o) => {
    const page = Math.max(1, parseInt(o.page, 10) || 1);
    let perPage = Math.max(1, parseInt(o.perPage, 10) || PAGINATION_DEFAULT);
    if (perPage > PAGINATION_CAP) perPage = PAGINATION_CAP;
    return { page, perPage, offset: (page - 1) * perPage };
  });

type Pagination = { page: number; perPage: number; offset: number };

function parsePagination(c: any): Pagination {
  const parsed = PaginationSchema.safeParse({
    page: c.req.query('page'),
    perPage: c.req.query('perPage'),
  });
  return parsed.success ? parsed.data : { page: 1, perPage: PAGINATION_DEFAULT, offset: 0 };
}

function paginated<T>(data: T[], pagination: Pagination, total: number) {
  const totalPages = Math.ceil(total / pagination.perPage) || 0;
  return {
    data,
    pagination: {
      page: pagination.page,
      perPage: pagination.perPage,
      total,
      total_pages: totalPages,
    },
  };
}

function operatorTenant(c: any): Tenant | null {
  return c.get('tenant');
}

function targetForPath(path: string): { type: string | null; id: string | null } {
  const segments = path.split('/').filter(Boolean);
  const idx = segments.indexOf('products');
  if (idx !== -1 && segments[idx + 1]) return { type: 'product', id: segments[idx + 1] };
  const idx2 = segments.indexOf('orders');
  if (idx2 !== -1 && segments[idx2 + 1]) return { type: 'order', id: segments[idx2 + 1] };
  const idx3 = segments.indexOf('customers');
  if (idx3 !== -1 && segments[idx3 + 1]) return { type: 'customer', id: segments[idx3 + 1] };
  return { type: null, id: null };
}

/**
 * Resolves the tenant addressed by the :slug path param.
 * Accepts both a tenant slug and a tenant id (CANACO's id `ten_canaco_01`
 * differs from its slug `canaco`). This is the lookup key used by tenant-scoped
 * routes, independent of the request-context tenant (which defaults to `ark`
 * when no ?tenant= / X-Tenant-ID / subdomain matches).
 */
async function resolvePathTenant(c: any): Promise<Tenant | null> {
  const slug = c.req.param('slug');
  if (!slug) return null;
  return c.env.DB.prepare('SELECT * FROM tenants WHERE slug = ? OR id = ?').bind(slug, slug).first<any>();
}

async function withAudit(
  c: any,
  fn: () => Promise<Response>,
  pathTenant: Tenant | null = null
): Promise<Response> {
  const method = c.req.method;
  const path = c.req.path;
  const tenant = pathTenant ?? operatorTenant(c);
  const target = targetForPath(path);
  try {
    const res = await fn();
    const status = res.status;
    await logStayPuftAction(c.env, {
      method,
      path,
      tenantSlug: tenant?.slug ?? null,
      targetType: target.type,
      targetId: target.id,
      statusCode: status,
      result: status >= 500 ? 'error' : 'ok',
    });
    return res;
  } catch (err: any) {
    await logStayPuftAction(c.env, {
      method,
      path,
      tenantSlug: tenant?.slug ?? null,
      targetType: target.type,
      targetId: target.id,
      statusCode: 500,
      result: 'error',
    });
    return c.json({ success: false, error: 'Internal Server Error' }, 500);
  }
}

function notFound(c: any, message = 'Not found') {
  return c.json({ success: false, error: message }, 404);
}

function unauthorized(c: any) {
  return c.json({ success: false, error: 'Unauthorized' }, 401);
}

// =========================================================================
// StayPuft auth: protects ALL /api/internal/* routes. Fail-closed.
// =========================================================================
internal.use('*', async (c, next) => {
  const key = c.req.raw.headers.get('X-StayPuft-Key');
  const auth = await verifyStayPuftKey(c.env, key);
  if (!auth.ok) {
    const tenant = operatorTenant(c);
    await logStayPuftAction(c.env, {
      method: c.req.method,
      path: c.req.path,
      tenantSlug: tenant?.slug ?? null,
      targetType: null,
      targetId: null,
      statusCode: 401,
      result: 'error',
    });
    return unauthorized(c);
  }
  await next();
});

// =========================================================================
// GET /api/internal/status
// =========================================================================
internal.get('/status', async (c) => {
  return withAudit(c, async () => {
    const services: Record<string, { status: string; detail?: string }> = {};

    // D1
    try {
      const tenantRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM tenants').first<{ n: number }>();
      const productRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM products').first<{ n: number }>();
      const orderRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM orders').first<{ n: number }>();
      services.db = { status: 'ok', detail: 'D1 reachable' };
      (c as any)._counts = {
        tenants: tenantRow?.n ?? 0,
        products: productRow?.n ?? 0,
        orders: orderRow?.n ?? 0,
      };
    } catch (err: any) {
      services.db = { status: 'error', detail: err.message };
      (c as any)._counts = { tenants: 0, products: 0, orders: 0 };
    }

    // KV SESSION
    try {
      await c.env.SESSION.get('__staypuft_status__');
      services.session = { status: 'ok', detail: 'KV SESSION reachable' };
    } catch (err: any) {
      services.session = { status: 'error', detail: err.message };
    }

    // KV CACHE
    try {
      await c.env.CACHE.get('__staypuft_status__');
      services.cache = { status: 'ok', detail: 'KV CACHE reachable' };
    } catch (err: any) {
      services.cache = { status: 'error', detail: err.message };
    }

    // R2
    try {
      await c.env.STORAGE.list({ limit: 1 });
      services.storage = { status: 'ok', detail: 'R2 STORAGE reachable' };
    } catch (err: any) {
      services.storage = { status: 'error', detail: err.message };
    }

    // Queue
    services.queue = c.env.ORDER_QUEUE
      ? { status: 'ok', detail: 'Queue producer bound' }
      : { status: 'unconfigured', detail: 'Queue binding missing' };

    const counts = (c as any)._counts || { tenants: 0, products: 0, orders: 0 };
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      service: 'ark-commerce',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services,
      counts,
    });
  });
});

// =========================================================================
// GET /api/internal/tenants
// =========================================================================
internal.get('/tenants', async (c) => {
  return withAudit(c, async () => {
    const { page, perPage, offset } = parsePagination(c);
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, slug, domain, whatsapp, created_at
       FROM tenants
       ORDER BY name
       LIMIT ? OFFSET ?`
    )
      .bind(perPage, offset)
      .all<any>();
    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM tenants').first<{ n: number }>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      ...paginated(results || [], { page, perPage, offset }, totalRow?.n ?? 0),
    });
  });
});

// =========================================================================
// GET /api/internal/tenants/:slug
// =========================================================================
internal.get('/tenants/:slug', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        status: tenant.active === 0 ? 'inactive' : 'active',
        whatsapp: tenant.whatsapp,
        bank: tenant.bank,
        clabe: maskSecret(tenant.clabe),
        clabe_holder: tenant.clabe_holder,
        btcpay_pos_url: tenant.btcpay_pos_url,
        sats_rate: tenant.sats_rate,
        logo_url: tenant.logo_url,
        theme_color: tenant.theme_color,
        origin: {
          street: tenant.origin_street,
          number: tenant.origin_number,
          district: tenant.origin_district,
          city: tenant.origin_city,
          state: tenant.origin_state,
          postal_code: tenant.origin_postal_code,
          country: tenant.origin_country,
        },
        envia: {
          configured: !!tenant.envia_api_key,
          api_key: maskSecret(tenant.envia_api_key),
        },
      },
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/products
// =========================================================================
internal.get('/tenants/:slug/products', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const { page, perPage, offset } = parsePagination(c);
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, weight, price, "desc", image, badge, stock, active, display_order, created_at, updated_at
       FROM products
       WHERE tenant_id = ?
       ORDER BY active DESC, display_order, name
       LIMIT ? OFFSET ?`
    )
      .bind(tenant.id, perPage, offset)
      .all<any>();
    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM products WHERE tenant_id = ?')
      .bind(tenant.id)
      .first<{ n: number }>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      ...paginated(results || [], { page, perPage, offset }, totalRow?.n ?? 0),
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/products/:id
// =========================================================================
internal.get('/tenants/:slug/products/:id', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const id = c.req.param('id');
    const product = await c.env.DB.prepare(
      `SELECT id, name, weight, price, "desc", image, badge, stock, active, display_order, created_at, updated_at
       FROM products WHERE id = ? AND tenant_id = ?`
    ).bind(id, tenant.id).first<any>();
    if (!product) return notFound(c);
    return c.json({ success: true, operator: STAYPUFT_OPERATOR, tenant: tenant.slug, data: product });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/orders
// =========================================================================
internal.get('/tenants/:slug/orders', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const { page, perPage, offset } = parsePagination(c);
    const status = c.req.query('status');
    let sql = `SELECT id, order_number, customer_id, customer_name, customer_address, customer_phone,
                      customer_email, customer_notes, payment_method, total, status, shipping_carrier,
                      shipping_service, shipping_tracking_number, shipping_tracking_url, shipping_label_url,
                      shipping_cost, created_at, updated_at
               FROM orders
               WHERE tenant_id = ?`;
    const binds: any[] = [tenant.id];
    if (status) {
      sql += ` AND status = ?`;
      binds.push(status);
    }
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    binds.push(perPage, offset);
    const { results } = await c.env.DB.prepare(sql).bind(...binds).all<any>();
    const countSql = `SELECT COUNT(*) AS n FROM orders WHERE tenant_id = ?${status ? ' AND status = ?' : ''}`;
    const countBinds = status ? [tenant.id, status] : [tenant.id];
    const totalRow = await c.env.DB.prepare(countSql).bind(...countBinds).first<{ n: number }>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      ...paginated(results || [], { page, perPage, offset }, totalRow?.n ?? 0),
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/orders/:id
// =========================================================================
internal.get('/tenants/:slug/orders/:id', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const id = c.req.param('id');
    const order = await c.env.DB.prepare(
      `SELECT id, order_number, customer_id, customer_name, customer_address, customer_phone,
                      customer_email, customer_notes, payment_method, total, status, shipping_carrier,
                      shipping_service, shipping_tracking_number, shipping_tracking_url, shipping_label_url,
                      shipping_cost, created_at, updated_at
        FROM orders WHERE id = ? AND tenant_id = ?`
    ).bind(id, tenant.id).first<any>();
    if (!order) return notFound(c);
    const { results: items } = await c.env.DB.prepare(
      `SELECT id, product_id, quantity, price, name, design_id, talla, color, tecnica, base_cost, print_cost, precio_final
       FROM order_items WHERE order_id = ? ORDER BY id`
    ).bind(order.id).all<any>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      data: { ...order, items: items || [] },
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/customers
// =========================================================================
internal.get('/tenants/:slug/customers', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const { page, perPage, offset } = parsePagination(c);
    const { results } = await c.env.DB.prepare(
      `SELECT id, email, full_name, phone, email_verified_at, created_at, updated_at
       FROM customers
       WHERE tenant_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(tenant.id, perPage, offset)
      .all<any>();
    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM customers WHERE tenant_id = ?')
      .bind(tenant.id)
      .first<{ n: number }>();
    const data = (results || []).map((cust) => ({
      id: cust.id,
      email: cust.email,
      full_name: cust.full_name,
      phone: cust.phone,
      email_verified_at: cust.email_verified_at,
      created_at: cust.created_at,
      updated_at: cust.updated_at,
    }));
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      ...paginated(data, { page, perPage, offset }, totalRow?.n ?? 0),
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/leads
// =========================================================================
internal.get('/tenants/:slug/leads', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const { page, perPage, offset } = parsePagination(c);
    const { results } = await c.env.DB.prepare(
      `SELECT id, phone, sender_name, direction, message_text, matched_tenant, matched_service,
                      estimated_price, status, created_at
       FROM whatsapp_messages
       WHERE tenant_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(tenant.id, perPage, offset)
      .all<any>();
    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM whatsapp_messages WHERE tenant_id = ?')
      .bind(tenant.id)
      .first<{ n: number }>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      ...paginated(results || [], { page, perPage, offset }, totalRow?.n ?? 0),
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/leads/summary
// =========================================================================
internal.get('/tenants/:slug/leads/summary', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const binds: any[] = [tenant.id];
    const where = 'WHERE tenant_id = ?';

    const totalRow = await c.env.DB.prepare(
      `SELECT COUNT(*) AS total_leads, COALESCE(SUM(estimated_price), 0) AS total_value,
              COUNT(DISTINCT phone) AS unique_contacts
       FROM whatsapp_messages ${where}`
    ).bind(...binds).first<any>();

    const { results: byChannel } = await c.env.DB.prepare(
      `SELECT direction AS channel, COUNT(*) AS count
       FROM whatsapp_messages ${where}
       GROUP BY direction
       ORDER BY count DESC`
    ).bind(...binds).all<any>();

    const { results: recentLeads } = await c.env.DB.prepare(
      `SELECT id, phone, sender_name, direction, message_text, matched_tenant, matched_service,
              estimated_price, status, created_at
       FROM whatsapp_messages ${where}
       ORDER BY created_at DESC LIMIT 50`
    ).bind(...binds).all<any>();

    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      data: {
        totals: {
          leads: totalRow?.total_leads ?? 0,
          value: totalRow?.total_value ?? 0,
          unique_contacts: totalRow?.unique_contacts ?? 0,
        },
        by_channel: byChannel || [],
        recent_leads: recentLeads || [],
      },
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/tenants/:slug/content
// =========================================================================
internal.get('/tenants/:slug/content', async (c) => {
  const pathTenant = await resolvePathTenant(c);
  if (!pathTenant) return notFound(c);
  return withAudit(c, async () => {
    const tenant = pathTenant;
    const { page, perPage, offset } = parsePagination(c);
    const { results: sections } = await c.env.DB.prepare(
      `SELECT id, page, section_type, title, subtitle, body, cta_label, cta_link, image,
              display_order, active, version, source_note, created_at, updated_at, updated_by
       FROM content_sections
       WHERE tenant_id = ?
       ORDER BY active DESC, display_order, id
       LIMIT ? OFFSET ?`
    )
      .bind(tenant.id, perPage, offset)
      .all<any>();
    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM content_sections WHERE tenant_id = ?')
      .bind(tenant.id)
      .first<{ n: number }>();

    const { results: eventos } = await c.env.DB.prepare(
      `SELECT id, nombre, descripcion, alcance, formato, fecha, proxima_fecha, lugar, expectativa,
              actividades, patrocinios, costos_stands_preventa, display_order, active, version, source_note,
              created_at, updated_at, updated_by
       FROM content_eventos
       WHERE tenant_id = ?
       ORDER BY active DESC, display_order, id`
    ).bind(tenant.id).all<any>();

    const contacto = await c.env.DB.prepare(
      `SELECT id, departamento, correo, telefono, telefonos_expo_feria, version, source_note,
              created_at, updated_at, updated_by
       FROM content_contacto_general
       WHERE tenant_id = ?`
    ).bind(tenant.id).first<any>();

    const { results: catalogo } = await c.env.DB.prepare(
      `SELECT id, categoria, descripcion, departamento, contacto, display_order, active, version, source_note,
              created_at, updated_at, updated_by
       FROM content_catalogo_servicios
       WHERE tenant_id = ?
       ORDER BY active DESC, display_order, id`
    ).bind(tenant.id).all<any>();

    const total = totalRow?.n ?? 0;
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      tenant: tenant.slug,
      data: {
        pages: sections || [],
        eventos: eventos || [],
        contacto_general: contacto ?? null,
        catalogo_servicios: catalogo || [],
      },
      pagination: {
        page,
        perPage,
        total,
        total_pages: Math.ceil(total / perPage) || 0,
      },
    });
  }, pathTenant);
});

// =========================================================================
// GET /api/internal/metrics
// =========================================================================
internal.get('/metrics', async (c) => {
  return withAudit(c, async () => {
    const { results } = await c.env.DB.prepare(
      `SELECT t.id AS tenant_id, t.slug AS tenant_slug, t.name AS tenant_name,
              COUNT(o.id) AS orders,
              COALESCE(SUM(o.total), 0) AS revenue
       FROM tenants t
       LEFT JOIN orders o ON o.tenant_id = t.id
       GROUP BY t.id, t.slug, t.name
       ORDER BY revenue DESC`
    ).all<any>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      data: results || [],
    });
  });
});

// =========================================================================
// GET /api/internal/audit
// =========================================================================
internal.get('/audit', async (c) => {
  return withAudit(c, async () => {
    const { page, perPage, offset } = parsePagination(c);
    const { results } = await c.env.DB.prepare(
      `SELECT id, operator, method, path, tenant_slug, target_type, target_id,
              status_code, result, created_at
       FROM staypuft_audit_log
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
      .bind(perPage, offset)
      .all<any>();
    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM staypuft_audit_log').first<{ n: number }>();
    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      ...paginated(results || [], { page, perPage, offset }, totalRow?.n ?? 0),
    });
  });
});

// =========================================================================
// GET /api/internal/diagnostics
// =========================================================================
internal.get('/diagnostics', async (c) => {
  return withAudit(c, async () => {
    const { results: brokenProducts } = await c.env.DB.prepare(
      `SELECT id, tenant_id, name, price, stock, active
       FROM products
       WHERE price <= 0 OR price IS NULL OR name IS NULL OR trim(name) = ''
          OR "desc" IS NULL OR trim("desc") = '' OR image IS NULL OR trim(image) = ''`
    ).all<any>();

    const { results: stalePrices } = await c.env.DB.prepare(
      `SELECT id, tenant_id, name, price, updated_at
       FROM products
       WHERE active = 1 AND updated_at < datetime('now', '-180 days')`
    ).all<any>();

    const { results: stuckOrders } = await c.env.DB.prepare(
      `SELECT id, order_number, tenant_id, customer_name, total, status, created_at
       FROM orders
       WHERE status = 'pending' AND created_at < datetime('now', '-7 days')`
    ).all<any>();

    const { results: missingTracking } = await c.env.DB.prepare(
      `SELECT id, order_number, tenant_id, customer_name, shipping_carrier, shipping_service, status
       FROM orders
       WHERE status = 'shipped' AND (shipping_tracking_number IS NULL OR trim(shipping_tracking_number) = '')`
    ).all<any>();

    const { results: tenantsNoProducts } = await c.env.DB.prepare(
      `SELECT t.id, t.slug, t.name
       FROM tenants t
       LEFT JOIN products p ON p.tenant_id = t.id
       GROUP BY t.id, t.slug, t.name
       HAVING COUNT(p.id) = 0`
    ).all<any>();

    // Exercise the same products query the tenant-scoped routes use, per tenant,
    // so diagnostics surfaces a 500ing products route instead of hiding it.
    const { results: allTenants } = await c.env.DB.prepare('SELECT id, slug FROM tenants').all<any>();
    const productsQueryCheck = (allTenants || []).map((t: any) => {
      try {
        c.env.DB.prepare(
          `SELECT id, name, weight, price, "desc", image, badge, stock, active, display_order, created_at, updated_at
           FROM products
           WHERE tenant_id = ?
           ORDER BY active DESC, display_order, name
           LIMIT 1 OFFSET 0`
        )
          .bind(t.id)
          .all<any>();
        return { tenant_id: t.id, tenant_slug: t.slug, products_query: 'ok' };
      } catch (err: any) {
        return { tenant_id: t.id, tenant_slug: t.slug, products_query: 'error', error: String(err?.message ?? err) };
      }
    });

    // Exercise the same content queries the tenant-scoped content route uses,
    // per tenant, so diagnostics surfaces a 500ing content route instead of hiding it.
    const contentQueryCheck = (allTenants || []).map((t: any) => {
      try {
        c.env.DB.prepare(`SELECT id FROM content_sections WHERE tenant_id = ? LIMIT 1`).bind(t.id).all<any>();
        c.env.DB.prepare(`SELECT id FROM content_eventos WHERE tenant_id = ? LIMIT 1`).bind(t.id).all<any>();
        c.env.DB.prepare(`SELECT id FROM content_contacto_general WHERE tenant_id = ? LIMIT 1`).bind(t.id).all<any>();
        c.env.DB.prepare(`SELECT id FROM content_catalogo_servicios WHERE tenant_id = ? LIMIT 1`).bind(t.id).all<any>();
        return { tenant_id: t.id, tenant_slug: t.slug, content_query: 'ok' };
      } catch (err: any) {
        return { tenant_id: t.id, tenant_slug: t.slug, content_query: 'error', error: String(err?.message ?? err) };
      }
    });

    return c.json({
      success: true,
      operator: STAYPUFT_OPERATOR,
      generated_at: new Date().toISOString(),
      data: {
        broken_products: brokenProducts || [],
        stale_prices: stalePrices || [],
        stuck_orders_pending_7d: stuckOrders || [],
        shipped_without_tracking: missingTracking || [],
        tenants_without_products: tenantsNoProducts || [],
        products_query: productsQueryCheck,
        content_query: contentQueryCheck,
      },
    });
  });
});

export default internal;
