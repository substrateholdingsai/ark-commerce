import { Hono } from 'hono';
import type { Env } from '../types/env';

const admin = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null; user: any } }>();

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Public: login
admin.post('/login', async (c) => {
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const { email, password, tenant: requestedTenant } = body || {};
  if (!email || !password) return c.json({ success: false, error: 'Missing credentials' }, 400);

  let user: any = null;
  if (requestedTenant) {
    user = await c.env.DB.prepare(
      `SELECT id, tenant_id, email, password_hash, role FROM tenant_users WHERE (tenant_id = ? OR tenant_id IN (SELECT id FROM tenants WHERE slug = ?)) AND email = ?`
    ).bind(requestedTenant, requestedTenant, email).first<any>();
  } else {
    // Si no se especifica tenant, busca por email directamente (soporta login multi-tenant centralizado)
    user = await c.env.DB.prepare(
      `SELECT id, tenant_id, email, password_hash, role FROM tenant_users WHERE email = ?`
    ).bind(email).first<any>();
  }
  if (!user) return c.json({ success: false, error: 'Invalid credentials' }, 401);

  const hash = await hashPassword(password);
  if (hash !== user.password_hash) return c.json({ success: false, error: 'Invalid credentials' }, 401);

  const token = crypto.randomUUID();
  await c.env.SESSION.put(
    'session:' + token,
    JSON.stringify({ tenantId: user.tenant_id, userId: user.id, email: user.email, role: user.role }),
    { expirationTtl: 86400 }
  );

  return c.json({
    success: true,
    data: {
      token,
      tenantId: user.tenant_id,
      user: { id: user.id, email: user.email, role: user.role }
    }
  });
});

// Auth middleware for all other admin routes
admin.use('/*', async (c, next) => {
  if (c.req.path.endsWith('/login') || c.req.path.includes('/leads') || c.req.path.includes('/files/')) return next();
  const auth = c.req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const raw = await c.env.SESSION.get('session:' + token);
  if (!raw) return c.json({ success: false, error: 'Unauthorized' }, 401);
  const session = JSON.parse(raw);
  // Asignamos el tenantId autenticado de la sesión
  c.set('tenantId', session.tenantId);
  c.set('user', session);
  await next();
});

// Store config
admin.get('/store', async (c) => {
  const tenantId = c.get('tenantId');
  const tenant = await c.env.DB.prepare('SELECT * FROM tenants WHERE id = ?').bind(tenantId).first<any>();
  return c.json({ success: true, data: tenant });
});

admin.put('/store', async (c) => {
  const tenantId = c.get('tenantId');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const fields = ['name','whatsapp','clabe','bank','clabe_holder','btcpay_pos_url','sats_rate','logo_url','theme_color','domain'];
  const sets: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(body[f]); }
  }
  if (sets.length === 0) return c.json({ success: false, error: 'No fields' }, 400);
  sets.push('updated_at = CURRENT_TIMESTAMP');
  vals.push(tenantId);
  await c.env.DB.prepare(`UPDATE tenants SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  // invalidate cache
  const tenant = await c.env.DB.prepare('SELECT * FROM tenants WHERE id = ?').bind(tenantId).first<any>();
  if (tenant?.slug) await c.env.CACHE.delete('tenant:' + tenant.slug);
  if (tenant?.domain) await c.env.CACHE.delete('tenant:domain:' + tenant.domain);
  return c.json({ success: true, data: tenant });
});

// Products CRUD
admin.get('/products', async (c) => {
  const tenantId = c.get('tenantId');
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM products WHERE tenant_id = ? ORDER BY display_order, name`
  ).bind(tenantId).all();
  return c.json({ success: true, data: results });
});

admin.post('/products', async (c) => {
  const tenantId = c.get('tenantId');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const id = body.id || crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, tenantId, body.name, body.weight, body.price, body.desc, body.image,
    body.badge ?? null, body.stock ?? 0, body.active ?? 1, body.display_order ?? 0
  ).run();
  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first();
  return c.json({ success: true, data: product }, 201);
});

