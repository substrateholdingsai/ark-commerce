import React, { useState } from 'react';

const WHATSAPP_NUMBER = '529994918221';

const RETAIL_CATEGORIES = [
  {
    id: 'gastro',
    icon: '🥩',
    title: 'Alimentos & Empacados',
    subtitle: 'Carnes, salsas, quesos y botanas',
    sampleStore: 'ahumadosdelnorte.ark.mx',
    products: [
      { name: 'Brisket Ahumado 1kg', price: '$420', desc: 'Ahumado 10h con leña de mezquite' },
      { name: 'Costillas BBQ 1kg', price: '$380', desc: 'Glaseado artesanal de la casa' },
      { name: 'Salsa Habanera Tatemada', price: '$95', desc: 'Frasco 250ml sin conservadores' },
    ],
    whatsappPreview: 'Hola! Quiero pedir 1x Brisket 1kg + 1x Salsa Tatemada. Total: $515 MXN. Ya te transferí por SPEI.',
  },
  {
    id: 'cafe',
    icon: '☕',
    title: 'Café & Artesanales',
    subtitle: 'Café de especialidad, miel y mezcal',
    sampleStore: 'cafedealtura.ark.mx',
    products: [
      { name: 'Café Chiapas Tostado 500g', price: '$210', desc: 'Notas a chocolate amargo y avellana' },
      { name: 'Miel Virgen de Flor 350g', price: '$140', desc: '100% pura de apiario artesanal' },
      { name: 'Mezcal Espadín 750ml', price: '$490', desc: 'Artesanal 45° de Oaxaca' },
    ],
    whatsappPreview: 'Hola! Quiero 2x Café Chiapas 500g. Total: $420 MXN. Copié tu CLABE para transferir.',
  },
  {
    id: 'postres',
    icon: '🧁',
    title: 'Repostería & Eventos',
    subtitle: 'Pasteles, galletas y mesas dulces',
    sampleStore: 'dulcecanela.ark.mx',
    products: [
      { name: 'Pastel Red Velvet 10 pax', price: '$480', desc: 'Betún de queso crema artesanal' },
      { name: 'Caja 12 Galletas Chispas', price: '$220', desc: 'Rellenas de chocolate belga' },
      { name: 'Crumble de Manzana', price: '$340', desc: 'Horneado al día con canela de varita' },
    ],
    whatsappPreview: 'Hola! Quiero encargar 1x Pastel Red Velvet para el sábado. Total: $480 MXN.',
  },
  {
    id: 'moda',
    icon: '🧢',
    title: 'Streetwear & Moda',
    subtitle: 'Gorras, sneakers y marcas de autor',
    sampleStore: 'nortehype.ark.mx',
    products: [
      { name: 'Gorra Trucker Edición Limitada', price: '$550', desc: 'Bordado 3D de alta densidad' },
      { name: 'Heavyweight Tee Black', price: '$450', desc: 'Algodón peinado 240g corte boxy' },
      { name: 'Cadena Plata .925 Cubana', price: '$890', desc: 'Eslabón cerrado hecha en Taxco' },
    ],
    whatsappPreview: 'Hola! Me interesa la Gorra Trucker y la Tee Talla L. Total: $1,000 MXN. Pago con tarjeta.',
  },
  {
    id: 'belleza',
    icon: '💈',
    title: 'Belleza & Barber Supply',
    subtitle: 'Pomadas, aceites y kits de cuidado',
    sampleStore: 'barberiasupreme.ark.mx',
    products: [
      { name: 'Pomada Matte Clay 100g', price: '$220', desc: 'Fijación alta sin brillo' },
      { name: 'Aceite para Barba Bergamota', price: '$190', desc: 'Hidratación con jojoba y argán' },
      { name: 'Kit Cuidado Completo', price: '$499', desc: 'Shampoo + Aceite + Cera moldeadora' },
    ],
    whatsappPreview: 'Hola! Quiero el Kit Cuidado Completo. Total: $499 MXN. Paso por él a la sucursal.',
  },
];

