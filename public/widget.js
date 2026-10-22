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
    contagram: {
      primary: '#D4AF37', // Oro caligráfico
      accent: '#0A192F',  // Azul persa
      title: 'Contagram · Concierge Fiscal',
      subtitle: 'Contabilidad & Honorarios B2B',
      avatar: '🏛️',
      greeting: 'Bienvenido a Contagram. Soy tu asistente contable agéntico. ¿Necesitas regularización del SAT, declaración anual o auditoría PyME?',
      chips: ['📊 Declaración Anual', '📑 Contabilidad PyME', '⚖️ Opinión de Cumplimiento', '💳 Honorarios y SPEI']
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
    .ark-bot-btn {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: ${theme.primary};
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      border: 2px solid rgba(255,255,255,0.2);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .ark-bot-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 32px rgba(0,0,0,0.45);
    }
    .ark-bot-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      background: #25D366;
      border: 2.5px solid #121417;
      border-radius: 50%;
    }
    .ark-bot-card {
      position: absolute;
      bottom: 74px;
      right: 0;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 110px);
      background: #121417;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .ark-bot-card.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .ark-bot-header {
      background: #181C22;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 14px 18px;
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
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .ark-bot-header-title {
      font-weight: 700;
      font-size: 14px;
      color: #FFFFFF;
      letter-spacing: -0.2px;
    }
    .ark-bot-header-sub {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 2px;
    }
    .ark-bot-close-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: color 0.2s;
    }
    .ark-bot-close-btn:hover { color: #FFFFFF; }
    .ark-bot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ark-msg {
      max-width: 84%;
      font-size: 13px;
      line-height: 1.45;
      padding: 10px 14px;
      border-radius: 14px;
      word-break: break-word;
    }
    .ark-msg-assistant {
      background: #1F242C;
      color: #E5E7EB;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .ark-msg-user {
      background: ${theme.primary};
      color: #FFFFFF;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      font-weight: 500;
    }
    .ark-msg-action {
      margin-top: 8px;
      padding: 10px;
      background: #0E1013;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
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
      border-radius: 8px;
      text-decoration: none;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .ark-action-btn:hover { background: #22bf5b; }
    .ark-bot-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 16px 12px;
    }
    .ark-chip {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: #D1D5DB;
      font-size: 11px;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ark-chip:hover {
      background: rgba(255,255,255,0.12);
      color: #FFFFFF;
      border-color: ${theme.primary};
    }
    .ark-bot-input-bar {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: #181C22;
      display: flex;
      gap: 8px;
    }
    .ark-bot-input {
      flex: 1;
      background: #0E1013;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      color: #FFFFFF;
      font-size: 13px;
      padding: 10px 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ark-bot-input:focus {
      border-color: ${theme.primary};
    }
    .ark-bot-send-btn {
      background: ${theme.primary};
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      width: 40px;
      height: 40px;
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
  `;
  document.head.appendChild(style);

  // 4. Estructura HTML del Widget
  container.innerHTML = `
    <div class="ark-bot-card" id="ark-bot-card">
      <div class="ark-bot-header">
        <div class="ark-bot-header-left">
          <div class="ark-bot-avatar">${theme.avatar}</div>
          <div>
            <div class="ark-bot-header-title">${theme.title}</div>
            <div class="ark-bot-header-sub">${theme.subtitle}</div>
          </div>
        </div>
        <button class="ark-bot-close-btn" id="ark-bot-close">&times;</button>
      </div>

      <div class="ark-bot-messages" id="ark-bot-messages">
        <div class="ark-msg ark-msg-assistant">
          ${theme.greeting}
        </div>
      </div>

      <div class="ark-bot-chips" id="ark-bot-chips">
        ${theme.chips.map(chip => `<button class="ark-chip" data-msg="${chip}">${chip}</button>`).join('')}
      </div>

      <div class="ark-bot-input-bar">
        <input type="text" class="ark-bot-input" id="ark-bot-input" placeholder="Escribe tu consulta o cotización..." />
        <button class="ark-bot-send-btn" id="ark-bot-send" title="Enviar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <div class="ark-bot-btn" id="ark-bot-toggle" title="Abrir asistente">
      <div class="ark-bot-badge"></div>
      <span style="font-size: 26px;">💬</span>
    </div>
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
    input.focus();
  }

  function closeBot() {
    card.classList.remove('open');
  }

  toggleBtn.addEventListener('click', () => {
    if (card.classList.contains('open')) closeBot();
    else openBot();
  });

  closeBtn.addEventListener('click', closeBot);

  function appendMessage(role, text, actionData) {
    const msg = document.createElement('div');
    msg.className = `ark-msg ark-msg-${role}`;
    
    let content = text;
    if (actionData && actionData.whatsapp_url) {
      content += `
        <div class="ark-msg-action">
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:4px;">Tarifa estimada: <strong style="color:#B4FF00;">$${Number(actionData.estimated_total || 0).toLocaleString('es-MX', {minimumFractionDigits:2})} MXN</strong></div>
          <a href="${actionData.whatsapp_url}" target="_blank" rel="noopener noreferrer" class="ark-action-btn">
            <span>💬 Agendar por WhatsApp</span>
            <span>&rarr;</span>
          </a>
        </div>
      `;
    }
    msg.innerHTML = content;
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
