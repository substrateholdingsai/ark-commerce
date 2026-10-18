import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';
import { apiRoutes } from './routes';
import type { Env, Tenant } from './src/types/env';

type Variables = { tenant: Tenant | null; tenantId: string | null };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', logger());
app.use('*', cors());

app.use('/api/*', async (c, next) => {
  const tenant = await resolveTenant(c.env, c.req);
  c.set('tenant', tenant);
  c.set('tenantId', tenant?.id ?? null);
  await next();
});

app.route('/health', healthRoute);
app.route('/api', apiRoutes);

app.notFound((c) => {
  if (c.req.path === '/api' || c.req.path.startsWith('/api/')) {
    return c.json({ error: 'API Endpoint Not Found' }, 404);
  }
  return c.text('Not Found', 404);
});

app.onError((err, c) => {
  console.error('Worker Error:', err);
  return c.json({ error: 'Internal Server Error', details: err.message }, 500);
});

async function resolveTenant(env: Env, req: any): Promise<Tenant | null> {
  let slug: string | null = null;
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('tenant');
    if (q) slug = q;
  } catch {}
  if (!slug) {
    const h = req.header('X-Tenant-ID');
    if (h) slug = h;
  }
  if (!slug) {
    try {
      const url = new URL(req.url);
      const host = url.hostname;
      const parts = host.split('.');
      const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host);
      if (!isIp && host !== 'localhost' && parts.length >= 3 && parts[0] !== 'www') {
        slug = parts[0];
      } else {
        slug = '__domain__:' + host;
      }
    } catch {}
  }

  if (!slug) slug = 'ark';

  const cache = env.CACHE;

  if (slug.startsWith('__domain__:')) {
    const host = slug.replace('__domain__:', '');
    const cacheKey = 'tenant:domain:' + host;
    if (cache) {
      const cached = await cache.get(cacheKey, 'json');
      if (cached) return cached as Tenant;
    }
    const row = await env.DB.prepare('SELECT * FROM tenants WHERE domain = ?').bind(host).first<Tenant>();
    if (row) {
      if (cache) await cache.put(cacheKey, JSON.stringify(row), { expirationTtl: 3600 });
      return row;
    }
    slug = 'ark';
  }

  const cacheKey = 'tenant:' + slug;
  if (cache) {
    const cached = await cache.get(cacheKey, 'json');
    if (cached) return cached as Tenant;
  }
  const row = await env.DB.prepare('SELECT * FROM tenants WHERE slug = ? OR id = ?').bind(slug, slug).first<Tenant>();
  if (row) {
    if (cache) await cache.put(cacheKey, JSON.stringify(row), { expirationTtl: 3600 });
    return row;
  }

  // Fallback final a Ark Systems
  if (slug !== 'ark') {
    const arkRow = await env.DB.prepare("SELECT * FROM tenants WHERE slug = 'ark' OR id = 'ark'").first<Tenant>();
    if (arkRow) return arkRow;
  }
  return null;
}

export default app;
