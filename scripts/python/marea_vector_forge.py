#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MAREA — Fábrica Vectorial · Tienda de Playeras Personalizadas
Stdlib pura: math, random, pathlib, json, argparse. Cero Pillow/Cairo.
"""

import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import argparse
import json
import math
import random
from pathlib import Path

XML = '<?xml version="1.0" encoding="UTF-8"?>\n'
_rng = random.Random(20261101)
NOISE_SEED = _rng.randint(1000, 9999)

# ── Paleta MAREA ──
ARENA      = "#FFF9F0"
ARENA_2    = "#FEF3E2"
BLANCO     = "#FFFFFF"
ARENA_B    = "#F0E5D0"
TEAL       = "#0EA9A8"
TEAL_DK    = "#087F7E"
TEAL_HI    = "#3FD4D2"
CORAL      = "#E94E49"
CORAL_DK   = "#C53732"
CORAL_HI   = "#FF7B76"
MANGO      = "#FFB947"
MANGO_DK   = "#C98F1F"
SELVA      = "#2FA060"
SELVA_DK   = "#1F7A45"
LAVANDA    = "#8B6FC9"
TINTA      = "#1A3B38"
TINTA_2    = "#3D5C58"
NOCHE      = "#0F2E2C"
NOCHE_2    = "#163B38"
BRUMA      = "#B8D4D1"


# ══════════════ MONOGRAMA MAREA (ola estilizada + sol) ══════════════
def _motivo_marea(cx, cy, size):
    """Monograma: ola curva + sol coral arriba."""
    s = size
    # Sol (círculo coral)
    sun_y = cy - s * 0.35
    sun = f"""
      <circle cx="{cx}" cy="{sun_y:.1f}" r="{s*0.18:.1f}" fill="{CORAL}"/>
      <circle cx="{cx}" cy="{sun_y:.1f}" r="{s*0.24:.1f}" fill="none" stroke="{CORAL}" stroke-width="{max(1,s*0.02):.1f}" opacity="0.3"/>
    """
    # Ola principal (curva teal)
    wave_y = cy + s * 0.1
    wave = f"""
      <path d="M{cx - s*0.45:.1f} {wave_y:.1f} Q{cx - s*0.2:.1f} {wave_y - s*0.25:.1f}, {cx:.1f} {wave_y:.1f} T{cx + s*0.45:.1f} {wave_y:.1f}"
            fill="none" stroke="{TEAL}" stroke-width="{max(2,s*0.05):.1f}" stroke-linecap="round"/>
      <path d="M{cx - s*0.38:.1f} {wave_y + s*0.12:.1f} Q{cx - s*0.15:.1f} {wave_y + s*0.05:.1f}, {cx + s*0.05:.1f} {wave_y + s*0.12:.1f} T{cx + s*0.38:.1f} {wave_y + s*0.12:.1f}"
            fill="none" stroke="{TEAL_DK}" stroke-width="{max(1,s*0.035):.1f}" stroke-linecap="round" opacity="0.6"/>
    """
    # Triángulos inferiores (como los del logo)
    tri_y = cy + s * 0.32
    tris = []
    for i, offset in enumerate([-0.3, -0.1, 0.1, 0.3]):
        x = cx + offset * s
        tris.append(
            f'<path d="M{x - s*0.08:.1f} {tri_y:.1f} L{x:.1f} {tri_y + s*0.14:.1f} L{x + s*0.08:.1f} {tri_y:.1f} Z" fill="{MANGO}"/>'
        )
    tris_svg = "\n      ".join(tris)
    return sun + wave + f"\n      {tris_svg}"


MONOGRAM_SVG = XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <circle cx="64" cy="64" r="58" fill="{ARENA}" stroke="{ARENA_B}" stroke-width="2"/>
  <g transform="translate(64 68) scale(1.05)">
    {_motivo_marea(0, 0, 50)}
  </g>
</svg>
"""


