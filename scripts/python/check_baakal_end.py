with open('public/stores/baakal.html', 'r', encoding='utf-8') as f:
    c = f.read()

print("Length:", len(c))
print("Last 300 chars:", repr(c[-300:]))
