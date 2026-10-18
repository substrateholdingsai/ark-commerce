#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  SEED TENANTS  ·  Inicializador de base D1 con tenants oficiales
  Puebla D1 con Ark Systems + Temozonia Carnes Ahumadas
  
  Uso:
    python scripts/python/seed_tenants.py
    python scripts/python/seed_tenants.py --dry-run
    python scripts/python/seed_tenants.py --local  # Usa D1 local de Wrangler
    python scripts/python/seed_tenants.py --reset  # ⚠️ limpia y re-siembra datos base

  Autenticación:
    Opción A (Automática): Usa Wrangler CLI si está instalado (sin necesidad de tokens)
    Opción B (Variables de entorno):
      CLOUDFLARE_API_TOKEN     → Token API con permisos D1
      CLOUDFLARE_ACCOUNT_ID    → ID de tu cuenta Cloudflare
      D1_DATABASE_ID           → ID de la base D1 destino (ark-commerce-db)
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import argparse, hashlib, json, os, re, shutil, subprocess, sys, time
from dataclasses import dataclass
from pathlib import Path

# Soporte UTF-8 en consola Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

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


# ── Configuración D1 ─────────────────────────────────────────
DEFAULT_DB_NAME = "ark-commerce-db"
DEFAULT_DB_ID = "874b300a-18f6-4995-a98e-27abd7264662"

@dataclass
class D1Config:
    api_token: str | None
    account_id: str | None
    database_id: str
    base_url: str = "https://api.cloudflare.com/client/v4"
    use_wrangler: bool = True
    is_local: bool = False

    @classmethod
    def resolve(cls, is_local: bool = False) -> "D1Config":
        token = os.getenv("CLOUDFLARE_API_TOKEN")
        account = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        db = os.getenv("D1_DATABASE_ID") or DEFAULT_DB_ID

        has_wrangler = shutil.which("wrangler") is not None or shutil.which("npx") is not None
        use_wrangler = has_wrangler and not (token and account)

        return cls(
            api_token=token,
            account_id=account,
            database_id=db,
            use_wrangler=use_wrangler,
            is_local=is_local
        )


# ── Schema D1 Oficial (Alineado con scripts/sql/schema.sql) ─
D1_SCHEMA = """
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  whatsapp TEXT,
  clabe TEXT,
  bank TEXT,
  clabe_holder TEXT,
  btcpay_pos_url TEXT,
  sats_rate REAL DEFAULT 2.5,
  logo_url TEXT,
  theme_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  default_address_id TEXT,
  email_verified_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'MX',
  is_default INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  items TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS store_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  cart_id TEXT REFERENCES carts(id) ON DELETE SET NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS action_tokens (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight TEXT NOT NULL,
  price REAL NOT NULL,
  "desc" TEXT NOT NULL,
  image TEXT NOT NULL,
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT REFERENCES customers(id),
  customer_email TEXT,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_notes TEXT,
  payment_method TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_carrier TEXT,
  shipping_tracking_number TEXT,
  shipping_label_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_tenant_email ON customers (tenant_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id, active);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
"""


# ── Datos de Seed Oficiales ──────────────────────────────────
SEED_TENANTS = [
    {
        "id": "ark",
        "slug": "ark",
        "name": "Ark Systems",
        "domain": None,
        "whatsapp": "529994918221",
        "clabe": "012180012345678901",
        "bank": "BBVA",
        "clabe_holder": "Ark Systems",
        "btcpay_pos_url": "https://btcpay.arksystems.ai",
        "sats_rate": 2.5,
        "logo_url": "/favicon.svg",
        "theme_color": "#B4FF00",
        "admin_email": "admin@arksystems.ai",
        "admin_password": "admin123",
    },
    {
        "id": "temozonia",
        "slug": "temozonia",
        "name": "Temozonia Carnes Ahumadas",
        "domain": None,
        "whatsapp": "529994918221",
        "clabe": "012180098765432109",
        "bank": "Banamex",
        "clabe_holder": "Temozonia Carnes Ahumadas",
        "btcpay_pos_url": "https://btcpay.arksystems.ai/pos/temozonia",
        "sats_rate": 2.5,
        "logo_url": "/favicon.svg",
        "theme_color": "#7A3B12",
        "admin_email": "admin@temozonia.com",
        "admin_password": "admin123",
    },
]

