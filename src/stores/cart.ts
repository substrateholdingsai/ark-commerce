import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CustomerInfo, PaymentMethod, CartItemWithProduct } from '@/types/cart';
import type { Product } from '@/types/product';
import { getProducts, getProductById as getCachedProduct } from '@/stores/productsCache';
import { CONFIG } from '@/utils/constants';
import { getStoreConfig } from '@/stores/storeConfig';

interface CartState {
  // ============ ESTADO ============
  items: CartItem[];
  isCartOpen: boolean;
  paymentMethod: PaymentMethod;
  customer: CustomerInfo;
  copiedClabe: boolean;
  copiedLightning: boolean;

  // ============ ACCIONES DEL CARRITO ============
  addItem: (id: string, qty?: number) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  // ============ ACCIONES DE CHECKOUT ============
  setPaymentMethod: (method: PaymentMethod) => void;
  updateCustomer: (data: Partial<CustomerInfo>) => void;
  resetCustomer: () => void;

  // ============ GETTERS / COMPUTED ============
  getTotal: () => number;
  getItemCount: () => number;
  getProductById: (id: string) => Product | undefined;
  getItemsWithProducts: () => CartItemWithProduct[];
  getSatsAmount: () => number;

  // ============ ACCIONES DE PAGO ============
  copyClabe: () => Promise<void>;
  copyLightningData: () => Promise<void>;
  openBtcpay: () => void;
  openLightning: () => void;
  generateWhatsAppUrl: () => string;
  sendWhatsApp: () => void;

  // ============ UI ============
  scrollToCheckout: () => void;
}

const DEFAULT_CUSTOMER: CustomerInfo = {
  name: '',
  address: '',
  phone: '',
  notes: '',
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // ============ ESTADO INICIAL ============
      items: [],
      isCartOpen: false,
      paymentMethod: 'transfer',
      customer: { ...DEFAULT_CUSTOMER },
      copiedClabe: false,
      copiedLightning: false,

      // ============ ACCIONES DEL CARRITO ============
      addItem: (id, qty = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id ? { ...item, qty: item.qty + qty } : item
              ),
              isCartOpen: true,
            };
          }
          return {
            items: [...state.items, { id, qty }],
            isCartOpen: true,
          };
        });
      },

      updateQuantity: (id, delta) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
            )
            .filter((item) => item.qty > 0),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isCartOpen: !state.isCartOpen }));
      },

      setCartOpen: (open) => {
        set({ isCartOpen: open });
      },

      // ============ ACCIONES DE CHECKOUT ============
      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      updateCustomer: (data) => {
        set((state) => ({
          customer: { ...state.customer, ...data },
        }));
      },

      resetCustomer: () => {
        set({ customer: { ...DEFAULT_CUSTOMER } });
      },

      // ============ GETTERS ============
      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const product = getProducts().find((p: any) => p.id === item.id);
          return sum + (product ? product.price * item.qty : 0);
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      getProductById: (id) => {
        return getCachedProduct(id);
      },

      getItemsWithProducts: () => {
        const { items } = get();
        return items
          .map((item) => {
            const product = getProducts().find((p: any) => p.id === item.id);
            if (!product) return null;
            return {
              ...item,
              product,
              subtotal: product.price * item.qty,
            };
          })
          .filter((item): item is CartItemWithProduct => item !== null);
      },

      getSatsAmount: () => {
        const total = get().getTotal();
        return Math.round(total * getStoreConfig().sats_rate * 100);
      },

      // ============ ACCIONES DE PAGO ============
      copyClabe: async () => {
        try {
          await navigator.clipboard.writeText(getStoreConfig().clabe);
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = getStoreConfig().clabe;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        set({ copiedClabe: true });
        setTimeout(() => set({ copiedClabe: false }), 2000);
      },

      copyLightningData: async () => {
        const { getSatsAmount, getTotal } = get();
        const data = `temozonia@blink.sv - $${getTotal()} MXN (~${getSatsAmount()} sats)`;
        try {
          await navigator.clipboard.writeText(data);
        } catch {
          // fallback silencioso
        }
        set({ copiedLightning: true });
        setTimeout(() => set({ copiedLightning: false }), 2000);
      },

      openBtcpay: () => {
        const total = get().getTotal();
        const url = `${CONFIG.BTCPAY_POS_URL}?amount=${total}&currency=MXN`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },

      openLightning: () => {
        window.open('https://blink.sv', '_blank', 'noopener,noreferrer');
      },

      generateWhatsAppUrl: () => {
        const { items, paymentMethod, customer, getTotal, getProductById } = get();
        const total = getTotal();

        const itemsList = items
          .map((item) => {
            const product = getProductById(item.id);
            if (!product) return null;
            return `${item.qty}x ${product.name} ${product.weight} - $${product.price * item.qty}`;
          })
          .filter((line): line is string => line !== null)
          .join('%0A');

        const header = `Hola Temozonia 🔥%0AQuiero pedir:%0A${itemsList}%0A%0ATotal: $${total} MXN%0APago: ${paymentMethod.toUpperCase()}%0A`;

        const customerInfo =
          `Nombre: ${customer.name || '(por confirmar)'}%0A` +
          `Dirección: ${customer.address || '(por confirmar)'}%0A` +
          `Tel: ${customer.phone || ''}%0A` +
          (customer.notes ? `Nota: ${customer.notes}%0A` : '');

        const delivery = customer.address
          ? `%0ADirección entrega: ${encodeURIComponent(customer.address)}`
          : '';

        return `https://wa.me/${CONFIG.WHATSAPP}?text=${header}${customerInfo}${delivery}`;
      },

      sendWhatsApp: () => {
        const url = get().generateWhatsAppUrl();
        window.open(url, '_blank');
      },

      // ============ UI ============
      scrollToCheckout: () => {
        const el = document.getElementById('checkout');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
    }),
    {
      name: 'temozonia-cart',
      partialize: (state) => ({
        items: state.items,
        paymentMethod: state.paymentMethod,
        customer: state.customer,
      }),
    }
  )
);
