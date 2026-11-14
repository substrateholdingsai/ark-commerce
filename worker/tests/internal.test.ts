import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import internalRoute from '../src/routes/internal';

const SP_KEY = 'test_sp_key_do_not_use_in_prod_7f3a91c2';

type Tenant = any;

function makeKV() {
  const store = new Map<string, string>();
  return {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string, opts?: any) => { store.set(k, v); },
    delete: async (k: string) => { store.delete(k); },
  };
}

type Canned = {
  tenants: Tenant[];
  products: any[];
  orders: any[];
  order_items: any[];
  customers: any[];
  whatsapp_messages: any[];
  staypuft_audit_log: any[];
};

function lastBind<T>(binds: T[], idx: number): T | undefined {
  return binds[idx];
}

function makeDb(canned: Canned, writes: string[]) {
  const TABLES = ['tenants', 'products', 'orders', 'order_items', 'customers', 'whatsapp_messages', 'staypuft_audit_log'];
  function tableOf(sql: string): string | null {
    const s = sql.toUpperCase();
    for (const t of TABLES) {
      if (new RegExp(`\\bFROM\\s+${t}\\b`, 'i').test(sql) || new RegExp(`\\bINTO\\s+${t}\\b`, 'i').test(sql) || new RegExp(`\\bUPDATE\\s+${t}\\b`, 'i').test(sql) || new RegExp(`\\bDELETE\\s+FROM\\s+${t}\\b`, 'i').test(sql)) {
        return t;
      }
    }
    return null;
  }
  function placeholderOrdinal(sql: string, column: string): number {
    const m = sql.match(new RegExp(`\\b${column}\\s*=\\s*\\?`, 'i'));
    if (!m) return -1;
    return (sql.slice(0, m.index).match(/\?/g) || []).length;
  }
  function bindFor(sql: string, binds: any[], column: string): any {
    const idx = placeholderOrdinal(sql, column);
    return idx >= 0 ? binds[idx] : undefined;
  }
  function applyFilters(rows: any[], sql: string, binds: any[]): any[] {
    let out = rows.slice();
    const s = sql.toUpperCase();
    // resolvePathTenant uses WHERE slug = ? OR id = ? with identical binds:
    // match on slug OR id so both slug and id lookups work.
    if (/\bslug\s*=\s*\?\s*OR\s*id\s*=\s*\?/i.test(s)) {
      const v = binds[0];
      out = out.filter((r) => String(r.slug) === String(v) || String(r.id) === String(v));
    } else {
      const tenantBind = bindFor(sql, binds, 'tenant_id');
      if (tenantBind !== undefined) out = out.filter((r) => String(r.tenant_id) === String(tenantBind));
      const slugBind = bindFor(sql, binds, 'slug');
      if (slugBind !== undefined) out = out.filter((r) => r.slug === slugBind);
      const idBind = bindFor(sql, binds, 'id');
      if (idBind !== undefined) {
        if (/\btenant_id\b/i.test(s)) out = out.filter((r) => String(r.id) === String(idBind) && String(r.tenant_id) === String(bindFor(sql, binds, 'tenant_id')));
        else out = out.filter((r) => String(r.id) === String(idBind));
      }
    }
    const orderIdBind = bindFor(sql, binds, 'order_id');
    if (orderIdBind !== undefined) out = out.filter((r) => String(r.order_id) === String(orderIdBind));
    const statusBind = bindFor(sql, binds, 'status');
    if (statusBind !== undefined) out = out.filter((r) => String(r.status) === String(statusBind));
    if (/\bactive\s*=\s*1\b/i.test(s)) out = out.filter((r) => r.active === 1);
    if (/\border\s+by\s+created_at\s+desc/i.test(s)) out = out.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    if (/\border\s+by\s+name/i.test(s)) out = out.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    return out;
  }
  function applyLimitOffset(rows: any[], sql: string, binds: any[]): any[] {
    if (!/LIMIT\s*\?/i.test(sql)) return rows;
    const perPage = binds[binds.length - 2];
    const offset = binds[binds.length - 1];
    const n = Number(perPage);
    const o = Number(offset);
    return Number.isFinite(n) ? rows.slice(o, o + n) : rows;
  }
  return {
    prepare(sql: string) {
      const isWrite = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s/i.test(sql);
      const t = tableOf(sql);
      const exec = (binds: any[]) => {
        if (isWrite) {
          writes.push(sql);
          if (t === 'staypuft_audit_log') {
            canned.staypuft_audit_log.push({ id: binds[0], operator: binds[1], method: binds[2], path: binds[3], tenant_slug: binds[4], target_type: binds[5], target_id: binds[6], status_code: binds[7], result: binds[8], created_at: binds[9] });
          }
          return { first: async () => null, all: async () => ({ results: [] }), run: async () => ({ meta: {} }) };
        }
        const rows = t ? canned[t as keyof Canned] : [];
        if (/whatsapp_messages/i.test(sql) && /SUM\(estimated_price\)/i.test(sql)) {
          const tenantBind = bindFor(sql, binds, 'tenant_id');
          const filteredMessages = tenantBind !== undefined
            ? rows.filter((m) => String(m.tenant_id) === String(tenantBind))
            : rows.slice();
          return {
            first: async () => ({
              total_leads: filteredMessages.length,
              total_value: filteredMessages.reduce((s, m) => s + Number(m.estimated_price || 0), 0),
              unique_contacts: new Set(filteredMessages.map((m) => m.phone)).size,
            }),
            all: async () => ({ results: [filteredMessages.length ? {
              total_leads: filteredMessages.length,
              total_value: filteredMessages.reduce((s, m) => s + Number(m.estimated_price || 0), 0),
              unique_contacts: new Set(filteredMessages.map((m) => m.phone)).size,
            } : []] }),
            run: async () => ({ meta: {} }),
          };
        }
        let filtered = applyFilters(rows, sql, binds);
        const isCount = /^\s*SELECT\s+COUNT/i.test(sql);
        if (isCount) {
          return { first: async () => ({ n: filtered.length }), all: async () => ({ results: [{ n: filtered.length }] }), run: async () => ({ meta: {} }) };
        }
        if (/LEFT JOIN orders/i.test(sql)) {
          const agg: Record<string, { tenant_id: string; tenant_slug: string; tenant_name: string; orders: number; revenue: number }> = {};
          for (const te of canned.tenants) agg[te.id] = { tenant_id: te.id, tenant_slug: te.slug, tenant_name: te.name, orders: 0, revenue: 0 };
          for (const o of canned.orders) {
            const a = agg[o.tenant_id];
            if (a) { a.orders += 1; a.revenue += Number(o.total || 0); }
          }
          filtered = Object.values(agg);
        }
        if (/diagnostics/i.test(sql) && /LEFT JOIN products/i.test(sql)) {
          const withProducts = new Set(canned.products.map((p) => p.tenant_id));
          filtered = canned.tenants.filter((t) => !withProducts.has(t.id));
        }
        filtered = applyLimitOffset(filtered, sql, binds);
        return {
          first: async () => filtered[0] ?? null,
          all: async () => ({ results: filtered, meta: {} }),
          run: async () => ({ meta: {} }),
        };
      };
      return {
        bind: (...binds: any[]) => exec(binds),
        first: async () => exec([]).first(),
        all: async () => exec([]).all(),
        run: async () => exec([]).run(),
      };
    },
    batch: async () => ({}),
  };
}

