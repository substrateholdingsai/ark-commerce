import type { Product } from '@/types/product';

export const PRODUCTS: Product[] = [
  {
    id: 'carne',
    name: 'Carne Ahumada',
    weight: '1kg',
    price: 380,
    desc: 'Brisquet ahumado 8h con mezquite. Corte tierno, jugoso y con el sabor ahumado profundo que solo el tiempo y la leña pueden dar.',
    image: '/images/products/carne-ahumada.jpg',
    badge: 'MÁS VENDIDA',
    stock: 12,
    category: 'carnes',
  },
  {
    id: 'costillas',
    name: 'Costillas BBQ',
    weight: '1kg',
    price: 420,
    desc: 'Costillas de cerdo ahumadas 6h, glaseadas con salsa BBQ casera de piloncillo y chile ancho. Se desprenden del hueso.',
    image: '/images/products/costillas-bbq.jpg',
    badge: 'NUEVO',
    stock: 8,
    category: 'carnes',
  },
  {
    id: 'chorizo',
    name: 'Chorizo Artesanal',
    weight: '500g',
    price: 180,
    desc: 'Chorizo estilo oaxaqueño, embutido en tripa natural. Cerdo de granja, chiles secos, especias y un toque de vinagre de manzana.',
    image: '/images/products/chorizo.jpg',
    stock: 20,
    category: 'embutidos',
  },
  {
    id: 'salchichon',
    name: 'Salchichón Ibérico',
    weight: '300g',
    price: 250,
    desc: 'Curado 90 días en bodega natural. Textura sedosa, sabor intenso y equilibrado. El acompañante perfecto para tu tabla de quesos.',
    image: '/images/products/salchichon.jpg',
    badge: 'PREMIUM',
    stock: 15,
    category: 'embutidos',
  },
  {
    id: 'pack-degustacion',
    name: 'Pack Degustación',
    weight: '2.3kg',
    price: 980,
    desc: 'La experiencia completa: 1kg Carne Ahumada + 1kg Costillas BBQ + 500g Chorizo + 300g Salchichón. Ahorra 15% vs compra individual.',
    image: '/images/products/pack-degustacion.jpg',
    badge: 'MEJOR VALOR',
    stock: 5,
    category: 'packs',
  },
] as const;

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter(p => p.category === category);
}

export function getAvailableProducts(): Product[] {
  return PRODUCTS.filter(p => p.stock > 0);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter(p => p.badge);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}