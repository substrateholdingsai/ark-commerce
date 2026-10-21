# 📄 CONTAGRAM · ISFAHAN LEDGER — Canon de Diseño v1.0

> **Design System v1.0** · Instancia: `Isfahan Ledger` · Cliente: **Contagram — Despacho de Contabilidad**  
> Principio rector: *"La certeza es ornamental. El orden se ve."*

---

## 1 · Manifiesto y Ética

Contagram no vende miedo fiscal. Entrega **certidumbre**: el estado financiero como una pieza bien construida, donde cada cifra está en su lugar porque el sistema la obliga a estarlo.

Isfahan aporta el lenguaje: **azul lapislázuli** (profundidad, pericia, silencio), **oro** (valor, patrimonio, lo que perdura) y **girih** (la prueba visual de que el equilibrio es posible). La simetría no es decoración: es la metáfora estructural del balance general.

**Frase madre del sistema:**
> *"Un libro mayor es un mosaico: si una tesela falla, se ve en todo el muro."*

### 1.1 · Ética del sistema (no negociable)
Usamos **geometría**, no iconografía sagrada. La referencia es matemática e histórica — teselación, proporción, esmalte — tratada con respeto y precisión. Un despacho que respeta el origen de sus formas, respeta tus cifras.

---

## 2 · Tokens de Color

### 2.1 · Lapis (azul persa profundo — la base del sistema)
| Token | Hex | Rol |
|---|---|---|
| `lapis-950` | `#040F1D` | Fondo abisal. Hero, footer, portada |
| `lapis-900` | `#071A30` | **Superficie primaria nocturna** |
| `lapis-800` | `#0C2440` | Tarjetas, paneles, libro mayor |
| `lapis-700` | `#143353` | Bordes estructurales, filetes |
| `lapis-600` | `#1F476F` | DÉBITO · Gráficas |
| `lapis-500` | `#35608A` | Datos secundarios, ejes |
| `lapis-300` | `#8FAAC6` | Texto terciario sobre oscuro |
| `lapis-100` | `#DCE6F2` | Texto secundario sobre oscuro |

### 2.2 · Zarrin (oro — acento quirúrgico ≤10%)
| Token | Hex | Rol |
|---|---|---|
| `gold-500` | `#C9A227` | **ACENTO PRINCIPAL** · Botón primario · Reglas ornamentales |
| `gold-400` | `#D4AF37` | Hover / foco · Filetes de 1px |
| `gold-300` | `#E3C274` | Detalles finos, monogramas, estrellas |
| `gold-200` | `#EED9A0` | Degradado de pan de oro |
| `gold-700` | `#7E6114` | Oro sobre claro (contraste) |

### 2.3 · Cal (neutros cálidos — reportes e impresión)
`chalk-50: #FBF9F4` · `chalk-100: #F4F0E6` · `chalk-200: #E8E2D4`

---

## 3 · Reglas Inviolables de UX & Tipografía

1. **Ley de las Cifras:**
   Todas las cantidades numéricas deben renderizarse con `IBM Plex Mono`, `font-variant-numeric: tabular-nums lining-nums` y alineación obligatoria a la derecha.
2. **WCAG 2.2 AAA:**
   El botón dorado (`gold-500`) SIEMPRE lleva texto oscuro (`lapis-950`), **nunca blanco**. Ratio de contraste verificado: 7.7 : 1.
3. **Metáfora B2B:**
   Se prohíbe el uso de terminología de retail ("carrito", "stock", "añadir"). Se utiliza la semántica del libro contable: **"Póliza de Apertura", "Tesela de Servicio", "Base Impositiva", "IVA Trasladado" y "Formalizar Propuesta"**.
