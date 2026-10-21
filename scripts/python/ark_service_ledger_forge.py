#!/usr/bin/env python3
"""
=============================================================================
  ARK SERVICE LEDGER FORGE  ·  B2B & Professional Services Storefront Generator
  Arquetipo B: Para despachos contables, firmas legales, auditorías y consultoras.
  Genera Storefront con Libro Mayor / Póliza Interactiva + SQL para Cloudflare D1.
=============================================================================
"""
from __future__ import annotations
import json, sys, re, argparse
from dataclasses import dataclass, field, asdict
from pathlib import Path

# Soporte UTF-8 en consola Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

@dataclass
class ServiceItem:
    id: str
    nombre: str
    periodo: str
    alcance: str
    base: float
    badge: str
    desc: str
    entregables: list[str] = field(default_factory=list)

@dataclass
class ServiceTheme:
    lapis_950: str = "#040F1D"
    lapis_900: str = "#071A30"
    lapis_800: str = "#0C2440"
    lapis_700: str = "#143353"
    gold_500:  str = "#C9A227"
    gold_400:  str = "#D4AF37"
    gold_300:  str = "#E3C274"
    chalk_50:  str = "#FBF9F4"

@dataclass
class ServiceConfig:
    firm_name: str
    firm_subtitle: str
    tagline: str
    whatsapp: str
    whatsapp_display: str
    clabe: str
    bank: str
    iva_rate: float = 0.16
    theme: ServiceTheme = field(default_factory=ServiceTheme)

TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{firm_name}} · Propuesta de Servicios</title>
<link rel="icon" type="image/svg+xml" href="/images/contagram/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
:root {
  --lapis-950: {{t.lapis_950}};
  --lapis-900: {{t.lapis_900}};
  --lapis-800: {{t.lapis_800}};
  --lapis-700: {{t.lapis_700}};
  --gold-500:  {{t.gold_500}};
  --gold-400:  {{t.gold_400}};
  --gold-300:  {{t.gold_300}};
  --chalk-50:  {{t.chalk_50}};
}
* { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
body {
  margin: 0;
  background-color: var(--lapis-950);
  background-image: 
    radial-gradient(ellipse 90% 60% at 50% 0%, rgba(20, 51, 83, 0.45), transparent 75%),
    url("/images/contagram/girih-seamless.svg");
  background-size: auto, 480px 480px;
  color: var(--chalk-50);
  font-family: 'IBM Plex Sans', sans-serif;
  min-height: 100vh;
}
.font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
.font-mono { font-family: 'IBM Plex Mono', monospace; }
.cifra {
  font-family: 'IBM Plex Mono', monospace;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  text-align: right;
}
.tile-surface {
  background: linear-gradient(180deg, rgba(12, 36, 64, 0.85) 0%, rgba(7, 26, 48, 0.95) 100%);
  border: 1px solid var(--lapis-700);
  backdrop-filter: blur(12px);
  position: relative;
  transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.tile-surface:hover {
  border-color: rgba(201, 162, 39, 0.5);
  transform: translateY(-2px);
}
.tile-surface.selected {
  background: linear-gradient(180deg, rgba(20, 51, 83, 0.95) 0%, rgba(12, 36, 64, 0.98) 100%);
  border: 1px solid var(--gold-400);
  box-shadow: 0 0 0 1px var(--gold-400), 0 12px 32px rgba(4, 15, 29, 0.8), inset 0 0 24px rgba(201, 162, 39, 0.08);
}
.btn-gold {
  background: var(--gold-500);
  color: var(--lapis-950);
  font-weight: 600;
  border: 1px solid var(--gold-300);
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 16px rgba(201, 162, 39, 0.25);
}
.btn-gold:hover {
  background: var(--gold-400);
  transform: translateY(-1px);
}
.ledger-sheet {
  background: var(--lapis-900);
  border: 1px solid var(--lapis-700);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(227, 194, 116, 0.2);
  position: relative;
}
.ledger-sheet::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold-500), transparent);
}
.badge-tile {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  padding: 3px 8px;
  border-radius: 2px;
  border: 1px solid;
}
</style>
</head>
<body class="selection:bg-[#C9A227] selection:text-[#040F1D]">