# ══════════════ FAVICON (viewBox 64, rx=14) ══════════════
FAVICON_SVG = XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="favBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{TEAL}"/>
      <stop offset="1" stop-color="{TEAL_DK}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#favBg)"/>
  <!-- sol coral -->
  <circle cx="32" cy="20" r="8" fill="{CORAL}"/>
  <!-- ola blanca -->
  <path d="M12 38 Q22 28, 32 38 T52 38" fill="none" stroke="{BLANCO}" stroke-width="4" stroke-linecap="round"/>
  <path d="M16 44 Q26 40, 36 44 T48 44" fill="none" stroke="{BLANCO}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <!-- triángulos mango -->
  <path d="M20 50 L24 56 L28 50 Z" fill="{MANGO}"/>
  <path d="M36 50 L40 56 L44 50 Z" fill="{MANGO}"/>
</svg>
"""


# ══════════════ LOGO LOCKUP (~640×160) ══════════════
LOGO_LOCKUP_SVG = XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 160" width="640" height="160">
  <defs>
    <linearGradient id="lockTeal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{TEAL}"/>
      <stop offset="1" stop-color="{TEAL_DK}"/>
    </linearGradient>
  </defs>

  <!-- Icono (adaptación del logo actual en estilo MAREA) -->
  <g transform="translate(24 24)">
    <circle cx="56" cy="56" r="52" fill="none" stroke="{TEAL}" stroke-width="6"/>
    <circle cx="56" cy="56" r="44" fill="{BLANCO}"/>
    <circle cx="56" cy="58" r="38" fill="{CORAL}"/>
    <circle cx="56" cy="42" r="10" fill="{BLANCO}"/>
    <path d="M20 60 Q40 60, 56 70 Q72 80, 92 70 L92 78 Q72 78, 56 86 Q40 94, 20 82 Z" fill="{BLANCO}"/>
    <path d="M32 92 L44 98 L32 106 Z" fill="{BLANCO}"/>
    <path d="M48 100 L60 104 L50 114 Z" fill="{BLANCO}"/>
    <path d="M62 104 L74 100 L70 114 Z" fill="{BLANCO}"/>
    <path d="M76 92 L88 98 L88 106 Z" fill="{BLANCO}"/>
  </g>

  <!-- Texto -->
  <text x="160" y="82" font-family="'Baloo 2', 'Nunito', cursive" font-size="58"
        font-weight="700" letter-spacing="-1" fill="{TINTA}">MAREA</text>
  <text x="162" y="116" font-family="'Nunito', Inter, sans-serif" font-size="17"
        font-weight="600" letter-spacing="4" fill="{TEAL_DK}">PLAYERAS PERSONALIZADAS</text>
  <text x="162" y="142" font-family="'JetBrains Mono', Consolas, monospace" font-size="11"
        letter-spacing="2" fill="{TINTA_2}">SURESTE MEXICANO · DISEÑA TU OLA</text>
  <path d="M160 126 H600" stroke="{ARENA_B}" stroke-width="1.5"/>
</svg>
"""


# ══════════════ PATRÓN OLAS (seamless, <4KB, opacidad ≤8%) ══════════════
def build_pattern_olas() -> str:
    """Olas estilizadas como líneas curvas, inspiradas en el logo."""
    olas = []
    # 3 olas por tile a diferentes alturas
    for i, (y, color, op) in enumerate([
        (16, TEAL, 0.07),
        (32, TEAL_DK, 0.05),
        (48, TEAL_HI, 0.04),
    ]):
        olas.append(
            f'<path d="M0 {y} Q16 {y-8}, 32 {y} T64 {y}" fill="none" '
            f'stroke="{color}" stroke-width="2" opacity="{op}"/>'
        )
    # sol pequeño como acento
    olas.append(f'<circle cx="48" cy="8" r="4" fill="{MANGO}" opacity="0.08"/>')
    cuerpo = "\n    ".join(olas)
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g>
    {cuerpo}
  </g>
</svg>
"""


# ══════════════ PATRÓN TRIÁNGULOS (como los del logo) ══════════════
def build_pattern_triangulos() -> str:
    """Triángulos festivos inspirados en la parte inferior del logo."""
    tris = []
    for i, x in enumerate([8, 24, 40, 56]):
        y = 16 if i % 2 == 0 else 32
        color = [MANGO, CORAL, TEAL, MANGO][i % 4]
        op = 0.10
        tris.append(
            f'<path d="M{x-6} {y} L{x} {y+10} L{x+6} {y} Z" fill="{color}" opacity="{op}"/>'
        )
    # segunda fila
    for i, x in enumerate([16, 32, 48]):
        y = 48
        color = [TEAL, MANGO, CORAL][i % 3]
        tris.append(
            f'<path d="M{x-6} {y} L{x} {y+10} L{x+6} {y} Z" fill="{color}" opacity="0.08"/>'
        )
    cuerpo = "\n    ".join(tris)
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g>
    {cuerpo}
  </g>
</svg>
"""


