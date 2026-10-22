with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

checks = [
    'ARKOFICIOS',
    'El técnico que necesitas en tu casa o negocio',
    'Cotizado al instante por IA',
    'ai-concierge',
    'astro-island',
    'DuNP0LvE'
]

for chk in checks:
    print(f"'{chk}': {chk in c}")