SEED_PRODUCTS = {
    "ark": [
        {
            "id": "kit-landing-express",
            "name": "Landing Express Kit",
            "weight": "Digital",
            "price": 299.0,
            "desc": "Kit completo para vender y cobrar por WhatsApp + SPEI directo. Sin comisiones.",
            "badge": "BEST SELLER",
            "stock": 999,
            "image": "/favicon.svg",
        },
        {
            "id": "hosting-worker",
            "name": "Hosting Cloudflare Worker",
            "weight": "1 mes · saas",
            "price": 299.0,
            "desc": "Infraestructura Cloudflare Workers + D1 + R2 dedicada para tu tienda.",
            "badge": "RECOMENDADO",
            "stock": 100,
            "image": "/favicon.svg",
        },
        {
            "id": "custom-design-system",
            "name": "Custom Design System",
            "weight": "1 marca",
            "price": 1490.0,
            "desc": "Tokens de marca, paleta de colores y componentes a la medida.",
            "badge": "PRO",
            "stock": 20,
            "image": "/favicon.svg",
        },
    ],
    "temozonia": [
        {
            "id": "carne-ahumada-1kg",
            "name": "Carne Ahumada 1kg",
            "weight": "1 kg",
            "price": 380.0,
            "desc": "Corte premium ahumado 12 horas con leña de encino. Textura suave y sabor artesanal.",
            "badge": "MÁS VENDIDO",
            "stock": 24,
            "image": "/favicon.svg",
        },
        {
            "id": "costillas-bbq-1kg",
            "name": "Costillas BBQ 1kg",
            "weight": "1 kg",
            "price": 420.0,
            "desc": "Costillas de cerdo ahumadas con leña y glaseadas con BBQ tradicional de la casa.",
            "badge": "POPULAR",
            "stock": 18,
            "image": "/favicon.svg",
        },
        {
            "id": "chorizo-artesanal-500g",
            "name": "Chorizo Artesanal 500g",
            "weight": "500 g",
            "price": 180.0,
            "desc": "Chorizo rojo tradicional con especias yucatecas, curado con sal de grano.",
            "badge": "TRADICIÓN",
            "stock": 32,
            "image": "/favicon.svg",
        },
        {
            "id": "salchichon-ahumado-300g",
            "name": "Salchichón Ahumado 300g",
            "weight": "300 g",
            "price": 140.0,
            "desc": "Salchichón curado y ahumado lento. Perfecto para botanas y tablas de quesos.",
            "badge": None,
            "stock": 48,
            "image": "/favicon.svg",
        },
        {
            "id": "pack-degustacion",
            "name": "Pack Degustación 2.3kg",
            "weight": "2.3 kg mixto",
            "price": 890.0,
            "desc": "Incluye: 500g carne ahumada, 500g costillas, 300g chorizo, 300g salchichón y guarniciones.",
            "badge": "AHORRO",
            "stock": 12,
            "image": "/favicon.svg",
        },
    ],
}


