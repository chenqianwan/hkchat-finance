"""Build two standalone Finance role fragments from editable data, CSS and JS."""
from pathlib import Path
import base64
import json
import sys

HERE = Path(__file__).resolve().parent
FINANCE = HERE.parent
ROOT = FINANCE.parent.parent
data = json.loads((HERE / 'decision-data.json').read_text())
css = (HERE / 'decision-ui.css').read_text() + '\n' + (HERE / 'scenario-generator.css').read_text()
js = (HERE / 'scenario-generator.js').read_text() + '\n' + (HERE / 'decision-app.js').read_text()

for key, config in data.items():
    photo = ROOT / 'outputs' / 'hkchat-finance' / 'assets' / f'role-{key}.webp'
    if not photo.exists():
        if '--preview' not in sys.argv:
            raise FileNotFoundError(f'Missing final role photo: {photo}')
        photo = ROOT / 'outputs' / 'hkchat-finance' / 'assets' / 'home-fraud.webp'
        print(f'{key}: using temporary photo; rebuild when role-{key}.webp exists')
    config['photo'] = 'data:image/webp;base64,' + base64.b64encode(photo.read_bytes()).decode()
    config['key'] = key
    payload = json.dumps(config, ensure_ascii=False).replace('</', '<\\/')
    html = f'''<div id="hkroles" data-role="{key}" data-view="home" data-stage="home">
<header class="p-top"><a href="index.html">HKChat · Finance</a></header>
<main id="role-main" class="r-main"></main>
<div id="r-announcement" class="r-sr" role="status" aria-live="polite"></div>
</div>
<style>{css}</style>
<script type="application/json" id="role-config">{payload}</script>
<script>{js}</script>'''
    (FINANCE / f'{key}-fragment.html').write_text(html)
    print(f'{key}: built {len(html.encode()):,} bytes')
    if '--preview' in sys.argv:
        shared = (FINANCE / 'hkchat-product.css').read_text().replace('#hkspot)', '#hkspot,#hkroles)')
        preview = '''<!doctype html><html lang="zh-HK"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>Finance role preview</title><style>html,body{margin:0;padding:0;color-scheme:light dark;background:light-dark(#f7f7f8,#100e13)}#hkroles .p-top{padding:16px;border-bottom:1px solid var(--p-line)}#hkroles .p-top a{text-decoration:none;font-size:23px;font-weight:650;color:var(--p-text)}</style></head><body>'''+html+'<style>'+shared+'</style></body></html>'
        (HERE / f'decision-preview-{key}.html').write_text(preview)