function makeEnv(canned: Canned, writes: string[]) {
  return {
    DB: makeDb(canned, writes),
    SESSION: makeKV(),
    CACHE: makeKV(),
    STORAGE: { list: async () => ({ keys: [] }), get: async () => null, put: async () => {} },
    ORDER_QUEUE: { send: async () => {} },
    AI: undefined,
    COMMERCE_STAYPUFT_API_KEY: SP_KEY,
    __TEST_CANNED__: canned,
  } as any;
}

const baseNow = '2026-11-13T12:00:00Z';

function freshCanned(): Canned {
  return {
    tenants: [
      { id: 'ark', name: 'Ark Systems', slug: 'ark', domain: null, whatsapp: '529994918221', clabe: '123456789012345678', bank: 'BBVA', clabe_holder: 'Ark Systems', btcpay_pos_url: 'https://btcpay.arksystems.ai', sats_rate: 2.5, logo_url: '/favicon.svg', theme_color: '#FF6B1A', origin_street: null, origin_number: null, origin_district: null, origin_city: null, origin_state: null, origin_postal_code: null, origin_country: null, envia_api_key: null, created_at: '2026-01-01', updated_at: '2026-01-01', active: 1 },
      { id: 'ten_canaco_01', name: 'CANACO SERVYTUR Mérida', slug: 'canaco', domain: 'canaco.arksystems.site', whatsapp: '+529999428850', clabe: '012180001234567890', bank: 'BBVA', clabe_holder: 'CANACO SERVYTUR Mérida', btcpay_pos_url: null, sats_rate: null, logo_url: null, theme_color: '#FAF8F5', origin_street: null, origin_number: null, origin_district: null, origin_city: null, origin_state: null, origin_postal_code: null, origin_country: null, envia_api_key: 'sk_live_envia_canaco_secret', created_at: '2026-01-02', updated_at: '2026-01-02', active: 1 },
      { id: 'temozonia', name: 'Temozonia Carnes Ahumadas', slug: 'temozonia', domain: null, whatsapp: '529994918221', clabe: '123456789012345678', bank: 'BBVA', clabe_holder: 'Temozonia', btcpay_pos_url: null, sats_rate: 2.5, logo_url: null, theme_color: '#b45309', origin_street: null, origin_number: null, origin_district: null, origin_city: null, origin_state: null, origin_postal_code: null, origin_country: null, envia_api_key: null, created_at: '2026-01-03', updated_at: '2026-01-03', active: 1 },
    ],
    products: [
      { id: 'prod_stand_2x2', tenant_id: 'ten_canaco_01', name: 'Stand Estándar 2x2', weight: 'Unidad', price: 8000, desc: 'Expo Feria del Comercio 2026 — Stand estándar 2x2 metros', image: '/images/canaco/stand-2x2.jpg', badge: null, stock: 99, active: 1, display_order: 1, metadata: null, created_at: baseNow, updated_at: baseNow },
      { id: 'prod_sponsor_oro', tenant_id: 'ten_canaco_01', name: 'Patrocinio Oro — Desayuno Networking', weight: 'Paquete', price: 9500, desc: '10 min de presentación + Banner en desayuno networking', image: '/images/canaco/sponsor-oro.jpg', badge: null, stock: 10, active: 1, display_order: 2, metadata: null, created_at: baseNow, updated_at: baseNow },
      { id: 'prod_tem_carne', tenant_id: 'temozonia', name: 'Carne Ahumada', weight: '1kg', price: 380, desc: 'Brisquet ahumado', image: '/x.jpg', badge: null, stock: 12, active: 1, display_order: 1, metadata: null, created_at: baseNow, updated_at: baseNow },
      { id: 'prod_tem_off', tenant_id: 'temozonia', name: 'Producto Antiguo', weight: '1kg', price: 10, desc: 'inactivo', image: '/x.jpg', badge: null, stock: 0, active: 0, display_order: 9, metadata: null, created_at: baseNow, updated_at: baseNow },
    ],
    orders: [
      { id: 'o-paid', order_number: 'CAN-0001', tenant_id: 'ten_canaco_01', customer_id: 'c-1', customer_name: 'Juan Pérez', customer_address: 'Calle 1', customer_phone: '52999111222', customer_email: 'juan@example.com', payment_method: 'SPEI', total: 8000, status: 'paid', shipping_carrier: 'Estafeta', shipping_service: 'Estándar', shipping_tracking_number: 'TRACK001', shipping_tracking_url: 'https://track/001', shipping_label_url: null, shipping_cost: 0, customer_notes: null, created_at: '2026-11-01T10:00:00Z', updated_at: '2026-11-01T10:00:00Z' },
      { id: 'o-pending', order_number: 'CAN-0002', tenant_id: 'ten_canaco_01', customer_id: null, customer_name: 'María López', customer_address: 'Calle 2', customer_phone: '52999333444', customer_email: 'maria@example.com', payment_method: 'WhatsApp', total: 9500, status: 'pending', shipping_carrier: null, shipping_service: null, shipping_tracking_number: null, shipping_tracking_url: null, shipping_label_url: null, shipping_cost: 0, customer_notes: null, created_at: '2026-11-10T10:00:00Z', updated_at: '2026-11-10T10:00:00Z' },
      { id: 'o-shipped-notrack', order_number: 'CAN-0003', tenant_id: 'ten_canaco_01', customer_id: null, customer_name: 'Rosa Díaz', customer_address: 'Calle 3', customer_phone: '52999555666', customer_email: 'rosa@example.com', payment_method: 'SPEI', total: 8000, status: 'shipped', shipping_carrier: 'FedEx', shipping_service: 'Express', shipping_tracking_number: null, shipping_tracking_url: null, shipping_label_url: null, shipping_cost: 120, customer_notes: null, created_at: '2026-11-12T10:00:00Z', updated_at: '2026-11-12T10:00:00Z' },
      { id: 'o-tem', order_number: 'TEM-0001', tenant_id: 'temozonia', customer_id: null, customer_name: 'Otro', customer_address: 'Av 1', customer_phone: '52111', customer_email: 'o@t.com', payment_method: 'WhatsApp', total: 380, status: 'pending', shipping_carrier: null, shipping_service: null, shipping_tracking_number: null, shipping_tracking_url: null, shipping_label_url: null, shipping_cost: 0, customer_notes: null, created_at: '2026-11-13T10:00:00Z', updated_at: '2026-11-13T10:00:00Z' },
    ],
    order_items: [
      { id: 'oi-1', order_id: 'o-paid', product_id: 'prod_stand_2x2', quantity: 1, price: 8000, name: 'Stand Estándar 2x2', design_id: null, talla: null, color: null, tecnica: null, base_cost: null, print_cost: null, precio_final: 8000 },
    ],
    customers: [
      { id: 'c-1', tenant_id: 'ten_canaco_01', email: 'juan@example.com', password_hash: 'secret_hash_must_not_leak', full_name: 'Juan Pérez', phone: '52999111222', email_verified_at: null, created_at: 1700000000, updated_at: 1700000000 },
      { id: 'c-2', tenant_id: 'ten_canaco_01', email: 'ana@example.com', password_hash: 'secret_hash_2', full_name: 'Ana Gómez', phone: null, email_verified_at: 1700000001, created_at: 1700001000, updated_at: 1700001000 },
    ],
    whatsapp_messages: [
      { id: 'w-1', tenant_id: 'ten_canaco_01', phone: '52999111222', sender_name: 'Juan Pérez', direction: 'inbound', message_text: 'Quiero el stand 2x2', matched_tenant: 'canaco', matched_service: 'Stand Estándar 2x2', estimated_price: 8000, status: 'lead', created_at: '2026-11-10T09:00:00Z' },
      { id: 'w-2', tenant_id: 'ten_canaco_01', phone: '52999111222', sender_name: 'Juan Pérez', direction: 'outbound', message_text: 'Stand confirmado', matched_tenant: 'canaco', matched_service: 'Stand Estándar 2x2', estimated_price: 8000, status: 'sent', created_at: '2026-11-10T09:05:00Z' },
      { id: 'w-3', tenant_id: 'temozonia', phone: '52111', sender_name: 'Otro', direction: 'inbound', message_text: 'Hola', matched_tenant: 'temozonia', matched_service: 'Carne Ahumada', estimated_price: 380, status: 'lead', created_at: '2026-11-11T09:00:00Z' },
    ],
    staypuft_audit_log: [],
  };
}

