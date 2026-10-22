import os

concierge_section = '''
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
                  ARK CONCIERGE · BUSCADOR DE SERVICIOS CON IA
                </span>
              </div>
              <span class="text-[11px] font-mono text-zinc-400">EN VIVO EN EL SURESTE</span>
            </div>

            <h3 class="font-display text-xl sm:text-2xl font-bold text-white mb-2">
              ¿Qué servicio o solución necesitas hoy?
            </h3>
            <p class="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
              Describe en lenguaje natural tu problema o encargo. Nuestra IA busca en tiempo real en la red de proveedores verificados de Ark y te cotiza al instante.
            </p>

            <!-- Input de Búsqueda Conversacional -->
            <div class="relative flex flex-col sm:flex-row gap-2.5">
              <input
                id="concierge-query-input"
                type="text"
                placeholder="Ej: Fuga de gas en la cocina, necesito contador para mi PyME, etc."
                class="flex-1 bg-[#0B0C0E] border border-white/15 focus:border-[#B4FF00] rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition font-sans"
              />
              <button
                id="concierge-submit-btn"
                class="h-12 px-6 rounded-xl bg-[#B4FF00] hover:bg-[#C6FF33] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0C0E] font-display font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] whitespace-nowrap shadow-sm"
              >
                <span id="concierge-btn-text">Consultar IA</span>
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
              <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Tengo una fuga urgente de gas LP y drenaje tapado en mi casa">
                🚨 Fuga de gas o drenaje tapado
              </button>
              <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Necesito presentar mi declaración de impuestos del SAT y contabilidad mensual">
                📑 Declaración anual o contabilidad PyME
              </button>
              <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Busco costillas BBQ y carnes ahumadas para evento de fin de semana">
                🥩 Carnes ahumadas artesanales
              </button>
              <button class="concierge-chip text-[11px] font-mono text-zinc-300 hover:text-[#B4FF00] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition" data-query="Requiero instalación de un calentador de agua con prueba de presión">
                ⚡ Arreglo de boiler o instalación
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
                  <span>&check;</span> PROVEEDOR VERIFICADO ENCONTRADO
                </div>
                <span class="text-xs font-mono text-zinc-400 uppercase">Respuesta Instantánea</span>
              </div>

              <p id="concierge-result-explanation" class="text-sm text-zinc-200 leading-relaxed mb-4"></p>

              <div class="bg-[#0B0C0E] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div id="concierge-vendor-name" class="font-display text-lg font-bold text-white"></div>
                  <div id="concierge-vendor-services" class="text-xs text-zinc-400 mt-0.5"></div>
                </div>

                <div class="flex items-center gap-4 sm:border-l sm:border-white/10 sm:pl-5">
                  <div class="text-left sm:text-right">
                    <div class="text-[10px] font-mono text-zinc-400 uppercase">Tarifa Estimada</div>
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
                    <span>Ver y Contratar</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script>
        (function() {
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
            btnText.textContent = 'Buscando...';
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
                throw new Error('No encontramos un proveedor específico para tu consulta.');
              }

              const tenant = data.recommended_tenant;
              resultExplanation.textContent = data.explanation || 'Proveedor ideal encontrado en la red de Ark.';
              vendorName.textContent = tenant.name || 'Proveedor Verificado';
              vendorServices.textContent = (tenant.matched_services || []).map(s => s.name).join(' • ') || 'Servicios verificados';
              
              const total = Number(tenant.estimated_total || 0);
              vendorPrice.textContent = '$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 });
              vendorCta.href = tenant.target_url || '#';

              resultCard.classList.remove('hidden');
              resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (err) {
              errorMsg.textContent = err.message || 'Error al conectar con el asistente.';
              errorBox.classList.remove('hidden');
            } finally {
              submitBtn.disabled = false;
              btnText.textContent = 'Consultar IA';
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
'''

with open('dist/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the hero secondary button with the Probar Asistente IA anchor
target_hero_btn = '<button class="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition">Ver tiendas activas ?</button>'
replacement_hero_btn = '<a href="#ai-concierge" class="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition gap-2"><span>🤖 Probar Asistente IA</span><span>&darr;</span></a>'

if target_hero_btn in html:
    html = html.replace(target_hero_btn, replacement_hero_btn)
    print("Replaced hero button with #ai-concierge CTA!")
else:
    print("Warning: target_hero_btn not found directly, checking variations...")

# Insert concierge section right before the next section
target_section = '<section class="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">'
if target_section in html:
    html = html.replace(target_section, concierge_section + '\n' + target_section, 1)
    print("Successfully injected #ai-concierge section into dist/index.html!")
else:
    print("ERROR: target_section not found!")

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved dist/index.html. New size:", len(html))
