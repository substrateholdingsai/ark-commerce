#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  ARK ONBOARDING CLI  ·  Genera tiendas white-label en segundos
  Uso:  python scripts/python/onboard_tenant.py
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import json, re, sys, os, shutil
from pathlib import Path
from datetime import datetime

# ── Colores ANSI para mejor UX ─────────────────────────────
class C:
    G = "\033[92m"   # verde
    Y = "\033[93m"   # amarillo
    R = "\033[91m"   # rojo
    B = "\033[94m"   # azul
    M = "\033[95m"   # magenta
    W = "\033[97m"   # blanco
    D = "\033[90m"   # gris
    E = "\033[0m"    # reset
    BOLD = "\033[1m"

def p(msg, color=C.W): print(f"{color}{msg}{C.E}")
def header(t):
    p(f"\n{'═'*60}", C.B)
    p(f"  {t}", C.BOLD + C.B)
    p(f"{'═'*60}", C.B)


# ── Validadores ────────────────────────────────────────────
def v_slug(s: str) -> str | None:
    s = s.strip().lower()
    if not re.match(r"^[a-z0-9][a-z0-9\-]{1,62}$", s):
        return "Solo minúsculas, números y guiones. Sin espacios ni caracteres raros."
    if s.startswith("-") or s.endswith("-"): return "No puede empezar/terminar con guión."
    return None

def v_whatsapp(s: str) -> str | None:
    s = re.sub(r"\D", "", s)  # quita todo lo que no sea dígito
    if len(s) < 10:           return "Muy corto. Incluye lada (ej: 52 + 10 dígitos)."
    if not s[0].isdigit():    return "Debe empezar con código de país (52 para MX)."
    return None

def v_clabe(s: str) -> str | None:
    s = re.sub(r"\s", "", s)
    if not s.isdigit():       return "Solo números."
    if len(s) != 18:          return f"Debe tener 18 dígitos (tiene {len(s)})."
    return None

def v_email(s: str) -> str | None:
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", s.strip()):
        return "Email inválido."
    return None


# ── Asistente interactivo ──────────────────────────────────
def ask(prompt: str, default: str = "", validator=None, transform=None, required=True) -> str:
    while True:
        hint = f" {C.D}[{default}]{C.E}" if default else ""
        ans = input(f"{C.Y}▸ {C.W}{prompt}{hint}{C.E} ").strip()
        if not ans and default:
            ans = default
        if not ans and required:
            p("  ⚠ Campo requerido", C.R); continue
        if validator:
            err = validator(ans)
            if err:
                p(f"  ✗ {err}", C.R); continue
        if transform:
            ans = transform(ans)
        return ans

def ask_yn(prompt: str, default=True) -> bool:
    hint = "S/n" if default else "s/N"
    while True:
        ans = input(f"{C.Y}▸ {C.W}{prompt} {C.D}[{hint}]{C.E} ").strip().lower()
        if not ans: return default
        if ans in ("s", "si", "sí", "y", "yes"): return True
        if ans in ("n", "no"):                   return False
        p("  Responde s o n", C.R)


# ── Carga de productos ─────────────────────────────────────
PLANTILLA_DEFAULT = [
    {"id": 1, "name": "SERVICIO ESENCIAL",  "weight": "1 unidad",         "price": 380, "desc": "Producto o servicio base. Ideal para entrada y validación.",    "badge": "BASE",    "stock": 24, "accent": "from-[#E8EEFF] to-[#C9D8FF]", "icon": "package"},
    {"id": 2, "name": "PAQUETE PROFESIONAL","weight": "1 set • pro",      "price": 420, "desc": "Set completo profesional. El más elegido por negocios.",            "badge": "POPULAR", "stock": 18, "accent": "from-[#FFF2C6] to-[#FFE48A]", "icon": "layers"},
    {"id": 3, "name": "KIT BÁSICO",         "weight": "1 unidad",         "price": 320, "desc": "Kit de inicio minimal. Listo para entrega inmediata.",               "badge": None,      "stock": 32, "accent": "from-[#E6E6E6] to-[#D1D1D6]", "icon": "box"},
    {"id": 4, "name": "UNIDAD ADICIONAL",   "weight": "1 unidad • extra", "price": 280, "desc": "Unidad extra para completar pedido. Margen optimizado.",             "badge": "EXTRA",   "stock": 48, "accent": "from-[#DDEFE8] to-[#B7D9CB]", "icon": "cuboid"},
    {"id": 5, "name": "PACK COMPLETO",      "weight": "bundle • mixto",   "price": 650, "desc": "Bundle ahorro. Productos combinados. Checkout express.",             "badge": "AHORRO",  "stock": 12, "accent": "from-[#001A4D] to-[#002B7F]", "icon": "gift"},
]

