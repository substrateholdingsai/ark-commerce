#!/usr/bin/env python3
"""
===============================================================
  ARK UNIVERSAL FORGE  ·  White-Label Storefront Generator
  Edita PRODUCTS + CONFIG + THEME arriba o usa un archivo .md
  Genera 1 HTML autocontenido (<25KB) o SQL para Cloudflare D1.
===============================================================
"""
from __future__ import annotations
import json, sys, datetime, re, argparse
from dataclasses import dataclass, field, asdict
from pathlib import Path


# ============================================================
#  1 · MODELOS
# ============================================================
@dataclass
class Product:
    id: int
    name: str
    weight: str
    price: float
    desc: str
    badge: str | None = None
    stock: int = 0
    accent: str = "from-[#E8EEFF] to-[#C9D8FF]"   # gradiente Tailwind
    icon: str = "box"                              # icono Lucide

@dataclass
class Theme:
    primary:       str = "#002B7F"   # navy
    primary_dark:  str = "#001A4D"
    accent:        str = "#D4AF37"   # oro
    accent_light:  str = "#F5D97A"
    accent_dark:   str = "#A8883F"
    cream:         str = "#F5ECD7"
    lcd:           str = "#9EA792"

@dataclass
class Config:
    store_name:       str
    whatsapp:         str            # solo dígitos, con código país
    whatsapp_display: str
    clabe:            str
    bank:             str
    btcpay_pos_url:   str
    sats_rate:        float
    lightning:        str
    creator_url:      str
    theme:            Theme = field(default_factory=Theme)


# ============================================================
#  2 · CONFIGURACIÓN POR DEFECTO (ARK SYSTEMS)
# ============================================================
PRODUCTS = [
    Product(1, "LANDING EXPRESS KIT", "1 licencia", 990, "Template HTML único con Carrito Universal + WhatsApp + SPEI.", "POPULAR", 50, "from-[#B4FF00]/20 to-[#121417]", "package"),
    Product(2, "HOSTING CLOUDFLARE WORKER", "1 mes • saas", 299, "Infraestructura multi-tenant en Cloudflare Workers + D1 + R2.", "RECOMENDADO", 100, "from-[#00E5FF]/20 to-[#121417]", "layers"),
    Product(3, "CUSTOM DESIGN SYSTEM", "1 marca", 1490, "Tokens de marca personalizados adaptados a tu negocio.", None, 20, "from-[#B4FF00]/10 to-[#1A1D22]", "box"),
    Product(4, "SETUP MULTI-MÉTODO", "1 config", 450, "Configuración asistida de CLABE SPEI, WhatsApp y Lightning BTC.", "EXTRA", 30, "from-[#121417] to-[#1A1D22]", "cuboid"),
]

CONFIG = Config(
    store_name       = "ARK SYSTEMS",
    whatsapp         = "529994918221",
    whatsapp_display = "+52 999 491 8221",
    clabe            = "0121 8001 2345 6789 01",
    bank             = "BBVA",
    btcpay_pos_url   = "https://btcpay.ark.systems/pos",
    sats_rate        = 2.5,
    lightning        = "Blink -> USDT Solana Phantom",
    creator_url      = "https://arksystems.site",
    theme            = Theme(
        primary       = "#0B0C0E",
        primary_dark  = "#050507",
        accent        = "#B4FF00",
        accent_light  = "#D2FF4D",
        accent_dark   = "#8ACC00",
        cream         = "#121417",
        lcd           = "#1A1D22"
    ),
)


# ============================================================
#  3 · VALIDACIÓN
# ============================================================
def validate(products: list[Product], cfg: Config) -> None:
    ids = [p.id for p in products]
    assert len(ids) == len(set(ids)), "IDs de producto duplicados"
    for p in products:
        assert p.price > 0,   f"{p.name}: precio debe ser > 0"
        assert p.stock >= 0,  f"{p.name}: stock no puede ser negativo"
    clean_wa = re.sub(r"\D", "", cfg.whatsapp)
    assert clean_wa, "whatsapp debe contener dígitos numéricos"
    assert cfg.sats_rate > 0, "sats_rate debe ser > 0"
    assert products, "debes definir al menos 1 producto"


# ============================================================
#  4 · PAYLOAD & CSS THEME
# ============================================================
def build_payload(products: list[Product], cfg: Config) -> str:
    clean_wa = re.sub(r"\D", "", cfg.whatsapp)
    payload = {
        "products": [asdict(p) for p in products],
        "config": {
            "store_name": cfg.store_name,
            "whatsapp": clean_wa,
            "whatsapp_display": cfg.whatsapp_display,
            "clabe": cfg.clabe,
            "bank": cfg.bank,
            "btcpay_pos_url": cfg.btcpay_pos_url,
            "sats_rate": cfg.sats_rate,
            "lightning": cfg.lightning,
            "creator_url": cfg.creator_url,
        },
    }
    return json.dumps(payload, ensure_ascii=False, indent=2).replace("</", "<\\/")


def build_theme_css(t: Theme) -> str:
    return f""":root{{--navy:{t.primary};--navy-2:{t.primary_dark};--gold:{t.accent};
--gold-light:{t.accent_light};--gold-dark:{t.accent_dark};--cream:{t.cream};
--lcd:{t.lcd};--ink:#0f0f12;--muted:#6b7280;--surface:#fff;
--line:rgba(0,43,127,.12)}}"""


