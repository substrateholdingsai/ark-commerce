with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r'astro-island', c)]
for m in matches:
    print(repr(c[max(0, m-30):min(len(c), m+60)]))
