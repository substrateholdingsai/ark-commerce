import os

with open('dist/_astro/ArkLanding.DuNP0LvE.js', 'r', encoding='utf-8') as f:
    js = f.read()

print("Length of ArkLanding JS:", len(js))
print("Has 'Ver tiendas activas':", 'Ver tiendas activas' in js)
print("Has 'ai-concierge':", 'ai-concierge' in js)
