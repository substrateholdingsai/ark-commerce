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
  postalCode?: string;
  phone: string;
  notes?: string;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  serviceDescription: string;
  deliveryEstimate: string;
  cost: number;
  currency: string;
  isSimulated?: boolean;
}

export type PaymentMethod = 'transfer' | 'card' | 'lightning' | 'whatsapp';