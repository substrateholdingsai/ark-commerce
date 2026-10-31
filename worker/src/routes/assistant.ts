import { Hono } from 'hono';
import type { Env, Tenant } from '../types/env';

type Variables = { tenant: Tenant | null; tenantId: string | null };

const assistantRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

interface RecommendRequest {
  query: string;
  location?: string;
}

assistantRoute.post('/recommend', async (c) => {
  try {
    const body = await c.req.json<RecommendRequest>();
    const query = body.query?.trim();

    if (!query) {
      return c.json({ error: 'La consulta no puede estar vacía.' }, 400);
    }

    // 1. Consultar proveedores y servicios activos desde Cloudflare D1
    const { results } = await c.env.DB.prepare(`
      SELECT 
        t.id as tenant_id, 
        t.name as tenant_name, 
        t.slug as tenant_slug, 
        t.whatsapp, 
        t.theme_color,
        p.id as service_id, 
        p.name as service_name, 
        p.price, 
        p.weight as service_scope,
        p.desc as service_desc, 
        p.badge
      FROM tenants t
      JOIN products p ON t.id = p.tenant_id
      WHERE p.active = 1
      ORDER BY t.name ASC, p.display_order ASC
    `).all();

    if (!results || results.length === 0) {
      return c.json({
        message: 'No hay proveedores de servicios registrados actualmente.',
        recommended: null
      });
    }

    // 2. Agrupar servicios por tenant para crear el contexto de proveedores
    const providersMap = new Map<string, any>();
    for (const r of results as any[]) {
      if (!providersMap.has(r.tenant_id)) {
        providersMap.set(r.tenant_id, {
          id: r.tenant_id,
          name: r.tenant_name,
          slug: r.tenant_slug,
          whatsapp: r.whatsapp,
          theme_color: r.theme_color,
          services: []
        });
      }
      providersMap.get(r.tenant_id).services.push({
        id: r.service_id,
        name: r.service_name,
        price: r.price,
        scope: r.service_scope,
        desc: r.service_desc,
        badge: r.badge
      });
    }

    const providersList = Array.from(providersMap.values());

    // 3. System Prompt para el Asistente Concierge de Ark
    const systemPrompt = `
Eres "Ark Concierge", el asistente de inteligencia artificial de Ark Commerce en el Sureste Mexicano (Mérida, Yucatán y alrededores).
Tu misión es conectar de forma precisa y empática a personas que tienen una necesidad con el prestador de servicios ideal de nuestra red de confianza.

PROVEEDORES Y SERVICIOS ACTIVOS EN NUESTRA BASE DE DATOS D1:
${JSON.stringify(providersList, null, 2)}

INSTRUCCIONES CLAVE:
1. Analiza el problema, urgencia o solicitud del usuario: "${query}".
2. Identifica al proveedor más idóneo de la lista (por ejemplo: problemas de agua/gas/fugas -> baakal; playeras/ropa personalizada/merch -> marea; alimentos gourmet/carnes ahumadas -> temozonia; software/ecommerce/servicios digitales -> ark).
3. Selecciona el servicio o combinación de servicios específicos que resuelven su necesidad con sus precios reales.
4. Responde en tono profesional, ágil, directo y con calidez mexicana. Explica brevemente por qué recomiendas a ese proveedor y cuánto costará aproximadamente el servicio.
5. Devuelve SIEMPRE tu respuesta estructurada estrictamente en formato JSON con la siguiente estructura (sin bloques markdown extras):

{
  "explanation": "Texto conversacional explicando la recomendación al usuario...",
  "recommended_tenant": {
    "id": "slug_del_tenant",
    "name": "Nombre comercial",
    "slug": "slug",
    "whatsapp": "whatsapp_del_tenant",
    "target_url": "/stores/slug.html",
    "matched_services": [
      {
        "id": "service_id",
        "name": "Nombre del servicio",
        "price": 0.00
      }
    ],
    "estimated_total": 0.00
  }
}
`;

    // 4. Si Cloudflare Workers AI está disponible, ejecutamos la inferencia con Llama 3.3
    if (c.env.AI) {
      try {
        const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        });

        const rawText = aiResponse?.response || (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse));
        
        // Intentar parsear el JSON devuelto por el LLM
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return c.json({ success: true, ...parsed });
        }
      } catch (aiErr: any) {
        console.warn('Fallback de Workers AI:', aiErr?.message);
      }
    }

    // 5. Fallback Heurístico Determinista de Alta Velocidad (por si AI no está configurada o falla)
    const lowerQuery = query.toLowerCase();
    let bestTenantSlug = 'baakal';

    if (lowerQuery.includes('conta') || lowerQuery.includes('fiscal') || lowerQuery.includes('sat') || lowerQuery.includes('factur') || lowerQuery.includes('impuest') || lowerQuery.includes('nómina') || lowerQuery.includes('imss')) {
      bestTenantSlug = 'ark';
    } else if (lowerQuery.includes('carne') || lowerQuery.includes('ahumad') || lowerQuery.includes('comida') || lowerQuery.includes('costilla')) {
      bestTenantSlug = 'temozonia';
    } else if (lowerQuery.includes('playera') || lowerQuery.includes('camiseta') || lowerQuery.includes('ropa') || lowerQuery.includes('estamp') || lowerQuery.includes('personaliz') || lowerQuery.includes('talla') || lowerQuery.includes('merch') || lowerQuery.includes('textil') || lowerQuery.includes('marea') || lowerQuery.includes('serigraf')) {
      bestTenantSlug = 'marea';
    } else if (lowerQuery.includes('plomer') || lowerQuery.includes('fuga') || lowerQuery.includes('gas') || lowerQuery.includes('boiler') || lowerQuery.includes('agua') || lowerQuery.includes('drenaje') || lowerQuery.includes('tubo')) {
      bestTenantSlug = 'baakal';
    } else {
      bestTenantSlug = 'ark';
    }

    const matchedTenant = providersMap.get(bestTenantSlug) || providersList[0];
    const firstService = matchedTenant.services[0];
    const estimatedTotal = firstService ? firstService.price : 0;

    // Resolver target_url amigable
    const targetUrl = matchedTenant.slug === 'temozonia' ? '/temozonia' :
                      matchedTenant.slug === 'baakal' ? '/baakal' :
                      matchedTenant.slug === 'marea' ? '/marea' :
                      `/stores/${matchedTenant.slug}.html`;

    // Registrar lead en D1 (canal: web_concierge)
    try {
      const leadId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await c.env.DB.prepare(`
        INSERT INTO whatsapp_messages (id, tenant_id, phone, sender_name, direction, message_text, matched_tenant, matched_service, estimated_price, status)
        VALUES (?, ?, ?, 'Visitante Web', 'web_concierge', ?, ?, ?, ?, 'lead')
      `).bind(
        leadId,
        matchedTenant.id,
        matchedTenant.whatsapp || 'Web Lead',
        query,
        matchedTenant.name,
        firstService?.name || 'Servicio recomendado',
        estimatedTotal
      ).run();
    } catch (logErr) {
      console.warn('No se pudo registrar lead web en D1:', logErr);
    }

    return c.json({
      success: true,
      explanation: `Para lo que necesitas, te recomiendo a ${matchedTenant.name}. Cuentan con atención garantizada y precios transparentes.`,
      recommended_tenant: {
        id: matchedTenant.id,
        name: matchedTenant.name,
        slug: matchedTenant.slug,
        whatsapp: matchedTenant.whatsapp,
        target_url: targetUrl,
        matched_services: [
          {
            id: firstService.id,
            name: firstService.name,
            price: firstService.price
          }
        ],
        estimated_total: estimatedTotal
      }
    });

  } catch (err: any) {
    console.error('Error en assistant/recommend:', err);
    return c.json({ error: 'Error procesando recomendación.', details: err.message }, 500);
  }
});

