# 📁 Project Map — Temozonia

## 1. Estructura de Carpetas Completa

```
temozonia/
├── .github/                          # GitHub workflows (CI/CD)
│   └── workflows/
│       ├── deploy.yml                # Deploy a Cloudflare Workers
│       └── typecheck.yml             # TypeScript + lint checks
│
├── .vscode/                          # Configuración del editor
│   ├── settings.json                 # Formato, TypeScript, Tailwind
│   └── extensions.json               # Extensiones recomendadas
│
├── astro/                            # 🌐 Sitio público (Astro + Tailwind)
│   ├── public/                       # Assets estáticos servidos directamente
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── images/
│   │       ├── products/
│   │       └── hero/
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── ui/                   # Primitivas UI (Button, Card, Input)
│   │   │   ├── layout/               # Header, Footer, Navigation
│   │   │   ├── product/              # ProductCard, ProductGrid, Badges
│   │   │   ├── checkout/             # Cart, PaymentTotal, Form
│   │   │   └── interactive/          # Islas React hidratadas (client:visible)
│   │   ├── layouts/                  # Layouts base de página
│   │   │   ├── Layout.astro          # Layout principal
│   │   │   ├── LayoutClean.astro     # Sin header/footer (landing, checkout)
│   │   │   └── LayoutAuth.astro      # Páginas de auth
│   │   ├── pages/                    # Rutas (file-based routing)
│   │   │   ├── index.astro           # Home
│   │   │   ├── products/
│   │   │   │   ├── index.astro       # Listado con filtros
│   │   │   │   └── [slug].astro      # Detalle de producto (SSR opcional)
│   │   │   ├── cart.astro            # Carrito
│   │   │   ├── checkout.astro        # Checkout multi-paso
│   │   │   ├── account/              # Perfil, pedidos, direcciones
│   │   │   ├── about.astro
│   │   │   ├── contact.astro
│   │   │   ├── blog/
│   │   │   │   ├── index.astro
│   │   │   │   └── [slug].astro
│   │   │   ├── api/                  # Endpoints API (Astro API routes)
│   │   │   │   ├── cart.ts
│   │   │   │   ├── webhook.ts
│   │   │   │   └── search.ts
│   │   │   └── rss.xml.js            # Feed RSS
│   │   ├── styles/
│   │   │   └── globals.css           # Tailwind + Design System (importado en Layout)
│   │   ├── scripts/                  # Scripts cliente (no islas)
│   │   │   ├── analytics.ts
│   │   │   └── service-worker.ts
│   │   ├── content/                  # Colecciones de contenido (Astro Content)
│   │   │   ├── blog/
│   │   │   └── config.ts
│   │   ├── i18n/                     # Internacionalización
│   │   │   ├── es.json
│   │   │   └── en.json
│   │   ├── utils/                    # Helpers puros
│   │   │   ├── currency.ts
│   │   │   ├── date.ts
│   │   │   └── validation.ts
│   │   ├── stores/                   # Estado global (Zustand)
│   │   │   ├── cart.ts
│   │   │   └── ui.ts
│   │   └── types/                    # Tipos TypeScript compartidos
│   │       ├── product.ts
│   │       ├── cart.ts
│   │       └── user.ts
│   ├── astro.config.mjs              # Config Astro + Tailwind Vite plugin
│   ├── package.json                  # Dependencias del sitio (workspace)
│   └── tsconfig.json                 # Extiende config raíz
│
├── worker/                           # ⚡ Cloudflare Worker (Hono)
│   ├── index.ts                      # Entry point principal
│   ├── routes/                       # Rutas API organizadas
│   │   ├── health.ts                 # GET /health
│   │   ├── config.ts                 # GET /api/config
│   │   ├── products.ts               # CRUD productos (D1)
│   │   ├── cart.ts                   # Carrito server-side (KV/DO)
│   │   ├── checkout.ts               # Procesar pedidos (D1 + Queues)
│   │   ├── payments/
│   │   │   ├── btcpay.ts             # Webhooks BTCPay
│   │   │   └── mercadopago.ts        # Webhooks Mercado Pago
│   │   ├── webhooks.ts               # Stripe, email, etc.
│   │   ├── python.ts                 # POST /api/python/execute
│   │   └── search.ts                 # Vectorize search
│   ├── middleware/                   # Middleware Hono
│   │   ├── auth.ts                   # JWT validation
│   │   ├── cors.ts                   # CORS config
│   │   ├── rate-limit.ts             # Rate limiting (KV)
│   │   └── logging.ts                # Request logging
│   ├── services/                     # Lógica de negocio
│   │   ├── db.ts                     # D1 queries
│   │   ├── kv.ts                     # KV helpers
│   │   ├── r2.ts                     # R2 upload/download
│   │   ├── queue.ts                  # Queue producers/consumers
│   │   ├── durable-objects/
│   │   │   ├── SessionDO.ts          # Session state
│   │   │   └── CartDO.ts             # Carrito persistente
│   │   ├── vectorize.ts              # Embeddings + search
│   │   └── ai.ts                     # Workers AI helpers
│   ├── bindings.ts                   # Tipos de bindings Cloudflare
│   └── utils/                        # Helpers worker
│       ├── response.ts
│       └── validation.ts
│
├── scripts/                          # 🛠 Scripts de utilidad y Python
│   ├── python/
│   │   ├── main.py                   # Entry point (CLI + Workers AI)
│   │   ├── analytics/
│   │   │   ├── product_stats.py
│   │   │   └── sales_report.py
│   │   ├── recommendations/
│   │   │   └── collaborative.py
│   │   ├── shipping/
│   │   │   └── calculator.py
│   │   └── utils/
│   │       └── helpers.py
│   ├── deploy/
│   │   ├── create-resources.sh       # Crear D1, KV, R2, Queues, DO
│   │   ├── seed-database.ts          # Poblar D1 con datos iniciales
│   │   └── deploy-worker.ts          # Script deploy personalizado
│   ├── dev/
│   │   ├── start-all.sh              # Inicia worker + astro dev
│   │   └── tunnel.sh                 # Cloudflare tunnel para testing
│   └── generate/
│       ├── types.ts                  # Genera tipos desde wrangler/Bindings
│       └── openapi.ts                # Genera spec OpenAPI
│
├── config/                           # ⚙️ Configuración centralizada (Single Source of Truth)
│   ├── config.ts                     # Config principal tipada
│   ├── site.ts                       # Info del sitio (nombre, URL, idiomas)
│   ├── features.ts                   # Feature flags
│   ├── integrations.ts               # Keys/secretos de integraciones
│   ├── python.ts                     # Config Python (packages, runtime)
│   ├── security.ts                   # CORS, CSP, rate limits
│   └── performance.ts                # Cache headers, compression
│
├── docs/                             # 📚 Documentación
│   ├── designsystem.md               # Design System completo
│   ├── map.md                        # Este archivo
│   ├── api.md                        # Documentación API (OpenAPI)
│   ├── deployment.md                 # Guía de deploy
│   ├── development.md                # Guía de desarrollo local
│   ├── cloudflare-bindings.md        # Referencia bindings D1/KV/R2/DO
│   ├── python-scripts.md             # Guía scripts Python
│   └── architecture.md               # Diagramas y decisiones
│
├── tests/                            # 🧪 Tests
│   ├── unit/
│   │   ├── worker/
│   │   └── astro/
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── checkout.test.ts
│   ├── e2e/
│   │   └── playwright.config.ts
│   └── fixtures/
│       ├── products.json
│       └── users.json
│
├── dist/                             # Build output (gitignored)
│   ├── worker/                       # Worker compilado
│   └── client/                       # Astro build estático
│
├── node_modules/                     # Dependencias (gitignored)
│
├── .gitignore
├── .env.example                      # Template variables entorno
├── .env.local                        # Variables locales (gitignored)
├── package.json                      # Workspace root + scripts principales
├── pnpm-workspace.yaml               # Config pnpm workspaces (opcional)
├── tsconfig.json                     # Config TypeScript raíz
├── tailwind.config.ts                # Design System tokens
├── postcss.config.js                 # PostCSS (Tailwind v4)
├── wrangler.toml                     # Config Cloudflare Worker
├── wrangler.local.toml               # Overrides locales (gitignored)
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## 2. Dependencias Principales

### Root (`package.json`)

| Categoría | Paquete | Versión | Propósito |
|-----------|---------|---------|-----------|
| **Runtime** | `hono` | ^4.6 | Framework worker ligero |
| | `astro` | ^5.0 | Framework sitio estático |
| | `@astrojs/cloudflare` | ^12.0 | Adapter Cloudflare |
| | `@tailwindcss/vite` | ^4.0 | Tailwind v4 via Vite |
| | `tailwindcss` | ^4.0 | Design System |
| **Cloudflare** | `@cloudflare/workers-types` | ^4.2024 | Types bindings |
| | `wrangler` | ^3.80 | CLI deploy/dev |
| **Data** | `@astrojs/db` | ^0.11 | ORM opcional D1 |
| | `zod` | ^3.23 | Validación schemas |
| **Estado/UI** | `zustand` | ^4.5 | Estado global cliente |
| | `lucide-react` | ^0.400 | Iconos |
| **Python/IA** | (via Workers AI) | - | Pyodide/Llama en edge |
| **Dev** | `typescript` | ^5.6 | Tipado estático |
| | `vitest` | ^2.0 | Testing unitario |
| | `playwright` | ^1.45 | Testing E2E |
| | `eslint` | ^9.0 | Linting |
| | `prettier` | ^3.3 | Formateo |

### Astro (`astro/package.json`)

```json
{
  "dependencies": {
    "astro": "^5.0",
    "@astrojs/cloudflare": "^12.0",
    "@astrojs/tailwind": "^6.0",
    "zustand": "^4.5",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "@types/node": "^22.0",
    "tailwindcss": "^4.0",
    "@tailwindcss/vite": "^4.0"
  }
}
```

### Worker (`worker/` - usa root `package.json`)

```json
{
  "dependencies": {
    "hono": "^4.6",
    "zod": "^3.23"
  }
}
```

---

## 3. Instrucciones de Build

### 3.1 Requisitos Previos

```bash
# Node.js 20+
node --version  # >= 20.0.0

