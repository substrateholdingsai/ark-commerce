import React, { useState } from 'react';

export default function ArkLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
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
        .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 48px 48px; }
        @keyframes pulseLima {
          0%, 100% { box-shadow: 0 0 0 0 rgba(180,255,0,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(180,255,0,0); }
        }
        .animate-pulse-lima { animation: pulseLima 2.2s ease-in-out infinite; }
      `}</style>

      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0C0E]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#B4FF00] flex items-center justify-center font-display font-black text-[15px] tracking-wider text-[#0B0C0E] shadow-sm">
              ▲
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                ARK<span className="text-[#B4FF00]">PULSE</span>
              </span>
              <span className="hidden sm:inline-block ml-3 font-mono text-[11px] tracking-widest text-[#7C8590]">
                v1.0 · ARK SYSTEMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/temozonia"
              className="hidden sm:flex h-9 items-center rounded-lg border border-white/10 px-4 font-body text-[12px] font-medium text-[#D2D6DB] hover:border-[#B4FF00] hover:text-[#B4FF00] transition"
            >
              Demo Cliente (Temozonia)
            </a>
            <button
              onClick={() => scrollTo('demo')}
              className="hidden sm:flex h-9 items-center rounded-lg border border-white/10 px-4 font-body text-[12px] font-medium text-[#D2D6DB] hover:bg-white/[0.04] transition"
            >
              Ver Código
            </button>
            <button
              onClick={() => scrollTo('checkout')}
              className="h-9 rounded-lg bg-[#B4FF00] hover:bg-[#C6FF33] px-5 font-display text-[13px] font-bold tracking-wide text-[#0B0C0E] transition lima-glow"
            >
              Comprar Kit $49
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden grid-bg border-b border-white/10">
        <div className="absolute top-1/4 right-[8%] w-32 h-32 rounded-3xl bg-[#B4FF00]/10 border border-[#B4FF00]/20 blur-xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-28">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 sm:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-mono text-[#B4FF00] mb-6">
                <span className="h-2 w-2 rounded-full bg-[#B4FF00] animate-pulse" />
                ARK SYSTEMS DESIGN CANON · 1 HTML • 0 DEPENDENCIAS
              </div>

              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight leading-[0.96]">
                Todo tu inventario, <br />
                <span className="text-[#B4FF00]">un solo pulso.</span>
              </h1>

              <p className="font-body mt-6 max-w-[540px] text-[16px] sm:text-[18px] leading-[1.65] text-[#A7AEB8]">
                El arca que carga tu inventario; el pulso que convierte visitantes en compradores.
                Sin WordPress, sin Shopify, sin cuotas mensuales. 1 archivo, deploy en 3 minutos y cobros instantáneos.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => scrollTo('demo')}
                  className="flex h-[52px] items-center gap-3 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] px-7 font-display text-[14px] font-bold tracking-wide text-[#0B0C0E] transition animate-pulse-lima"
                >
                  Explorar Storefront
                  <span className="font-mono text-base">→</span>
                </button>
                <button
                  onClick={() => scrollTo('checkout')}
                  className="h-[52px] rounded-xl border border-white/20 hover:border-[#B4FF00] hover:text-[#B4FF00] bg-white/[0.03] px-7 font-body text-[14px] font-medium text-white transition"
                >
                  Comprar Kit ($49 USD)
                </button>
              </div>

              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 max-w-xl">
                <div>
                  <div className="font-display text-3xl font-bold text-[#B4FF00] font-mono">10+</div>
                  <div className="text-[#7C8590] text-xs font-body mt-1">Componentes</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-[#B4FF00] font-mono">&lt; 2s</div>
                  <div className="text-[#7C8590] text-xs font-body mt-1">Velocidad carga</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-[#B4FF00] font-mono">100</div>
                  <div className="text-[#7C8590] text-xs font-body mt-1">Lighthouse Score</div>
                </div>
                <div>
                  <div className="font-display text-3xl font-bold text-[#B4FF00] font-mono">$0</div>
                  <div className="text-[#7C8590] text-xs font-body mt-1">Costo servidor</div>
                </div>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="relative lg:pl-6">
              <div className="rounded-2xl border border-white/10 bg-[#1A1D22] p-2.5 shadow-2xl">
                <div className="rounded-xl bg-[#121417] border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 h-[44px]">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                      <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                      <div className="h-3 w-3 rounded-full bg-[#28CA42]" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#7C8590]">
                      <span>index.html</span>
                      <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#B4FF00]">18.4 KB</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-[11px] font-mono tracking-widest text-[#7C8590] uppercase">
                        Store Engine Activo
                      </div>
                      <div className="h-1.5 w-20 rounded-full bg-white/10">
                        <div className="h-full w-[85%] bg-[#B4FF00] rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-[96px] rounded-xl bg-gradient-to-r from-[#1A1D22] to-[#2A3038] border border-white/10 p-4 flex flex-col justify-end">
                        <span className="font-mono text-[10px] text-[#B4FF00] tracking-widest uppercase">ARK PULSE ENGINE</span>
                        <span className="font-display text-xl font-bold text-white">Vende productos en minutos</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-20 rounded-xl bg-[#1A1D22] border border-white/5 p-2.5 flex flex-col justify-between">
                          <span className="text-[11px] text-[#A7AEB8]">01. SnS</span>
                          <span className="font-mono text-xs font-bold text-[#B4FF00]">$299 MXN</span>
                        </div>
                        <div className="h-20 rounded-xl bg-[#1A1D22] border border-white/5 p-2.5 flex flex-col justify-between">
                          <span className="text-[11px] text-[#A7AEB8]">02. Drop</span>
                          <span className="font-mono text-xs font-bold text-[#B4FF00]">Lightning</span>
                        </div>
                        <div className="h-20 rounded-xl bg-[#1A1D22] border border-white/5 p-2.5 flex flex-col justify-between">
                          <span className="text-[11px] text-[#A7AEB8]">03. Agenda</span>
                          <span className="font-mono text-xs font-bold text-[#B4FF00]">Stripe</span>
                        </div>
                      </div>

                      <button
                        onClick={() => scrollTo('checkout')}
                        className="mt-2 h-11 w-full rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] font-display text-[13px] font-bold text-[#0B0C0E] transition"
                      >
                        Comprar Kit $49 USD
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES DEL SISTEMA */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs text-[#B4FF00] tracking-widest uppercase mb-2">01 · FUNDACIONES</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
              El problema es simple. <br />
              <span className="text-[#55606B]">La solución también.</span>
            </h2>
          </div>
          <p className="hidden sm:block max-w-[320px] text-[13px] leading-[1.6] text-[#7C8590]">
            Deja de vender webs de $300/mes que nadie mantiene. Vende activos de 1 archivo respaldados por Ark Systems.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: '01',
              title: 'Presencia digital rápida con imagen premium',
              desc: 'Plantillas oscuras arquitectónicas, tipografía Space Grotesk + Inter y contrastes precisos. Pareces SnS Grills, no un theme genérico.',
              bullets: ['Space Grotesk + Inter', 'Color Lima en CTAs estratégicos', 'Mobile first 390px perfecto'],
            },
            {
              n: '02',
              title: 'Pasarela de cobro multi-método instantánea',
              desc: 'El mismo archivo cobra. Sin plugins pesados. Vincula tu link de Stripe, Mercado Pago, PayPal o BTCPay Server.',
              bullets: ['Stripe Payment Links', 'Mercado Pago + OXXO offline', 'Bitcoin Lightning 0% comisiones'],
            },
            {
              n: '03',
              title: 'Escalable y gratis en Cloudflare',
              desc: 'Un archivo o Worker estático. Dominio propio en 60s. El cliente puede duplicarlo 100 veces sin pagar más hosting.',
              bullets: ['Cloudflare Workers & Vercel', '0 base de datos obligatoria', 'Duplicable por nicho local'],
            },
          ].map((o) => (
            <div
              key={o.n}
              className="rounded-2xl border border-white/10 bg-[#121417] p-7 hover:border-[#B4FF00]/40 transition group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-[#7C8590]">{o.n}</span>
                <span className="h-7 w-7 rounded-lg bg-white/5 grid place-items-center text-xs text-[#B4FF00]">▲</span>
              </div>
              <h3 className="font-display text-xl font-bold">{o.title}</h3>
              <p className="font-body mt-3 text-sm leading-[1.65] text-[#A7AEB8]">{o.desc}</p>
              <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                {o.bullets.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-xs text-[#D2D6DB]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B4FF00]" />
                    {b}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO CODE */}
      <section id="demo" className="border-y border-white/10 bg-[#121417]">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="rounded-2xl border border-white/10 bg-[#0B0C0E] overflow-hidden">
            <div className="flex items-center justify-between px-5 h-[48px] border-b border-white/10 bg-[#1A1D22]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D2D6DB]">
                <span className="h-2 w-2 rounded-full bg-[#B4FF00]" />
                CONFIG — Edita esto, vende eso
              </div>
              <div className="font-mono text-[10px] text-[#7C8590]">INDEX.HTML</div>
            </div>
            <pre className="p-6 text-[13px] leading-[1.7] overflow-x-auto font-mono text-[#D2D6DB]">
{`const CONFIG = {
  // Negocio
  nombre: "Tacos El Fuego - Suc. Centro",
  tagline: "Al pastor 24h con tortilla de maíz azul",
  precio: 299,
  moneda: "MXN",

  // Checkout: pega tus links
  checkout: {
    stripe: "https://buy.stripe.com/...",
    mercadopago: "https://mpago.la/...",
    btcPay: "https://btcpay.tu-dominio.com/...",
    paypal: "https://paypal.me/..."
  },

  // Identidad visual (Canon Ark Pulse)
  colores: { primario: "#B4FF00", fondo: "#0B0C0E" },
  whatsapp: "5215512345678"
};

// 1 archivo. 0 build. 0 dolor de cabeza.`}
            </pre>
            <div className="flex items-center gap-2 px-5 py-3 border-t border-white/10 bg-[#1A1D22] text-xs font-mono text-[#7C8590]">
              <span className="bg-[#B4FF00]/10 text-[#B4FF00] px-2 py-0.5 rounded text-[10px] font-bold">✓ VALIDADO</span>
              Listo para producción en Cloudflare
            </div>
          </div>

          <div className="lg:sticky lg:top-[90px]">
            <p className="font-mono text-xs text-[#B4FF00] tracking-widest uppercase mb-2">02 · PROCESO</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
              Edita 6 líneas. <br />
              Entrega en 3 minutos.
            </h2>
            <div className="mt-8 space-y-6">
              {[
                {
                  t: '1. Duplica el template',
                  d: 'Abre index.html. No hay npm requerido, no hay dependencias frágiles.',
                },
                {
                  t: '2. Pega tus links de cobro',
                  d: 'Stripe Payment Link en 2 clics. Mercado Pago con OXXO automático. BTCPay para Lightning.',
                },
                {
                  t: '3. Deploy a Cloudflare o Vercel',
                  d: 'Arrastra la carpeta. Asigna el dominio del cliente en 60 segundos y factura tu margen.',
                },
              ].map((o) => (
                <div key={o.t} className="flex gap-4">
                  <div className="mt-1 h-6 w-6 shrink-0 rounded-lg bg-[#B4FF00] grid place-items-center font-display text-[12px] font-bold text-[#0B0C0E]">
                    ✓
                  </div>
                  <div>
                    <div className="font-display text-base font-bold text-white">{o.t}</div>
                    <div className="font-body mt-1 text-sm text-[#A7AEB8]">{o.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-[#B4FF00]/30 bg-[#B4FF00]/10 p-5 flex gap-4">
              <span className="font-display text-2xl text-[#B4FF00]">⚡</span>
              <p className="font-body text-xs leading-[1.6] text-[#E8EAED]">
                <strong className="text-white">Margen 90%:</strong> Cobras $3,500 – $8,000 MXN por landing a negocios locales. Tu costo: $0 hosting + 30 min de personalización.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 TEMPLATES BASE */}
      <section className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="font-mono text-xs text-[#B4FF00] tracking-widest uppercase mb-2">03 · CATÁLOGO</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
              5 templates base listos para clonar
            </h2>
          </div>
          <span className="font-mono text-xs text-[#7C8590]">Cada uno = 1 archivo independiente</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              name: 'Físico / Restaurante',
              tag: 'SnS STYLE',
              desc: 'Menú, fotos full-bleed, reserva + pago. Como Temozonia ahumados.',
              accent: '#B4FF00',
            },
            {
              name: 'Digital / Producto',
              tag: 'E-COMM 1-SKU',
              desc: 'Un producto hero, variantes y checkout directo sin fricción.',
              accent: '#A7AEB8',
            },
            {
              name: 'Info-producto',
              tag: 'CURSO / EBOOK',
              desc: 'Video VSL, módulos temáticos, garantía y pagos en cuotas.',
              accent: '#B4FF00',
            },
            {
              name: 'Reserva / Servicio',
              tag: 'AGENDA',
              desc: 'Calendario, WhatsApp, anticipo con Stripe para clínicas y gimnasios.',
              accent: '#E8EAED',
            },
            {
              name: 'Waitlist / Drop',
              tag: 'HYPE',
              desc: 'Contador regresivo, lista de espera y cobro anticipado Lightning.',
              accent: '#C6FF33',
            },
          ].map((o) => (
            <div key={o.name} className="rounded-2xl border border-white/10 bg-[#121417] p-5 flex flex-col justify-between">
              <div>
                <div className="h-[100px] rounded-xl bg-[#1A1D22] border border-white/5 p-3.5 flex flex-col justify-between mb-4">
                  <span className="font-mono text-[9px] tracking-widest text-[#B4FF00] uppercase font-bold">{o.tag}</span>
                  <div className="h-6 w-full rounded bg-white/5" />
                </div>
                <div className="font-display text-sm font-bold">{o.name}</div>
                <div className="font-body mt-2 text-xs leading-[1.5] text-[#7C8590]">{o.desc}</div>
              </div>
              <button
                onClick={() => showToast(`Template ${o.name} listo en el kit`)}
                className="mt-5 h-8 rounded-lg border border-white/10 hover:border-[#B4FF00] hover:text-[#B4FF00] font-mono text-[11px] text-[#A7AEB8] transition"
              >
                Ver Estructura
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARATIVA */}
      <section className="border-y border-white/10 bg-[#0B0C0E]">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 sm:py-24">
          <h3 className="font-display text-center text-3xl sm:text-4xl font-bold tracking-tight">
            ¿Por qué 1 HTML le gana a todo?
          </h3>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#121417]">
            <table className="w-full min-w-[760px] text-xs font-body">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] tracking-widest text-[#7C8590] uppercase">
                  <th className="text-left font-medium px-6 py-4">Criterio</th>
                  <th className="text-left font-bold px-6 py-4 text-[#B4FF00] bg-white/[0.02]">
                    ARK PULSE (1 HTML)
                  </th>
                  <th className="text-left font-medium px-6 py-4 text-[#7C8590]">WordPress</th>
                  <th className="text-left font-medium px-6 py-4 text-[#7C8590]">Shopify</th>
                  <th className="text-left font-medium px-6 py-4 text-[#7C8590]">Carrd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#D2D6DB]">
                {[
                  ['Peso / Velocidad', '18 KB, <2s, 100 Lighthouse', '2-5 MB, plugins lentos', '1-3 MB, scripts pesados', '50 KB pero limitado'],
                  ['Costo mensual', '$0 hosting Cloudflare / Vercel', '$10-30 host + plugins', '$29-79 + comisiones', '$19/año pro'],
                  ['Tiempo deploy', '3 minutos drag & drop', '1-2 horas setup', '2-4 horas', '15 min pero sin pagos MX'],
                  ['Pasarelas México', 'Stripe + MP + OXXO + BTCPay', 'Plugin MP extra $', 'Solo Stripe, no OXXO', 'Solo Stripe/PayPal'],
                  ['Mantenimiento', 'Cero, es un HTML', 'Actualizaciones semanales', 'Apps que rompen', 'Nulo'],
                  ['Propiedad cliente', 'Archivo entregable 100%', 'Depende de host', 'Cerrado', 'Cerrado'],
                ].map(([o, u, a, c, m]) => (
                  <tr key={o}>
                    <td className="px-6 py-4 font-semibold text-white">{o}</td>
                    <td className="px-6 py-4 font-bold text-[#B4FF00] bg-white/[0.02]">{u}</td>
                    <td className="px-6 py-4 text-[#7C8590]">{a}</td>
                    <td className="px-6 py-4 text-[#7C8590]">{c}</td>
                    <td className="px-6 py-4 text-[#7C8590]">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CHECKOUT DOGFOODING */}
      <section id="checkout" className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <div className="inline-flex rounded-md bg-[#B4FF00] text-[#0B0C0E] px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase">
              CHECKOUT DIRECTO
            </div>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl font-bold leading-tight">
              El mismo sistema que vendes es el que te cobra a ti.
            </h2>
            <p className="font-body mt-4 text-sm leading-[1.7] text-[#A7AEB8]">
              Sin backend oculto ni pasarelas complejas. Cada botón es un Payment Link verificado.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#121417] p-5">
              <div className="font-mono text-xs tracking-widest text-[#B4FF00] uppercase mb-3">El kit incluye:</div>
              <ul className="space-y-2.5 text-xs text-[#D2D6DB]">
                <li className="flex gap-2.5">
                  <span className="text-[#B4FF00]">✓</span> 5 templates HTML listos + guía de deploy en 3 min
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#B4FF00]">✓</span> Snippets de cobro para Stripe, Mercado Pago, BTCPay y PayPal
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#B4FF00]">✓</span> Script de prospección para negocios locales vía WhatsApp
                </li>
                <li className="flex gap-2.5">
                  <span className="text-[#B4FF00]">✓</span> Licencia comercial: revende sin límite de clientes
                </li>
              </ul>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                name: 'Stripe Payment Link',
                desc: 'Tarjeta global, Apple Pay y Link. Cobro en USD o MXN.',
                badge: 'RECOMENDADO GLOBAL',
                cta: 'Pagar con Stripe',
              },
              {
                name: 'Mercado Pago',
                desc: 'OXXO offline, SPEI, tarjetas y meses sin intereses en México.',
                badge: 'MEJOR CONVERSIÓN MX',
                cta: 'Pagar con Mercado Pago',
              },
              {
                name: 'BTCPay Server',
                desc: 'Bitcoin on-chain + Lightning Network con 0% comisiones.',
                badge: '0% FEES + LIGHTNING',
                cta: 'Pagar con Bitcoin',
              },
              {
                name: 'PayPal Checkout',
                desc: 'Para clientes internacionales sin tarjeta de crédito.',
                badge: 'INTERNACIONAL',
                cta: 'Pagar con PayPal',
              },
            ].map((o) => (
              <div key={o.name} className="rounded-2xl border border-white/10 bg-[#121417] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-bold text-sm text-white">{o.name}</span>
                    <span className="font-mono text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[#B4FF00]">
                      {o.badge}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#7C8590] leading-[1.6] min-h-[40px]">{o.desc}</p>
                </div>
                <button
                  onClick={() => showToast(`${o.name}: Listo para vincular en CONFIG`)}
                  className="mt-5 h-11 w-full rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] font-display text-xs font-bold text-[#0B0C0E] transition"
                >
                  {o.cta} — $49 USD
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[860px] px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="font-display text-center text-3xl sm:text-4xl font-bold">
          Preguntas Frecuentes
        </h2>

        <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#121417] overflow-hidden">
          {[
            {
              q: '¿Necesito saber programar?',
              a: 'No. Solo editas el bloque CONFIG al inicio del archivo HTML. Es como rellenar un formulario: nombre, precio, links de pago y número de WhatsApp.',
            },
            {
              q: '¿Cómo hospedo gratis en Cloudflare o Vercel?',
              a: 'Arrastras la carpeta al dashboard de Cloudflare Pages o Vercel. Te genera una URL gratuita de inmediato o vinculas el dominio personalizado de tu cliente en 60 segundos.',
            },
            {
              q: '¿Cómo funciona el cobro por OXXO y SPEI?',
              a: 'Es automático con Mercado Pago Link: en tu cuenta activas “Medios offline” y el comprador recibe su código de barras OXXO en el checkout sin tocar código.',
            },
            {
              q: '¿Cómo coexisten las tiendas clientes como Temozonia?',
              a: 'Temozonia es un cliente que corre sobre la infraestructura multi-tenant de Ark Systems. Cada cliente puede tener su propio catálogo, carrito y diseño temático mientras Ark gestiona la plataforma.',
            },
            {
              q: '¿Puedo revender el kit ilimitadamente?',
              a: 'Sí. La licencia comercial te permite crear y vender tantas tiendas y landings como quieras a clientes locales sin pagar regalías.',
            },
          ].map((o, idx) => (
            <div key={o.q}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition"
              >
                <span className="font-display text-sm sm:text-base font-bold text-white">{o.q}</span>
                <span className="font-mono text-sm text-[#B4FF00]">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 font-body text-xs sm:text-sm text-[#A7AEB8] leading-[1.65]">
                  {o.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0B0C0E] py-10 text-xs font-body text-[#7C8590]">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-sm">ARK<span className="text-[#B4FF00]">PULSE</span></span>
            <span>· Ark Systems Multi-Tenant Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/temozonia" className="hover:text-[#B4FF00] transition">
              Tienda Demo (Temozonia)
            </a>
            <a href="/admin" className="hover:text-[#B4FF00] transition">
              Panel Admin
            </a>
          </div>
          <div>© {new Date().getFullYear()} Ark Systems. Todos los derechos reservados.</div>
        </div>
      </footer>

      {/* FLOATING TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[#B4FF00] px-5 py-2 text-xs font-display font-bold text-[#0B0C0E] shadow-2xl z-[80] animate-bounce">
          ⚡ {toast}
        </div>
      )}
    </div>
  );
}
