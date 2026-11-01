import { Hono } from 'hono';
import type { Env, Tenant } from '../types/env';

type Variables = { tenant: Tenant | null; tenantId: string | null };

const whatsappWebhookRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// =========================================================================
// 1. GET /api/webhook/whatsapp — Verificación del Webhook de Meta
// =========================================================================
whatsappWebhookRoute.get('/', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const expectedToken = c.env.WHATSAPP_VERIFY_TOKEN || 'ark_commerce_wa_secret_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] Verificación exitosa de Meta.');
    return c.text(challenge || '', 200);
  }

  console.warn('[WhatsApp Webhook] Token de verificación inválido:', token);
  return c.text('Forbidden: Invalid verify token', 403);
});

// =========================================================================
// 2. Helper de IA y D1 para generar la respuesta de WhatsApp
// =========================================================================
async function generateAiReply(env: Env, senderName: string, text: string) {
  // 1. Consultar proveedores y servicios activos desde Cloudflare D1
  const { results } = await env.DB.prepare(`
    SELECT 
      t.id as tenant_id, 
      t.name as tenant_name, 
      t.slug as tenant_slug, 
      t.whatsapp, 
      p.id as service_id, 
      p.name as service_name, 
      p.price, 
      p.desc as service_desc
    FROM tenants t
    JOIN products p ON t.id = p.tenant_id
    WHERE p.active = 1
    ORDER BY t.name ASC, p.display_order ASC
  `).all();

  const services = (results || []) as any[];

  // Formato compacto para el contexto
  const catalogList = services.map(s => 
    `• [${s.tenant_name}]: ${s.service_name} — $${s.price} MXN (${s.service_desc || 'Atención profesional'})`
  ).join('\n');

  let replyText = '';
  let matchedTenant = 'Ark Concierge';
  let matchedService = 'Asesoría de Servicios';
  let estimatedPrice = 0;

  // 2. Llamada a Workers AI
  if (env.AI) {
    try {
      const systemPrompt = `Eres el asistente oficial de atención por WhatsApp de Ark Commerce en México.
Atiendes clientes que buscan comprar productos o contratar servicios de la red Ark Commerce (playeras personalizadas con MAREA, carnes ahumadas con Temozonia, plomería y gas con BAAKAL, climas, etc.).

CATÁLOGO EN VIVO EN D1:
${catalogList}

DATOS DE PAGO Y RESERVA:
- SPEI BBVA: 012180012345678901 (Ark Systems)
- Horario de atención: Lunes a Sábado 8:00 AM - 8:00 PM.

REGLAS DE RESPUESTA EN WHATSAPP:
1. Responde a ${senderName} de forma cordial, concisa y muy resolutiva en español de México.
2. Usa formato de WhatsApp (*negritas*, emojis).
3. Identifica la necesidad del cliente y cotiza el servicio exacto del catálogo con su precio en pesos mexicanos ($... MXN).
4. Explícale que puede confirmar respondiendo este mensaje o haciendo transferencia SPEI.
5. Devuelve ÚNICAMENTE un JSON con:
{
  "reply": "Texto formateado para WhatsApp...",
  "matched_tenant": "Nombre del proveedor",
  "matched_service": "Nombre del servicio",
  "estimated_price": 1250
}`;

      const aiResponse: any = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 512
      });

      const raw = aiResponse?.response || (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse));
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        replyText = parsed.reply || '';
        matchedTenant = parsed.matched_tenant || matchedTenant;
        matchedService = parsed.matched_service || matchedService;
        estimatedPrice = Number(parsed.estimated_price || 0);
      }
    } catch (aiErr: any) {
      console.warn('[WhatsApp Webhook] Fallback Workers AI:', aiErr?.message);
    }
  }

  // 3. Fallback Heurístico si AI no responde
  if (!replyText) {
    const lower = text.toLowerCase();
    if (lower.includes('gas') || lower.includes('fuga') || lower.includes('plomer') || lower.includes('boiler') || lower.includes('agua') || lower.includes('drenaje')) {
      matchedTenant = 'BAAKAL — Plomería & Gas';
      matchedService = 'Reparación de Fuga de Gas / Agua Urgente';
      estimatedPrice = 850;
      replyText = `¡Hola *${senderName}*! 👋 Gracias por escribir a *BAAKAL (Plomería & Gas)*.\n\n🛠️ Atendemos fugas de gas y emergencias hidráulicas en el Sureste Mexicano con técnicos certificados.\n\n💰 *Tarifa estimada de revisión/reparación:* $${estimatedPrice.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN.\n\n📍 ¿En qué zona o colonia te encuentras para coordinar el arribo de la unidad?`;
    } else if (lower.includes('playera') || lower.includes('estamp') || lower.includes('ropa') || lower.includes('marea') || lower.includes('talla') || lower.includes('camiseta') || lower.includes('merch')) {
      matchedTenant = 'MAREA · Playeras Personalizadas';
      matchedService = 'Playera Personalizada Caribeña';
      estimatedPrice = 349;
      replyText = `¡Hola *${senderName}*! 🌊 Gracias por escribir a *MAREA (Playeras del Sureste)*.\n\n👕 Estampamos playeras 100% algodón peinado con diseños del Caribe y personalizadas desde 1 pieza.\n\n💰 *Tarifa desde:* $${estimatedPrice.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN (Envío GRATIS en 2+ playeras).\n\n¿Tienes un diseño listo para estampar o quieres ver el catálogo oficial?`;
    } else {
      matchedTenant = 'Ark Commerce';
      matchedService = 'Atención General';
      estimatedPrice = 0;
      replyText = `¡Hola *${senderName}*! 👋 Bienvenido a la red de tiendas y servicios de *Ark Commerce*.\n\nTe conectamos directo con:\n• 👕 *Playeras Personalizadas (MAREA)*\n• 🥩 *Carnes Ahumadas (Temozonia)*\n• 🔧 *Plomería & Gas (BAAKAL)*\n\nCuéntame qué buscas y te cotizo al instante.`;
    }
  }

  return { replyText, matchedTenant, matchedService, estimatedPrice };
}

