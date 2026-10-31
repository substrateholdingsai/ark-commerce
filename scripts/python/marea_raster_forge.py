#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MAREA — Capa Raster SEO / Social / PWA · Tienda de Playeras Personalizadas
Pillow justificado: crawlers de WhatsApp/FB/LinkedIn/X no rasterizan SVG.
Supersampling 4× + downscale LANCZOS. Fallback tipográfico en cascada que nunca truena.
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
from datetime import datetime, timezone
from html import escape
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ Pillow requerido para la capa raster.\nInstala con: python -m pip install Pillow")
    raise SystemExit(1)

SCALE = 4

# ── Paleta MAREA RGB ──
ARENA      = (255, 249, 240)
ARENA_2    = (254, 243, 226)
BLANCO     = (255, 255, 255)
ARENA_B    = (240, 229, 208)
TEAL       = (14, 169, 168)
TEAL_DK    = (8, 127, 126)
TEAL_HI    = (63, 212, 210)
CORAL      = (233, 78, 73)
CORAL_DK   = (197, 55, 50)
CORAL_HI   = (255, 123, 118)
MANGO      = (255, 185, 71)
MANGO_DK   = (201, 143, 31)
SELVA      = (47, 160, 96)
SELVA_DK   = (31, 122, 69)
LAVANDA    = (139, 111, 201)
TINTA      = (26, 59, 56)
TINTA_2    = (61, 92, 88)
NOCHE      = (15, 46, 44)
BRUMA      = (184, 212, 209)

FONT_CANDIDATES = {
    "display": [
        "/usr/share/fonts/truetype/baloo/Baloo2-Bold.ttf",
        "/usr/share/fonts/truetype/nunito/Nunito-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arialbd.ttf",
    ],
    "body": [
        "/usr/share/fonts/truetype/nunito/Nunito-SemiBold.ttf",
        "/usr/share/fonts/truetype/nunito/Nunito-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arial.ttf",
    ],
    "mono": [
        "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/cour.ttf",
    ],
}


def ss(v): return int(round(v * SCALE))
def ensure_dir(p: Path) -> Path: p.mkdir(parents=True, exist_ok=True); return p
def kb(path: Path) -> float: return round(path.stat().st_size / 1024, 2)


def load_font(kind, size):
    size = max(1, int(size))
    for fp in FONT_CANDIDATES.get(kind, []):
        try:
            return ImageFont.truetype(fp, size)
        except Exception:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    try:
        if outline is None:
            draw.rounded_rectangle(box, radius=radius, fill=fill)
        else:
            draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=max(1, width))
    except AttributeError:
        draw.rectangle(box, fill=fill, outline=outline, width=max(1, width))


def text_length(draw, text, font):
    try:
        return draw.textlength(text, font=font)
    except AttributeError:
        return draw.textsize(text, font=font)[0]


def text_bbox(draw, text, font):
    try:
        return draw.textbbox((0, 0), text, font=font)
    except AttributeError:
        w, h = draw.textsize(text, font=font)
        return (0, 0, w, h)


def draw_motivo(draw, cx, cy, size):
    """Monograma MAREA: sol coral + ola teal + triángulos mango."""
    s = size

    # Sol
    sun_y = int(cy - s * 0.35)
    sun_r = int(s * 0.18)
    draw.ellipse([cx - sun_r, sun_y - sun_r, cx + sun_r, sun_y + sun_r], fill=CORAL)
    halo_r = int(s * 0.24)
    draw.ellipse([cx - halo_r, sun_y - halo_r, cx + halo_r, sun_y + halo_r],
                 outline=CORAL, width=max(1, int(s * 0.02)))

    # Ola principal
    wave_y = int(cy + s * 0.1)
    wave_amp = s * 0.25
    points = []
    for i in range(50):
        t = i / 49.0
        x = cx - s * 0.45 + t * s * 0.9
        y = wave_y - wave_amp * math.sin(t * math.pi * 2)
        points.append((x, y))
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=TEAL, width=max(2, int(s * 0.05)))

    # Ola secundaria
    wave2_y = int(wave_y + s * 0.12)
    points2 = []
    for i in range(40):
        t = i / 39.0
        x = cx - s * 0.38 + t * s * 0.76
        y = wave2_y - (s * 0.15) * math.sin(t * math.pi * 2)
        points2.append((x, y))
    for i in range(len(points2) - 1):
        draw.line([points2[i], points2[i + 1]], fill=TEAL_DK, width=max(1, int(s * 0.035)))

    # Triángulos mango
    tri_y = int(cy + s * 0.32)
    for offset in [-0.3, -0.1, 0.1, 0.3]:
        x = cx + offset * s
        draw.polygon([
            (x - s * 0.08, tri_y),
            (x, tri_y + s * 0.14),
            (x + s * 0.08, tri_y)
        ], fill=MANGO)


