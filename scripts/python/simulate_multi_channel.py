import urllib.request
import json

base_url = 'https://tiendas.arksystems.site'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

# 1. Simulate web search
req1 = urllib.request.Request(
    f'{base_url}/api/assistant/recommend',
    data=json.dumps({'query': 'Fuga de gas en boiler en Mérida'}).encode('utf-8'),
    headers=headers
)
with urllib.request.urlopen(req1) as r:
    print("Web recommend:", r.status)

# 2. Simulate store widget chat
req2 = urllib.request.Request(
    f'{base_url}/api/assistant/chat',
    data=json.dumps({'tenant': 'contagram', 'message': 'Requiero cálculo de finiquito y nóminas'}).encode('utf-8'),
    headers=headers
)
with urllib.request.urlopen(req2) as r:
    print("Widget chat:", r.status)

# 3. Check updated summary
req3 = urllib.request.Request(f'{base_url}/api/admin/leads/summary', headers=headers)
with urllib.request.urlopen(req3) as r:
    data = json.loads(r.read().decode('utf-8'))
    totals = data.get('data', {}).get('totals', {})
    print(f"\nUpdated Totals -> Leads: {totals.get('leads')}, Quoted Value: ${totals.get('value')} MXN")
    print("Channels:")
    for c in data.get('data', {}).get('by_channel', []):
        print(f"  • {c.get('channel')}: {c.get('count')}")
