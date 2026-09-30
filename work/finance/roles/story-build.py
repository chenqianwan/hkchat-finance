"""Build the three first-person story fragments without changing other demos.

Run: python3 work/finance/roles/story-build.py
Final standalone pages are assembled by the site's shared build-site.py.
Use --preview to write isolated previews with the current shared shell.
"""
from pathlib import Path
import argparse, base64, json

HERE = Path(__file__).resolve().parent
FINANCE = HERE.parent
ROOT = FINANCE.parent.parent
ASSETS = ROOT / 'outputs/hkchat-finance/assets'
args = argparse.ArgumentParser()
args.add_argument('--preview', action='store_true')
opts = args.parse_args()
data = json.loads((HERE / 'story-data.json').read_text())
css = (HERE / 'story-mobile.css').read_text()
runtime = (HERE / 'story-runtime.js').read_text()
for key, content in data.items():
    asset = ASSETS / f'role-{key}.webp'
    if not asset.exists():
        if not opts.preview:
            raise FileNotFoundError(f'{asset}: use --preview for a temporary photo fallback')
        asset = ASSETS / 'home-quiz.webp'
    photo = 'data:image/webp;base64,' + base64.b64encode(asset.read_bytes()).decode()
    config = dict(content, key=key, photo=photo)
    fragment = '<style>' + css + '</style>\n<div id="hkroles" lang="zh-HK"><header class="p-top">HKChat Finance</header><main id="role-main" class="role-main"></main></div>\n<script>window.HK_ROLE_DATA=' + json.dumps(config, ensure_ascii=False).replace('</', '<\\/') + ';</script>\n<script>' + runtime + '</script>\n'
    (FINANCE / f'{key}-fragment.html').write_text(fragment)
    if opts.preview:
        mobile = 'html,body{margin:0;padding:0;color-scheme:light dark;background:light-dark(#f7f7f8,#100e13)}'
        (HERE / f'story-{key}-preview.html').write_text('<!doctype html><html lang="zh-HK"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>' + content['title'] + '</title><style>' + mobile + '</style>' + fragment + '</html>')
    print(f'{key}-fragment.html')
