import React, { useState } from 'react';

const SUGGESTIONS = [
  { label: '🚨 Fuga urgente de gas o agua', query: 'Tengo una fuga urgente de gas LP en la cocina y huele fuerte' },
  { label: '🚿 Boiler no calienta o instalación', query: 'Necesito instalación de calentador de agua con prueba de presión' },
  { label: '🛠️ Drenaje tapado en baño o cocina', query: 'El drenaje del baño está completamente tapado y se regresa el agua' },
  { label: '❄️ Mantenimiento y lavado de minisplit', query: 'Requiero servicio de limpieza profunda y recarga de gas para minisplit' }
];

export default function AiSearchConcierge() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (textToSearch?: string) => {
    const q = (textToSearch || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/assistant/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (!res.ok) throw new Error('Error al conectar con Ark Concierge');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'No pudimos procesar tu solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#121417] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Header del Concierge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B4FF00] animate-pulse"></span>
          <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-wider uppercase">
            ARK CONCIERGE · BUSCADOR DE SERVICIOS
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">EN VIVO EN EL SURESTE</span>
      </div>

      <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
        ¿Qué servicio o solución necesitas hoy?
      </h3>
      <p className="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
        Describe en lenguaje natural tu problema o encargo. Nuestra IA busca en tiempo real en nuestra red de proveedores verificados y te cotiza al instante.
      </p>

      {/* Input de Búsqueda Conversacional */}
      <div className="relative flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ej: Fuga de gas en la cocina, necesito contador para mi PyME, etc."
          className="flex-1 bg-[#0B0C0E] border border-white/15 focus:border-[#B4FF00] rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition font-sans"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="h-12 px-6 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0C0E] font-display font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] whitespace-nowrap shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#0B0C0E]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <span>Consultar IA</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>

      {/* Sugerencias Rápidas */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-mono text-zinc-500 mr-1">Prueba con:</span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(s.query);
              handleSearch(s.query);
            }}
            className="text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono">
          ⚠ {error}
        </div>
      )}

      {/* Resultado de la IA: Card del Proveedor Recomendado */}
      {result && result.recommended_tenant && (
        <div className="mt-6 p-5 sm:p-6 rounded-xl bg-gradient-to-b from-[#181C22] to-[#0E1013] border border-[#B4FF00]/30 shadow-[0_12px_32px_rgba(0,0,0,0.4)] animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#B4FF00]">
              <span>✓</span> PROVEEDOR VERIFICADO ENCONTRADO
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase">Respuesta Instantánea</span>
          </div>

          <p className="text-sm text-zinc-200 leading-relaxed mb-4">
            {result.explanation}
          </p>

          <div className="bg-[#0B0C0E] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="font-display text-lg font-bold text-white">
                {result.recommended_tenant.name}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {result.recommended_tenant.matched_services?.map((s: any) => s.name).join(' • ')}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-white/10 sm:pl-5">
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Tarifa Estimada</div>
                <div className="font-mono text-xl font-bold text-[#B4FF00]">
                  ${Number(result.recommended_tenant.estimated_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-zinc-400 font-normal"> MXN</span>
                </div>
              </div>

              <a
                href={result.recommended_tenant.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-lg bg-[#B4FF00] hover:bg-[#C6FF33] text-[#0B0C0E] font-display font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap active:scale-[0.98]"
              >
                <span>Ver y Contratar</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
