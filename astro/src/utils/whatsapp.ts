import { CONFIG } from '@/utils/constants';
import type { Product } from '@/types/product';

interface CartItem {
  product: Product;
  qty: number;
}

interface CustomerData {
  name: string;
  address: string;
  phone: string;
  notes?: string;
}

export const generateWhatsAppMessage = (
  cart: CartItem[],
  total: number,
  paymentMethod: string,
  customer: CustomerData
) => {
  const itemsList = cart.map(item =>
    `• ${item.qty}x ${item.product.name} (${item.product.weight}) - $${item.product.price * item.qty}`
  ).join('%0A');

  const message = `¡Hola Temozonia! 🔥 Quiero hacer un pedido:%0A%0A` +
    `${itemsList}%0A%0A` +
    `💰 *Total: $${total} MXN*%0A` +
    `💳 *Pago:* ${paymentMethod.toUpperCase()}%0A%0A` +
    `👤 *Datos de entrega:*%0A` +
    `Nombre: ${customer.name || 'Por confirmar'}%0A` +
    `Dirección: ${customer.address || 'Por confirmar'}%0A` +
    `Tel: ${customer.phone}%0A` +
    `${customer.notes ? `📝 Nota: ${customer.notes}` : ''}`;

  return `https://wa.me/${CONFIG.WHATSAPP}?text=${message}`;
};