def hash_password(password: str) -> str:
    """Hash SHA-256 para administradores de panel."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# ── Ejecutor de SQL (Dual: Wrangler CLI o API REST) ──────────
class D1Executor:
    def __init__(self, cfg: D1Config):
        self.cfg = cfg

    def execute_sql(self, sql: str) -> bool:
        if self.cfg.use_wrangler:
            return self._execute_wrangler(sql)
        else:
            return self._execute_rest_api(sql)

    def _execute_wrangler(self, sql: str) -> bool:
        tmp_sql = Path(".tmp_seed.sql")
        try:
            tmp_sql.write_text(sql, encoding="utf-8")
            cmd = ["npx", "wrangler", "d1", "execute", DEFAULT_DB_NAME, "--file", str(tmp_sql)]
            if not self.cfg.is_local:
                cmd.append("--remote")
            
            p(f"  ⚡ Ejecutando vía Wrangler ({'--local' if self.cfg.is_local else '--remote'})...", C.D)
            res = subprocess.run(cmd, capture_output=True, text=True, check=False)
            if res.returncode != 0:
                p(f"  ✗ Error Wrangler:\n{res.stderr or res.stdout}", C.R)
                return False
            return True
        finally:
            if tmp_sql.exists():
                tmp_sql.unlink()

    def _execute_rest_api(self, sql: str) -> bool:
        if not HAS_REQUESTS:
            p("  ✗ Falta requests: pip install requests", C.R)
            return False
        
        headers = {
            "Authorization": f"Bearer {self.cfg.api_token}",
            "Content-Type": "application/json",
        }
        url = f"{self.cfg.base_url}/accounts/{self.cfg.account_id}/d1/database/{self.cfg.database_id}/query"
        body = {"sql": sql}
        
        r = requests.post(url, headers=headers, json=body, timeout=45)
        if r.status_code != 200:
            p(f"  ✗ Error API HTTP {r.status_code}: {r.text}", C.R)
            return False
        data = r.json()
        if not data.get("success"):
            p(f"  ✗ Fallo en consulta D1: {data.get('errors')}", C.R)
            return False
        return True


def build_seed_sql(reset: bool = False) -> str:
    lines = []
    
    if reset:
        lines.append("-- ⚠️ RESET DE TABLAS --")
        tables = [
            "order_items", "orders", "action_tokens", "store_sessions",
            "carts", "customer_addresses", "customers", "products",
            "tenant_users", "tenants"
        ]
        for tbl in tables:
            lines.append(f"DROP TABLE IF EXISTS {tbl};")
        lines.append("")

    # Schema completo
    lines.append(D1_SCHEMA.strip())
    lines.append("")

    # Tenants
    lines.append("-- SEED TENANTS --")
    for t in SEED_TENANTS:
        t_id = t["id"]
        t_name = t["name"].replace("'", "''")
        t_slug = t["slug"]
        t_domain = f"'{t['domain']}'" if t["domain"] else "NULL"
        t_holder = t["clabe_holder"].replace("'", "''")
        
        lines.append(
            f"INSERT INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color) "
            f"VALUES ('{t_id}', '{t_name}', '{t_slug}', {t_domain}, '{t['whatsapp']}', '{t['clabe']}', '{t['bank']}', '{t_holder}', '{t['btcpay_pos_url']}', {t['sats_rate']}, '{t['logo_url']}', '{t['theme_color']}') "
            f"ON CONFLICT(id) DO UPDATE SET "
            f"name=excluded.name, whatsapp=excluded.whatsapp, clabe=excluded.clabe, bank=excluded.bank, "
            f"clabe_holder=excluded.clabe_holder, btcpay_pos_url=excluded.btcpay_pos_url, sats_rate=excluded.sats_rate, theme_color=excluded.theme_color, updated_at=datetime('now');"
        )
        
        # Admin user
        pwd_hash = hash_password(t["admin_password"])
        lines.append(
            f"INSERT INTO tenant_users (id, tenant_id, email, password_hash, role) "
            f"VALUES ('user-{t_id}', '{t_id}', '{t['admin_email']}', '{pwd_hash}', 'owner') "
            f"ON CONFLICT(id) DO UPDATE SET email=excluded.email, password_hash=excluded.password_hash;"
        )

    lines.append("")
    lines.append("-- SEED PRODUCTS --")
    for tenant_id, prods in SEED_PRODUCTS.items():
        for order_idx, p in enumerate(prods, start=1):
            p_id = p["id"]
            p_name = p["name"].replace("'", "''")
            p_weight = p["weight"].replace("'", "''")
            p_price = p["price"]
            p_desc = p["desc"].replace("'", "''")
            p_badge = f"'{p['badge']}'" if p.get("badge") else "NULL"
            p_stock = p.get("stock", 0)
            p_img = p.get("image", "/favicon.svg")

            lines.append(
                f"INSERT INTO products (id, tenant_id, name, weight, price, \"desc\", image, badge, stock, active, display_order) "
                f"VALUES ('{p_id}', '{tenant_id}', '{p_name}', '{p_weight}', {p_price}, '{p_desc}', '{p_img}', {p_badge}, {p_stock}, 1, {order_idx}) "
                f"ON CONFLICT(id) DO UPDATE SET "
                f"name=excluded.name, weight=excluded.weight, price=excluded.price, \"desc\"=excluded.\"desc\", "
                f"badge=excluded.badge, stock=excluded.stock, active=1, display_order=excluded.display_order, updated_at=datetime('now');"
            )

    return "\n".join(lines)


# ── Flujo principal ─────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Inicializador D1 con tenants oficiales (Ark Systems + Temozonia)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--dry-run", action="store_true", help="Vista previa del SQL sin ejecutar")
    parser.add_argument("--reset", action="store_true", help="Borra tablas y re-crea schema + seed inicial")
    parser.add_argument("--local", action="store_true", help="Aplica en D1 local de Wrangler en lugar de remoto")
    parser.add_argument("--out-sql", type=str, default=None, help="Guarda el SQL generado en un archivo local")
    args = parser.parse_args()

    header("🌱  SEED TENANTS · Inicializador Oficial D1 (Ark + Temozonia)")

    if args.reset:
        p("\n⚠️  ADVERTENCIA: --reset borrará y recreará las tablas de la base de datos.", C.R + C.BOLD)
        confirm = input(f"{C.Y}¿Estás seguro de continuar? Escribe 'RESET' para confirmar: {C.E}").strip()
        if confirm != "RESET":
            p("  Operación cancelada por el usuario.", C.Y)
            sys.exit(0)

    cfg = D1Config.resolve(is_local=args.local)
    mode_desc = "Local (Wrangler)" if cfg.is_local else "Remoto (Cloudflare)"
    method_desc = "Wrangler CLI" if cfg.use_wrangler else "REST API Cloudflare"
    
    p(f"\nModo destino: {C.BOLD}{mode_desc}{C.E} vía {C.BOLD}{method_desc}{C.E}")
    p(f"Base de datos: {C.D}{DEFAULT_DB_NAME} ({cfg.database_id}){C.E}")

    sql_content = build_seed_sql(reset=args.reset)

    if args.out_sql:
        out_path = Path(args.out_sql)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(sql_content, encoding="utf-8")
        p(f"\n✓ Archivo SQL guardado en: {out_path.resolve()}", C.G)

    if args.dry_run:
        p("\n── DRY RUN (Vista previa) ──", C.Y + C.BOLD)
        p(f"Total líneas SQL: {len(sql_content.splitlines())}", C.D)
        for t in SEED_TENANTS:
            prods = SEED_PRODUCTS.get(t["id"], [])
            p(f"\n  Tenant: {t['name']} (ID: {t['id']})", C.BOLD)
            p(f"    Admin: {t['admin_email']} (SHA-256 hash guardado)", C.D)
            p(f"    Productos configurados: {len(prods)}", C.D)
            for item in prods:
                p(f"      • {item['name']} - ${item['price']} MXN ({item['weight']})", C.D)
        p("\n⚠️ Modo --dry-run activo: no se ejecutó ningún cambio en D1.", C.Y)
        sys.exit(0)

    executor = D1Executor(cfg)
    p("\n── Ejecutando Seed en D1 ──", C.M + C.BOLD)
    success = executor.execute_sql(sql_content)
    
    if success:
        header("🚀  ¡Seed completado exitosamente!")
        p("La base de datos D1 quedó aprovisionada con el esquema oficial y:", C.G)
        p("  • 2 Tenants: Ark Systems ('ark') y Temozonia ('temozonia')", C.W)
        p("  • 2 Usuarios Admin (pass: admin123)", C.W)
        p("  • 8 Productos activos con soporte multi-tenant", C.W)
        p("  • Tablas de clientes, sesiones y autenticación listas", C.W)
    else:
        p("\n✗ Hubo un error al ejecutar el seed en D1.", C.R)
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\nCancelado por el usuario.", C.Y)
        sys.exit(1)
