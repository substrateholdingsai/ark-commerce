import json

# Read the head from current dist/index.html to preserve all SEO, fonts and metatags
with open('dist/index.html', 'r', encoding='utf-8') as f:
    orig = f.read()

head_start = orig.find('<head>')
head_end = orig.find('</head>') + len('</head>')
head_part = orig[head_start:head_end]

# Update page title in head
head_part = head_part.replace(
    'Ark Commerce · Plataforma de E-commerce, Pagos y Envíos por WhatsApp | $299/mes',
    'Ark Oficios · Red de Mantenimiento y Servicios Técnicos con IA | Sureste Mexicano'
)

body_content = '''
  <body class="bg-[#0B0C0E] text-zinc-100 min-h-screen">
    <div id="ark-landing">
      <div class="min-h-screen bg-[#0B0C0E] text-white selection:bg-[#B4FF00] selection:text-[#0B0C0E] antialiased">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
          .font-display { font-family: 'Space Grotesk', sans-serif; }
          .font-body { font-family: 'Inter', sans-serif; }
          .font-mono { font-family: 'JetBrains Mono', monospace; }
          .lima-glow { box-shadow: 0 8px 30px -6px rgba(180,255,0,0.35); }
          .grid-bg { 
            background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); 
            background-size: 40px 40px; 
          }
        </style>

        <!-- =========================================================================
            HEADER
           ========================================================================= -->
        <header class="sticky top-0 z-50 border-b border-white/10 bg-[#0B0C0E]/90 backdrop-blur-xl">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8 h-[68px] flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-xl bg-[#B4FF00] flex items-center justify-center font-display font-black text-[15px] text-[#0B0C0E] shadow-sm">
                ▲
              </div>
              <div>
                <span class="font-display font-black text-lg tracking-tight text-white">
                  ARK<span class="text-[#B4FF00]">OFICIOS</span>
                </span>
                <span class="hidden sm:inline-block ml-3 font-mono text-[11px] tracking-widest text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded border border-[#B4FF00]/20">
                  RED DE MANTENIMIENTO CON IA
                </span>
              </div>
            </div>

            <nav class="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#A7AEB8]">
              <a href="#ai-concierge" class="hover:text-white transition">Cotizador IA</a>
              <a href="#servicios" class="hover:text-white transition">Especialidades</a>
              <a href="#comparativa" class="hover:text-white transition">Garantía Ark</a>
              <a href="#como-funciona" class="hover:text-white transition">Cómo funciona</a>
              <a href="#proveedores" class="hover:text-white transition">Para Técnicos</a>
            </nav>

            <div class="flex items-center gap-3">
              <a
                href="https://wa.me/529994918221?text=Hola%20Ark!%20Tengo%20una%20emergencia%20de%20mantenimiento%20en%20mi%20hogar/negocio."
                target="_blank"
                rel="noopener noreferrer"
                class="h-10 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] px-5 flex items-center font-display text-[13px] font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
              >
                Pedir Técnico por WhatsApp →
              </a>
            </div>
          </div>
        </header>

        <!-- =========================================================================
            HERO SECTION
           ========================================================================= -->
        <section class="relative overflow-hidden grid-bg border-b border-white/10 pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div class="absolute top-1/3 right-[10%] w-72 h-72 rounded-full bg-[#B4FF00]/10 blur-[100px] pointer-events-none"></div>

          <div class="relative mx-auto max-w-[1240px] px-4 sm:px-8">
            <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
              
              <!-- Copy Principal -->
              <div>
                <div class="inline-flex items-center gap-2 rounded-full border border-[#B4FF00]/30 bg-[#B4FF00]/10 px-3.5 py-1 text-xs font-mono font-bold text-[#B4FF00] mb-6">
                  <span>🇲🇽</span> TÉCNICOS VERIFICADOS EN EL SURESTE · EMERGENCIAS Y MANTENIMIENTO
                </div>

                <h1 class="font-display text-4xl sm:text-6xl lg:text-[60px] font-black tracking-tight leading-[1.04]">
                  El técnico que necesitas en tu casa o negocio.{' '}
                  <span class="text-[#B4FF00] block mt-1">Cotizado al instante por IA.</span>
                </h1>

                <p class="font-body mt-6 text-[16px] sm:text-[18px] leading-[1.65] text-[#A7AEB8] max-w-xl">
                  Olvídate de buscar números en postes o esperar horas sin saber cuánto te van a cobrar.
                  Describe tu problema en lenguaje natural; nuestra IA te entrega la cotización real y te conecta de inmediato con un técnico certificado en plomería, gas, climas o electricidad.
                </p>

                <!-- Badges de servicio -->
                <div class="mt-6 flex flex-wrap gap-2 text-xs font-mono font-semibold text-zinc-300">
                  <span class="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span class="text-[#B4FF00]">✓</span> Precios cerrados por catálogo oficial
                  </span>
                  <span class="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span class="text-[#B4FF00]">✓</span> Folio formal con garantía por escrito
                  </span>
                  <span class="bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span class="text-[#B4FF00]">✓</span> Pago directo por SPEI a tu banco
                  </span>
                </div>

                <!-- Botones de acción -->
                <div class="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="#ai-concierge"
                    class="h-14 px-8 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] flex items-center justify-center font-display text-base font-bold text-[#0B0C0E] transition lima-glow active:scale-[0.98]"
                  >
                    🤖 Cotizar mi reparación con IA ↓
                  </a>
                  <a
                    href="https://wa.me/529994918221?text=Hola%20Ark!%20Soy%20t%C3%A9cnico/contratista%20y%20me%20interesa%20unirme%20a%20la%20red%20de%20proveedores."
                    target="_blank"
                    rel="noopener noreferrer"
                    class="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition gap-2"
                  >
                    <span>👨‍🔧 ¿Eres técnico? Únete a la red</span>
                    <span>→</span>
                  </a>
                </div>

                <p class="mt-4 text-xs text-[#7C8590] font-mono">
                  Atención en Mérida, Cancún, Playa del Carmen y Sureste · Técnicos certificados
                </p>
              </div>

              <!-- Mockup Interactivo: Orden de Servicio Baakal -->
              <div class="relative">
                <div class="relative rounded-2xl border border-white/15 bg-[#121417] p-5 sm:p-6 shadow-2xl overflow-hidden">
                  <div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                      <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                      <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                      <span class="ml-2 font-mono text-xs text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/5">
                        baakal.ark.mx · Folio #PLM-2026-0847
                      </span>
                    </div>
                    <span class="font-mono text-[11px] font-bold text-[#B4FF00] bg-[#B4FF00]/10 px-2 py-0.5 rounded">
                      TÉCNICO DISPONIBLE
                    </span>
                  </div>

                  <!-- Servicios de la orden técnica -->
                  <div class="space-y-3">
                    <div class="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                      <div>
                        <div class="font-display font-bold text-sm text-white">Instalación de Boiler / Calentador</div>
                        <div class="text-xs text-[#7C8590]">Incluye prueba de hermeticidad y sellado de gas</div>
                      </div>
                      <div class="text-right">
                        <div class="font-mono font-bold text-[#B4FF00] text-sm">$1,250 MXN</div>
                        <span class="text-[10px] text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded">Servicio</span>
                      </div>
                    </div>

                    <div class="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                      <div>
                        <div class="font-display font-bold text-sm text-white">Prueba de Presión Hidráulica</div>
                        <div class="text-xs text-[#7C8590]">Verificación con manómetro calibrado</div>
                      </div>
                      <div class="text-right">
                        <div class="font-mono font-bold text-[#B4FF00] text-sm">$450 MXN</div>
                        <span class="text-[10px] text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded">Diagnóstico</span>
                      </div>
                    </div>

                    <!-- Caja de Formalización SPEI en 1 Clic -->
                    <div class="rounded-xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-4 space-y-3">
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-[#A7AEB8] font-mono">TOTAL ESTIMADO ORDEN:</span>
                        <span class="font-mono font-black text-lg text-[#B4FF00]">$1,700 MXN</span>
                      </div>

                      <div class="bg-[#0B0C0E] border border-white/10 rounded-lg p-2.5 flex items-center justify-between text-xs">
                        <div class="truncate pr-2">
                          <span class="text-zinc-500 block text-[10px]">CLABE SPEI (BBVA Oficial):</span>
                          <span class="font-mono text-zinc-200">0121 8001 2345 6789 01</span>
                        </div>
                        <button
                          id="btn-copy-clabe"
                          class="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition shrink-0"
                        >
                          Copiar
                        </button>
                      </div>

                      <a
                        href="https://wa.me/529994918221?text=Hola%20Baakal!%20Solicito%20formalizar%20la%20orden%20t%C3%A9cnica%20%23PLM-2026-0847%20por%20%241%2C700%20MXN.%20Ya%20tengo%20mi%20ubicaci%C3%B3n%20lista."
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-full h-11 rounded-lg bg-[#25D366] hover:bg-[#22bf5b] font-bold text-white text-xs flex items-center justify-center gap-2 shadow-md transition"
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

        <!-- =========================================================================
            SECCIÓN DEL ASISTENTE AGÉNTICO IA (ARK CONCIERGE)
           ========================================================================= -->
        <section id="ai-concierge" class="py-16 sm:py-20 border-b border-white/10 bg-[#0E1013] relative overflow-hidden">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8">
            <div class="w-full bg-[#121417] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <!-- Header del Concierge -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-[#B4FF00] animate-pulse"></span>
                  <span class="font-mono text-xs font-bold text-[#B4FF00] tracking-wider uppercase">
                    ARK CONCIERGE · COTIZADOR TÉCNICO CON IA
                  </span>
                </div>
                <span class="text-[11px] font-mono text-zinc-400">EN VIVO EN EL SURESTE</span>
              </div>

              <h3 class="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                ¿Qué avería o reparación necesitas solucionar hoy?
              </h3>
              <p class="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
                Describe tu problema en lenguaje natural (ej: fuga de gas, agua desbordada, clima sin enfriar). Nuestra IA consulta el catálogo oficial de técnicos verificados y te cotiza al instante.
              </p>

              <!-- Input de Búsqueda Conversacional -->
              <div class="relative flex flex-col sm:flex-row gap-2.5">
                <input
                  id="concierge-query-input"
                  type="text"
                  placeholder="Ej: Tengo una fuga de gas en la estufa, se tapó el drenaje del baño, mantenimiento de clima..."
                  class="flex-1 bg-[#0B0C0E] border border-white/15 focus:border-[#B4FF00] rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition font-sans"
                />
                <button
                  id="concierge-submit-btn"
                  class="h-12 px-6 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0C0E] font-display font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] whitespace-nowrap shadow-sm"
                >
                  <span id="concierge-btn-text">Cotizar con IA</span>
                  <span id="concierge-btn-arrow">&rarr;</span>
                  <svg id="concierge-btn-spinner" class="animate-spin h-4 w-4 text-[#0B0C0E] hidden" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                </button>
              </div>

              <!-- Sugerencias Rápidas -->
              <div class="mt-4 flex flex-wrap gap-2 items-center">
                <span class="text-[11px] font-mono text-zinc-500 mr-1">Prueba con:</span>
                <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Tengo una fuga urgente de gas LP en la cocina y huele fuerte">
                  🚨 Fuga urgente de gas o agua
                </button>
                <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Necesito instalación de calentador de agua con prueba de presión">
                  🚿 Boiler no calienta o instalación
                </button>
                <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="El drenaje del baño está completamente tapado y se regresa el agua">
                  🛠️ Drenaje tapado en baño o cocina
                </button>
                <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Requiero servicio de limpieza profunda y recarga de gas para minisplit">
                  ❄️ Mantenimiento y lavado de minisplit
                </button>
              </div>

              <!-- Error Container -->
              <div id="concierge-error-box" class="mt-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono hidden">
                &warning; <span id="concierge-error-msg"></span>
              </div>

              <!-- Resultado de la IA: Card del Proveedor Recomendado -->
              <div id="concierge-result-card" class="mt-6 p-5 sm:p-6 rounded-xl bg-gradient-to-b from-[#181C22] to-[#0E1013] border border-[#B4FF00]/30 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hidden">
                <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div class="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#B4FF00]">
                    <span>&check;</span> TÉCNICO Y COTIZACIÓN ASIGNADA
                  </div>
                  <span class="text-xs font-mono text-zinc-400 uppercase">Tarifa Oficial en D1</span>
                </div>

                <p id="concierge-result-explanation" class="text-sm text-zinc-200 leading-relaxed mb-4"></p>

                <div class="bg-[#0B0C0E] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div id="concierge-vendor-name" class="font-display text-lg font-bold text-white"></div>
                    <div id="concierge-vendor-services" class="text-xs text-zinc-400 mt-0.5"></div>
                  </div>

                  <div class="flex items-center gap-4 sm:border-l sm:border-white/10 sm:pl-5">
                    <div class="text-left sm:text-right">
                      <div class="text-[10px] font-mono text-zinc-400 uppercase">Tarifa Oficial</div>
                      <div class="font-mono text-xl font-bold text-[#B4FF00]">
                        <span id="concierge-vendor-price">$0.00</span>
                        <span class="text-xs text-zinc-400 font-normal"> MXN</span>
                      </div>
                    </div>

                    <a
                      id="concierge-vendor-cta"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="h-10 px-4 rounded-lg bg-[#B4FF00] hover:bg-[#C6FF33] text-[#0B0C0E] font-display font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap active:scale-[0.98]"
                    >
                      <span>Ver y Agendar</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- =========================================================================
            EL DOLOR DEL TÉCNICO INFORMAL
           ========================================================================= -->
        <section id="comparativa" class="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
              <span class="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
                La pesadilla de las reparaciones
              </span>
              <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
                Deja de contratar técnicos del poste o de grupos de Facebook.
              </h2>
              <p class="mt-4 text-[#A7AEB8] text-sm sm:text-base">
                El 80% de los cobros abusivos y malas reparaciones en el hogar ocurren por técnicos sin verificación que inventan precios sobre la marcha y desaparecen sin dar garantía.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <!-- El técnico informal -->
              <div class="rounded-2xl border border-red-500/20 bg-red-950/[0.1] p-6 sm:p-8">
                <div class="flex items-center gap-3 mb-4 text-red-400 font-display font-bold">
                  <span class="text-2xl">❌</span>
                  <span>Con el técnico informal tradicional:</span>
                </div>
                <ul class="space-y-3.5 text-sm text-[#A7AEB8]">
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-0.5">•</span>
                    <span>Te dice "llego en 20 minutos" y aparece 4 horas después (o nunca).</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-0.5">•</span>
                    <span>No te da precio cerrado hasta que ya desarmó tu pared o tubería.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-0.5">•</span>
                    <span>Usa piezas de segunda mano o pegamento improvisado.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-0.5">•</span>
                    <span>Si la fuga regresa al día siguiente, bloquea tu número.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-red-400 mt-0.5">•</span>
                    <strong class="text-red-300">Resultado: Pagas doble y tu casa se sigue inundando.</strong>
                  </li>
                </ul>
              </div>

              <!-- Con Ark Oficios -->
              <div class="rounded-2xl border border-[#B4FF00]/30 bg-[#B4FF00]/[0.03] p-6 sm:p-8">
                <div class="flex items-center gap-3 mb-4 text-[#B4FF00] font-display font-bold">
                  <span class="text-2xl">⚡</span>
                  <span>Con la Red Ark Oficios:</span>
                </div>
                <ul class="space-y-3.5 text-sm text-zinc-200">
                  <li class="flex items-start gap-2">
                    <span class="text-[#B4FF00] mt-0.5">✓</span>
                    <span>Nuestra IA te da el <strong>precio oficial de catálogo</strong> antes de que salga la unidad.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-[#B4FF00] mt-0.5">✓</span>
                    <span>Técnicos equipados con herramienta industrial (detector de gas, cámara y sonda).</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-[#B4FF00] mt-0.5">✓</span>
                    <span>Folio formal de servicio numerado (#PLM-2026-...) con orden por WhatsApp.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-[#B4FF00] mt-0.5">✓</span>
                    <span>Pagas por SPEI con CLABE bancaria verificada o tarjeta al terminar.</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-[#B4FF00] mt-0.5">✓</span>
                    <strong class="text-[#B4FF00]">Resultado: Fuga o avería solucionada con garantía por escrito.</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- =========================================================================
            SHOWCASE DE ESPECIALIDADES TÉCNICAS
           ========================================================================= -->
        <section id="servicios" class="py-16 sm:py-24 border-b border-white/10">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8">
            <div class="text-center max-w-2xl mx-auto mb-12">
              <span class="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
                Catálogo de Especialidades
              </span>
              <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
                Especialistas en mantenimiento para casa y empresa.
              </h2>
              <p class="mt-4 text-[#A7AEB8] text-sm sm:text-base">
                Cada especialidad cuenta con estándares técnicos rigurosos, tarifas transparentes y herramientas industriales.
              </p>
            </div>

            <!-- Selector de Especialidades -->
            <div class="flex flex-wrap justify-center gap-2 mb-10" id="trade-tabs-wrap">
              <button class="trade-tab px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-[#B4FF00] text-[#0B0C0E] shadow-lg shadow-[#B4FF00]/20" data-cat="plomeria">
                <span>🔧</span>
                <span>Plomería & Drenajes</span>
              </button>
              <button class="trade-tab px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white/[0.04] border border-white/10 text-[#A7AEB8] hover:text-white hover:bg-white/[0.08]" data-cat="gas">
                <span>🔥</span>
                <span>Gas LP & Boilers</span>
              </button>
              <button class="trade-tab px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white/[0.04] border border-white/10 text-[#A7AEB8] hover:text-white hover:bg-white/[0.08]" data-cat="climas">
                <span>❄️</span>
                <span>Climas & Minisplits (HVAC)</span>
              </button>
              <button class="trade-tab px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white/[0.04] border border-white/10 text-[#A7AEB8] hover:text-white hover:bg-white/[0.08]" data-cat="electricidad">
                <span>⚡</span>
                <span>Electricidad & Cuadros</span>
              </button>
            </div>

            <!-- Tarjeta de la especialidad activa -->
            <div class="max-w-4xl mx-auto rounded-2xl border border-white/15 bg-[#121417] p-6 sm:p-10 shadow-2xl">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="text-3xl" id="trade-display-icon">🔧</span>
                    <div>
                      <h3 class="font-display font-bold text-xl text-white" id="trade-display-title">Plomería & Drenajes</h3>
                      <p class="text-xs text-[#7C8590]" id="trade-display-sub">Fugas de agua, tinacos y bombas</p>
                    </div>
                  </div>
                </div>
                <div class="font-mono text-xs text-[#B4FF00] bg-[#B4FF00]/10 px-3 py-1.5 rounded-lg border border-[#B4FF00]/20 self-start sm:self-auto" id="trade-display-badge">
                  Proveedor Insignia: baakal.ark.mx
                </div>
              </div>

              <!-- Lista de servicios con tarifas -->
              <div class="grid sm:grid-cols-3 gap-4 mb-6" id="trade-display-services">
                <div class="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                  <div>
                    <div class="font-display font-bold text-sm text-white">Destape de Drenaje con Sonda</div>
                    <div class="text-xs text-[#7C8590] mt-1">Desazolve sin romper pisos ni tuberías</div>
                  </div>
                  <div class="font-mono font-bold text-[#B4FF00] text-sm mt-3">$850 MXN</div>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                  <div>
                    <div class="font-display font-bold text-sm text-white">Detección y Reparación de Fuga</div>
                    <div class="text-xs text-[#7C8590] mt-1">Diagnóstico en tubería de cobre y PPR</div>
                  </div>
                  <div class="font-mono font-bold text-[#B4FF00] text-sm mt-3">$650 MXN</div>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                  <div>
                    <div class="font-display font-bold text-sm text-white">Tinaco o Bomba Presurizadora</div>
                    <div class="text-xs text-[#7C8590] mt-1">Conexión hidráulica y prueba de presión</div>
                  </div>
                  <div class="font-mono font-bold text-[#B4FF00] text-sm mt-3">$1,400 MXN</div>
                </div>
              </div>

              <!-- Mensaje de orden técnica -->
              <div class="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-start gap-3">
                <span class="text-xl">💬</span>
                <div>
                  <div class="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Así se formaliza la visita por WhatsApp:
                  </div>
                  <div class="text-sm text-zinc-200 mt-1 italic" id="trade-display-wa">
                    "Hola Baakal! Solicito técnico para Destape de Drenaje con Sonda. Tarifa base: $850 MXN. Ubicación: Col. García Ginerés."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- =========================================================================
            CÓMO FUNCIONA EL SERVICIO
           ========================================================================= -->
        <section id="como-funciona" class="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8">
            <div class="text-center max-w-2xl mx-auto mb-14">
              <span class="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
                Proceso Transparente
              </span>
              <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
                Cómo resolvemos tu emergencia técnica en 3 pasos.
              </h2>
            </div>

            <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div class="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
                <div class="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                  1
                </div>
                <h3 class="font-display font-bold text-lg text-white">Describes tu síntoma a la IA</h3>
                <p class="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                  Escribe: <em>"Huele a gas en el calentador"</em> o <em>"el agua no baja en la tarja"</em>. Nuestra IA calcula la tarifa estimada según el catálogo oficial.
                </p>
              </div>

              <div class="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
                <div class="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                  2
                </div>
                <h3 class="font-display font-bold text-lg text-white">Coordinas visita en WhatsApp</h3>
                <p class="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                  El sistema te genera tu folio de servicio y abre el chat directo con el técnico certificado asignado para acordar hora de llegada.
                </p>
              </div>

              <div class="rounded-2xl border border-white/10 bg-[#121417] p-8 text-center relative">
                <div class="w-14 h-14 rounded-2xl bg-[#B4FF00]/10 border border-[#B4FF00]/30 text-[#B4FF00] font-display font-black text-2xl flex items-center justify-center mx-auto mb-6">
                  3
                </div>
                <h3 class="font-display font-bold text-lg text-white">Trabajo con garantía & SPEI</h3>
                <p class="text-xs text-[#A7AEB8] mt-3 leading-relaxed">
                  El técnico realiza el trabajo con herramienta profesional. Pagas por SPEI o tarjeta y recibes tu garantía por escrito.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- =========================================================================
            PARA TÉCNICOS Y CONTRATISTAS ($299/mes)
           ========================================================================= -->
        <section id="proveedores" class="py-16 sm:py-24 border-b border-white/10">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8">
            <div class="max-w-xl mx-auto rounded-3xl border-2 border-[#B4FF00] bg-gradient-to-b from-[#161a14] to-[#121417] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              <div class="absolute top-0 right-0 bg-[#B4FF00] text-[#0B0C0E] font-display font-bold text-[11px] px-4 py-1 rounded-bl-xl tracking-wider uppercase">
                PARA TÉCNICOS & CONTRATISTAS
              </div>

              <span class="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
                Únete a la Red Ark
              </span>
              <h2 class="font-display text-4xl sm:text-5xl font-black text-white mt-2">
                $299 <span className="text-base sm:text-lg font-normal text-[#A7AEB8]">MXN / mes</span>
              </h2>
              <p class="mt-2 text-xs text-zinc-400 font-mono">Deja de perder trabajos por no contestar el WhatsApp mientras estás en una escalera</p>

              <div class="my-8 border-t border-white/10 pt-8 text-left space-y-3.5 text-sm">
                <div class="flex items-center gap-3">
                  <span class="text-[#B4FF00]">✓</span>
                  <span class="text-zinc-200"><strong>Tu web profesional con diseño de autor</strong> (como Baakal)</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[#B4FF00]">✓</span>
                  <span class="text-zinc-200"><strong>Asistente IA 24/7</strong> que atiende y cotiza a tus clientes automáticamente</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[#B4FF00]">✓</span>
                  <span class="text-zinc-200"><strong>Presencia en el buscador Ark Concierge</strong> para recibir nuevos clientes</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[#B4FF00]">✓</span>
                  <span class="text-zinc-200"><strong>Folios formales de cotización</strong> con desglose de mano de obra y materiales</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[#B4FF00]">✓</span>
                  <span class="text-zinc-200"><strong>Cobro directo a tu banco por SPEI</strong> (0% de comisiones)</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[#B4FF00]">✓</span>
                  <span class="text-zinc-200"><strong>Panel de control móvil:</strong> edita tus precios y servicios en segundos</span>
                </div>
              </div>

              <a
                href="https://wa.me/529994918221?text=Hola%20Ark!%20Soy%20t%C3%A9cnico%20independiente/empresa%20de%20mantenimiento%20y%20quiero%20unirme%20a%20la%20red%20por%20%24299/mes."
                target="_blank"
                rel="noopener noreferrer"
                class="w-full h-14 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] font-display font-bold text-base text-[#0B0C0E] flex items-center justify-center gap-2 transition lima-glow active:scale-[0.98]"
              >
                👉 Quiero Unirme como Técnico Verificado
              </a>

              <p class="mt-4 text-[11px] text-[#7C8590] font-mono">
                Validamos tu experiencia y te entregamos tu perfil activo hoy mismo.
              </p>
            </div>
          </div>
        </section>

        <!-- =========================================================================
            FAQ
           ========================================================================= -->
        <section id="faq" class="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">
          <div class="mx-auto max-w-[800px] px-4 sm:px-8">
            <div class="text-center mb-12">
              <span class="font-mono text-xs font-bold text-[#B4FF00] tracking-widest uppercase">
                Dudas Frecuentes
              </span>
              <h2 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
                Preguntas Frecuentes de Clientes y Técnicos
              </h2>
            </div>

            <div class="space-y-3">
              <div class="faq-item rounded-xl border border-white/10 bg-[#121417] overflow-hidden">
                <button class="faq-btn w-full p-5 text-left font-display font-bold text-sm sm:text-base flex justify-between items-center text-white hover:text-[#B4FF00] transition">
                  <span>¿Cómo garantizan que el precio no cambiará al llegar el técnico?</span>
                  <span class="text-[#B4FF00] ml-3">+</span>
                </button>
                <div class="faq-content px-5 pb-5 text-xs sm:text-sm text-[#A7AEB8] leading-relaxed border-t border-white/5 pt-3 font-body hidden">
                  Nuestra IA y catálogo manejan tarifas oficiales fijas para diagnósticos y reparaciones estándar. Antes de iniciar cualquier trabajo mayor, el técnico te entrega un folio formal con el desglose exacto de mano de obra y refacciones, requiriendo tu autorización.
                </div>
              </div>

              <div class="faq-item rounded-xl border border-white/10 bg-[#121417] overflow-hidden">
                <button class="faq-btn w-full p-5 text-left font-display font-bold text-sm sm:text-base flex justify-between items-center text-white hover:text-[#B4FF00] transition">
                  <span>¿En cuánto tiempo llega un técnico para una emergencia de gas o agua?</span>
                  <span class="text-[#B4FF00] ml-3">+</span>
                </button>
                <div class="faq-content px-5 pb-5 text-xs sm:text-sm text-[#A7AEB8] leading-relaxed border-t border-white/5 pt-3 font-body hidden">
                  En las zonas principales de cobertura (Mérida, Cancún y Sureste), las unidades de emergencia tienen un tiempo de respuesta promedio de 45 a 90 minutos según la disponibilidad.
                </div>
              </div>

              <div class="faq-item rounded-xl border border-white/10 bg-[#121417] overflow-hidden">
                <button class="faq-btn w-full p-5 text-left font-display font-bold text-sm sm:text-base flex justify-between items-center text-white hover:text-[#B4FF00] transition">
                  <span>¿Qué garantía tienen los trabajos realizados?</span>
                  <span class="text-[#B4FF00] ml-3">+</span>
                </button>
                <div class="faq-content px-5 pb-5 text-xs sm:text-sm text-[#A7AEB8] leading-relaxed border-t border-white/5 pt-3 font-body hidden">
                  Todos los servicios de la Red Ark cuentan con garantía por escrito de 30 a 90 días en mano de obra. Si la avería reincide por una mala instalación, el técnico regresa sin costo adicional.
                </div>
              </div>

              <div class="faq-item rounded-xl border border-white/10 bg-[#121417] overflow-hidden">
                <button class="faq-btn w-full p-5 text-left font-display font-bold text-sm sm:text-base flex justify-between items-center text-white hover:text-[#B4FF00] transition">
                  <span>¿Cómo puedo pagar el servicio?</span>
                  <span class="text-[#B4FF00] ml-3">+</span>
                </button>
                <div class="faq-content px-5 pb-5 text-xs sm:text-sm text-[#A7AEB8] leading-relaxed border-t border-white/5 pt-3 font-body hidden">
                  Aceptamos transferencias inmediatas por SPEI (BBVA o cualquier banco), tarjetas de débito/crédito mediante terminal física del técnico, o efectivo contra entrega de comprobante.
                </div>
              </div>

              <div class="faq-item rounded-xl border border-white/10 bg-[#121417] overflow-hidden">
                <button class="faq-btn w-full p-5 text-left font-display font-bold text-sm sm:text-base flex justify-between items-center text-white hover:text-[#B4FF00] transition">
                  <span>¿Cómo me uno a la red si soy plomero, electricista o técnico en climas?</span>
                  <span class="text-[#B4FF00] ml-3">+</span>
                </button>
                <div class="faq-content px-5 pb-5 text-xs sm:text-sm text-[#A7AEB8] leading-relaxed border-t border-white/5 pt-3 font-body hidden">
                  Envíanos un mensaje por WhatsApp. Revisamos tu experiencia, herramientas de trabajo y comprobante de domicilio. Al ser aprobado, activamos tu perfil profesional en Ark por $299 MXN al mes.
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- =========================================================================
            FOOTER
           ========================================================================= -->
        <footer class="py-12 bg-[#0B0C0E] text-zinc-500 text-xs">
          <div class="mx-auto max-w-[1240px] px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="font-display font-black text-white">ARK<span class="text-[#B4FF00]">OFICIOS</span></span>
              <span>· Red de Mantenimiento & Servicios Técnicos en México</span>
            </div>
            <div class="flex items-center gap-4">
              <a
                href="https://wa.me/529994918221?text=Hola%20Ark!%20Tengo%20una%20duda%20sobre%20los%20servicios%20t%C3%A9cnicos%20de%20mantenimiento."
                target="_blank"
                rel="noopener noreferrer"
                class="text-[#B4FF00] hover:underline"
              >
                Contacto Urgencias WhatsApp
              </a>
              <span>·</span>
              <a href="/admin/leads.html" class="hover:text-white transition">Panel de Leads</a>
            </div>
          </div>
        </footer>
      </div>
    </div>

    <!-- Scripts de interactividad pura y ultrarrápida -->
    <script>
      (function() {
        // 1. Datos de especialidades
        const trades = {
          plomeria: {
            icon: '🔧',
            title: 'Plomería & Drenajes',
            sub: 'Fugas de agua, tinacos y bombas',
            badge: 'Proveedor Insignia: baakal.ark.mx',
            services: [
              { name: 'Destape de Drenaje con Sonda', desc: 'Desazolve sin romper pisos ni tuberías', price: '$850' },
              { name: 'Detección y Reparación de Fuga', desc: 'Diagnóstico en tubería de cobre y PPR', price: '$650' },
              { name: 'Tinaco o Bomba Presurizadora', desc: 'Conexión hidráulica y prueba de presión', price: '$1,400' }
            ],
            wa: 'Hola Baakal! Solicito técnico para Destape de Drenaje con Sonda. Tarifa base: $850 MXN. Ubicación: Col. García Ginerés.'
          },
          gas: {
            icon: '🔥',
            title: 'Gas LP & Boilers',
            sub: 'Líneas de gas, calentadores y fugas',
            badge: 'Proveedor Insignia: baakal.ark.mx',
            services: [
              { name: 'Instalación de Boiler (Gas o Solar)', desc: 'Montaje con prueba de hermeticidad', price: '$1,250' },
              { name: 'Prueba de Hermeticidad y Fuga de Gas', desc: 'Detección con manómetro y equipo certificado', price: '$950' },
              { name: 'Cambio de Válvulas y Regulador', desc: 'Regulador de alta y baja presión', price: '$750' }
            ],
            wa: 'Hola Baakal! Requiero instalación de Boiler con prueba de hermeticidad. Total: $1,250 MXN. ¿Tienen disponibilidad hoy?'
          },
          climas: {
            icon: '❄️',
            title: 'Climas & Minisplits (HVAC)',
            sub: 'Mantenimiento, lavado y recarga de gas',
            badge: 'Proveedor Insignia: climasdeleste.ark.mx',
            services: [
              { name: 'Lavado Profundo de Minisplit', desc: 'Desinfección de turbina y serpentín', price: '$550' },
              { name: 'Recarga de Gas Refrigerante R410A', desc: 'Carga completa con vacío previo', price: '$850' },
              { name: 'Instalación Minisplit Inverter', desc: 'Incluye kit de tubería y fijación', price: '$1,450' }
            ],
            wa: 'Hola! Quiero agendar servicio de lavado profundo para 2 minisplits. Total: $1,100 MXN. Paso mi dirección.'
          },
          electricidad: {
            icon: '⚡',
            title: 'Electricidad & Cuadros',
            sub: 'Cortocircuitos, cableado y centros de carga',
            badge: 'Proveedor Insignia: voltia.ark.mx',
            services: [
              { name: 'Reparación de Cortocircuito', desc: 'Aislamiento de circuito y cambio de pastilla', price: '$750' },
              { name: 'Centro de Carga (2 a 4 pastillas)', desc: 'Norma técnica con tierra física', price: '$1,350' },
              { name: 'Cableado y Balanceo de Cargas', desc: 'Para evitar sobrecalentamiento', price: '$1,800' }
            ],
            wa: 'Hola! Tengo una falla en el centro de carga principal de mi casa. Solicito electricista urgente.'
          }
        };

        // Tabs
        document.querySelectorAll('.trade-tab').forEach(tab => {
          tab.addEventListener('click', function() {
            const cat = this.getAttribute('data-cat');
            const data = trades[cat];
            if (!data) return;

            document.querySelectorAll('.trade-tab').forEach(t => {
              t.className = 'trade-tab px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white/[0.04] border border-white/10 text-[#A7AEB8] hover:text-white hover:bg-white/[0.08]';
            });
            this.className = 'trade-tab px-4 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-[#B4FF00] text-[#0B0C0E] shadow-lg shadow-[#B4FF00]/20';

            document.getElementById('trade-display-icon').textContent = data.icon;
            document.getElementById('trade-display-title').textContent = data.title;
            document.getElementById('trade-display-sub').textContent = data.sub;
            document.getElementById('trade-display-badge').textContent = data.badge;
            document.getElementById('trade-display-wa').textContent = `"${data.wa}"`;

            const srvBox = document.getElementById('trade-display-services');
            srvBox.innerHTML = data.services.map(s => `
              <div class="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                <div>
                  <div class="font-display font-bold text-sm text-white">${s.name}</div>
                  <div class="text-xs text-[#7C8590] mt-1">${s.desc}</div>
                </div>
                <div class="font-mono font-bold text-[#B4FF00] text-sm mt-3">${s.price} MXN</div>
              </div>
            `).join('');
          });
        });

        // Copiar CLABE
        const copyBtn = document.getElementById('btn-copy-clabe');
        if (copyBtn) {
          copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText('012180012345678901').then(() => {
              copyBtn.textContent = '✓ Copiado';
              setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2200);
            });
          });
        }

        // FAQ accordion
        document.querySelectorAll('.faq-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const sign = this.querySelector('span:last-child');
            if (content.classList.contains('hidden')) {
              content.classList.remove('hidden');
              if (sign) sign.textContent = '−';
            } else {
              content.classList.add('hidden');
              if (sign) sign.textContent = '+';
            }
          });
        });

        // AI Concierge Search Handler
        const input = document.getElementById('concierge-query-input');
        const submitBtn = document.getElementById('concierge-submit-btn');
        const btnText = document.getElementById('concierge-btn-text');
        const btnArrow = document.getElementById('concierge-btn-arrow');
        const btnSpinner = document.getElementById('concierge-btn-spinner');
        const errorBox = document.getElementById('concierge-error-box');
        const errorMsg = document.getElementById('concierge-error-msg');
        const resultCard = document.getElementById('concierge-result-card');
        const resultExplanation = document.getElementById('concierge-result-explanation');
        const vendorName = document.getElementById('concierge-vendor-name');
        const vendorServices = document.getElementById('concierge-vendor-services');
        const vendorPrice = document.getElementById('concierge-vendor-price');
        const vendorCta = document.getElementById('concierge-vendor-cta');

        async function doSearch(query) {
          const q = (query || input.value || '').trim();
          if (!q) return;

          input.value = q;
          submitBtn.disabled = true;
          btnText.textContent = 'Buscando técnico...';
          btnArrow.classList.add('hidden');
          btnSpinner.classList.remove('hidden');
          errorBox.classList.add('hidden');
          resultCard.classList.add('hidden');

          try {
            const res = await fetch('/api/assistant/recommend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: q })
            });

            if (!res.ok) throw new Error('No se pudo procesar la consulta con Ark Concierge');
            const data = await res.json();

            if (!data || !data.recommended_tenant) {
              throw new Error('No encontramos un técnico específico para esta falla. Te canalizamos por WhatsApp.');
            }

            const tenant = data.recommended_tenant;
            resultExplanation.textContent = data.explanation || 'Especialista certificado asignado con precio oficial.';
            vendorName.textContent = tenant.name || 'Técnico Certificado';
            vendorServices.textContent = (tenant.matched_services || []).map(s => s.name).join(' • ') || 'Servicio técnico especializado';
            
            const total = Number(tenant.estimated_total || 0);
            vendorPrice.textContent = '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
            vendorCta.href = tenant.target_url || '#';

            resultCard.classList.remove('hidden');
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } catch (err) {
            errorMsg.textContent = err.message || 'Error al conectar con el asistente técnico.';
            errorBox.classList.remove('hidden');
          } finally {
            submitBtn.disabled = false;
            btnText.textContent = 'Cotizar con IA';
            btnArrow.classList.remove('hidden');
            btnSpinner.classList.add('hidden');
          }
        }

        if (submitBtn) {
          submitBtn.addEventListener('click', () => doSearch());
        }
        if (input) {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doSearch();
          });
        }

        document.querySelectorAll('.concierge-chip').forEach(btn => {
          btn.addEventListener('click', () => {
            const q = btn.getAttribute('data-query');
            if (q) doSearch(q);
          });
        });
      })();
    </script>
  </body>
</html>
'''

full_html = '<!DOCTYPE html>\n<html lang="es" class="scroll-smooth">\n' + head_part + '\n' + body_content

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

print("Saved updated dist/index.html with Ark Oficios copy! Length:", len(full_html))
