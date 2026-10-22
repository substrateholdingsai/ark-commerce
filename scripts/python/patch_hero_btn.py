with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('Ver tiendas activas \u2193')
if idx != -1:
    btn_start = c.rfind('<button', 0, idx)
    btn_end = c.find('</button>', idx) + len('</button>')
    new_btn = '<a href="#ai-concierge" class="h-14 px-6 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/30 flex items-center justify-center font-display text-sm font-semibold text-white transition gap-2"><span>🤖 Probar Asistente IA</span><span>&darr;</span></a>'
    c = c[:btn_start] + new_btn + c[btn_end:]
    with open('dist/index.html', 'w', encoding='utf-8') as f2:
        f2.write(c)
    print('Replaced hero button successfully!')
else:
    print('Not found or already replaced')
