import urllib.request
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

req = urllib.request.Request(
    'https://tiendas.arksystems.site/',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Cache-Control': 'no-cache'}
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print("Status:", resp.status)
        print("Has ARKOFICIOS:", 'OFICIOS' in body)
        print("Has 'El técnico que necesitas':", 'El técnico que necesitas' in body)
        print("Has 'Cotizado al instante por IA':", 'Cotizado al instante por IA' in body)
        print("Has 'baakal.ark.mx':", 'baakal.ark.mx' in body)
        print("Has 'PLM-2026-0847':", 'PLM-2026-0847' in body)
        print("Has 'Boiler':", 'Boiler' in body)
except Exception as e:
    print("Error:", e)
