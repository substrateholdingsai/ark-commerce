import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/stores/customerAuth';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    login,
    register,
    requestMagicLink,
    isLoading,
    error,
    magicLinkSent,
    resetMagicLink,
    clearError,
  } = useCustomerAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'magic'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [magicForm, setMagicForm] = useState({ email: '', fullName: '' });

  useEffect(() => {
    if (isAuthModalOpen) {
      resetMagicLink();
      clearError();
    }
  }, [isAuthModalOpen, tab]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" 
        onClick={() => setAuthModalOpen(false)} 
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Acceso a tu cuenta</h3>
          <button 
            type="button"
            onClick={() => setAuthModalOpen(false)} 
            className="rounded-full p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex gap-2 border-b pb-2">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === 'login' ? 'bg-[#7E1D0F] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === 'register' ? 'bg-[#7E1D0F] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Crear cuenta
          </button>
          <button
            type="button"
            onClick={() => setTab('magic')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === 'magic' ? 'bg-[#7E1D0F] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Magic Link
          </button>
        </div>

        {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {tab === 'login' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await login(loginForm.email, loginForm.password);
            }}
            className="space-y-3"
          >
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
              placeholder="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
              placeholder="Contraseña"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button 
              type="submit"
              disabled={isLoading} 
              className="w-full rounded-lg bg-[#7E1D0F] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#6A180D] active:scale-[0.98] transition disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await register(registerForm);
            }}
            className="space-y-3"
          >
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
              placeholder="Nombre completo"
              value={registerForm.fullName}
              onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
              placeholder="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
              placeholder="Teléfono"
              value={registerForm.phone}
              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
            />
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
              placeholder="Contraseña"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <button 
              type="submit"
              disabled={isLoading} 
              className="w-full rounded-lg bg-[#7E1D0F] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#6A180D] active:scale-[0.98] transition disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {tab === 'magic' && (
          <div className="space-y-3">
            {magicLinkSent ? (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
                <p className="font-bold">¡Enlace enviado!</p>
                <p className="mt-1">Revisa tu bandeja de entrada para iniciar sesión al instante con un solo clic.</p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await requestMagicLink(magicForm.email, magicForm.fullName);
                }}
                className="space-y-3"
              >
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
                  placeholder="Nombre completo (opcional)"
                  value={magicForm.fullName}
                  onChange={(e) => setMagicForm({ ...magicForm, fullName: e.target.value })}
                />
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7E1D0F] focus:outline-none"
                  placeholder="Email"
                  type="email"
                  value={magicForm.email}
                  onChange={(e) => setMagicForm({ ...magicForm, email: e.target.value })}
                  required
                />
                <button 
                  type="submit"
                  disabled={isLoading} 
                  className="w-full rounded-lg bg-[#7E1D0F] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#6A180D] active:scale-[0.98] transition disabled:opacity-50"
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de acceso'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
