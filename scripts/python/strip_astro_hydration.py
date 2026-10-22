with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re
sub = re.sub(r'<style>astro-island.*?</script>', '', c, flags=re.DOTALL)
print("Replaced script:", len(c) - len(sub))
print("Remaining astro-island:", sub.count('astro-island'))

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(sub)
print("Saved!")
