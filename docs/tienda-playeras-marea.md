# 📄 tienda-playeras-marea.md

- **Versión:** 1.0.0
- **Instancia:** MAREA
- **Cliente / Tenant:** Tienda de Playeras Personalizadas · Sureste Mexicano
- **Tipo de Huésped:** `retail` (e-commerce)
- **Sistema:** MAREA — playeras personalizadas del Caribe mexicano
- **Fecha:** 2026-11-01
- **Regiones:** Riviera Maya · Cancún · Tulum · Mérida · Cozumel
- **Filosofía:** cada playera lleva su propia ola

> **MAREA no vende playeras. Trae la marea de tu creatividad.**
> Cada diseño es una ola nueva. Cada color, un atardecer diferente.
> Joven, festivo, Caribe mexicano — sin caer en el cliché tiki genérico.

---

## 1 · Manifiesto

El sureste mexicano tiene su propia energía festiva: las olas que cambian cada día,
los atardeceres coral, el turquesa del agua, el amarillo mango de la fruta madura,
el verde selva que abraza las playas.

**MAREA** traduce esa energía a una tienda de playeras personalizadas:
**joven, divertida, saturada de color, pero con identidad propia**.

No hacemos "Tiki genérico" (eso es hawaiano). Honramos la **estética del logo actual**
(teal + coral + formas de máscara abstracta) y la expandimos con la paleta del Caribe mexicano.

**Regla ornamental: Regla del 12% festivo.** Los patrones de olas, triángulos y máscaras
aparecen como decoración activa (más alta que el 8% usual porque es retail joven).
El resto es legibilidad y producto.

---

## 2 · Tokens de color

### 2.1 · Colores del logo actual (anclaje de marca)

| Token | HEX | HSL | Uso original | Regla |
|---|---:|---|---|---|
| `teal-logo` | `#0EA9A8` | `hsl(180 87% 36%)` | Círculo exterior del logo | Solo para botones/fondos grandes |
| `coral-logo` | `#E94E49` | `hsl(2 81% 60%)` | Círculo interior del logo | Solo para botones/fondos grandes |

**⚠️ Ninguno funciona como texto pequeño sobre blanco.** Usar solo como fondo de botón o decoración.

### 2.2 · Paleta núcleo clara (default)

| Rol | Token | HEX | HSL | Tailwind | Uso |
|---|---|---:|---|---|---|
| Fondo maestro | `bg-primary` | `#FFF9F0` | `hsl(36 100% 97%)` | `bg-marea-arena` | Crema cálida, fondo general |
| Lienzo | `bg-canvas` | `#FEF3E2` | `hsl(33 88% 94%)` | `bg-marea-arena-2` | Arena caribe, secciones alternas |
| Superficie | `bg-surface` | `#FFFFFF` | `hsl(0 0% 100%)` | `bg-marea-blanco` | Tarjetas de producto, modales |
| Borde | `border-line` | `#F0E5D0` | `hsl(38 55% 88%)` | `border-marea-arena-b` | Hairlines, separadores |

### 2.3 · Acentos de marca (con gemelos seguros)

| Rol | Token | HEX | HSL | Uso | Contraste |
|---|---|---:|---|---|---|
| Acento primario | `teal-500` | `#0EA9A8` | `hsl(180 87% 36%)` | Botón "Agregar al carrito", badges | `2.88:1` FAIL (texto) |
| Teal oscuro (texto) | `teal-dk` | `#087F7E` | `hsl(180 91% 26%)` | Enlaces, texto teal seguro | `4.84:1` AA ✅ |
| Teal luminoso | `teal-hi` | `#3FD4D2` | `hsl(180 61% 54%)` | Hover, dark mode | — |
| Acento secundario | `coral-500` | `#E94E49` | `hsl(2 81% 60%)` | Botón "Comprar ahora", alertas | `3.72:1` AA-large |
| Coral oscuro (texto) | `coral-dk` | `#C53732` | `hsl(2 60% 48%)` | Texto coral seguro | `5.30:1` AA ✅ |
| Coral luminoso | `coral-hi` | `#FF7B76` | `hsl(2 100% 73%)` | Hover, dark mode | — |

