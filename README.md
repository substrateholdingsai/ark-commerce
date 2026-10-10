# Temozonia

Cloudflare Worker versátil para servir sitios estáticos Astro con bindings universales a servicios de Cloudflare, listo para contenido interactivo y scripts Python.

## Estructura del Proyecto

```
temozonia/
├── config/
│   └── config.ts          # Fuente de verdad - configuración centralizada
├── worker/
│   └── index.ts           # Entry point del Cloudflare Worker (Hono)
├── astro/
│   ├── src/
│   │   ├── pages/         # Páginas Astro (.astro)
│   │   ├── layouts/       # Layouts base
│   │   ├── components/    # Componentes (Astro, React, Vue, Svelte)
│   │   └── styles/        # Estilos globales
│   ├── public/            # Assets estáticos
│   └── astro.config.mjs   # Config Astro (usa config.ts)
├── scripts/
│   └── python/
│       └── main.py        # Scripts Python para Workers AI
├── wrangler.toml          # Configuración Cloudflare Worker
├── package.json
└── tsconfig.json
```

## Características

- **Sitio Estático Astro**: Rendimiento máximo, SEO óptimo
- **Islas Interactivas**: React/Vue/Svelte con hidratación selectiva (`client:visible`, `client:idle`, etc.)
- **Python en el Edge**: Ejecución via Workers AI / Pyodide
- **Bindings Universales**: D1, KV, R2, Queues, Durable Objects, Vectorize, AI
- **Config Centralizada**: `config/config.ts` como única fuente de verdad
- **TypeScript Estricto**: Tipado completo en Worker, Astro y scripts

## Bindings Cloudflare Configurados

| Binding | Variable | Servicio |
|---------|----------|----------|
| D1 Database | `DB` | Base de datos SQL |
| KV Namespace | `KV` | Key-Value storage |
| R2 Bucket | `R2` | Object storage |
| Queue | `QUEUE` | Message queues |
| Durable Object | `SESSION` | Statefull edge compute |
| Vectorize | `VECTORIZE` | Vector database |
| Workers AI | `AI` | Modelos ML en el edge |

## Comandos

```bash
# Desarrollo local (Worker + Astro)
npm run dev

# Solo Astro dev server
npm run astro:dev

# Build producción
npm run build

# Deploy a Cloudflare
npm run deploy

# Generar types de bindings
npm run cf-typegen
```

## Configuración

Edita `config/config.ts` para personalizar:

- Información del sitio
- Features habilitadas
- Integraciones (Stripe, Sentry, etc.)
- Configuración Python
- Seguridad (CORS, CSP)
- Performance (cache, compresión)

## Python en el Edge

Los scripts en `scripts/python/` pueden ejecutarse via Workers AI:

```bash
# Test local
python scripts/python/main.py process_product_data
python scripts/python/main.py calculate_shipping
```

Desde el Worker (`/api/python/execute?code=...`):

```python
# El código se ejecuta en el sandbox de Workers AI
result = process_product_data(products)
```

## Desarrollo

### Agregar nueva página Astro
```bash
# Crear archivo en astro/src/pages/nueva.astro
```

### Agregar componente interactivo (React)
```bash
# Crear en astro/src/components/MiComponente.tsx
# Usar en .astro: <MiComponente client:visible />
```

### Agregar binding Cloudflare
1. Configurar en `wrangler.toml`
2. Agregar tipo en `worker/index.ts` (Bindings interface)
3. Usar via `c.env.NOMBRE_BINDING`

## Deploy

1. Configura credenciales: `wrangler login`
2. Crea recursos en Cloudflare Dashboard (D1, KV, R2, etc.)
3. Actualiza IDs en `wrangler.toml`
4. `npm run deploy`

## Licencia

MIT