# pnpm recomendado (o npm/yarn)
corepack enable
pnpm --version  # >= 9.0

# Wrangler CLI autenticado
wrangler login
wrangler whoami
```

### 3.2 Variables de Entorno

```bash
# Copiar template
cp .env.example .env.local

# Editar con tus valores
# .env.local
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
DATABASE_ID=your-d1-id
KV_NAMESPACE_ID=your-kv-id
R2_BUCKET_NAME=temozonia-storage
QUEUE_NAME=temozonia-queue
VECTORIZE_INDEX=temozonia-index
BTCPAY_URL=https://btcpay.example.com
BTCPAY_API_KEY=your-key
MERCADOPAGO_ACCESS_TOKEN=your-token
SENTRY_DSN=your-dsn (opcional)
```

### 3.3 Crear Recursos Cloudflare (Una sola vez)

```bash
# Opción A: Script automatizado
./scripts/deploy/create-resources.sh

# Opción B: Manual vía wrangler
# D1 Database
wrangler d1 create temozonia-db
# → Copia database_id a wrangler.toml

# KV Namespaces
wrangler kv namespace create "SESSION"
wrangler kv namespace create "CACHE"
# → Copia ids a wrangler.toml

# R2 Bucket
wrangler r2 bucket create temozonia-storage

