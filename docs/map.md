# 📁 Project Map — Ark Commerce (Multi-Tenant Platform)

## 1. Arquitectura y Recursos Cloudflare Oficiales
- **Worker Name**: `ark-commerce`
- **Base de Datos D1**: `ark-commerce-db` (`874b300a-18f6-4995-a98e-27abd7264662`)
- **Bucket R2**: `ark-commerce-storage`
- **Queue**: `ark-commerce-orders` (binding: `ORDER_QUEUE`)
- **KV Namespaces**:
  - `SESSION` (`316c37d5fe864e4bab912a0dbbe6b00a`) - Sesiones admin + sesiones de cliente
  - `CACHE` (`90269c9d7ede4252b21463bf9834f64d`) - Caché de tenants
- **Email**: Resend (`RESEND_API_KEY`, `EMAIL_FROM`) para magic links; fallback a log en desarrollo

## 2. Tiendas y Tenants (Multi-Tenant)
1. **Ark Systems** (`ark`): Plataforma y tienda principal por defecto en `/`.
   - Posicionamiento: Ark Commerce — tienda que vende y cobra por WhatsApp (SaaS $299/mes)
   - Vende: *Landing Express Kit* (MXN/USD)
   - Canon de diseño: **ARK PULSE v1.0** (`docs/ark_designsystem.md`)
   - Tema: Dark arquitectónico con acento Lima (#B4FF00)
   - Admin: `admin@arksystems.ai` / `admin123`

2. **Temozonia Carnes Ahumadas** (`temozonia`): Cliente hosteado en `/temozonia` o vía subdominio `temozonia.*` / query `?tenant=temozonia`.
   - Catálogo: 5 productos de carnes ahumadas artesanales (Carne Ahumada 1kg, Costillas BBQ 1kg, Chorizo 500g, Salchichón 300g, Pack Degustación 2.3kg)
   - Canon de diseño: Smoke & Amber (`docs/designsystem.md`)
   - Admin: `admin@temozonia.com` / `admin123`
   - Configuración en D1 incluye dominio: `temozonia.substrateholdingsai.workers.dev`

## 3. Stack Tecnológico
| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | [Astro 5](https://astro.build/) + [React 19](https://react.dev/) | SSG/SSR, Islands interactivos, SEO |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) | Diseño tokenizado |
| **Backend** | [Hono 4.6](https://hono.dev/) | API ligera edge-first compatible con Web Standards |
| **Estado** | [Zustand 5](https://zustand-demo.pmnd.rs/) | Carrito reactivo + auth de cliente con persistencia local |
| **DB** | [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite serverless multi-tenant |
| **Cache/Sesiones** | [Cloudflare KV](https://developers.cloudflare.com/kv/) | Caché de tenants (1h TTL), sesiones admin (24h) y cliente (30d) |
| **Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) | Subida y almacenamiento de imágenes |
| **Colas** | [Cloudflare Queues](https://developers.cloudflare.com/queues/) | Procesamiento asíncrono de órdenes |
| **Email** | [Resend](https://resend.com/) | Magic links de acceso cliente |
| **Seguridad** | Web Crypto (SHA-256, PBKDF2) | Hash de passwords admin (SHA-256) y cliente (PBKDF2) |
| **Tooling** | TypeScript 5.6, Wrangler 4.149 | Desarrollo y deploy a edge |

## 4. Estructura del Proyecto
```text
temozonia/
├── astro/                    # Frontend Astro legacy (archivos antiguos)
├── config/                   # Configuración centralizada (config.ts)
├── docs/                     # Documentación (map.md, designsystem.md, ark_designsystem.md)
├── public/                   # Assets estáticos (favicon, imágenes, stores ejemplo)
├── scripts/
│   ├── python/               # Generadores de assets (ark_pulse_forge.py, ark_universal_forge.py)
│   └── sql/                  # Schema D1 (schema.sql, schema_auth*.sql, seed.sql, ejemplo_cliente.sql)
├── src/                      # Código fuente Astro + React
│   ├── components/
│   │   ├── admin/            # Panel admin React (AdminApp.tsx)
│   │   ├── ark/              # Landing Ark Systems (ArkLanding.tsx)
│   │   ├── auth/             # AuthModal.tsx, UserMenu.tsx
│   │   ├── checkout/         # Carrito y checkout (CartDrawer.astro, CheckoutCalculator.astro)
│   │   ├── layout/           # Header, Footer, Hero
│   │   └── product/          # ProductCard
│   ├── data/                 # Datos estáticos (products.ts)
│   ├── layouts/              # Layout principal (Layout.astro)
│   ├── pages/                # Páginas Astro (index, temozonia, admin, contacto, etc.)
│   ├── stores/               # Zustand stores (cart, customerAuth, productsCache, storeConfig)
│   ├── styles/               # CSS global (globals.css)
│   ├── types/                # Types TypeScript (product.ts, cart.ts)
│   └── utils/                # Utilidades (constants.ts, whatsapp.ts)
├── worker/                   # Backend Hono (Cloudflare Workers)
│   ├── index.ts              # Entry point + resolución multi-tenant
│   ├── routes/               # Rutas base (health.ts, index.ts)
│   └── src/
│       ├── lib/              # auth-core.ts (helpers legacy), cart.ts, crypto.ts, email.ts, tokens.ts
│       ├── routes/           # Endpoints API (products, checkout, store, admin, auth, cart)
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
Cloudflare CDN (Assets estáticos dist/)
  ├─→ Astro Static (Pages: /, /temozonia, /admin, etc.)
  └─→ Worker API (/api/*, /health)
       ├─→ D1 (tenants, tenant_users, customers, carts, store_sessions, action_tokens, customer_addresses, products, orders, order_items)
       ├─→ KV (SESSION: sesiones admin 24h + cliente 30d, CACHE: tenants por slug/dominio 1h)
       ├─→ R2 (STORAGE: uploads/imagenes por tenant)
       └─→ Queues (ORDER_QUEUE: procesamiento asíncrono de órdenes checkout)
```

**Resolución de Tenant (worker/index.ts):**
1. Query param `?tenant=`
2. Header `X-Tenant-ID`
3. Subdominio (ej. `temozonia.dominio.com` → slug `temozonia`)
4. Fallback → `ark` (Ark Systems)

**Auth de cliente:** cookie httpOnly `customer_session` (30d) respaldada en KV + tabla `store_sessions`; soporta invitado, registro/login password (PBKDF2), magic link por email, merge de carrito invitado a cliente, direcciones guardadas, historial de pedidos y perfil.

## 6. API REST (Worker)
Base URL: `/api/*`

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/health` | GET | Público | Health check |
| `/api/store/config` | GET | Público | Configuración del tenant actual (nombre, WhatsApp, datos bancarios, BTCPay, etc.) |
| `/api/products` | GET | Público | Lista productos activos del tenant (ordenados por display_order) |
| `/api/products/:id` | GET | Público | Producto específico |
| `/api/checkout` | POST | Público (cookie cliente opcional) | Crear orden (valida con Zod), guarda en D1, envía a ORDER_QUEUE, vincula customer_id y vacía carrito |
| `/api/cart` | GET | Cookie cliente | Obtiene/crea carrito del tenant (invitado o cliente) |
| `/api/cart` | PUT | Cookie cliente | Reemplaza items del carrito |
| `/api/cart/merge` | POST | Cookie cliente | Fusiona items entrantes con carrito actual |
| `/api/auth/guest` | POST | Público | Crea sesión de invitado + carrito |
| `/api/auth/register` | POST | Público | Registro de cliente (password PBKDF2), merge de carrito invitado |
| `/api/auth/login` | POST | Público | Login cliente (PBKDF2 / SHA-256 legacy con migración), merge carrito |
| `/api/auth/logout` | POST | Cookie cliente | Revoca sesión de cliente |
| `/api/auth/me` | GET | Cookie cliente | Perfil/sesión actual (invitado o cliente) |
| `/api/auth/magic/request` | POST | Público | Solicita magic link por email (crea cliente si no existe) |
| `/api/auth/magic/callback` | GET | Público | Valida token y establece sesión de cliente |
| `/api/auth/orders` | GET | Cookie cliente | Historial de pedidos del cliente |
| `/api/auth/addresses` | GET/POST | Cookie cliente | Listar/crear direcciones guardadas |
| `/api/auth/addresses/:id/default` | PUT | Cookie cliente | Marcar dirección como default |
| `/api/auth/profile` | PUT | Cookie cliente | Actualizar perfil y dirección default |
| `/api/admin/login` | POST | Público | Login admin (hash SHA-256), crea sesión en KV (24h) |
| `/api/admin/store` | GET/PUT | Bearer token | Leer/actualizar configuración del tenant |
| `/api/admin/products` | GET | Bearer token | Listar todos productos (activos/inactivos) |
| `/api/admin/products` | POST | Bearer token | Crear producto |
| `/api/admin/products/:id` | PUT | Bearer token | Actualizar producto |
| `/api/admin/upload` | POST | Bearer token | Subir imagen a R2 (`tenants/{tenantId}/{timestamp}-{filename}`) |
| `/api/admin/files/*` | GET | Público | Servir archivos subidos desde R2 |
| `/api/admin/orders` | GET | Bearer token | Listar órdenes (filtro opcional `?status=pending|paid|delivered`) |
| `/api/admin/orders/:id/status` | PUT | Bearer token | Actualizar estado de orden |
| `/api/shipping/quote` | POST | Público | Cotizaciones de envío en tiempo real vía Envia.com (Redpack, Estafeta, FedEx, etc.) |
| `/api/shipping/label` | POST | Público / Admin | Genera guía de envío PDF y tracking number, actualiza orden a 'shipped' |
| `/api/shipping/track/:carrier/:trackingNumber` | GET | Público | Rastreo de paquete en tiempo real con historial de checkpoints |

## 7. Esquema D1 (Multi-Tenant)
Tablas: `tenants`, `tenant_users`, `customers`, `carts`, `store_sessions`, `action_tokens`, `customer_addresses`, `products`, `orders`, `order_items`
- `customers`: email/password_hash (PBKDF2 o null para magic link), datos de perfil y dirección default
- `carts`: items JSON por tenant/cliente o invitado
- `store_sessions`: sesiones de cliente (token_hash, customer_id, cart_id, expires_at, revoked_at)
- `action_tokens`: magic links de acceso (expiración 15 min, uso único)
- `customer_addresses`: direcciones guardadas por cliente
- `orders`: incluye `customer_id` y `customer_email`; estados pending/paid/delivered
- Relaciones con `ON DELETE CASCADE` entre tenant y entidades hijas
- Índices optimizados por tenant, estado, fechas y cliente
- Seed data con 2 tenants + usuarios admin + productos

## 8. Páginas Astro
| Página | Ruta | Descripción |
|---|---|---|
| `index.astro` | `/` | Landing Ark Commerce (ArkLanding React client:load). Auto-redirige a `/temozonia` si `?tenant=temozonia` o subdominio |
| `temozonia.astro` | `/temozonia` | Tienda Temozonia (Layout + Hero + ProductCard grid + CheckoutCalculator) |
| `admin.astro` | `/admin` | Panel admin multi-tenant (AdminApp React client:only) |
| `test.astro` | `/test` | Página de pruebas |
| `contacto.astro` | `/contacto` | Contacto |
| `conocenos.astro` | `/conocenos` | Nosotros |
| `mayoreo.astro` | `/mayoreo` | Mayoreo |
| `recetas.astro` | `/recetas` | Recetas |
| Otras | Varios | Páginas adicionales del sitio |

## 9. Scripts Disponibles (package.json)
```bash
pnpm dev          # Desarrollo con Wrangler (worker + assets) - puerto 8787
pnpm deploy       # Deploy a Cloudflare Workers
pnpm astro:dev    # Solo Astro dev server (puerto 4321)
pnpm astro:build  # Build Astro
pnpm astro:preview # Preview build
pnpm build        # Build Astro + dry-run deploy Wrangler (verificación)
pnpm cf-typegen   # Generar tipos Cloudflare Env
```

## 10. Estado de Verificación
- **Build**: `pnpm run build` (Astro build + Wrangler dry-run) ejecuta correctamente; Astro genera las 8 rutas estáticas y bundles cliente
- **D1**: `ark-commerce-db` provisionada local/remoto con esquema multi-tenant completo (tenants, users, products, orders, order_items + tablas de cliente/auth)
- **Infraestructura Cloudflare**: Worker, D1, KV (SESSION+CACHE), R2, Queues configurados en `wrangler.toml`
- **Multi-tenant**: Resolución por slug/subdominio/query param + caché KV funcionando
- **API**: Endpoints CRUD completos para products, checkout, store, admin con auth JWT-like (Bearer + sesiones KV); endpoints de cliente (auth, cart, magic link, direcciones, pedidos) funcionales
- **Admin Panel**: React app funcional con login, gestión productos, tienda, pedidos + subida R2
- **Frontend**: Dos experiencias (Ark Commerce landing + Temozonia storefront) completamente funcionales; auth de cliente integrada en Header (UserMenu/AuthModal)
- **Seguridad cliente**: Passwords PBKDF2 (100k iter) con migración desde SHA-256 legacy; magic links de 15 min de un solo uso