function makeApp(env: any) {
  const app = new Hono<{ Bindings: any }>();
  (app as any).__env = env;
  app.use('/api/internal/*', async (c, next) => {
    const slug = c.req.query('tenant') || c.req.header('X-Tenant-ID');
    const tenantsBySlug: Record<string, Tenant> = {};
    for (const t of env.__TEST_CANNED__.tenants) tenantsBySlug[t.slug] = t;
    c.set('tenant', slug ? tenantsBySlug[slug] ?? null : tenantsBySlug['ark']);
    c.set('tenantId', c.get('tenant')?.id ?? null);
    await next();
  });
  app.route('/api/internal', internalRoute);
  return app;
}

async function fetchApp(app: any, req: Request) {
  return app.fetch(req, (app as any).__env);
}

function req(url: string, key = SP_KEY, headers: Record<string, string> = {}) {
  return new Request(`http://localhost${url}`, { headers: { 'X-StayPuft-Key': key, ...headers } });
}

async function body(res: Response) { return res.json() as any; }

const INTERNAL_ROUTES = [
  '/api/internal/status',
  '/api/internal/tenants',
  '/api/internal/tenants/canaco',
  '/api/internal/tenants/canaco/products',
  '/api/internal/tenants/canaco/products/prod_stand_2x2',
  '/api/internal/tenants/canaco/orders',
  '/api/internal/tenants/canaco/orders/o-paid',
  '/api/internal/tenants/canaco/customers',
  '/api/internal/tenants/canaco/leads',
  '/api/internal/tenants/canaco/leads/summary',
  '/api/internal/metrics',
  '/api/internal/audit',
  '/api/internal/diagnostics',
];

