export type Env = {
  DB: D1Database;
  SESSION: KVNamespace;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  ORDER_QUEUE: Queue<CheckoutMessage>;
  AI?: any;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  ENVIRONMENT?: string;
  BTCPAY_POS_URL?: string;
  CLABE?: string;
  BANK?: string;
  CLABE_HOLDER?: string;
  WHATSAPP_NUMBER?: string;
  SATS_RATE?: string;
  ENVIA_API_KEY?: string;
  ENVIA_SANDBOX?: string; // 'true' | 'false'
  WHATSAPP_VERIFY_TOKEN?: string;
  WHATSAPP_API_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  ARKANGEL_ADMIN_TOKEN?: string;
  ARKANGEL_URL?: string;
  ARKANGEL?: { fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response> };
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
  origin_street?: string | null;
  origin_number?: string | null;
  origin_district?: string | null;
  origin_city?: string | null;
  origin_state?: string | null;
  origin_postal_code?: string | null;
  origin_country?: string | null;
  envia_api_key?: string | null;
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

