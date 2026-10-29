import urllib.request
import json

base_url = 'https://tiendas.arksystems.site'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

# 1. Test widget.js
try:
    req = urllib.request.Request(f'{base_url}/widget.js', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        print("widget.js status:", r.status, "length:", len(r.read()))
except Exception as e:
    print("Error widget.js:", e)

# 2. Test chat endpoint with Baakal
try:
    payload = json.dumps({
        'tenant': 'baakal',
        'message': 'Hola, tengo una fuga de gas en mi estufa y huele fuerte'
    }).encode('utf-8')

    req = urllib.request.Request(
        f'{base_url}/api/assistant/chat',
        data=payload,
        headers=headers
    )

    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode('utf-8'))
        print("\n--- Baakal Chat Response ---")
        print("Success:", data.get('success'))
        print("Tenant:", data.get('tenant', {}).get('name'))
        print("Reply:", data.get('reply'))
        print("Estimated total:", data.get('estimated_total'))
        print("WhatsApp URL:", data.get('whatsapp_url')[:60] + '...')
except Exception as e:
    print("Error Baakal chat:", e)