describe('StayPuft connector — auth (fail-closed)', () => {
  let canned: Canned;
  let writes: string[];

  beforeEach(() => {
    canned = freshCanned();
    writes = [];
  });

  it.each(INTERNAL_ROUTES)('returns 401 without X-StayPuft-Key on %s', async (path) => {
    const env = makeEnv(canned, writes);
    const app = makeApp(env);
    const res = await fetchApp(app, new Request(`http://localhost${path}`, { headers: {} }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it.each(INTERNAL_ROUTES)('returns 401 with wrong key on %s', async (path) => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req(path, 'wrong-key'));
    expect(res.status).toBe(401);
  });

  it('logs failed auth attempts in the audit log', async () => {
    const app = makeApp(makeEnv(canned, writes));
    await fetchApp(app, req('/api/internal/status', 'wrong-key'));
    expect(canned.staypuft_audit_log.some((e) => e.status_code === 401 && e.method === 'GET')).toBe(true);
    expect(canned.staypuft_audit_log.some((e) => e.path === '/api/internal/status')).toBe(true);
    expect(writes.some((w) => /INSERT INTO orders/i.test(w))).toBe(false);
  });

  it('returns 200 with a valid key on every internal route', async () => {
    const app = makeApp(makeEnv(canned, writes));
    for (const path of INTERNAL_ROUTES) {
      const res = await fetchApp(app, req(path, undefined, { 'X-Tenant-ID': path.includes('canaco') ? 'canaco' : undefined }));
      expect(res.status).toBe(200), `route ${path} returned ${res.status}`;
      const json = await res.clone().json();
      expect(json.success).toBe(true);
    }
  });

  it('uses constant-time comparison (wrong key of different length also fails)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/status', 'short'));
    expect(res.status).toBe(401);
  });
});

