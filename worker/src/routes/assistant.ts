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
2. Identifica al proveedor más idóneo de la lista (por ejemplo: problemas de agua/gas/fugas -> baakal; impuestos/contabilidad/SAT -> contagram; alimentos gourmet -> temozonia; software/ecommerce -> ark).
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
      bestTenantSlug = 'contagram';
    } else if (lowerQuery.includes('carne') || lowerQuery.includes('ahumad') || lowerQuery.includes('comida') || lowerQuery.includes('costilla')) {
      bestTenantSlug = 'temozonia';
    } else if (lowerQuery.includes('plomer') || lowerQuery.includes('fuga') || lowerQuery.includes('gas') || lowerQuery.includes('boiler') || lowerQuery.includes('agua') || lowerQuery.includes('drenaje') || lowerQuery.includes('tubo')) {
      bestTenantSlug = 'baakal';
    } else {
      bestTenantSlug = 'contagram';
    }

    const matchedTenant = providersMap.get(bestTenantSlug) || providersList[0];
    const firstService = matchedTenant.services[0];

    return c.json({
      success: true,
      explanation: `Para lo que necesitas, te recomiendo a ${matchedTenant.name}. Cuentan con atención garantizada y precios transparentes.`,
      recommended_tenant: {
        id: matchedTenant.id,
        name: matchedTenant.name,
        slug: matchedTenant.slug,
        whatsapp: matchedTenant.whatsapp,
        target_url: `/stores/${matchedTenant.slug}.html`,
        matched_services: [
          {
            id: firstService.id,
            name: firstService.name,
            price: firstService.price
          }
        ],
        estimated_total: firstService.price
      }
    });

  } catch (err: any) {
    console.error('Error en assistant/recommend:', err);
    return c.json({ error: 'Error procesando recomendación.', details: err.message }, 500);
  }
});

export default assistantRoute;
