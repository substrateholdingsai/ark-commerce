with open('dist/admin/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("Length:", len(c))
print("Preview:", c[:400])
