import urllib.request

req = urllib.request.Request(
    'https://tiendas.arksystems.site/',
    headers={'User-Agent': 'Mozilla/5.0'}
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8')
        print("Status:", resp.status)
        print("Length:", len(html))
        print("Has ai-concierge:", 'ai-concierge' in html)
        print("Has concierge-query-input:", 'concierge-query-input' in html)
        print("Has ARK CONCIERGE:", 'ARK CONCIERGE' in html)
except Exception as e:
    print("Error:", e)
