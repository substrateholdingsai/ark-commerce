#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  EXCEL TO D1  ·  Importador Universal de Catálogos a Cloudflare D1
  Lee Excel/CSV de clientes → valida → descarga imágenes → upsert a D1
  
  Uso:
    python scripts/python/excel_to_d1.py --tenant tacos-el-fuego --input catalogo.xlsx
    python scripts/python/excel_to_d1.py --tenant panaderia --input productos.csv --dry-run
    python scripts/python/excel_to_d1.py --tenant tienda --input data.xlsx --skip-images
    python scripts/python/excel_to_d1.py --tenant tienda --input data.xlsx --wrangler-remote

  Modos de subida:
    1. Automático via Wrangler CLI (por defecto, no requiere API token)
    2. Via Cloudflare REST API (si defines CLOUDFLARE_API_TOKEN)
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import argparse, csv, json, os, re, sys, time, subprocess
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import hashlib

# Soporte UTF-8 en consola Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Dependencias opcionales con fallback ────────────────────
try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# ── Colores ANSI ────────────────────────────────────────────
class C:
    G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"; B = "\033[94m"
    M = "\033[95m"; W = "\033[97m"; D = "\033[90m"; E = "\033[0m"; BOLD = "\033[1m"

def p(msg, color=C.W): print(f"{color}{msg}{C.E}")
def header(t):
    p(f"\n{'═'*60}", C.B)
    p(f"  {t}", C.BOLD + C.B)
    p(f"{'═'*60}", C.B)


# ── Configuración desde ENV ─────────────────────────────────
DEFAULT_D1_DATABASE_ID = "874b300a-18f6-4995-a98e-27abd7264662"
DEFAULT_D1_NAME = "ark-commerce-db"

@dataclass
class D1Config:
    api_token: str | None
    account_id: str | None
    database_id: str
    base_url: str = "https://api.cloudflare.com/client/v4"

    @classmethod
    def from_env(cls) -> "D1Config":
        token = os.getenv("CLOUDFLARE_API_TOKEN")
        account = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        db = os.getenv("D1_DATABASE_ID", DEFAULT_D1_DATABASE_ID)
        return cls(token, account, db)


# ── Normalizador de columnas (fuzzy matching) ──────────────
COLUMN_ALIASES = {
    "name":        ["name", "nombre", "producto", "item", "articulo", "artículo", "descripcion_corta", "titulo", "título"],
    "sku":         ["sku", "codigo", "código", "code", "id", "ref", "referencia"],
    "weight":      ["weight", "peso", "tamaño", "tamano", "size", "unidad", "presentacion", "presentación"],
    "price":       ["price", "precio", "pvp", "costo", "valor", "amount", "$"],
    "description": ["description", "descripcion", "descripción", "desc", "detalle", "detalles", "notas"],
    "badge":       ["badge", "etiqueta", "tag", "marca", "highlight"],
    "stock":       ["stock", "inventario", "cantidad", "qty", "quantity", "existencias", "disponible"],
    "image_url":   ["image_url", "imagen", "image", "img", "foto", "url_imagen", "picture"],
}


# ── Modelo de producto para el esquema D1 ───────────────────
@dataclass
class Product:
    id: str
    tenant_id: str
    name: str
    weight: str
    price: float
    desc: str
    image: str
    badge: str | None = None
    stock: int = 99
    active: int = 1
    display_order: int = 1
    image_url_raw: str | None = None


# ── Conversión de URLs de Drive / Dropbox ──────────────────
def normalize_image_url(url: str) -> str:
    """Convierte URLs compartidas de Drive/Dropbox a URLs de descarga directa."""
    if not url or not url.startswith("http"): return url
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()

        # Google Drive: convierte /file/d/ID/view a descarga directa
        if "drive.google.com" in host:
            m = re.search(r"/file/d/([a-zA-Z0-9_-]+)", url)
            if m:
                return f"https://drive.google.com/uc?export=download&id={m.group(1)}"
            q = parse_qs(parsed.query)
            if "id" in q:
                return f"https://drive.google.com/uc?export=download&id={q['id'][0]}"

        # Dropbox: cambia ?dl=0 por ?dl=1
        if "dropbox.com" in host:
            return url.replace("?dl=0", "?dl=1").replace("?dl=0&", "?dl=1&")

        return url
    except Exception:
        return url


# ── Descarga de imágenes ────────────────────────────────────
def download_image(url: str, dest_dir: Path, slug: str) -> str | None:
    """Descarga una imagen y devuelve la ruta relativa para el frontend. Devuelve None si falla."""
    if not HAS_REQUESTS:
        return None
    url = normalize_image_url(url)
    try:
        dest_dir.mkdir(parents=True, exist_ok=True)
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        ext = ".jpg"
        for e in [".png", ".jpg", ".jpeg", ".webp", ".gif"]:
            if e in url.lower(): ext = e; break
        filename = f"{slug}_{url_hash}{ext}"
        dest = dest_dir / filename

        # Skip si ya existe
        if dest.exists() and dest.stat().st_size > 0:
            return f"/images/products/{filename}"

        r = requests.get(url, timeout=20, stream=True,
                         headers={"User-Agent": "ArkForge/1.0 CatalogImporter"})
        if r.status_code != 200:
            p(f"  ⚠ HTTP {r.status_code} al descargar {url}", C.Y)
            return None

        with open(dest, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

        if dest.stat().st_size < 1000:
            dest.unlink(missing_ok=True)
            return None

        return f"/images/products/{filename}"
    except Exception as e:
        p(f"  ⚠ Error descargando {url}: {e}", C.Y)
        return None


# ── Parseo de archivos ──────────────────────────────────────
def parse_file(path: Path) -> list[dict]:
    """Lee Excel o CSV y devuelve lista de filas como dicts."""
    ext = path.suffix.lower()

    if ext == ".csv":
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            return list(reader)

    if ext in (".xlsx", ".xls"):
        if not HAS_PANDAS:
            p("✗ pandas no está instalado.", C.R)
            p("  Instala con:  pip install pandas openpyxl", C.Y)
            sys.exit(1)
        df = pd.read_excel(path)
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")

    p(f"✗ Extensión no soportada: {ext}", C.R)
    p("  Usa .csv, .xlsx o .xls", C.Y)
    sys.exit(1)


# ── Mapeo de columnas ───────────────────────────────────────
def build_column_map(sample_row: dict) -> dict:
    """Devuelve {campo_canonico: columna_original}."""
    original_keys = [str(k).strip().lower() for k in sample_row.keys()]
    key_map = {str(k).strip().lower(): k for k in sample_row.keys()}
    mapping = {}
    for canon, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias.lower() in original_keys:
                mapping[canon] = key_map[alias.lower()]
                break
    return mapping


def map_row(row: dict, column_map: dict) -> dict:
    return {canon: row.get(orig) for canon, orig in column_map.items()}


def parse_price(val) -> float | None:
    if val is None: return None
    s = str(val).strip()
    if not s: return None
    s = s.replace("$", "").replace("€", "").replace("MXN", "").replace("USD", "")
    s = s.replace(",", "").replace(" ", "")
    try:
        return float(s)
    except ValueError:
        return None


def validate_row(raw: dict, row_idx: int, tenant: str, order_idx: int) -> Product | str:
    name = (str(raw.get("name") or "")).strip()
    if not name:
        return f"Fila {row_idx+1}: falta 'name' (nombre del producto)"

    price = parse_price(raw.get("price"))
    if price is None or price <= 0:
        return f"Fila {row_idx+1} ({name}): precio inválido o faltante"

    sku = (str(raw.get("sku") or "")).strip()
    if not sku:
        sku = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:24]

    prod_id = f"{tenant}-{sku}" if not sku.startswith(f"{tenant}-") else sku

    stock = 99
    if raw.get("stock") is not None:
        try: stock = max(0, int(float(raw.get("stock"))))
        except ValueError: pass

    badge = (str(raw.get("badge") or "")).strip() or None
    if badge and badge.upper() in ("", "NA", "N/A", "NONE", "-", "NULL"):
        badge = None

    desc = (str(raw.get("description") or "")).strip() or name
    weight = (str(raw.get("weight") or "")).strip() or "1 unidad"
    raw_img = (str(raw.get("image_url") or "")).strip() or None

    return Product(
        id            = prod_id,
        tenant_id     = tenant,
        name          = name,
        weight        = weight,
        price         = round(price, 2),
        desc          = desc,
        image         = raw_img or "/favicon.svg",
        badge         = badge,
        stock         = stock,
        active        = 1,
        display_order = order_idx,
        image_url_raw = raw_img,
    )


# ── Cliente D1 (API REST Cloudflare) ────────────────────────
class D1Client:
    def __init__(self, cfg: D1Config):
        if not HAS_REQUESTS:
            p("✗ requests no está instalado.", C.R); sys.exit(1)
        self.cfg = cfg
        self.headers = {
            "Authorization": f"Bearer {cfg.api_token}",
            "Content-Type": "application/json",
        }
        self.url = f"{cfg.base_url}/accounts/{cfg.account_id}/d1/database/{cfg.database_id}/query"

    def query(self, sql: str, params: list | None = None) -> list[dict]:
        body = {"sql": sql}
        if params: body["params"] = params
        r = requests.post(self.url, headers=self.headers, json=body, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"D1 API error {r.status_code}: {r.text}")
        data = r.json()
        if not data.get("success"):
            raise RuntimeError(f"D1 query falló: {data.get('errors')}")
        return (data.get("result") or [{}])[0].get("results", [])

    def upsert_product(self, p: Product) -> str:
        sql = """
            INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                weight=excluded.weight,
                price=excluded.price,
                desc=excluded.desc,
                image=excluded.image,
                badge=excluded.badge,
                stock=excluded.stock,
                active=1,
                display_order=excluded.display_order,
                updated_at=CURRENT_TIMESTAMP;
        """
        params = [p.id, p.tenant_id, p.name, p.weight, p.price, p.desc, p.image, p.badge, p.stock, p.active, p.display_order]
        self.query(sql, params)
        return "upserted"


# ── Generador SQL ───────────────────────────────────────────
def generate_sql_dump(tenant: str, products: list[Product]) -> str:
    lines = [
        f"-- Catálogo importado para tenant: {tenant}",
        f"-- Fecha: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"-- Total productos: {len(products)}",
        "",
    ]
    for p in products:
        p_name = p.name.replace("'", "''")
        p_desc = p.desc.replace("'", "''")
        p_weight = p.weight.replace("'", "''")
        p_badge = f"'{p.badge.replace(chr(39), chr(39)+chr(39))}'" if p.badge else "NULL"
        p_image = f"'{p.image}'"

        lines.append(
            f"INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) "
            f"VALUES ('{p.id}', '{p.tenant_id}', '{p_name}', '{p_weight}', {p.price}, '{p_desc}', {p_image}, {p_badge}, {p.stock}, 1, {p.display_order}) "
            f"ON CONFLICT(id) DO UPDATE SET name=excluded.name, weight=excluded.weight, price=excluded.price, "
            f"desc=excluded.desc, image=excluded.image, badge=excluded.badge, stock=excluded.stock, active=1, "
            f"display_order=excluded.display_order, updated_at=CURRENT_TIMESTAMP;"
        )
    return "\n".join(lines)


# ── CLI & Argumentos ────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Importa catálogos Excel/CSV a Cloudflare D1 (ark-commerce-db)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--tenant", "-t", required=True, help="Slug del tenant (ej: tacos-el-fuego)")
    parser.add_argument("--input", "-i", required=True, type=Path, help="Ruta al archivo Excel (.xlsx/.xls) o CSV (.csv)")
    parser.add_argument("--dry-run", action="store_true", help="Muestra qué haría sin tocar la base de datos")
    parser.add_argument("--skip-images", action="store_true", help="No descargar imágenes locales, guardar URLs directas")
    parser.add_argument("--output-sql", type=Path, help="Ruta para volcar el archivo .sql resultante")
    parser.add_argument("--wrangler-remote", action="store_true", help="Ejecutar automáticamente con 'npx wrangler d1 execute --remote'")
    parser.add_argument("--assets-dir", type=Path, default=Path("public") / "images" / "products", help="Directorio de imágenes")

    args = parser.parse_args()

    header(f"📊  EXCEL → D1  ·  Tenant: {args.tenant}")

    if not args.input.exists():
        p(f"✗ Archivo no encontrado: {args.input}", C.R); sys.exit(1)

    p(f"  Archivo:    {args.input}", C.D)
    p(f"  Tamaño:     {args.input.stat().st_size/1024:.1f} KB", C.D)

    # 1. Parsear
    p(f"\n── FASE 1: Leyendo filas ──", C.M + C.BOLD)
    rows = parse_file(args.input)
    if not rows:
        p("✗ El archivo está vacío", C.R); sys.exit(1)
    p(f"  ✓ {len(rows)} filas leídas", C.G)

    # 2. Detectar mapeo
    col_map = build_column_map(rows[0])
    p(f"\n── FASE 2: Mapeo de columnas detectado ──", C.M + C.BOLD)
    for canon, orig in sorted(col_map.items()):
        p(f"  {canon:<12} ←  {orig}", C.G)
    if "name" not in col_map or "price" not in col_map:
        p("✗ Faltan columnas obligatorias: 'name' y 'price'", C.R); sys.exit(1)

    # 3. Validar
    p(f"\n── FASE 3: Validando productos ──", C.M + C.BOLD)
    valid_products: list[Product] = []
    errors = []
    for i, row in enumerate(rows):
        mapped = map_row(row, col_map)
        res = validate_row(mapped, i, args.tenant, len(valid_products) + 1)
        if isinstance(res, str):
            errors.append(res)
        else:
            valid_products.append(res)

    p(f"  ✓ Válidas:    {len(valid_products)}", C.G)
    if errors:
        p(f"  ✗ Errores:    {len(errors)}", C.Y)
        for err in errors[:5]: p(f"    • {err}", C.D)

    if not valid_products:
        p("✗ No hay productos válidos para importar.", C.R); sys.exit(1)

    # 4. Descargar imágenes si aplica
    if not args.skip_images and any(p_prod.image_url_raw for p_prod in valid_products):
        p(f"\n── FASE 4: Descargando imágenes ──", C.M + C.BOLD)
        downloaded = 0
        for p_prod in valid_products:
            if not p_prod.image_url_raw or not p_prod.image_url_raw.startswith("http"):
                continue
            local_path = download_image(p_prod.image_url_raw, args.assets_dir, args.tenant)
            if local_path:
                p_prod.image = local_path
                downloaded += 1
        p(f"  ✓ {downloaded} imágenes descargadas a {args.assets_dir}", C.G)

    # 5. Generar SQL
    sql_content = generate_sql_dump(args.tenant, valid_products)
    out_sql = args.output_sql or (Path("deploy") / args.tenant / f"{args.tenant}_catalog.sql")
    out_sql.parent.mkdir(parents=True, exist_ok=True)
    out_sql.write_text(sql_content, encoding="utf-8")
    p(f"\n  ✓ Archivo SQL generado en: {out_sql}", C.G)

    # Preview
    p(f"\n── Preview (primeros 5 productos) ──", C.M + C.BOLD)
    for p_prod in valid_products[:5]:
        p(f"  • {p_prod.name:<30} ${p_prod.price:>7.2f} MXN  [{p_prod.weight}]", C.W)
    if len(valid_products) > 5:
        p(f"  … y {len(valid_products)-5} productos más.", C.D)

    if args.dry_run:
        p(f"\n⚠ Modo DRY-RUN activado. No se escribieron datos en Cloudflare D1.", C.Y)
        sys.exit(0)

    # 6. Ejecutar en D1
    p(f"\n── FASE 5: Subida a Cloudflare D1 ──", C.M + C.BOLD)
    cfg = D1Config.from_env()

    if cfg.api_token and cfg.account_id:
        p(f"  Usando Cloudflare REST API directa…", C.B)
        try:
            d1 = D1Client(cfg)
            for i, p_prod in enumerate(valid_products, 1):
                d1.upsert_product(p_prod)
                print(f"\r  Subiendo productos: {i}/{len(valid_products)}", end="", flush=True)
            print()
            p(f"  ✓ {len(valid_products)} productos sincronizados con éxito vía API.", C.G)
        except Exception as e:
            p(f"  ✗ Error vía API: {e}", C.R)
            p(f"  Alternativa: usa npx wrangler d1 execute", C.Y)
    else:
        p(f"  Ejecutando via Wrangler CLI oficial…", C.B)
        remote_flag = ["--remote"] if args.wrangler_remote else ["--local"]
        cmd = ["npx", "wrangler", "d1", "execute", DEFAULT_D1_NAME, f"--file={out_sql}"] + remote_flag
        p(f"  Comando: {' '.join(cmd)}", C.D)
        res = subprocess.run(" ".join(cmd), shell=True)
        if res.returncode == 0:
            p(f"\n  ✓ Catálogo importado exitosamente a D1 ({'REMOTO' if args.wrangler_remote else 'LOCAL'}).", C.G)
        else:
            p(f"\n  ✗ Error ejecutando wrangler. Puedes correr manualmente:", C.R)
            p(f"    npx wrangler d1 execute {DEFAULT_D1_NAME} --file={out_sql} --remote", C.Y)

    header("🚀  ¡Proceso Concluido!")
    p(f"  Tenant: {args.tenant}", C.BOLD)
    p(f"  Tienda lista en: https://ark-commerce.substrateholdingsai.workers.dev/?tenant={args.tenant}\n", C.G)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\n\n  Cancelado.", C.Y); sys.exit(1)
