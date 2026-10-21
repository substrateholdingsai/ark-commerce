#!/usr/bin/env python3
"""
CONTAGRAM · ISFAHAN LEDGER — Asset Forge
Genera texturas, patrones girih, favicon, logo, ornamentos e iconos SVG.
"""
from __future__ import annotations
import math
import random
from pathlib import Path
import json

LAPIS = {950: "#040F1D", 900: "#071A30", 800: "#0C2440", 700: "#143353",
         600: "#1F476F", 500: "#35608A", 300: "#8FAAC6", 100: "#DCE6F2"}
GOLD  = {200: "#EED9A0", 300: "#E3C274", 400: "#D4AF37", 500: "#C9A227", 700: "#7E6114"}
CHALK = {50: "#FBF9F4", 100: "#F4F0E6"}

SQ2 = math.sqrt(2)

def n(v: float) -> str:
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s

class IsfahanForge:
    def __init__(self, cells: int = 4, cell: float = 120.0, stroke: float = 1.0,
                 density: float = 0.07, seed: int = 8):
        self.cells, self.cell, self.stroke = cells, cell, stroke
        self.density = density
        random.seed(seed)
        self.GOLD = GOLD[500]
        self.LAPIS = LAPIS[900]
        self.side = cell / (1 + SQ2)
        self.Rc = self.side / (2 * math.sin(math.pi / 8))

    def star(self, cx: float, cy: float, r: float, pts: int = 8, step: int = 3, rot: float = -90.0) -> str:
        d = []
        for i in range(pts):
            a = math.radians(rot + ((i * step) % pts) * (360 / pts))
            d.append(f"{n(cx + r * math.cos(a))},{n(cy + r * math.sin(a))}")
        return "M" + "L".join(d) + "Z"

    def octagon(self, cx: float, cy: float, r: float, rot: float = 22.5) -> str:
        d = []
        for i in range(8):
            a = math.radians(rot + i * 45)
            d.append(f"{n(cx + r * math.cos(a))},{n(cy + r * math.sin(a))}")
        return "M" + "L".join(d) + "Z"

    def diamond(self, cx: float, cy: float, r: float) -> str:
        return (f"M{n(cx)},{n(cy - r)}L{n(cx + r)},{n(cy)}"
                f"L{n(cx)},{n(cy + r)}L{n(cx - r)},{n(cy)}Z")

    def tile_group(self, ox: float, oy: float) -> str:
        c = self.cell
        cx, cy = ox + c / 2, oy + c / 2
        s = self.stroke
        out = [
            f'<path d="{self.octagon(cx, cy, self.Rc)}" fill="none" stroke="{self.GOLD}" stroke-width="{n(s)}"/>',
            f'<path d="{self.star(cx, cy, self.Rc * 0.62)}" fill="none" stroke="{self.GOLD}" stroke-width="{n(s * 0.8)}"/>',
            f'<circle cx="{n(cx)}" cy="{n(cy)}" r="{n(s * 1.4)}" fill="{self.GOLD}"/>',
        ]
        for ex, ey in ((ox, oy), (ox + c, oy), (ox, oy + c), (ox + c, oy + c)):
            out.append(
                f'<path d="{self.diamond(ex, ey, self.side * 0.62)}" fill="none" stroke="{self.GOLD}" stroke-width="{n(s * 0.7)}"/>'
            )
        return "".join(out)

    def pattern_def(self, pid: str = "girih") -> str:
        c, N = self.cell, self.cells
        size = c * N
        tiles = "".join(self.tile_group(x * c, y * c) for x in range(N) for y in range(N))
        return (f'<pattern id="{pid}" width="{n(size)}" height="{n(size)}" patternUnits="userSpaceOnUse">{tiles}</pattern>')

    def seamless(self, opacity: float | None = None) -> str:
        op = self.density if opacity is None else opacity
        size = self.cell * self.cells
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{n(size)}" height="{n(size)}" viewBox="0 0 {n(size)} {n(size)}">'
            f'<defs>{self.pattern_def()}</defs>'
            f'<rect width="100%" height="100%" fill="url(#girih)" opacity="{n(op)}"/>'
            f'</svg>'
        )

    def favicon(self) -> str:
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
                f'<rect width="64" height="64" rx="14" fill="{self.LAPIS}"/>'
                f'<rect x="3.5" y="3.5" width="57" height="57" rx="11" fill="none" stroke="{self.GOLD}" stroke-width="1" opacity=".45"/>'
                f'<path d="{self.octagon(32, 32, 20)}" fill="none" stroke="{self.GOLD}" stroke-width="3.4"/>'
                f'<path d="{self.star(32, 32, 13.2)}" fill="none" stroke="{self.GOLD}" stroke-width="2.4"/>'
                f'<circle cx="32" cy="32" r="3.7" fill="{self.GOLD}"/></svg>')

    def lockup(self) -> str:
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">'
                f'<path d="{self.octagon(80, 80, 46)}" fill="none" stroke="{self.GOLD}" stroke-width="3.2"/>'
                f'<path d="{self.star(80, 80, 30.3)}" fill="none" stroke="{self.GOLD}" stroke-width="2.3"/>'
                f'<circle cx="80" cy="80" r="3.5" fill="{self.GOLD}"/>'
                f'<line x1="152" y1="46" x2="152" y2="114" stroke="{self.GOLD}" stroke-width="1" opacity=".5"/>'
                f'<text x="176" y="82" font-family="Cormorant Garamond, Georgia, serif" font-size="46" font-weight="500" letter-spacing="6" fill="{GOLD[300]}">CONTAGRAM</text>'
                f'<text x="178" y="108" font-family="IBM Plex Sans, sans-serif" font-size="13" font-weight="400" letter-spacing="4.6" fill="{LAPIS[300]}">DESPACHO DE CONTABILIDAD</text></svg>')

    def build(self, out: Path):
        out.mkdir(parents=True, exist_ok=True)
        (out / "girih-seamless.svg").write_text(self.seamless(), encoding="utf-8")
        (out / "favicon.svg").write_text(self.favicon(), encoding="utf-8")
        (out / "logo-lockup.svg").write_text(self.lockup(), encoding="utf-8")
        print(f"Assets creados en {out}")

if __name__ == "__main__":
    out_dir = Path("public/images/contagram")
    IsfahanForge().build(out_dir)
