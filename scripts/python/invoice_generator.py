#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  INVOICE GENERATOR  ·  Facturas PDF desde órdenes D1
  Genera facturas con el design system de cada tenant
  
  Uso:
    python scripts/python/invoice_generator.py --tenant ark --list
    python scripts/python/invoice_generator.py --tenant ark --order-id <order_id_o_number>
    python scripts/python/invoice_generator.py --tenant temozonia --status pending
    python scripts/python/invoice_generator.py --tenant ark --from 2026-10-01 --to 2026-10-18
    python scripts/python/invoice_generator.py --all --output ./facturas

  Autenticación:
    Opción A: Usa Wrangler CLI automáticamente si no hay tokens configurados
    Opción B (Variables de entorno):
      CLOUDFLARE_API_TOKEN     → Token API con permisos D1
      CLOUDFLARE_ACCOUNT_ID    → ID de cuenta Cloudflare
      D1_DATABASE_ID           → ID de la base D1 (ark-commerce-db)
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import argparse, json, os, re, shutil, subprocess, sys, time
from dataclasses import dataclass, field
from datetime import datetime
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

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import (SimpleDocTemplate, Table, TableStyle,
                                     Paragraph, Spacer, HRFlowable)
    from reportlab.lib.enums import TA_RIGHT, TA_CENTER
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


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


# ── Modelo de factura ───────────────────────────────────────
@dataclass
class Invoice:
    order_id: str
    order_number: str
    tenant_slug: str
    tenant_name: str
    tenant_whatsapp: str | None
    tenant_clabe: str | None
    tenant_bank: str | None
    customer_name: str | None
    customer_email: str | None
    customer_phone: str | None
    customer_address: str | None
    subtotal: float
    total: float
    payment_method: str
    order_status: str
    notes: str | None
    created_at: str
    items: list[dict] = field(default_factory=list)

    @property
    def invoice_number(self) -> str:
        if self.order_number:
            return f"INV-{self.order_number}"
        return f"INV-{self.tenant_slug.upper()}-{self.order_id[:8].upper()}"

    @property
    def payment_method_display(self) -> str:
        methods = {
            "transfer": "Transferencia SPEI / Banco",
            "card": "Tarjeta Débito/Crédito",
            "lightning": "Bitcoin / Lightning Network",
            "whatsapp": "Directo por WhatsApp",
            "cash": "Efectivo",
        }
        return methods.get(self.payment_method, self.payment_method)


# ── Theme del tenant ────────────────────────────────────────
DEFAULT_THEME = {
    "primary": "#0B0C0E",
    "primary_dark": "#050507",
    "accent": "#B4FF00",
    "accent_light": "#C8FF33",
    "cream": "#F4F5F7",
}


def hex_to_rgb(hex_color: str, default=(0.04, 0.05, 0.06)) -> tuple:
    """Convierte #RRGGBB a (r, g, b) en rango 0-1 para reportlab."""
    try:
        hex_color = hex_color.lstrip("#")
        if len(hex_color) != 6:
            return default
        r = int(hex_color[0:2], 16) / 255.0
        g = int(hex_color[2:4], 16) / 255.0
        b = int(hex_color[4:6], 16) / 255.0
        return (r, g, b)
    except Exception:
        return default


def load_theme(theme_color: str | None, theme_config_json: str | None) -> dict:
    theme = dict(DEFAULT_THEME)
    if theme_color:
        theme["primary"] = theme_color
        theme["accent"] = theme_color
    if theme_config_json:
        try:
            parsed = json.loads(theme_config_json) if isinstance(theme_config_json, str) else theme_config_json
            theme.update(parsed)
        except Exception:
            pass
    return theme


# ── Carga de datos desde D1 ─────────────────────────────────
def fetch_tenant(d1: D1Client, slug: str) -> dict | None:
    rows = d1.query("SELECT * FROM tenants WHERE slug=? OR id=?", [slug, slug])
    return rows[0] if rows else None


def fetch_orders(d1: D1Client, tenant_id: str | None = None,
                 order_id: str | None = None,
                 status: str | None = None,
                 date_from: str | None = None,
                 date_to: str | None = None) -> list[dict]:
    sql = "SELECT * FROM orders WHERE 1=1"
    params = []

    if order_id:
        sql += " AND (id=? OR order_number=?)"
        params.extend([order_id, order_id])
    if tenant_id:
        sql += " AND tenant_id=?"
        params.append(tenant_id)
    if status:
        sql += " AND status=?"
        params.append(status)
    if date_from:
        sql += " AND created_at>=?"
        params.append(date_from)
    if date_to:
        sql += " AND created_at<=?"
        params.append(date_to + " 23:59:59")

    sql += " ORDER BY created_at DESC"
    return d1.query(sql, params)


