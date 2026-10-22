with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
scripts = re.findall(r'<script[^>]*src="([^"]+)"', c)
print("External scripts in index.html:", scripts)

astro_islands = re.findall(r'<astro-island[^>]*>', c)
print("Astro islands:", len(astro_islands))
for ai in astro_islands:
    print(" ", ai)
