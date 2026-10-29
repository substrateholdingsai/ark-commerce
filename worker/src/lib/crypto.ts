import type { Env } from '../types/env';

export function getUnixTime(): number {
  return Math.floor(Date.now() / 1000);
}

export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const buf = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function pbkdf2Hash(password: string, salt: Uint8Array, iterations = 100000, keylen = 32): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' }, key, keylen * 8);
  const bytes = new Uint8Array(bits);
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2$${iterations}$${saltHex}$${hashHex}`;
}

export async function verifyPbkdf2(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1]);
  const saltHex = parts[2];
  const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map((h) => parseInt(h, 16)) || []);
  const computed = await pbkdf2Hash(password, salt, iterations);
  return computed === stored;
}

export async function hashPasswordForClient(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return await pbkdf2Hash(password, salt, 100000, 32);
}

export async function verifyLegacySha256(storedSha256: string, password: string): Promise<boolean> {
  const computed = await sha256Hex(password);
  return computed === storedSha256;
}