describe('StayPuft connector — routes and data', () => {
  let canned: Canned;
  let writes: string[];

  beforeEach(() => {
    canned = freshCanned();
    writes = [];
  });

  it('GET /status returns version, services and counts', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/status', undefined, { 'X-Tenant-ID': 'ark' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.service).toBe('ark-commerce');
    expect(json.version).toBe('1.0.0');
    expect(json.counts.tenants).toBe(3);
    expect(json.counts.products).toBe(4);
    expect(json.counts.orders).toBe(4);
    expect(json.services.db.status).toBe('ok');
    expect(json.services.session.status).toBe('ok');
    expect(json.services.cache.status).toBe('ok');
    expect(json.services.storage.status).toBe('ok');
    expect(json.services.queue.status).toBe('ok');
  });

  it('GET /tenants lists tenants paginated (default 20, cap 100)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pagination.page).toBe(1);
    expect(json.pagination.perPage).toBe(20);
    expect(json.pagination.total).toBe(3);
    expect(json.data.length).toBe(3);
    const slugs = json.data.map((t: any) => t.slug);
    expect(slugs).toContain('canaco');
    expect(slugs).toContain('temozonia');
    expect(slugs).toContain('ark');
    for (const t of json.data) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('slug');
      expect(t).toHaveProperty('name');
    }
  });

  it('enforces pagination cap 100', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants?perPage=999'));
    const json = await res.json();
    expect(json.pagination.perPage).toBe(100);
  });

  it('GET /tenants/:slug returns masked tenant detail (no API keys)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.slug).toBe('canaco');
    expect(json.data.name).toBe('CANACO SERVYTUR Mérida');
    expect(json.data.clabe).toBe('****7890');
    expect(json.data.clabe).not.toBe('012180001234567890');
    expect(json.data.envia.configured).toBe(true);
    expect(json.data.envia.api_key).toBe('****cret'); // masked last 4
    expect(json.data.envia.api_key).not.toBe('sk_live_envia_canaco_secret');
    expect(json.data.bank).toBe('BBVA');
  });

  it('GET /tenants/:slug/products returns canaco products with live stock and prices', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/products', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pagination.total).toBe(2);
    const byName = Object.fromEntries(json.data.map((p: any) => [p.name, p]));
    expect(byName['Stand Estándar 2x2'].price).toBe(8000);
    expect(byName['Stand Estándar 2x2'].stock).toBe(99);
    expect(byName['Patrocinio Oro — Desayuno Networking'].price).toBe(9500);
    expect(byName['Patrocinio Oro — Desayuno Networking'].stock).toBe(10);
  });

  it('GET /tenants/:slug/products includes inactive products (internal view)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/temozonia/products', undefined, { 'X-Tenant-ID': 'temozonia' }));
    const json = await res.json();
    expect(json.data.some((p: any) => p.name === 'Producto Antiguo' && p.active === 0)).toBe(true);
  });

  it('GET /tenants/:slug/products/:id returns product detail', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/products/prod_sponsor_oro', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('prod_sponsor_oro');
    expect(json.data.price).toBe(9500);
  });

  it('GET /tenants/:slug/orders lists paginated with status filter', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/orders?status=pending', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pagination.total).toBe(1);
    expect(json.data[0].status).toBe('pending');
    expect(json.data[0].order_number).toBe('CAN-0002');
  });

  it('GET /tenants/:slug/orders returns shipping info without generating a label', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/orders/o-paid', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('o-paid');
    expect(json.data.shipping_carrier).toBe('Estafeta');
    expect(json.data.shipping_tracking_number).toBe('TRACK001');
    expect(Array.isArray(json.data.items)).toBe(true);
    expect(json.data.items[0].product_id).toBe('prod_stand_2x2');
  });

  it('GET /tenants/:slug/customers excludes password hashes and payment data', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/customers', undefined, { 'X-Tenant-ID': 'canaco' }));
    const json = await res.json();
    for (const c of json.data) {
      expect(c).not.toHaveProperty('password_hash');
      expect(c).toHaveProperty('full_name');
      expect(c).toHaveProperty('email');
    }
  });

  it('GET /tenants/:slug/leads lists WhatsApp leads paginated per tenant', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/leads', undefined, { 'X-Tenant-ID': 'canaco' }));
    const json = await res.json();
    expect(json.pagination.total).toBe(2);
    expect(json.data.every((m: any) => m.matched_tenant === 'canaco' || m.tenant_id === 'ten_canaco_01')).toBe(true);
    expect(json.data.find((m: any) => m.id === 'w-3')).toBeUndefined(); // temozonia lead must not appear
  });

  it('GET /tenants/:slug/leads/summary returns per-tenant metrics', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/leads/summary', undefined, { 'X-Tenant-ID': 'canaco' }));
    const json = await res.json();
    expect(json.data.totals.leads).toBe(2);
    expect(json.data.totals.value).toBe(16000);
    expect(json.data.totals.unique_contacts).toBe(1);
  });

  it('GET /metrics aggregates orders and revenue by tenant without PII', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/metrics'));
    const json = await res.json();
    const byTenant = Object.fromEntries(json.data.map((m: any) => [m.tenant_slug, m]));
    expect(byTenant.canaco.orders).toBe(3);
    expect(byTenant.canaco.revenue).toBe(25500);
    expect(byTenant.temozonia.orders).toBe(1);
    for (const m of json.data) {
      expect(m).not.toHaveProperty('customer_name');
      expect(m).not.toHaveProperty('customer_email');
      expect(m).not.toHaveProperty('phone');
    }
  });

  it('GET /audit returns paginated operator audit log', async () => {
    const app = makeApp(makeEnv(canned, writes));
    await fetchApp(app, req('/api/internal/status', undefined, { 'X-Tenant-ID': 'ark' }));
    await fetchApp(app, req('/api/internal/tenants/canaco/products', undefined, { 'X-Tenant-ID': 'canaco' }));
    const res = await fetchApp(app, req('/api/internal/audit'));
    const json = await res.json();
    expect(json.pagination.total).toBeGreaterThanOrEqual(2);
    const entry = json.data.find((e) => e.path === '/api/internal/tenants/canaco/products');
    expect(entry).toBeTruthy();
    expect(entry.operator).toBe('staypuft');
    expect(entry.path).toBe('/api/internal/tenants/canaco/products');
    expect(entry.tenant_slug).toBe('canaco');
    expect(entry.result).toBe('ok');
    expect(entry.status_code).toBe(200);
    expect(entry.method).toBe('GET');
  });

  it('GET /diagnostics returns all check categories', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/diagnostics'));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.broken_products)).toBe(true);
    expect(Array.isArray(json.data.stale_prices)).toBe(true);
    expect(Array.isArray(json.data.stuck_orders_pending_7d)).toBe(true);
    expect(Array.isArray(json.data.shipped_without_tracking)).toBe(true);
    expect(Array.isArray(json.data.tenants_without_products)).toBe(true);
    expect(json.data.shipped_without_tracking.some((o: any) => o.id === 'o-shipped-notrack')).toBe(true);
  });

  it('cross-tenant read: StayPuft can access any tenant, but a response never mixes tenants', async () => {
    const app = makeApp(makeEnv(canned, writes));
    // StayPuft has total access: requesting temozonia returns temozonia (200), not 404.
    const res = await fetchApp(app, req('/api/internal/tenants/temozonia/products', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('Carne Ahumada'); // temozonia's own product is present
    expect(text).not.toContain('Stand Estándar 2x2'); // but no canaco data mixed in

    // An order belonging to another tenant is not found within canaco's scope (404, no leak).
    const res2 = await fetchApp(app, req('/api/internal/tenants/canaco/orders/o-tem', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res2.status).toBe(404);

    // Unknown tenant -> 404, no data leaked.
    const res4 = await fetchApp(app, req('/api/internal/tenants/unknown/products', undefined, { 'X-Tenant-ID': 'canaco' }));
    expect(res4.status).toBe(404);
    const text4 = await res4.text();
    expect(text4).not.toContain('Carne Ahumada');
    expect(text4).not.toContain('Stand Estándar 2x2');
  });

  it('no StayPuft call creates orders, changes status, generates labels or changes prices', async () => {
    const app = makeApp(makeEnv(canned, writes));
    await fetchApp(app, req('/api/internal/status'));
    await fetchApp(app, req('/api/internal/tenants/canaco/products'));
    await fetchApp(app, req('/api/internal/tenants/canaco/orders?status=pending'));
    await fetchApp(app, req('/api/internal/tenants/canaco/leads/summary'));
    await fetchApp(app, req('/api/internal/audit'));
    const forbidden = writes.filter((w) =>
      /INSERT INTO orders/i.test(w) ||
      /UPDATE orders.*status/i.test(w) ||
      /UPDATE products.*price/i.test(w) ||
      /INSERT INTO order_items/i.test(w) ||
      /DELETE /i.test(w)
    );
    expect(forbidden).toEqual([]);
    // Only audit log inserts may have been written
    const nonAudit = writes.filter((w) => !/staypuft_audit_log/i.test(w));
    expect(nonAudit).toEqual([]);
  });

  it('audit log records every StayPuft call with tenant, method, path, result', async () => {
    const app = makeApp(makeEnv(canned, writes));
    await fetchApp(app, req('/api/internal/tenants/canaco/orders/o-paid', undefined, { 'X-Tenant-ID': 'canaco' }));
    const orderWrite = canned.staypuft_audit_log.find((e) => e.path === '/api/internal/tenants/canaco/orders/o-paid');
    expect(orderWrite).toBeTruthy();
    expect(orderWrite.method).toBe('GET');
    expect(orderWrite.tenant_slug).toBe('canaco');
    expect(orderWrite.status_code).toBe(200);
    expect(orderWrite.result).toBe('ok');
  });
});

describe('StayPuft connector — pagination defaults and caps on lists', () => {
  let canned: Canned;
  let writes: string[];

  beforeEach(() => {
    canned = freshCanned();
    writes = [];
  });

  const listRoutes = [
    ['/api/internal/tenants', {}],
    ['/api/internal/tenants/canaco/products', { 'X-Tenant-ID': 'canaco' }],
    ['/api/internal/tenants/canaco/orders', { 'X-Tenant-ID': 'canaco' }],
    ['/api/internal/tenants/canaco/customers', { 'X-Tenant-ID': 'canaco' }],
    ['/api/internal/tenants/canaco/leads', { 'X-Tenant-ID': 'canaco' }],
    ['/api/internal/audit', {}],
  ];

  it.each(listRoutes)('default perPage=20 on %s', async (path, headers) => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req(path, undefined, headers));
    const json = await res.json();
    expect(json.pagination.perPage).toBe(20);
    expect(json.pagination.page).toBe(1);
    expect(typeof json.pagination.total).toBe('number');
    expect(typeof json.pagination.total_pages).toBe('number');
  });

  it.each(listRoutes)('cap perPage at 100 on %s', async (path, headers) => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req(path + '?perPage=250', undefined, headers));
    const json = await res.json();
    expect(json.pagination.perPage).toBe(100);
  });
});

