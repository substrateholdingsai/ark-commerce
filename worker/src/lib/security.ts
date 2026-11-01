import type { Context } from 'hono';
import type { Env } from '../types/env';

/**
 * Países permitidos para interactuar con la IA, Checkout y Cotizador:
 * México (MX), EE.UU. (US), Canadá (CA), España (ES), El Salvador (SV) y toda Latinoamérica + Caribe.
 * También incluye códigos especiales de Cloudflare para tráfico local/desarrollo (XX, T1).
 */
export const ALLOWED_COUNTRIES = new Set([
  'MX', 'US', 'CA', 'ES', 'SV',
  // Centroamérica
  'GT', 'BZ', 'HN', 'NI', 'CR', 'PA',
  // Sudamérica
  'CO', 'VE', 'EC', 'PE', 'BO', 'CL', 'AR', 'UY', 'PY', 'BR',
  // Caribe
  'DO', 'PR', 'CU', 'JM', 'BS', 'TT',
  // Desarrollo / Localhost / Cloudflare Tor-Test
  'XX', 'T1', ''
]);

// Ventana en memoria por isolate para frenar ráfagas en 0ms sin esperar a KV
const memoryRateMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  scope: string;
  limit: number;
  windowSeconds?: number;
}

export function getClientIp(c: Context): string {
  return (
    c.req.header('CF-Connecting-IP') ||
    c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export function getClientCountry(c: Context): string {
  const headerCountry = c.req.header('CF-IPCountry')?.trim().toUpperCase();
  if (headerCountry) return headerCountry;
  const cfCountry = (c.req.raw as any)?.cf?.country;
  if (typeof cfCountry === 'string') return cfCountry.trim().toUpperCase();
  return '';
}

/**
 * Verifica si la petición proviene de un país permitido (MX, US, CA, ES, SV y LATAM).
 */
export function checkGeoAllowed(c: Context): { allowed: boolean; country: string } {
  const country = getClientCountry(c);
  if (!country || ALLOWED_COUNTRIES.has(country)) {
    return { allowed: true, country: country || 'LOCAL' };
  }
  return { allowed: false, country };
}

/**
 * Rate Limiter híbrido (Memoria de Isolate + Cloudflare KV) por IP y Scope.
 */
export async function checkRateLimit(
  c: Context<{ Bindings: Env }>,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const ip = getClientIp(c);
  const windowSec = options.windowSeconds || 60;
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / windowSec);
  const key = `rl:${options.scope}:${ip}:${bucket}`;
  const retryAfterSeconds = Math.max(1, (bucket + 1) * windowSec - nowSec);

  // 1. Chequeo rápido en memoria del isolate
  const memEntry = memoryRateMap.get(key);
  if (memEntry && memEntry.resetAt > nowSec) {
    memEntry.count += 1;
    if (memEntry.count > options.limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }
  } else {
    // Limpieza ligera si el mapa crece mucho
    if (memoryRateMap.size > 2000) {
      memoryRateMap.clear();
    }
    memoryRateMap.set(key, { count: 1, resetAt: (bucket + 1) * windowSec });
  }

  // 2. Chequeo distribuido en Cloudflare KV (CACHE)
  const kv = c.env?.CACHE;
  if (kv) {
    try {
      const currentRaw = await kv.get(key);
      const currentCount = currentRaw ? parseInt(currentRaw, 10) || 0 : 0;
      const nextCount = currentCount + 1;

      if (nextCount > options.limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds };
      }

      // Guardar incremento con TTL mínimo de 60s (requerido por Cloudflare KV)
      const ttl = Math.max(60, windowSec + 10);
      const putPromise = kv.put(key, String(nextCount), { expirationTtl: ttl });
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(putPromise);
      } else {
        await putPromise;
      }

      return {
        allowed: true,
        remaining: Math.max(0, options.limit - nextCount),
        retryAfterSeconds
      };
    } catch {
      // Si KV falla temporalmente, confiamos en el rate limit de memoria
    }
  }

  const currentMem = memoryRateMap.get(key)?.count || 1;
  return {
    allowed: currentMem <= options.limit,
    remaining: Math.max(0, options.limit - currentMem),
    retryAfterSeconds
  };
}

