#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_marea_assets.py
Genera los assets visuales (PNG) para MAREA:
- 8 diseños en public/images/marea/designs/
- 5 prendas base en public/images/marea/
Supersampling 2x + LANCZOS para acabado ultra nítido.
"""

import os
import sys
import math
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PUBLIC_DIR = BASE_DIR / "public" / "images" / "marea"
DESIGNS_DIR = PUBLIC_DIR / "designs"

PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
DESIGNS_DIR.mkdir(parents=True, exist_ok=True)

# Paleta Marea
ARENA = (255, 249, 240)
ARENA_2 = (254, 243, 226)
BLANCO = (255, 255, 255)
ARENA_B = (240, 229, 208)
TEAL = (14, 169, 168)
TEAL_DK = (8, 127, 126)
TEAL_HI = (63, 212, 210)
CORAL = (233, 78, 73)
CORAL_DK = (197, 55, 50)
CORAL_HI = (255, 123, 118)
MANGO = (255, 185, 71)
MANGO_DK = (201, 143, 31)
SELVA = (47, 160, 96)
SELVA_DK = (31, 122, 69)
LAVANDA = (139, 111, 201)
TINTA = (26, 59, 56)
TINTA_2 = (61, 92, 88)
NOCHE = (15, 46, 44)
BRUMA = (184, 212, 209)

def get_font(size, bold=True):
    font_paths = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_wave(draw, cx, cy, width, height, stroke_color, stroke_width=8, points_count=60):
    points = []
    for i in range(points_count):
        t = i / (points_count - 1)
        x = cx - width / 2 + t * width
        y = cy + math.sin(t * math.pi * 2) * (height / 2)
        points.append((x, y))
    for i in range(len(points) - 1):
        draw.line([points[i], points[i+1]], fill=stroke_color, width=stroke_width)

# ----------------- GENERADOR DE DISEÑOS -----------------

def generate_design_ola_nocturna():
    S = 1200
    img = Image.new("RGBA", (S, S), (*NOCHE, 255))
    d = ImageDraw.Draw(img)
    
    # Fondo con gradiente circular sutil
    d.ellipse([S*0.2, S*0.2, S*0.8, S*0.8], fill=(*TINTA, 255))
    
    # Estrellas de fondo
    star_positions = [(200, 180), (350, 120), (850, 160), (1020, 220), (280, 320), (920, 340)]
    for sx, sy in star_positions:
        d.ellipse([sx-4, sy-4, sx+4, sy+4], fill=(*MANGO, 220))
        d.ellipse([sx-10, sy-1, sx+10, sy+1], fill=(*MANGO, 160))
        d.ellipse([sx-1, sy-10, sx+1, sy+10], fill=(*MANGO, 160))
        
    # Luna creciente
    d.ellipse([S*0.7, S*0.18, S*0.84, S*0.32], fill=(*MANGO, 255))
    d.ellipse([S*0.68, S*0.16, S*0.81, S*0.30], fill=(*NOCHE, 255))
    
    # Olas dinámicas
    draw_wave(d, S*0.5, S*0.55, S*0.75, 140, TEAL_DK, stroke_width=24)
    draw_wave(d, S*0.5, S*0.62, S*0.75, 120, TEAL, stroke_width=20)
    draw_wave(d, S*0.5, S*0.69, S*0.70, 100, TEAL_HI, stroke_width=16)
    draw_wave(d, S*0.5, S*0.75, S*0.65, 80, BLANCO, stroke_width=12)
    
    # Texto
    font = get_font(52, bold=True)
    d.text((S*0.5, S*0.88), "OLA NOCTURNA", font=font, fill=(*ARENA, 255), anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_sol_de_tulum():
    S = 1200
    img = Image.new("RGBA", (S, S), (*ARENA, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.48
    
    # Rayos de sol
    ray_count = 16
    for i in range(ray_count):
        ang = (i / ray_count) * 2 * math.pi
        r1, r2 = S*0.28, S*0.38
        x1 = cx + math.cos(ang) * r1
        y1 = cy + math.sin(ang) * r1
        x2 = cx + math.cos(ang) * r2
        y2 = cy + math.sin(ang) * r2
        d.line([(x1, y1), (x2, y2)], fill=CORAL, width=16)
        
    # Sol principal
    d.ellipse([cx - S*0.22, cy - S*0.22, cx + S*0.22, cy + S*0.22], fill=CORAL)
    d.ellipse([cx - S*0.17, cy - S*0.17, cx + S*0.17, cy + S*0.17], fill=MANGO)
    
    # Olas en base
    draw_wave(d, cx, S*0.75, S*0.7, 90, TEAL, stroke_width=18)
    draw_wave(d, cx, S*0.81, S*0.65, 80, TEAL_DK, stroke_width=14)
    
    font = get_font(56, bold=True)
    d.text((cx, S*0.90), "SOL DE TULUM", font=font, fill=TINTA, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_espiritu_selva():
    S = 1200
    img = Image.new("RGBA", (S, S), (*TINTA, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.46
    # Disco sol al atardecer
    d.ellipse([cx - S*0.26, cy - S*0.26, cx + S*0.26, cy + S*0.26], fill=MANGO)
    
    # Palmera / ramas de la selva
    d.line([(cx, S*0.75), (cx - 30, cy + 60)], fill=SELVA_DK, width=28)
    
    # Hojas tropicales curvadas
    hojas = [(-160, -80, SELVA), (160, -90, SELVA), (-220, 10, SELVA_DK), (210, 20, SELVA_DK), (-100, -180, SELVA), (100, -170, SELVA)]
    for dx, dy, col in hojas:
        d.line([(cx - 30, cy + 60), (cx + dx, cy + dy)], fill=col, width=22)
        d.ellipse([cx + dx - 20, cy + dy - 20, cx + dx + 20, cy + dy + 20], fill=col)
        
    font = get_font(52, bold=True)
    d.text((cx, S*0.88), "ESPÍRITU SELVA", font=font, fill=ARENA, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_marea_tricolor():
    S = 1200
    img = Image.new("RGBA", (S, S), (*NOCHE, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.48
    # Patrón de triángulos / olas tricolor
    draw_wave(d, cx, S*0.38, S*0.75, 120, CORAL, stroke_width=24)
    draw_wave(d, cx, S*0.50, S*0.75, 120, MANGO, stroke_width=24)
    draw_wave(d, cx, S*0.62, S*0.75, 120, TEAL, stroke_width=24)
    
    # Triángulos geométricos
    for offset in [-S*0.25, 0, S*0.25]:
        tx = cx + offset
        d.polygon([(tx - 40, S*0.72), (tx, S*0.64), (tx + 40, S*0.72)], fill=BLANCO)
        
    font = get_font(54, bold=True)
    d.text((cx, S*0.88), "MAREA TRICOLOR", font=font, fill=ARENA, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_coral_vivo():
    S = 1200
    img = Image.new("RGBA", (S, S), (*ARENA_2, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.45
    # Círculo base coral
    d.ellipse([cx - S*0.3, cy - S*0.3, cx + S*0.3, cy + S*0.3], fill=(*CORAL, 40))
    
    # Ramas coralinas
    branches = [
        (cx, cy + 180, cx, cy - 80, CORAL_DK, 26),
        (cx, cy - 30, cx - 120, cy - 180, CORAL, 20),
        (cx, cy - 30, cx + 130, cy - 170, CORAL, 20),
        (cx - 60, cy - 110, cx - 180, cy - 140, CORAL_HI, 16),
        (cx + 60, cy - 100, cx + 190, cy - 120, CORAL_HI, 16),
        (cx, cy - 80, cx, cy - 220, CORAL_HI, 18),
    ]
    for x1, y1, x2, y2, c, w in branches:
        d.line([(x1, y1), (x2, y2)], fill=c, width=w)
        d.ellipse([x2 - w//2 - 4, y2 - w//2 - 4, x2 + w//2 + 4, y2 + w//2 + 4], fill=c)
        
    font = get_font(54, bold=True)
    d.text((cx, S*0.88), "CORAL VIVO", font=font, fill=TINTA, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_mango_beach():
    S = 1200
    img = Image.new("RGBA", (S, S), (*ARENA, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.44
    d.ellipse([cx - S*0.3, cy - S*0.3, cx + S*0.3, cy + S*0.3], fill=MANGO)
    
    font_large = get_font(84, bold=True)
    d.text((cx, cy), "MANGO", font=font_large, fill=TINTA, anchor="mm")
    
    draw_wave(d, cx, S*0.66, S*0.7, 100, TEAL, stroke_width=20)
    draw_wave(d, cx, S*0.73, S*0.65, 80, CORAL, stroke_width=16)
    
    font_sub = get_font(48, bold=True)
    d.text((cx, S*0.88), "BEACH CLUB", font=font_sub, fill=TINTA_2, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_mascara_marina():
    S = 1200
    img = Image.new("RGBA", (S, S), (*TINTA, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.46
    # Silueta de máscara
    d.ellipse([cx - S*0.24, cy - S*0.32, cx + S*0.24, cy + S*0.32], fill=(*LAVANDA, 80), outline=LAVANDA, width=12)
    
    # Ojos y detalles mayas / marinos
    d.ellipse([cx - 90, cy - 60, cx - 30, cy - 20], fill=TEAL_HI)
    d.ellipse([cx + 30, cy - 60, cx + 90, cy - 20], fill=TEAL_HI)
    d.ellipse([cx - 70, cy - 50, cx - 50, cy - 30], fill=NOCHE)
    d.ellipse([cx + 50, cy - 50, cx + 70, cy - 30], fill=NOCHE)
    
    # Nariz y boca
    d.line([(cx, cy - 10), (cx, cy + 80)], fill=MANGO, width=12)
    d.arc([cx - 60, cy + 90, cx + 60, cy + 150], start=0, end=180, fill=CORAL, width=14)
    
    font = get_font(52, bold=True)
    d.text((cx, S*0.88), "MÁSCARA MARINA", font=font, fill=ARENA, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def generate_design_ola_espuma():
    S = 1200
    img = Image.new("RGBA", (S, S), (*ARENA_2, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.48
    d.ellipse([cx - S*0.32, cy - S*0.32, cx + S*0.32, cy + S*0.32], fill=(*TEAL_HI, 50))
    
    draw_wave(d, cx, S*0.40, S*0.75, 140, TEAL_DK, stroke_width=24)
    draw_wave(d, cx, S*0.48, S*0.75, 120, TEAL, stroke_width=22)
    draw_wave(d, cx, S*0.56, S*0.70, 100, TEAL_HI, stroke_width=18)
    draw_wave(d, cx, S*0.64, S*0.65, 80, BLANCO, stroke_width=16)
    
    # Gotas de espuma
    foams = [(cx-180, S*0.32), (cx-40, S*0.28), (cx+120, S*0.36), (cx-100, S*0.38), (cx+60, S*0.32)]
    for fx, fy in foams:
        d.ellipse([fx-16, fy-16, fx+16, fy+16], fill=BLANCO)
        
    font = get_font(54, bold=True)
    d.text((cx, S*0.88), "OLA ESPUMA", font=font, fill=TINTA, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)


# ----------------- GENERADOR DE PRENDAS (MOCKUPS BASE) -----------------

def draw_tshirt_silhouette(draw, cx, cy, fill_color, stroke_color, is_dryfit=False, is_polo=False, is_hoodie=False):
    """Dibuja una silueta limpia y profesional de prenda textil."""
    if is_hoodie:
        # Capucha
        draw.ellipse([cx - 110, cy - 240, cx + 110, cy - 80], fill=fill_color, outline=stroke_color, width=4)
        # Cordones
        draw.line([(cx - 30, cy - 100), (cx - 35, cy + 20)], fill=(220, 220, 220), width=5)
        draw.line([(cx + 30, cy - 100), (cx + 35, cy + 20)], fill=(220, 220, 220), width=5)
    
    # Cuello y hombros
    body_pts = [
        (cx - 80, cy - 120),  # Cuello izq
        (cx - 200, cy - 80), # Hombro izq
        (cx - 250, cy + 10), # Manga izq inf
        (cx - 180, cy + 50), # Axila izq
        (cx - 170, cy + 240),# Base izq
        (cx + 170, cy + 240),# Base der
        (cx + 180, cy + 50), # Axila der
        (cx + 250, cy + 10), # Manga der inf
        (cx + 200, cy - 80), # Hombro der
        (cx + 80, cy - 120),  # Cuello der
    ]
    draw.polygon(body_pts, fill=fill_color, outline=stroke_color)
    
    if is_polo:
        # Cuello polo
        draw.polygon([(cx - 80, cy - 120), (cx, cy - 70), (cx - 70, cy - 50)], fill=stroke_color)
        draw.polygon([(cx + 80, cy - 120), (cx, cy - 70), (cx + 70, cy - 50)], fill=stroke_color)
        draw.line([(cx, cy - 70), (cx, cy + 20)], fill=stroke_color, width=3)
        # Botones
        draw.ellipse([cx - 4, cy - 40, cx + 4, cy - 32], fill=(240, 240, 240))
        draw.ellipse([cx - 4, cy - 15, cx + 4, cy - 7], fill=(240, 240, 240))
    elif not is_hoodie:
        # Cuello redondo
        draw.arc([cx - 80, cy - 150, cx + 80, cy - 90], start=0, end=180, fill=stroke_color, width=5)

    if is_dryfit:
        # Paneles laterales deportivos
        draw.line([(cx - 175, cy + 60), (cx - 165, cy + 230)], fill=(255, 255, 255, 80), width=6)
        draw.line([(cx + 175, cy + 60), (cx + 165, cy + 230)], fill=(255, 255, 255, 80), width=6)

def generate_garment_image(name, subtitle, bg_color, garment_color, is_dryfit=False, is_polo=False, is_hoodie=False, is_gorra=False):
    S = 1200
    img = Image.new("RGBA", (S, S), (*bg_color, 255))
    d = ImageDraw.Draw(img)
    
    cx, cy = S*0.5, S*0.48
    
    # Sombra suave bajo la prenda
    d.ellipse([cx - 240, S*0.78, cx + 240, S*0.83], fill=(0, 0, 0, 25))
    
    if is_gorra:
        # Corona de la gorra
        d.chord([cx - 180, cy - 120, cx + 180, cy + 120], start=180, end=360, fill=garment_color, outline=TINTA, width=4)
        # Visera curvada
        d.chord([cx - 220, cy - 20, cx + 220, cy + 140], start=0, end=180, fill=garment_color, outline=TINTA, width=4)
        # Botón superior
        d.ellipse([cx - 15, cy - 125, cx + 15, cy - 105], fill=TINTA)
    else:
        draw_tshirt_silhouette(d, cx, cy, garment_color, TINTA, is_dryfit, is_polo, is_hoodie)
        
    # Badge MAREA centrado en el pecho
    d.ellipse([cx - 25, cy - 15, cx + 25, cy + 35], fill=CORAL)
    d.arc([cx - 20, cy, cx + 20, cy + 25], start=0, end=180, fill=BLANCO, width=3)
    
    # Textos informativos
    font_name = get_font(52, bold=True)
    font_sub = get_font(34, bold=False)
    
    d.text((cx, S*0.88), name, font=font_name, fill=TINTA, anchor="mm")
    d.text((cx, S*0.93), subtitle, font=font_sub, fill=TINTA_2, anchor="mm")
    
    return img.resize((600, 600), Image.Resampling.LANCZOS)

def main():
    print("🎨 Generando los 8 diseños reales para MAREA...")
    designs = [
        ("ola-nocturna.png", generate_design_ola_nocturna),
        ("sol-de-tulum.png", generate_design_sol_de_tulum),
        ("espiritu-selva.png", generate_design_espiritu_selva),
        ("marea-tricolor.png", generate_design_marea_tricolor),
        ("coral-vivo.png", generate_design_coral_vivo),
        ("mango-beach.png", generate_design_mango_beach),
        ("mascara-marina.png", generate_design_mascara_marina),
        ("ola-espuma.png", generate_design_ola_espuma),
    ]
    for fn, gen in designs:
        target = DESIGNS_DIR / fn
        im = gen()
        im.save(target, format="PNG", optimize=True)
        print(f"  ✓ {target.name} ({im.width}x{im.height})")
        
    print("\n👕 Generando las 5 prendas base para MAREA...")
    garments = [
        ("tee-64000.png", "Playera Marea Clásica", "Gildan Softstyle 100% Algodón Peinado", ARENA, (*TEAL, 255), False, False, False, False),
        ("dryfit-950c.png", "Playera Marea Dry Fit", "Playerytees 950C Deportiva 150g", ARENA, (*CORAL, 255), True, False, False, False),
        ("polo-700d.png", "Polo Marea Premier", "Playerytees 700D Manga Corta 230g", ARENA, (*MANGO, 255), False, True, False, False),
        ("hoodie-18600.png", "Sudadera Marea Hoodie", "Gildan 18600 Capucha & Cierre 271g", ARENA, (*TINTA, 255), False, False, True, False),
        ("gorra-g011.png", "Gorra Marea Dry Fit", "Club Cabo G011 Deportiva Unitalle", ARENA, (*TEAL_DK, 255), False, False, False, True),
    ]
    for fn, title, subtitle, bg, garment_col, is_dry, is_polo, is_hood, is_gorra in garments:
        target = PUBLIC_DIR / fn
        im = generate_garment_image(title, subtitle, bg, garment_col, is_dry, is_polo, is_hood, is_gorra)
        im.save(target, format="PNG", optimize=True)
        print(f"  ✓ {target.name} ({im.width}x{im.height})")

    print("\n✅ Todos los assets visuales de MAREA fueron generados con éxito.")

if __name__ == "__main__":
    main()
