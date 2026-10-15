export type Env = {
  DB: D1Database;
  ORDER_QUEUE: Queue<CheckoutMessage>;
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
