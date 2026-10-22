import os

files_to_patch = [
    ('public/stores/baakal.html', 'baakal'),
    ('dist/stores/baakal.html', 'baakal'),
    ('public/stores/contagram.html', 'contagram'),
    ('dist/stores/contagram.html', 'contagram'),
]

for filepath, tenant in files_to_patch:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (does not exist)")
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    script_tag = f'<script src="/widget.js" data-tenant="{tenant}"></script>'
    if script_tag not in content and 'widget.js' not in content:
        content = content.replace('</body>', f'  {script_tag}\n</body>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected widget for {tenant} into {filepath}")
    else:
        print(f"Already contains widget in {filepath}")
