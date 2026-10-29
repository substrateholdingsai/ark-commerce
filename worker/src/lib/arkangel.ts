import type { Env } from '../types/env';

export interface TransactionalDispatchPayload {
  tenant_id: string;
  channel?: 'whatsapp' | 'sms' | 'email';
  to: string;
  proposito?: 'transaccional';
  tipo: 'order_confirmation' | 'shipping_update' | 'cart_recovery' | 'custom';
  order_id?: string;
  body?: string;
  variables?: Record<string, string>;
  metadata?: Record<string, unknown>;
  dry_run?: boolean;
}

export async function notificarArkangel(
  env: Env,
  payload: TransactionalDispatchPayload
): Promise<{ ok: boolean; message_id?: string; error?: string }> {
  try {
    const body = {
      version: 'TRANSACTIONAL_DISPATCH_V1',
      channel: payload.channel ?? 'whatsapp',
      proposito: payload.proposito ?? 'transaccional',
      ...payload,
    };
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.ARKANGEL_ADMIN_TOKEN || 'secret_admin_token'}`,
      'X-Tenant-Id': payload.tenant_id,
    };
    let res: Response;
    if ((env as any).ARKANGEL?.fetch) {
      res = await (env as any).ARKANGEL.fetch('http://arkangel/api/v1/comunicacion/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } else {
      const url = `${env.ARKANGEL_URL || 'https://arkangel.arksystems.site'}/api/v1/comunicacion/send`;
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    }
    if (!res.ok) {
      const err = await res.text();
      console.error('[Arkangel Error]:', res.status, err);
      return { ok: false, error: err };
    }
    const data = (await res.json()) as any;
    return { ok: data.ok, message_id: data.message_id };
  } catch (err: any) {
    console.error('[Arkangel Notification Failed]:', err.message);
    return { ok: false, error: err.message };
  }
}
