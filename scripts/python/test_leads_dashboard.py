import urllib.request
import json
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

base_url = 'https://tiendas.arksystems.site'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

# 1. Test leads.html
try:
    req = urllib.request.Request(f'{base_url}/admin/leads.html', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        print("--- 1. Leads Dashboard HTML ---")
        print("Status:", resp.status)
        print("Length:", len(resp.read()))
except Exception as e:
    print("Error leads.html:", e)

# 2. Test /api/admin/leads/summary
try:
    req = urllib.request.Request(f'{base_url}/api/admin/leads/summary', headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("\n--- 2. Leads Summary API ---")
        print("Success:", data.get('success'))
        totals = data.get('data', {}).get('totals', {})
        print(f"Total Leads: {totals.get('leads')}")
        print(f"Total Quoted Value: ${totals.get('value')} MXN")
        print(f"Unique Contacts: {totals.get('unique_contacts')}")
        print("\nBy Tenant:")
        for t in data.get('data', {}).get('by_tenant', []):
            print(f"  • {t.get('tenant')}: {t.get('count')} leads (${t.get('total_value')} MXN)")
        print("\nBy Channel:")
        for c in data.get('data', {}).get('by_channel', []):
            print(f"  • {c.get('channel')}: {c.get('count')} messages")
except Exception as e:
    print("Error summary API:", e)