admin.put('/products/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  const fields = ['name','weight','price','desc','image','badge','stock','active','display_order'];
  const sets: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (body[f] !== undefined) { sets.push(`${f} = ?`); vals.push(body[f]); }
  }
  if (sets.length === 0) return c.json({ success: false, error: 'No fields' }, 400);
  sets.push('updated_at = CURRENT_TIMESTAMP');
  vals.push(id, tenantId);
  await c.env.DB.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first();
  return c.json({ success: true, data: product });
});

// Upload to R2
admin.post('/upload', async (c) => {
  const tenantId = c.get('tenantId');
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return c.json({ success: false, error: 'No file' }, 400);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const key = `tenants/${tenantId}/${filename}`;
  await c.env.STORAGE.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const url = `/api/admin/files/${key}`;
  return c.json({ success: true, data: { key, url, filename } });
});

// Serve uploaded file (public-ish)
admin.get('/files/*', async (c) => {
  const key = c.req.path.replace('/api/admin/files/', '');
  const obj = await c.env.STORAGE.get(key);
  if (!obj) return c.json({ success: false, error: 'Not found' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  return new Response(obj.body, { headers });
});

// Orders
admin.get('/orders', async (c) => {
  const tenantId = c.get('tenantId');
  const status = c.req.query('status');
  let sql = `SELECT * FROM orders WHERE tenant_id = ?`;
  const binds: any[] = [tenantId];
  if (status) { sql += ` AND status = ?`; binds.push(status); }
  sql += ` ORDER BY created_at DESC`;
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ success: true, data: results });
});

admin.put('/orders/:id/status', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ success: false, error: 'Invalid JSON' }, 400); }
  await c.env.DB.prepare(`UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND tenant_id = ?`).bind(body.status, id, tenantId).run();
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ? AND tenant_id = ?').bind(id, tenantId).first();
  return c.json({ success: true, data: order });
});

// =========================================================================
// AI LEADS & CONVERSION METRICS (Option C)
// =========================================================================
admin.get('/leads/summary', async (c) => {
  try {
    // 1. Métricas globales
    const totalRow = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_leads,
        COALESCE(SUM(estimated_price), 0) as total_value,
        COUNT(DISTINCT phone) as unique_contacts
      FROM whatsapp_messages
    `).first<any>();

    // 2. Desglose por proveedor
    const { results: byTenant } = await c.env.DB.prepare(`
      SELECT 
        COALESCE(matched_tenant, 'Sin asignar') as tenant,
        COUNT(*) as count,
        COALESCE(SUM(estimated_price), 0) as total_value
      FROM whatsapp_messages
      GROUP BY matched_tenant
      ORDER BY count DESC
    `).all();

    // 3. Desglose por canal
    const { results: byChannel } = await c.env.DB.prepare(`
      SELECT 
        direction as channel,
        COUNT(*) as count
      FROM whatsapp_messages
      GROUP BY direction
      ORDER BY count DESC
    `).all();

    // 4. Últimos 50 leads
    const { results: recentLeads } = await c.env.DB.prepare(`
      SELECT id, phone, sender_name, direction, message_text, matched_tenant, matched_service, estimated_price, status, created_at
      FROM whatsapp_messages
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    return c.json({
      success: true,
      data: {
        totals: {
          leads: totalRow?.total_leads || 0,
          value: totalRow?.total_value || 0,
          unique_contacts: totalRow?.unique_contacts || 0
        },
        by_tenant: byTenant || [],
        by_channel: byChannel || [],
        recent_leads: recentLeads || []
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

admin.get('/leads', async (c) => {
  try {
    const tenant = c.req.query('tenant');
    const channel = c.req.query('channel');

    let sql = `SELECT * FROM whatsapp_messages WHERE 1=1`;
    const binds: any[] = [];

    if (tenant) {
      sql += ` AND (matched_tenant LIKE ? OR tenant_id = ?)`;
      binds.push(`%${tenant}%`, tenant);
    }
    if (channel) {
      sql += ` AND direction = ?`;
      binds.push(channel);
    }

    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
    return c.json({ success: true, count: results?.length || 0, data: results });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default admin;