# ============================================================
#  5 · PLANTILLA HTML AUTOCONTENIDA
# ============================================================
TEMPLATE = r"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@@STORE_NAME@@ · Checkout Universal</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Orbitron:wght@700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
@@THEME@@
*{-webkit-font-smoothing:antialiased}
body{font-family:Inter,system-ui,sans-serif;background:var(--surface);color:var(--ink)}
.font-display{font-family:'Playfair Display',Georgia,serif;font-weight:900}
.font-mono-num{font-family:'Orbitron',monospace;font-weight:700;font-variant-numeric:tabular-nums}
.text-magnified{font-family:'Playfair Display',serif;font-weight:900;letter-spacing:-.04em;line-height:.9;
  text-shadow:0 1px 0 var(--gold-light),0 2px 0 rgba(255,255,255,.8),0 12px 24px rgba(0,43,127,.12)}
.badge-gold{background:var(--gold);color:var(--navy-2);border-radius:9999px;font-size:10px;font-weight:800;
  letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;
  box-shadow:0 2px 0 var(--gold-dark)}
.glass-btn{border-radius:9999px;transition:all .22s cubic-bezier(.16,1,.3,1);font-weight:600;cursor:pointer}
.glass-btn:active{transform:scale(.98) translateY(1px)}
.glass-btn:disabled{opacity:.4;cursor:not-allowed}
.glass-btn-primary{background:var(--navy);color:#fff;box-shadow:0 4px 0 var(--navy-2),0 8px 24px rgba(0,43,127,.22)}
.glass-btn-primary:hover:not(:disabled){background:var(--navy-2);transform:translateY(-1px)}
.glass-btn-gold{background:var(--gold);color:var(--navy-2);font-weight:800;
  box-shadow:0 4px 0 var(--gold-dark),0 8px 24px rgba(212,175,55,.32)}
.glass-btn-gold:hover:not(:disabled){background:var(--gold-light);transform:translateY(-1px)}
.lcd-display{background:var(--lcd);border-radius:12px;color:#1a2a1a;font-family:'Orbitron',monospace;
  box-shadow:inset 0 2px 8px rgba(0,0,0,.18),inset 0 -1px 0 rgba(255,255,255,.4),0 1px 0 rgba(255,255,255,.8)}
.receipt-gold{background:linear-gradient(180deg,#FFFEFB 0,var(--cream) 100%);border:1px dashed var(--gold-dark);border-radius:16px}
.liquid-glass-dome{background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(245,236,215,.72));
  backdrop-filter:blur(24px) saturate(140%);border:1px solid var(--line);border-radius:28px;padding:2rem;
  box-shadow:0 8px 0 var(--gold-dark),0 24px 64px rgba(0,43,127,.08),inset 0 1px 0 rgba(255,255,255,.8);position:relative;overflow:hidden}
.liquid-glass-dome:before{content:"";position:absolute;top:-50%;left:-30%;width:120%;height:80%;
  background:radial-gradient(ellipse at center,rgba(255,255,255,.9) 0,transparent 70%);pointer-events:none}
.method-btn{background:#fff;border:1px solid var(--line);transition:all .2s;cursor:pointer}
.method-btn:hover{border-color:rgba(0,43,127,.3)}
.method-btn.active{background:var(--navy);color:#fff;border-color:var(--navy);box-shadow:0 6px 0 var(--navy-2)}
.method-btn.active .m-icon{color:var(--gold-light)}
.method-btn.active .m-desc{color:rgba(255,255,255,.7)}
.overlay{position:fixed;inset:0;background:rgba(0,26,77,.2);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .3s;z-index:40}
.overlay.open{opacity:1;pointer-events:auto}
.drawer{position:fixed;right:0;top:0;height:100%;width:92%;max-width:420px;background:#fff;z-index:50;
  border-left:1px solid var(--line);box-shadow:-24px 0 64px rgba(0,43,127,.12);transform:translateX(100%);
  transition:transform .3s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column}
.drawer.open{transform:translateX(0)}
.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}
.toast{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%) translateY(20px);opacity:0;
  background:var(--navy);color:#fff;padding:.75rem 1.5rem;border-radius:9999px;font-size:13px;z-index:100;
  transition:all .3s cubic-bezier(.16,1,.3,1);pointer-events:none;box-shadow:0 8px 32px rgba(0,0,0,.24)}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}
@keyframes pulse{50%{opacity:.5}}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}
</style>
<script>window.__ARK_DATA__ = @@DATA@@;</script>
</head>
<body class="min-h-screen max-w-[100vw] overflow-x-hidden">

<!-- HEADER -->
<header class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[var(--line)]">
  <div class="mx-auto max-w-[1280px] px-6 md:px-10 h-16 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full bg-[var(--navy)] text-white grid place-items-center font-display text-sm">A</div>
      <span class="font-mono-num text-[13px] tracking-[0.18em] text-[var(--navy)]" data-config="store_name"></span>
    </div>
    <div class="flex items-center gap-3">
      <span class="badge-gold hidden sm:inline-flex">LIQUID GLASS</span>
      <button onclick="openDrawer()" class="relative glass-btn glass-btn-primary px-5 py-2.5 text-[13px] flex items-center gap-2">
        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
        <span class="font-mono-num" data-count>0</span>
        <span id="cartDot" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--gold)] rounded-full animate-pulse hidden"></span>
      </button>
    </div>
  </div>
</header>

