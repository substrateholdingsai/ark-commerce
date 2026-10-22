import urllib.request

req = urllib.request.Request(
    'https://tiendas.arksystems.site/',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Cache-Control': 'no-cache'}
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print("Status:", resp.status)
        print("Headers:")
        for k, v in resp.headers.items():
            print(f"  {k}: {v}")
        body = resp.read().decode('utf-8')
        print("\nHas 'Probar Asistente IA':", 'Probar Asistente IA' in body)
        print("Has 'Ver tiendas activas':", 'Ver tiendas activas' in body)
        print("Has 'ai-concierge':", 'ai-concierge' in body)
except Exception as e:
    print("Error:", e)