def load_products_from_json(path: Path) -> list:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    # acepta tanto lista directa como {"products": [...]}
    products = data if isinstance(data, list) else data.get("products", [])
    required = {"id", "name", "price"}
    for i, p in enumerate(products):
        missing = required - set(p.keys())
        if missing:
            raise ValueError(f"Producto #{i+1} le faltan campos: {missing}")
        # defaults seguros
        p.setdefault("weight", "1 unidad")
        p.setdefault("desc", "")
        p.setdefault("badge", None)
        p.setdefault("stock", 99)
        p.setdefault("accent", "from-[#E8EEFF] to-[#C9D8FF]")
        p.setdefault("icon", "package")
    return products

def save_sample_json(path: Path):
    path.write_text(json.dumps({"products": PLANTILLA_DEFAULT}, ensure_ascii=False, indent=2), encoding="utf-8")
    p(f"  ✓ Plantilla creada en {path}", C.G)
    p(f"    Edítala y vuelve a correr el script.", C.D)


# ── Import del Forge (ARK UNIVERSAL) ───────────────────────
def load_forge():
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        import ark_universal_forge as forge
        return forge
    except ImportError as e:
        p(f"\n✗ No pude importar ark_universal_forge.py", C.R)
        p(f"  Error: {e}", C.D)
        p(f"  Asegúrate de que ark_universal_forge.py esté en el mismo directorio.", C.Y)
        sys.exit(1)


# ── Paletas predefinidas (para no pedir hex a mano) ────────
THEMES = {
    "navy-gold":  {"primary":"#002B7F","primary_dark":"#001A4D","accent":"#D4AF37","accent_light":"#F5D97A","accent_dark":"#A8883F","cream":"#F5ECD7","lcd":"#9EA792"},
    "lime-dark":  {"primary":"#0B0C0E","primary_dark":"#000000","accent":"#B4FF00","accent_light":"#C6FF33","accent_dark":"#8FCC00","cream":"#F4F5F7","lcd":"#6B9900"},
    "emerald":    {"primary":"#064E3B","primary_dark":"#022C22","accent":"#10B981","accent_light":"#6EE7B7","accent_dark":"#047857","cream":"#ECFDF5","lcd":"#059669"},
    "terracotta": {"primary":"#7A3B12","primary_dark":"#4A2108","accent":"#E0A12B","accent_light":"#F5CE7A","accent_dark":"#A9741A","cream":"#FDF3E7","lcd":"#B45309"},
    "rose":       {"primary":"#881337","primary_dark":"#4C0519","accent":"#FB7185","accent_light":"#FDA4AF","accent_dark":"#BE123C","cream":"#FFF1F2","lcd":"#E11D48"},
    "slate":      {"primary":"#1E293B","primary_dark":"#0F172A","accent":"#38BDF8","accent_light":"#7DD3FC","accent_dark":"#0284C7","cream":"#F1F5F9","lcd":"#0369A1"},
}


