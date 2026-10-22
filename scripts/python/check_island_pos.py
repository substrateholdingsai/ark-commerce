with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

island_start = c.find('<astro-island')
island_end = c.find('</astro-island>')
print("Island start:", island_start)
print("Island end:", island_end)
print("Total length:", len(c))
