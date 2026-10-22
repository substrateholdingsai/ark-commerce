with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

checks = [
    '#ai-concierge',
    'id="ai-concierge"',
    'concierge-query-input',
    'concierge-submit-btn',
    '/api/assistant/recommend',
    'ARK CONCIERGE'
]

for check in checks:
    print(f"'{check}' present: {check in c}")
