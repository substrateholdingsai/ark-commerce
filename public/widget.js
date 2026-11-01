/**
 * Ark 3D Concierge — Embeddable 3D AI Assistant Widget
 * Mascota oficial 3D ("Ark" en Spline + fallback de alta resolución + dictado de voz es-MX)
 * Integrado con Cloudflare Workers AI (Llama 3.3) + D1 Multi-Tenant.
 *
 * Uso:
 * <script src="/widget.js" data-tenant="marea"></script>
 */
(function () {
  if (window.__ARK_WIDGET_INITIALIZED__) return;
  window.__ARK_WIDGET_INITIALIZED__ = true;

  const SPLINE_SCENE_URL = 'https://prod.spline.design/IaZypc0K4Rnb07vW/scene.splinecode';
  const MASCOT_IMG_URL = '/ark-mascot.jpg';

  // 1. Detectar el tenant actual con precisión (atributo, query, ruta o subdominio)
  function detectTenant() {
    const scripts = document.querySelectorAll('script[src*="widget.js"]');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const attr = scripts[i].getAttribute('data-tenant');
      if (attr && attr.trim()) return attr.trim().toLowerCase();
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tenant')) {
      return urlParams.get('tenant').trim().toLowerCase();
    }

    const path = window.location.pathname.toLowerCase();
    const storeMatch = path.match(/\/stores\/([a-z0-9_-]+)/);
    if (storeMatch) return storeMatch[1];
    if (path.startsWith('/marea')) return 'marea';
    if (
      path.startsWith('/temozonia') ||
      path.startsWith('/conocenos') ||
      path.startsWith('/recetas') ||
      path.startsWith('/mayoreo') ||
      path.startsWith('/contacto')
    ) {
      return 'temozonia';
    }
    if (path.startsWith('/baakal')) return 'baakal';

    const host = window.location.hostname.toLowerCase();
    if (host.startsWith('marea.')) return 'marea';
    if (host.startsWith('temozonia.')) return 'temozonia';
    if (host.startsWith('baakal.')) return 'baakal';

    return 'ark';
  }

  const currentTenant = detectTenant();

  // 2. Configuración visual y conversacional uniforme por tienda
  const THEMES = {
    marea: {
      primary: '#0EA9A8',
      accent: '#E94E49',
      pillLabel: 'Ark 3D · MAREA',
      pillSub: 'Playeras & Tallas S–XXL',
      title: 'MAREA · Ark 3D',
      subtitle: 'Asesor de Playeras & Diseños',
      badge: 'MODA CARIBEÑA',
      priceLabel: 'Total estimado: ',
      actionLabel: '💬 Pedir por WhatsApp →',
      placeholder: 'Pregunta por tallas, modelos o tu diseño...',
      greeting:
        '¡Hola! 🌊 Soy Ark, tu robot asesor 3D en MAREA. Te ayudo a elegir playeras 100% algodón peinado (tallas S a XXL), estampar tu propio diseño ($349 MXN) o aprovechar envío GRATIS en 2+ piezas.',
      chips: [
        '👕 Ver playeras más vendidas',
        '🎨 Estampar mi propio diseño',
        '📏 Guía de tallas S a XXL',
        '🚚 ¿Cómo tengo envío gratis?'
      ]
    },
    temozonia: {
      primary: '#D35400',
      accent: '#B87333',
      pillLabel: 'Ark 3D · Temozonia',
      pillSub: 'Carnes Ahumadas',
      title: 'Temozonia · Ark 3D',
      subtitle: 'Sommelier de Carnes Ahumadas',
      badge: 'AHUMADOS CON LEÑA',
      priceLabel: 'Total estimado: ',
      actionLabel: '💬 Ordenar por WhatsApp →',
      placeholder: 'Pregunta por costillas, pork belly o envíos...',
      greeting:
        '¡Qué tal! 🔥 Soy Ark, tu sommelier 3D en Temozonia. ¿Se te antojan costillas BBQ ahumadas 12 horas, pork belly en leña de jabín o longaniza artesanal de Valladolid?',
      chips: [
        '🥩 Costillas BBQ 1kg',
        '🥓 Pork Belly Ahumado',
        '📦 Paquete Degustación',
        '🚚 Envíos y sucursales'
      ]
    },
    baakal: {
      primary: '#2A7F9E',
      accent: '#B87333',
      pillLabel: 'Ark 3D · BAAKAL',
      pillSub: 'Plomería & Gas 24/7',
      title: 'BAAKAL · Ark 3D',
      subtitle: 'Diagnóstico de Plomería & Gas',
      badge: 'TÉCNICOS CERTIFICADOS',
      priceLabel: 'Tarifa oficial: ',
      actionLabel: '💬 Solicitar Técnico en WhatsApp →',
      placeholder: 'Describe tu fuga, drenaje o boiler...',
      greeting:
        '¡Hola! 🔧 Soy Ark, tu asistente técnico 3D de BAAKAL. ¿Tienes una fuga de gas/agua, drenaje tapado o requieres instalar un boiler? Cuéntame o dicta por voz y te cotizo al instante.',
      chips: [
        '🚨 Fuga urgente de gas o agua',
        '🛠️ Destape de drenaje con sonda',
        '🚿 Instalación de boiler',
        '📋 Garantía por escrito'
      ]
    },
    ark: {
      primary: '#0EA9A8',
      accent: '#B4FF00',
      pillLabel: 'Ark Concierge 3D',
      pillSub: 'Tiendas & Servicios IA',
      title: 'Ark Commerce · Concierge 3D',
      subtitle: 'Buscador Multi-Tienda & Servicios',
      badge: 'RED OFICIAL SURESTE',
      priceLabel: 'Total estimado: ',
      actionLabel: '💬 Continuar en WhatsApp →',
      placeholder: 'Busca playeras, carnes ahumadas, plomero...',
      greeting:
        '¡Hola! 👋 Soy Ark, tu robot asistente 3D en Ark Commerce. Puedo cotizarte playeras personalizadas (MAREA), carnes ahumadas (Temozonia), plomería certificada (BAAKAL) o ayudarte a abrir tu tienda por $299/mes.',
      chips: [
        '👕 Playeras personalizadas MAREA',
        '🥩 Carnes ahumadas Temozonia',
        '🔧 Plomería urgente BAAKAL',
        '🏪 Abrir mi tienda ($299/mes)'
      ]
    }
  };

  const theme = THEMES[currentTenant] || THEMES.ark;

  // 3. Contenedor y estilos encapsulados
  const container = document.createElement('div');
  container.id = 'ark-bot-root';
  container.style.cssText =
    'position:fixed;bottom:20px;right:20px;z-index:999999;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
  document.body.appendChild(container);

  const style = document.createElement('style');
  style.textContent = `
    #ark-bot-root * { box-sizing: border-box; margin: 0; padding: 0; }
    #ark-bot-root button, #ark-bot-root input { font: inherit; }

    /* Botón flotante con mascota 3D Ark */
    .ark-bot-launcher {
      display: flex;
      align-items: center;
      gap: 11px;
      background: rgba(11, 19, 41, 0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1.5px solid ${theme.primary}88;
      border-radius: 999px;
      padding: 6px 16px 6px 7px;
      color: #FFFFFF;
      cursor: pointer;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42), 0 0 22px ${theme.primary}33;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ark-bot-launcher:hover {
      transform: translateY(-3px) scale(1.03);
      border-color: #3FD4D2;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5), 0 0 28px ${theme.primary}55;
    }
    .ark-bot-launcher-avatar-wrap {
      position: relative;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      overflow: hidden;
      background: #0b1329;
      border: 2px solid #3FD4D2;
      box-shadow: 0 0 14px rgba(63, 212, 210, 0.45);
      flex-shrink: 0;
    }
    .ark-bot-launcher-avatar-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.12);
      transition: transform 0.3s ease;
    }
    .ark-bot-launcher:hover .ark-bot-launcher-avatar-wrap img {
      transform: scale(1.22);
    }
    .ark-bot-live-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 11px;
      height: 11px;
      background: #34D399;
      border: 2px solid #0b1329;
      border-radius: 50%;
      box-shadow: 0 0 8px #34D399;
      z-index: 2;
    }
    .ark-bot-launcher-text {
      text-align: left;
      padding-right: 2px;
    }
    .ark-bot-launcher-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 12.5px;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }
    .ark-bot-launcher-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 9.5px;
      font-weight: 700;
      color: #34D399;
      background: rgba(52, 211, 153, 0.16);
      border: 1px solid rgba(52, 211, 153, 0.35);
      padding: 1px 6px;
      border-radius: 6px;
    }
    .ark-bot-launcher-sub {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 1px;
    }

    /* Ventana principal del asistente */
    .ark-bot-card {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 395px;
      max-width: calc(100vw - 28px);
      height: 600px;
      max-height: calc(100vh - 104px);
      background: #0F141C;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 24px;
      box-shadow: 0 28px 72px rgba(0, 0, 0, 0.6), 0 0 32px ${theme.primary}22;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      visibility: hidden;
      transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0.22s;
    }
    .ark-bot-card.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
      visibility: visible;
      transition-delay: 0s;
    }

    /* Escenario 3D de la mascota Ark */
    .ark-bot-stage {
      position: relative;
      height: 162px;
      width: 100%;
      background: radial-gradient(circle at 50% 58%, rgba(14, 169, 168, 0.28), transparent 68%),
                  linear-gradient(180deg, #080E20 0%, #0D162C 65%, #0F141C 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      flex-shrink: 0;
      user-select: none;
    }
    .ark-bot-stage-topbar {
      position: absolute;
      top: 10px;
      left: 12px;
      right: 12px;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: auto;
    }
    .ark-bot-stage-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(11, 19, 41, 0.82);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(63, 212, 210, 0.35);
      padding: 4px 10px;
      border-radius: 999px;
      font-family: "JetBrains Mono", monospace;
      font-size: 10.5px;
      font-weight: 600;
      color: #67E8F9;
    }
    .ark-bot-close-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #CBD5E1;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ark-bot-close-btn:hover {
      color: #FFFFFF;
      background: rgba(233, 78, 73, 0.85);
      border-color: #E94E49;
    }
    .ark-bot-stage-visual {
      position: absolute;
      inset: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ark-bot-mascot-img {
      height: 138px;
      width: 138px;
      object-fit: contain;
      border-radius: 50%;
      filter: drop-shadow(0 0 18px rgba(0, 240, 255, 0.38));
      animation: arkFloat 3.4s ease-in-out infinite;
    }
    .ark-bot-spline-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .ark-bot-spline-canvas.loaded {
      opacity: 1;
    }
    @keyframes arkFloat {
      0%, 100% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-5px) scale(1.03); }
    }
    .ark-bot-stage-footer {
      position: absolute;
      bottom: 8px;
      left: 12px;
      right: 12px;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      pointer-events: auto;
    }
    .ark-bot-store-info {
      background: rgba(11, 19, 41, 0.82);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 10px;
      border-radius: 10px;
    }
    .ark-bot-store-title {
      font-size: 12px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .ark-bot-store-sub {
      font-size: 10px;
      color: #94A3B8;
    }
    .ark-bot-voice-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(11, 19, 41, 0.88);
      border: 1px solid rgba(63, 212, 210, 0.4);
      color: #A5F3FC;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 11px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ark-bot-voice-pill:hover {
      background: rgba(14, 169, 168, 0.3);
      color: #FFFFFF;
    }
    .ark-bot-voice-pill.listening {
      background: #E94E49;
      border-color: #FF7B76;
      color: #FFFFFF;
      animation: arkPulseVoice 1.2s infinite;
    }
    @keyframes arkPulseVoice {
      0%, 100% { box-shadow: 0 0 0 0 rgba(233, 78, 73, 0.6); }
      50% { box-shadow: 0 0 0 8px rgba(233, 78, 73, 0); }
    }

    /* Mensajes */
    .ark-bot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 11px;
      overscroll-behavior: contain;
      background: linear-gradient(180deg, #0F141C 0%, #121822 100%);
    }
    .ark-msg {
      max-width: 86%;
      font-size: 13px;
      line-height: 1.52;
      padding: 11px 14px;
      border-radius: 16px;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .ark-msg-assistant {
      background: #1B2330;
      color: #F1F5F9;
      align-self: flex-start;
      border-bottom-left-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .ark-msg-user {
      background: ${theme.primary};
      color: #FFFFFF;
      align-self: flex-end;
      border-bottom-right-radius: 5px;
      font-weight: 500;
      box-shadow: 0 5px 15px ${theme.primary}40;
    }
    .ark-msg-action {
      margin-top: 9px;
      padding: 10px 12px;
      background: rgba(9, 13, 20, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }
    .ark-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #25D366;
      color: #09140E;
      font-weight: 700;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      text-decoration: none;
      margin-top: 6px;
      transition: background 0.2s, transform 0.15s;
    }
    .ark-action-btn:hover {
      background: #22bf5b;
      transform: translateY(-1px);
    }

    /* Chips de sugerencias */
    .ark-bot-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 6px 14px 12px;
      background: #121822;
    }
    .ark-chip {
      background: ${theme.primary}1C;
      border: 1px solid ${theme.primary}55;
      color: #E2E8F0;
      font-size: 11px;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.18s;
    }
    .ark-chip:hover {
      background: ${theme.primary};
      color: #FFFFFF;
      border-color: ${theme.primary};
    }

    /* Barra inferior de texto + micrófono */
    .ark-bot-input-bar {
      padding: 11px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: #0D1219;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ark-bot-input {
      flex: 1;
      min-width: 0;
      background: #161E2B;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 13px;
      padding: 10px 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ark-bot-input:focus {
      border-color: #3FD4D2;
      box-shadow: 0 0 0 2px rgba(63, 212, 210, 0.2);
    }
    .ark-bot-send-btn {
      background: ${theme.primary};
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      width: 40px;
      height: 40px;
      flex: 0 0 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .ark-bot-send-btn:hover:not(:disabled) {
      transform: scale(1.04);
    }
    .ark-bot-send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .ark-typing-dots {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 0;
    }
    .ark-typing-dot {
      width: 6px;
      height: 6px;
      background: #3FD4D2;
      border-radius: 50%;
      animation: arkPulse 1.2s infinite ease-in-out;
    }
    .ark-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .ark-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes arkPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 640px) {
      #ark-bot-root { right: 12px !important; bottom: max(12px, env(safe-area-inset-bottom)) !important; }
      .ark-bot-card {
        position: fixed;
        right: 10px;
        bottom: max(10px, env(safe-area-inset-bottom));
        width: calc(100vw - 20px);
        max-width: none;
        height: min(84vh, 620px);
        height: min(84dvh, 620px);
        border-radius: 22px;
      }
      #ark-bot-root.is-open .ark-bot-launcher {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.85);
      }
    }
  `;
  document.head.appendChild(style);

  // 4. Estructura HTML con Escenario 3D de Ark y Dictado por Voz
  container.innerHTML = `
    <div class="ark-bot-card" id="ark-bot-card" role="dialog" aria-label="${theme.title}" aria-hidden="true" inert>
      <div class="ark-bot-stage">
        <div class="ark-bot-stage-topbar">
          <div class="ark-bot-stage-pill">
            <span>✨ Ark 3D Live</span>
            <span style="opacity:0.6">·</span>
            <span>${theme.badge}</span>
          </div>
          <button type="button" class="ark-bot-close-btn" id="ark-bot-close" aria-label="Cerrar asistente">&times;</button>
        </div>

        <div class="ark-bot-stage-visual">
          <img src="${MASCOT_IMG_URL}" alt="Ark Robot 3D" class="ark-bot-mascot-img" id="ark-bot-mascot-img" />
          <canvas class="ark-bot-spline-canvas" id="ark-bot-spline-canvas"></canvas>
        </div>

        <div class="ark-bot-stage-footer">
          <div class="ark-bot-store-info">
            <div class="ark-bot-store-title">${theme.title}</div>
            <div class="ark-bot-store-sub">${theme.subtitle}</div>
          </div>
          <button type="button" class="ark-bot-voice-pill" id="ark-bot-voice" title="Dictar por voz (es-MX)">
            <span id="ark-bot-voice-icon">🎙️</span>
            <span id="ark-bot-voice-label">Hablar con Ark</span>
          </button>
        </div>
      </div>

      <div class="ark-bot-messages" id="ark-bot-messages" role="log" aria-live="polite">
        <div class="ark-msg ark-msg-assistant">${theme.greeting}</div>
      </div>

      <div class="ark-bot-chips" id="ark-bot-chips">
        ${theme.chips.map((chip) => `<button type="button" class="ark-chip" data-msg="${chip}">${chip}</button>`).join('')}
      </div>

      <div class="ark-bot-input-bar">
        <input
          type="text"
          class="ark-bot-input"
          id="ark-bot-input"
          placeholder="${theme.placeholder}"
          aria-label="Escribe tu consulta"
          autocomplete="off"
        />
        <button type="button" class="ark-bot-send-btn" id="ark-bot-send" title="Enviar mensaje" aria-label="Enviar mensaje">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <button type="button" class="ark-bot-launcher" id="ark-bot-toggle" aria-label="Abrir asistente 3D Ark" aria-expanded="false" aria-controls="ark-bot-card">
      <div class="ark-bot-launcher-avatar-wrap">
        <img src="${MASCOT_IMG_URL}" alt="Ark 3D" />
        <span class="ark-bot-live-dot" aria-hidden="true"></span>
      </div>
      <div class="ark-bot-launcher-text">
        <div class="ark-bot-launcher-title">
          <span>${theme.pillLabel}</span>
          <span class="ark-bot-launcher-badge">IA 3D</span>
        </div>
        <div class="ark-bot-launcher-sub">${theme.pillSub}</div>
      </div>
    </button>
  `;

  // 5. Referencias y carga diferida de Spline 3D
  const toggleBtn = document.getElementById('ark-bot-toggle');
  const card = document.getElementById('ark-bot-card');
  const closeBtn = document.getElementById('ark-bot-close');
  const input = document.getElementById('ark-bot-input');
  const sendBtn = document.getElementById('ark-bot-send');
  const messagesBox = document.getElementById('ark-bot-messages');
  const chipsBox = document.getElementById('ark-bot-chips');
  const voiceBtn = document.getElementById('ark-bot-voice');
  const voiceLabel = document.getElementById('ark-bot-voice-label');
  const splineCanvas = document.getElementById('ark-bot-spline-canvas');
  const mascotImg = document.getElementById('ark-bot-mascot-img');

  const history = [];
  let splineLoaded = false;

  async function tryInitSpline3D() {
    if (splineLoaded) return;
    splineLoaded = true;
    try {
      if (!navigator.gpu) return;
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return;

      const mod = await import('https://unpkg.com/@splinetool/runtime@1.9.59/build/runtime.js');
      if (mod && mod.Application && splineCanvas) {
        const app = new mod.Application(splineCanvas);
        await app.load(SPLINE_SCENE_URL);
        splineCanvas.classList.add('loaded');
        if (mascotImg) mascotImg.style.opacity = '0';
      }
    } catch {
      // Mantiene el render 3D de alta resolución ark-mascot.jpg con animación flotante
    }
  }

  function openBot() {
    card.classList.add('open');
    container.classList.add('is-open');
    card.removeAttribute('inert');
    card.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    tryInitSpline3D();
    if (window.matchMedia('(min-width: 641px)').matches) input.focus();
  }

  function closeBot() {
    card.classList.remove('open');
    container.classList.remove('is-open');
    card.setAttribute('inert', '');
    card.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    if (card.classList.contains('open')) closeBot();
    else openBot();
  });

  closeBtn.addEventListener('click', closeBot);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeBot();
  });

  // 6. Reconocimiento de voz Web Speech API (es-MX)
  let isListening = false;
  let recognition = null;

  voiceBtn.addEventListener('click', () => {
    if (isListening && recognition) {
      recognition.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      input.placeholder = 'Tu navegador no soporta voz; escribe aquí...';
      input.focus();
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.lang = 'es-MX';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceLabel.textContent = 'Escuchando...';
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          input.value = transcript;
          sendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceLabel.textContent = 'Hablar con Ark';
      };

      recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceLabel.textContent = 'Hablar con Ark';
      };

      recognition.start();
    } catch {
      isListening = false;
    }
  });

  // 7. Mensajería con el Worker
  function appendMessage(role, text, actionData) {
    const msg = document.createElement('div');
    msg.className = `ark-msg ark-msg-${role}`;
    msg.textContent = String(text ?? '');

    if (actionData && actionData.whatsapp_url) {
      const action = document.createElement('div');
      action.className = 'ark-msg-action';

      const amount = Number(actionData.estimated_total);
      if (Number.isFinite(amount) && amount > 0) {
        const price = document.createElement('div');
        price.style.cssText = 'font-size:11px;color:#CBD5E1;margin-bottom:4px;';
        price.append(theme.priceLabel);
        const strong = document.createElement('strong');
        strong.style.color = '#3FD4D2';
        strong.textContent = `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
        price.appendChild(strong);
        action.appendChild(price);
      }

      try {
        const parsedUrl = new URL(String(actionData.whatsapp_url));
        if (parsedUrl.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].includes(parsedUrl.hostname)) {
          const link = document.createElement('a');
          link.href = parsedUrl.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.className = 'ark-action-btn';
          link.textContent = actionData.action_label || theme.actionLabel;
          action.appendChild(link);
        }
      } catch (e) {
        console.error('URL de WhatsApp inválida:', e);
      }

      msg.appendChild(action);
    }

    messagesBox.appendChild(msg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.id = 'ark-bot-typing';
    typing.className = 'ark-msg ark-msg-assistant';
    typing.innerHTML = `
      <div class="ark-typing-dots">
        <span class="ark-typing-dot"></span>
        <span class="ark-typing-dot"></span>
        <span class="ark-typing-dot"></span>
      </div>
    `;
    messagesBox.appendChild(typing);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('ark-bot-typing');
    if (el) el.remove();
  }

  async function sendMessage(text) {
    const msg = (text || input.value || '').trim();
    if (!msg) return;

    input.value = '';
    sendBtn.disabled = true;
    chipsBox.style.display = 'none';

    appendMessage('user', msg);
    history.push({ role: 'user', content: msg });

    showTyping();

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: currentTenant,
          message: msg,
          history: history.slice(-4)
        })
      });

      removeTyping();

      if (!res.ok) throw new Error('Error al conectar con Ark 3D.');
      const data = await res.json();

      const reply = data.reply || '¡Listo! ¿Te gustaría confirmar tu pedido o consulta directamente por WhatsApp?';
      appendMessage('assistant', reply, data);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      console.error('Error en asistente Ark 3D:', err);
      appendMessage(
        'assistant',
        'Tuve un breve detalle de conexión, pero puedes enviarnos tu mensaje directo por WhatsApp para atenderte al instante.'
      );
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  chipsBox.querySelectorAll('.ark-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg');
      if (msg) sendMessage(msg);
    });
  });
})();
