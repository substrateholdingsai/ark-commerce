import urllib.request
import json
import sys

# Configure stdout for UTF-8
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

base_url = 'https://tiendas.arksystems.site/api/webhook/whatsapp'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

req = urllib.request.Request(f'{base_url}/history', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print(f"Total registros en D1: {data.get('total')}\n")
    for i, m in enumerate(data.get('messages', [])[:4], 1):
        print(f"--- Mensaje #{i} [{m.get('direction').upper()}] ---")
        print(f"De: {m.get('sender_name')} ({m.get('phone')})")
        print(f"Proveedor asignado: {m.get('matched_tenant')}")
        print(f"Precio estimado: ${m.get('estimated_price')} MXN")
        print("Texto:")
        print(m.get('message_text'))
        print()
