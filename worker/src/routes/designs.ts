import { Hono } from 'hono';
import type { Env } from '../types/env';

const designs = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();

designs.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  if (!tenantId) return c.json({ success: false, error: 'Tenant not found' }, 404);
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, tenant_id, slug, name, image_url, technique_recommended, active, display_order
       FROM designs
       WHERE tenant_id = ? AND active = 1
       ORDER BY display_order, name`
    ).bind(tenantId).all();
    return c.json({ success: true, data: results, count: results.length });
  } catch (error) {
    console.error('Error fetching designs:', error);
    return c.json({ success: false, error: 'Failed to fetch designs' }, 500);
  }
});

export default designs;
