export type Env = {
  DB: D1Database;
  SESSION: KVNamespace;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  ORDER_QUEUE: Queue<CheckoutMessage>;
  BTCPAY_POS_URL?: string;
  CLABE?: string;
  BANK?: string;
  CLABE_HOLDER?: string;
  WHATSAPP_NUMBER?: string;
  SATS_RATE?: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  whatsapp: string | null;
  clabe: string | null;
  bank: string | null;
  clabe_holder: string | null;
  btcpay_pos_url: string | null;
  sats_rate: number | null;
  logo_url: string | null;
  theme_color: string | null;
};

export type CheckoutMessage = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
};
