import urllib.request

req = urllib.request.Request(
    'https://tiendas.arksystems.site/',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Cache-Control': 'no-cache'}
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print("Status:", resp.status)
        print("astro-island in body:", 'astro-island' in body)
        print("DuNP0LvE in body:", 'DuNP0LvE' in body)
        print("Probar Asistente IA in body:", 'Probar Asistente IA' in body)
        print("ai-concierge in body:", 'ai-concierge' in body)
        print("concierge-query-input in body:", 'concierge-query-input' in body)
except Exception as e:
    print("Error:", e)