// =========================================================================
// Regression: tenant-scoped routes resolved by :slug path param ONLY
// (no X-Tenant-ID / ?tenant= header). Reproduces the live production 404
// where Marina calls tiendas.arksystems.site/api/internal/tenants/canaco
// without any tenant header and the context tenant defaults to 'ark'.
// =========================================================================
describe('StayPuft connector — tenant-scoped regression (path-param only)', () => {
  let canned: Canned;
  let writes: string[];

  beforeEach(() => {
    canned = freshCanned();
    writes = [];
  });

  // No X-Tenant-ID header: the context tenant defaults to 'ark', so the OLD
  // tenantScopeMatch(c, 'canaco') failed. The fix resolves the tenant from the
  // :slug path param (slug OR id), independent of the context tenant.
  const bySlugCases = [
    ['/api/internal/tenants/canaco', { id: 'ten_canaco_01', name: 'CANACO SERVYTUR Mérida', slug: 'canaco', whatsapp: '+529999428850' }],
    ['/api/internal/tenants/temozonia', { id: 'temozonia', name: 'Temozonia Carnes Ahumadas', slug: 'temozonia' }],
    ['/api/internal/tenants/ark', { id: 'ark', name: 'Ark Systems', slug: 'ark' }],
  ];

  it.each(bySlugCases)('GET %s by slug -> 200 with correct tenant', async (path, expected) => {
    const app = makeApp(makeEnv(canned, writes));
    // Intentionally NO X-Tenant-ID header (context tenant defaults to 'ark').
    const res = await fetchApp(app, req(path));
    expect(res.status).toBe(200), `route ${path} returned ${res.status}`;
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(expected.id);
    expect(json.data.name).toBe(expected.name);
    expect(json.data.slug).toBe(expected.slug);
    if (expected.whatsapp) expect(json.data.whatsapp).toBe(expected.whatsapp);
    // secrets masked, never returned in full
    expect(json.data.clabe).not.toMatch(/^\d{18}$/);
    expect(json.data.envia.api_key).not.toBe('sk_live_envia_canaco_secret');
  });

  it('GET /api/internal/tenants/ten_canaco_01 by id -> 200 (canaco id != slug)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/ten_canaco_01'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('ten_canaco_01');
    expect(json.data.slug).toBe('canaco');
    expect(json.data.name).toBe('CANACO SERVYTUR Mérida');
  });

  it('GET /api/internal/tenants/canaco/products by slug -> 200, Stand $8,000 / Patrocinio $9,500 live', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/products'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pagination.total).toBe(2);
    const byName = Object.fromEntries(json.data.map((p: any) => [p.name, p]));
    expect(byName['Stand Estándar 2x2'].price).toBe(8000);
    expect(byName['Stand Estándar 2x2'].stock).toBe(99);
    expect(byName['Patrocinio Oro — Desayuno Networking'].price).toBe(9500);
    expect(byName['Patrocinio Oro — Desayuno Networking'].stock).toBe(10);
  });

  it('GET /api/internal/tenants/temozonia/products by slug -> 200 (no 500)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/temozonia/products'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.some((p: any) => p.name === 'Carne Ahumada')).toBe(true);
  });

  it('GET /api/internal/tenants/ark/products by slug -> 200 (no 500)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/ark/products'));
    expect(res.status).toBe(200);
  });

  it('GET /api/internal/tenants/canaco/orders by slug -> 200', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/orders'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.every((o: any) => o.tenant_id === 'ten_canaco_01')).toBe(true);
  });

  it('GET /api/internal/tenants/canaco/customers by slug -> 200', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/customers'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    for (const cust of json.data) {
      expect(cust).not.toHaveProperty('password_hash');
    }
  });

  it('GET /api/internal/tenants/canaco/leads by slug -> 200', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/leads'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.every((m: any) => String(m.tenant_id) === 'ten_canaco_01')).toBe(true);
  });

  it('GET /api/internal/tenants/canaco/leads/summary by slug -> 200', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/leads/summary'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.totals.leads).toBe(2);
    expect(json.data.totals.value).toBe(16000);
  });

  it('GET /api/internal/tenants/unknown -> 404, no data leaked', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/unknown'));
    expect(res.status).toBe(404);
    const text = await res.text();
    expect(text).not.toContain('CANACO');
    expect(text).not.toContain('Carne Ahumada');
  });

  it('cross-tenant isolation: a canaco-scoped response contains only canaco data (never temozonia/baakal/marea)', async () => {
    const app = makeApp(makeEnv(canned, writes));
    const res = await fetchApp(app, req('/api/internal/tenants/canaco/products'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.every((p: any) => String(p.tenant_id) === 'ten_canaco_01')).toBe(true);
    expect(json.data.find((p: any) => p.name === 'Carne Ahumada')).toBeUndefined();
    const res2 = await fetchApp(app, req('/api/internal/tenants/temozonia/products'));
    const json2 = await res2.json();
    expect(res2.status).toBe(200);
    expect(json2.data.find((p: any) => p.name === 'Stand Estándar 2x2')).toBeUndefined();
  });

  it('audit log records tenant_slug from path (canaco), not default ark', async () => {
    const app = makeApp(makeEnv(canned, writes));
    await fetchApp(app, req('/api/internal/tenants/canaco/products'));
    const entry = canned.staypuft_audit_log.find((e) => e.path === '/api/internal/tenants/canaco/products');
    expect(entry).toBeTruthy();
    expect(entry.tenant_slug).toBe('canaco');
    expect(entry.tenant_slug).not.toBe('ark');
    expect(entry.method).toBe('GET');
    expect(entry.status_code).toBe(200);
    expect(entry.result).toBe('ok');
  });
});