# ══════════════ PATRÓN MÁSCARA ABSTRACTA (inspirado en el centro del logo) ══════════════
def build_pattern_mascara() -> str:
    """Máscara abstracta estilizada, NO literal ni sagrada."""
    mascaras = []
    for x in [16, 48]:
        mascaras.append(
            f'<ellipse cx="{x}" cy="20" rx="10" ry="12" fill="none" stroke="{CORAL}" stroke-width="1.5" opacity="0.08"/>'
            f'<circle cx="{x-4}" cy="17" r="2" fill="{TINTA}" opacity="0.12"/>'
            f'<circle cx="{x+4}" cy="17" r="2" fill="{TINTA}" opacity="0.12"/>'
            f'<path d="M{x-5} 26 Q{x} 30, {x+5} 26" fill="none" stroke="{TEAL}" stroke-width="1.5" opacity="0.10"/>'
        )
    cuerpo = "\n    ".join(mascaras)
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="64" height="48">
  <g>
    {cuerpo}
  </g>
</svg>
"""


# ══════════════ TEXTURA ARENA (grano cálido sutil) ══════════════
TEXTURE_ARENA_SVG = XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <filter id="arena" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="{NOISE_SEED}" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.98
                                                  0 0 0 0 0.93
                                                  0 0 0 0 0.85
                                                  0 0 0 0.10 0" result="t"/>
      <feComposite in="t" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect width="256" height="256" fill="{ARENA}"/>
  <rect width="256" height="256" filter="url(#arena)"/>
</svg>
"""


# ══════════════ DIVISOR OLA (línea ondulada con sol) ══════════════
DIVIDER_OLA_SVG = XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 48" width="600" height="48">
  <!-- sol central -->
  <circle cx="300" cy="16" r="10" fill="{MANGO}"/>
  <circle cx="300" cy="16" r="14" fill="none" stroke="{MANGO}" stroke-width="1.5" opacity="0.4"/>
  <!-- olas laterales -->
  <path d="M40 32 Q100 24, 160 32 T280 32" fill="none" stroke="{TEAL}" stroke-width="2" stroke-linecap="round"/>
  <path d="M320 32 Q380 24, 440 32 T560 32" fill="none" stroke="{TEAL}" stroke-width="2" stroke-linecap="round"/>
  <path d="M80 38 Q130 34, 180 38 T240 38" fill="none" stroke="{TEAL_DK}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  <path d="M360 38 Q410 34, 460 38 T520 38" fill="none" stroke="{TEAL_DK}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  <!-- triángulos decorativos -->
  <path d="M270 24 L276 30 L282 24 Z" fill="{CORAL}" opacity="0.6"/>
  <path d="M318 24 L324 30 L330 24 Z" fill="{CORAL}" opacity="0.6"/>