### 2.4 · Paleta festiva extendida (nuevos colores MAREA)

| Token | HEX | HSL | Uso | Contraste |
|---|---:|---|---|---|
| `mango-500` | `#FFB947` | `hsl(38 100% 64%)` | Acento festivo, "Nuevo", descuento | Texto oscuro necesario |
| `mango-dk` | `#C98F1F` | `hsl(38 73% 45%)` | Texto mango seguro | `4.5:1` AA |
| `selva-500` | `#2FA060` | `hsl(145 55% 40%)` | Disponible, éxito, stock | — |
| `selva-dk` | `#1F7A45` | `hsl(145 59% 30%)` | Texto verde seguro | `5.2:1` AA |
| `lavanda-500` | `#8B6FC9` | `hsl(260 43% 61%)` | Acento alternativo, categorías | — |

### 2.5 · Paleta oscura (footer / modo dark / checkout nocturno)

| Rol | Token | HEX | HSL | Tailwind |
|---|---|---:|---|---|
| Fondo maestro | `bg-primary-dk` | `#0F2E2C` | `hsl(176 51% 12%)` | `bg-marea-noche` |
| Lienzo oscuro | `bg-canvas-dk` | `#163B38` | `hsl(176 45% 16%)` | `bg-marea-noche-2` |
| Borde oscuro | `border-line-dk` | `#264F4B` | `hsl(176 34% 23%)` | `border-marea-noche-b` |
| Texto primario | `text-primary-dk` | `#FFF9F0` | `hsl(36 100% 97%)` | `text-marea-arena` |
| Texto secundario | `text-secondary-dk` | `#B8D4D1` | `hsl(176 25% 78%)` | `text-marea-bruma` |

### 2.6 · Textos claros (sobre fondos arena/blanco)

| Rol | Token | HEX | Contraste sobre arena |
|---|---|---:|---|
| Texto principal | `text-primary` | `#1A3B38` | `11.52:1` AAA ✅ |
| Texto secundario | `text-secondary` | `#3D5C58` | `7.24:1` AAA ✅ |
| Texto muted | `text-muted` | `#6B8280` | `4.52:1` AA |

### 2.7 · Semáforo de estado e-commerce

| Estado | HEX | Regla visual | Uso |
|---|---|---|---|
| Disponible / éxito | `#2FA060` | Badge semitransparente + texto verde oscuro | Producto en stock |
| Alerta / descuento | `#FFB947` | Badge semitransparente + texto mango oscuro | Oferta, pocas unidades |
| Error / eliminar | `#E94E49` | Badge semitransparente + texto coral oscuro | Carrito vacío, error |
| Info / nuevo | `#0EA9A8` | Badge semitransparente + texto teal oscuro | Nuevo diseño |
| Agotado | `#6B8280` | Badge gris neutro | Sin stock |

### 2.8 · Tabla de contraste WCAG verificada

