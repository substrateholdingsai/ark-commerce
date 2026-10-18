export function generateRandomString(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSecureToken(): string {
  return generateRandomString(32);
}
