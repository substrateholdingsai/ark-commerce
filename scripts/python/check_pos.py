import sys

with open('dist/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<section class="py-16 sm:py-24 border-b border-white/10 bg-[#0E1013]">'
pos = content.find(target)
print("Position:", pos)
if pos != -1:
    before = content[pos-250:pos]
    print("Len before:", len(before))