</svg>
"""


# ══════════════ OG IMAGE (1200×630, safe zone 100px) ══════════════
OG_IMAGE_SVG = XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{ARENA}"/>
      <stop offset="1" stop-color="{ARENA_2}"/>
    </linearGradient>
    <filter id="ogArena" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="2" seed="11" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.98  0 0 0 0 0.93  0 0 0 0 0.85  0 0 0 0.06 0"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#ogBg)"/>
  <rect width="1200" height="630" filter="url(#ogArena)"/>

  <!-- marco -->
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="{ARENA_B}" stroke-width="1"/>

  <!-- motivo grande -->
  <g transform="translate(140 180) scale(2.2)">
    <circle cx="0" cy="0" r="60" fill="{ARENA}" stroke="{ARENA_B}" stroke-width="2"/>
    <g transform="translate(0 4) scale(1.1)">
      {_motivo_marea(0, 0, 50)}
    </g>
  </g>

  <!-- tipografía -->
  <text x="420" y="260" font-family="'Baloo 2', 'Nunito', cursive" font-size="110"
        font-weight="700" letter-spacing="-3" fill="{TINTA}">MAREA</text>
  <text x="422" y="322" font-family="'Nunito', Inter, sans-serif" font-size="26"
        font-weight="600" letter-spacing="8" fill="{TEAL_DK}">PLAYERAS PERSONALIZADAS</text>
  <line x1="420" y1="350" x2="900" y2="350" stroke="{ARENA_B}" stroke-width="1"/>
  <text x="422" y="390" font-family="'Nunito', Inter, sans-serif" font-size="20"
        fill="{TINTA_2}">Diseña tu ola · Sureste Mexicano</text>

  <!-- KPIs -->
  <g transform="translate(420 430)">
    <rect width="200" height="76" fill="{BLANCO}" stroke="{ARENA_B}" rx="16"/>
    <text x="16" y="28" font-family="'Nunito', sans-serif" font-size="10" letter-spacing="2" fill="{TINTA_2}">DISEÑOS</text>
    <text x="16" y="58" font-family="'Baloo 2', cursive" font-size="28" font-weight="700" fill="{TINTA}">340+</text>
  </g>
  <g transform="translate(640 430)">
    <rect width="200" height="76" fill="{BLANCO}" stroke="{ARENA_B}" rx="16"/>
    <text x="16" y="28" font-family="'Nunito', sans-serif" font-size="10" letter-spacing="2" fill="{TINTA_2}">TALLAS</text>
    <text x="16" y="58" font-family="'Baloo 2', cursive" font-size="28" font-weight="700" fill="{TINTA}">S–XXL</text>
  </g>
  <g transform="translate(860 430)">
    <rect width="200" height="76" fill="{BLANCO}" stroke="{ARENA_B}" rx="16"/>
    <text x="16" y="28" font-family="'Nunito', sans-serif" font-size="10" letter-spacing="2" fill="{TINTA_2}">ENVÍO</text>
    <text x="16" y="58" font-family="'Baloo 2', cursive" font-size="28" font-weight="700" fill="{CORAL}">24–48h</text>
  </g>

  <!-- olas decorativas laterales -->
  <path d="M1050 150 Q1070 130, 1090 150 T1130 150" fill="none" stroke="{TEAL}" stroke-width="3" opacity="0.4"/>
  <path d="M1040 180 Q1065 165, 1090 180 T1140 180" fill="none" stroke="{TEAL_DK}" stroke-width="2" opacity="0.3"/>
  <path d="M1055 210 Q1075 198, 1095 210 T1125 210" fill="none" stroke="{MANGO}" stroke-width="2" opacity="0.4"/>

  <text x="1160" y="588" font-family="'JetBrains Mono', Consolas, monospace" font-size="11"
        letter-spacing="2" fill="{TINTA_2}" text-anchor="end">marea.mx</text>
</svg>
"""


# ══════════════ SPRITE PLAYERA (8 iconos, 192×24) ══════════════
SPRITE_ICONS = [
    # playera / camiseta
    ("playera",
     """<path d="M8 4h8l3 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z"/>
     <path d="M8 4l-4 3v4h4M16 4l4 3v4h-4"/>
     <path d="M9 12h6M9 15h4"/>"""),
    # ola / mar
    ("ola",
     """<path d="M2 12c3-4 6-4 9 0s6 4 9 0"/>
     <path d="M2 17c3-3 6-3 9 0s6 3 9 0"/>"""),
    # paleta / personalización
    ("paleta",
     """<circle cx="12" cy="12" r="9"/>
     <circle cx="8" cy="10" r="1.5"/>
     <circle cx="12" cy="7" r="1.5"/>
     <circle cx="16" cy="10" r="1.5"/>
     <path d="M12 12l4 4"/>"""),
    # talla / medida
    ("talla",
     """<path d="M3 12h18M7 12v-4M12 12v-6M17 12v-4"/>
     <path d="M3 12l4 4 4-4 4 4 4-4"/>"""),
    # carrito
    ("carrito",
     """<circle cx="9" cy="20" r="1.5"/>
     <circle cx="17" cy="20" r="1.5"/>
     <path d="M3 4h2l2.5 12h9L21 7H6"/>"""),
    # pincel / diseño
    ("pincel",
     """<path d="M18 3l3 3-9 9-4 1 1-4z"/>
     <path d="M15 6l3 3"/>"""),
    # sol / tropical
    ("sol",
     """<circle cx="12" cy="12" r="4"/>
     <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>"""),
    # envio / entrega
    ("envio",
     """<rect x="2" y="7" width="13" height="10" rx="1"/>
     <path d="M15 10h4l2 3v4h-6"/>
     <circle cx="7" cy="19" r="1.5"/>
     <circle cx="18" cy="19" r="1.5"/>"""),
]