// =========================================================================
// POST /api/assistant/chat — Asistente Conversacional para Tenant Específico (Widget)
// =========================================================================
interface ChatRequest {
  tenant: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

assistantRoute.post('/chat', async (c) => {
  try {
    const body = await c.req.json<ChatRequest>();
    const tenantSlug = body.tenant?.trim().toLowerCase();
    const message = body.message?.trim();
    const history = body.history || [];

    if (!tenantSlug || !message) {
      return c.json({ error: 'Tenant y mensaje son requeridos.' }, 400);
    }

    // 1. Obtener datos del Tenant en D1
    const { results: tenantRows } = await c.env.DB.prepare(`
      SELECT id, name, slug, whatsapp, theme_color
      FROM tenants
      WHERE slug = ? OR id = ?
      LIMIT 1
    `).bind(tenantSlug, tenantSlug).all();

    if (!tenantRows || tenantRows.length === 0) {
      return c.json({ error: `Tenant '${tenantSlug}' no encontrado.` }, 404);
    }

    const tenant = tenantRows[0] as any;

    // 2. Obtener catálogo y servicios activos del tenant
    const { results: productRows } = await c.env.DB.prepare(`
      SELECT id, name, price, weight as scope, desc, badge
      FROM products
      WHERE tenant_id = ? AND active = 1
      ORDER BY display_order ASC
    `).bind(tenant.id).all();

    const services = (productRows || []) as any[];

    // 3. Formatear catálogo para el LLM
    const catalogSummary = services.map(s => 
      `- [ID: ${s.id}] ${s.name}: $${s.price} MXN. Descripción: ${s.desc || 'Servicio profesional'}. Alcance: ${s.scope || 'Estándar'}`
    ).join('\n');

    let reply = '';
    let matchedServiceIds: string[] = [];
    let estimatedTotal = 0;
    let whatsappMessage = `Hola ${tenant.name}, vengo del asistente web y me interesa consultar sobre: "${message}"`;

    // 4. Intentar Workers AI si el binding está presente
    if (c.env.AI) {
      try {
        const systemPrompt = `Eres el asistente agéntico de ventas oficial de "${tenant.name}" (${tenant.slug}).
Tu misión es atender dudas de clientes en México, entender su problema o necesidad y cotizar con precisión según los servicios o productos disponibles.

CATÁLOGO OFICIAL Y PRECIOS:
${catalogSummary}

REGLAS DE ATENCIÓN:
1. Responde en español (México) de manera concisa, educada y profesional.
2. Identifica cuál de los servicios del catálogo soluciona el problema y menciona el precio en pesos mexicanos ($... MXN).
3. Invita al cliente a formalizar por WhatsApp.
4. Devuelve ÚNICAMENTE un objeto JSON válido (sin código markdown ni explicaciones adicionales) con el siguiente formato:
{
  "reply": "Tu respuesta conversacional directa al cliente...",
  "matched_service_ids": ["ID1"],
  "estimated_total": 1200,
  "whatsapp_message": "Hola ${tenant.name}! Me interesa agendar el servicio X..."
}`;

        const messages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt }
        ];

        // Añadir historial previo si existe
        for (const h of history.slice(-4)) {
          messages.push({ role: h.role, content: h.content });
        }

        messages.push({ role: 'user', content: message });

        const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
          messages,
          temperature: 0.3,
          max_tokens: 512
        });

        const rawText = aiResponse?.response || (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse));
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          reply = parsed.reply || '';
          matchedServiceIds = parsed.matched_service_ids || [];
          estimatedTotal = Number(parsed.estimated_total || 0);
          if (parsed.whatsapp_message) {
            whatsappMessage = parsed.whatsapp_message;
          }
        }
      } catch (aiErr: any) {
        console.warn('Fallback en Workers AI chat:', aiErr?.message);
      }
    }

    // 5. Fallback Heurístico si AI no devolvió respuesta
    if (!reply) {
      const lowerMsg = message.toLowerCase();
      let matched = services.find(s => 
        lowerMsg.includes(s.name.toLowerCase()) || 
        (s.desc && lowerMsg.split(' ').some((w: string) => w.length > 3 && s.desc.toLowerCase().includes(w)))
      );

      if (!matched && services.length > 0) {
        matched = services[0];
      }

      if (matched) {
        reply = `Con gusto te asesoramos en ${tenant.name}. Para lo que describes te recomendamos "${matched.name}" con una tarifa de $${matched.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN. ¿Te gustaría formalizar la cita o pedido por WhatsApp?`;
        matchedServiceIds = [matched.id];
        estimatedTotal = matched.price;
        whatsappMessage = `Hola ${tenant.name}, me interesa contratar: ${matched.name} ($${matched.price} MXN). Vengo del asistente virtual.`;
      } else {
        reply = `Gracias por escribir a ${tenant.name}. Podemos apoyarte de inmediato. ¿Deseas que un asesor te contacte directamente por WhatsApp?`;
      }
    }

    // 6. Obtener lista de servicios sugeridos con detalles
    const matchedServices = services.filter(s => matchedServiceIds.includes(s.id));
    if (matchedServices.length > 0 && estimatedTotal === 0) {
      estimatedTotal = matchedServices.reduce((sum, s) => sum + (s.price || 0), 0);
    }

    const cleanWhatsapp = (tenant.whatsapp || '529994918221').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

    // Registrar lead en D1 (canal: store_widget)
    try {
      const widgetLeadId = `widget_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await c.env.DB.prepare(`
        INSERT INTO whatsapp_messages (id, tenant_id, phone, sender_name, direction, message_text, matched_tenant, matched_service, estimated_price, status)
        VALUES (?, ?, ?, 'Visitante Tienda', 'store_widget', ?, ?, ?, ?, 'lead')
      `).bind(
        widgetLeadId,
        tenant.id,
        cleanWhatsapp,
        message,
        tenant.name,
        matchedServices[0]?.name || 'Consulta en tienda',
        estimatedTotal
      ).run();
    } catch (logErr) {
      console.warn('No se pudo registrar lead widget en D1:', logErr);
    }

    return c.json({
      success: true,
      reply,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        whatsapp: tenant.whatsapp,
        theme_color: tenant.theme_color
      },
      suggested_services: matchedServices,
      estimated_total: estimatedTotal,
      whatsapp_message: whatsappMessage,
      whatsapp_url: whatsappUrl
    });

  } catch (err: any) {
    console.error('Error en assistant/chat:', err);
    return c.json({ error: 'Error procesando mensaje.', details: err.message }, 500);
  }
});

export default assistantRoute;
