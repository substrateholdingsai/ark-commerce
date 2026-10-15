# 📁 Project Map — Temozonia

## 1. Estructura de Carpetas Completa

```
temozonia/
├── .github/                          # GitHub workflows (CI/CD) [TODO]
│   └── workflows/
│       ├── deploy.yml
│       └── typecheck.yml
│
├── .vscode/                          # Configuración del editor [TODO]
│   ├── settings.json
│   └── extensions.json
│
├── config/                           # ⚙️ Configuración centralizada
│   └── config.ts                     # Config principal tipada
│
├── docs/                             # 📚 Documentación
│   ├── designsystem.md               # Design System completo
│   └── map.md                        # Este archivo (Status y Roadmap)
│
├── public/                           # 🖼 Assets estáticos
│   ├── favicon.svg                   # Favicon
│   ├── .assetsignore
│   └── images/                       # [PENDIENTE] Fotos reales de productos
│       └── products/
│
├── src/                              # 🌐 Frontend principal (Astro 5 + Tailwind v4)
│   ├── components/
│   │   ├── checkout/
│   │   │   ├── CartDrawer.astro      # Panel deslizante del carrito
│   │   │   └── CheckoutCalculator.astro # Resumen, cálculo y envío WhatsApp
│   │   ├── layout/
│   │   │   ├── Header.astro          # Navbar con badge dinámico del carrito
│   │   │   ├── Hero.astro            # Hero con brasas y humo
│   │   │   └── Footer.astro          # Directorio y status del ahumador
│   │   └── product/
│   │       └── ProductCard.astro     # Card de producto con botón interactivo
│   ├── data/
│   │   └── products.ts               # Catálogo local de cortes ahumados
│   ├── layouts/
│   │   └── Layout.astro              # Layout base (Header, Footer, CartDrawer, CSS)
│   ├── pages/
│   │   ├── index.astro               # Home (Hero + Productos + Checkout)
│   │   ├── conocenos.astro           # Historia y tradición
│   │   ├── contacto.astro            # Canales de atención y WhatsApp
│   │   ├── mayoreo.astro             # B2B / Restaurantes
│   │   ├── recetas.astro             # Guías y preparación
│   │   └── test.astro                # Ruta de prueba
│   ├── stores/
│   │   └── cart.ts                   # Store Zustand (items, CLABE, Lightning, WhatsApp)
│   ├── styles/
│   │   └── globals.css               # Tailwind v4 (@theme tokens + utilidades)
│   ├── types/
│   │   ├── cart.ts                   # Tipos de Carrito y Comprador
│   │   └── product.ts                # Tipos de Producto y Orden
│   └── utils/
│       ├── constants.ts              # Configuración WhatsApp, CLABE, Lightning
│       └── whatsapp.ts               # Generador de mensaje de pedido
│
├── worker/                           # ⚡ Backend Cloudflare Worker (Hono)
│   ├── index.ts                      # Entrypoint con bindings y middleware
│   └── routes/
│       ├── health.ts                 # GET /health
│       └── index.ts                  # Montaje API (stubs pendientes)
│
├── scripts/                          # 🛠 Scripts utilitarios y base de datos
│   ├── python/
│   │   └── main.py                   # Script de analítica / Workers AI
│   └── sql/
│       └── schema.sql                # Esquema D1 (products, orders, order_items)
│
├── astro.config.mjs                  # Configuración Astro (@/ y @config aliases)
├── package.json                      # Scripts de compilación y dependencias
├── tsconfig.json                     # Paths de TypeScript
├── wrangler.toml                     # Bindings Cloudflare (D1, KV, R2, Queue)
└── dist/                             # Build final servido por Cloudflare Assets
├── worker/                           # ⚡ Cloudflare Worker (Hono)
│   ├── index.ts                      # Entry point principal (Bindings + Hono app)
│   └── routes/                       # Rutas API
│       ├── health.ts                 # GET /health (Activo con check D1)
│       ├── index.ts                  # Montaje API (Stubs)
│       ├── products.ts               # [PENDIENTE] CRUD productos (D1)
│       └── checkout.ts               # [PENDIENTE] Registro pedidos (D1 + Queue)
│
├── scripts/                          # 🛠 Scripts utilitarios y base de datos
│   ├── python/
│   │   └── main.py                   # Entry point (CLI + Workers AI stub)
│   └── sql/
│       └── schema.sql                # Esquema D1 (products, orders, order_items)
│
├── config/                           # ⚙️ Configuración centralizada
│   └── config.ts                     # Config principal tipada
│
├── docs/                             # 📚 Documentación
│   ├── designsystem.md               # Design System completo
│   └── map.md                        # Este archivo
│
├── tests/                            # 🧪 Tests [PENDIENTE]
├── dist/                             # Build output (generado por astro build)
├── node_modules/                     # Dependencias (gitignored)
├── .gitignore
├── astro.config.mjs                  # Configuración Astro (@/ y @config aliases)
├── package.json                      # Workspace root + dependencias principales
├── tsconfig.json                     # Configuración TypeScript
├── wrangler.toml                     # Bindings Cloudflare (D1, KV, R2, Queue)
└── README.md
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
| `config/config.ts` | **Fuente de verdad** - Configuración tipada del proyecto |
| `wrangler.toml` | Bindings Cloudflare reales (D1: `temozonia-db`, KV: `SESSION`/`CACHE`, R2, Queues) |
| `src/styles/globals.css` | Design System Tailwind v4 (`@theme`, colores brand, gold, glass, utilidades) |
| `src/stores/cart.ts` | Estado del carrito (Zustand con persistencia localStorage y checkout WhatsApp/SPEI/Lightning) |
| `src/data/products.ts` | Catálogo de cortes de carne y precios base |
| `worker/index.ts` | Entrypoint Hono en Cloudflare Workers |
| `scripts/sql/schema.sql` | Esquema D1 (`products`, `orders`, `order_items`) |

---

## 7. Estado Actual del Proyecto (Actualizado: Octubre 2026)

### ✅ Completado e Integrado
- **Frontend Astro 5 + Tailwind v4**:
  - Unificación completa: `src/` contiene todas las páginas y componentes del flujo de compra.
  - Vistas activas: `index.astro` (Hero, Grilla de Productos, Checkout Calculator), `conocenos.astro`, `contacto.astro`, `mayoreo.astro`, `recetas.astro`.
  - Navegación global compartida: `Header.astro` con badge reactivo del carrito, `CartDrawer.astro` lateral interactivo, y `Footer.astro`.
  - Animaciones y tokens de identidad: Efecto de humo y brasas, botones *heritage* y *liquid glass*, divisores dorados.
- **Flujo de Carrito & Checkout**:
  - Store Zustand con persistencia en cliente.
  - Cálculo de subtotales, totales, equivalencia en Satoshis (Bitcoin Lightning).
  - Formulario de checkout directo con generación de pedido estructurado para WhatsApp.
  - Copia rápida de CLABE interbancaria al portapapeles.
- **Infraestructura Cloudflare**:
  - Bindings configurados y aprovisionados en `wrangler.toml`.
  - Build verificado y compatible con `@astrojs/cloudflare` adapter y Cloudflare Assets.

---

## 8. Check List de Lo Que Falta (Pending / Missing Roadmap)

### 🔴 Prioridad Alta (Esencial para Operación y Producción)
- [ ] **Rutas API en Backend (`worker/routes/`)**:
  - [ ] Implementar `GET /api/products` (obtener catálogo desde D1 en lugar de estático).
  - [ ] Implementar `POST /api/checkout` (persistir órdenes en tabla `orders` y `order_items` de D1 y encolar en `ORDER_QUEUE`).
  - [ ] Implementar `GET /api/orders/:id` para consulta de estado de pedido.
- [ ] **Sembrado de Base de Datos D1**:
  - [ ] Crear script o migraciones `INSERT` en `scripts/sql/` para poblar la tabla `products` en D1 (local y remote).
- [ ] **Assets de Imágenes Reales**:
  - [ ] Agregar fotografías de productos en `public/images/products/` (`carne-ahumada.jpg`, `costillas-bbq.jpg`, `chorizo.jpg`, `salchichón.jpg`, `pack-degustacion.jpg`).
- [ ] **Datos Bancarios Reales**:
  - [ ] Reemplazar la CLABE ficticia (`123456789012345678`) y nombre de titular en `src/utils/constants.ts` y `wrangler.toml` con los datos reales de la cuenta comercial.
- [ ] **Limpieza de carpeta `astro/`**:
  - [ ] Remover de forma segura la subcarpeta residual `astro/` para evitar redundancias de código.

### 🟠 Prioridad Media (Experiencia de Usuario y Robustez)
- [ ] **Páginas de Producto Individuales**:
  - [ ] Implementar ruta dinámica `src/pages/products/[slug].astro` o modal de detalle con ingredientes y sugerencias de maridaje.
- [ ] **Tasa Dinámica de Satoshis**:
  - [ ] Sustituir la constante fija `SATS_RATE` por consulta a API de precio BTC/MXN en tiempo real.
- [ ] **Middleware en Worker**:
  - [ ] Configurar autenticación JWT o API Key para endpoints administrativos.
  - [ ] Implementar rate limiting en endpoints de checkout usando Cloudflare KV.
- [ ] **Página 404 y Mantenimiento**:
  - [ ] Crear `src/pages/404.astro` adaptada al diseño cálido y rústico.
- [ ] **SEO y Metadatos**:
  - [ ] Crear `public/robots.txt` y `public/sitemap.xml`.
  - [ ] Configurar Open Graph tags e imágenes para previews en redes y WhatsApp.

### 🟡 Prioridad Baja / Mejoras Futuras
- [ ] **Automatización CI/CD**:
  - [ ] Configurar GitHub Actions (`.github/workflows/deploy.yml`) para despliegue automatizado en `main`.
- [ ] **Analítica & Monitoreo**:
  - [ ] Integrar Sentry u OpenTelemetry para monitoreo de errores en el Worker.
  - [ ] Activar Cloudflare Web Analytics.
- [ ] **Internacionalización (i18n)**:
  - [ ] Soporte para catálogo en inglés para clientes turísticos / expatriados en Mérida.
- [ ] **Tests Automatizados**:
  - [ ] Tests unitarios para el store del carrito (`vitest`).
  - [ ] Test end-to-end del flujo de compra y checkout (`playwright`).