#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  SMOKE & AMBER FORGE  ·  Assets visuales para Temozonia
  Carnes Ahumadas Artesanales · Tradición desde 1987
  
  Genera 6 PNGs en ./public/images/temozonia/:
    1. smoke_hero.png       → textura humo + brasas (hero 1920×720)
    2. wood_tile.png        → veta de madera tileable (400×400)
    3. grill_pattern.png    → marcas de parrilla (tileable 600×600)
    4. promo_banner.png     → humo diagonal + chispas (1600×500)
    5. kraft_paper.png      → papel kraft para receipts (600×600)
    6. temozonia_logo.png   → logo "T" con herradura y humo (512×512)

  Uso:  python scripts/python/smoke_amber_forge.py
  
  Requiere: Pillow (pip install Pillow)
═══════════════════════════════════════════════════════════════
"""
from __future__ import annotations
import math, random, os, sys
from pathlib import Path

# Soporte UTF-8 en consola Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    print("✗ Pillow no instalado. Ejecuta:  pip install Pillow")
    sys.exit(1)


# ── Colores ANSI ────────────────────────────────────────────
class C:
    G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"; B = "\033[94m"
    M = "\033[95m"; W = "\033[97m"; D = "\033[90m"; E = "\033[0m"; BOLD = "\033[1m"

def p(msg, color=C.W): print(f"{color}{msg}{C.E}")
def header(t):
    p(f"\n{'═'*60}", C.B)
    p(f"  {t}", C.BOLD + C.B)
    p(f"{'═'*60}", C.B)


# ── Paleta SMOKE & AMBER ────────────────────────────────────
PALETTE = {
    "smoke_dark":   (26, 18, 14),     # humo profundo
    "smoke_mid":    (58, 44, 36),     # humo medio
    "smoke_light":  (112, 92, 78),    # humo claro
    "ember":        (224, 161, 43),   # brasa ámbar (#E0A12B)
    "ember_hot":    (255, 180, 80),   # brasa caliente
    "ember_glow":   (245, 206, 122),  # resplandor
    "wood_dark":    (74, 33, 8),      # madera oscura (#4A2108)
    "wood_mid":     (122, 59, 18),    # madera media (#7A3B12)
    "wood_light":   (169, 116, 26),   # madera clara (#A9741A)
    "kraft":        (214, 184, 138),  # papel kraft
    "kraft_dark":   (180, 145, 100),  # kraft sombra
    "soot":         (18, 12, 8),      # hollín / negro cálido
    "cream":        (253, 243, 231),  # crema cálida (#FDF3E7)
}

random.seed(1987)  # Año de fundación de Temozonia


# ── Utilidades de dibujo ────────────────────────────────────
def lerp_color(c1, c2, t):
    """Interpola dos colores RGB por factor t (0→1)."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def noise(x, y, seed=0):
    """Ruido pseudoaleatorio determinista."""
    n = math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453
    return n - math.floor(n)


def smooth_noise(x, y, seed=0):
    """Ruido suavizado interpolando celdas."""
    xi, yi = int(x), int(y)
    xf, yf = x - xi, y - yi
    n00 = noise(xi, yi, seed)
    n10 = noise(xi+1, yi, seed)
    n01 = noise(xi, yi+1, seed)
    n11 = noise(xi+1, yi+1, seed)
    u = xf * xf * (3 - 2 * xf)
    v = yf * yf * (3 - 2 * yf)
    nx0 = n00 * (1-u) + n10 * u
    nx1 = n01 * (1-u) + n11 * u
    return nx0 * (1-v) + nx1 * v


def fbm(x, y, octaves=4, seed=0):
    """Fractional Brownian Motion: suma de ruidos para humo realista."""
    value, amplitude, frequency = 0.0, 1.0, 1.0
    max_amp = 0.0
    for _ in range(octaves):
        value += smooth_noise(x * frequency, y * frequency, seed) * amplitude
        max_amp += amplitude
        amplitude *= 0.5
        frequency *= 2.0
    return value / max_amp


def radial_glow(img, cx, cy, radius, color, intensity=1.0):
    """Añade un resplandor radial suave (para brasas)."""
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r in range(radius, 0, -4):
        t = 1 - (r / radius)
        alpha = int(180 * intensity * (t ** 2))
        alpha = min(255, max(0, alpha))
        c = color + (alpha,)
        gd.ellipse([cx-r, cy-r, cx+r, cy+r], fill=c)
    return Image.alpha_composite(img.convert("RGBA"), glow)


