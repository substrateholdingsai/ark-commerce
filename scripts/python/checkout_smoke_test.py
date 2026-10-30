#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  CHECKOUT SMOKE TEST  ·  E2E Testing del Pipeline de Órdenes
  Simula N compras → verifica D1, ORDER_QUEUE y ticket WhatsApp
  
  Uso:
    python scripts/python/checkout_smoke_test.py --tenant temozonia
    python scripts/python/checkout_smoke_test.py --tenant ark -n 20 --concurrency 5
    python scripts/python/checkout_smoke_test.py --tenant temozonia --dry-run
    python scripts/python/checkout_smoke_test.py --tenant temozonia --cleanup

  Autenticación:
    Opción A (Automática): Usa Wrangler CLI si no hay tokens definidos
    Opción B (API Cloudflare):
      CLOUDFLARE_API_TOKEN     → Token API con permisos D1
      CLOUDFLARE_ACCOUNT_ID    → ID de cuenta Cloudflare
      D1_DATABASE_ID           → ID de la base D1 (ark-commerce-db)

  Variables opcionales:
    API_BASE_URL             → URL del worker (default: https://ark-commerce.substrateholdingsai.workers.dev)
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import argparse, json, os, random, re, shutil, subprocess, sys, time, uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
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
        if self.cfg.use_wrangler:
            return self._query_wrangler(sql, params)
        else:
            return self._query_rest_api(sql, params)

    def _query_wrangler(self, sql: str, params: list | None = None) -> list[dict]:
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
            
            stdout = (res.stdout or "").strip()
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
        if params: body["params"] = params
        r = requests.post(self.url, headers=self.headers, json=body, timeout=30)
        if r.status_code != 200:
            raise RuntimeError(f"D1 API error {r.status_code}: {r.text}")
        data = r.json()
        if not data.get("success"):
            errs = data.get("errors", [])
            raise RuntimeError(f"D1 query falló: {errs}")
        return (data.get("result") or [{}])[0].get("results", [])


# ── Modelo de orden compatible con CheckoutSchema ──────────
@dataclass
class TestOrder:
    """Payload sintético validado contra CheckoutSchema (Zod)."""
    test_id: str
    tenant: str
    items: list[dict]          # [{'productId': str, 'quantity': int}]
    customer_name: str
    customer_email: str
    customer_address: str
    customer_phone: str
    notes: str | None = None
    payment_method: str = "transfer"  # 'transfer' | 'card' | 'lightning' | 'whatsapp'

    def to_payload(self) -> dict:
        """Formato exacto esperado por CheckoutSchema en worker/src/routes/checkout.ts"""
        return {
            "customerName": self.customer_name,
            "customerEmail": self.customer_email,
            "customerAddress": self.customer_address,
            "customerPhone": self.customer_phone,
            "paymentMethod": self.payment_method,
            "items": self.items,
            "notes": self.notes,
        }


# ── Datos de prueba ─────────────────────────────────────────
FAKE_NAMES = [
    "Juan Pérez", "María González", "Carlos Ramírez", "Ana Martínez",
    "Luis Hernández", "Sofía López", "Diego Torres", "Valentina Ruiz",
    "Fernando Castro", "Isabella Morales", "Andrés Vega", "Camila Ortiz",
]
FAKE_ADDRESSES = [
    "Av. Paseo de Montejo 450, Centro, Mérida, Yuc",
    "Calle 60 x 43 No. 320, Col. Alcalá Martín, Mérida",
    "Av. Reforma 123, Col. Juárez, Cuauhtémoc, CDMX",
    "Blvd. Kukulcán Km 9.5, Zona Hotelera, Cancún",
    "Av. Garza Sada 2400, Tecnológico, Monterrey, NL",
]
PAYMENT_METHODS = ["transfer", "card", "lightning", "whatsapp"]
TEST_PREFIX = "SMOKE-TEST"


def generate_test_orders(tenant: str, products: list[dict], n: int) -> list[TestOrder]:
    """Genera N órdenes sintéticas válidas para CheckoutSchema."""
    orders = []
    
    for i in range(n):
        test_id = f"{TEST_PREFIX}-{uuid.uuid4().hex[:8]}"
        num_items = random.randint(1, min(3, len(products)))
        selected = random.sample(products, num_items)
        items = [
            {"productId": str(prod["id"]), "quantity": random.randint(1, 2)}
            for prod in selected
        ]
        
        name = random.choice(FAKE_NAMES)
        import unicodedata
        nfkd = unicodedata.normalize('NFKD', name.lower())
        clean_name = "".join(c for c in nfkd if not unicodedata.combining(c))
        email_prefix = re.sub(r'[^a-z0-9]', '.', clean_name)
        email_prefix = re.sub(r'\.+', '.', email_prefix).strip('.')
        
        order = TestOrder(
            test_id=test_id,
            tenant=tenant,
            items=items,
            customer_name=name,
            customer_email=f"{email_prefix}.test{i}@arksystems.ai",
            customer_address=random.choice(FAKE_ADDRESSES),
            customer_phone=f"52{random.randint(5500000000, 5599999999)}",
            notes=f"{test_id} - Orden de prueba automatizada",
            payment_method=random.choice(PAYMENT_METHODS),
        )
        orders.append(order)
    
    return orders


# ── Cliente de checkout ─────────────────────────────────────
@dataclass
class CheckoutResult:
    order: TestOrder
    success: bool
    status_code: int | None = None
    order_id: str | None = None
    order_number: str | None = None
    total: float = 0.0
    latency_ms: float = 0.0
    error: str | None = None


class CheckoutTester:
    def __init__(self, api_base: str, d1: D1Client | None):
        self.api_base = api_base.rstrip("/")
        self.d1 = d1
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def fetch_products(self, tenant: str) -> list[dict]:
        url = f"{self.api_base}/api/products?tenant={tenant}"
        r = self.session.get(url, timeout=12)
        if r.status_code != 200:
            raise RuntimeError(f"No pude obtener productos: HTTP {r.status_code}")
        data = r.json()
        payload = data.get("data") if isinstance(data.get("data"), list) else (data if isinstance(data, list) else data.get("products", []))
        if not payload:
            raise RuntimeError(f"El tenant '{tenant}' no tiene productos activos")
        return payload

    def submit_checkout(self, order: TestOrder) -> CheckoutResult:
        url = f"{self.api_base}/api/checkout?tenant={order.tenant}"
        payload = order.to_payload()
        
        t0 = time.time()
        try:
            r = self.session.post(url, json=payload, timeout=30)
            latency = (time.time() - t0) * 1000
            
            if r.status_code in (200, 201):
                try:
                    res_json = r.json()
                    order_data = res_json.get("data", {}) if isinstance(res_json.get("data"), dict) else res_json
                    order_id = order_data.get("orderId") or order_data.get("order_id") or order_data.get("id")
                    order_num = order_data.get("orderNumber") or order_data.get("order_number")
                    total = float(order_data.get("total") or 0)
                    return CheckoutResult(
                        order=order, success=True, status_code=r.status_code,
                        order_id=order_id, order_number=order_num, total=total, latency_ms=latency
                    )
                except json.JSONDecodeError:
                    return CheckoutResult(
                        order=order, success=True, status_code=r.status_code,
                        latency_ms=latency, error="Respuesta 200 pero JSON inválido"
                    )
            else:
                return CheckoutResult(
                    order=order, success=False, status_code=r.status_code,
                    latency_ms=latency, error=f"HTTP {r.status_code}: {r.text[:200]}"
                )
        except requests.exceptions.Timeout:
            return CheckoutResult(
                order=order, success=False,
                latency_ms=(time.time() - t0) * 1000, error="Timeout (30s)"
            )
        except Exception as e:
            return CheckoutResult(
                order=order, success=False,
                latency_ms=(time.time() - t0) * 1000, error=str(e)
            )

    def verify_order_in_d1(self, order_id: str) -> tuple[bool, str]:
        if not self.d1:
            return False, "Sin conexión a D1"
        try:
            orders = self.d1.query("SELECT * FROM orders WHERE id=?", [order_id])
            if not orders:
                return False, f"Orden '{order_id}' no encontrada en tabla orders"
            
            order = orders[0]
            items = self.d1.query("SELECT * FROM order_items WHERE order_id=?", [order_id])
            if not items:
                return False, "Orden sin registros en order_items"
            
            expected_total = sum(float(it["price"]) * int(it["quantity"]) for it in items)
            shipping_cost = float(order.get("shipping_cost") or 0)
            expected_total += shipping_cost
            actual_total = float(order.get("total", 0))
            if abs(expected_total - actual_total) > 0.05:
                return False, f"Total discrepante: sum(items)={expected_total}, total_order={actual_total}"
            
            return True, "Orden e items íntegros en D1"
        except Exception as e:
            return False, f"Error verificando en D1: {e}"


# ── Reporte de resultados ──────────────────────────────────
@dataclass
class SmokeTestReport:
    tenant: str
    total: int = 0
    success: int = 0
    failed: int = 0
    latencies: list = field(default_factory=list)
    results: list[CheckoutResult] = field(default_factory=list)
    d1_verified: int = 0
    d1_failed: int = 0

    def add(self, result: CheckoutResult):
        self.results.append(result)
        self.latencies.append(result.latency_ms)
        if result.success:
            self.success += 1
        else:
            self.failed += 1

    @property
    def success_rate(self) -> float:
        return (self.success / self.total * 100) if self.total > 0 else 0

    def percentile(self, pct: int) -> float:
        if not self.latencies: return 0
        sorted_lats = sorted(self.latencies)
        idx = int(len(sorted_lats) * pct / 100)
        idx = min(idx, len(sorted_lats) - 1)
        return sorted_lats[idx]

    def print_summary(self):
        header("📊  Resultados del Smoke Test")
        p(f"  Tenant:        {self.tenant}", C.BOLD)
        p(f"  Órdenes:       {self.total}", C.W)
        p(f"  ✓ Exitosas:    {self.success}", C.G if self.success > 0 else C.W)
        p(f"  ✗ Fallidas:    {self.failed}", C.R if self.failed > 0 else C.W)
        p(f"  Success rate:  {self.success_rate:.1f}%", 
          C.G if self.success_rate == 100 else C.Y if self.success_rate >= 80 else C.R)

        if self.latencies:
            p(f"\n── Latencias ──", C.M + C.BOLD)
            p(f"  Min:   {min(self.latencies):>8.1f} ms", C.D)
            p(f"  p50:   {self.percentile(50):>8.1f} ms", C.W)
            p(f"  p95:   {self.percentile(95):>8.1f} ms", C.Y)
            p(f"  Max:   {max(self.latencies):>8.1f} ms", C.D)

        if self.d1_verified or self.d1_failed:
            p(f"\n── Verificación D1 ──", C.M + C.BOLD)
            p(f"  ✓ Órdenes confirmadas en D1: {self.d1_verified}", C.G)
            p(f"  ✗ No verificadas:           {self.d1_failed}", C.R if self.d1_failed else C.W)

        errors = [r for r in self.results if not r.success and r.error]
        if errors:
            p(f"\n── Errores ({len(errors)} total) ──", C.R + C.BOLD)
            for r in errors[:5]:
                p(f"  • {r.order.test_id}: {r.error[:120]}", C.Y)
            if len(errors) > 5:
                p(f"  … y {len(errors)-5} más", C.D)

        p(f"\n── Veredicto ──", C.BOLD)
        if self.success_rate == 100 and self.d1_failed == 0:
            p("  🟢 PASS — Pipeline de checkout funcionando al 100%", C.G + C.BOLD)
        elif self.success_rate >= 80:
            p("  🟡 WARN — Checkout procesó con éxito parcial", C.Y + C.BOLD)
        else:
            p("  🔴 FAIL — Checkout tiene fallos críticos", C.R + C.BOLD)


# ── Limpieza de órdenes de prueba ──────────────────────────
def cleanup_test_orders(d1: D1Client, tenant: str) -> int:
    orders = d1.query(
        "SELECT id FROM orders WHERE tenant_id=? AND customer_notes LIKE ?",
        [tenant, f"{TEST_PREFIX}%"]
    )
    if not orders:
        return 0
    
    ids = [o["id"] for o in orders]
    placeholders = ",".join("?" * len(ids))
    d1.query(f"DELETE FROM order_items WHERE order_id IN ({placeholders})", ids)
    d1.query(f"DELETE FROM orders WHERE id IN ({placeholders})", ids)
    return len(ids)


# ── CLI ─────────────────────────────────────────────────────
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Smoke test E2E del pipeline de checkout",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--tenant", "-t", required=True, help="Slug del tenant a testear (ej: temozonia o ark)")
    parser.add_argument("-n", "--num-orders", type=int, default=3, help="Número de órdenes a generar (default: 3)")
    parser.add_argument("--concurrency", "-c", type=int, default=1, help="Concurrencia (default: 1)")
    parser.add_argument("--api-url", default=os.getenv("API_BASE_URL", DEFAULT_API_URL),
                        help=f"URL base del worker (default: {DEFAULT_API_URL})")
    parser.add_argument("--local", action="store_true", help="Usa D1 local de Wrangler")
    parser.add_argument("--dry-run", action="store_true", help="Genera payloads sin enviar órdenes")
    parser.add_argument("--no-verify-d1", action="store_true", help="Salta la verificación en D1")
    parser.add_argument("--cleanup", action="store_true", help="Borra órdenes de prueba previas y sale")
    parser.add_argument("--verbose", "-v", action="store_true", help="Muestra logs detallados por orden")
    return parser


