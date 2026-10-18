import { Hono } from 'hono';
import type { Env } from '../types/env';

const store = new Hono<{ Bindings: Env; Variables: { tenant: any; tenantId: string | null } }>();

store.get('/config', async (c) => {
  const tenant = c.get('tenant');
  if (!tenant) return c.json({ success: false, error: 'Tenant not found' }, 404);
  return c.json({
    success: true,
    data: {
      name: tenant.name,
      slug: tenant.slug,
      whatsapp: tenant.whatsapp,
      clabe: tenant.clabe,
      bank: tenant.bank,
      clabe_holder: tenant.clabe_holder,
      btcpay_pos_url: tenant.btcpay_pos_url,
      sats_rate: tenant.sats_rate,
      logo_url: tenant.logo_url,
      theme_color: tenant.theme_color,
    },
  });
});

export default store;