def draw_monogram(draw, x, y, size):
    """Monograma circular MAREA."""
    r = size / 2
    cx, cy = x + r, y + r
    draw.ellipse([x, y, x + size, y + size], fill=ARENA, outline=ARENA_B, width=max(1, ss(1)))
    draw_motivo(draw, cx, cy + size * 0.02, size * 0.92)


def make_og(domain_text="marea.mx"):
    width, height = ss(1200), ss(630)
    # fondo gradiente arena
    img = Image.new("RGB", (width, height), ARENA)
    draw = ImageDraw.Draw(img)
    for i in range(height):
        t = i / height
        c = tuple(int(ARENA[k] + (ARENA_2[k] - ARENA[k]) * t) for k in range(3))
        draw.line([(0, i), (width, i)], fill=c)

    # textura sutil
    try:
        noise = Image.effect_noise((max(1, width // 8), max(1, height // 8)), 20).convert("L")
        noise = noise.resize((width, height), Image.LANCZOS)
        overlay = Image.new("RGBA", (width, height), (*MANGO, 0))
        overlay.putalpha(noise.point(lambda p: int(p * 0.05)))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)
    except Exception:
        pass

    # marco
    draw.rectangle([ss(40), ss(40), ss(1160), ss(590)], outline=ARENA_B, width=max(1, ss(1)))

    # monograma
    draw_monogram(draw, ss(120), ss(160), ss(240))

    # tipografía
    f_title = load_font("display", ss(110))
    f_sub = load_font("body", ss(26))
    f_tag = load_font("body", ss(20))
    f_kpi_label = load_font("body", ss(10))
    f_kpi_value = load_font("display", ss(28))
    f_mono = load_font("mono", ss(11))

    draw.text((ss(420), ss(190)), "MAREA", font=f_title, fill=TINTA)
    draw.text((ss(422), ss(300)), "PLAYERAS PERSONALIZADAS", font=f_sub, fill=TEAL_DK)
    draw.line([ss(420), ss(330), ss(900), ss(330)], fill=ARENA_B, width=max(1, ss(1)))
    draw.text((ss(422), ss(360)), "Diseña tu ola · Sureste Mexicano", font=f_tag, fill=TINTA_2)

    # KPIs
    kpis = [("DISEÑOS", "340+"), ("TALLAS", "S–XXL"), ("ENVÍO", "24–48h")]
    kx = ss(420)
    for label, value in kpis:
        rounded_rect(draw, [kx, ss(410), kx + ss(200), ss(490)], ss(16), fill=BLANCO, outline=ARENA_B, width=max(1, ss(1)))
        draw.text((kx + ss(16), ss(424)), label, font=f_kpi_label, fill=TINTA_2)
        draw.text((kx + ss(16), ss(450)), value, font=f_kpi_value, fill=TINTA if "h" not in value else CORAL)
        kx += ss(220)

    # olas decorativas laterales
    for i, y_off in enumerate([150, 180, 210]):
        y = ss(y_off)
        amp = ss(10 + i * 4)
        points = []
        for j in range(30):
            t = j / 29.0
            x = ss(1040) + t * ss(100)
            yy = y - amp * math.sin(t * math.pi * 2)
            points.append((x, yy))
        color = [TEAL, TEAL_DK, MANGO][i]
        for j in range(len(points) - 1):
            draw.line([points[j], points[j + 1]], fill=color, width=max(1, ss(2)))

    # watermark
    draw.text((ss(1160), ss(575)), domain_text, font=f_mono, fill=TINTA_2, anchor="ra")

    return img.resize((1200, 630), Image.LANCZOS)


def make_icon(size, maskable=False):
    canvas = ss(size)
    img = Image.new("RGB", (canvas, canvas), TEAL)
    draw = ImageDraw.Draw(img)

    if not maskable:
        radius = max(2, int(round(14 * size / 64 * SCALE)))
        rounded_rect(draw, [0, 0, canvas - 1, canvas - 1], radius, fill=TEAL)

    ratio = 0.72 if maskable else 0.85
    mark_size = int(canvas * ratio)
    x = (canvas - mark_size) // 2
    y = (canvas - mark_size) // 2

    if size <= 32:
        # versión simplificada: sol + ola
        sun_r = int(mark_size * 0.12)
        sun_y = y + int(mark_size * 0.25)
        cx = canvas // 2
        draw.ellipse([cx - sun_r, sun_y - sun_r, cx + sun_r, sun_y + sun_r], fill=CORAL)
        wave_y = y + int(mark_size * 0.6)
        prev_x, prev_y = None, None
        for i in range(20):
            t = i / 19.0
            xx = x + int(mark_size * 0.2) + t * mark_size * 0.6
            yy = wave_y - int(mark_size * 0.1 * math.sin(t * math.pi * 2))
            if prev_x is not None:
                draw.line([(prev_x, prev_y), (xx, yy)], fill=BLANCO, width=max(1, ss(2)))
            prev_x, prev_y = xx, yy
    else:
        draw_monogram(draw, x, y, mark_size)

    return img.resize((size, size), Image.LANCZOS)


def draw_pill(draw, x, y, text, font, fill=None, outline=None, text_fill=TINTA, pad_x=18):
    px = ss(pad_x)
    h = ss(44)
    tw = int(text_length(draw, text, font))
    bbox = text_bbox(draw, text, font)
    th = bbox[3] - bbox[1]
    box = [x, y, x + tw + 2 * px, y + h]
    rounded_rect(draw, box, h // 2, fill=fill if fill is not None else BLANCO,
                 outline=outline, width=max(1, ss(1.5)) if outline else 0)
    draw.text((x + px, y + (h - th) // 2 - bbox[1]), text, font=font, fill=text_fill)
    return x + tw + 2 * px


def wrap_lines(draw, text, font, max_width, max_lines=3):
    words, lines, current = text.split(), [], ""
    for w in words:
        test = (current + " " + w).strip()
        if text_length(draw, test, font) <= max_width:
            current = test
        else:
            if current:
                lines.append(current); current = w
            else:
                lines.append(w); current = ""
            if len(lines) == max_lines:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) == max_lines and " ".join(lines) != text:
        last = lines[-1]
        while last and text_length(draw, last + "…", font) > max_width:
            last = last[:-1]
        lines[-1] = last + "…"
    return lines


def make_alert_card(args):
    """Tarjeta de oferta / lanzamiento."""
    width, height = ss(1200), ss(630)
    # fondo gradiente mango (oferta)
    img = Image.new("RGB", (width, height), ARENA)
    draw = ImageDraw.Draw(img)
    for i in range(height):
        t = i / height
        c = tuple(int(ARENA[k] + (MANGO[k] - ARENA[k]) * t * 0.4) for k in range(3))
        draw.line([(0, i), (width, i)], fill=c)

    # marco
    draw.rectangle([ss(40), ss(40), ss(1160), ss(590)], outline=ARENA_B, width=max(1, ss(1)))

    # banda coral superior (oferta)
    draw.rectangle([ss(40), ss(40), ss(1160), ss(80)], fill=CORAL)
    f_status = load_font("mono", ss(14))
    draw.text((ss(70), ss(52)), "🌊 OFERTA ESPECIAL", font=f_status, fill=BLANCO)
    draw.text((ss(1140), ss(52)), args.folio, font=f_status, fill=ARENA, anchor="ra")

    # monograma
    draw_monogram(draw, ss(100), ss(140), ss(200))

    # titular
    f_title = load_font("display", ss(58))
    lines = wrap_lines(draw, args.title, f_title, ss(820), max_lines=3)
    ty = ss(160)
    for line in lines:
        draw.text((ss(360), ty), line, font=f_title, fill=TINTA)
        ty += ss(70)

    # pills
    f_pill = load_font("mono", ss(16))
    x = ss(360)
    y = ss(400)
    pills = [("NUEVO DISEÑO", TEAL_DK), ("EDICIÓN LIMITADA", CORAL_DK), ("-20%", MANGO_DK)]
    for label, color in pills:
        x = draw_pill(draw, x, y, label, f_pill, outline=ARENA_B, text_fill=color)
        x += ss(14)

    # footer
    f_mono = load_font("mono", ss(18))
    draw.line([ss(360), ss(480), ss(980), ss(480)], fill=ARENA_B, width=max(1, ss(1)))
    draw.text((ss(360), ss(510)), f"{args.channel} · {args.date}", font=f_mono, fill=TINTA_2)

    # watermark
    f_wm = load_font("display", ss(38))
    draw.text((ss(1160), ss(555)), "MAREA", font=f_wm, fill=ARENA_B, anchor="ra")

    return img.resize((1200, 630), Image.LANCZOS)


def absolute_url(domain, base_path, filename):
    base = base_path.strip("/")
    domain = domain.rstrip("/")
    return f"{domain}/{base}/{filename}" if base else f"{domain}/{filename}"


def write_metadata(args, out_dir):
    if not args.web_root:
        return []
    web_root = ensure_dir(Path(args.web_root))
    written = []

    manifest = {
        "name": args.name,
        "short_name": args.short_name,
        "start_url": args.start_url,
        "scope": "/",
        "display": "standalone",
        "background_color": "#FFF9F0",
        "theme_color": "#0EA9A8",
        "icons": [
            {"src": absolute_url(args.domain, args.base_path, "android-chrome-192.png"),
             "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
            {"src": absolute_url(args.domain, args.base_path, "android-chrome-512.png"),
             "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
            {"src": absolute_url(args.domain, args.base_path, "apple-touch-icon.png"),
             "sizes": "180x180", "type": "image/png"},
        ],
    }
    p = web_root / "site.webmanifest"
    p.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    written.append(p)

    robots = "User-agent: *\nDisallow: /api/v1/\nDisallow: /checkout/\nDisallow: /admin/\n"
    if args.sitemap:
        robots += f"Sitemap: {args.sitemap}\n"
    p = web_root / "robots.txt"
    p.write_text(robots, encoding="utf-8")
    written.append(p)

    canonical = args.domain.rstrip("/") + "/"
    og = absolute_url(args.domain, args.base_path, "og-image.png")
    tw = absolute_url(args.domain, args.base_path, "twitter-card.png")
    f32 = absolute_url(args.domain, args.base_path, "favicon-32.png")
    f16 = absolute_url(args.domain, args.base_path, "favicon-16.png")
    ap = absolute_url(args.domain, args.base_path, "apple-touch-icon.png")
    man = args.domain.rstrip("/") + "/site.webmanifest"

    svg_link = ""
    if args.svg_favicon:
        svg_link = f'<link rel="icon" type="image/svg+xml" href="{escape(args.svg_favicon)}">\n'

    meta_html = f"""<!-- MAREA · Playeras Personalizadas — meta generado -->
<meta name="theme-color" content="#0EA9A8">
<link rel="manifest" href="{escape(man)}">
{svg_link}<link rel="icon" type="image/png" sizes="32x32" href="{escape(f32)}">
<link rel="icon" type="image/png" sizes="16x16" href="{escape(f16)}">
<link rel="apple-touch-icon" sizes="180x180" href="{escape(ap)}">
<link rel="canonical" href="{escape(canonical)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="{escape(args.short_name)}">
<meta property="og:title" content="{escape(args.name)}">
<meta property="og:description" content="{escape(args.description)}">
<meta property="og:url" content="{escape(canonical)}">
<meta property="og:image" content="{escape(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="MAREA — Playeras Personalizadas del Caribe Mexicano">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(args.name)}">
<meta name="twitter:description" content="{escape(args.description)}">
<meta name="twitter:image" content="{escape(tw)}">
<meta name="twitter:image:alt" content="MAREA — Playeras Personalizadas del Caribe Mexicano">
"""
    p = web_root / "meta-tags.html"
    p.write_text(meta_html, encoding="utf-8")
    written.append(p)
    return written


def print_summary(paths, title):
    print(f"\n🌊 {title}")
    print("─" * 58)
    total = 0
    for p in paths:
        s = p.stat().st_size
        total += s
        print(f"{p.name:<32} {s / 1024:>8.2f} KB")
    print("─" * 58)
    print(f"{'TOTAL':<32} {total / 1024:>8.2f} KB")
    print("✅ Capa raster lista. Supersampling 4× + LANCZOS.\n")


def run_static(args):
    out_dir = ensure_dir(Path(args.out))

    og = make_og(args.domain.split("//")[-1].rstrip("/"))
    og_p = out_dir / "og-image.png"; og.save(og_p, format="PNG", optimize=True)
    tw_p = out_dir / "twitter-card.png"; og.copy().save(tw_p, format="PNG", optimize=True)

    make_icon(180, False).save(out_dir / "apple-touch-icon.png", "PNG", optimize=True)
    make_icon(32, False).save(out_dir / "favicon-32.png", "PNG", optimize=True)
    make_icon(16, False).save(out_dir / "favicon-16.png", "PNG", optimize=True)
    make_icon(192, True).save(out_dir / "android-chrome-192.png", "PNG", optimize=True)
    make_icon(512, True).save(out_dir / "android-chrome-512.png", "PNG", optimize=True)

    ico = make_icon(48, False)
    ico.save(out_dir / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    paths = [
        out_dir / "og-image.png", out_dir / "twitter-card.png",
        out_dir / "apple-touch-icon.png", out_dir / "favicon-32.png",
        out_dir / "favicon-16.png", out_dir / "android-chrome-192.png",
        out_dir / "android-chrome-512.png", out_dir / "favicon.ico",
    ]
    paths.extend(write_metadata(args, out_dir))
    print_summary(paths, "MAREA — Static SEO / Social / PWA")


def run_alert(args):
    if not args.date:
        args.date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    out_path = Path(args.out)
    if out_path.suffix.lower() == ".png":
        ensure_dir(out_path.parent); target = out_path
    else:
        ensure_dir(out_path); target = out_path / "oferta-card.png"
    card = make_alert_card(args)
    card.save(target, format="PNG", optimize=True)
    print_summary([target], f"MAREA — Oferta Card · {args.channel}")


def main():
    ap = argparse.ArgumentParser(
        description="MAREA raster forge — OG, Twitter, favicons, PWA y tarjetas de oferta."
    )
    ap.add_argument("--out", default="public/images/marea/seo")
    ap.add_argument("--web-root", default=None)
    ap.add_argument("--domain", default="https://marea.mx")
    ap.add_argument("--name", default="MAREA · Playeras Personalizadas")
    ap.add_argument("--short-name", default="MAREA")
    ap.add_argument("--description",
        default="Playeras personalizadas del Caribe mexicano. Diseña tu ola: sube tu diseño, elige tu talla, y la hacemos realidad.")
    ap.add_argument("--base-path", default="/images/marea/seo")
    ap.add_argument("--start-url", default="/")
    ap.add_argument("--sitemap", default="")
    ap.add_argument("--svg-favicon", default="/images/marea/favicon.svg")

    ap.add_argument("--alert", action="store_true", help="Genera tarjeta de oferta / lanzamiento")
    ap.add_argument("--channel", default="Oferta")
    ap.add_argument("--severity", default="info")
    ap.add_argument("--title", default="Nueva colección 'Ola Nocturna' · Edición limitada · -20%")
    ap.add_argument("--date", default="")
    ap.add_argument("--folio", default="MAREA-2026-000000")

    args = ap.parse_args()
    if args.alert:
        run_alert(args)
    else:
        run_static(args)


if __name__ == "__main__":
    main()