# ── 1. HERO PATTERN (humo + brasas) ─────────────────────────
def gen_smoke_hero(out_path: Path, w=1920, h=720):
    p(f"  ▸ Generando humo hero ({w}×{h})…", C.D)
    img = Image.new("RGB", (w, h), PALETTE["soot"])
    pixels = img.load()
    
    for y in range(h):
        for x in range(w):
            n1 = fbm(x * 0.004, y * 0.006, octaves=4, seed=1)
            n2 = fbm(x * 0.012, y * 0.015, octaves=3, seed=2)
            n = (n1 * 0.7 + n2 * 0.3)
            
            y_factor = 1 - (y / h) * 0.3
            brightness = n * y_factor
            
            if brightness < 0.35:
                c = lerp_color(PALETTE["soot"], PALETTE["smoke_dark"], brightness / 0.35)
            elif brightness < 0.6:
                c = lerp_color(PALETTE["smoke_dark"], PALETTE["smoke_mid"], (brightness - 0.35) / 0.25)
            else:
                c = lerp_color(PALETTE["smoke_mid"], PALETTE["smoke_light"], (brightness - 0.6) / 0.4)
            
            pixels[x, y] = c
    
    img = img.convert("RGBA")
    for _ in range(45):
        cx = random.randint(0, w)
        cy = random.randint(int(h * 0.3), h)
        radius = random.randint(80, 220)
        intensity = random.uniform(0.3, 0.9)
        color = random.choice([PALETTE["ember"], PALETTE["ember_hot"]])
        img = radial_glow(img, cx, cy, radius, color, intensity)
    
    draw = ImageDraw.Draw(img)
    for _ in range(120):
        x = random.randint(0, w)
        y = random.randint(int(h * 0.4), h)
        size = random.randint(1, 3)
        alpha = random.randint(100, 230)
        color = random.choice([
            PALETTE["ember_glow"] + (alpha,),
            PALETTE["ember_hot"] + (alpha,),
            (255, 240, 200, alpha),
        ])
        draw.ellipse([x, y, x+size, y+size], fill=color)
    
    img = img.filter(ImageFilter.GaussianBlur(radius=0.8))
    img.convert("RGB").save(str(out_path), quality=94)
    p(f"    ✓ {out_path}", C.G)


# ── 2. WOOD TILE (veta de madera) ───────────────────────────
def gen_wood_tile(out_path: Path, size=400):
    p(f"  ▸ Generando veta de madera ({size}×{size})…", C.D)
    img = Image.new("RGB", (size, size), PALETTE["wood_mid"])
    pixels = img.load()
    
    for y in range(size):
        for x in range(size):
            warp = math.sin(y * 0.08 + fbm(x * 0.02, y * 0.01, 3, 42) * 6) * 15
            grain = fbm((x + warp) * 0.05, y * 0.01, octaves=4, seed=7)
            
            cx, cy = size * 0.3, size * 0.7
            dist = math.sqrt((x - cx)**2 + (y - cy)**2)
            rings = math.sin(dist * 0.08) * 0.5 + 0.5
            
            value = grain * 0.7 + rings * 0.15 + noise(x, y, 13) * 0.15
            
            if value < 0.4:
                c = lerp_color(PALETTE["wood_dark"], PALETTE["wood_mid"], value / 0.4)
            else:
                c = lerp_color(PALETTE["wood_mid"], PALETTE["wood_light"], (value - 0.4) / 0.6)
            
            edge_factor = min(1, (min(x, y, size-x, size-y) / 40))
            c = tuple(int(v * (0.7 + 0.3 * edge_factor)) for v in c)
            pixels[x, y] = c
    
    draw = ImageDraw.Draw(img)
    for _ in range(25):
        cx, cy = random.randint(0, size), random.randint(0, size)
        radius = random.randint(8, 30)
        darkness = random.randint(20, 50)
        draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius],
                     fill=(max(0, PALETTE["wood_dark"][0] - darkness),
                           max(0, PALETTE["wood_dark"][1] - darkness),
                           max(0, PALETTE["wood_dark"][2] - darkness)))
    
    img = img.filter(ImageFilter.GaussianBlur(radius=0.4))
    img.save(str(out_path), quality=92)
    p(f"    ✓ {out_path}", C.G)


