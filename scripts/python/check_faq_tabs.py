with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
print("Has RETAIL_CATEGORIES text:")
for name in ['Carnes Ahumadas', 'Moda Urbana', 'Belleza & Barber', 'Alimentos & Vinos']:
    print(f"  {name}: {name in c}")

faq_idx = c.find('¿Por qué no cobrar por Shopify')
print("FAQ found at:", faq_idx)
if faq_idx != -1:
    print("FAQ snippet:", repr(c[faq_idx-100:faq_idx+200]))