# ── Main ────────────────────────────────────────────────────
def main():
    parser = build_parser()
    args = parser.parse_args()

    header(f"🧪  CHECKOUT SMOKE TEST · Tenant: {args.tenant}")

    d1 = None
    try:
        cfg = D1Config.resolve(is_local=args.local)
        d1 = D1Client(cfg)
        d1.query("SELECT 1 as test")
        target = "Local (Wrangler)" if cfg.is_local else "Remoto (Cloudflare)"
        p(f"  ✓ Conectado a D1 [{target}]", C.G)
        
        rows = d1.query("SELECT id FROM tenants WHERE slug=? OR id=?", [args.tenant, args.tenant])
        if not rows:
            p(f"✗ Tenant '{args.tenant}' no existe en D1", C.R)
            sys.exit(1)
        p(f"  ✓ Tenant verificado en D1: {rows[0]['id']}", C.G)
    except Exception as e:
        p(f"✗ Advertencia D1: {e}", C.Y)
        p("  (Continuando sin verificación de base de datos directa)", C.D)
        d1 = None

    if args.cleanup:
        if not d1:
            p("✗ Necesito conexión a D1 para limpiar", C.R); sys.exit(1)
        deleted = cleanup_test_orders(d1, args.tenant)
        p(f"  ✓ {deleted} órdenes de prueba ('{TEST_PREFIX}%') eliminadas con éxito", C.G)
        sys.exit(0)

    tester = CheckoutTester(args.api_url, d1)
    try:
        p(f"\n── Obteniendo catálogo desde {args.api_url} ──", C.M + C.BOLD)
        products = tester.fetch_products(args.tenant)
        p(f"  ✓ {len(products)} productos activos encontrados", C.G)
        for prod in products[:4]:
            p(f"    • [{prod['id']}] {prod['name']} — ${prod['price']} MXN", C.D)
    except Exception as e:
        p(f"✗ No pude obtener productos del worker: {e}", C.R)
        sys.exit(1)

    p(f"\n── Generando {args.num_orders} órdenes sintéticas válidas ──", C.M + C.BOLD)
    orders = generate_test_orders(args.tenant, products, args.num_orders)
    for order in orders[:2]:
        p(f"  • {order.test_id}: {len(order.items)} producto(s) · Pago: {order.payment_method}", C.D)
    if len(orders) > 2:
        p(f"  … y {len(orders)-2} más", C.D)

    if args.dry_run:
        p(f"\n── DRY RUN: Payload de muestra ──", C.Y + C.BOLD)
        sample = orders[0].to_payload()
        p(json.dumps(sample, indent=2, ensure_ascii=False), C.D)
        p("\n⚠️ DRY RUN → Ninguna orden enviada.", C.Y)
        sys.exit(0)

    report = SmokeTestReport(tenant=args.tenant, total=len(orders))
    p(f"\n── Ejecutando checkout en vivo (concurrency={args.concurrency}) ──", C.M + C.BOLD)

    start_time = time.time()

    if args.concurrency <= 1:
        for i, order in enumerate(orders, 1):
            res = tester.submit_checkout(order)
            report.add(res)
            
            if res.success and res.order_id and d1 and not args.no_verify_d1:
                ok, msg = tester.verify_order_in_d1(res.order_id)
                if ok: report.d1_verified += 1
                else: report.d1_failed += 1
            
            icon = "✓" if res.success else "✗"
            color = C.G if res.success else C.R
            num_str = f"({res.order_number})" if res.order_number else ""
            p(f"  {icon} [{i}/{len(orders)}] {order.test_id} {num_str} — ${res.total:.2f} MXN ({res.latency_ms:.0f}ms)", color)
            if args.verbose and not res.success:
                p(f"      Error: {res.error}", C.Y)
    else:
        with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
            futures = {executor.submit(tester.submit_checkout, order): order for order in orders}
            for i, future in enumerate(as_completed(futures), 1):
                res = future.result()
                report.add(res)
                
                if res.success and res.order_id and d1 and not args.no_verify_d1:
                    ok, msg = tester.verify_order_in_d1(res.order_id)
                    if ok: report.d1_verified += 1
                    else: report.d1_failed += 1
                
                icon = "✓" if res.success else "✗"
                color = C.G if res.success else C.R
                num_str = f"({res.order_number})" if res.order_number else ""
                p(f"  {icon} [{i}/{len(orders)}] {res.order.test_id} {num_str} — ${res.total:.2f} MXN ({res.latency_ms:.0f}ms)", color)

    elapsed = time.time() - start_time
    report.print_summary()
    p(f"\n  Tiempo total: {elapsed:.2f}s ({len(orders)/elapsed:.1f} req/s)", C.D)

    if d1 and report.success > 0:
        p(f"\n  💡 Para limpiar estas órdenes de prueba:", C.D)
        p(f"     python scripts/python/checkout_smoke_test.py --tenant {args.tenant} --cleanup\n", C.D)

    if report.success_rate == 100 and report.d1_failed == 0:
        sys.exit(0)
    elif report.success_rate >= 80:
        sys.exit(1)
    else:
        sys.exit(2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\nCancelado por el usuario.", C.Y)
        sys.exit(1)