/**
 * Patrones heurísticos de Prompt Injection, Jailbreak y manipulación de precios/sistema.
 */
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+|previous\s+|prior\s+|above\s+|system\s+)*(instructions|prompts|rules|guidelines)/i,
  /ignora\s+(todas\s+|las\s+|mis\s+|tus\s+)*(instrucciones|reglas|ordenes|órdenes|directivas)/i,
  /olvida\s+(todo|tus\s+instrucciones|tu\s+rol|las\s+reglas)/i,
  /(system\s*prompt|prompt\s+del\s+sistema|instrucciones\s+internas|revela\s+tu\s+prompt|show\s+your\s+instructions)/i,
  /(you\s+are\s+now|act\s+as\s+a|actúa\s+como|ahora\s+eres|modo\s+desarrollador|developer\s+mode|\bdan\s+mode\b|jailbreak)/i,
  /(cambia\s+el\s+precio|modifica\s+el\s+precio|pon\s+el\s+precio\s+en|precio\s+a\s+\$?0|price\s+to\s+\$?0|descuento\s+del\s+100%)/i,
  /(<\s*script\b|javascript:|onerror\s*=|onload\s*=|<\s*iframe\b)/i,
  /(\bdrop\s+table\b|\bunion\s+select\b|\binsert\s+into\b|\bdelete\s+from\b)/i
];

export interface SanitizedAiInput {
  valid: boolean;
  sanitizedText: string;
  sanitizedHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  reason?: string;
  safeReply?: string;
}

/**
 * Sanitiza y valida el texto e historial antes de enviarlo a Cloudflare Workers AI.
 */
export function sanitizeAndValidateAiInput(
  rawText: unknown,
  rawHistory?: unknown,
  maxLength = 350
): SanitizedAiInput {
  if (typeof rawText !== 'string') {
    return {
      valid: false,
      sanitizedText: '',
      sanitizedHistory: [],
      reason: 'invalid_type',
      safeReply: 'Por favor escribe tu consulta en texto para poder ayudarte.'
    };
  }

  // Eliminar caracteres de control invisibles y etiquetas delimitadoras
  let cleaned = rawText
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<\/?(user_query|system|assistant|prompt|script|iframe)[^>]*>/gi, '')
    .trim();

  if (!cleaned) {
    return {
      valid: false,
      sanitizedText: '',
      sanitizedHistory: [],
      reason: 'empty',
      safeReply: '¿En qué producto o servicio te puedo ayudar hoy?'
    };
  }

  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  // Detectar intentos de Prompt Injection o manipulación de precios
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        valid: false,
        sanitizedText: cleaned,
        sanitizedHistory: [],
        reason: 'prompt_injection_detected',
        safeReply:
          '¡Hola! 🤖 Soy Ark, asistente oficial de comercio. Solo puedo ayudarte con información de nuestro catálogo oficial, tallas, envíos y precios vigentes en tienda. ¿Qué producto te gustaría cotizar?'
      };
    }
  }

  // Sanitizar historial (máximo 4 turnos, 250 caracteres por turno)
  const sanitizedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  if (Array.isArray(rawHistory)) {
    for (const item of rawHistory.slice(-4)) {
      if (
        item &&
        typeof item === 'object' &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string'
      ) {
        const cleanTurn = item.content
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
          .replace(/<\/?(user_query|system|assistant|prompt|script|iframe)[^>]*>/gi, '')
          .trim()
          .slice(0, 250);

        if (cleanTurn && !PROMPT_INJECTION_PATTERNS.some((p) => p.test(cleanTurn))) {
          sanitizedHistory.push({ role: item.role, content: cleanTurn });
        }
      }
    }
  }

  return {
    valid: true,
    sanitizedText: cleaned,
    sanitizedHistory
  };
}

/**
 * Verifica sesión de Administrador en KV a partir del header Authorization: Bearer <token>.
 */
export async function verifyAdminSession(
  c: Context<{ Bindings: Env }>
): Promise<{ tenantId: string; userId: string; email: string; role: string } | null> {
  const auth = c.req.header('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token) return null;
  const raw = await c.env.SESSION.get('session:' + token);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Comparación en tiempo constante para evitar timing attacks en hashes/firmas.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifica firma HMAC-SHA256 de Meta Cloud API (X-Hub-Signature-256) si WHATSAPP_APP_SECRET está definido.
 */
export async function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  appSecret: string | undefined
): Promise<boolean> {
  if (!appSecret) return true; // Si no se ha configurado el secret aún, no rompe compatibilidad
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

  const expectedHex = signatureHeader.slice(7).trim().toLowerCase();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqualStr(computedHex, expectedHex);
}