export default function ArkLanding() {
  const [selectedCat, setSelectedCat] = useState(RETAIL_CATEGORIES[0]);
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
                ARK<span className="text-[#B4FF00]">COMMERCE</span>
              </span>
              <span className="hidden sm:inline-block ml-3 font-mono text-[11px] tracking-widest text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded border border-[#B4FF00]/20">
                $299/MES · 0% COMISIÓN
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#A7AEB8]">
            <button onClick={() => scrollTo('rubros')} className="hover:text-white transition">Giros de negocio</button>
            <button onClick={() => scrollTo('comparativa')} className="hover:text-white transition">Comparativa</button>
            <button onClick={() => scrollTo('pagos')} className="hover:text-white transition">Métodos de pago</button>
            <button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition">Cómo funciona</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-white transition">Preguntas</button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={getWaLink('Hola Ark! Quiero pedir mi tienda en línea de $299/mes para mi negocio.')}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] px-5 flex items-center font-display text-[13px] font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
            >
              Pedir por WhatsApp →
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
                <span>🇲🇽</span> HECHO EN MÉXICO PARA COBRAR EN MÉXICO
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.02]">
                Tu tienda que vende y cobra por WhatsApp.{' '}
                <span className="text-[#B4FF00] block mt-1">$299 al mes.</span>
              </h1>

              <p className="font-body mt-6 text-[16px] sm:text-[18px] leading-[1.65] text-[#A7AEB8] max-w-xl">
                En México no se compra con carritos lentos en dólares. Se vende por Instagram y se cobra por <strong className="text-white">SPEI directo a tu banco</strong>.
                Ark te entrega tu tienda online lista en 5 minutos con tu catálogo, tus fotos y tus pedidos ordenados en tu WhatsApp.
              </p>

              {/* Badges de nocaut */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono font-semibold text-zinc-300">
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> 0% Comisiones por venta
                </span>
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> Tu dinero directo a tu CLABE
                </span>
                <span className="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[#B4FF00]">✓</span> Lista hoy en 5 minutos
                </span>
              </div>

              {/* Botones de acción */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={getWaLink('Hola Ark! Quiero activar mi tienda online por $299/mes.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 px-8 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] flex items-center justify-center font-display text-base font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
                >
                  🚀 Quiero mi tienda por $299/mes
                </a>
                <button
                  onClick={() => scrollTo('rubros')}
                  className="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition"
                >
                  Ver tiendas activas ↓
                </button>
              </div>

              <p className="mt-4 text-xs text-[#7C8590] font-mono">
                Sin contratos forzosos · Cancela cuando quieras · Soporte directo por WhatsApp
              </p>
            </div>

            {/* Mockup Interactivo de la Tienda */}
            <div className="relative">
              <div className="relative rounded-2xl border border-white/15 bg-[#121417] p-5 sm:p-6 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-xs text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/5">
                      tunegocio.ark.mx
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded">
                    EN LÍNEA
                  </span>
                </div>

                {/* Tienda simulada */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-sm text-white">Carne Ahumada al Vacío 1kg</div>
                      <div className="text-xs text-[#7C8590]">Empacado listo para calentar</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#B4FF00] text-sm">$380 MXN</div>
                      <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded">1 pza</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-sm text-white">Costillas BBQ Ahumadas 1kg</div>
                      <div className="text-xs text-[#7C8590]">Cocción lenta de 6 horas</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#B4FF00] text-sm">$420 MXN</div>
                      <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded">1 pza</span>
                    </div>
                  </div>

                  {/* Caja de Checkout SPEI en 1 Clic */}
                  <div className="rounded-xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#A7AEB8] font-mono">TOTAL PEDIDO:</span>
                      <span className="font-mono font-black text-lg text-[#B4FF00]">$800 MXN</span>
                    </div>

                    <div className="bg-[#0B0C0E] border border-white/10 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <span className="text-zinc-500 block text-[10px]">CLABE SPEI (BBVA):</span>
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
                      href={getWaLink('Hola! Hice un pedido de $800 MXN en tunegocio.ark.mx. Ya copié tu CLABE para transferir.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 rounded-lg bg-[#25D366] hover:bg-[#22bf5b] font-bold text-white text-xs flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <span>💬</span> Enviar Pedido a WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          EL DOLOR DEL PDF (Por qué pierdes ventas)
         ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              La fuga silenciosa de clientes
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Deja de mandar el catálogo en PDF.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              El 70% de las ventas por Instagram se caen en el momento en que obligas al cliente a descargar un archivo pesado o le mandas 8 fotos sueltas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Como se hace hoy */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/[0.1] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 text-red-400 font-display font-bold">
                <span className="text-2xl">❌</span>
                <span>Como vendes hoy sin Ark:</span>
              </div>
              <ul className="space-y-3.5 text-sm text-[#A7AEB8]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>El cliente te pide el menú por DM o WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Le mandas un PDF de 25 MB que tarda en abrir o fotos borrosas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Al cliente le da flojera hacer cuentas mentales del total.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>Tienes que dictarle tu CLABE por mensaje (y a veces se equivocan).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <strong className="text-red-300">Resultado: Te dejan en visto y compran en otro lado.</strong>
                </li>
              </ul>
            </div>

            {/* Con Ark */}
            <div className="rounded-2xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 text-[#B4FF00] font-display font-bold">
                <span className="text-2xl">⚡</span>
                <span>Con tu tienda Ark ($299/mes):</span>
              </div>
              <ul className="space-y-3.5 text-sm text-zinc-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Le mandas tu link <code className="text-[#B4FF00] bg-white/5 px-1 py-0.5 rounded">tunegocio.ark.mx</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Abre en 0.2 segundos desde cualquier teléfono sin descargar nada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Selecciona sus productos y la pantalla calcula el total exacto.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <span>Copia tu CLABE con un solo toque y te manda el comprobante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B4FF00] mt-0.5">✓</span>
                  <strong className="text-[#B4FF00]">Resultado: Pedido cerrado y pagado en menos de 2 minutos.</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWCASE DE GIROS (Comercio al Menudeo)
         ========================================================================= */}
      <section id="rubros" className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Adaptable a tu negocio
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Hecho para cualquier comercio al menudeo.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              Si vendes un producto físico y cobras por transferencia o entrega, Ark está diseñado exactamente para ti.
            </p>
          </div>

          {/* Selector de Rubros */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {RETAIL_CATEGORIES.map((cat) => (
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

          {/* Tarjeta del rubro activo */}
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
                Ejemplo: {selectedCat.sampleStore}
              </div>
            </div>

            {/* Lista de productos de ejemplo */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {selectedCat.products.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                  <div>
                    <div className="font-display font-bold text-sm text-white">{p.name}</div>
                    <div className="text-xs text-[#7C8590] mt-1">{p.desc}</div>
                  </div>
                  <div className="font-mono font-bold text-[#B4FF00] text-sm mt-3">{p.price} MXN</div>
                </div>
              ))}
            </div>

            {/* Mensaje que llega a WhatsApp */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-start gap-3">
              <span className="text-xl">💬</span>
              <div>
                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Así te llega el mensaje a tu WhatsApp:
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
          COMPATIBILIDAD DE PAGOS (Cobra como tú quieras)
         ========================================================================= */}
      <section id="pagos" className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Flexibilidad Financiera
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Compatible con todo lo que ya usas hoy.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              No te obligamos a abrir cuentas nuevas ni a firmar contratos con bancos. Tu tienda se adapta a tu forma actual de cobrar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* SPEI */}
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4">
                  🏦
                </div>
                <h3 className="font-display font-bold text-lg text-white">SPEI (Cualquier Banco)</h3>
                <p className="text-xs text-[#A7AEB8] mt-2 leading-relaxed">
                  BBVA, Nu, Banorte, Santander, Hey Banco, Mercado Pago, Citibanamex, HSBC o Banco Azteca.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 font-mono text-[11px] text-[#B4FF00]">
                ✓ Copia tu CLABE en 1 clic
              </div>
            </div>

            {/* Tarjetas */}
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-4">
                  💳
                </div>
                <h3 className="font-display font-bold text-lg text-white">Tarjetas con tu Terminal</h3>
                <p className="text-xs text-[#A7AEB8] mt-2 leading-relaxed">
                  ¿Ya tienes cuenta en Clip, Mercado Pago, Stripe o PayPal? Pegamos tu link de pago directo a tu botón.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 font-mono text-[11px] text-[#B4FF00]">
                ✓ Cero comisiones de Ark
              </div>
            </div>

            {/* Efectivo */}
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-4">
                  🏪
                </div>
                <h3 className="font-display font-bold text-lg text-white">Efectivo & Contra Entrega</h3>
                <p className="text-xs text-[#A7AEB8] mt-2 leading-relaxed">
                  Ideal para entregas a domicilio locales donde el cliente paga al recibir o mediante depósito en OXXO / 7-Eleven.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 font-mono text-[11px] text-[#B4FF00]">
                ✓ Desglose listo para entregar
              </div>
            </div>

            {/* Pagos Digitales / Lightning */}
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4">
                  ⚡
                </div>
                <h3 className="font-display font-bold text-lg text-white">Bitcoin & Lightning (Blink)</h3>
                <p className="text-xs text-[#A7AEB8] mt-2 leading-relaxed">
                  Cobros instantáneos opcionales vía Lightning Network directo a tu billetera con QR dinámico.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 font-mono text-[11px] text-[#B4FF00]">
                ✓ Liquidación en segundos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TABLA COMPARATIVA (Nocaut)
         ========================================================================= */}
      <section id="comparativa" className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Comparativa Implacable
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              ¿Por qué pagar en dólares por cosas que no necesitas?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono uppercase text-[#7C8590]">
                  <th className="py-4 px-4">Opción</th>
                  <th className="py-4 px-4">Costo Mensual</th>
                  <th className="py-4 px-4">Comisiones por Venta</th>
                  <th className="py-4 px-4">Enfoque México (SPEI/WhatsApp)</th>
                  <th className="py-4 px-4">Tiempo de Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-zinc-300">Shopify</td>
                  <td className="py-4 px-4 font-mono">$599+ MXN/mes</td>
                  <td className="py-4 px-4 text-red-400 font-mono">Hasta 2% extra</td>
                  <td className="py-4 px-4 text-zinc-400">Poco adaptado a SPEI</td>
                  <td className="py-4 px-4 text-zinc-400">Tú lo configuras solo</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-zinc-300">Wix / Tiendanube</td>
                  <td className="py-4 px-4 font-mono">$350–$500 MXN/mes</td>
                  <td className="py-4 px-4 text-zinc-400 font-mono">Comisiones según pasarela</td>
                  <td className="py-4 px-4 text-zinc-400">Carritos lentos y pesados</td>
                  <td className="py-4 px-4 text-zinc-400">Días de diseño</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-4 px-4 font-bold text-zinc-300">Agencia Web Tradicional</td>
                  <td className="py-4 px-4 font-mono">$10,000 inicial + $500/mes</td>
                  <td className="py-4 px-4 text-zinc-400 font-mono">Depende de pasarela</td>
                  <td className="py-4 px-4 text-zinc-400">WordPress lento</td>
                  <td className="py-4 px-4 text-zinc-400">3 a 6 semanas</td>
                </tr>
                <tr className="bg-[#B4FF00]/[0.05] border-y-2 border-[#B4FF00]/40 font-bold">
                  <td className="py-5 px-4 font-display text-[#B4FF00] text-base flex items-center gap-2">
                    <span>▲</span> ARK COMMERCE
                  </td>
                  <td className="py-5 px-4 font-mono text-[#B4FF00] text-base">$299 MXN/mes</td>
                  <td className="py-5 px-4 text-emerald-400 font-mono">0% COMISIÓN</td>
                  <td className="py-5 px-4 text-white">SPEI, CLABE en 1 clic y WhatsApp</td>
                  <td className="py-5 px-4 text-[#B4FF00]">Te la entregamos en 5 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CÓMO FUNCIONA (3 pasos)
         ========================================================================= */}
      <section id="como-funciona" className="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Esfuerzo Cero de tu Parte
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Nosotros hacemos la talacha.
            </h2>
            <p className="mt-4 text-[#A7AEB8] text-sm sm:text-base">
              No tienes que aprender a programar ni pelearte con plantillas complejas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-white">Nos mandas tu información</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                Nos pasas por WhatsApp tu logo, tus fotos de producto, tus precios y tu cuenta CLABE para transferencias.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-white">Montamos tu tienda en 5 min</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                Te entregamos tu link oficial <span className="text-[#B4FF00] font-mono">tunegocio.ark.mx</span> con tu catálogo ordenado y listo para cobrar.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-white">Lo pegas en tu Instagram</h3>
              <p className="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                Lo pones en el link de tu biografía y en tus historias. Tus clientes eligen, pagan y el pedido te cae listo a WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING SECTION ($299/mes)
         ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-white/10">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-[#B4FF00] bg-gradient-to-b from-[#161a14] to-[#121417] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#B4FF00] text-[#0B0C0E] font-display font-bold text-[11px] px-4 py-1 rounded-bl-xl tracking-wider uppercase">
              PLAN TODO INCLUIDO
            </div>

            <span className="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
              Acceso Completo
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mt-2">
              $299 <span className="text-base sm:text-lg font-normal text-[#A7AEB8]">MXN / mes</span>
            </h2>
            <p className="mt-2 text-xs text-zinc-400 font-mono">Sin plazos forzosos · Cancela cuando quieras</p>

            <div className="my-8 border-t border-white/10 pt-8 text-left space-y-3.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Tu link propio:</strong> <code className="text-[#B4FF00] font-mono">tunegocio.ark.mx</code></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Catálogo ilimitado</strong> con fotos en alta velocidad</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Copia tu CLABE SPEI</strong> en 1 clic sin errores</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Pedidos organizados</strong> directos a tu WhatsApp</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Panel de control móvil:</strong> cambia precios y stock desde tu celular</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Cero comisiones:</strong> Si vendes $10,000 o $100,000, los $299 son fijos</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#B4FF00]">✓</span>
                <span className="text-zinc-200"><strong>Hosting Cloudflare Edge</strong> que abre al instante y no se cae</span>
              </div>
            </div>

            <a
              href={getWaLink('Hola Ark! Quiero activar mi tienda online por $299/mes.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] font-display font-bold text-base text-[#0B0C0E] flex items-center justify-center gap-2 transition lima-glow active:scale-[0.98]"
            >
              👉 Activar Mi Tienda por $299 al Mes
            </a>

            <p className="mt-4 text-[11px] text-[#7C8590] font-mono">
              Nos mandas tus fotos y te la entregamos funcionando hoy mismo.
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
              Dudas Comunes
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Por qué no cobran comisión por venta?',
                a: 'Porque nosotros cobramos una suscripción fija de software ($299 MXN al mes) por darte la plataforma y el hosting. No somos intermediarios de tus pagos ni tocamos tu dinero; las transferencias de tus clientes van directas a tu banco.',
              },
              {
                q: '¿Tengo que saber programar o diseñar?',
                a: 'Para nada. Tú solo nos mandas tus fotos, nombres de productos y precios por WhatsApp. Nosotros configuramos tu tienda y te entregamos tu link listo en 5 minutos.',
              },
              {
                q: '¿Cómo cambio precios o productos después?',
                a: 'Te damos acceso a un panel administrativo súper sencillo que puedes abrir desde tu celular. En 10 segundos cambias un precio, subes un producto nuevo o marcas uno como agotado.',
              },
              {
                q: '¿Puedo usar mi propio dominio personalizado (ej. mitienda.com)?',
                a: 'Sí. De fábrica te damos tunegocio.ark.mx sin costo adicional, pero si ya compraste tu propio dominio .com o .mx, lo conectamos a tu tienda fácilmente.',
              },
              {
                q: '¿Qué pasa si quiero cancelar?',
                a: 'No hay plazos forzosos. Si un mes no quieres renovar, simplemente nos avisas por WhatsApp y cancelas sin penalizaciones ni letras chiquitas.',
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
            <span>· Hecho en México con tecnología Cloudflare</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={getWaLink('Hola Ark! Tengo una duda sobre el servicio de $299/mes.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#B4FF00] hover:underline"
            >
              Contacto por WhatsApp
            </a>
            <span>·</span>
            <a href="/admin" className="hover:text-white transition">Acceso Admin Tiendas</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