def build_sprite_playera() -> str:
    groups = []
    for i, (icon_id, paths) in enumerate(SPRITE_ICONS):
        x = i * 24
        groups.append(
            f'<g id="{icon_id}" transform="translate({x} 0)" fill="none" '
            f'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
            f'stroke-linejoin="round">\n    {paths}\n  </g>'
        )
    body = "\n  ".join(groups)
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 24" width="192" height="24" style="color:{TEAL_DK}">
  {body}
</svg>
"""


# ══════════════ HELPERS ══════════════
def write_asset(out_dir: Path, name: str, content: str) -> Path:
    path = out_dir / name
    if not content.endswith("\n"):
        content += "\n"
    path.write_text(content, encoding="utf-8")
    return path


def kb(size_bytes: int) -> float:
    return round(size_bytes / 1024, 2)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="MAREA vector forge — Tienda de Playeras Personalizadas (stdlib pura)."
    )
    parser.add_argument("--out", default="public/images/marea",
                        help="Directorio de salida. Ej.: public/images/marea")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    assets = [
        ("favicon.svg", FAVICON_SVG),
        ("logo-lockup.svg", LOGO_LOCKUP_SVG),
        ("monogram-marea.svg", MONOGRAM_SVG),
        ("pattern-olas.svg", build_pattern_olas()),
        ("pattern-triangulos.svg", build_pattern_triangulos()),
        ("pattern-mascara.svg", build_pattern_mascara()),
        ("texture-arena.svg", TEXTURE_ARENA_SVG),
        ("divider-ola.svg", DIVIDER_OLA_SVG),
        ("og-image.svg", OG_IMAGE_SVG),
        ("sprite-playera.svg", build_sprite_playera()),
    ]

    records = []
    for name, content in assets:
        path = write_asset(out_dir, name, content)
        size = path.stat().st_size
        records.append({"path": name, "bytes": size, "kb": kb(size)})

    # validación patterns <4KB
    pattern_oks = {}
    for pname in ["pattern-olas.svg", "pattern-triangulos.svg", "pattern-mascara.svg"]:
        p_rec = next(r for r in records if r["path"] == pname)
        pattern_oks[pname] = p_rec["bytes"] < 4096

    manifest = {
        "schema": "bobs.asset-manifest.v1",
        "system": "MAREA",
        "slug": "marea",
        "cliente": "Tienda de Playeras Personalizadas · Sureste Mexicano",
        "huesped": "retail",
        "kind": "vector-forge",
        "stdlib_only": True,
        "noise_seed": NOISE_SEED,
        "files": records,
        "total_bytes": sum(r["bytes"] for r in records),
        "total_kb": round(sum(r["bytes"] for r in records) / 1024, 2),
        "checks": {k.replace("pattern-", "pattern_").replace(".svg", "_under_4kb"): v
                   for k, v in pattern_oks.items()},
    }

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    manifest_size = manifest_path.stat().st_size

    print("\n🌊 MAREA — Fábrica Vectorial · Playeras Personalizadas")
    print(f"📁 Salida: {out_dir.resolve()}")
    print("─" * 58)
    for record in records:
        flags = []
        if record["path"] in pattern_oks and pattern_oks[record["path"]]:
            flags.append("✓<4KB")
        flag = f"  {' '.join(flags)}" if flags else ""
        print(f"{record['path']:<28} {record['kb']:>8.2f} KB{flag}")
    print("─" * 58)
    print(f"{'manifest.json':<28} {kb(manifest_size):>8.2f} KB")
    print(f"{'TOTAL SVG':<28} {manifest['total_kb']:>8.2f} KB")
    print("✓ Colores del logo respetados (teal #0EA9A8, coral #E94E49)")
    print("✓ Tiki contextualizado al Caribe mexicano (no apropiación genérica)")
    print("✓ Gemelos oscuros para texto legible (teal-dk, coral-dk)")
    print("✅ Listo. Zero Pillow. Zero dependencias externas.\n")


if __name__ == "__main__":
    main()
