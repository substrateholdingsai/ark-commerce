#!/usr/bin/env python3
"""
TEMPLATE · BAAKAL — Plomería & Gas · Sureste Mexicano
Asset Forge (SVG puro, cero dependencias)
"""
from __future__ import annotations
import argparse, json, math, random, sys
from pathlib import Path

# UTF-8 Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BG_CANVAS = "#F5F1E8"
BG_PRIMARY = "#1A2F2A"
BG_SURFACE = "#FFFFFF"
ACCENT_500 = "#2A7F9E"
ACCENT_400 = "#35A0C4"
COPPER_500 = "#B87333"
TERRACOTTA_500 = "#C86B4A"
JADE_500 = "#2E7D6F"
BORDER_LINE = "#D6CEBC"
TEXT_PRIMARY = "#1A2F2A"
TEXT_INVERSE = "#F5F1E8"

def n(v: float) -> str:
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s

class BaakalForge:
    def __init__(self, seed: int = 8):
        random.seed(seed)

    def girih_seamless(self) -> str:
        size = 480
        drops = []
        for _ in range(18):
            x = random.uniform(0, size)
            y = random.uniform(0, size)
            r = random.uniform(3, 8)
            drops.append(
                f'<circle cx="{n(x)}" cy="{n(y)}" r="{n(r)}" '
                f'fill="none" stroke="{ACCENT_500}" stroke-width="0.8" opacity="0.3"/>'
            )
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
            f'viewBox="0 0 {size} {size}">{"".join(drops)}</svg>'
        )

    def favicon(self) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
            f'<rect width="64" height="64" rx="14" fill="{BG_PRIMARY}"/>'
            f'<path d="M32 16 L40 24 L32 32 L24 24 Z" fill="{ACCENT_500}"/>'
            f'<path d="M32 28 L38 34 L32 40 L26 34 Z" fill="{COPPER_500}" opacity="0.7"/>'
            f'<circle cx="32" cy="46" r="3" fill="{ACCENT_400}"/>'
            f'</svg>'
        )

    def monogram(self) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">'
            f'<rect width="256" height="256" rx="24" fill="{BG_PRIMARY}"/>'
            f'<path d="M128 60 L168 100 L128 140 L88 100 Z" fill="{ACCENT_500}"/>'
            f'<path d="M128 100 L156 128 L128 156 L100 128 Z" fill="{COPPER_500}" opacity="0.8"/>'
            f'<path d="M128 140 L144 156 L128 172 L112 156 Z" fill="{ACCENT_400}" opacity="0.6"/>'
            f'</svg>'
        )

    def lockup(self) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">'
            f'<path d="M80 40 L100 60 L80 80 L60 60 Z" fill="{ACCENT_500}"/>'
            f'<path d="M80 60 L92 72 L80 84 L68 72 Z" fill="{COPPER_500}" opacity="0.8"/>'
            f'<circle cx="80" cy="92" r="4" fill="{ACCENT_400}"/>'
            f'<line x1="120" y1="50" x2="120" y2="110" stroke="{BORDER_LINE}" stroke-width="1"/>'
            f'<text x="140" y="90" font-family="Outfit, sans-serif" font-size="42" font-weight="600" fill="{TEXT_PRIMARY}">PLOMERÍA &amp; GAS</text>'
            f'<text x="142" y="112" font-family="Inter, sans-serif" font-size="14" font-weight="500" letter-spacing="2" fill="{ACCENT_500}">BAAKAL</text>'
            f'</svg>'
        )

    def divider_cobre(self) -> str:
        W, H, cy = 1200, 48, 24
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<line x1="0" y1="{cy}" x2="{W/2 - 80}" y2="{cy}" stroke="{COPPER_500}" stroke-width="1" opacity="0.5"/>'
            f'<line x1="{W/2 + 80}" y1="{cy}" x2="{W}" y2="{cy}" stroke="{COPPER_500}" stroke-width="1" opacity="0.5"/>'
            f'<path d="M{W/2} {cy-16} L{W/2+12} {cy-4} L{W/2} {cy+8} L{W/2-12} {cy-4} Z" fill="{COPPER_500}"/>'
            f'<path d="M{W/2} {cy-8} L{W/2+6} {cy-2} L{W/2} {cy+4} L{W/2-6} {cy-2} Z" fill="{ACCENT_500}" opacity="0.7"/>'
            f'</svg>'
        )

    def icon_sprite(self) -> str:
        S = f'fill="none" stroke="{ACCENT_500}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
        icons = {
            "wrench": '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
            "pipe": '<path d="M6 4v16M18 4v16M6 12h12M6 8h12M6 16h12"/>',
            "droplet": '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
            "gauge": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
            "flame": '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
            "faucet": '<path d="M12 2v4M8 6h8M6 10h12M8 10v8a4 4 0 0 0 8 0v-8"/>',
            "camera": '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
            "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
        }
        syms = "".join(f'<symbol id="bg-{k}" viewBox="0 0 24 24"><g {S}>{v}</g></symbol>' for k, v in icons.items())
        return f'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">{syms}</svg>'

    def build(self, out: Path) -> list[dict]:
        out.mkdir(parents=True, exist_ok=True)
        files = {
            "favicon.svg": self.favicon(),
            "logo-lockup.svg": self.lockup(),
            "girih-seamless.svg": self.girih_seamless(),
            "monogram.svg": self.monogram(),
            "divider-cobre.svg": self.divider_cobre(),
            "icons-sprite.svg": self.icon_sprite(),
        }
        manifest = []
        for name, content in files.items():
            p = out / name
            p.write_text(content, encoding="utf-8")
            kb = round(p.stat().st_size / 1024, 2)
            manifest.append({"file": name, "kb": kb})
            print(f"  ✓ {name:<22} {kb:>7.2f} KB")

        (out / "manifest.json").write_text(
            json.dumps({"system": "Baakal", "client": "Baakal Plomería & Gas", "assets": manifest}, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        return manifest

if __name__ == "__main__":
    out_dir = Path("public/images/baakal")
    print(f"\n🔧  BAAKAL — Plomería & Gas · Asset Forge")
    BaakalForge().build(out_dir)
    print(f"  ✔ Assets listos en {out_dir}\n")
