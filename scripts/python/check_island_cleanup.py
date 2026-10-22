with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
# check where astro-island is and what scripts are at the bottom
print("Islands in index.html:", c.count('<astro-island'))
print("Script tags at the end:")
scripts = re.findall(r'<script.*?</script>', c[-3000:], re.DOTALL)
for s in scripts:
    print("--- SCRIPT ---")
    print(s[:200])
