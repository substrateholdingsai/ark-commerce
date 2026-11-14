import type { Env } from '../types/env';
import { timingSafeEqualStr } from './security';

export const STAYPUFT_OPERATOR = 'staypuft';

/**
 * Resultado de la autenticación del operador StayPuft.
 */
export type StayPuftAuth = {
  ok: boolean;
  reason?: 'missing_key' | 'invalid_key' | 'not_configured';
};

/**
 * Verifica la cabecera X-StayPuft-Key contra el secreto del worker
 * COMMERCE_STAYPUFT_API_KEY usando comparación en tiempo constante.
 * Fail-closed: sin clave configurada o clave inválida => no autorizado.
 */
export async function verifyStayPuftKey(
  env: Env,
  key: string | null | undefined
): Promise<StayPuftAuth> {
  const expected = env.COMMERCE_STAYPUFT_API_KEY;
  if (!expected) {
    return { ok: false, reason: 'not_configured' };
  }
  if (!key || typeof key !== 'string') {
    return { ok: false, reason: 'missing_key' };
  }
  return { ok: timingSafeEqualStr(key, expected) };
}

/**
 * Obtiene la clave de la cabecera X-StayPuft-Key.
 */
export function getStayPuftKey(headers: Headers): string | null {
  const auth = headers.get('X-StayPuft-Key');
  if (!auth) return null;
  return auth.trim();
}

/**
 * Escribe una entrada inmutable en el log de auditoría de StayPuft.
 * Nunca contiene PII, contraseñas, CLABE completas ni datos de pago.
 */
export async function logStayPuftAction(
  env: Env,
  params: {
    method: string;
    path: string;
    tenantSlug?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    statusCode: number;
    result: 'ok' | 'error';
  }
): Promise<void> {
  const id = `sp_${crypto.randomUUID().replace(/-/g, '')}`;
  await env.DB.prepare(
    `INSERT INTO staypuft_audit_log
      (id, operator, method, path, tenant_slug, target_type, target_id, status_code, result, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'))`
  )
    .bind(
      id,
      STAYPUFT_OPERATOR,
      params.method,
      params.path,
      params.tenantSlug ?? null,
      params.targetType ?? null,
      params.targetId ?? null,
      params.statusCode,
      params.result
    )
    .run();
}

/**
 * Máscara un valor secreto para respuestas y logs: muestra solo los 4
 * últimos caracteres, el resto como asteriscos. Si es corto, oculta todo.
 */
export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return '****';
  return '****' + value.slice(-4);
}
