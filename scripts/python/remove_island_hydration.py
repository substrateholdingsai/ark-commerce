with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# 1. Remove the astro-island script that registers customElements.define("astro-island", ...)
script_start = c.find('<script>(()=>{var e=async t=>{await')
if script_start != -1:
    script_end = c.find('</script>', script_start) + len('</script>')
    c = c[:script_start] + c[script_end:]
    print("Removed astro-island hydration script definition!")
else:
    print("astro-island script definition not found!")

# 2. Replace <astro-island ...> with <div id="ark-landing">
island_tag_pattern = r'<astro-island[^>]*>'
c, count1 = re.subn(island_tag_pattern, '<div id="ark-landing">', c)
print(f"Replaced {count1} <astro-island> opening tag(s)")

# 3. Replace </astro-island> with </div>
c, count2 = re.subn(r'</astro-island>', '</div>', c)
print(f"Replaced {count2} </astro-island> closing tag(s)")

# 4. Verify no more astro-island
print("Remaining 'astro-island' mentions:", c.count('astro-island'))

with open('dist/index.html', 'w', encoding='utf-8') as f:
    f.write(c)

print("Saved updated dist/index.html!")