# ── 3. GRILL PATTERN (marcas de parrilla) ──────────────────
def gen_grill_pattern(out_path: Path, size=600):
    p(f"  ▸ Generando marcas de parrilla ({size}×{size})…", C.D)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    spacing = 60
    line_width = 14
    
    for i in range(-size, size * 2, spacing):
        draw.line([(i, 0), (i + size, size)], fill=PALETTE["soot"] + (200,), width=line_width)
        draw.line([(i, size), (i + size, 0)], fill=PALETTE["soot"] + (200,), width=line_width)
    
    for _ in range(40):
        x, y = random.randint(0, size), random.randint(0, size)
        r = random.randint(15, 45)
        alpha = random.randint(40, 120)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=PALETTE["soot"] + (alpha,))
    
    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    img.save(str(out_path))
    p(f"    ✓ {out_path}", C.G)


# ── 4. PROMO BANNER (humo + chispas diagonales) ────────────
def gen_promo_banner(out_path: Path, w=1600, h=500):
    p(f"  ▸ Generando banner promo ({w}×{h})…", C.D)
    img = Image.new("RGB", (w, h), PALETTE["smoke_dark"])
    draw = ImageDraw.Draw(img)
    
    for i in range(-h, w + h, 38):
        draw.line([(i, h), (i + h, 0)], fill=PALETTE["smoke_mid"], width=16)
        if (i + h) % (38 * 7) < 38:
            draw.line([(i + 8, h), (i + h + 8, 0)], fill=PALETTE["ember"], width=4)
            draw.line([(i - 8, h), (i + h - 8, 0)], fill=PALETTE["wood_dark"], width=2)
    
    for y in range(h):
        t = (h - y) / h
        if t > 0.7:
            draw.line([(0, y), (w, y)], fill=lerp_color(PALETTE["smoke_dark"], PALETTE["ember"], (t-0.7)/0.3 * 0.3))
    
    img = img.convert("RGBA")
    for _ in range(80):
        x, y = random.randint(0, w), random.randint(0, h)
        size = random.randint(2, 5)
        alpha = random.randint(150, 250)
        color = random.choice([
            PALETTE["ember_glow"] + (alpha,),
            PALETTE["ember_hot"] + (alpha,),
            (255, 250, 220, alpha),
        ])
        draw = ImageDraw.Draw(img)
        draw.ellipse([x, y, x+size, y+size], fill=color)
    
    img = radial_glow(img, 0, h, 400, PALETTE["ember"], 0.6)
    img = radial_glow(img, w, 0, 350, PALETTE["ember_hot"], 0.4)
    
    img.convert("RGB").save(str(out_path), quality=94)
    p(f"    ✓ {out_path}", C.G)


# ── 5. KRAFT PAPER (papel para receipts) ────────────────────
def gen_kraft_paper(out_path: Path, size=600):
    p(f"  ▸ Generando papel kraft ({size}×{size})…", C.D)
    img = Image.new("RGB", (size, size), PALETTE["kraft"])
    pixels = img.load()
    
    for y in range(size):
        for x in range(size):
            fiber = fbm(x * 0.08, y * 0.02, octaves=3, seed=99)
            speckle = noise(x, y, 77) * 0.3
            value = fiber * 0.7 + speckle
            
            if value < 0.5:
                c = lerp_color(PALETTE["kraft_dark"], PALETTE["kraft"], value / 0.5)
            else:
                c = lerp_color(PALETTE["kraft"], PALETTE["cream"], (value - 0.5) / 0.5)
            
            if random.random() < 0.02:
                delta = random.randint(-15, 15)
                c = tuple(max(0, min(255, v + delta)) for v in c)
            
            pixels[x, y] = c
    
    draw = ImageDraw.Draw(img)
    for _ in range(15):
        x, y = random.randint(0, size), random.randint(0, size)
        r = random.randint(20, 60)
        alpha_factor = random.uniform(0.85, 0.95)
        draw.ellipse([x-r, y-r, x+r, y+r],
                     fill=tuple(int(v * alpha_factor) for v in PALETTE["kraft_dark"]))
    
    img.save(str(out_path), quality=90)
    p(f"    ✓ {out_path}", C.G)


