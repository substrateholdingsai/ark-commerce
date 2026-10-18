import { PRODUCTS as STATIC } from '@/data/products';

let cache: any[] = [...STATIC];

export function getProducts(): any[] { return cache; }

export function getProductById(id: string): any { return cache.find((p) => p.id === id); }

if (typeof window !== 'undefined') {
  fetch('/api/products').then((r) => r.json()).then((json: any) => {
    if (json.success && Array.isArray(json.data)) {
      cache = json.data;
    }
  }).catch(() => {});
}