<!-- HERO + TOTAL DOME -->
<section class="mx-auto max-w-[1280px] px-6 md:px-10 pt-10 md:pt-16 pb-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
  <div class="pt-2">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--line)] bg-white text-[11px] tracking-[0.14em] font-semibold text-[var(--navy)]">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ENTREGA INMEDIATA • SIN APPS • SIN IFRAMES
    </div>
    <h1 class="mt-6 font-display text-[42px] md:text-[64px] leading-[0.9] tracking-[-0.04em]">El dinero<br>se entiende<br><span class="text-[var(--navy)]">sin leer.</span></h1>
    <p class="mt-5 max-w-[46ch] text-[15px] leading-[1.6] text-[var(--muted)]">
      Catálogo vivo • Calculadora en tiempo real • 4 métodos de pago • WhatsApp automático. Un solo HTML, listo para cualquier negocio.
    </p>
    <div class="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--cream)] border border-[var(--line)] px-4 py-2 text-[11px] font-mono-num tracking-widest text-[var(--muted)]">
      CHECKOUT EXPRESS • LÓGICA UNIVERSAL
    </div>
  </div>

  <div class="liquid-glass-dome lg:sticky lg:top-[88px]">
    <div class="relative z-10 flex justify-between items-start">
      <div>
        <div class="text-[11px] tracking-[0.18em] font-bold text-[var(--muted)]">TOTAL MAGNIFICADO</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="font-mono-num text-[12px] text-[var(--navy)] tracking-widest">MXN</span>
          <span class="badge-gold">LIVE CALC</span>
        </div>
      </div>
      <div class="w-10 h-10 rounded-full bg-white border border-[var(--line)] grid place-items-center">
        <i data-lucide="calculator" class="w-[18px] h-[18px] text-[var(--navy)]"></i>
      </div>
    </div>
    <div class="relative z-10 mt-8">
      <div class="text-magnified text-[56px] md:text-[72px] text-[var(--navy)]" data-total>$0</div>
      <div class="mt-2 font-mono-num text-[12px] tracking-[0.12em] text-[var(--muted)]" data-summary>0 ITEMS • LISTO PARA COBRAR</div>
    </div>
    <div class="relative z-10 mt-8 lcd-display p-4">
      <div class="flex justify-between text-[10px] tracking-widest opacity-60"><span>SUBTOTAL</span><span>ENVÍO</span><span>TOTAL</span></div>
      <div class="mt-2 grid grid-cols-3 gap-2 text-[14px]">
        <div data-total>$0</div><div class="text-center">—</div><div class="text-right font-black" data-total>$0</div>
      </div>
      <div class="mt-3 h-px bg-black/10"></div>
      <div class="mt-2 flex justify-between text-[10px]"><span>CALC: sum(price×qty)</span><span class="opacity-60">SATS <span data-sats>0</span></span></div>
    </div>
    <div class="relative z-10 mt-6 flex gap-3">
      <button onclick="openDrawer()" id="viewCartBtn" disabled class="glass-btn glass-btn-primary flex-1 py-3 text-[13px]">Ver carrito</button>
      <button onclick="goCheckout()" class="glass-btn glass-btn-gold flex-1 py-3 text-[13px]">Checkout</button>
    </div>
  </div>
</section>

<!-- PRODUCTOS -->
<section class="bg-[#FFFEFB] border-y border-[var(--line)]">
  <div class="mx-auto max-w-[1280px] px-6 md:px-10 py-10 md:py-14">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
      <h2 class="font-display text-[28px] tracking-[-0.02em]">Catálogo universal</h2>
      <span class="font-mono-num text-[11px] tracking-widest text-[var(--muted)]">EDITABLE EN PYTHON · SIN REFERENCIA A CLIENTE</span>
    </div>
    <div id="grid" class="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5"></div>
  </div>
</section>