// =========================================================================
// 3. POST /api/webhook/whatsapp — Recepción de Mensajes Entrantes de Meta
// =========================================================================
whatsappWebhookRoute.post('/', async (c) => {
  try {
    const body = await c.req.json<any>();

    // Verificar que sea un evento de WhatsApp Business Account
    if (body.object !== 'whatsapp_business_account') {
      return c.json({ status: 'ignored_non_whatsapp_object' }, 200);
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    // Si es recibo de entrega o lectura (statuses), retornar 200 OK
    if (!messages || messages.length === 0) {
      return c.json({ status: 'ignored_status_update' }, 200);
    }

    const message = messages[0];
    const from = message.from; // Número de WhatsApp del cliente (e.g. "5219991234567")
    const msgId = message.id;
    const msgText = message.text?.body || message.caption || '[Mensaje no de texto]';
    const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';
    const phoneNumberId = value.metadata?.phone_number_id || c.env.WHATSAPP_PHONE_NUMBER_ID;

    console.log(`[WhatsApp Inbound] De: ${contactName} (${from}) - Mensaje: "${msgText}"`);

    // Guardar mensaje entrante en D1
    const inboundId = `in_${msgId || Date.now()}`;
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO whatsapp_messages (id, phone, sender_name, direction, message_text, status)
      VALUES (?, ?, ?, 'inbound', ?, 'received')
    `).bind(inboundId, from, contactName, msgText).run();

    // Generar respuesta con IA + D1
    const { replyText, matchedTenant, matchedService, estimatedPrice } = await generateAiReply(c.env, contactName, msgText);

    // Guardar mensaje saliente en D1
    const outboundId = `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await c.env.DB.prepare(`
      INSERT INTO whatsapp_messages (id, phone, sender_name, direction, message_text, matched_tenant, matched_service, estimated_price, status)
      VALUES (?, ?, ?, 'outbound', ?, ?, ?, ?, 'sent')
    `).bind(outboundId, from, matchedTenant, replyText, matchedTenant, matchedService, estimatedPrice).run();

    // Enviar respuesta a través de Meta Graph API si los tokens están configurados
    let metaSent = false;
    let metaError: string | null = null;

    if (c.env.WHATSAPP_API_TOKEN && phoneNumberId) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: 'text',
            text: { body: replyText }
          })
        });

        if (metaRes.ok) {
          metaSent = true;
          console.log(`[WhatsApp Outbound] Enviado exitosamente vía Meta Graph API a ${from}`);
        } else {
          metaError = await metaRes.text();
          console.error('[WhatsApp Outbound] Error de Meta Graph API:', metaError);
        }
      } catch (err: any) {
        metaError = err.message;
        console.error('[WhatsApp Outbound] Excepción al llamar a Meta:', err);
      }
    } else {
      console.log('[WhatsApp Outbound] Modo simulación (WHATSAPP_API_TOKEN pendiente de configurar). Respuesta lista para entregar.');
    }

    return c.json({
      status: 'ok',
      replied: true,
      meta_api_sent: metaSent,
      meta_error: metaError,
      sender: { name: contactName, phone: from },
      tenant_recommended: matchedTenant,
      service_quoted: matchedService,
      estimated_price: estimatedPrice,
      reply_text: replyText
    }, 200);

  } catch (err: any) {
    console.error('[WhatsApp Webhook] Error interno:', err);
    return c.json({ error: 'Error procesando webhook.', details: err.message }, 500);
  }
});

