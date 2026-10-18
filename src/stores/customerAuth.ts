import { create } from 'zustand';

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
}

interface CustomerAuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  magicLinkSent: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  requestMagicLink: (email: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setAuthModalOpen: (open: boolean) => void;
  clearError: () => void;
  resetMagicLink: () => void;
}

export const useCustomerAuth = create<CustomerAuthState>((set, get) => ({
  customer: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthModalOpen: false,
  magicLinkSent: false,
  error: null,

  clearError: () => set({ error: null }),
  resetMagicLink: () => set({ magicLinkSent: false, error: null }),
  setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open, error: null, magicLinkSent: false }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const json: any = await res.json().catch(() => ({}));
      if (json?.success && json?.data?.isGuest === false && json?.data?.customer) {
        set({ customer: json.data.customer, isAuthenticated: true, isLoading: false, error: null });
      } else {
        set({ customer: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false, isAuthenticated: false, customer: null });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const json: any = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        const err = json?.error || res.statusText || 'Error al iniciar sesión';
        set({ isLoading: false, error: err });
        return { success: false, error: err };
      }
      await get().checkAuth();
      set({ isLoading: false, isAuthModalOpen: false, error: null });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:login'));
      }
      return { success: true };
    } catch (e: any) {
      const err = e?.message || 'Error de conexión';
      set({ isLoading: false, error: err });
      return { success: false, error: err };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: data.email, password: data.password, fullName: data.fullName, phone: data.phone }),
      });
      const json: any = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        const err = json?.error || res.statusText || 'Error al registrarse';
        set({ isLoading: false, error: err });
        return { success: false, error: err };
      }
      await get().checkAuth();
      set({ isLoading: false, isAuthModalOpen: false, error: null });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:login'));
      }
      return { success: true };
    } catch (e: any) {
      const err = e?.message || 'Error de conexión';
      set({ isLoading: false, error: err });
      return { success: false, error: err };
    }
  },

  requestMagicLink: async (email: string, fullName?: string) => {
    set({ isLoading: true, error: null, magicLinkSent: false });
    try {
      const res = await fetch('/api/auth/magic/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, fullName }),
      });
      const json: any = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        const err = json?.error || res.statusText || 'Error al enviar enlace mágico';
        set({ isLoading: false, error: err });
        return { success: false, error: err };
      }
      set({ isLoading: false, magicLinkSent: true, error: null });
      return { success: true };
    } catch (e: any) {
      const err = e?.message || 'Error de conexión';
      set({ isLoading: false, error: err });
      return { success: false, error: err };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    set({ customer: null, isAuthenticated: false, isLoading: false, isAuthModalOpen: false, magicLinkSent: false, error: null });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  },
}));

if (typeof window !== 'undefined') {
  setTimeout(() => useCustomerAuth.getState().checkAuth().catch(() => {}), 0);
}