# ── 6. LOGO (T + herradura + humo) ──────────────────────────
def gen_logo(out_path: Path, size=512):
    p(f"  ▸ Generando logo ({size}×{size})…", C.D)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], fill=PALETTE["wood_dark"])
    
    ring_width = size // 24
    draw.ellipse([margin, margin, size-margin, size-margin], outline=PALETTE["ember"], width=ring_width)
    draw.ellipse([margin + ring_width*2, margin + ring_width*2,
                  size-margin-ring_width*2, size-margin-ring_width*2],
                 outline=PALETTE["wood_light"], width=2)
    
    center_x, center_y = size // 2, size // 2
    t_width = size // 2
    t_height = int(size / 2.5)
    
    bar_y = int(center_y - t_height / 3)
    draw.rounded_rectangle(
        [center_x - t_width//2, bar_y - t_height//10,
         center_x + t_width//2, bar_y + t_height//10],
        radius=int(t_height / 12),
        fill=PALETTE["ember"]
    )
    
    stem_width = int(t_height / 6)
    draw.rounded_rectangle(
        [center_x - stem_width//2, bar_y,
         center_x + stem_width//2, center_y + t_height//2],
        radius=int(stem_width / 3),
        fill=PALETTE["ember"]
    )
    
    hook_r = int(t_height / 4)
    draw.arc(
        [center_x - t_width//2 - hook_r//2, bar_y - hook_r//2,
         center_x - t_width//2 + int(hook_r*1.5), bar_y + int(hook_r*1.5)],
        start=90, end=270, fill=PALETTE["ember"], width=stem_width
    )
    draw.arc(
        [center_x + t_width//2 - int(hook_r*1.5), bar_y - hook_r//2,
         center_x + t_width//2 + hook_r//2, bar_y + int(hook_r*1.5)],
        start=270, end=90, fill=PALETTE["ember"], width=stem_width
    )
    
    smoke_base_y = int(bar_y - t_height / 8)
    for offset, scale in [(-30, 0.9), (0, 1.1), (30, 0.85)]:
        cx = center_x + offset
        for i in range(12):
            cy = smoke_base_y - i * 6
            r = int(14 * scale * (1 - i/14))
            if r < 2: continue
            alpha = int(180 * (1 - i/14))
            cx_offset = cx + math.sin(i * 0.8) * 8
            overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
            od = ImageDraw.Draw(overlay)
            od.ellipse([cx_offset-r, cy-r, cx_offset+r, cy+r],
                      fill=PALETTE["smoke_light"] + (alpha,))
            img = Image.alpha_composite(img, overlay)
    
    spark_r = size // 40
    draw = ImageDraw.Draw(img)
    draw.ellipse(
        [center_x - spark_r, bar_y - spark_r - t_height//5,
         center_x + spark_r, bar_y + spark_r - t_height//5],
        fill=PALETTE["ember_hot"]
    )
    
    img.save(str(out_path))
    p(f"    ✓ {out_path}", C.G)


# ── Genera todos los assets ─────────────────────────────────
def forge_all(out_dir: Path):
    header("🔥  SMOKE & AMBER FORGE · Assets Temozonia")
    p(f"  Directorio destino: {out_dir.resolve()}", C.D)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    gen_smoke_hero(out_dir / "smoke_hero.png")
    gen_wood_tile(out_dir / "wood_tile.png")
    gen_grill_pattern(out_dir / "grill_pattern.png")
    gen_promo_banner(out_dir / "promo_banner.png")
    gen_kraft_paper(out_dir / "kraft_paper.png")
    gen_logo(out_dir / "temozonia_logo.png")
    
    header("📦  Assets generados")
    total_size = 0
    for f in sorted(out_dir.glob("*.png")):
        size_kb = f.stat().st_size / 1024
        total_size += size_kb
        p(f"  • {f.name:<25} {size_kb:>7.1f} KB", C.G)
    p(f"\n  Total: {total_size:.1f} KB en {len(list(out_dir.glob('*.png')))} archivos", C.BOLD)


def print_integration_guide():
    header("🎨  Guía de integración CSS (Astro / Tailwind)")
    p("""
  Usa estos fondos en Temozonia:

  .temozonia-hero {
    background: url('/images/temozonia/smoke_hero.png') center/cover;
  }

  .temozonia-wood-bg {
    background: url('/images/temozonia/wood_tile.png') repeat;
  }

  .temozonia-grill {
    background: url('/images/temozonia/grill_pattern.png') repeat;
    opacity: 0.15;
  }

  .temozonia-promo {
    background: url('/images/temozonia/promo_banner.png') center/cover;
  }

  .temozonia-receipt {
    background: url('/images/temozonia/kraft_paper.png') repeat;
  }
""", C.Y)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Smoke & Amber Forge · Generador de Assets para Temozonia")
    parser.add_argument("--out", type=str, default="public/images/temozonia", help="Directorio destino (default: public/images/temozonia)")
    args = parser.parse_args()

    try:
        dest = Path(args.out)
        forge_all(dest)
        print_integration_guide()
        p("\n  🎉 ¡Listo! Assets generados directamente en /public para Astro.\n", C.G + C.BOLD)
    except KeyboardInterrupt:
        p("\n  Cancelado por el usuario.", C.Y)
        sys.exit(1)