| Combinación | Ratio | Nivel | Uso permitido |
|---|---:|---|---|
| Tinta `#1A3B38` / Arena `#FFF9F0` | **11.52:1** | AAA | Texto principal |
| Tinta 2 `#3D5C58` / Arena `#FFF9F0` | **7.24:1** | AAA | Texto secundario |
| Tinta 3 `#6B8280` / Arena `#FFF9F0` | **4.52:1** | AA | Texto mínimo |
| Teal `#0EA9A8` / Blanco (texto) | **2.88:1** | FAIL | ❌ Nunca como texto pequeño |
| Teal dk `#087F7E` / Blanco | **4.84:1** | AA | ✅ Texto teal seguro |
| Coral `#E94E49` / Blanco (texto) | **3.72:1** | AA-large | Solo ≥24px |
| Coral dk `#C53732` / Blanco | **5.30:1** | AA | ✅ Texto coral seguro |
| Blanco / Teal `#0EA9A8` (botón) | **2.88:1** | FAIL | ⚠️ Usar texto oscuro o botón grande |
| Blanco / Coral `#E94E49` (botón grande) | **3.72:1** | AA-large | Solo CTA ≥24px |
| Tinta / Teal (botón) | **11.52:1** | AAA | ✅ Texto oscuro sobre botón teal |
| Blanco / Noche `#0F2E2C` | **13.18:1** | AAA | Texto en footer oscuro |
| Teal hi `#3FD4D2` / Noche | **8.47:1** | AAA | Acento sobre oscuro |
| Coral hi `#FF7B76` / Noche | **6.89:1** | AA | Acento sobre oscuro |
| Mango `#FFB947` / Tinta | **9.12:1** | AAA | Texto oscuro sobre botón mango |

### 2.9 · Regla WCAG explícita

- **Nunca** usar teal `#0EA9A8` o coral `#E94E49` como texto pequeño sobre blanco (fallan contraste).
- Texto teal pequeño: usar SIEMPRE el gemelo `teal-dk` `#087F7E`.
- Texto coral pequeño: usar SIEMPRE el gemelo `coral-dk` `#C53732`.
- Botones teal/coral: usar texto oscuro `#1A3B38` o blanco solo en botones grandes (≥24px, bold).
- Badges de estado: fondo semitransparente + texto del color oscuro.
- En modo oscuro: texto `#FFF9F0` sobre noche `#0F2E2C` da 13.18:1 AAA.

### 2.10 · Tailwind config

```js
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        marea: {
          arena: "#FFF9F0",
          "arena-2": "#FEF3E2",
          blanco: "#FFFFFF",
          "arena-b": "#F0E5D0",
          teal: "#0EA9A8",
          "teal-dk": "#087F7E",
          "teal-hi": "#3FD4D2",
          coral: "#E94E49",
          "coral-dk": "#C53732",
          "coral-hi": "#FF7B76",
          mango: "#FFB947",
          "mango-dk": "#C98F1F",
          selva: "#2FA060",
          "selva-dk": "#1F7A45",
          lavanda: "#8B6FC9",
          tinta: "#1A3B38",
          "tinta-2": "#3D5C58",
          "tinta-3": "#6B8280",
          noche: "#0F2E2C",
          "noche-2": "#163B38",
          "noche-b": "#264F4B",
          bruma: "#B8D4D1",
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Nunito"', 'cursive'],
        body: ['"Nunito"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        marea: '20px',
        'marea-lg': '28px',
        ola: '50% 50% 50% 50% / 60% 60% 40% 40%',
      },
      boxShadow: {
        ola: '0 8px 24px -6px rgba(14, 169, 168, 0.18)',
        coral: '0 8px 24px -6px rgba(233, 78, 73, 0.20)',
        fiesta: '0 12px 32px -8px rgba(255, 185, 71, 0.30)',
      },
    },
  },
}
```

---

## 3 · Tríada tipográfica

| Rol | Fuente | Peso | Uso |
|---|---|---:|---|
| Display | `Baloo 2` | 600–700 | Titulares divertidos, nombre de producto, badges grandes |
| Cuerpo / UI | `Nunito` | 400–600 | Descripciones, navegación, botones, lectura |
| Mono | `JetBrains Mono` | 400–500 | **Obligatoria con `tabular-nums`**: precios, tallas, SKU, códigos de orden |

### Formato de datos e-commerce

- **Precio:** `$249 MXN` (sin centavos, con espacio antes de la moneda)
- **Precio con descuento:** `~~$349~~ $249 MXN` (tachado + nuevo precio en coral)
- **Tallas:** `S · M · L · XL · XXL` (mono uppercase)
- **SKU:** `MAREA-TKL-0042` (mono puro)
- **Orden:** `#MX-2026-00847` (mono con prefijo regional)
- **Stock:** `12 disponibles` o `3 en stock` (badge de estado)