def fetch_order_items(d1: D1Client, order_id: str) -> list[dict]:
    return d1.query("SELECT * FROM order_items WHERE order_id=?", [order_id])


def build_invoice(d1: D1Client, order: dict, tenant: dict) -> Invoice:
    items = fetch_order_items(d1, order["id"])
    total_val = float(order.get("total") or 0)
    subtotal_val = total_val
    if items:
        subtotal_val = sum(float(it.get("price") or 0) * int(it.get("quantity") or 1) for it in items)

    return Invoice(
        order_id=str(order["id"]),
        order_number=str(order.get("order_number") or ""),
        tenant_slug=tenant["slug"],
        tenant_name=tenant["name"],
        tenant_whatsapp=tenant.get("whatsapp"),
        tenant_clabe=tenant.get("clabe"),
        tenant_bank=tenant.get("bank"),
        customer_name=order.get("customer_name"),
        customer_email=order.get("customer_email"),
        customer_phone=order.get("customer_phone"),
        customer_address=order.get("customer_address"),
        subtotal=subtotal_val,
        total=total_val,
        payment_method=order.get("payment_method", "transfer"),
        order_status=order.get("status", "pending"),
        notes=order.get("customer_notes"),
        created_at=str(order.get("created_at") or ""),
        items=items,
    )


