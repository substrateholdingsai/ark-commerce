# MAREA Configurator — Flujo

## Componentes
- `src/components/marea/ProductConfigurator.tsx` (island React): prenda → color → talla → técnica (filtrada por `metadata.tecnicas_soportadas`, recomendadas marcadas) → diseño.
- `src/components/marea/DesignGallery.tsx` (island React): grid filtrable por técnica recomendada.

## API
- `GET /api/products?tenant=marea` devuelve prendas con `metadata` (base_cost, print_cost, tallas, colores, tecnicas_soportadas, tecnicas_recomendadas, margin_pct).
- `GET /api/designs?tenant=marea` devuelve estampas (tabla `designs`).

## Pricing
- `src/utils/pricing.ts` → `calcularPrecio({ product, talla, color, tecnica })` retorna `{ base, print, total, totalConIva, valid, error? }`.
- El frontend muestra desglose; el checkout revalida contra D1 y rechaza precios manipulados (400).

## Carrito
- `addItemConfigured` genera línea con clave compuesta `cfg:product|design|talla|color|tecnica` y guarda `precio_calculado` + `breakdown`.

## Checkout
- `CheckoutItemSchema` acepta `design_id, talla, color, tecnica, precio_calculado`.
- `order_items` persiste `design_id, talla, color, tecnica, base_cost, print_cost, precio_final`.