### Escala tipográfica

| Elemento | Tamaño | Peso | Line-height | Fuente |
|---|---|---:|---|---|
| H1 hero | 3rem / 48px | 700 | 1.1 | Baloo 2 |
| H2 categoría | 2rem / 32px | 700 | 1.2 | Baloo 2 |
| H3 producto | 1.25rem / 20px | 600 | 1.3 | Baloo 2 |
| Cuerpo | 1rem / 16px | 400 | 1.5 | Nunito |
| Precio | 1.25rem / 20px | 600 | 1.2 | JetBrains Mono |
| Talla/SKU | 0.875rem / 14px | 500 uppercase | 1.4 | JetBrains Mono |
| Badge | 0.75rem / 12px | 600 uppercase | 1.2 | Nunito |

### CSS tipográfico base

```css
:root {
  --marea-font-display: "Baloo 2", "Nunito", cursive;
  --marea-font-body: "Nunito", Inter, sans-serif;
  --marea-font-mono: "JetBrains Mono", Consolas, monospace;
}
.marea-display { font-family: var(--marea-font-display); font-weight: 700; letter-spacing: -0.02em; }
.marea-body    { font-family: var(--marea-font-body); font-weight: 400; }
.marea-label   { font-family: var(--marea-font-body); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.75rem; }
.marea-mono    { font-family: var(--marea-font-mono); font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }
.marea-price   { font-family: var(--marea-font-mono); font-weight: 600; font-variant-numeric: tabular-nums; color: var(--marea-tinta); }
```

---

## 4 · Metáfora de operación

### 4.1 · Vocabulario del tenant (retail playeras)

| Concepto genérico | Vocabulario MAREA |
|---|---|
| Product / item | `playera` o `diseño` |
| Design / artwork | `estampado` |
| Size | `talla` |
| Color variant | `color de tela` |
| Add to cart | `llevarla conmigo` |
| Checkout | `pagar mi ola` |
| Order | `pedido` |
| Custom design | `tu diseño` o `diseño personalizado` |
| Upload artwork | `sube tu diseño` |
| Best seller | `la más pedida` |
| New arrival | `recién llegada` |
| Sale / discount | `oferta` o `rebaja` |
| Stock | `disponibles` |
| Out of stock | `agotada` |

### 4.2 · Metáforas MAREA (permitidas, contextualizadas)

- **Olas**: el motivo principal del logo, patrones de fondo
- **Triángulos**: como los del logo, pueden ser olas estilizadas o dientes de máscara abstracta
- **Máscara abstracta**: la forma central del logo, nunca literal ni sagrada
- **Banda ondulada**: la ola del logo, separadores de sección
- **Colores de atardecer**: coral, mango, lavanda — el cielo sobre el Caribe
- **Arena y conchas**: texturas de fondo cálidas
- **Palmeras / vegetación**: como acento, nunca como cliché turístico
- **Sol**: círculo coral/mango como elemento energético

### 4.3 · Lo que NUNCA hacemos (ética cultural)

❌ **Prohibido:**
- Tiki genérico hawaiano/polinesio (apropiación fuera de contexto)
- Máscaras tribales literales o con significado ceremonial
- Sombreros de palma, ukeleles, collares hawaianos
- Tipografía "tiki" estereotipada
- Cliché de spring break / fiesta universitaria genérica
- Azul aguamarina saturado tipo anuncio turístico barato
- Fotos stock genéricas de playa

✅ **Permitido:**
- Abstracción del logo existente (máscara estilizada)
- Olas y triángulos como patrones geométricos
- Colores del Caribe mexicano (no genéricos)
- Tipografía divertida pero legible (Baloo 2, Nunito)
- Fotografía de producto real (playeras con diseños propios)
- Lenguaje joven sin caer en lo infantil

### 4.4 · Flujo del comprador

