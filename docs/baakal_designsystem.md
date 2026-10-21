# 🔧 **BAAKAL** — Plomería & Gas · Sureste Mexicano

> **Design System v1.0** · Instancia: `Baakal` (referencia a Palenque) · Cliente: **Template Plomería & Gas**
> Tipo de Huésped: `service` (oficio / honorarios B2C y comercial)

---

## 1 · Manifiesto

**Baakal** es el nombre maya de Palenque — la ciudad donde la arquitectura se funde con la selva, donde el agua fluye por acueductos de piedra desde el año 600 d.C. Los mayas eran **ingenieros hidráulicos** antes de que existiera la palabra "plomero".

Este sistema honra esa herencia sin caer en el cliché turístico. No usamos glifos literales ni pirámides de postal. Usamos **proporción, textura y color** del sureste mexicano: la cal de las paredes, el cobre de las tuberías, el turquesa del agua, la terracota de la tierra.

**Frase madre del sistema:**
> *"Donde el agua fluye, la vida permanece."*

### 1.1 · Ética del sistema
- **Cero apropiación:** nada de glifos sagrados, nada de calendarios aztecas, nada de "místico" gratuito.
- **Referencia arquitectónica e ingenieril:** acueductos, proporción áurea, texturas de piedra caliza, colores de la selva y el río.
- **Oficio sobre ornamentación:** el plomero es el héroe, no el arqueólogo. Los detalles son sutiles — un filete, un patrón de fondo, un ícono.

---

## 2 · Tokens de Color

### 2.1 · Superficie (la cal y la piedra)
| Token | Hex | Rol |
|---|---|---|
| `bg-canvas` | `#F5F1E8` | Fondo principal (crema cal, modo día) |
| `bg-primary` | `#1A2F2A` | Fondo nocturno / hero oscuro (verde selva profundo) |
| `bg-surface` | `#FFFFFF` | Tarjetas, paneles, modales |
| `bg-surface-alt` | `#E8E2D4` | Filas alternas, hover de tarjeta |

### 2.2 · Acento Quirúrgico (≤10% de superficie)
| Token | Hex | Rol |
|---|---|---|
| `accent-500` | `#2A7F9E` | **Agua** · botón primario · enlaces · íconos activos |
| `accent-400` | `#35A0C4` | Hover / foco |
| `accent-600` | `#1E5F76` | Estado activo, selección |

### 2.3 · Oficio (cobre y tierra — lo que se toca)
| Token | Hex | Rol |
|---|---|---|
| `copper-500` | `#B87333` | **Cobre** · tubería, herramienta, detalle ornamental |
| `terracotta-500` | `#C86B4A` | **Tierra** · alertas, gas (fuego), urgencia |
| `jade-500` | `#2E7D6F` | **Jade** · éxito, vigente, completado |

### 2.4 · Bordes y Filetes
`border-line: #D6CEBC` · `border-strong: #B8A88A`

### 2.5 · Texto y Contraste WCAG 2.2
`text-primary: #1A2F2A` · `text-secondary: #5A6B63` · `text-inverse: #F5F1E8`
- `accent-500` sobre `bg-surface`: 4.8 : 1 (AA)
- `text-inverse` sobre `bg-primary`: 13.1 : 1 (AAA)
- **Regla de oro:** El botón turquesa lleva **texto blanco**, nunca negro.

---

## 3 · Tríada Tipográfica

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| **Display** | `Outfit` | 500 / 600 / 700 | Titulares, hero, nombre del negocio |
| **Cuerpo** | `Inter` | 400 / 500 / 600 | UI, navegación, descripción de servicios |
| **Datos** | `JetBrains Mono` | 400 / 500 | Folios, presupuestos, CLABE, montos |

### Ley de las Cifras
```css
.cifra {
  font-family: "JetBrains Mono", monospace;
  font-variant-numeric: tabular-nums lining-nums;
  text-align: right;
}
```
- Presupuestos: `$1,248.00`
- Folios: `#PLM-2026-0847`

---

## 4 · Metáfora de Compra
- Producto → **Servicio**
- Carrito → **Propuesta**
- Agregar al carrito → **Integrar a propuesta**
- Subtotal → **Base imponible**
- IVA → **IVA (16%)**
- Total → **Total a pagar**
- Checkout → **Formalizar por WhatsApp**
