import React, { useEffect, useRef, useState } from 'react';
import { useCustomerAuth } from '@/stores/customerAuth';

export default function UserMenu() {
  const { customer, isAuthenticated, isLoading, setAuthModalOpen, logout } = useCustomerAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  if (isLoading) {
    return (
      <button className="h-10 px-3 rounded-full border border-[#7E1D0F]/20 text-xs font-semibold text-gray-500 bg-white/50" disabled>
        Cargando...
      </button>
    );
  }

  if (!isAuthenticated || !customer) {
    return (
      <button
        type="button"
        onClick={() => setAuthModalOpen(true)}
        className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border border-[#7E1D0F]/20 bg-white text-[#7E1D0F] font-bold text-xs hover:bg-[#FFF9F3] hover:border-[#7E1D0F]/40 active:scale-[0.98] transition shadow-sm"
      >
        <span>👤</span>
        <span>Entrar</span>
      </button>
    );
  }

  const firstName = customer.full_name?.split(' ')[0] || 'Mi Cuenta';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border border-[#7E1D0F]/30 bg-white text-[#2B0E0A] font-bold text-xs hover:bg-[#FFF9F3] active:scale-[0.98] transition shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>{firstName}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-xs font-bold text-gray-900 truncate">{customer.full_name}</p>
            <p className="text-[11px] text-gray-500 truncate">{customer.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