# Queues
wrangler queues create temozonia-queue
wrangler queues create temozonia-dlq

# Vectorize
wrangler vectorize create temozonia-index --dimensions=768 --metric=cosine

# Durable Objects (migración)
wrangler deploy --dry-run  # Crea la migración DO
wrangler d1 migrations apply temozonia-db --remote
```

### 3.4 Desarrollo Local

```bash
# Terminal 1: Worker + Astro dev (con proxy)
npm run dev
# → Worker en http://localhost:8787
# → Astro en http://localhost:4321 (proxy a worker)

# Terminal 2: Solo Astro (más rápido para UI)
npm run astro:dev

# Terminal 3: Solo Worker (API testing)
npm run worker:dev

# Ver logs combinados
npm run logs
```

### 3.5 Build de Producción

```bash
# Build completo (Astro + Worker typecheck)
npm run build

# Solo sitio estático
npm run astro:build

# Solo typecheck worker
npm run cf-typegen

# Preview build local
npm run astro:preview
# → Sirve dist/ en puerto 4321
```

### 3.6 Deploy

```bash
# Deploy a Cloudflare (staging/production)
npm run deploy

# Deploy solo worker
wrangler deploy --env production

# Deploy solo sitio (Assets)
wrangler pages deploy ./dist --project-name=temozonia

# Verificar deploy
curl https://temozonia.example.com/health
curl https://temozonia.example.com/api/config
```

---

## 4. Herramientas Disponibles

### 4.1 Scripts NPM Principales

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia worker + astro dev con proxy |
| `npm run astro:dev` | Solo Astro dev server |
| `npm run worker:dev` | Solo worker dev (wrangler dev) |
| `npm run build` | Build completo + typecheck |
| `npm run astro:build` | Build solo sitio Astro |
| `npm run deploy` | Deploy a Cloudflare |
| `npm run cf-typegen` | Genera `CloudflareEnv` types |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Prettier write |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run db:push` | Push schema D1 local |
| `npm run db:seed` | Poblar D1 con datos demo |
| `npm run python:test` | Test scripts Python local |