<header class="border-b border-[#143353] bg-[#071A30]/80 backdrop-blur-md sticky top-0 z-40">
  <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <img src="/images/contagram/favicon.svg" alt="Sello" class="w-10 h-10 shadow-lg">
      <div class="border-l border-[#143353] pl-4">
        <div class="font-display text-2xl font-medium tracking-[0.14em] text-[#E3C274]">{{firm_name}}</div>
        <div class="font-sans text-[10px] tracking-[0.24em] text-[#8FAAC6] uppercase">{{firm_subtitle}}</div>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <div class="hidden md:flex flex-col text-right">
        <span class="text-[11px] font-mono text-[#8FAAC6]">ATENCIÓN INMEDIATA</span>
        <span class="text-xs font-mono font-medium text-[#E3C274]">{{whatsapp_display}}</span>
      </div>
      <a href="#propuesta" class="btn-gold px-5 py-2.5 rounded text-xs tracking-wider uppercase font-mono">Cotizador</a>
    </div>
  </div>
</header>

<main class="max-w-7xl mx-auto px-6 pt-14 pb-20">
  <section class="grid lg:grid-cols-12 gap-12 items-start">
    <div class="lg:col-span-7 pt-4">
      <div class="inline-flex items-center gap-2.5 px-3 py-1 rounded border border-[#143353] bg-[#0C2440]/60 mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
        <span class="text-[11px] font-mono tracking-[0.2em] text-[#DCE6F2] uppercase">Arquetipo B · Ledger</span>
      </div>
      <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-light text-[#FBF9F4] leading-[0.98] tracking-tight">
        Certidumbre y orden,<br>
        <span class="italic text-[#E3C274] font-normal">en riguroso equilibrio.</span>
      </h1>
      <div class="w-24 h-0.5 bg-[#C9A227] my-8 opacity-80"></div>
      <p class="text-[#DCE6F2] text-lg leading-relaxed font-light max-w-2xl">{{tagline}}</p>
    </div>

    <div class="lg:col-span-5" id="propuesta">
      <div class="ledger-sheet rounded-lg p-6 lg:sticky lg:top-28">
        <div class="flex justify-between items-start pb-4 border-b border-[#143353]">
          <div>
            <div class="text-[11px] font-mono tracking-[0.2em] text-[#C9A227] uppercase">PÓLIZA DE APERTURA DE SERVICIOS</div>
            <div class="text-xs font-mono text-[#8FAAC6] mt-0.5">ESTADO: CONCILIADO</div>
          </div>
          <span class="badge-tile border-[#2E7D6F] text-[#2E7D6F] bg-[#2E7D6F]/10">IVA 16%</span>
        </div>

        <div class="py-6 border-b border-[#143353]/80">
          <div class="flex justify-between items-baseline">
            <span class="text-xs font-mono text-[#8FAAC6] uppercase tracking-wider">Inversión Neta</span>
            <span class="text-[11px] font-mono text-[#C9A227]">MXN</span>
          </div>
          <div class="text-right mt-2">
            <span class="cifra text-5xl md:text-6xl font-medium text-[#FBF9F4]" id="totalNetoDisplay">$0</span>
          </div>
          <div class="flex justify-between items-center mt-2 text-[11px] font-mono text-[#8FAAC6]">
            <span id="serviciosCount">0 SERVICIOS INTEGRADOS</span>
            <span>BALANCE CUADRADO</span>
          </div>
        </div>

        <div class="py-4 space-y-2.5 min-h-[140px]" id="asientoList"></div>

        <div class="pt-4 border-t border-[#143353] space-y-2 text-xs font-mono">
          <div class="flex justify-between text-[#8FAAC6]"><span>BASE IMPOSITIVA:</span><span class="cifra text-[#DCE6F2]" id="baseImpositivaDisplay">$0</span></div>
          <div class="flex justify-between text-[#8FAAC6]"><span>I.V.A. (16%):</span><span class="cifra text-[#DCE6F2]" id="ivaDisplay">$0</span></div>
          <div class="flex justify-between text-[#E3C274] font-medium pt-2 border-t border-[#143353]/60"><span>SUMAS IGUALES:</span><span class="cifra" id="sumasIgualesDisplay">$0</span></div>
        </div>

        <div class="mt-6 pt-5 border-t border-[#143353] space-y-3">
          <div>
            <label class="block text-[10px] font-mono text-[#8FAAC6] uppercase tracking-wider mb-1">RFC / Razón Social</label>
            <input type="text" id="rfcInput" placeholder="Ej: ABC123456XYZ" class="w-full bg-[#040F1D] border border-[#143353] rounded px-3 py-2 text-xs text-[#FBF9F4] font-mono focus:border-[#C9A227] focus:outline-none">
          </div>
          <div>
            <label class="block text-[10px] font-mono text-[#8FAAC6] uppercase tracking-wider mb-1">Contacto / Representante</label>
            <input type="text" id="nombreInput" placeholder="Nombre completo" class="w-full bg-[#040F1D] border border-[#143353] rounded px-3 py-2 text-xs text-[#FBF9F4] font-mono focus:border-[#C9A227] focus:outline-none">
          </div>
        </div>

        <div class="mt-6">
          <button onclick="formalizarWhatsApp()" id="formalizarBtn" disabled class="btn-gold w-full py-3.5 rounded text-xs tracking-[0.16em] uppercase font-mono disabled:opacity-40 disabled:cursor-not-allowed">
            Formalizar Propuesta vía WhatsApp
          </button>
          <div class="text-center mt-3 text-[10px] font-mono text-[#8FAAC6]">
            Transferencia SPEI: <strong class="text-[#DCE6F2]">{{bank}}</strong> · CLABE: <span class="text-[#E3C274]">{{clabe}}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-24 pt-12 border-t border-[#143353]">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10">
      <div>
        <div class="text-[11px] font-mono tracking-[0.2em] text-[#C9A227] uppercase">Catálogo Estructurado</div>
        <h2 class="font-display text-4xl font-light text-[#FBF9F4] mt-1">Servicios Profesionales y Dictámenes</h2>
      </div>
      <p class="text-xs font-mono text-[#8FAAC6] mt-2 md:mt-0">Haz clic en cada servicio para incorporarlo a tu póliza.</p>
    </div>
    <div class="grid md:grid-cols-2 gap-6" id="servicesGrid"></div>
  </section>
</main>

<script>
const SERVICIOS = {{servicios_json}};
const WA_PHONE = "{{whatsapp}}";
const FIRM_NAME = "{{firm_name}}";
const BANK_NAME = "{{bank}}";
const CLABE_NUM = "{{clabe}}";

let seleccionados = new Set([SERVICIOS[0]?.id || ""]);

function renderServicios() {
  const container = document.getElementById("servicesGrid");
  container.innerHTML = SERVICIOS.map(s => {
    const isSelected = seleccionados.has(s.id);
    return `
      <div onclick="toggleServicio('${s.id}')" class="tile-surface ${isSelected ? 'selected' : ''} rounded-lg p-6 cursor-pointer">
        <div class="flex justify-between items-start mb-3">
          <span class="badge-tile border-[#C9A227] text-[#C9A227] bg-[#040F1D]/60">${s.badge}</span>
          <div class="cifra text-2xl font-medium ${isSelected ? 'text-[#E3C274]' : 'text-[#FBF9F4]'}">
            $${s.base.toLocaleString('es-MX')} <span class="text-xs text-[#8FAAC6] font-mono">MXN</span>
          </div>
        </div>
        <h3 class="font-display text-2xl text-[#FBF9F4] mb-1">${s.nombre}</h3>
        <div class="text-xs font-mono text-[#8FAAC6] mb-4">${s.periodo} · ${s.alcance}</div>
        <p class="text-sm text-[#DCE6F2] font-light leading-relaxed mb-5">${s.desc}</p>
        <div class="pt-4 border-t border-[#143353] flex items-center justify-between">
          <div class="text-[11px] font-mono text-[#8FAAC6]">${(s.entregables||[]).join(" • ")}</div>
          <button class="text-xs font-mono uppercase px-3 py-1 rounded border ${isSelected ? 'border-[#C9A227] text-[#C9A227] bg-[#C9A227]/10' : 'border-[#143353] text-[#8FAAC6]'}">
            ${isSelected ? '✓ Integrado' : '+ Seleccionar'}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleServicio(id) {
  if (seleccionados.has(id)) seleccionados.delete(id);
  else seleccionados.add(id);
  actualizarLibroMayor();
  renderServicios();
}

function actualizarLibroMayor() {
  const items = SERVICIOS.filter(s => seleccionados.has(s.id));
  const base = items.reduce((acc, s) => acc + s.base, 0);
  const iva = base * 0.16;
  const neto = base + iva;

  document.getElementById("baseImpositivaDisplay").textContent = "$" + base.toLocaleString('es-MX');
  document.getElementById("ivaDisplay").textContent = "$" + iva.toLocaleString('es-MX');
  document.getElementById("sumasIgualesDisplay").textContent = "$" + neto.toLocaleString('es-MX');
  document.getElementById("totalNetoDisplay").textContent = "$" + neto.toLocaleString('es-MX');
  document.getElementById("serviciosCount").textContent = `${items.length} SERVICIO${items.length === 1 ? '' : 'S'} INTEGRADO${items.length === 1 ? '' : 'S'}`;
  document.getElementById("formalizarBtn").disabled = items.length === 0;

  const asientoContainer = document.getElementById("asientoList");
  if (items.length === 0) {
    asientoContainer.innerHTML = `<div class="text-center py-8 text-xs font-mono text-[#8FAAC6]/60">[ Selecciona al menos un servicio para cotizar ]</div>`;
  } else {
    asientoContainer.innerHTML = items.map(it => `
      <div class="flex justify-between items-center text-xs font-mono py-1 border-b border-[#143353]/40">
        <div class="text-[#DCE6F2] truncate pr-3"><span class="text-[#C9A227] mr-1.5">•</span>${it.nombre}</div>
        <div class="cifra text-[#E3C274] font-medium whitespace-nowrap">$${it.base.toLocaleString('es-MX')}</div>
      </div>
    `).join("");
  }
}

function formalizarWhatsApp() {
  const items = SERVICIOS.filter(s => seleccionados.has(s.id));
  if (items.length === 0) return;
  const base = items.reduce((acc, s) => acc + s.base, 0);
  const iva = base * 0.16;
  const neto = base + iva;
  const rfc = document.getElementById("rfcInput").value.trim() || "(Por definir)";
  const contacto = document.getElementById("nombreInput").value.trim() || "(Por definir)";

  const mensaje = 
`🏛️ *${FIRM_NAME}*\\n`
+ `_Solicitud Formal de Propuesta de Servicios_\\n\\n`
+ `*SERVICIOS INTEGRADOS:*\\n`
+ items.map(s => `• *${s.nombre}* (${s.periodo}) — $${s.base.toLocaleString('es-MX')} MXN`).join("\\n")
+ `\\n--------------------------------------`
+ `\\n*Base Impositiva:* $${base.toLocaleString('es-MX')} MXN`
+ `\\n*I.V.A. (16%):* $${iva.toLocaleString('es-MX')} MXN`
+ `\\n*TOTAL NETO ESTIMADO:* $${neto.toLocaleString('es-MX')} MXN`
+ `\\n--------------------------------------`
+ `\\n*RFC / Razón Social:* ${rfc}`
+ `\\n*Representante:* ${contacto}`
+ `\\n*Banco Destino:* ${BANK_NAME} · CLABE: ${CLABE_NUM}\\n\\n`
+ `_Solicito contacto con un asesor para formalización de contrato._`;

  window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

renderServicios();
actualizarLibroMayor();
</script>
</body>
</html>
"""

def generate_service_store(cfg: ServiceConfig, services: list[ServiceItem], out_path: Path):
    html = TEMPLATE
    html = html.replace("{{firm_name}}", cfg.firm_name)
    html = html.replace("{{firm_subtitle}}", cfg.firm_subtitle)
    html = html.replace("{{tagline}}", cfg.tagline)
    html = html.replace("{{whatsapp}}", cfg.whatsapp)
    html = html.replace("{{whatsapp_display}}", cfg.whatsapp_display)
    html = html.replace("{{clabe}}", cfg.clabe)
    html = html.replace("{{bank}}", cfg.bank)
    html = html.replace("{{t.lapis_950}}", cfg.theme.lapis_950)
    html = html.replace("{{t.lapis_900}}", cfg.theme.lapis_900)
    html = html.replace("{{t.lapis_800}}", cfg.theme.lapis_800)
    html = html.replace("{{t.lapis_700}}", cfg.theme.lapis_700)
    html = html.replace("{{t.gold_500}}", cfg.theme.gold_500)
    html = html.replace("{{t.gold_400}}", cfg.theme.gold_400)
    html = html.replace("{{t.gold_300}}", cfg.theme.gold_300)
    html = html.replace("{{t.chalk_50}}", cfg.theme.chalk_50)
    
    serv_dict = [asdict(s) for s in services]
    html = html.replace("{{servicios_json}}", json.dumps(serv_dict, ensure_ascii=False))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    print(f"  ✓ Storefront B2B generado con éxito en: {out_path}")

def generate_d1_sql(cfg: ServiceConfig, services: list[ServiceItem], slug: str, out_sql: Path):
    lines = [
        f"-- Provisioning B2B Service Tenant: {slug}",
        f"INSERT INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color)",
        f"VALUES ('{slug}', '{cfg.firm_name}', '{slug}', NULL, '{cfg.whatsapp}', '{cfg.clabe}', '{cfg.bank}', '{cfg.firm_name}', NULL, 1.0, '/images/{slug}/favicon.svg', '{cfg.theme.gold_500}')",
        f"ON CONFLICT(id) DO UPDATE SET name=excluded.name, whatsapp=excluded.whatsapp, clabe=excluded.clabe, bank=excluded.bank, theme_color=excluded.theme_color;\n",
        f"UPDATE products SET active = 0 WHERE tenant_id = '{slug}';\n"
    ]
    for idx, s in enumerate(services, 1):
        lines.append(
            f"INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) "
            f"VALUES ('{slug}-p{idx}', '{slug}', '{s.nombre}', '{s.periodo} · {s.alcance}', {s.base}, '{s.desc}', '/images/{slug}/favicon.svg', '{s.badge}', 999, 1, {idx}) "
            f"ON CONFLICT(id) DO UPDATE SET price=excluded.price, active=1;"
        )
    out_sql.parent.mkdir(parents=True, exist_ok=True)
    out_sql.write_text("\n".join(lines), encoding="utf-8")
    print(f"  ✓ Script D1 SQL generado en: {out_sql}")

def main():
    parser = argparse.ArgumentParser(description="Ark Service Ledger Forge · B2B Storefront Generator")
    parser.add_argument("--slug", default="contagram", help="Slug del tenant")
    parser.add_argument("--out", default="public/stores/contagram.html", help="Ruta de salida HTML")
    parser.add_argument("--sql", default="scripts/sql/contagram.sql", help="Ruta de salida D1 SQL")
    args = parser.parse_args()

    # Configuración de prueba de Contagram
    cfg = ServiceConfig(
        firm_name="CONTAGRAM",
        firm_subtitle="Despacho de Contabilidad & Auditoría",
        tagline="Contagram no vende miedo fiscal. Entrega certeza matemática: el estado financiero como una pieza bien construida, donde cada cifra está en su lugar.",
        whatsapp="525657062511",
        whatsapp_display="+52 56 5706 2511",
        clabe="1271 8000 1844 7214 31",
        bank="Banco Azteca"
    )

    servicios = [
        ServiceItem("cont-gen", "Contabilidad General y Balanza Mensual", "Honorario Mensual", "Hasta 60 pólizas analíticas", 2800.0, "BASE · RECURRENTE", "Registro analítico de operaciones, conciliación bancaria exhaustiva, balanza de comprobación mensual y emisión de estados financieros.", ["Balanza de Comprobación", "Estado de Resultados", "Conciliación"]),
        ServiceItem("cumpl-fisc", "Cumplimiento Tributario y Declaraciones", "Por Ejercicio / Mensual", "ISR, IVA, Retenciones y DIOT", 3500.0, "OBLIGATORIO SAT", "Cálculo matemático exacto de contribuciones federales y atención inmediata a requerimientos para asegurar Opinión 32-D Positiva.", ["Acuses SAT", "Línea de Captura", "Opinión 32-D"]),
        ServiceItem("nomina-imss", "Gestión de Nómina y Seguridad Social", "Emisión Quincenal", "Hasta 10 colaboradores", 1950.0, "OPERATIVO", "Dispersión, timbrado de recibos CFDI 4.0 de nómina, cálculo de liquidaciones, finiquitos y control riguroso de movimientos IDSE/SUA.", ["CFDI XML/PDF", "Cédula SUA", "Emisiones IMSS"]),
        ServiceItem("auditoria-diag", "Auditoría Financiera y Blindaje EFOS", "Por Dictamen / Proyecto", "Auditoría integral profunda", 8500.0, "ALTO TICKET · BLINDAJE", "Inspección forense de CFDI emitidos vs recibidos, prevención de discrepancia fiscal y validación automática contra listas negras Art. 69-B CFF.", ["Dictamen de Riesgos", "Matriz Proveedores", "Plan de Acción"])
    ]

    print(f"\n🏛️  ARK SERVICE LEDGER FORGE · {cfg.firm_name}")
    generate_service_store(cfg, servicios, Path(args.out))
    generate_d1_sql(cfg, servicios, args.slug, Path(args.sql))
    print(f"  ✔ Proceso finalizado con éxito.\n")

if __name__ == "__main__":
    main()
