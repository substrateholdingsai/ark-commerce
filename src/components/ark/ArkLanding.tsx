import React, { useState } from 'react';
import AiSearchConcierge from './AiSearchConcierge';
import ServiceCarousel from './ServiceCarousel';

const WHATSAPP_NUMBER = '529994918221';

interface TradeCategory {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  sampleStore: string;
  storeUrl: string;
  badge: string;
  services: { name: string; price: string; desc: string }[];
  whatsappPreview: string;
}

const TRADE_CATEGORIES: TradeCategory[] = [
  {
    id: 'marea',
    icon: '👕',
    title: 'MAREA · Moda del Sureste',
    subtitle: 'Playeras personalizadas, serigrafía y streetwear caribeño',
    sampleStore: 'tiendas.arksystems.site/marea',
    storeUrl: '/marea',
    badge: 'RETAIL & MODA',
    services: [
      { name: 'Playera "Ola Nocturna" (100% Algodón)', price: '$349', desc: 'Serigrafía premium y tacto ultrasuave en teal y coral' },
      { name: 'Playera "Sol de Tulum" Edición Arena', price: '$329', desc: 'Estampado con pigmentos ecológicos sobre tela crema' },
      { name: 'Playera "MANGO Beach" Edición Festiva', price: '$339', desc: 'Algodón peinado con arte original caribeño y corte unisex' },
    ],
    whatsappPreview: 'Hola MAREA! 🌊 Quiero pedir la playera Ola Nocturna en talla L con envío a Cancún.',
  },
  {
    id: 'temozonia',
    icon: '🥩',
    title: 'Temozonia · Carnes Ahumadas',
    subtitle: 'Ahumados lentos artesanales de Valladolid y embutidos regionales',
    sampleStore: 'tiendas.arksystems.site/temozonia',
    storeUrl: '/temozonia',
    badge: 'GOURMET & ALIMENTOS',
    services: [
      { name: 'Pork Belly Ahumado en Jabín (500g)', price: '$269', desc: 'Horneado y ahumado lento empacado al vacío para entrega' },
      { name: 'Costillas BBQ Ahumadas 12 Horas (1kg)', price: '$389', desc: 'Carne suave que se desprende del hueso con salsa artesanal' },
      { name: 'Longaniza Tradicional de Valladolid (500g)', price: '$195', desc: 'Receta histórica con condimentos yucatecos seleccionados' },
    ],
    whatsappPreview: 'Hola Temozonia! 🥩 Me gustaría ordenar 1kg de Costillas BBQ y 500g de Pork Belly para este fin de semana.',
  },
  {
    id: 'baakal',
    icon: '🔧',
    title: 'BAAKAL · Plomería & Gas LP',
    subtitle: 'Técnicos certificados, desazolve de drenajes y redes hidráulicas',
    sampleStore: 'tiendas.arksystems.site/baakal',
    storeUrl: '/baakal',
    badge: 'SERVICIOS TÉCNICOS',
    services: [
      { name: 'Destape de Drenaje con Sonda Eléctrica', price: '$850', desc: 'Desazolve profesional sin romper pisos ni tuberías' },
      { name: 'Instalación de Boiler con Prueba Hermética', price: '$1,250', desc: 'Montaje seguro bajo norma oficial y prueba con manómetro' },
      { name: 'Detección y Reparación de Fuga de Agua', price: '$650', desc: 'Diagnóstico en tubería de cobre, CPVC y termofusión PPR' },
    ],
    whatsappPreview: 'Hola Baakal! Solicito técnico para Destape de Drenaje con Sonda. Tarifa base: $850 MXN. Ubicación: Col. García Ginerés.',
  },
  {
    id: 'climas',
    icon: '❄️',
    title: 'Climas & Minisplits (HVAC)',
    subtitle: 'Mantenimiento preventivo, lavado profundo y recarga de gas',
    sampleStore: 'climas.arksystems.site',
    storeUrl: 'https://wa.me/529994918221?text=Hola!%20Requiero%20mantenimiento%20para%20minisplit.',
    badge: 'CLIMATIZACIÓN',
    services: [
      { name: 'Lavado Profundo de Minisplit', price: '$550', desc: 'Desinfección de turbina, charola y serpentín con hidrolavadora' },
      { name: 'Recarga de Gas Refrigerante R410A', price: '$850', desc: 'Carga completa con vacío previo y balance de presiones' },
      { name: 'Instalación Completa Minisplit Inverter', price: '$1,450', desc: 'Incluye kit de tubería, cableado y fijación de ménsulas' },
    ],
    whatsappPreview: 'Hola! Quiero agendar servicio de lavado profundo para 2 minisplits. Total: $1,100 MXN. Paso mi dirección.',
  },
];