### 4.2 Wrangler Commands Útiles

```bash
# Logs en vivo
wrangler tail --format=pretty

# Ver bindings configurados
wrangler bindings list

# D1: Ejecutar SQL
wrangler d1 execute temozonia-db --command="SELECT * FROM products LIMIT 5"
wrangler d1 execute temozonia-db --local --command="..."

# KV: Inspeccionar
wrangler kv key list --binding=KV
wrangler kv key get "cart:user123" --binding=KV

# R2: Subir/descargar
wrangler r2 object put temozonia-storage/products/img.jpg --file=./img.jpg
wrangler r2 object get temozonia-storage/products/img.jpg --file=./out.jpg

# Queues: Enviar mensaje test
wrangler queues send temozonia-queue --message='{"type":"order.created","data":{...}}'

# Durable Objects: Ver estado
wrangler durable-objects list
```

### 4.3 Python Scripts (Workers AI)

```bash
# Test local (requiere Python 3.11+)
cd scripts/python
python main.py process_product_data
python main.py calculate_shipping 75 national 2.5

# Via Worker API (después de deploy)
curl "https://temozonia.example.com/api/python/execute?code=print('hello')"

# En código worker (services/ai.ts)
const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
  messages: [{ role: "user", content: pythonCode }]
});
```

### 4.4 VS Code Tasks (`.vscode/tasks.json`)

```json
{
  "tasks": [
    { "label": "Start All", "command": "npm run dev", "group": "build" },
    { "label": "Build & Deploy", "command": "npm run build && npm run deploy", "group": "build" },
    { "label": "Typecheck", "command": "npm run typecheck", "problemMatcher": "$tsc" },
    { "label": "Test", "command": "npm run test", "group": "test" }
  ]
}
```

### 4.5 Extensiones VS Code Recomendadas

```json
// .vscode/extensions.json
[
  "astro-build.astro-vscode",
  "bradlc.vscode-tailwindcss",
  "dbaeumer.vscode-eslint",
  "esbenp.prettier-vscode",
  "cloudflare.workers",
  "ms-python.python",
  "usernamehw.errorlens"
]
```

---

## 5. Flujo de Datos Clave

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│ Cloudflare   │────▶│  Worker     │
│  (Astro)    │     │  CDN/Edge    │     │  (Hono)     │
└─────────────┘     └──────────────┘     └──────┬──────┘
                          │                     │
              ┌───────────┼───────────┐         │
              ▼           ▼           ▼         ▼
           ┌──────┐   ┌───────┐   ┌────────┐ ┌────────┐
           │  KV  │   │  R2   │   │   D1   │ │ Queue  │
           │Session│   │Assets │   │ Products│ │ Orders │
           └──────┘   └───────┘   └────────┘ └────────┘
              │                        │           │
              │                        ▼           ▼
              │                  ┌──────────┐ ┌──────────┐
              │                  │ Vectorize│ │Durable   │
              └─────────────────▶│ Search   │ │ Objects  │
                                 └──────────┘ │(Cart/    │
                                              │ Session) │
                                              └──────────┘
```

---

## 6. Referencias Rápidas

| Archivo | Propósito |
|---------|-----------|
| `config/config.ts` | **Fuente de verdad** - toda config tipada |
| `wrangler.toml` | Bindings Cloudflare (D1, KV, R2, Queue, DO, Vectorize, AI) |
| `tailwind.config.ts` | Design System tokens (colores, fuentes, sombras) |
| `src/styles/globals.css` | Componentes UI (btn-heritage, glass-btn, etc.) |
| `worker/bindings.ts` | Tipos TypeScript de `env` |
| `astro/src/stores/cart.ts` | Estado carrito (Zustand + persist) |

---

## 7. Próximos Pasos / TODO

- [ ] Configurar CI/CD GitHub Actions
- [ ] Implementar auth (JWT + Durable Objects Session)
- [ ] Añadir tests E2E críticos (checkout, pagos)
- [ ] Configurar Sentry para error tracking
- [ ] Documentar API con OpenAPI/Swagger
- [ ] Implementar i18n (es/en) completo
- [ ] Optimizar imágenes con `@astrojs/image` + Cloudflare Images