<!-- CHECKOUT -->
<section id="checkout" class="mx-auto max-w-[1280px] px-6 md:px-10 py-12 md:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
  <div class="liquid-glass-dome" id="checkoutDome">
    <div class="relative z-10 flex items-center justify-between">
      <h3 class="font-display text-[26px] tracking-[-0.02em]">Checkout universal</h3>
      <span class="badge-gold">4 MÉTODOS</span>
    </div>
    <div class="relative z-10 mt-8 grid gap-5">
      <label class="block"><span class="text-[11px] tracking-[0.14em] font-bold text-[var(--muted)]">NOMBRE</span>
        <input id="fName" placeholder="Tu nombre completo" class="mt-2 w-full h-12 rounded-full border border-[var(--line)] bg-white px-5 text-[14px] outline-none focus:border-[var(--navy)]"></label>
      <label class="block"><span class="text-[11px] tracking-[0.14em] font-bold text-[var(--muted)]">DIRECCIÓN / ENTREGA</span>
        <input id="fAddr" placeholder="Calle, colonia, referencias" class="mt-2 w-full h-12 rounded-full border border-[var(--line)] bg-white px-5 text-[14px] outline-none focus:border-[var(--navy)]"></label>
      <label class="block"><span class="text-[11px] tracking-[0.14em] font-bold text-[var(--muted)]">NOTA (OPCIONAL)</span>
        <input id="fNote" placeholder="Instrucciones, horario, referencia" class="mt-2 w-full h-12 rounded-full border border-[var(--line)] bg-white px-5 text-[14px] outline-none focus:border-[var(--navy)]"></label>
    </div>
    <div class="relative z-10 mt-8">
      <div class="text-[11px] tracking-[0.18em] font-bold text-[var(--muted)]">MÉTODO DE PAGO</div>
      <div class="mt-3 grid grid-cols-2 gap-3" id="methods">
        <button data-method="transfer"  class="method-btn active text-left rounded-2xl p-4"><div class="flex items-center gap-2"><i data-lucide="building-2" class="m-icon w-4 h-4 text-[var(--navy)]"></i><span class="font-mono-num text-[11px] tracking-widest">TRANSFERENCIA</span></div><div class="m-desc mt-1 text-[11px] text-[var(--muted)]">CLABE <span data-config="bank"></span></div></button>
        <button data-method="pos"       class="method-btn text-left rounded-2xl p-4"><div class="flex items-center gap-2"><i data-lucide="credit-card" class="m-icon w-4 h-4 text-[var(--navy)]"></i><span class="font-mono-num text-[11px] tracking-widest">BTCPAY POS</span></div><div class="m-desc mt-1 text-[11px] text-[var(--muted)]">Tarjeta / BTC</div></button>
        <button data-method="lightning" class="method-btn text-left rounded-2xl p-4"><div class="flex items-center gap-2"><i data-lucide="zap" class="m-icon w-4 h-4 text-[var(--navy)]"></i><span class="font-mono-num text-[11px] tracking-widest">LIGHTNING</span></div><div class="m-desc mt-1 text-[11px] text-[var(--muted)]">Blink → USDT</div></button>
        <button data-method="cash"      class="method-btn text-left rounded-2xl p-4"><div class="flex items-center gap-2"><i data-lucide="banknote" class="m-icon w-4 h-4 text-[var(--navy)]"></i><span class="font-mono-num text-[11px] tracking-widest">EFECTIVO</span></div><div class="m-desc mt-1 text-[11px] text-[var(--muted)]">En entrega</div></button>
      </div>
    </div>
    <div class="relative z-10 mt-8 receipt-gold p-5">
      <div class="flex justify-between items-center"><span class="font-mono-num text-[11px] tracking-widest text-[var(--navy)]">RESUMEN WHATSAPP</span><span class="text-[10px] text-[var(--muted)]">AUTO-GENERADO</span></div>
      <pre id="ticketPreview" class="mt-3 text-[12px] leading-[1.5] whitespace-pre-wrap font-mono bg-white/70 rounded-[10px] p-3 border border-[var(--line)]">Agrega productos para generar el mensaje…</pre>
    </div>
  </div>

  <div class="lg:sticky lg:top-[88px] space-y-6">
    <div class="liquid-glass-dome bg-white">
      <div class="relative z-10">
        <div class="text-[11px] tracking-[0.18em] font-bold text-[var(--muted)]">TOTAL A PAGAR</div>
        <div class="mt-4 text-magnified text-[56px] text-[var(--navy)]" data-total>$0</div>
        <div class="mt-2 font-mono-num text-[12px] text-[var(--muted)]" data-payline>Sin productos</div>
        <div class="mt-6 space-y-3">
          <button onclick="sendWhatsApp()" id="waBtn" disabled class="w-full glass-btn glass-btn-gold py-4 text-[14px] flex items-center justify-center gap-2">
            Pedir por WhatsApp <i data-lucide="arrow-up-right" class="w-4 h-4"></i></button>
          <div class="grid grid-cols-2 gap-3 text-[11px]">
            <div class="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 flex items-center justify-between">
              <span class="font-semibold text-[var(--muted)]">CLABE</span>
              <button onclick="copyClabe()" class="flex items-center gap-1 font-mono-num text-[var(--navy)]"><i data-lucide="copy" class="w-3 h-3"></i> <span id="copyLbl">COPIAR</span></button>
            </div>
            <a data-href="btcpay_pos_url" target="_blank" rel="noopener" class="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 flex items-center justify-between hover:border-[var(--navy)]">
              <span class="font-semibold text-[var(--muted)]">BTCPAY</span>
              <span class="font-mono-num text-[var(--navy)] flex items-center gap-1">ABRIR <i data-lucide="arrow-up-right" class="w-3 h-3"></i></span></a>
          </div>
        </div>
        <div class="mt-6 rounded-xl bg-[var(--cream)] border border-[var(--line)] p-4">
          <div class="font-mono-num text-[10px] tracking-widest text-[var(--muted)]">DETALLES BANCARIOS • CONFIGURABLE</div>
          <div class="mt-2 text-[13px] leading-relaxed">
            <div><span class="text-[var(--muted)]">Banco:</span> <span data-config="bank"></span></div>
            <div><span class="text-[var(--muted)]">CLABE:</span> <span class="font-mono-num" data-config="clabe"></span></div>
            <div><span class="text-[var(--muted)]">Lightning:</span> <span data-config="lightning"></span></div>
            <div><span class="text-[var(--muted)]">WhatsApp:</span> <span data-config="whatsapp_display"></span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="rounded-[20px] border border-dashed border-[var(--gold-dark)]/40 bg-[var(--cream)]/60 p-5 text-[12px] leading-[1.6] text-[var(--muted)]">
      <span class="font-bold text-[var(--navy)]">Cómo funciona:</span> edita PRODUCTS y CONFIG en Python o Markdown -> corre el Forge -> total magnificado vivo -> elige pago -> WhatsApp genera el ticket. 1 HTML, sin iframes, Cloudflare-ready.
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="border-t border-[var(--line)] bg-white">
  <div class="mx-auto max-w-[1280px] px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6">
    <div class="max-w-[52ch]">
      <div class="font-mono-num text-[11px] tracking-[0.18em] text-[var(--navy)]">© @@YEAR@@ <span data-config="store_name"></span> • LÓGICA UNIVERSAL</div>
      <div class="mt-2 text-[12px] text-[var(--muted)] leading-[1.6]">Creado por <span data-config="store_name"></span> —
        <a data-href="creator_url" target="_blank" rel="noopener" class="font-mono-num text-[var(--navy)] underline underline-offset-4" data-config="creator_url"></a> •
        1 landing + 1 carrito + 1 checkout en 1 HTML.
      </div>
    </div>
    <div class="text-[11px] font-mono-num leading-relaxed text-[var(--muted)]">
      <div>CLABE <span data-config="clabe"></span></div>
      <div>BTCPAY <span data-config="btcpay_pos_url"></span></div>
      <div data-config="lightning"></div>
    </div>
  </div>