export default function ArkLanding() {
  const [selectedCat, setSelectedCat] = useState<TradeCategory>(TRADE_CATEGORIES[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const getWaLink = (msg: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
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
                ARK<span className="text-[#B4FF00]">COMMERCE</span>
              </span>
              <span className="hidden sm:inline-block ml-3 font-mono text-[10px] tracking-widest text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded border border-[#B4FF00]/20 uppercase">
                Plataforma Multi-Tienda & Servicios
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#A7AEB8]">
            <button onClick={() => scrollTo('ai-concierge')} className="hover:text-white transition">Buscador IA</button>
            <button onClick={() => scrollTo('tiendas')} className="hover:text-white transition">Tiendas & Catálogos</button>
            <button onClick={() => scrollTo('ventajas')} className="hover:text-white transition">Ventajas Ark</button>
            <button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition">Cómo Funciona</button>
            <button onClick={() => scrollTo('vende-con-ark')} className="hover:text-white transition">Abre tu Tienda ($299/mes)</button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={getWaLink('Hola Ark Commerce! Me interesa abrir una tienda online para mi negocio.')}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] px-5 flex items-center font-display text-[13px] font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
            >
              Abrir Tienda por WhatsApp →
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
                <span>🇲🇽</span> INFRAESTRUCTURA DE COMERCIO & SERVICIOS · SURESTE MEXICANO
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-[58px] font-black tracking-tight leading-[1.05]">
                Tiendas independientes y servicios del Sureste.{' '}
                <span className="text-[#B4FF00] block mt-1">Conectados al instante por IA.</span>
              </h1>

              <p className="font-body mt-6 text-[16px] sm:text-[18px] leading-[1.65] text-[#A7AEB8] max-w-xl">
                Desde carnes ahumadas artesanales y moda personalizada hasta servicios de mantenimiento para el hogar.
                Compra directo a marcas y profesionales locales con <strong>0% comisiones abusivas</strong>, pagos inmediatos por SPEI y checkout fluido en 1 clic por WhatsApp.
              </p>

              {/* Badges de plataforma */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono font-semibold text-zinc-300">
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> 0% comisiones por venta
                </span>
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> Envíos nacionales con Envia.com
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
                  🤖 Buscar productos o servicios con IA ↓
                </button>
                <a
                  href={getWaLink('Hola Ark Commerce! Tengo un negocio/marca y quiero abrir mi tienda oficial por $299/mes.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition gap-2"
                >
                  <span>🏪 Abre tu Tienda ($299/mes)</span>
                  <span>→</span>
                </a>
              </div>

              <p className="mt-4 text-xs text-[#7C8590] font-mono">
                Tiendas activas: MAREA (Playeras) · Temozonia (Carnes Ahumadas) · BAAKAL (Plomería & Gas)
              </p>
            </div>

            <ServiceCarousel />

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
          VENTAJAS ARK COMMERCE VS TRADICIONAL
         ========================================================================= */}
      <section id="ventajas" className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Comercio Directo sin Intermediarios
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Dile adiós a las comisiones abusivas de los marketplaces.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              Las plataformas tradicionales se quedan con hasta el 30% de tus ventas, retienen tu dinero durante semanas y canibalizan a tus clientes. Con Ark Commerce el negocio es 100% tuyo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Plataformas Tradicionales */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/[0.1] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 text-red-400 font-display font-bold">
                <span className="text-2xl">❌</span>
                <span>Con Shopify, Mercado Libre o Delivery Apps:</span>
              </div>
              <ul className="space-y-3.5 text-sm text-[#A7AEB8]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Te cobran entre 15% y 30% de comisión sobre cada producto vendido.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Retienen tu dinero hasta 14 o 21 días antes de transferirlo a tu banco.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Muestran anuncios de tu competencia en tus propios listados.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Tienes que pagar suscripciones caras en dólares para conectar WhatsApp o paqueterías.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <strong className="text-red-300">Resultado: Pierdes margen y nunca conoces realmente a tus compradores.</strong>
                </li>
              </ul>
            </div>

            {/* Con Ark Commerce */}
            <div className="rounded-2xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 text-[#B4FF00] font-display font-bold">
                <span className="text-2xl">⚡</span>
                <span>Con Ark Commerce:</span>
              </div>
              <ul className="space-y-3.5 text-sm text-zinc-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span><strong>0% comisiones por venta:</strong> El 100% de lo que cobras entra directo a tu cuenta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span><strong>Cobro directo SPEI BBVA:</strong> El cliente te transfiere directo a tu CLABE en segundos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span><strong>Cotizador de envíos con Envia.com:</strong> Tarifas en tiempo real por C.P. (Estafeta, FedEx, DHL, Redpack).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span><strong>Venta y atención por WhatsApp:</strong> La IA cotiza y arma el pedido en 1 clic para cerrar la venta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <strong className="text-[#B4FF00]">Resultado: Tu propia tienda web ultra-rápida en el Edge con control total.</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWCASE DE TIENDAS Y CATÁLOGOS EN VIVO
         ========================================================================= */}
      <section id="tiendas" className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Catálogos y Tiendas Activas
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Explora las tiendas oficiales alojadas en Ark Commerce.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              Cada negocio cuenta con su propia identidad gráfica, generador dinámico de productos y checkout optimizado para México.
            </p>
          </div>

          {/* Selector de Tiendas */}
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

          {/* Tarjeta de la tienda activa */}
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
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#B4FF00] bg-[#B4FF00]/10 px-3 py-1.5 rounded-lg border border-[#B4FF00]/20">
                  {selectedCat.badge}
                </span>
                <a
                  href={selectedCat.storeUrl}
                  className="font-display font-bold text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/15 transition flex items-center gap-1"
                >
                  <span>Ir a la Tienda</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Lista de productos con tarifas */}
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
                  Así se formaliza la compra por WhatsApp:
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
          CÓMO FUNCIONA EL ECOSISTEMA
         ========================================================================= */}
      <section id="como-funciona" className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Flujo Directo y Seguro
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Cómo comprar o contratar en Ark Commerce en 3 pasos.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-white">Eliges o consultas a la IA</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                Navega las tiendas de la red o escribe a Ark Concierge en lenguaje natural lo que necesitas: playeras, alimentos o servicios técnicos.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-white">Ticket y Envío por WhatsApp</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                El sistema cotiza el envío con tu Código Postal (Envia.com) o genera el folio formal de servicio y abre el chat oficial de la tienda.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-white">Pago Directo por SPEI</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                Pagas directo a la CLABE de la tienda con 0% comisiones. Recibes tu guía de paquetería o confirmación de cita de inmediato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PARA TIENDAS, MARCAS Y TÉCNICOS ($299/mes)
         ========================================================================= */}
      <section id="vende-con-ark" className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-[#B4FF00] bg-gradient-to-b from-[#161a14] to-[#121417] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#B4FF00] text-[#0B0C0E] font-display font-bold text-[11px] px-4 py-1 rounded-bl-xl tracking-wider uppercase">
              PARA MARCAS, TIENDAS Y CONTRATISTAS
            </div>

            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Lanza tu Tienda en Ark Commerce
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mt-2">
              $299 <span className="text-base sm:text-lg font-normal text-[#A7AEB8]">MXN / mes</span>
            </h2>
            <p className="mt-2 text-xs text-zinc-400 font-mono">Sin comisiones por venta. El 100% de tus ingresos cae directamente a tu cuenta bancaria.</p>

            <div className="my-8 border-t border-white/10 pt-8 text-left space-y-3.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Tu web profesional con diseño de autor</strong> (como Temozonia, Baakal o Marea)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>0% comisiones por transacción:</strong> no le pagas porcentaje a intermediarios</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Asistente IA 24/7</strong> que atiende y cotiza a tus clientes automáticamente</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Cotizador de envíos con Envia.com</strong> integrado por Código Postal</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Presencia en el buscador Ark Concierge</strong> para atraer compradores locales</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Panel de control móvil:</strong> edita tus productos, precios y pedidos en segundos</span>
              </div>
            </div>

            <a
              href={getWaLink('Hola Ark Commerce! Quiero abrir una tienda para mi marca por $299/mes.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] font-display font-bold text-base text-[#0B0C0E] flex items-center justify-center gap-2 transition lima-glow active:scale-[0.98]"
            >
              👉 Quiero Abrir mi Tienda en Ark Commerce
            </a>

            <p className="mt-4 text-[11px] text-[#7C8590] font-mono">
              Configuración en menos de 24 horas · Sin contratos forzosos.
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
              Preguntas Frecuentes de Clientes y Negocios
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Qué tipo de negocios pueden usar Ark Commerce?',
                a: 'Ark Commerce aloja tanto tiendas de productos físicos (alimentos artesanales como Temozonia, marcas de ropa como MAREA, repostería, café de especialidad) como empresas de servicios técnicos (plomería BAAKAL, gas LP, mantenimiento de climas, etc.).',
              },
              {
                q: '¿Cuánto cobra Ark Commerce de comisión por venta?',
                a: '0%. A diferencia de Shopify o Mercado Libre, Ark Commerce no cobra porcentaje sobre tus ventas. El 100% de los pagos va directo a tu cuenta bancaria vía transferencia SPEI o contra entrega.',
              },
              {
                q: '¿Cómo funcionan los envíos de paquetería?',
                a: 'La plataforma integra Envia.com de forma nativa. Al ingresar su Código Postal en el checkout, el cliente cotiza en tiempo real con FedEx, Estafeta, Redpack y DHL, sumando el costo al ticket y facilitando la generación de guías.',
              },
              {
                q: '¿Cómo pagan los clientes en las tiendas de Ark Commerce?',
                a: 'Mediante transferencia bancaria inmediata por SPEI (con botón de copia de CLABE en 1 clic y confirmación bancaria), pago contra entrega en entregas locales, o tarjetas de crédito/débito.',
              },
              {
                q: '¿Cómo funciona el buscador agéntico Ark Concierge?',
                a: 'Nuestra IA en el Edge comprende consultas en lenguaje natural ("quiero playeras del Caribe" o "fuga de gas en la cocina"), consulta el inventario de todas las tiendas y cotiza automáticamente recomendando la mejor opción con enlace directo.',
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
            <span className="font-display font-black text-white">ARK<span className="text-[#B4FF00]">COMMERCE</span></span>
            <span>· Plataforma de Comercio Directo, Tiendas & Servicios en el Sureste Mexicano</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={getWaLink('Hola Ark Commerce! Tengo una consulta sobre la plataforma.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B4FF00] hover:underline"
            >
              Contacto WhatsApp
            </a>
            <span>·</span>
            <a href="/admin/leads.html" className="hover:text-white transition">Panel de Leads</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
