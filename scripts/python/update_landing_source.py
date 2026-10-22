new_content = '''import React, { useState } from 'react';
import AiSearchConcierge from './AiSearchConcierge';

const WHATSAPP_NUMBER = '529994918221';

const TRADE_CATEGORIES = [
  {
    id: 'plomeria',
    icon: '🔧',
    title: 'Plomería & Drenajes',
    subtitle: 'Fugas de agua, tinacos y bombas',
    sampleStore: 'baakal.ark.mx',
    services: [
      { name: 'Destape de Drenaje con Sonda Eléctrica', price: '$850', desc: 'Desazolve sin romper pisos ni tuberías' },
      { name: 'Detección y Reparación de Fuga de Agua', price: '$650', desc: 'Diagnóstico en tubería de cobre y PPR' },
      { name: 'Instalación de Tinaco / Bomba Presurizadora', price: '$1,400', desc: 'Conexión hidráulica y prueba de presión' },
    ],
    whatsappPreview: 'Hola Baakal! Solicito técnico para Destape de Drenaje con Sonda. Tarifa base: $850 MXN. Ubicación: Col. García Ginerés.',
  },
  {
    id: 'gas',
    icon: '🔥',
    title: 'Gas LP & Boilers',
    subtitle: 'Líneas de gas, calentadores y fugas',
    sampleStore: 'baakal.ark.mx',
    services: [
      { name: 'Instalación de Boiler (Gas o Solar)', price: '$1,250', desc: 'Montaje con prueba de hermeticidad' },
      { name: 'Prueba de Hermeticidad y Fuga de Gas', price: '$950', desc: 'Detección con manómetro y equipo certificado' },
      { name: 'Cambio de Válvulas y Regulador de Tanque', price: '$750', desc: 'Regulador de alta y baja presión' },
    ],
    whatsappPreview: 'Hola Baakal! Requiero instalación de Boiler con prueba de hermeticidad. Total: $1,250 MXN. ¿Tienen disponibilidad hoy?',
  },
  {
    id: 'climas',
    icon: '❄️',
    title: 'Climas & Minisplits (HVAC)',
    subtitle: 'Mantenimiento, lavado y recarga de gas',
    sampleStore: 'climasdeleste.ark.mx',
    services: [
      { name: 'Lavado Profundo de Minisplit', price: '$550', desc: 'Desinfección de turbina y serpentín' },
      { name: 'Recarga de Gas Refrigerante R410A', price: '$850', desc: 'Carga completa con vacío previo' },
      { name: 'Instalación Completa Minisplit Inverter', price: '$1,450', desc: 'Incluye kit de tubería y fijación de ménsulas' },
    ],
    whatsappPreview: 'Hola! Quiero agendar servicio de lavado profundo para 2 minisplits. Total: $1,100 MXN. Paso mi dirección.',
  },
  {
    id: 'electricidad',
    icon: '⚡',
    title: 'Electricidad & Cuadros de Carga',
    subtitle: 'Cortocircuitos, cableado y centros de carga',
    sampleStore: 'voltia.ark.mx',
    services: [
      { name: 'Reparación de Cortocircuito y Falla Eléctrica', price: '$750', desc: 'Aislamiento de circuito y cambio de pastilla' },
      { name: 'Instalación de Centro de Carga (2 a 4 pastillas)', price: '$1,350', desc: 'Norma técnica con tierra física' },
      { name: 'Cableado y Balanceo de Cargas', price: '$1,800', desc: 'Para evitar sobrecalentamiento y caídas de voltaje' },
    ],
    whatsappPreview: 'Hola! Tengo una falla en el centro de carga principal de mi casa. Solicito electricista urgente.',
  },
];

export default function ArkLanding() {
  const [selectedCat, setSelectedCat] = useState(TRADE_CATEGORIES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedClabe, setCopiedClabe] = useState(false);

  const getWaLink = (msg: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const handleCopyDemoClabe = () => {
    try {
      navigator.clipboard.writeText('012180012345678901');
      setCopiedClabe(true);
      setTimeout(() => setCopiedClabe(false), 2200);
    } catch {}
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-white selection:bg-[#B4FF00] selection:text-[#0B0C0E] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .lima-glow { box-shadow: 0 8px 30px -6px rgba(180,255,0,0.35); }
        .grid-bg { 
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); 
          background-size: 40px 40px; 
        }
      `}</style>

      {/* =========================================================================
          HEADER
         ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0C0E]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#B4FF00] flex items-center justify-center font-display font-black text-[15px] text-[#0B0C0E] shadow-sm">
              ▲
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight text-white">
                ARK<span className="text-[#B4FF00]">OFICIOS</span>
              </span>
              <span className="hidden sm:inline-block ml-3 font-mono text-[11px] tracking-widest text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded border border-[#B4FF00]/20">
                RED DE MANTENIMIENTO CON IA
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#A7AEB8]">
            <button onClick={() => scrollTo('ai-concierge')} className="hover:text-white transition">Cotizador IA</button>
            <button onClick={() => scrollTo('servicios')} className="hover:text-white transition">Especialidades</button>
            <button onClick={() => scrollTo('comparativa')} className="hover:text-white transition">Garantía Ark</button>
            <button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition">Cómo funciona</button>
            <button onClick={() => scrollTo('proveedores')} className="hover:text-white transition">Para Técnicos</button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={getWaLink('Hola Ark! Tengo una emergencia de mantenimiento en mi hogar/negocio.')}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] px-5 flex items-center font-display text-[13px] font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
            >
              Pedir Técnico por WhatsApp →
            </a>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative overflow-hidden grid-bg border-b border-white/10 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-1/3 right-[10%] w-72 h-72 rounded-full bg-[#B4FF00]/10 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
            
            {/* Copy Principal */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B4FF00]/30 bg-[#B4FF00]/10 px-3.5 py-1 text-xs font-mono font-bold text-[#B4FF00] mb-6">
                <span>🇲🇽</span> TÉCNICOS VERIFICADOS EN EL SURESTE · EMERGENCIAS Y MANTENIMIENTO
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-[60px] font-black tracking-tight leading-[1.04]">
                El técnico que necesitas en tu casa o negocio.{' '}
                <span className="text-[#B4FF00] block mt-1">Cotizado al instante por IA.</span>
              </h1>

              <p className="font-body mt-6 text-[16px] sm:text-[18px] leading-[1.65] text-[#A7AEB8] max-w-xl">
                Olvídate de buscar números en postes o esperar horas sin saber cuánto te van a cobrar.
                Describe tu problema en lenguaje natural; nuestra IA te entrega la cotización real y te conecta de inmediato con un técnico certificado en plomería, gas, climas o electricidad.
              </p>

              {/* Badges de servicio */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono font-semibold text-zinc-300">
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> Precios cerrados por catálogo
                </span>
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> Folio de servicio formal con garantía
                </span>
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> Pago directo por SPEI a tu banco
                </span>
              </div>

              {/* Botones de acción */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => scrollTo('ai-concierge')}
                  className="h-14 px-8 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] flex items-center justify-center font-display text-base font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
                >
                  🤖 Cotizar mi reparación con IA ↓
                </button>
                <a
                  href={getWaLink('Hola Ark! Soy técnico/contratista y me interesa unirme a la red de proveedores.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition gap-2"
                >
                  <span>👨‍🔧 ¿Eres técnico? Únete a la red</span>
                  <span>→</span>
                </a>
              </div>

              <p className="mt-4 text-xs text-[#7C8590] font-mono">
                Atención en Mérida, Cancún, Playa del Carmen y Sureste · Técnicos certificados
              </p>
            </div>

            {/* Mockup Interactivo: Orden de Servicio Baakal */}
            <div className="relative">
              <div className="relative rounded-2xl border border-white/15 bg-[#121417] p-5 sm:p-6 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-xs text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/5">
                      baakal.ark.mx · Folio #PLM-2026-0847
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded">
                    TÉCNICO DISPONIBLE
                  </span>
                </div>

                {/* Servicios de la orden técnica */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-sm text-white">Instalación de Boiler / Calentador</div>
                      <div className="text-xs text-[#7C8590]">Incluye prueba de hermeticidad y sellado de gas</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#B4FF00] text-sm">$1,250 MXN</div>
                      <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded">Servicio</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-sm text-white">Prueba de Presión Hidráulica</div>
                      <div className="text-xs text-[#7C8590]">Verificación con manómetro calibrado</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#B4FF00] text-sm">$450 MXN</div>
                      <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded">Diagnóstico</span>
                    </div>
                  </div>

                  {/* Caja de Formalización SPEI en 1 Clic */}
                  <div className="rounded-xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#A7AEB8] font-mono">TOTAL ESTIMADO ORDEN:</span>
                      <span className="font-mono font-black text-lg text-[#B4FF00]">$1,700 MXN</span>
                    </div>

                    <div className="bg-[#0B0C0E] border border-white/10 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="text-zinc-500 block text-[10px]">CLABE SPEI (BBVA Oficial):</span>
                        <span className="font-mono text-zinc-200">0121 8001 2345 6789 01</span>
                      </div>
                      <button
                        onClick={handleCopyDemoClabe}
                        className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition shrink-0"
                      >
                        {copiedClabe ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>

                    <a
                      href={getWaLink('Hola Baakal! Solicito formalizar la orden técnica #PLM-2026-0847 por $1,700 MXN. Ya tengo mi ubicación lista.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 rounded-lg bg-[#25D366] hover:bg-[#22bf5b] font-bold text-white text-xs flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <span>💬</span> Formalizar Visita por WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECCIÓN DEL ASISTENTE AGÉNTICO IA (ARK CONCIERGE)
         ========================================================================= */}
      <section id="ai-concierge" className="py-16 sm:py-20 border-b border-white/10 bg-[#0E1013] relative overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <AiSearchConcierge />
        </div>
      </section>

      {/* =========================================================================
          EL DOLOR DEL TÉCNICO INFORMAL
         ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              La pesadilla de las reparaciones
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Deja de contratar técnicos del poste o de grupos de Facebook.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              El 80% de los fraudes y malas reparaciones en el hogar ocurren por técnicos sin verificación que inventan precios sobre la marcha y desaparecen sin garantía.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* El técnico informal */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/[0.1] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 text-red-400 font-display font-bold">
                <span className="text-2xl">❌</span>
                <span>Con el técnico informal tradicional:</span>
              </div>
              <ul className="space-y-3.5 text-sm text-[#A7AEB8]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Te dice "llego en 20 minutos" y aparece 4 horas después (o nunca).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>No te da precio cerrado hasta que ya desarmó tu pared o tubería.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Usa piezas de segunda mano o pegamento improvisado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Si la fuga regresa al día siguiente, bloquea tu número.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <strong className="text-red-300">Resultado: Pagas doble y tu casa se sigue inundando.</strong>
                </li>
              </ul>
            </div>

            {/* Con Ark Oficios */}
            <div className="rounded-2xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 text-[#B4FF00] font-display font-bold">
                <span className="text-2xl">⚡</span>
                <span>Con la Red Ark Oficios:</span>
              </div>
              <ul className="space-y-3.5 text-sm text-zinc-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Nuestra IA te da el <strong>precio oficial de catálogo</strong> antes de que salga la unidad.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Técnico con herramienta especializada (detector de gas, cámara de video y sonda).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Folio de servicio formal numerado (#PLM-2026-...) con orden por WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Pagas por SPEI con CLABE bancaria verificada o terminal al terminar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <strong className="text-[#B4FF00]">Resultado: Fuga o avería solucionada con garantía por escrito.</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWCASE DE ESPECIALIDADES TÉCNICAS
         ========================================================================= */}
      <section id="servicios" className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Catálogo de Especialidades
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Especialistas en mantenimiento para casa y empresa.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              Cada especialidad cuenta con estándares técnicos rigurosos, tarifas transparentes y herramientas industriales.
            </p>
          </div>

          {/* Selector de Especialidades */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {TRADE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                  selectedCat.id === cat.id
                    ? 'bg-[#B4FF00] text-[#0B0C0E] shadow-lg shadow-[#B4FF00]/20'
                    : 'bg-white/[0.04] border border-white/10 text-[#A7AEB8] hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Tarjeta de la especialidad activa */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-white/15 bg-[#121417] p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCat.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{selectedCat.title}</h3>
                    <p className="text-xs text-[#7C8590]">{selectedCat.subtitle}</p>
                  </div>
                </div>
              </div>
              <div className="font-mono text-xs text-[#B4FF00] bg-[#B4FF00]/10 px-3 py-1.5 rounded-lg border border-[#B4FF00]/20 self-start sm:self-auto">
                Proveedor Insignia: {selectedCat.sampleStore}
              </div>
            </div>

            {/* Lista de servicios con tarifas */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {selectedCat.services.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                  <div>
                    <div className="font-display font-bold text-sm text-white">{p.name}</div>
                    <div className="text-xs text-[#7C8590] mt-1">{p.desc}</div>
                  </div>
                  <div className="font-mono font-bold text-[#B4FF00] text-sm mt-3">{p.price} MXN</div>
                </div>
              ))}
            </div>

            {/* Mensaje de orden técnica */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-start gap-3">
              <span className="text-xl">💬</span>
              <div>
                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Así se formaliza la visita por WhatsApp:
                </div>
                <div className="text-sm text-zinc-200 mt-1 italic">
                  "{selectedCat.whatsappPreview}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CÓMO FUNCIONA EL SERVICIO
         ========================================================================= */}
      <section id="como-funciona" className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Proceso Transparente
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Cómo resolvemos tu emergencia técnica en 3 pasos.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-white">Describes tu síntoma a la IA</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                Escribe: <em>"Huele a gas en el calentador"</em> o <em>"el agua no baja en la tarja"</em>. Nuestra IA calcula la tarifa estimada según el catálogo oficial.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-white">Coordinas visita en WhatsApp</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                El sistema te genera tu folio de servicio y abre el chat directo con el técnico certificado asignado para acordar hora de llegada.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-white">Trabajo con garantía & SPEI</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                El técnico realiza el trabajo con herramienta profesional. Pagas por SPEI o tarjeta y recibes tu garantía por escrito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PARA TÉCNICOS Y CONTRATISTAS ($299/mes)
         ========================================================================= */}
      <section id="proveedores" className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-[#B4FF00] bg-gradient-to-b from-[#161a14] to-[#121417] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#B4FF00] text-[#0B0C0E] font-display font-bold text-[11px] px-4 py-1 rounded-bl-xl tracking-wider uppercase">
              PARA TÉCNICOS & CONTRATISTAS
            </div>

            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Únete a la Red Ark
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mt-2">
              $299 <span className="text-base sm:text-lg font-normal text-[#A7AEB8]">MXN / mes</span>
            </h2>
            <p className="mt-2 text-xs text-zinc-400 font-mono">Deja de perder trabajos por no contestar el WhatsApp mientras estás en una escalera</p>

            <div className="my-8 border-t border-white/10 pt-8 text-left space-y-3.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Tu web profesional con diseño de autor</strong> (como Baakal)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Asistente IA 24/7</strong> que atiende y cotiza a tus clientes automáticamente</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Presencia en el buscador Ark Concierge</strong> para recibir nuevos clientes</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Folios formales de cotización</strong> con desglose de IVA y materiales</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Cobro directo a tu banco por SPEI</strong> (0% de comisiones)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Panel de control móvil:</strong> edita tus precios y servicios en segundos</span>
              </div>
            </div>

            <a
              href={getWaLink('Hola Ark! Soy técnico independiente/empresa de mantenimiento y quiero unirme a la red por $299/mes.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] font-display font-bold text-base text-[#0B0C0E] flex items-center justify-center gap-2 transition lima-glow active:scale-[0.98]"
            >
              👉 Quiero Unirme como Técnico Verificado
            </a>

            <p className="mt-4 text-[11px] text-[#7C8590] font-mono">
              Validamos tu experiencia y te entregamos tu perfil activo hoy mismo.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ
         ========================================================================= */}
      <section id="faq" className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[800px] px-4 sm:px-8">
          <div className="text-center mb-12">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Dudas Frecuentes
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Preguntas Frecuentes de Clientes y Técnicos
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Cómo garantizan que el precio no cambiará al llegar el técnico?',
                a: 'Nuestra IA y catálogo manejan tarifas oficiales fijas para diagnósticos y reparaciones estándar. Antes de iniciar cualquier trabajo mayor, el técnico te entrega un folio formal con el desglose exacto de mano de obra y refacciones, requiriendo tu autorización.',
              },
              {
                q: '¿En cuánto tiempo llega un técnico para una emergencia de gas o agua?',
                a: 'En las zonas principales de cobertura (Mérida, Cancún y Sureste), las unidades de emergencia tienen un tiempo de respuesta promedio de 45 a 90 minutos según la disponibilidad.',
              },
              {
                q: '¿Qué garantía tienen los trabajos realizados?',
                a: 'Todos los servicios de la Red Ark cuentan con garantía por escrito de 30 a 90 días en mano de obra. Si la avería reincide por una mala instalación, el técnico regresa sin costo adicional.',
              },
              {
                q: '¿Cómo puedo pagar el servicio?',
                a: 'Aceptamos transferencias inmediatas por SPEI (BBVA o cualquier banco), tarjetas de débito/crédito mediante terminal física del técnico, o efectivo contra entrega de comprobante.',
              },
              {
                q: '¿Cómo me uno a la red si soy plomero, electricista o técnico en climas?',
                a: 'Envíanos un mensaje por WhatsApp. Revisamos tu experiencia, herramientas de trabajo y comprobante de domicilio. Al ser aprobado, activamos tu perfil profesional en Ark por $299 MXN al mes.',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#121417] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left font-display font-bold text-sm sm:text-base flex justify-between items-center text-white hover:text-[#B4FF00] transition"
                >
                  <span>{item.q}</span>
                  <span className="text-[#B4FF00] ml-3">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#A7AEB8] leading-relaxed border-t border-white/5 pt-3 font-body">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
         ========================================================================= */}
      <footer className="py-12 bg-[#0B0C0E] text-zinc-500 text-xs">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white">ARK<span className="text-[#B4FF00]">OFICIOS</span></span>
            <span>· Red de Mantenimiento & Servicios Técnicos en México</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={getWaLink('Hola Ark! Tengo una duda sobre los servicios técnicos de mantenimiento.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B4FF00] hover:underline"
            >
              Contacto Urgencias WhatsApp
            </a>
            <span>·</span>
            <a href="/admin/leads.html" className="hover:text-white transition">Panel de Leads</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
'''

with open('src/components/ark/ArkLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Saved new ArkLanding.tsx successfully!")