# ── Flujo principal ────────────────────────────────────────
def main():
    header("🏪  ARK ONBOARDING · Generador de Tiendas White-Label")
    p("Responde las preguntas. Presiona Enter para usar el valor por defecto.", C.D)

    # 1. Identidad
    p("\n── IDENTIDAD ──", C.M + C.BOLD)
    slug  = ask("Slug de la tienda (URL)", validator=v_slug, transform=lambda s: s.lower().replace(" ", "-"))
    name  = ask("Nombre comercial", default=slug.replace("-", " ").title())
    tag   = ask("Tagline corto (opcional)", default="", required=False)

    # 2. Pagos
    p("\n── PAGOS ──", C.M + C.BOLD)
    wa    = ask("WhatsApp (con lada país)", default="52",
                validator=v_whatsapp,
                transform=lambda s: re.sub(r"\D", "", s))
    wa_display = ask("WhatsApp formateado (para mostrar)",
                     default=f"+{wa[:2]} {wa[2:5]} {wa[5:9]} {wa[9:]}" if len(wa) >= 10 else wa,
                     required=False)
    clabe = ask("CLABE interbancaria (18 dígitos)", validator=v_clabe,
                transform=lambda s: re.sub(r"\s", "", s))
    bank  = ask("Banco", default="BBVA")

    # 3. Cripto (opcional)
    p("\n── CRIPTO / BTCPAY ──", C.M + C.BOLD)
    use_crypto = ask_yn("¿Usarás BTCPay Server / Lightning?", default=False)
    btcpay_url = ask("URL del POS de BTCPay",
                     default="https://btcpay.tusitio.com/pos",
                     required=use_crypto) if use_crypto else ""
    sats_rate  = float(ask("Tasa sats/MXN", default="0.65",
                           transform=lambda s: s.replace(",", "."),
                           required=use_crypto)) if use_crypto else 0.65
    lightning  = ask("Nodo Lightning", default="Blink → USDT",
                     required=use_crypto) if use_crypto else "Blink → USDT"

    # 4. Marca / tema
    p("\n── MARCA ──", C.M + C.BOLD)
    p("Temas disponibles:", C.D)
    for k in THEMES:
        t = THEMES[k]
        p(f"  • {C.BOLD}{k:<12}{C.E}  primary={t['primary']}  accent={t['accent']}")
    theme_name = ask("Tema", default="navy-gold",
                     validator=lambda s: None if s in THEMES else f"Elige entre: {', '.join(THEMES.keys())}")

    creator_url = ask("URL del creador (footer)", default=f"https://{slug}.site", required=False)

    # 5. Productos
    p("\n── PRODUCTOS ──", C.M + C.BOLD)
    mode = ask_yn("¿Cargar productos desde JSON personalizado? (no = plantilla universal)", default=False)

    products = PLANTILLA_DEFAULT
    if mode:
        json_path = ask("Ruta al JSON de productos", default=f"products/{slug}.json")
        jp = Path(json_path)
        if not jp.exists():
            p(f"  ✗ No existe {jp}", C.R)
            if ask_yn(f"¿Crear plantilla de ejemplo en {jp}?", default=True):
                jp.parent.mkdir(parents=True, exist_ok=True)
                save_sample_json(jp)
                p(f"\n  Edita el archivo y vuelve a correr. Salgo.", C.Y)
                sys.exit(0)
            else:
                p("  Usando plantilla universal.", C.Y)
        else:
            try:
                products = load_products_from_json(jp)
                p(f"  ✓ {len(products)} productos cargados de {jp}", C.G)
            except Exception as e:
                p(f"  ✗ Error leyendo JSON: {e}", C.R)
                p("  Usando plantilla universal.", C.Y)
                products = PLANTILLA_DEFAULT

    # ── Resumen ────────────────────────────────────────────
    header("📋  Resumen")
    p(f"  Slug:       {C.BOLD}{slug}{C.E}")
    p(f"  Nombre:     {C.BOLD}{name}{C.E}")
    p(f"  WhatsApp:   {wa}")
    p(f"  CLABE:      {clabe}  ({bank})")
    p(f"  BTCPay:     {btcpay_url or '(no)'}")
    p(f"  Tema:       {theme_name}")
    p(f"  Productos:  {len(products)}")

    if not ask_yn("¿Confirmar y generar tienda?", default=True):
        p("\n  Cancelado.", C.Y); sys.exit(0)

    # ── Generar ────────────────────────────────────────────
    header("⚙️  Generando tienda…")
    forge = load_forge()
    theme_obj = forge.Theme(**THEMES[theme_name])
    cfg = forge.Config(
        store_name       = name,
        whatsapp         = wa,
        whatsapp_display = wa_display or wa,
        clabe            = " ".join([clabe[i:i+4] for i in range(0, 18, 4)]),  # formato legible
        bank             = bank,
        btcpay_pos_url   = btcpay_url,
        sats_rate        = sats_rate,
        lightning        = lightning,
        creator_url      = creator_url,
        theme            = theme_obj,
    )

    # convertir dicts → objetos Product
    product_objs = [forge.Product(**p) for p in products]

    out_dir = Path("deploy") / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "index.html"

    # 1. Generar HTML Standalone
    forge.forge(product_objs, cfg, str(out_file))

    # 2. Generar SQL para Cloudflare D1
    sql_file = out_dir / f"{slug}_d1_seed.sql"
    sql_content = forge.export_d1_sql(product_objs, cfg, slug)
    sql_file.write_text(sql_content, encoding="utf-8")

    # ── Éxito ──────────────────────────────────────────────
    header("🚀  ¡Listo!")
    p(f"  ✓ 1. Tienda HTML standalone generada:", C.G)
    p(f"       {out_file.resolve()}", C.BOLD)
    size_kb = out_file.stat().st_size / 1024
    p(f"       Tamaño: {size_kb:.1f} KB", C.D)

    p(f"\n  ✓ 2. Script SQL para Cloudflare D1 generado:", C.G)
    p(f"       {sql_file.resolve()}", C.BOLD)

    p(f"\n── Opciones de despliegue ──", C.M + C.BOLD)
    p(f"  A) Activar en tu Worker D1 (Recomendado para multi-tenant):", C.W)
    p(f"     {C.BOLD}npx wrangler d1 execute ark-commerce-db --file={sql_file}{C.E}", C.G)
    p(f"     URL activa: {C.BOLD}https://ark-commerce.substrateholdingsai.workers.dev/?tenant={slug}{C.E}", C.G)

    p(f"\n  B) Desplegar HTML estático en Cloudflare Pages / Netlify:", C.W)
    p(f"     {C.BOLD}npx wrangler pages deploy {out_dir}{C.E}", C.D)

    p(f"\n{C.BOLD}¡La tienda {name} está lista para cobrar!{C.E} 🎉\n", C.G)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\n\n  Cancelado por el usuario.", C.Y); sys.exit(1)
