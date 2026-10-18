#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  VALIDATE TENANT  ·  Health Check Multi-Tenant para Ark Commerce
  Verifica integridad de tenants: config, admin, productos, theme, API
  
  Uso:
    python scripts/python/validate_tenant.py --tenant temozonia
    python scripts/python/validate_tenant.py --all
    python scripts/python/validate_tenant.py --tenant ark --api --strict
    python scripts/python/validate_tenant.py --all --json > report.json

  Autenticación:
    Opción A: Usa Wrangler CLI automáticamente (sin variables de entorno)
    Opción B: Variables de entorno para Cloudflare REST API:
      CLOUDFLARE_API_TOKEN     → Token API con permisos D1
      CLOUDFLARE_ACCOUNT_ID    → ID de cuenta Cloudflare
      D1_DATABASE_ID           → ID de la base D1 (ark-commerce-db)

  Variables opcionales:
    API_BASE_URL             → URL del worker (default: https://ark-commerce.substrateholdingsai.workers.dev)
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import argparse, json, os, re, shutil, subprocess, sys, time
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlparse

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

def c_ok():   return f"{C.G}✓{C.E}"
def c_warn(): return f"{C.Y}⚠{C.E}"
def c_fail(): return f"{C.R}✗{C.E}"


DEFAULT_DB_NAME = "ark-commerce-db"
DEFAULT_DB_ID = "874b300a-18f6-4995-a98e-27abd7264662"
DEFAULT_API_URL = "https://ark-commerce.substrateholdingsai.workers.dev"


# ── Configuración D1 ─────────────────────────────────────────
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


class D1Client:
    """Cliente universal para D1 (Wrangler CLI o REST API)."""
    def __init__(self, cfg: D1Config):
        self.cfg = cfg
        if not self.cfg.use_wrangler and not HAS_REQUESTS:
            p("✗ requests no instalado. pip install requests", C.R)
            sys.exit(1)
        if not self.cfg.use_wrangler:
            self.headers = {
                "Authorization": f"Bearer {cfg.api_token}",
                "Content-Type": "application/json",
            }
            self.url = f"{cfg.base_url}/accounts/{cfg.account_id}/d1/database/{cfg.database_id}/query"

    def query(self, sql: str, params: list | None = None) -> list[dict]:
        # Formatear parámetros en SQL si se usa wrangler
        if self.cfg.use_wrangler:
            return self._query_wrangler(sql, params)
        else:
            return self._query_rest_api(sql, params)

    def _query_wrangler(self, sql: str, params: list | None = None) -> list[dict]:
        # Si hay params, sustituir con cuidado para la query CLI
        formatted_sql = sql
        if params:
            for val in params:
                if val is None:
                    rep = "NULL"
                elif isinstance(val, (int, float)):
                    rep = str(val)
                else:
                    esc = str(val).replace("'", "''")
                    rep = f"'{esc}'"
                formatted_sql = formatted_sql.replace("?", rep, 1)

        cmd = ["npx", "wrangler", "d1", "execute", DEFAULT_DB_NAME, "--command", formatted_sql, "--json"]
        if not self.cfg.is_local:
            cmd.append("--remote")

        try:
            res = subprocess.run(
                cmd,
                shell=(sys.platform == "win32"),
                capture_output=True,
                encoding="utf-8",
                errors="replace",
                check=False
            )
            if res.returncode != 0:
                raise RuntimeError(f"Wrangler error:\n{res.stderr or res.stdout}")
            
            # Wrangler output puede tener logs antes del JSON
            stdout = (res.stdout or "").strip()
            # Buscar el bloque JSON [...]
            m = re.search(r"(\[\s*\{.*\}\s*\])", stdout, re.DOTALL)
            if m:
                data = json.loads(m.group(1))
            else:
                data = json.loads(stdout)
            
            if isinstance(data, list) and len(data) > 0:
                return data[0].get("results", [])
            return []
        except Exception as e:
            raise RuntimeError(f"Error consultando D1 vía Wrangler: {e}")

    def _query_rest_api(self, sql: str, params: list | None = None) -> list[dict]:
        body = {"sql": sql}
        if params:
            body["params"] = params
        r = requests.post(self.url, headers=self.headers, json=body, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"D1 API error {r.status_code}: {r.text}")
        data = r.json()
        if not data.get("success"):
            errs = data.get("errors", [])
            raise RuntimeError(f"D1 query falló: {errs}")
        return (data.get("result") or [{}])[0].get("results", [])


# ── Modelo de resultado de check ────────────────────────────
@dataclass
class CheckResult:
    name: str
    status: str            # "ok" | "warn" | "fail"
    message: str
    critical: bool = False

    def icon(self) -> str:
        return {"ok": c_ok(), "warn": c_warn(), "fail": c_fail()}[self.status]

    def to_dict(self) -> dict:
        return {"name": self.name, "status": self.status, "message": self.message}


@dataclass
class TenantReport:
    slug: str
    tenant_id: str | None = None
    name: str | None = None
    checks: list[CheckResult] = field(default_factory=list)
    elapsed_ms: float = 0.0

    @property
    def ok(self) -> int:   return sum(1 for c in self.checks if c.status == "ok")
    @property
    def warn(self) -> int: return sum(1 for c in self.checks if c.status == "warn")
    @property
    def fail(self) -> int: return sum(1 for c in self.checks if c.status == "fail")
    @property
    def critical_failures(self) -> int:
        return sum(1 for c in self.checks if c.status == "fail" and c.critical)

    def verdict(self) -> tuple[str, str]:
        if self.critical_failures > 0:
            return ("CRITICAL", C.R)
        if self.fail > 0:
            return ("UNHEALTHY", C.R)
        if self.warn > 0:
            return ("DEGRADED", C.Y)
        return ("HEALTHY", C.G)

    def score(self) -> float:
        total = len(self.checks)
        if total == 0: return 0.0
        return round((self.ok + self.warn * 0.5) / total * 100, 1)

    def print_report(self):
        header(f"🔍  TENANT: {self.slug}" + (f"  ({self.name})" if self.name else ""))
        current_category = None
        for check in self.checks:
            if ":" in check.name:
                cat, sub = check.name.split(":", 1)
                if cat != current_category:
                    p(f"\n  ▸ {cat}", C.M + C.BOLD)
                    current_category = cat
                p(f"    {check.icon()} {sub.strip()} — {check.message}", C.W)
            else:
                p(f"    {check.icon()} {check.name} — {check.message}", C.W)

        p(f"\n── RESULTADO ──", C.BOLD)
        verdict, color = self.verdict()
        p(f"  Checks:  {self.ok} OK · {self.warn} warnings · {self.fail} fallos", C.W)
        p(f"  Score:   {self.score()}%", C.W)
        p(f"  Estado:  {color}{C.BOLD}{verdict}{C.E}")
        p(f"  Tiempo:  {self.elapsed_ms:.0f} ms", C.D)

    def to_dict(self) -> dict:
        verdict, _ = self.verdict()
        return {
            "slug": self.slug,
            "tenant_id": self.tenant_id,
            "name": self.name,
            "verdict": verdict,
            "score": self.score(),
            "checks_total": len(self.checks),
            "checks_ok": self.ok,
            "checks_warn": self.warn,
            "checks_fail": self.fail,
            "elapsed_ms": round(self.elapsed_ms, 1),
            "checks": [c.to_dict() for c in self.checks],
        }


# ── Validadores reutilizables ──────────────────────────────
def v_slug(s: str) -> bool:
    return bool(re.match(r"^[a-z0-9][a-z0-9\-]{1,62}$", s))

def v_whatsapp(s: str) -> bool:
    clean = re.sub(r"\D", "", s or "")
    return clean.isdigit() and 10 <= len(clean) <= 15

def v_clabe(s: str) -> bool:
    clean = re.sub(r"\s", "", s or "")
    return clean.isdigit() and len(clean) == 18

def v_email(s: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", s or ""))

def v_url(s: str) -> bool:
    try:
        parsed = urlparse(s)
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False

def v_hex_color(s: str) -> bool:
    return bool(re.match(r"^#[0-9a-fA-F]{6}$", s or ""))


# ── CHECKS por categoría (Alineados a schema D1) ───────────
def check_existence(d1: D1Client, slug: str, report: TenantReport):
    """Categoría 1: ¿El tenant existe y tiene datos básicos?"""
    cat = "EXISTENCIA"

    rows = d1.query("SELECT * FROM tenants WHERE slug=? OR id=?", [slug, slug])
    if not rows:
        report.checks.append(CheckResult(f"{cat}: Tenant en D1", "fail",
                                         f"No existe tenant con slug/id '{slug}'", critical=True))
        return None
    tenant = rows[0]
    report.tenant_id = str(tenant.get("id"))
    report.name = tenant.get("name")
    report.checks.append(CheckResult(f"{cat}: Tenant en D1", "ok",
                                     f"Encontrado con ID '{report.tenant_id}'"))

    if v_slug(slug):
        report.checks.append(CheckResult(f"{cat}: Slug DNS-safe", "ok", f"'{slug}' es válido"))
    else:
        report.checks.append(CheckResult(f"{cat}: Slug DNS-safe", "fail",
                                         f"'{slug}' tiene caracteres inválidos", critical=True))

    name = (tenant.get("name") or "").strip()
    if name:
        report.checks.append(CheckResult(f"{cat}: Nombre", "ok", f"'{name}'"))
    else:
        report.checks.append(CheckResult(f"{cat}: Nombre", "fail", "Nombre vacío", critical=True))

    return tenant


def check_payments(d1: D1Client, tenant: dict, report: TenantReport):
    """Categoría 2: Configuración de pagos y datos bancarios."""
    cat = "PAGOS"

    wa = tenant.get("whatsapp") or ""
    if v_whatsapp(wa):
        report.checks.append(CheckResult(f"{cat}: WhatsApp", "ok", f"{wa}"))
    else:
        report.checks.append(CheckResult(f"{cat}: WhatsApp", "fail",
                                         f"Inválido: '{wa}' (deben ser 10-15 dígitos)", critical=True))

    clabe = tenant.get("clabe") or ""
    if v_clabe(clabe):
        report.checks.append(CheckResult(f"{cat}: CLABE SPEI", "ok", "18 dígitos válidos"))
    else:
        report.checks.append(CheckResult(f"{cat}: CLABE SPEI", "fail",
                                         f"Inválida: '{clabe}' (deben ser 18 dígitos)", critical=True))

    bank = (tenant.get("bank") or "").strip()
    if bank:
        report.checks.append(CheckResult(f"{cat}: Banco", "ok", f"'{bank}'"))
    else:
        report.checks.append(CheckResult(f"{cat}: Banco", "fail", "Banco vacío", critical=True))

    btcpay = (tenant.get("btcpay_pos_url") or "").strip()
    if btcpay:
        if v_url(btcpay):
            report.checks.append(CheckResult(f"{cat}: BTCPay / Pos URL", "ok", btcpay))
        else:
            report.checks.append(CheckResult(f"{cat}: BTCPay / Pos URL", "fail", f"URL malformada: '{btcpay}'"))
    else:
        report.checks.append(CheckResult(f"{cat}: BTCPay / Pos URL", "warn", "Sin URL BTCPay (opcional)"))

    try:
        rate = float(tenant.get("sats_rate") or 0)
        if rate > 0:
            report.checks.append(CheckResult(f"{cat}: sats_rate", "ok", f"{rate} sats/MXN"))
        else:
            report.checks.append(CheckResult(f"{cat}: sats_rate", "warn", f"Valor {rate} (usualmente > 0)"))
    except (ValueError, TypeError):
        report.checks.append(CheckResult(f"{cat}: sats_rate", "fail",
                                         f"No numérico: '{tenant.get('sats_rate')}'"))


def check_admin(d1: D1Client, tenant_id: str, report: TenantReport):
    """Categoría 3: Usuarios admin."""
    cat = "ADMIN"

    users = d1.query("SELECT email, password_hash, role FROM tenant_users WHERE tenant_id=?", [tenant_id])
    if not users:
        report.checks.append(CheckResult(f"{cat}: Admin users", "fail",
                                         "Sin usuarios admin (no podrás entrar al panel)", critical=True))
        return

    report.checks.append(CheckResult(f"{cat}: Admin users", "ok", f"{len(users)} usuario(s)"))

    for user in users:
        email = user.get("email") or ""
        ph = user.get("password_hash") or ""
        role = user.get("role") or "?"

        if not v_email(email):
            report.checks.append(CheckResult(f"{cat}: Email formato", "fail", f"Email inválido: '{email}'"))
        if not ph or len(ph) < 20:
            report.checks.append(CheckResult(f"{cat}: Password hash", "fail",
                                             f"Hash vacío o muy corto para {email}"))
        if role not in ("admin", "owner", "superadmin"):
            report.checks.append(CheckResult(f"{cat}: Rol", "warn", f"Rol '{role}' para {email}"))

    first = users[0]
    if v_email(first.get("email") or "") and len(first.get("password_hash") or "") >= 20:
        report.checks.append(CheckResult(f"{cat}: Admin operativo", "ok",
                                         f"{first.get('email')} configurado correctamente"))


def check_products(d1: D1Client, tenant_id: str, report: TenantReport):
    """Categoría 4: Catálogo de productos (usa columnas reales: active, desc, price, stock)."""
    cat = "PRODUCTOS"

    # En D1 production schema: active (1/0), price, stock, name, badge
    products = d1.query(
        'SELECT name, price, stock, badge, active FROM products WHERE tenant_id=?',
        [tenant_id]
    )
    if not products:
        report.checks.append(CheckResult(f"{cat}: Productos", "fail",
                                         "Sin productos (la tienda está vacía)", critical=True))
        return

    active = [pr for pr in products if pr.get("active") in (1, True, "1")]
    inactive = len(products) - len(active)

    report.checks.append(CheckResult(
        f"{cat}: Catálogo D1", "ok" if active else "fail",
        f"{len(active)} activos, {inactive} inactivos",
        critical=not active
    ))

    bad_prices = [pr for pr in products if (pr.get("price") or 0) <= 0]
    if bad_prices:
        names = ", ".join(p.get("name", "?") for p in bad_prices[:3])
        report.checks.append(CheckResult(f"{cat}: Precios", "fail",
                                         f"{len(bad_prices)} con precio <= 0: {names}"))
    else:
        avg = sum(p.get("price", 0) for p in products) / len(products)
        report.checks.append(CheckResult(f"{cat}: Precios", "ok", f"Todos > 0 (promedio ${avg:.2f} MXN)"))

    bad_stock = [pr for pr in products if (pr.get("stock") or 0) < 0]
    if bad_stock:
        report.checks.append(CheckResult(f"{cat}: Stock", "fail",
                                         f"{len(bad_stock)} productos con stock negativo"))
    else:
        zero_stock = [pr for pr in active if (pr.get("stock") or 0) == 0]
        if zero_stock:
            names = ", ".join(p.get("name", "?") for p in zero_stock[:3])
            report.checks.append(CheckResult(f"{cat}: Stock", "warn",
                                             f"{len(zero_stock)} activos con stock 0: {names}"))
        else:
            report.checks.append(CheckResult(f"{cat}: Stock", "ok", "Todos con stock >= 0"))

    names = [pr.get("name") for pr in products if pr.get("name")]
    dupes = set(n for n in names if names.count(n) > 1)
    if dupes:
        report.checks.append(CheckResult(f"{cat}: Nombres únicos", "fail",
                                         f"Duplicados: {', '.join(list(dupes)[:3])}"))
    else:
        report.checks.append(CheckResult(f"{cat}: Nombres únicos", "ok", "Sin duplicados"))

    with_badge = [pr for pr in active if pr.get("badge")]
    if with_badge:
        report.checks.append(CheckResult(f"{cat}: Badges", "ok", f"{len(with_badge)} productos con badge"))
    else:
        report.checks.append(CheckResult(f"{cat}: Badges", "warn", "Ningún producto tiene badge destacado"))


def check_theme(d1: D1Client, tenant: dict, report: TenantReport):
    """Categoría 5: Theme config / color de marca."""
    cat = "THEME"

    theme_color = tenant.get("theme_color")
    theme_raw = tenant.get("theme_config")

    if theme_color:
        if v_hex_color(theme_color):
            report.checks.append(CheckResult(f"{cat}: Theme color", "ok", f"Válido: {theme_color}"))
        else:
            report.checks.append(CheckResult(f"{cat}: Theme color", "warn", f"Formato no HEX: {theme_color}"))
    
    if theme_raw:
        try:
            theme = json.loads(theme_raw) if isinstance(theme_raw, str) else theme_raw
            report.checks.append(CheckResult(f"{cat}: theme_config JSON", "ok", "JSON válido"))
        except Exception:
            report.checks.append(CheckResult(f"{cat}: theme_config JSON", "warn", "JSON malformado"))
    elif not theme_color:
        report.checks.append(CheckResult(f"{cat}: Theme", "warn", "Sin theme_color ni theme_config"))


def check_api(tenant_slug: str, api_base: str, report: TenantReport):
    """Categoría 6: Endpoints API en vivo del worker."""
    cat = "API"

    if not HAS_REQUESTS:
        report.checks.append(CheckResult(f"{cat}: requests", "warn", "Instala requests para probar API"))
        return

    # /health
    t0 = time.time()
    try:
        r = requests.get(f"{api_base}/health", timeout=10)
        ms = (time.time() - t0) * 1000
        if r.status_code == 200:
            report.checks.append(CheckResult(f"{cat}: /health", "ok", f"200 OK ({ms:.0f}ms)"))
        else:
            report.checks.append(CheckResult(f"{cat}: /health", "fail", f"HTTP {r.status_code}"))
    except Exception as e:
        report.checks.append(CheckResult(f"{cat}: /health", "fail", f"Error: {e}"))

    # /api/store/config?tenant=...
    t0 = time.time()
    try:
        r = requests.get(f"{api_base}/api/store/config?tenant={tenant_slug}", timeout=10)
        ms = (time.time() - t0) * 1000
        if r.status_code == 200:
            data = r.json()
            payload = data.get("data") if isinstance(data.get("data"), dict) else data
            has_name = bool(payload.get("name") or payload.get("store_name"))
            if has_name:
                report.checks.append(CheckResult(f"{cat}: /api/store/config", "ok", f"200 OK ({ms:.0f}ms)"))
            else:
                report.checks.append(CheckResult(f"{cat}: /api/store/config", "warn", "200 pero respuesta sin nombre"))
        else:
            report.checks.append(CheckResult(f"{cat}: /api/store/config", "fail", f"HTTP {r.status_code}"))
    except Exception as e:
        report.checks.append(CheckResult(f"{cat}: /api/store/config", "fail", f"Error: {e}"))

    # /api/products?tenant=...
    t0 = time.time()
    try:
        r = requests.get(f"{api_base}/api/products?tenant={tenant_slug}", timeout=10)
        ms = (time.time() - t0) * 1000
        if r.status_code == 200:
            data = r.json()
            items = data.get("data") if isinstance(data.get("data"), list) else (data if isinstance(data, list) else data.get("products", []))
            if items:
                report.checks.append(CheckResult(f"{cat}: /api/products", "ok", f"{len(items)} productos ({ms:.0f}ms)"))
            else:
                report.checks.append(CheckResult(f"{cat}: /api/products", "warn", "200 pero catálogo vacío"))
        else:
            report.checks.append(CheckResult(f"{cat}: /api/products", "fail", f"HTTP {r.status_code}"))
    except Exception as e:
        report.checks.append(CheckResult(f"{cat}: /api/products", "fail", f"Error: {e}"))


# ── Orquestador ─────────────────────────────────────────────
def validate_tenant(d1: D1Client, slug: str, api_base: str | None) -> TenantReport:
    t0 = time.time()
    report = TenantReport(slug=slug)

    try:
        tenant = check_existence(d1, slug, report)
        if tenant is None:
            report.elapsed_ms = (time.time() - t0) * 1000
            return report

        check_payments(d1, tenant, report)
        check_admin(d1, report.tenant_id, report)
        check_products(d1, report.tenant_id, report)
        check_theme(d1, tenant, report)

        if api_base:
            check_api(slug, api_base, report)

    except Exception as e:
        report.checks.append(CheckResult("GENERAL: Error inesperado", "fail", str(e), critical=True))

    report.elapsed_ms = (time.time() - t0) * 1000
    return report


# ── CLI ─────────────────────────────────────────────────────
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Health check multi-tenant para Ark Commerce",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--tenant", "-t", help="Slug del tenant a validar (ej: temozonia o ark)")
    group.add_argument("--all", action="store_true", help="Validar todos los tenants")

    parser.add_argument("--local", action="store_true", help="Usa D1 local de Wrangler")
    parser.add_argument("--api", action="store_true", help="También probar endpoints del worker API")
    parser.add_argument("--api-url", default=os.getenv("API_BASE_URL", DEFAULT_API_URL),
                        help=f"URL base del worker (default: {DEFAULT_API_URL})")
    parser.add_argument("--strict", action="store_true", help="Modo estricto: warnings también fallan")
    parser.add_argument("--json", action="store_true", help="Salida en JSON (para CI/CD o automatización)")
    return parser


# ── Main ────────────────────────────────────────────────────
def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.json:
        header("🔍  VALIDATE TENANT · Health Check Ark Commerce")

    try:
        cfg = D1Config.resolve(is_local=args.local)
        d1 = D1Client(cfg)
        d1.query("SELECT 1 as test")
        if not args.json:
            target = "Local (Wrangler)" if cfg.is_local else "Remoto (Cloudflare)"
            p(f"  ✓ Conectado a D1: {cfg.database_id[:8]}… [{target}]", C.G)
    except Exception as e:
        if args.json:
            print(json.dumps({"error": f"No pude conectar a D1: {e}"}))
        else:
            p(f"\n✗ No pude conectar a D1: {e}", C.R)
        sys.exit(2)

    if args.all:
        try:
            tenants = d1.query("SELECT slug FROM tenants ORDER BY id")
            slugs = [t["slug"] for t in tenants]
        except Exception as e:
            p(f"✗ No pude listar tenants: {e}", C.R); sys.exit(2)
        if not args.json:
            p(f"  Encontrados {len(slugs)} tenants: {', '.join(slugs)}", C.D)
    else:
        slugs = [args.tenant]

    reports = []
    for slug in slugs:
        api_base = args.api_url if args.api else None
        report = validate_tenant(d1, slug, api_base)
        reports.append(report)
        if not args.json:
            report.print_report()

    if len(reports) > 1 and not args.json:
        header("📊  RESUMEN MULTI-TENANT")
        for r in reports:
            verdict, color = r.verdict()
            icon = {"HEALTHY": "🟢", "DEGRADED": "🟡", "UNHEALTHY": "🔴", "CRITICAL": "💀"}[verdict]
            p(f"  {icon} {r.slug:<15} {color}{verdict:<12}{C.E} "
              f"({r.ok}/{len(r.checks)} checks · {r.score()}%)", C.W)

    if args.json:
        output = {
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "tenants_validated": len(reports),
            "results": [r.to_dict() for r in reports],
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
        has_critical = any(r.critical_failures > 0 for r in reports)
        has_warn = any(r.warn > 0 for r in reports)
        sys.exit(1 if has_critical or (args.strict and has_warn) else 0)

    has_critical = any(r.critical_failures > 0 for r in reports)
    has_fail = any(r.fail > 0 for r in reports)
    has_warn = any(r.warn > 0 for r in reports)

    if has_critical or has_fail:
        sys.exit(1)
    if args.strict and has_warn:
        p(f"\n  ⚠ Modo estricto: warnings tratados como fallos", C.Y)
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\n\n  Cancelado por el usuario.", C.Y); sys.exit(1)
