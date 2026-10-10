import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';
import { apiRoutes } from './routes';

type Bindings = {
  DB: D1Database;
  SESSION: KVNamespace;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  ORDER_QUEUE: Queue;
  ASSETS: Fetcher; // ✅ Binding automático de Cloudflare para assets
  BTCPAY_POS_URL: string;
  CLABE: string;
  BANK: string;
  CLABE_HOLDER: string;
  WHATSAPP_NUMBER: string;
  SATS_RATE: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Cloudflare sirve los archivos estáticos; el Worker atiende estas rutas dinámicas.
app.route('/health', healthRoute);
app.route('/api', apiRoutes);

app.notFound((c) => {
  if (c.req.path === '/api' || c.req.path.startsWith('/api/')) {
    return c.json({ error: 'API Endpoint Not Found' }, 404);
  }

  return c.text('Not Found', 404);
});

// Manejador de errores global
app.onError((err, c) => {
  console.error('Worker Error:', err);
  return c.json({ error: 'Internal Server Error', details: err.message }, 500);
});

export default app;