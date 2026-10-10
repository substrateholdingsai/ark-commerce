import { Hono } from 'hono';

export const healthRoute = new Hono().get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'temozonia',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
