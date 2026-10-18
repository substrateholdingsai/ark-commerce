# ⚡ ARK PULSE · Design System Canon (v1.0) — Ark Systems

> **Canon Oficial de Diseño para Ark Systems (Plataforma Multi-Tenant)**  
> *Nota de Arquitectura:* Cada cliente alojado en la plataforma (tenant) puede contar con su propia identidad visual y design system (como el tema rústico de brasas y humo de Temozonia documentado en [designsystem.md](file:///c:/Users/PAV/Desktop/e-commerce/temozonia/docs/designsystem.md)). **ARK PULSE** rige exclusivamente todo lo relacionado con la plataforma matriz Ark Systems, sus landings maestras, marketing y panel central.

---

## 1. Fundamentos & Filosofía de Marca

* **Misión:** "El arca que carga tu inventario. El pulso que convierte visitantes en compradores."
* **Concepto Visual:** Alto contraste arquitectónico, estética dark modular con energía lima eléctrica, precisión monoespaciada en datos financieros y claridad absoluta.
* **Regla de Oro del Lima:** El color **Lima (#B4FF00)** representa el pulso de conversión. Se utiliza exclusivamente para elementos de acción (≤ 15% de pantalla): botones primarios (CTA), precios destacados, badges de estado y acentos dinámicos. Nunca para texto largo ni fondos completos.

---

## 2. Paleta de Color Oficial

### ⚡ Lima Eléctrica (Conversión & Acentos)
| Token | Hex | Uso Principal |
| :--- | :--- | :--- |
| `lima-100` | `#F2FFCC` | Tints, fondos de badges suaves |
| `lima-400` | `#C6FF33` | Hover en botones primarios y enlaces |
| `lima-500` | `#B4FF00` | **Primary Brand / CTA / Precios / Glow** |
| `lima-700` | `#6B9900` | Textos de acento sobre fondos claros |
| `lima-900` | `#243300` | Bordes y sombras oscuras |

### 🏛️ Ink Arquitectónico (Estructura Dark)
| Token | Hex | Uso Principal |
| :--- | :--- | :--- |
| `ink-950` | `#0B0C0E` | Fondo principal oscuro (`bg-[#0B0C0E]`) |
| `ink-900` | `#121417` | Encabezados, secciones contrastadas |
| `ink-800` | `#1A1D22` | Cards, modales, barras de navegación |
| `ink-700` | `#2A3038` | Módulos secundarios del grid |
| `ink-500` | `#55606B` | Texto secundario y etiquetas |
| `ink-300` | `#A7AEB8` | Texto muted y placeholders |
| `ink-100` | `#E8EAED` | Bordes sutiles en modo claro |
| `ink-50` | `#F4F5F7` | Fondos de tarjetas en modo claro |

### 📄 Paper
* `paper`: `#FFFFFF` (Fondo claro de claridad)

---

## 3. Tipografía Oficial

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
```

1. **Display / Titulares:** `Space Grotesk` (sans-serif)
   * Titulares H1/H2, números de estadísticas, isotipo de marca.
2. **Body / Lectura:** `Inter` (sans-serif)
   * Descripciones, párrafos, formularios, tablas y navegación.
3. **Data / Finanzas:** `JetBrains Mono` (monospace)
   * Precios, montos en Satoshis, hashes de sesión, SKUs y bloques de código.

---

## 4. Efectos & Texturas

* **Glow Lima:** `boxShadow: '0 8px 30px -6px rgba(180,255,0,.35)'`
* **Grid Modular:** Patrón sutil de 48px o 80px con módulos estructurales generados vía `scripts/python/ark_pulse_forge.py`.
* **Animación Pulse Lima:**
  ```css
  @keyframes pulseLima {
    0%, 100% { box-shadow: 0 0 0 0 rgba(180,255,0,.4); }
    50% { box-shadow: 0 0 0 14px rgba(180,255,0,0); }
  }
  ```

---

## 5. Asset Forge

El script generador [scripts/python/ark_pulse_forge.py](file:///c:/Users/PAV/Desktop/e-commerce/temozonia/scripts/python/ark_pulse_forge.py) genera los assets canónicos en `public/images/ark/`:
1. `ark_hero_pattern.png` (1920×720) — Patrón de grid modular con glow lima.
2. `ark_tile_light.png` (400×400) — Tile repetible de puntos grises.
3. `ark_promo_banner.png` (1600×500) — Franjas dinámicas con pulso lima.
4. `ark_logo.png` (512×512) — Isotipo de caja-arca ink con nodo lima.