</footer>

<!-- DRAWER + OVERLAY -->
<div id="overlay" class="overlay" onclick="closeDrawer()"></div>
<aside id="drawer" class="drawer">
  <div class="p-6 flex items-center justify-between border-b border-[var(--line)]">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-[var(--navy)] text-white grid place-items-center"><i data-lucide="shopping-cart" class="w-4 h-4"></i></div>
      <div><div class="font-mono-num text-[12px] tracking-widest">CARRITO</div><div class="text-[11px] text-[var(--muted)]"><span data-count>0</span> items • <span data-total-sm>$0</span></div></div>
    </div>
    <button onclick="closeDrawer()" class="w-9 h-9 rounded-full border border-[var(--line)] grid place-items-center"><i data-lucide="x" class="w-4 h-4"></i></button>
  </div>
  <div id="cartBody" class="flex-1 overflow-auto p-4 space-y-3 no-scrollbar"></div>
  <div class="p-5 border-t border-[var(--line)] bg-[var(--cream)]/60">
    <div class="flex justify-between font-mono-num text-[11px] tracking-widest text-[var(--muted)]"><span>SUBTOTAL</span><span data-total-sm>$0</span></div>
    <div class="mt-2 text-magnified text-[36px] text-[var(--navy)]" data-total>$0</div>
    <button onclick="closeDrawer();sendWhatsApp()" id="drawerWaBtn" disabled class="mt-4 w-full glass-btn glass-btn-gold py-3.5 text-[13px]">Pedir por WhatsApp</button>
    <div class="mt-3 text-center text-[10px] tracking-widest text-[var(--muted)]">ENTREGA INMEDIATA • SIN APPS • SIN IFRAMES</div>
  </div>
</aside>

<!-- MOBILE BAR -->
<div id="mobileBar" class="fixed bottom-0 left-0 right-0 z-30 lg:hidden hidden">
  <div class="mx-3 mb-3 rounded-[20px] bg-[var(--navy)] text-white p-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.24)] border border-white/10">
    <div class="pl-2"><div class="font-mono-num text-[10px] tracking-widest opacity-70"><span data-count>0</span> ITEMS</div><div class="font-display text-[20px] leading-none" data-total>$0</div></div>
    <div class="flex gap-2">
      <button onclick="openDrawer()" class="h-11 px-5 rounded-full bg-white text-[var(--navy)] text-[12px] font-bold">Ver</button>
      <button onclick="sendWhatsApp()" class="h-11 px-5 rounded-full bg-[var(--gold)] text-[var(--navy-2)] text-[12px] font-extrabold">WhatsApp</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
const DATA = window.__ARK_DATA__;
const P = Object.fromEntries(DATA.products.map(p => [p.id, p]));
const CONFIG = DATA.config;
let cart = {};
let method = "transfer";

const money = n => "$" + n.toLocaleString("es-MX");
const lines  = () => Object.entries(cart).map(([id,qty]) => ({...P[+id], qty, subtotal: P[+id].price*qty}));
const total  = () => lines().reduce((a,l)=>a+l.subtotal,0);
const count  = () => Object.values(cart).reduce((a,b)=>a+b,0);

function add(id){ cart[id]=(cart[id]||0)+1; pulse(); render(); }
function step(id,d){ cart[id]=(cart[id]||0)+d; if(cart[id]<=0) delete cart[id]; render(); }
function removeItem(id){ delete cart[id]; render(); }
function setMethod(m){ method=m;
  document.querySelectorAll("[data-method]").forEach(b=>b.classList.toggle("active", b.dataset.method===m)); }