// =========================================================================
// 4. POST /api/webhook/whatsapp/simulate — Simulador de Mensaje WhatsApp
// =========================================================================
whatsappWebhookRoute.post('/simulate', async (c) => {
  try {
    const body = await c.req.json<{ phone?: string; name?: string; message: string }>();
    const phone = body.phone || '5219991234567';
    const name = body.name || 'Cliente Demo';
    const message = body.message?.trim();

    if (!message) {
      return c.json({ error: 'El campo message es requerido.' }, 400);
    }

    // Ejecuta la lógica agéntica de IA y D1
    const { replyText, matchedTenant, matchedService, estimatedPrice } = await generateAiReply(c.env, name, message);

    // Guarda en D1 para auditoría
    const logId = `sim_${Date.now()}`;
    await c.env.DB.prepare(`
      INSERT INTO whatsapp_messages (id, phone, sender_name, direction, message_text, matched_tenant, matched_service, estimated_price, status)
      VALUES (?, ?, ?, 'outbound', ?, ?, ?, ?, 'simulated')
    `).bind(logId, phone, name, replyText, matchedTenant, matchedService, estimatedPrice).run();

    return c.json({
      success: true,
      simulation: true,
      sender: { name, phone },
      inbound_message: message,
      ai_response: {
        text: replyText,
        matched_tenant: matchedTenant,
        matched_service: matchedService,
        estimated_price: estimatedPrice
      }
    });
  } catch (err: any) {
    return c.json({ error: 'Error en simulador.', details: err.message }, 500);
  }
});

// =========================================================================
// 5. GET /api/webhook/whatsapp/history — Historial de Mensajes y Leads en D1
// =========================================================================
whatsappWebhookRoute.get('/history', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, phone, sender_name, direction, message_text, matched_tenant, matched_service, estimated_price, status, created_at
      FROM whatsapp_messages
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    return c.json({
      success: true,
      total: results?.length || 0,
      messages: results || []
    });
  } catch (err: any) {
    return c.json({ error: 'Error obteniendo historial.', details: err.message }, 500);
  }
});

export default whatsappWebhookRoute;