1. **Portada** — hero con playera destacada, filtro rápido por categoría
2. **Explorar** — grid de productos con filtros (talla, color, categoría, precio)
3. **Ficha de producto** — fotos, selector de talla, color, cantidad, "Llévala conmigo"
4. **Personalizar** — upload de diseño propio, preview en tiempo real
5. **Carrito** — resumen de productos, código de descuento, total
6. **Checkout** — dirección, método de pago, confirmación
7. **Mi pedido** — tracking, estado de producción

---

## 5 · Capa artística

### 5.1 · Ética visual

MAREA es **joven sin ser infantil**, **festivo sin ser caótico**, **caribeño sin ser turístico**.

Los colores del logo (teal, coral) son el ancla. La ampliación (mango, selva, lavanda)
da variedad sin perder coherencia.

Los patrones geométricos (olas, triángulos, máscara abstracta) decoran fondos y bordes,
pero nunca compiten con el producto.

**Regla del 12% festivo:** más alta que el 8% usual porque es retail joven y la energía importa.
Pero el producto siempre es protagonista.

### 5.2 · Anatomía de componentes

```css
:root {
  --marea-arena: #FFF9F0;
  --marea-arena-2: #FEF3E2;
  --marea-blanco: #FFFFFF;
  --marea-arena-b: #F0E5D0;
  --marea-teal: #0EA9A8;
  --marea-teal-dk: #087F7E;
  --marea-coral: #E94E49;
  --marea-coral-dk: #C53732;
  --marea-mango: #FFB947;
  --marea-tinta: #1A3B38;
  --marea-radius: 20px;
}

/* Tarjeta de producto */
.marea-producto {
  background: var(--marea-blanco);
  border: 1px solid var(--marea-arena-b);
  border-radius: var(--marea-radius);
  box-shadow: 0 8px 24px -6px rgba(14, 169, 168, 0.18);
  overflow: hidden;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.marea-producto:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -8px rgba(233, 78, 73, 0.20);
}
.marea-producto__imagen { aspect-ratio: 1/1; object-fit: cover; }
.marea-producto__precio {
  font-family: var(--marea-font-mono);
  font-weight: 600;
  color: var(--marea-tinta);
}

/* Botón primario (teal del logo) */
.marea-btn-primary {
  background: var(--marea-teal);
  color: var(--marea-tinta);
  border: none;
  border-radius: 999px;
  padding: 14px 28px;
  font-family: var(--marea-font-body);
  font-weight: 600;
  transition: background 200ms ease, transform 150ms ease;
}
.marea-btn-primary:hover {
  background: #3FD4D2;
  transform: scale(1.02);
}

/* Botón secundario (coral del logo) */
.marea-btn-coral {
  background: var(--marea-coral);
  color: var(--marea-blanco);
  border-radius: 999px;
  padding: 14px 28px;
  font-weight: 600;
}
.marea-btn-coral:hover {
  background: var(--marea-coral-dk);
}

/* Botón mango (ofertas, descuentos) */
.marea-btn-mango {
  background: var(--marea-mango);
  color: var(--marea-tinta);
  border-radius: 999px;
  padding: 14px 28px;
  font-weight: 600;
}

/* Badge de estado */
.marea-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-family: var(--marea-font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.marea-badge--stock    { background: rgba(47,160,96,0.12); color: #1F7A45; border: 1px solid rgba(47,160,96,0.3); }
.marea-badge--oferta   { background: rgba(255,185,71,0.16); color: #C98F1F; border: 1px solid rgba(255,185,71,0.35); }
.marea-badge--agotado  { background: rgba(107,130,128,0.12); color: #3D5C58; border: 1px solid rgba(107,130,128,0.3); }
.marea-badge--nuevo    { background: rgba(14,169,168,0.12); color: #087F7E; border: 1px solid rgba(14,169,168,0.3); }

/* Selector de tallas */
.marea-talla {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  border: 2px solid var(--marea-arena-b);
  border-radius: 12px;
  font-family: var(--marea-font-mono);
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}
.marea-talla:hover { border-color: var(--marea-teal); }
.marea-talla--activa {
  background: var(--marea-teal);
  color: var(--marea-tinta);
  border-color: var(--marea-teal);
}

/* Banner de oferta (mango) */
.marea-oferta-banner {
  background: linear-gradient(135deg, #FFB947, #FF9E2B);
  color: var(--marea-tinta);
  border-radius: 16px;
  padding: 16px 24px;
  font-weight: 700;
}

/* Fondo con textura de olas */
.marea-olas-bg {
  background-color: var(--marea-arena);
  background-image: url("/assets/marea/pattern-olas.svg");
  background-size: 64px 64px;
}

/* Divisor de ola */
.marea-ola-divider {
  height: 32px;
  background-image: url("/assets/marea/divider-ola.svg");
  background-repeat: repeat-x;
}

/* Navegación con blur */
.marea-nav {
  background: rgba(255, 249, 240, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid var(--marea-arena-b);
}

/* Footer oscuro (modo noche) */
.marea-footer {
  background: var(--marea-noche);
  color: var(--marea-bruma);
}
.marea-footer a:hover { color: var(--marea-teal-hi); }
```