function ticket(){
  const ls = lines(); if(!ls.length) return "";
  return `Hola ${CONFIG.store_name}!\nPedido:\n`
    + ls.map(l=>`• ${l.qty} x ${l.name} ${l.weight} $${l.subtotal}`).join("\n")
    + `\nTotal $${total()} MXN\nPago: ${method}`
    + `\nNombre: ${document.getElementById("fName").value||"-"}`
    + `\nDirección: ${document.getElementById("fAddr").value||"-"}`
    + `\nNota: ${document.getElementById("fNote").value||"-"}`
    + `\nOrigen: ${CONFIG.creator_url}`;
}
function sendWhatsApp(){
  const t = ticket(); if(!t) return toast("Agrega productos primero");
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`,"_blank");
}
function copyClabe(){
  navigator.clipboard.writeText(CONFIG.clabe.replaceAll(" ",""));
  document.getElementById("copyLbl").textContent="COPIADO";
  setTimeout(()=>document.getElementById("copyLbl").textContent="COPIAR",1800);
}
function goCheckout(){ document.getElementById("checkout").scrollIntoView({behavior:"smooth"});
  setTimeout(()=>document.getElementById("fName").focus(),450); }
function openDrawer(){ document.getElementById("drawer").classList.add("open"); document.getElementById("overlay").classList.add("open"); }
function closeDrawer(){ document.getElementById("drawer").classList.remove("open"); document.getElementById("overlay").classList.remove("open"); }
function pulse(){ const d=document.getElementById("cartDot"); d.classList.remove("hidden");
  d.style.transform="scale(1.4)"; setTimeout(()=>d.style.transform="scale(1)",200); }
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2200); }

function renderGrid(){
  document.getElementById("grid").innerHTML = DATA.products.map(p=>{
    const q = cart[p.id]||0;
    return `<div class="group relative bg-white rounded-[20px] border border-[var(--line)] p-5 hover:shadow-[0_12px_32px_rgba(0,43,127,0.08)] transition-all overflow-hidden">
      ${p.badge?`<div class="absolute top-5 right-5 badge-gold">${p.badge}</div>`:""}
      <div class="h-[92px] rounded-[14px] bg-gradient-to-br ${p.accent} border border-[var(--line)] flex items-center justify-between px-4 mb-4 relative overflow-hidden">
        <div class="w-12 h-12 rounded-[12px] bg-white/90 backdrop-blur border border-black/5 grid place-items-center shadow-sm text-[var(--navy)]"><i data-lucide="${p.icon}" class="w-5 h-5"></i></div>
        <div class="text-right"><div class="font-mono-num text-[22px] text-[var(--navy)]">$${p.price}</div><div class="text-[11px] tracking-[0.12em] text-[var(--muted)]">${p.weight}</div></div>
      </div>
      <h3 class="font-mono-num text-[13px] tracking-[0.14em] text-[var(--navy)]">${p.name}</h3>
      <p class="mt-2 text-[13px] leading-[1.5] text-[var(--muted)] min-h-[40px]">${p.desc}</p>
      <div class="mt-5 flex items-center justify-between">
        <div class="text-[11px] text-[var(--muted)]">Stock: <span class="font-mono-num">${p.stock}</span></div>
        ${q===0
          ? `<button onclick="add(${p.id})" class="glass-btn glass-btn-primary px-5 py-2.5 text-[12px] flex items-center gap-2">Agregar <i data-lucide="plus" class="w-3.5 h-3.5"></i></button>`
          : `<div class="flex items-center gap-2 bg-[var(--cream)] rounded-full p-1 border border-[var(--line)]">
              <button onclick="step(${p.id},-1)" class="w-8 h-8 rounded-full bg-white border border-[var(--line)] grid place-items-center"><i data-lucide="minus" class="w-3 h-3"></i></button>
              <span class="font-mono-num text-[13px] w-6 text-center">${q}</span>
              <button onclick="step(${p.id},1)" class="w-8 h-8 rounded-full bg-[var(--navy)] text-white grid place-items-center"><i data-lucide="plus" class="w-3 h-3"></i></button>
            </div>`}
      </div></div>`;
  }).join("");
  lucide.createIcons();
}

function renderCart(){
  const ls=lines(), t=total(), c=count();
  document.querySelectorAll("[data-total]").forEach(e=>e.textContent=money(t));
  document.querySelectorAll("[data-total-sm]").forEach(e=>e.textContent=money(t));
  document.querySelectorAll("[data-count]").forEach(e=>e.textContent=c);
  document.querySelectorAll("[data-sats]").forEach(e=>e.textContent=Math.round(t/CONFIG.sats_rate));
  document.getElementById("cartDot").classList.toggle("hidden", c===0);
  document.getElementById("mobileBar").classList.toggle("hidden", c===0);
  document.getElementById("viewCartBtn").disabled = c===0;
  document.getElementById("waBtn").disabled = c===0;
  document.getElementById("drawerWaBtn").disabled = c===0;
  document.getElementById("fName").value = document.getElementById("fName").value;
  document.getElementById("fAddr").value = document.getElementById("fAddr").value;
  document.getElementById("fNote").value = document.getElementById("fNote").value;
  document.getElementById("checkoutDome").classList.toggle("ring-4", c>0);
  document.getElementById("checkoutDome").classList.toggle("ring-[var(--gold)]/40", c>0);
  document.querySelector("[data-summary]").textContent =
    c===0 ? "0 ITEMS • LISTO PARA COBRAR" : `${c} ITEMS • ${ls.map(l=>l.name).join(" + ")}`;
  document.querySelector("[data-payline]").textContent = c>0 ? `${c} productos • Pago: ${method}` : "Sin productos";

  const body = document.getElementById("cartBody");
  body.innerHTML = c===0
    ? `<div class="py-16 text-center"><div class="mx-auto w-12 h-12 rounded-full bg-[var(--cream)] border border-[var(--line)] grid place-items-center mb-3">∅</div>
       <div class="font-display text-[18px]">Carrito vacío</div><div class="mt-1 text-[12px] text-[var(--muted)]">Agrega productos del catálogo</div></div>`
    : ls.map(l=>`<div class="rounded-2xl border border-[var(--line)] p-4 bg-[#FFFEFB] flex gap-3">
        <div class="w-10 h-10 rounded-[10px] bg-gradient-to-br ${l.accent} border border-[var(--line)] grid place-items-center text-[var(--navy)]"><i data-lucide="${l.icon}" class="w-4 h-4"></i></div>
        <div class="flex-1">
          <div class="flex justify-between"><div class="font-mono-num text-[11px] tracking-widest text-[var(--navy)]">${l.name}</div>
          <button onclick="removeItem(${l.id})" class="text-[11px] text-[var(--muted)] hover:text-black">Quitar</button></div>
          <div class="text-[11px] text-[var(--muted)]">${l.weight}</div>
          <div class="mt-2 flex items-center justify-between">
            <div class="flex items-center gap-1 bg-white rounded-full border border-[var(--line)] p-1">
              <button onclick="step(${l.id},-1)" class="w-6 h-6 rounded-full bg-[var(--cream)] grid place-items-center"><i data-lucide="minus" class="w-2.5 h-2.5"></i></button>
              <span class="font-mono-num text-[12px] w-5 text-center">${l.qty}</span>
              <button onclick="step(${l.id},1)" class="w-6 h-6 rounded-full bg-[var(--navy)] text-white grid place-items-center"><i data-lucide="plus" class="w-2.5 h-2.5"></i></button>
            </div>
            <div class="font-mono-num text-[12px]">$${l.subtotal}</div>
          </div></div></div>`).join("");
  lucide.createIcons();

  document.getElementById("ticketPreview").textContent = ticket() || "Agrega productos para generar el mensaje…";
}

function render(){ renderGrid(); renderCart(); }

["fName","fAddr","fNote"].forEach(id=>
  document.getElementById(id).addEventListener("input", ()=>{
    document.getElementById("ticketPreview").textContent = ticket() || "Agrega productos para generar el mensaje…";
  }));
document.querySelectorAll("[data-method]").forEach(b=>
  b.addEventListener("click", ()=>{ setMethod(b.dataset.method); renderCart(); }));

const cfgMap = {store_name:CONFIG.store_name, clabe:CONFIG.clabe, bank:CONFIG.bank,
  btcpay_pos_url:CONFIG.btcpay_pos_url, lightning:CONFIG.lightning,
  whatsapp_display:CONFIG.whatsapp_display, creator_url:CONFIG.creator_url};
document.querySelectorAll("[data-config]").forEach(el=>{ el.textContent = cfgMap[el.dataset.config]; });
document.querySelectorAll("[data-href]").forEach(el=>{ el.href = cfgMap[el.dataset.href]; });

render();
</script>
</body>
</html>"""


# ============================================================
#  6 · FORGE CORE
# ============================================================
def forge(products: list[Product], cfg: Config, out: str | Path = "index.html") -> Path:
    validate(products, cfg)
    html = (TEMPLATE
        .replace("@@STORE_NAME@@", cfg.store_name)
        .replace("@@YEAR@@", str(datetime.date.today().year))
        .replace("@@THEME@@", build_theme_css(cfg.theme))
        .replace("@@DATA@@", build_payload(products, cfg)))
    path = Path(out)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")
    size = path.stat().st_size / 1024
    print(f"[OK] Generado: {path.resolve()} ({size:.1f} KB) - {len(products)} productos - Tienda: {cfg.store_name}")
    return path


# ============================================================
#  7 · MARKDOWN PARSER
# ============================================================
def parse_markdown_store(md_path: str | Path) -> tuple[Config, list[Product]]:
    """
    Parsea un archivo Markdown con frontmatter YAML básico y lista de productos.
    Permite a cualquier cliente crear su tienda escribiendo solo un .md
    """
    text = Path(md_path).read_text(encoding="utf-8")
    meta: dict[str, str] = {}
    body = text

    # Extraer frontmatter si existe (delimitado por ---)
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if fm_match:
        fm_text, body = fm_match.group(1), fm_match.group(2)
        for line in fm_text.splitlines():
            line = line.strip()
            if not line or line.startswith("#") or ":" not in line:
                continue
            k, v = line.split(":", 1)
            meta[k.strip().lower()] = v.strip().strip('"').strip("'")

    # Configurar Theme
    theme = Theme(
        primary       = meta.get("primary", "#002B7F"),
        primary_dark  = meta.get("primary_dark", "#001A4D"),
        accent        = meta.get("accent", "#D4AF37"),
        accent_light  = meta.get("accent_light", "#F5D97A"),
        accent_dark   = meta.get("accent_dark", "#A8883F"),
        cream         = meta.get("cream", "#F5ECD7"),
        lcd           = meta.get("lcd", "#9EA792")
    )

    cfg = Config(
        store_name       = meta.get("store_name", "MI TIENDA"),
        whatsapp         = meta.get("whatsapp", "529999999999"),
        whatsapp_display = meta.get("whatsapp_display", "+52 999 999 9999"),
        clabe            = meta.get("clabe", "0121 8000 0000 0000 00"),
        bank             = meta.get("bank", "BBVA"),
        btcpay_pos_url   = meta.get("btcpay_pos_url", "https://btcpay.ark.systems/pos"),
        sats_rate        = float(meta.get("sats_rate", "2.5")),
        lightning        = meta.get("lightning", "Blink -> USDT"),
        creator_url      = meta.get("creator_url", "https://arksystems.site"),
        theme            = theme
    )

    # Parsear productos desde las secciones H2 o H3 (## o ###)
    products: list[Product] = []
    current_prod: dict | None = None
    pid = 1

    for line in body.splitlines():
        line = line.strip()
        h_match = re.match(r"^#{2,3}\s+(.+)$", line)
        if h_match:
            if current_prod:
                products.append(_dict_to_product(current_prod, pid))
                pid += 1
            current_prod = {"name": h_match.group(1).strip()}
            continue

        if current_prod and (line.startswith("-") or line.startswith("*")):
            sub = line[1:].strip()
            if ":" in sub:
                k, v = sub.split(":", 1)
                current_prod[k.strip().lower()] = v.strip()

    if current_prod:
        products.append(_dict_to_product(current_prod, pid))

    if not products:
        # Fallback a productos estándar si no se especificaron
        products = PRODUCTS

    return cfg, products


def _dict_to_product(d: dict, pid: int) -> Product:
    try:
        price = float(re.sub(r"[^\d.]", "", d.get("price", "100")) or 100)
    except:
        price = 100.0
    try:
        stock = int(re.sub(r"\D", "", d.get("stock", "10")) or 10)
    except:
        stock = 10

    return Product(
        id     = pid,
        name   = d.get("name", f"Producto {pid}"),
        weight = d.get("weight", "1 unidad"),
        price  = price,
        desc   = d.get("desc", d.get("description", "Descripción del producto.")),
        badge  = d.get("badge", None),
        stock  = stock,
        accent = d.get("accent", "from-[#E8EEFF] to-[#C9D8FF]"),
        icon   = d.get("icon", "package")
    )


# ============================================================
#  8 · EXPORTADOR CLOUDFLARE D1 (SaaS $299 MXN)
# ============================================================
def export_d1_sql(products: list[Product], cfg: Config, slug: str, admin_email: str | None = None) -> str:
    """
    Genera sentencias SQL compatibles con scripts/sql/schema.sql para Cloudflare D1
    para que la tienda quede inmediatamente operativa en el SaaS multi-tenant.
    """
    admin_email = admin_email or f"admin@{slug}.com"
    clean_wa = re.sub(r"\D", "", cfg.whatsapp)
    store_name_esc = cfg.store_name.replace("'", "''")
    # SHA-256 de "admin123"
    pwd_sha256 = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"

    sql_lines = [
        f"-- Provisioning Tenant: {slug} ({cfg.store_name})",
        f"INSERT INTO tenants (id, name, slug, domain, whatsapp, clabe, bank, clabe_holder, btcpay_pos_url, sats_rate, logo_url, theme_color) ",
        f"VALUES ('{slug}', '{store_name_esc}', '{slug}', NULL, '{clean_wa}', '{cfg.clabe}', '{cfg.bank}', '{store_name_esc}', '{cfg.btcpay_pos_url}', {cfg.sats_rate}, '/favicon.svg', '{cfg.theme.accent}') ",
        f"ON CONFLICT(id) DO UPDATE SET name=excluded.name, whatsapp=excluded.whatsapp, clabe=excluded.clabe, bank=excluded.bank, sats_rate=excluded.sats_rate, theme_color=excluded.theme_color;",
        "",
        f"-- Admin User (Password temporal: admin123)",
        f"INSERT OR IGNORE INTO tenant_users (id, tenant_id, email, password_hash, role) ",
        f"VALUES ('user-{slug}', '{slug}', '{admin_email}', '{pwd_sha256}', 'owner');",
        "",
        f"-- Desactivar productos previos o sincronizar",
        f"UPDATE products SET active = 0 WHERE tenant_id = '{slug}';",
        ""
    ]

    for order_idx, p in enumerate(products, start=1):
        p_name = p.name.replace("'", "''")
        p_desc = p.desc.replace("'", "''")
        p_badge = f"'{p.badge}'" if p.badge else "NULL"
        p_id = f"{slug}-p{p.id}"
        sql_lines.append(
            f"INSERT INTO products (id, tenant_id, name, weight, price, desc, image, badge, stock, active, display_order) "
            f"VALUES ('{p_id}', '{slug}', '{p_name}', '{p.weight}', {p.price}, '{p_desc}', '/favicon.svg', {p_badge}, {p.stock}, 1, {order_idx}) "
            f"ON CONFLICT(id) DO UPDATE SET price=excluded.price, stock=excluded.stock, active=1;"
        )

    return "\n".join(sql_lines)


# ============================================================
#  9 · CLI & RUNNER
# ============================================================
def main():
    parser = argparse.ArgumentParser(description="Ark Universal Forge - Storefront Generator")
    parser.add_argument("--md", type=str, help="Ruta a archivo Markdown de la tienda (.md)")
    parser.add_argument("--out", type=str, default=None, help="Ruta del archivo HTML generado (ej. dist/tienda.html)")
    parser.add_argument("--d1-sql", type=str, default=None, help="Ruta para exportar archivo SQL de Cloudflare D1")
    parser.add_argument("--slug", type=str, default=None, help="Slug del tenant (para D1 o URL)")
    parser.add_argument("--email", type=str, default=None, help="Email del administrador para D1")
    args = parser.parse_args()

    if args.md:
        md_file = Path(args.md)
        if not md_file.exists():
            print(f"[ERROR] No se encontro el archivo: {args.md}")
            sys.exit(1)
        cfg, products = parse_markdown_store(md_file)
        slug = args.slug or md_file.stem
        out_html = args.out or f"public/stores/{slug}.html"
    else:
        cfg = CONFIG
        products = PRODUCTS
        slug = args.slug or "ark"
        out_html = args.out or "index.html"

    # 1. Generar HTML
    forge(products, cfg, out_html)

    # 2. Generar SQL D1 si se solicito
    if args.d1_sql:
        sql = export_d1_sql(products, cfg, slug, args.email)
        sql_path = Path(args.d1_sql)
        sql_path.parent.mkdir(parents=True, exist_ok=True)
        sql_path.write_text(sql, encoding="utf-8")
        print(f"[OK] D1 SQL generado: {sql_path.resolve()} (Tenant: {slug})")


if __name__ == "__main__":
    main()