# ── Generador de PDF con reportlab ──────────────────────────
class InvoicePDFBuilder:
    def __init__(self, invoice: Invoice, theme: dict):
        if not HAS_REPORTLAB:
            p("✗ reportlab no instalado. pip install reportlab", C.R)
            sys.exit(1)
        self.invoice = invoice
        self.theme = theme
        
        self.primary = colors.Color(*hex_to_rgb(theme.get("primary", "#0B0C0E")))
        self.primary_dark = colors.Color(*hex_to_rgb(theme.get("primary_dark", "#050507")))
        self.accent = colors.Color(*hex_to_rgb(theme.get("accent", "#B4FF00")))
        self.cream = colors.Color(*hex_to_rgb(theme.get("cream", "#F4F5F7")))
        
        self.styles = getSampleStyleSheet()
        self.styles.add(ParagraphStyle(
            name="InvoiceTitle", parent=self.styles["Title"],
            fontSize=22, textColor=self.primary, spaceAfter=4, fontName="Helvetica-Bold", alignment=0
        ))
        self.styles.add(ParagraphStyle(
            name="SectionHeader", parent=self.styles["Normal"],
            fontSize=11, textColor=self.primary, fontName="Helvetica-Bold",
            spaceBefore=10, spaceAfter=4,
        ))
        self.styles.add(ParagraphStyle(
            name="RightAlign", parent=self.styles["Normal"],
            alignment=TA_RIGHT, fontSize=9, textColor=colors.HexColor("#555555")
        ))

    def build(self, output_path: Path) -> Path:
        doc = SimpleDocTemplate(
            str(output_path), pagesize=A4,
            leftMargin=20*mm, rightMargin=20*mm,
            topMargin=20*mm, bottomMargin=20*mm,
            title=f"Factura {self.invoice.invoice_number}",
            author=self.invoice.tenant_name,
        )
        elements = []

        elements.extend(self._build_header())
        elements.append(Spacer(1, 4*mm))
        elements.append(HRFlowable(width="100%", thickness=2, color=self.primary))
        elements.append(Spacer(1, 5*mm))

        elements.extend(self._build_customer_info())
        elements.append(Spacer(1, 5*mm))

        elements.append(Paragraph("Detalle de Productos", self.styles["SectionHeader"]))
        elements.append(self._build_items_table())
        elements.append(Spacer(1, 5*mm))

        elements.append(self._build_totals())
        elements.append(Spacer(1, 5*mm))

        elements.extend(self._build_payment_info())
        elements.append(Spacer(1, 10*mm))

        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CCCCCC")))
        elements.append(Spacer(1, 3*mm))
        elements.append(Paragraph(
            f"Gracias por su preferencia en {self.invoice.tenant_name}. "
            f"Comprobante fiscal/remisión emitido por infraestructura Ark Commerce.",
            ParagraphStyle("Footer", parent=self.styles["Normal"],
                          fontSize=8, textColor=colors.HexColor("#777777"), alignment=TA_CENTER)
        ))

        doc.build(elements)
        return output_path

    def _build_header(self) -> list:
        inv = self.invoice
        date_str = inv.created_at.split("T")[0] if "T" in inv.created_at else inv.created_at.split(" ")[0]

        header_data = [
            [
                Paragraph(f"<b>{inv.tenant_name}</b><br/><font size=10 color='#666666'>{inv.invoice_number}</font>",
                         self.styles["InvoiceTitle"]),
                Paragraph(f"<b>COMPROBANTE DE VENTA</b><br/>Fecha: {date_str or 'N/A'}<br/>Estado: <b>{inv.order_status.upper()}</b>",
                         self.styles["RightAlign"]),
            ],
        ]
        header_table = Table(header_data, colWidths=[110*mm, 60*mm])
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        return [header_table]

    def _build_customer_info(self) -> list:
        inv = self.invoice
        elements = [Paragraph("Datos del Cliente / Entrega", self.styles["SectionHeader"])]

        customer_lines = []
        if inv.customer_name:
            customer_lines.append(f"<b>Cliente:</b> {inv.customer_name}")
        if inv.customer_email:
            customer_lines.append(f"<b>Email:</b> {inv.customer_email}")
        if inv.customer_phone:
            customer_lines.append(f"<b>Teléfono:</b> {inv.customer_phone}")
        if inv.customer_address:
            customer_lines.append(f"<b>Dirección:</b> {inv.customer_address}")

        if customer_lines:
            elements.append(Paragraph("<br/>".join(customer_lines), self.styles["Normal"]))
        else:
            elements.append(Paragraph("Cliente no registrado (Invitado)", self.styles["Normal"]))

        return elements

    def _build_items_table(self) -> Table:
        inv = self.invoice
        data = [["Cant.", "Producto / Concepto", "Precio Unit.", "Importe"]]
        for item in inv.items:
            qty = int(item.get("quantity") or 1)
            pr = float(item.get("price") or 0)
            sub = qty * pr
            data.append([
                str(qty),
                str(item.get("name") or "Producto"),
                f"${pr:,.2f} MXN",
                f"${sub:,.2f} MXN",
            ])

        table = Table(data, colWidths=[18*mm, 82*mm, 35*mm, 35*mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), self.primary),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (3, -1), "RIGHT"),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            *[("BACKGROUND", (0, i), (-1, i), self.cream) for i in range(2, len(data), 2)],
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDDDDD")),
        ]))
        return table

    def _build_totals(self) -> Table:
        inv = self.invoice
        data = [
            ["Subtotal:", f"${inv.subtotal:,.2f} MXN"],
            ["Total a Pagar:", f"${inv.total:,.2f} MXN"],
            ["Método de Pago:", inv.payment_method_display],
            ["Estado del Pedido:", inv.order_status.upper()],
        ]
        table = Table(data, colWidths=[100*mm, 70*mm])
        table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (0, -1), "RIGHT"),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("FONTNAME", (0, 1), (1, 1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 1), (1, 1), 11),
            ("TEXTCOLOR", (0, 1), (1, 1), self.primary),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        return table

    def _build_payment_info(self) -> list:
        inv = self.invoice
        elements = [Paragraph("Instrucciones de Pago / Contacto", self.styles["SectionHeader"])]

        lines = []
        if inv.tenant_bank and inv.tenant_clabe:
            lines.append(f"<b>Banco Receptor:</b> {inv.tenant_bank} · <b>CLABE SPEI:</b> {inv.tenant_clabe}")
        if inv.tenant_whatsapp:
            lines.append(f"<b>Soporte / Comprobantes WhatsApp:</b> +{inv.tenant_whatsapp}")
        if inv.notes:
            lines.append(f"<b>Notas del Pedido:</b> {inv.notes}")

        if lines:
            elements.append(Paragraph("<br/>".join(lines), self.styles["Normal"]))

        return elements


# ── Generación batch ────────────────────────────────────────
def generate_invoices(d1: D1Client, tenant_slug: str | None = None,
                      order_id: str | None = None,
                      status: str | None = None,
                      date_from: str | None = None,
                      date_to: str | None = None,
                      output_dir: Path = Path("./facturas"),
                      dry_run: bool = False) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    generated = []

    if tenant_slug:
        t = fetch_tenant(d1, tenant_slug)
        if not t:
            p(f"✗ Tenant '{tenant_slug}' no existe en D1", C.R)
            return []
        tenants = [t]
    else:
        tenants = d1.query("SELECT * FROM tenants ORDER BY id")

    for tenant in tenants:
        p(f"\n── Tenant: {tenant['name']} ({tenant['slug']}) ──", C.M + C.BOLD)
        theme = load_theme(tenant.get("theme_color"), tenant.get("theme_config"))

        orders = fetch_orders(d1, tenant_id=tenant["id"], order_id=order_id,
                             status=status, date_from=date_from, date_to=date_to)
        if not orders:
            p("  Sin órdenes registradas con esos criterios", C.Y)
            continue

        p(f"  {len(orders)} órdenes encontradas", C.G)

        for order in orders:
            invoice = build_invoice(d1, order, tenant)
            filename = f"{invoice.invoice_number}.pdf"
            output_path = output_dir / tenant["slug"] / filename

            if dry_run:
                p(f"  [DRY-RUN] {filename} → {output_path}", C.D)
                continue

            output_path.parent.mkdir(parents=True, exist_ok=True)
            try:
                builder = InvoicePDFBuilder(invoice, theme)
                builder.build(output_path)
                size_kb = output_path.stat().st_size / 1024
                p(f"  ✓ {filename} ({size_kb:.1f} KB)", C.G)
                generated.append(output_path)
            except Exception as e:
                p(f"  ✗ Error generando {filename}: {e}", C.R)

    return generated


