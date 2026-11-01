# 📁 Project Map — Ark Commerce (Multi-Tenant Platform)

## 1. Arquitectura y Recursos Cloudflare Oficiales
- **Worker Name**: `ark-commerce`
- **Base de Datos D1**: `ark-commerce-db` (`874b300a-18f6-4995-a98e-27abd7264662`)
- **Bucket R2**: `ark-commerce-storage`
- **Queue**: `ark-commerce-orders` (binding: `ORDER_QUEUE`)
- **Custom Domain**: `tiendas.arksystems.site` (route en `wrangler.toml`)
- **KV Namespaces**:
  - `SESSION` (`316c37d5fe864e4bab912a0dbbe6b00a`) - Sesiones admin + sesiones de cliente
  - `CACHE` (`90269c9d7ede4252b21463bf9834f64d`) - Caché de tenants + Rate Limiting por IP
- **Email**: Resend (`RESEND_API_KEY`, `EMAIL_FROM`) para magic links; fallback a log en desarrollo
- **Logística**: Envia.com (`ENVIA_API_KEY`, `ENVIA_SANDBOX`) para cotización, guías y rastreo; modo simulado si no hay API key

## 2. Tiendas y Tenants (Multi-Tenant)
1. **Ark Systems / Ark Commerce** (`ark`): Plataforma y ecosistema principal por defecto en `/`.
   - Posicionamiento: **Ark Commerce** — ecosistema de tiendas especializadas, gastronomía artesanal, moda/streetwear y servicios técnicos verificados (plomería, gas, climas, electricidad) con asistente 3D IA **Ark** y checkout directo (SaaS $299/mes para negocios y marcas)
   - Canon de diseño: **ARK PULSE v1.0** (`docs/ark_designsystem.md`)
   - Tema: Dark arquitectónico con acento Lima (`#B4FF00`)
   - Admin: `admin@arksystems.ai` / `admin123`

2. **Temozonia Carnes Ahumadas** (`temozonia`): Cliente hosteado en `/temozonia` o vía subdominio `temozonia.*` / query `?tenant=temozonia`.
   - Catálogo: 5 productos de carnes ahumadas artesanales (Carne Ahumada 1kg, Costillas BBQ 1kg, Chorizo 500g, Salchichón 300g, Pack Degustación 2.3kg)
   - Canon de diseño: Smoke & Amber (`docs/designsystem.md`)
   - Admin: `admin@temozonia.com` / `admin123`
   - Configuración en D1 incluye dominio: `temozonia.substrateholdingsai.workers.dev`

3. **Baakal — Plomería & Gas** (`baakal`): Huésped oficial de Servicios Técnicos & Oficios de Campo en `/baakal`.
   - Servicios: Destape con video boroscópico, Instalación de boiler/calentador, Fugas de gas LP, Hidroneumáticos & cisternas
   - Canon de diseño: **BAAKAL v1.0** (`docs/baakal_designsystem.md`)
   - Modelo UX: Arquetipo B de Campo (Tarifario transparente, tarjeta con filete de cobre, urgencia 24h, presupuesto formal)
   - Paleta: Verde Selva (`#1A2F2A`), Agua Turquesa (`#2A7F9E`), Cobre (`#B87333`), Terracota (`#C86B4A`), Cal (`#F5F1E8`)
   - Cobro: Pago en sitio o Transferencia SPEI BBVA (`0121 8000 9988 7766 55`) y WhatsApp (`+52 999 123 4567`)

4. **MAREA — Playeras Personalizadas** (`marea`): Tienda retail de moda y streetwear caribeño en `/marea` y `/stores/marea.html`.
   - Catálogo: 8 playeras personalizadas con generador SVG dinámico (Ola Nocturna, Sol de Tulum, Espíritu Selva, Marea Tricolor, Coral Vivo, MANGO Beach, Máscara Marina, Ola Espuma)
   - Canon de diseño: **MAREA v1.0** (`docs/tienda-playeras-marea.md`)
   - Modelo UX: Retail joven y festivo, Regla del 12% festivo, selector de tallas S a XXL, personalizador de diseño propio
   - Paleta: Arena (`#FFF9F0`), Teal (`#0EA9A8` / `#087F7E`), Coral (`#E94E49` / `#C53732`), Mango (`#FFB947`), Noche (`#0F2E2C`)
   - Cobro: Transferencia SPEI BBVA (`0121 8000 1234 5678 90`), Ticket WhatsApp en 1 clic, Cotización C.P. Envia.com y pago contra entrega local en Riviera Maya / Mérida
   - Admin: `admin@marea.mx` / `admin123`

