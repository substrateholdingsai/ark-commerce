import urllib.request
import urllib.parse
import json

base_url = 'https://tiendas.arksystems.site/api/webhook/whatsapp'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

# 1. Test Meta Subscription Challenge (GET)
try:
    challenge = '9876543210'
    params = urllib.parse.urlencode({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'ark_commerce_wa_secret_2026',
        'hub.challenge': challenge
    })
    req = urllib.request.Request(f'{base_url}?{params}', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode('utf-8')
        print("--- 1. Meta Webhook Subscription Challenge ---")
        print("Status:", resp.status)
        print("Challenge returned:", body)
        print("Valid challenge:", body == challenge)
except Exception as e:
    print("Error in challenge test:", e)

# 2. Test Meta Inbound Webhook Payload (POST)
try:
    meta_payload = {
        "object": "whatsapp_business_account",
        "entry": [
          {
            "id": "104928392183921",
            "changes": [
              {
                "value": {
                  "messaging_product": "whatsapp",
                  "metadata": {
                    "display_phone_number": "529994918221",
                    "phone_number_id": "109283746501928"
                  },
                  "contacts": [
                    {
                      "profile": {
                        "name": "Mariana Rivas"
                      },
                      "wa_id": "5219998877665"
                    }
                  ],
                  "messages": [
                    {
                      "from": "5219998877665",
                      "id": "wamid.HBgLNTIxOTk5ODg3NzY2NQA=",
                      "timestamp": "1730000000",
                      "text": {
                        "body": "Buenas tardes, tengo una fuga de agua en el lavabo del baño y necesito un plomero hoy mismo"
                      },
                      "type": "text"
                    }
                  ]
                },
                "field": "messages"
              }
            ]
          }
        ]
    }

    req = urllib.request.Request(
        base_url,
        data=json.dumps(meta_payload).encode('utf-8'),
        headers=headers
    )

    with urllib.request.urlopen(req) as resp:
        res_data = json.loads(resp.read().decode('utf-8'))
        print("\n--- 2. Meta Inbound Message Handled ---")
        print("Status:", resp.status)
        print("Replied:", res_data.get('replied'))
        print("Tenant Quoted:", res_data.get('tenant_recommended'))
        print("Service Quoted:", res_data.get('service_quoted'))
        print("Price:", res_data.get('estimated_price'))
        print("WhatsApp Text:\n", res_data.get('reply_text'))
except Exception as e:
    print("Error in Meta inbound test:", e)

# 3. Test Direct Simulator (POST /simulate)
try:
    sim_payload = {
        "name": "Roberto Gómez",
        "phone": "5215512345678",
        "message": "Hola, necesito presentar mi declaración anual del SAT y ordenar la contabilidad mensual de mi PyME"
    }
    req = urllib.request.Request(
        f'{base_url}/simulate',
        data=json.dumps(sim_payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        sim_data = json.loads(resp.read().decode('utf-8'))
        print("\n--- 3. Simulator Response ---")
        print("Success:", sim_data.get('success'))
        ai_resp = sim_data.get('ai_response', {})
        print("Tenant:", ai_resp.get('matched_tenant'))
        print("Price:", ai_resp.get('estimated_price'))
        print("Reply Text:\n", ai_resp.get('text'))
except Exception as e:
    print("Error in simulator test:", e)

# 4. Test History (GET /history)
try:
    req = urllib.request.Request(f'{base_url}/history', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        hist_data = json.loads(resp.read().decode('utf-8'))
        print("\n--- 4. D1 Interaction Audit History ---")
        print("Total stored in D1:", hist_data.get('total'))
        for m in hist_data.get('messages', [])[:3]:
            print(f"[{m.get('created_at')}] {m.get('direction').upper()} | {m.get('sender_name')} ({m.get('phone')}): {m.get('matched_tenant')} - {m.get('message_text')[:50]}...")
except Exception as e:
    print("Error in history test:", e)
