import { z } from 'zod';

export const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

export const CheckoutSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  customerAddress: z.string().min(5).max(300),
  customerPhone: z.string().min(10).max(20),
  paymentMethod: z.enum(['transfer', 'card', 'lightning', 'whatsapp']),
  items: z.array(CheckoutItemSchema).min(1).max(50),
  notes: z.string().max(500).optional(),
  shippingCost: z.number().nonnegative().optional().default(0),
  shippingCarrier: z.string().max(50).optional(),
  shippingService: z.string().max(100).optional(),
  shippingTrackingEstimate: z.string().max(100).optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
