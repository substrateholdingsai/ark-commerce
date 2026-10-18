import { getUnixTime } from './crypto';
import type { CartItem } from '../types/auth';

export function serializeCartItems(items: CartItem[]): string {
  try {
    return JSON.stringify(items.filter((i) => i.quantity > 0 && i.productId));
  } catch {
    return '[]';
  }
}

export function deserializeCartItems(json: string): CartItem[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i: any) => i && typeof i.productId === 'string' && typeof i.quantity === 'number')
      .map((i: any) => ({ productId: i.productId, quantity: Math.max(0, Math.floor(i.quantity)) }))
      .filter((i) => i.quantity > 0);
  } catch {
    return [];
  }
}

export function cartItemsEqual(a: CartItem[], b: CartItem[]): boolean {
  if (a.length !== b.length) return false;
  const mapA = new Map(a.map((i) => [i.productId, i.quantity]));
  for (const item of b) {
    if (mapA.get(item.productId) !== item.quantity) return false;
  }
  return true;
}

export function mergeCartItems(itemsA: CartItem[], itemsB: CartItem[]): CartItem[] {
  const map = new Map<string, number>();
  for (const i of itemsA) map.set(i.productId, (map.get(i.productId) || 0) + i.quantity);
  for (const i of itemsB) map.set(i.productId, (map.get(i.productId) || 0) + i.quantity);
  return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}