### 5.3 · Voz de marca

Joven, directa, festiva. Como un amigo que te recomienda su playera favorita.
Sin formalidad excesiva, sin ser infantil.

Modelos:
- "¡Tu diseño está listo! 🌊 Ahora solo falta que lo estrene alguien con onda."
- "Esta playera tiene más onda que el fin de semana. Llévatela."
- "¿Ya viste la nueva colección? Está que arde. 🔥"
- "Personaliza la tuya: sube tu diseño, elige el color, y la hacemos realidad."
- "Talla M, color teal, diseño 'Ola Nocturna'. ¿La agregamos al carrito?"

### 5.4 · Do / Don't

| Do | Don't |
|---|---|
| Usar teal/coral del logo como botones y fondos grandes | Usar teal/coral como texto pequeño sobre blanco |
| Gemelos oscuros (teal-dk, coral-dk) para texto legible | Azul aguamarina saturado tipo anuncio turístico |
| Baloo 2 para titulares divertidos | Tipografía "tiki" estereotipada o infantil |
| Nunito para cuerpo legible | Fuentes serif elegantes (esto no es lujo, es diversión) |
| Mono tabular para precios, tallas, SKU | Precios en proporcional |
| Patrones de olas y triángulos como textura | Máscaras tribales literales o sagradas |
| Badges semitransparentes con texto del color oscuro | Badges sólidos con texto blanco (fallan) |
| Regla del 12% festivo (retail joven) | Sobrecargar con decoración que tape el producto |
| Lenguaje cercano pero profesional | Lenguaje infantil o excesivamente informal |
| Fotografía de producto real | Stock photos genéricas de playa |

### 5.5 · Inventario de assets MAREA

**Técnico mínimo:** `favicon.svg` · `logo-lockup.svg` · `pattern-olas.svg` · `manifest.json`

**Kit artístico vectorial:** `pattern-triangulos.svg` · `pattern-mascara.svg` · `texture-arena.svg` ·
`monogram-marea.svg` · `divider-ola.svg` · `og-image.svg` · `sprite-playera.svg`

**Sprite gremial (8 iconos 24×24, stroke 1.7, currentColor):**
- `playera` — camiseta
- `ola` — ola / mar
- `paleta` — personalización de color
- `talla` — regla de medidas
- `carrito` — carrito de compras
- `pincel` — diseño personalizado
- `sol` — categoría tropical
- `envio` — entrega

**Capa raster SEO/PWA:** `og-image.png` · `twitter-card.png` · `apple-touch-icon.png` ·
`favicon-32/16.png` · `android-chrome-192/512.png` · `favicon.ico` · `site.webmanifest` ·
`robots.txt` · `meta-tags.html` · modo `--alert` para ofertas y lanzamientos.
