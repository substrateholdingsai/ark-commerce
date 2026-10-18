#!/usr/bin/env python3
"""
ARK PULSE — Python Asset Forge
Design System para Ark Systems (E-commerce SaaS)
Genera: patrón hero (grid modular), tile claro, banner promo diagonal, logo.
"""
from PIL import Image, ImageDraw
import random, os

random.seed(2026)  # Reproducible
out_dir = os.path.join(os.path.dirname(__file__), '../../public/images/ark')
os.makedirs(out_dir, exist_ok=True)

# ── Paleta ARK PULSE ──────────────────────────────────────
INK_950 = (11, 12, 14)
INK_800 = (26, 29, 34)
INK_700 = (42, 48, 56)
LIMA    = (180, 255, 0)
DOT     = (226, 229, 233)  # punto gris para tile claro

def gen_hero_pattern(w=1920, h=720):
    """Grid modular del 'arca': contenedores grises + módulos lima aleatorios + glow."""
    img = Image.new('RGB', (w, h), INK_950)
    d = ImageDraw.Draw(img)
    cell = 80
    for x in range(0, w, cell):
        for y in range(0, h, cell):
            d.rectangle([x, y, x+cell, y+cell], outline=(20, 22, 26))
            r = random.random()
            if r < 0.035:
                pad = random.randint(10, 22)
                d.rounded_rectangle([x+pad, y+pad, x+cell-pad, y+cell-pad], radius=8, fill=LIMA)
            elif r < 0.11:
                pad = random.randint(12, 26)
                d.rounded_rectangle([x+pad, y+pad, x+cell-pad, y+cell-pad], radius=8, fill=INK_700)
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy, radius = int(w*0.82), int(h*0.25), 600
    for r in range(radius, 0, -6):
        alpha = int(28 * (1 - r/radius)**2)
        gd.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(LIMA[0], LIMA[1], 0, alpha))
    img.paste(glow, (0, 0), glow)
    target = os.path.join(out_dir, 'ark_hero_pattern.png')
    img.save(target, quality=92)
    print(f'[OK] {target} (1920x720 · hero)')

def gen_tile_light(size=400):
    """Tile claro de puntos grises para fondos de sección (repetible)."""
    img = Image.new('RGB', (size, size), (255, 255, 255))
    d = ImageDraw.Draw(img)
    step = 40
    for x in range(0, size, step):
        for y in range(0, size, step):
            d.ellipse([x+18, y+18, x+22, y+22], fill=DOT)
    target = os.path.join(out_dir, 'ark_tile_light.png')
    img.save(target)
    print(f'[OK] {target} (400x400 · tile claro)')

def gen_promo_banner(w=1600, h=500):
    """Banner de ofertas: diagonales dinámicas ink + líneas lima de pulso."""
    img = Image.new('RGB', (w, h), INK_950)
    d = ImageDraw.Draw(img)
    for i in range(-h, w + h, 46):
        d.line([(i, h), (i+h, 0)], fill=INK_800, width=14)
    for i in range(-h, w + h, 46*5):
        d.line([(i, h), (i+h, 0)], fill=LIMA, width=6)
    target = os.path.join(out_dir, 'ark_promo_banner.png')
    img.save(target, quality=92)
    print(f'[OK] {target} (1600x500 · banner promo)')

def gen_logo(size=512):
    """Logo placeholder: caja-arca ink con franja de pulso lima."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = size // 8
    d.rounded_rectangle([m, m, size-m, size-m], radius=size//10, fill=INK_950)
    d.rectangle([m, size//2-8, size-m, size//2+8], fill=LIMA)
    d.ellipse([size//2-12, size//4-12, size//2+12, size//4+12], fill=LIMA)
    target = os.path.join(out_dir, 'ark_logo.png')
    img.save(target)
    print('[OK] assets generated in public/images/ark/')

if __name__ == '__main__':
    print('ARK PULSE FORGE - Generating assets...')
    gen_hero_pattern()
    gen_tile_light()
    gen_promo_banner()
    gen_logo()
    print('Listo. Assets generados en public/images/ark/')
