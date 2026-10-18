export type Customer = {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string | null;
  full_name: string;
  phone: string | null;
  email_verified_at: number | null;
  created_at: number;
  updated_at: number;
};

export type Cart = {
  id: string;
  tenant_id: string;
  customer_id: string | null;
  items: string;
  created_at: number;
  updated_at: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type ActionToken = {
  id: string;
  tenant_id: string;
  customer_id: string | null;
  token_hash: string;
  action: string;
  expires_at: number;
  used_at: number | null;
  created_at: number;
};

export type StoreSession = {
  token_hash: string;
  customer_id: string | null;
  tenant_id: string;
  cart_id: string | null;
  expires_at: number;
  revoked_at: number | null;
  created_at: number;
};

export type CustomerSessionData = {
  tenantId: string;
  customerId: string | null;
  cartId: string | null;
  isGuest: boolean;
};
