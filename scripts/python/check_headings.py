with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
matches = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', c)
for m in matches[:15]:
    print("Heading:", m)
