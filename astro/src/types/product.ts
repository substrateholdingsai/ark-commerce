export interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  desc: string;
  image: string;
  badge?: string;
  stock: number;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'card' | 'transfer' | 'bitcoin';
  customerInfo: CustomerInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  method: 'card' | 'transfer' | 'bitcoin';
  metadata?: Record<string, string>;
}