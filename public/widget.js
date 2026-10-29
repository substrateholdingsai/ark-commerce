/**
 * Ark Bot — Embeddable AI Assistant Widget
 * Compite directamente contra Chatfuel con cero dependencias, integrado con Cloudflare Workers AI + D1.
 * 
 * Uso:
 * <script src="https://tiendas.arksystems.site/widget.js" data-tenant="baakal"></script>
 */
(function() {
  if (window.__ARK_WIDGET_INITIALIZED__) return;
  window.__ARK_WIDGET_INITIALIZED__ = true;

  // 1. Detectar el tenant actual
  let currentTenant = 'baakal';
  const currentScript = document.currentScript || document.querySelector('script[src*="widget.js"]');
  if (currentScript && currentScript.getAttribute('data-tenant')) {
    currentTenant = currentScript.getAttribute('data-tenant');
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tenant')) {
      currentTenant = urlParams.get('tenant');
    } else {
      const match = window.location.pathname.match(/\/stores\/([a-zA-Z0-9_-]+)/);
      if (match) currentTenant = match[1];
    }
  }

  // 2. Colores y configuración por tenant
  const THEMES = {
    baakal: {
      primary: '#2A7F9E', // Azul agua
      accent: '#B87333',  // Cobre
      title: 'Baakal · Asistente IA',
      subtitle: 'Plomería & Gas en el Sureste',
      avatar: '🔧',
      greeting: '¡Hola! Soy el asistente virtual de Baakal. ¿Tienes alguna fuga, drenaje tapado o requieres instalación técnica? Cuéntame y te cotizo al instante.',
      chips: ['🚨 Tengo una fuga urgente', '🚿 Arreglo de boiler', '🛠️ Destape de drenaje', '📋 Garantía y visita']
    },
    temozonia: {
      primary: '#D35400',
      accent: '#27AE60',
      title: 'Temozonía · Asistente Gourmet',
      subtitle: 'Carnes Ahumadas & Cortes',
      avatar: '🥩',
      greeting: '¡Saludos! Soy el sommelier de Temozonía. ¿Buscas costillas ahumadas, brisket o paquetes para tu evento del fin de semana?',
      chips: ['🥩 Costillas BBQ', '🥓 Paquete Familiar', '🚚 Tiempos de Entrega', '📲 Pedido por WhatsApp']
    }
  };

  const theme = THEMES[currentTenant] || {
    primary: '#B4FF00',
    accent: '#0B0C0E',
    title: 'Ark Concierge',
    subtitle: 'Asistente Agéntico de Comercio',
    avatar: '🤖',
    greeting: '¡Hola! ¿En qué servicio o compra te puedo asesorar hoy?',
    chips: ['Cotizar servicio', 'Hablar por WhatsApp', 'Ver precios']
  };

  // 3. Crear contenedor y estilos aislados
  const container = document.createElement('div');
  container.id = 'ark-bot-root';
  container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
  document.body.appendChild(container);

  const style = document.createElement('style');
  style.textContent = `
    #ark-bot-root * { box-sizing: border-box; margin: 0; padding: 0; }
    #ark-bot-root button, #ark-bot-root input { font: inherit; }
    .ark-bot-btn {
      width: 62px;
      height: 62px;
      border-radius: 22px;
      background: linear-gradient(145deg, ${theme.primary}, ${theme.accent});
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(0,0,0,0.36), 0 0 0 1px rgba(255,255,255,0.18) inset;
      border: 1px solid rgba(255,255,255,0.24);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .ark-bot-btn:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 16px 36px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.22) inset;
    }
    .ark-bot-btn:focus-visible, .ark-bot-close-btn:focus-visible,
    .ark-chip:focus-visible, .ark-bot-send-btn:focus-visible,
    .ark-action-btn:focus-visible {
      outline: 3px solid ${theme.primary};
      outline-offset: 3px;
    }
    .ark-bot-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 15px;
      height: 15px;
      background: #55D59A;
      border: 3px solid #11161A;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(85,213,154,0.4);
    }
    .ark-bot-card {
      position: absolute;
      bottom: 78px;
      right: 0;
      width: 390px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 112px);
      background: radial-gradient(ellipse at 82% 0%, ${theme.primary}20 0, transparent 38%), linear-gradient(155deg, #171D22, #101417 72%);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      box-shadow: 0 28px 72px rgba(0,0,0,0.52), 0 2px 8px rgba(0,0,0,0.18);
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
    .ark-bot-header {
      background: linear-gradient(110deg, ${theme.primary}24, ${theme.accent}14), rgba(24,28,34,0.94);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ark-bot-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ark-bot-avatar {
      width: 44px;
      height: 44px;
      flex: 0 0 44px;
      border-radius: 15px;
      background: linear-gradient(145deg, ${theme.primary}, ${theme.accent});
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      border: 1px solid rgba(255,255,255,0.24);
      box-shadow: 0 8px 20px ${theme.primary}45, 0 0 0 3px rgba(255,255,255,0.035);
    }
    .ark-bot-header-title {
      font-weight: 700;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: -0.2px;
    }
    .ark-bot-header-sub {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #AEB8BE;
      margin-top: 5px;
    }
    .ark-bot-status {
      width: 7px;
      height: 7px;
      display: inline-block;
      border-radius: 50%;
      background: #55D59A;
      box-shadow: 0 0 9px rgba(85,213,154,0.55);
    }
    .ark-bot-close-btn {
      background: none;
      border: none;
      color: #AEB8BE;
      font-size: 22px;
      cursor: pointer;
      padding: 7px;
      line-height: 1;
      transition: color 0.2s;
      border-radius: 10px;
    }
    .ark-bot-close-btn:hover { color: #FFFFFF; background: rgba(255,255,255,0.07); }
    .ark-bot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overscroll-behavior: contain;
    }
    .ark-msg {
      max-width: 84%;
      font-size: 13px;
      line-height: 1.55;
      padding: 12px 15px;
      border-radius: 16px;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .ark-msg-assistant {
      background: linear-gradient(145deg, #232B31, #1B2227);
      color: #E5E7EB;
      align-self: flex-start;
      border-bottom-left-radius: 5px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .ark-msg-user {
      background: ${theme.primary};
      color: #FFFFFF;
      align-self: flex-end;
      border-bottom-right-radius: 5px;
      font-weight: 500;
      box-shadow: 0 5px 16px ${theme.primary}35;
    }
    .ark-msg-action {
      margin-top: 8px;
      padding: 12px;
      background: rgba(9,12,14,0.48);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
    }
    .ark-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #25D366;
      color: #0E1013;
      font-weight: 700;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      text-decoration: none;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .ark-action-btn:hover { background: #22bf5b; }
    .ark-bot-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px 18px 16px;
    }
    .ark-chip {
      background: ${theme.primary}16;
      border: 1px solid ${theme.primary}55;
      color: #DCE7EA;
      font-size: 11px;
      padding: 8px 11px;
      border-radius: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ark-chip:hover {
      background: ${theme.primary}30;
      color: #FFFFFF;
      border-color: ${theme.primary};
    }
    .ark-bot-input-bar {
      padding: 13px 15px;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: rgba(21,26,30,0.96);
      display: flex;
      gap: 9px;
    }
    .ark-bot-input {
      flex: 1;
      min-width: 0;
      background: #0E1215;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 13px;
      color: #FFFFFF;
      font-size: 13px;
      padding: 11px 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ark-bot-input:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 3px ${theme.primary}25;
    }
    .ark-bot-send-btn {
      background: ${theme.primary};
      color: #FFFFFF;
      border: none;
      border-radius: 13px;
      width: 44px;
      height: 44px;
      flex: 0 0 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: opacity 0.2s;
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
      background: #9CA3AF;
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
      #ark-bot-root { right: 16px !important; bottom: max(16px, env(safe-area-inset-bottom)) !important; }
      .ark-bot-card {
        position: fixed;
        right: 12px;
        bottom: max(12px, env(safe-area-inset-bottom));
        width: calc(100vw - 24px);
        max-width: none;
        height: min(82vh, 640px);
        height: min(82dvh, 640px);
        max-height: calc(100vh - 24px);
        max-height: calc(100dvh - 24px);
        border-radius: 24px;
        transform: translateY(18px);
      }
      .ark-bot-card.open { transform: translateY(0); }
      #ark-bot-root.is-open .ark-bot-btn {
        opacity: 0;
        transform: scale(0.85);
        pointer-events: none;
      }
      .ark-bot-messages { padding: 18px 16px; }
    }
    @media (max-width: 380px) {
      .ark-bot-chips { gap: 6px; padding-inline: 14px; }
      .ark-chip { font-size: 10px; padding: 7px 9px; }
    }
    @media (prefers-reduced-motion: reduce) {
      #ark-bot-root *, #ark-bot-root *::before, #ark-bot-root *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);

  // 4. Estructura HTML del Widget
  container.innerHTML = `
    <div class="ark-bot-card" id="ark-bot-card" role="dialog" aria-label="${theme.title}" aria-hidden="true" inert>
      <div class="ark-bot-header">
        <div class="ark-bot-header-left">
          <div class="ark-bot-avatar">${theme.avatar}</div>
          <div>
            <div class="ark-bot-header-title">${theme.title}</div>
            <div class="ark-bot-header-sub"><span class="ark-bot-status" aria-hidden="true"></span>${theme.subtitle}</div>
          </div>
        </div>
        <button type="button" class="ark-bot-close-btn" id="ark-bot-close" aria-label="Cerrar asistente">&times;</button>
      </div>

      <div class="ark-bot-messages" id="ark-bot-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversación">
        <div class="ark-msg ark-msg-assistant">
          ${theme.greeting}
        </div>
      </div>

      <div class="ark-bot-chips" id="ark-bot-chips">
        ${theme.chips.map(chip => `<button class="ark-chip" data-msg="${chip}">${chip}</button>`).join('')}
      </div>

      <div class="ark-bot-input-bar">
        <input type="text" class="ark-bot-input" id="ark-bot-input" placeholder="Escribe tu consulta..." aria-label="Escribe tu consulta" autocomplete="off" />
        <button type="button" class="ark-bot-send-btn" id="ark-bot-send" title="Enviar" aria-label="Enviar mensaje">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <button type="button" class="ark-bot-btn" id="ark-bot-toggle" aria-label="Abrir asistente" aria-expanded="false" aria-controls="ark-bot-card">
      <span class="ark-bot-badge" aria-hidden="true"></span>
      <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M7 7.5h18a3.5 3.5 0 0 1 3.5 3.5v9a3.5 3.5 0 0 1-3.5 3.5h-8l-6.5 4v-4H7A3.5 3.5 0 0 1 3.5 20v-9A3.5 3.5 0 0 1 7 7.5Z" fill="white" fill-opacity=".96"/>
        <path d="m15.9 11.2.9 2.8 2.8.9-2.8.9-.9 2.8-.9-2.8-2.8-.9 2.8-.9.9-2.8Z" fill="${theme.primary}"/>
      </svg>
    </button>
  `;

  // 5. Manejadores de Eventos y Comunicación con Backend
  const toggleBtn = document.getElementById('ark-bot-toggle');
  const card = document.getElementById('ark-bot-card');
  const closeBtn = document.getElementById('ark-bot-close');
  const input = document.getElementById('ark-bot-input');
  const sendBtn = document.getElementById('ark-bot-send');
  const messagesBox = document.getElementById('ark-bot-messages');
  const chipsBox = document.getElementById('ark-bot-chips');

  const history = [];

  function openBot() {
    card.classList.add('open');
    container.classList.add('is-open');
    card.removeAttribute('inert');
    card.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
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

  function appendMessage(role, text, actionData) {
    const msg = document.createElement('div');
    msg.className = `ark-msg ark-msg-${role}`;
    msg.textContent = String(text ?? '');

    if (actionData && actionData.whatsapp_url) {
      const action = document.createElement('div');
      action.className = 'ark-msg-action';

      const amount = Number(actionData.estimated_total);
      if (Number.isFinite(amount) && amount >= 0) {
        const price = document.createElement('div');
        price.style.cssText = 'font-size:11px;color:#AEB8BE;margin-bottom:4px;';
        price.append('Tarifa estimada: ');
        const strong = document.createElement('strong');
        strong.style.color = theme.primary;
        strong.textContent = `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
        price.appendChild(strong);
        action.appendChild(price);
      }

      let whatsappUrl;
      try {
        const parsedUrl = new URL(String(actionData.whatsapp_url));
        if (
          parsedUrl.protocol !== 'https:' ||
          !['wa.me', 'api.whatsapp.com'].includes(parsedUrl.hostname) ||
          parsedUrl.username ||
          parsedUrl.password ||
          parsedUrl.port
        ) {
          throw new Error('Dominio de WhatsApp no permitido');
        }
        whatsappUrl = parsedUrl.href;
      } catch (error) {
        console.error('El asistente devolvió una URL de WhatsApp no válida.', error);
        const warning = document.createElement('div');
        warning.style.cssText = 'font-size:11px;color:#FCA5A5;';
        warning.textContent = 'No pudimos preparar un enlace seguro de WhatsApp. Intenta de nuevo más tarde.';
        action.appendChild(warning);
      }

      if (whatsappUrl) {
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'ark-action-btn';
        link.textContent = '💬 Agendar por WhatsApp  →';
        action.appendChild(link);
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
    chipsBox.style.display = 'none'; // ocultar chips después del primer envío

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

      if (!res.ok) throw new Error('Error al conectar con el servidor.');
      const data = await res.json();

      const reply = data.reply || 'Estamos listos para atenderte. ¿Deseas contactar por WhatsApp?';
      appendMessage('assistant', reply, data);
      history.push({ role: 'assistant', content: reply });

    } catch (err) {
      removeTyping();
      console.error('No se pudo enviar el mensaje al asistente.', err);
      appendMessage('assistant', 'Disculpa, tuve un detalle al conectar con el servicio. ¿Podrías volver a escribirnos o contactarnos directo por WhatsApp?');
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  chipsBox.querySelectorAll('.ark-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.getAttribute('data-msg');
      if (msg) sendMessage(msg);
    });
  });

})();
