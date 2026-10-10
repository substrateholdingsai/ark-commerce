# 🎨 Design System — Temozonia

## 1. Paleta de Colores

| Variable | Hex | Uso |
|----------|-----|-----|
| `brand-500` | `#FD5C0D` | Primario CTA, botones |
| `brand-600` | `#F54B06` | Hover de CTAs |
| `brand-700` | `#C23006` | Pressionado |
| `brand-900` | `#7E1D0F` | Textos oscuros/títulos |

### Gold (Oro)

| Variable | Hex | Uso |
|----------|-----|-----|
| `gold-500` | `#F59E0B` | Acentos secundarios |
| `gold-DEFAULT` | `#D4AF37` | Elementos premium, bordes, detalles |
| `gold-300` | `#FDE047` | Glow sutil |

### Liquid Glass (Vidrio Líquido)

| Variable | Hex | Uso |
|----------|-----|-----|
| `liquid-bg` | `#0A0A0F` | Fondo de cards con blur |
| `liquid-accent` | `#FFFFFF20` | Borde translúcido |

### Warm Neutral (Base)

| Variable | Hex | Uso |
|----------|-----|-----|
| `cream` | `#FFFCF5` | Fondos primarios |
| `parchment` | `#F9F3E9` | Cards, recibos |
| `warm-brown` | `#4A3A2A` | Texto secundario |
| `dark-wood` | `#2A1A0A` | Texto primario, títulos |
| `deep-red` | `#8B1E1E` | Acentos premium |

## 2. Tipografía

Combinamos la elegancia clásica con la legibilidad moderna.

| Fuente | Categoría | Pesos | Uso |
|--------|-----------|-------|-----|
| **Playfair Display** | Display / Serif | 400, 700, 900 | Títulos principales (H1, H2), nombres de productos, montos totales. Transmite lujo y tradición. |
| **Cormorant Garamond** | Script / Serif | 400, 600, 700 (Italic) | Logotipo, subtítulos decorativos, citas. Transmite artesanía y herencia. |
| **Inter** | Body / Sans | 300, 400, 500, 600 | Texto de cuerpo, descripciones, UI elements (inputs, tabs). Máxima legibilidad. |
| **Orbitron** | Monospace | 500, 700, 900 | Exclusivo para el efecto "Liquid Glass" en calculadoras y totales de pago. |

### Jerarquía Tipogránica

| Elemento | Clases Tailwind |
|----------|-----------------|
| **H1 (Hero)** | `font-display text-6xl md:text-7xl font-black text-dark-wood` |
| **H2 (Sección)** | `font-script text-5xl md:text-6xl text-dark-wood` |
| **H3 (Subsección)** | `font-display text-2xl font-bold text-dark-wood` |
| **Body** | `font-body text-base text-warm-brown leading-relaxed` |
| **Caption/Label** | `font-display text-xs uppercase tracking-widder text-warm-brown` |

## 3. Texturas y Efectos Especiales

### 3.1 Efecto "Liquid Glass" (Cúpula de Resina)

Inspirado en calculadoras vintage. Se aplica a botones de pago y montos totales para dar sensación de profundidad y magnificación.

**Mecánica CSS:**

- **Fondo:** Gradiente lineal vertical (blanco → gris claro).
- **Brillo superior (::before):** Gradiente semitransparente en el 40% superior para simular el reflejo de la cúpula.
- **Sombra sólida inferior:** `box-shadow: 0 4px 0 #888` para dar la ilusión 3D de profundidad.
- **Texto magnificado:** `text-shadow` múltiple + `filter: drop-shadow` para que el número aparezca flotando bajo la resina.

Ver implementación en `src/styles/globals.css` bajo las clases `.glass-btn` y `.payment-total-glass`.

### 3.2 Oro Estratégico

El dorado NO se usa como fondo. Se usa exclusivamente en:

1. **Divisores:** Líneas con `linear-gradient` y un diamante (◆) central.
2. **Bordes de contenedores premium:** Tarjetas de producto y el recibo digital (doble borde: exterior `gold`, interior `gold/40`).
3. **Badges de estado:** "Más Vendido", "Bitcoin Lightning" (con gradiente dorado completo).
4. **Sello del Logo:** Borde circular alrededor del icono principal.

### 3.3 Textura de Papel (Sutil)

El fondo `cream` y `parchment` lleva una textura SVG de ruido fractal (`feTurbulence`) con opacidad del 6%. Esto evita que el sitio se vea "plástico" y le da una sensación orgánica de papel pergamino.

## 4. Componentes UI Principales

### 4.1 Botones

| Clase | Estilo | Uso |
|-------|--------|-----|
| `.btn-heritage` | Primario. Fondo `deep-red` con gradiente, borde `gold`, texto `cream`. Efecto de brillo al hover (::before slide). | Acciones generales |
| `.glass-btn` | Secundario/Calculadora. Efecto Liquid Glass claro. | Calculadora, toggle |
| `.glass-btn-dark` | Acción principal de pago (ej. "Pagar con Bitcoin"). Efecto Liquid Glass oscuro con texto blanco/dorado. | Checkout |

### 4.2 Tarjetas de Producto (`.product-card-heritage`)

- Fondo `cream` o `parchment`.
- **Borde doble:** `2px solid deep-red` exterior, `1px solid gold` interior (usando `::before`).
- **Hover:** `translateY(-8px)` y sombra suave roja.
- **Badge "Más Vendido":** Ribbon con `clip-path` en la esquina superior.

### 4.3 Recibo Digital (`.receipt-gold`)

- Fondo `#FFFDF5` (blanco hueso).
- Borde `2px solid gold` con sombra difusa.
- Líneas divisorias `border-dashed` entre secciones.
- El **TOTAL** siempre debe ir dentro de un contenedor `.payment-total-glass`.

## 5. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | Next.js 14+ (App Router) | Rendimiento, SEO, Server Components, y soporte nativo para i18n. |
| Estilos | Tailwind CSS | Desarrollo rápido, consistente y fácil de mantener. |
| Animaciones | CSS Nativo + Framer Motion | CSS para efectos estáticos (Liquid Glass), Framer para transiciones de página y scroll reveal. |
| Estado Global | Zustand | Ligero, rápido y perfecto para manejar el carrito de compras sin boilerplate. |
| Internacionalización | next-intl | Estándar de la industria para i18n en App Router. Soporta es y en desde el día 1. |
| Iconografía | Lucide React | Iconos SVG limpios, consistentes y personalizables con Tailwind. |
| Pagos | BTCPay Server (API) + Mercado Pago | Soberanía financiera (0% comisión) + opción tradicional para el usuario promedio. |

## 6. Reglas de Implementación

1. **Variables de Tailwind:** Siempre usa las variables de Tailwind. No escribas `#8B1E1E` en el código. Usa `bg-deep-red` o `text-deep-red`.

2. **i18n First:** Todo texto visible para el usuario debe provenir de `src/messages/es.json` o `en.json` usando el hook `useTranslations`. Nunca hardcodear texto en los componentes.

3. **Accesibilidad (a11y):**
   - Asegurar contraste suficiente (ej. texto `dark-wood` sobre `cream` pasa WCAG AA).
   - Todos los botones deben tener `aria-label` si solo contienen iconos.
   - El efecto Liquid Glass no debe impedir la lectura del monto (el `text-shadow` está calibrado para mantener la legibilidad).

4. **Imágenes:** Usar `next/image` con `placeholder="blur"` para todas las fotos de productos.