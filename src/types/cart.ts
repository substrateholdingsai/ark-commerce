import type { Product } from './product';

export interface CartItem {
  id: string;
  qty: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
  subtotal: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  notes?: string;
}

export type PaymentMethod = 'card' | 'transfer' | 'bitcoin';