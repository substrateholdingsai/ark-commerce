import urllib.request
import urllib.error
import json

base_url = 'https://tiendas.arksystems.site'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

payload = json.dumps({
    'tenant': 'baakal',
    'message': 'Hola fuga de gas'
}).encode('utf-8')

req = urllib.request.Request(
    f'{base_url}/api/assistant/chat',
    data=payload,
    headers=headers
)

try:
    with urllib.request.urlopen(req) as r:
        print("Success:", r.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Other Error:", e)