def list_orders(d1: D1Client, tenant_slug: str | None = None):
    if tenant_slug:
        tenant = fetch_tenant(d1, tenant_slug)
        if not tenant:
            p(f"✗ Tenant '{tenant_slug}' no existe en D1", C.R); return
        tenants = [tenant]
    else:
        tenants = d1.query("SELECT * FROM tenants ORDER BY id")

    for tenant in tenants:
        header(f"📋  Órdenes en D1: {tenant['name']}")
        orders = fetch_orders(d1, tenant_id=tenant["id"])
        if not orders:
            p("  Sin órdenes registradas", C.Y); continue

        for order in orders:
            st = order.get("status", "pending")
            status_icon = {"pending": "🟡", "paid": "🟢", "delivered": "📦"}.get(st, "⚪")
            ord_num = order.get("order_number") or order["id"][:8]
            total_num = float(order.get("total") or 0)
            p(f"  {status_icon} #{ord_num:<14} {order.get('customer_name', 'Invitado'):<22} "
              f"${total_num:>8.2f} MXN  {order.get('payment_method', '?'):<10} "
              f"{str(order.get('created_at', '?'))[:10]}", C.W)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generador de facturas y notas de remisión PDF desde órdenes D1",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--tenant", "-t", help="Slug del tenant (ej: ark o temozonia)")
    parser.add_argument("--all", action="store_true", help="Procesar todos los tenants")
    parser.add_argument("--order-id", type=str, help="ID o número de orden específica (ej: TEM-CAA445D6)")
    parser.add_argument("--status", choices=["pending", "paid", "delivered"], help="Filtrar por estado")
    parser.add_argument("--from", dest="date_from", help="Fecha inicio (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", help="Fecha fin (YYYY-MM-DD)")
    parser.add_argument("--output", "-o", type=Path, default=Path("./facturas"), help="Directorio destino (default: ./facturas)")
    parser.add_argument("--local", action="store_true", help="Usa D1 local de Wrangler")
    parser.add_argument("--list", action="store_true", help="Solo listar órdenes, no generar PDFs")
    parser.add_argument("--dry-run", action="store_true", help="Muestra qué generaría sin escribir archivos")
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.tenant and not args.all:
        p("✗ Especifica --tenant <slug> o --all", C.R)
        sys.exit(1)
    if args.tenant and args.all:
        p("✗ No puedes combinar --tenant y --all", C.R)
        sys.exit(1)

    header("🧾  INVOICE GENERATOR · Ark Commerce")

    try:
        cfg = D1Config.resolve(is_local=args.local)
        d1 = D1Client(cfg)
        d1.query("SELECT 1 as test")
        target = "Local (Wrangler)" if cfg.is_local else "Remoto (Cloudflare)"
        p(f"  ✓ Conectado a D1: {cfg.database_id[:8]}… [{target}]", C.G)
    except Exception as e:
        p(f"✗ No pude conectar a D1: {e}", C.R)
        sys.exit(1)

    if args.list:
        list_orders(d1, args.tenant)
        sys.exit(0)

    generated = generate_invoices(
        d1, tenant_slug=args.tenant, order_id=args.order_id,
        status=args.status, date_from=args.date_from, date_to=args.date_to,
        output_dir=args.output, dry_run=args.dry_run,
    )

    header("📊  Resumen")
    if args.dry_run:
        p("  ⚠️ DRY RUN → no se generaron archivos", C.Y)
    else:
        p(f"  ✓ {len(generated)} facturas generadas", C.G if generated else C.Y)
        if generated:
            p(f"  📁 Carpeta: {args.output.resolve()}", C.D)
            p(f"\n  Facturas:", C.M + C.BOLD)
            for path in generated[:10]:
                p(f"    • {path.name}", C.D)
            if len(generated) > 10:
                p(f"    … y {len(generated)-10} más", C.D)

    sys.exit(0 if generated or args.dry_run else 1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        p("\nCancelado por el usuario.", C.Y)
        sys.exit(1)
