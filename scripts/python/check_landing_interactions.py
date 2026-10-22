with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
clabe_match = re.findall(r'<button[^>]*>.*?Copiar.*?</button>', c)
print("CLABE button:", clabe_match)

faq_headers = re.findall(r'<button[^>]*>.*?<span[^>]*>[^<]*\?</span>.*?</button>', c)
print("FAQ questions:", len(faq_headers))
for fh in faq_headers[:3]:
    print(" ", fh[:120])
