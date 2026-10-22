with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

island_idx = c.find('<astro-island')
print("island_idx:", island_idx)
tag_close = c.find('>', island_idx)
print("tag_close:", c[island_idx:tag_close+1])

island_end_idx = c.rfind('</astro-island>')
print("island_end_idx:", island_end_idx)
print("After island_end_idx:", repr(c[island_end_idx:island_end_idx+200]))