## 3. Stack Tecnológico
| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | [Astro 5](https://astro.build/) + [React 19](https://react.dev/) | SSG/SSR, Islands interactivos, SEO |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) | Diseño tokenizado |
| **Backend** | [Hono 4.6](https://hono.dev/) | API ligera edge-first compatible con Web Standards |
| **Estado** | [Zustand 5](https://zustand-demo.pmnd.rs/) | Carrito reactivo + auth de cliente + tarifa de envío |
| **DB** | [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite serverless multi-tenant |
| **Cache/Sesiones** | [Cloudflare KV](https://developers.cloudflare.com/kv/) | Caché de tenants (1h TTL), sesiones admin (24h), cliente (30d) y Rate Limiting por IP |
| **Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) | Subida y almacenamiento seguro de imágenes (MIME/5MB check + CSP sandbox) |
| **Colas** | [Cloudflare Queues](https://developers.cloudflare.com/queues/) | Procesamiento asíncrono de órdenes |
| **Email** | [Resend](https://resend.com/) | Magic links de acceso cliente |
| **Logística** | [Envia.com](https://envia.com/) | Cotización, guías PDF y rastreo de paquetería MX |
| **IA & 3D** | [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) + [Spline 3D](https://spline.design/) | Asistente agéntico **Ark** (`@cf/meta/llama-3.1-8b-instruct`) + avatar 3D interactivo y dictado de voz `es-MX` |
| **Seguridad** | Web Crypto (SHA-256, PBKDF2, HMAC-SHA256) + Edge Shield (`security.ts`) | Geofencing (`cf-ipcountry`), Rate Limiting por IP, Anti-Prompt Injection, Constant-time Auth y firmas Meta |
| **Tooling** | TypeScript 5.6, Wrangler 4.149, Python (Pillow, ReportLab, openpyxl) | Desarrollo, deploy edge y automatización/onboarding |

## 4. Estructura del Proyecto
```text
temozonia/
├── astro/                    # Frontend Astro legacy (archivos antiguos)
├── config/                   # Configuración centralizada (config.ts)
├── docs/                     # Documentación (map.md, designsystem.md, ark_designsystem.md, baakal_designsystem.md, tienda-playeras-marea.md)
├── products/                 # Catálogos de ejemplo (CSV/JSON) para importación
├── public/                   # Assets estáticos (favicon, imágenes, stores ejemplo)
│   ├── ark-mascot.jpg        # Avatar estático fallback del robot 3D Ark
│   ├── widget.js             # Widget universal del asistente 3D Ark (Spline 3D + Voz es-MX + Contexto por tienda)
│   ├── images/temozonia/     # Assets generados (smoke_hero, wood_tile, etc.)
│   ├── images/baakal/        # Assets generados Baakal (girih, favicon, lockup)
│   ├── images/marea/         # Assets generados Marea (vector forge + raster SEO)
│   ├── stores/               # Storefronts standalone (baakal.html, marea.html)
│   └── admin/                # Dashboard de leads protegido con Bearer auth (leads.html)
├── scripts/
│   ├── python/               # Forges (marea_vector_forge.py, marea_raster_forge.py, smoke_amber, baakal), onboarding, importadores
│   └── sql/                  # Schema D1 (schema.sql, schema_auth*.sql, schema_shipping.sql, seed.sql, baakal.sql, marea.sql)
├── src/                      # Código fuente Astro + React
│   ├── components/
│   │   ├── admin/            # Panel admin React (AdminApp.tsx)
│   │   ├── ark/              # Landing Ark Commerce (ArkLanding.tsx, AiSearchConcierge.tsx, ServiceCarousel.tsx)
│   │   ├── auth/             # AuthModal.tsx, UserMenu.tsx
│   │   ├── checkout/         # Carrito y checkout (CartDrawer.astro, CheckoutCalculator.astro con envío Envia.com)
│   │   ├── layout/           # Header, Footer, Hero
│   │   └── product/          # ProductCard
│   ├── data/                 # Datos estáticos (products.ts, services.ts)
│   ├── layouts/              # Layout principal (Layout.astro con inyección de widget.js)
│   ├── pages/                # Páginas Astro (index, temozonia, baakal, marea, admin, contacto, etc.)
│   ├── stores/               # Zustand stores (cart, customerAuth, productsCache, storeConfig)
│   ├── styles/               # CSS global (globals.css)
│   ├── types/                # Types TypeScript (product.ts, cart.ts incl. ShippingRate)
│   └── utils/                # Utilidades (constants.ts, whatsapp.ts)
├── worker/                   # Backend Hono (Cloudflare Workers)
│   ├── index.ts              # Entry point + resolución multi-tenant + cabeceras globales de seguridad
│   ├── routes/               # Rutas base (health.ts, index.ts)
│   └── src/
│       ├── lib/              # security.ts (Geofencing, Rate Limit, Anti-Injection, HMAC), auth-core.ts, cart.ts, crypto.ts, email.ts, envia.ts, tokens.ts
│       ├── routes/           # Endpoints API (products, checkout, store, admin, auth, cart, shipping, assistant, webhook_whatsapp)
│       ├── schemas/          # Validación Zod (checkout.ts)
│       └── types/            # Tipos Env, Tenant, auth (env.d.ts, auth.d.ts)
├── astro.config.mjs          # Config Astro + Cloudflare adapter
├── tailwind.config.ts        # Config Tailwind CSS
├── wrangler.toml             # Config Cloudflare Workers (bindings, vars)
├── package.json              # Scripts y dependencias
└── tsconfig.json             # Config TypeScript
```

## 5. Arquitectura (Multi-Tenant)
```text
Cliente (Navegador)
  ↓
Cloudflare CDN & Edge Security (cf-ipcountry + Rate Limit + Security Headers)
  ├─→ Astro Static (Pages: /, /temozonia, /baakal, /marea, /admin, etc.)
  └─→ Worker API (/api/*, /health)
       ├─→ security.ts (Geofencing LATAM/NA/ES, IP Sliding Window, Prompt Injection Shield)
       ├─→ D1 (tenants, tenant_users, customers, carts, store_sessions, action_tokens, customer_addresses, products, orders, order_items, whatsapp_messages)
       ├─→ KV (SESSION: sesiones admin 24h + cliente 30d, CACHE: tenants 1h + contadores rate-limit)
       ├─→ R2 (STORAGE: uploads de imágenes validadas por tenant)
       ├─→ Queues (ORDER_QUEUE: procesamiento asíncrono de órdenes checkout)
       └─→ Envia.com (cotización, generación de guía PDF, rastreo)
```

**Resolución de Tenant (`worker/index.ts`):**
1. Query param `?tenant=`
2. Header `X-Tenant-ID`
3. Subdominio (ej. `temozonia.dominio.com` → slug `temozonia`)
4. Fallback → `ark` (Ark Systems / Ark Commerce)

**Auth de cliente:** cookie httpOnly `customer_session` (30d) respaldada en KV + tabla `store_sessions`; soporta invitado, registro/login password (PBKDF2), magic link por email, merge de carrito invitado a cliente, direcciones guardadas, historial de pedidos y perfil.

**Logística (Envia.com):** cotización en vivo por CP/peso, generación de guía con PDF/tracking (restringida a sesión Admin), rastreo por transportista; fallback simulado (Redpack/Estafeta/FedEx) si no hay API key. Tarifa seleccionada se persiste en el carrito Zustand y se incluye en el mensaje WhatsApp.

## 6. API REST (Worker)
Base URL: `/api/*`

| Ruta | Método | Auth / Protección | Descripción |
|---|---|---|---|
| `/health` | GET | Público | Health check |
| `/api/store/config` | GET | Público | Configuración del tenant actual (nombre, WhatsApp, datos bancarios, BTCPay, etc.) |
| `/api/products` | GET | Público | Lista productos activos del tenant (ordenados por display_order) |
| `/api/products/:id` | GET | Público | Producto específico |
| `/api/checkout` | POST | Público + Geo + Rate Limit (8/min) | Crear orden (valida con Zod), guarda en D1, envía a `ORDER_QUEUE`, vincula `customer_id` y vacía carrito. Persiste `shipping_cost`/`carrier`/`service`. |
| `/api/cart` | GET | Cookie cliente | Obtiene/crea carrito del tenant (invitado o cliente) |
| `/api/cart` | PUT | Cookie cliente | Reemplaza items del carrito |
| `/api/cart/merge` | POST | Cookie cliente | Fusiona items entrantes con carrito actual |
| `/api/shipping/quote` | POST | Público + Geo + Rate Limit (15/min) | Cotiza tarifas Envia.com por CP/destino/peso |
| `/api/shipping/label` | POST | **Bearer token (Admin)** | Genera guía PDF/tracking y actualiza la orden en D1 (`status = 'shipped'`). Protegido contra generación no autorizada. |
| `/api/shipping/track/:carrier/:trackingNumber` | GET | Público (tenant) | Rastrea envío por transportista y guía |
| `/api/assistant/recommend` | POST | Público + Geo + Rate Limit (12/min) + Anti-Injection | Recomendación/cotización de tiendas, productos y servicios con Workers AI y precios oficiales desde D1 |
| `/api/assistant/chat` | POST | Público + Geo + Rate Limit (12/min) + Anti-Injection | Chat conversacional con el robot 3D **Ark** (`TENANT_CONTEXT` retail/servicios + precios D1) |
| `/api/webhook/whatsapp` | GET/POST | Meta HMAC-SHA256 + Rate Limit (30/min) | Webhook Meta Cloud API WhatsApp (verificación + mensajes con sanitización IA) |
| `/api/webhook/whatsapp/simulate` | POST | Rate Limit (30/min) + Anti-Injection | Simula mensaje WhatsApp para pruebas |
| `/api/webhook/whatsapp/history` | GET | Público | Historial de mensajes WhatsApp por tenant |
| `/api/auth/guest` | POST | Público + Rate Limit (10/min) | Crea sesión de invitado + carrito |
| `/api/auth/register` | POST | Público + Rate Limit (10/min) | Registro de cliente (password PBKDF2), merge de carrito invitado |
| `/api/auth/login` | POST | Público + Rate Limit (10/min) | Login cliente (PBKDF2 / SHA-256 legacy con migración), merge carrito |
| `/api/auth/logout` | POST | Cookie cliente | Revoca sesión de cliente |
| `/api/auth/me` | GET | Cookie cliente | Perfil/sesión actual (invitado o cliente) |
| `/api/auth/magic/request` | POST | Público + Rate Limit (10/min) | Solicita magic link por email (crea cliente si no existe) |
| `/api/auth/magic/callback` | GET | Público | Valida token y establece sesión de cliente |
| `/api/auth/orders` | GET | Cookie cliente | Historial de pedidos del cliente |
| `/api/auth/addresses` | GET/POST | Cookie cliente | Listar/crear direcciones guardadas |
| `/api/auth/addresses/:id/default` | PUT | Cookie cliente | Marcar dirección como default |
| `/api/auth/profile` | PUT | Cookie cliente | Actualizar perfil y dirección default |
| `/api/admin/login` | POST | Público + Rate Limit (6/min) | Login admin (hash SHA-256 + comparación `timingSafeEqualStr`), crea sesión en KV (24h) |
| `/api/admin/store` | GET/PUT | Bearer token (Admin) | Leer/actualizar configuración del tenant |
| `/api/admin/products` | GET | Bearer token (Admin) | Listar todos productos (activos/inactivos) |
| `/api/admin/products` | POST | Bearer token (Admin) | Crear producto |
| `/api/admin/products/:id` | PUT | Bearer token (Admin) | Actualizar producto |
| `/api/admin/upload` | POST | Bearer token (Admin) + MIME/5MB | Subir imagen a R2 (`tenants/{tenantId}/{timestamp}-{filename}`, solo `JPG/PNG/WEBP/AVIF/GIF` máx. 5 MB) |
| `/api/admin/files/*` | GET | Público + `nosniff` + `CSP: sandbox` | Servir archivos subidos desde R2 sin riesgo de ejecución XSS |
| `/api/admin/orders` | GET | Bearer token (Admin) | Listar órdenes (filtro opcional `?status=pending|paid|delivered`) |
| `/api/admin/orders/:id/status` | PUT | Bearer token (Admin) | Actualizar estado de orden |
| `/api/admin/leads/summary` | GET | **Bearer token (Admin)** | Métricas de leads (aisladas por tenant; vista global solo para superadmin `ark`) |
| `/api/admin/leads` | GET | **Bearer token (Admin)** | Lista de leads WhatsApp/Widget con datos de contacto (restringida por sesión admin) |

## 7. Esquema D1 (Multi-Tenant)
Tablas: `tenants`, `tenant_users`, `customers`, `carts`, `store_sessions`, `action_tokens`, `customer_addresses`, `products`, `orders`, `order_items`, `whatsapp_messages`
- `whatsapp_messages`: leads/mensajes capturados por webhook WhatsApp y widget (matched_tenant, matched_service, estimated_price, status)
- `customers`: email/password_hash (PBKDF2 o null para magic link), datos de perfil y dirección default
- `carts`: items JSON por tenant/cliente o invitado
- `store_sessions`: sesiones de cliente (token_hash, customer_id, cart_id, expires_at, revoked_at)
- `action_tokens`: magic links de acceso (expiración 15 min, uso único)
- `customer_addresses`: direcciones guardadas por cliente
- `orders`: incluye `customer_id`, `customer_email` y campos de envío (`shipping_carrier`, `shipping_service`, `shipping_tracking_number`, `shipping_tracking_url`, `shipping_label_url`, `shipping_cost`); `shipping_cost` se persiste ya en checkout a partir de la tarifa seleccionada (Envia.com) y se recalcula/actualiza al generar la guía; estados pending/paid/delivered/shipped
- `tenants`: incluye dirección de origen y `envia_api_key` para cotización/guías
- Relaciones con `ON DELETE CASCADE` entre tenant y entidades hijas
- Índices optimizados por tenant, estado, fechas y cliente
- Seed data con 4 tenants + usuarios admin + productos
- Migraciones: `schema.sql`, `schema_auth.sql`, `schema_auth2.sql`, `schema_auth3.sql`, `schema_shipping.sql`, `whatsapp_table.sql`, `baakal.sql`, `marea.sql`

## 8. Páginas Astro
| Página | Ruta | Descripción |
|---|---|---|
| `index.astro` | `/` | Landing Ark Commerce (`ArkLanding` React `client:load`). Auto-redirige si `?tenant=temozonia|baakal|marea` o subdominio |
| `temozonia.astro` | `/temozonia` | Tienda Temozonia (Layout + Hero + ProductCard grid + CheckoutCalculator con envío Envia.com) |
| `baakal.astro` | `/baakal` | Tienda Baakal (Layout + servicios técnicos + CheckoutCalculator) |
| `marea.astro` | `/marea` | Tienda MAREA Playeras Personalizadas (Hero caribeño + generador SVG + tallas S-XXL + checkout SPEI/WhatsApp) |
| `admin.astro` | `/admin` | Panel admin multi-tenant (`AdminApp` React `client:only`) |
| `test.astro` | `/test` | Página de pruebas |
| `contacto.astro` | `/contacto` | Contacto |
| `conocenos.astro` | `/conocenos` | Nosotros |
| `mayoreo.astro` | `/mayoreo` | Mayoreo |
| `recetas.astro` | `/recetas` | Recetas |
| Otras | Varios | Páginas adicionales del sitio |

## 9. Scripts y Automatización
**npm/pnpm:**
```bash
pnpm dev          # Desarrollo con Wrangler (worker + assets) - puerto 8787
pnpm deploy       # Deploy a Cloudflare Workers
pnpm astro:dev    # Solo Astro dev server (puerto 4321)
pnpm astro:build  # Build Astro
pnpm astro:preview # Preview build
pnpm build        # Build Astro + dry-run deploy Wrangler (verificación)
pnpm cf-typegen   # Generar tipos Cloudflare Env
```

**Python (`scripts/python`):**
- `marea_vector_forge.py`, `marea_raster_forge.py`: generación de assets SVG y capa raster SEO/PWA para MAREA
- `smoke_amber_forge.py`, `ark_pulse_forge.py`, `forge_baakal.py`: generación de assets visuales
- `onboard_tenant.py`: CLI interactivo de onboarding de tenants
- `excel_to_d1.py`: importador universal Excel/CSV → D1 (imágenes + upsert)
- `seed_tenants.py`: siembra de tenants oficiales en D1
- `validate_tenant.py`: health check multi-tenant (config, admin, productos, theme, API)
- `checkout_smoke_test.py`: prueba E2E del pipeline de órdenes (D1, queue, ticket WhatsApp)
- `invoice_generator.py`: generación de facturas PDF con ReportLab y theme por tenant
- `check_oficios_dist.py`, `generate_dist_index.py`, `update_landing_source.py`: generación/validación del sitio Ark Commerce
- `test_oficios_live.py`: smoke test del landing en producción

## 10. Seguridad y Hardening (`worker/src/lib/security.ts`)
1. **Geofencing por País (`checkGeoAllowed`)**:
   - Inspecciona `cf-ipcountry` en el Edge de Cloudflare antes de invocar Workers AI, Checkout o Cotizador Envia.com.
   - **Allowlist activa**: Norteamérica (`MX`, `US`, `CA`), España (`ES`), **El Salvador (`SV`)** y toda Latinoamérica y el Caribe (`GT`, `BZ`, `HN`, `NI`, `CR`, `PA`, `CO`, `VE`, `EC`, `PE`, `BO`, `CL`, `AR`, `UY`, `PY`, `BR`, `CU`, `DO`, `PR`, `HT`, `JM`, `TT`, `BS`, `BB`), además de `XX`/`T1` para desarrollo local. Tráfico de bots fuera de región recibe `403 Geo-Restricted`.
2. **Rate Limiting Híbrido por IP (`checkRateLimit`)**:
   - Ventana deslizante en memoria del Isolate V8 respaldada en Cloudflare KV (`CACHE`) usando `cf-connecting-ip`:
     - **Asistente IA (`/api/assistant/*`)**: `12 req / min` por IP.
     - **Admin Login (`/api/admin/login`)**: `6 req / min` por IP (anti fuerza bruta + comparación `timingSafeEqualStr`).
     - **Customer Auth (`/api/auth/*`)**: `10 req / min` por IP (protege envío de Magic Links en Resend y registros).
     - **Checkout (`/api/checkout`)**: `8 req / min` por IP (evita inundación de órdenes falsas en D1/Queue).
     - **Cotizador Envia.com (`/api/shipping/quote`)**: `15 req / min` por IP (protege cuota de API logística).
     - **Webhook WhatsApp (`/api/webhook/whatsapp*`)**: `30 req / min` por IP.
3. **Escudo Anti-Prompt Injection y Precios Oficiales D1 (`sanitizeAndValidateAiInput`)**:
   - Limpia caracteres de control, trunca payloads a **350 caracteres**, y bloquea en **0 ms** (sin gastar neuronas de Workers AI) más de 16 patrones de Jailbreak/Prompt Injection en español e inglés (`ignora las instrucciones`, `system prompt`, `DAN mode`, `actúa como`, `100% descuento`, `precio a 0`, `<script>`, etc.).
   - Delimitación estricta con etiquetas XML `<user_query>...</user_query>` y directiva inmutable de seguridad en el prompt de sistema.
   - **Cero confianza en precios del LLM**: `/api/assistant/recommend` recalcula siempre el precio estimado directamente desde el catálogo oficial en **Cloudflare D1**.
4. **Cierre de Endpoints Críticos y Multi-Tenant Isolation**:
   - `POST /api/shipping/label`: Requiere sesión válida de administrador (`verifyAdminSession`), impidiendo que terceros generen guías pagadas de Envia.com.
   - `GET /api/admin/leads` y `GET /api/admin/leads/summary`: Removidos del bypass público; exigen `Bearer <admin_token>` y aíslan los leads por `tenant_id` (solo el superadmin `ark` visualiza el consolidado global).
   - `POST /api/admin/upload` y `GET /api/admin/files/*`: Validación estricta de imágenes (`JPG, PNG, WEBP, AVIF, GIF`) con límite de **5 MB**, más cabeceras `X-Content-Type-Options: nosniff` y `Content-Security-Policy: sandbox` para impedir XSS almacenado.
   - `POST /api/webhook/whatsapp`: Verificación criptográfica HMAC-SHA256 (`verifyMetaWebhookSignature`) con `X-Hub-Signature-256` cuando `META_APP_SECRET` está configurado.
   - Cabeceras globales en `worker/index.ts`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.

## 11. Estado de Verificación
- **Build**: `pnpm run build` (Astro build + Wrangler dry-run) ejecuta correctamente; Astro genera las rutas estáticas y bundles cliente
- **D1**: `ark-commerce-db` provisionada local/remoto con esquema multi-tenant completo (tenants, users, products, orders, order_items + tablas de cliente/auth + envío)
- **Infraestructura Cloudflare**: Worker, D1, KV (`SESSION`+`CACHE`), R2, Queues, Workers AI configurados en `wrangler.toml` y desplegados en `tiendas.arksystems.site`
- **Multi-tenant**: Resolución por slug/subdominio/query param + caché KV funcionando (`ark`, `temozonia`, `baakal`, `marea`)
- **API & Hardening**: Endpoints CRUD y de negocio operativos y blindados con Geofencing, Rate Limiting por IP, Anti-Prompt Injection y sesiones Admin/Cliente
- **Asistente 3D Ark**: Widget universal (`public/widget.js`) y buscador principal (`AiSearchConcierge.tsx`) unificados con escena interactiva **Spline 3D**, dictado por voz (`es-MX`) y cerebro multi-tienda (`TENANT_CONTEXT`)
- **Automatización**: Scripts de onboarding, importación de catálogos, validación de tenants, smoke test de checkout y facturación PDF disponibles
