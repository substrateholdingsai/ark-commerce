import { create } from 'zustand';

export interface StoreConfig {
  name: string;
  slug: string;
  whatsapp: string;
  clabe: string;
  bank: string;
  clabe_holder: string;
  btcpay_pos_url: string;
  sats_rate: number;
  logo_url: string | null;
  theme_color: string | null;
}

const DEFAULT: StoreConfig = {
  name: 'Ark Systems - Landing Express Kit',
  slug: 'ark',
  whatsapp: '529994918221',
  clabe: '123456789012345678',
  bank: 'BBVA',
  clabe_holder: 'Ark Systems',
  btcpay_pos_url: 'https://btcpay.arksystems.ai',
  sats_rate: 2.5,
  logo_url: '/favicon.svg',
  theme_color: '#FF6B1A',
};

interface State {
  config: StoreConfig;
  loaded: boolean;
  load: () => Promise<void>;
}

export const useStoreConfig = create<State>((set, get) => ({
  config: DEFAULT,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch('/api/store/config');
      const json: any = await res.json();
      if (json.success && json.data) {
        set({ config: { ...DEFAULT, ...json.data }, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));

export function getStoreConfig(): StoreConfig {
  return useStoreConfig.getState().config;
}

if (typeof window !== 'undefined') { useStoreConfig.getState().load(); }
