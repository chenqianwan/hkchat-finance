"""Build the self-contained Finance interview, including the local CV reader."""
from pathlib import Path
import base64
import json
import runpy

HERE = Path(__file__).resolve().parent
FINANCE = HERE.parent
ROOT = FINANCE.parent.parent
photo = ROOT / 'outputs/hkchat-finance/assets/role-interview.webp'
if not photo.exists():
    raise FileNotFoundError(f'Required interview photo missing: {photo}')
image = 'data:image/webp;base64,' + base64.b64encode(photo.read_bytes()).decode()
css = (HERE / 'interview.css').read_text()
content = (HERE / 'interview-content.js').read_text()
app = (HERE / 'interview-app.js').read_text()
reader = runpy.run_path(str(HERE / 'vendor/embed.py'))['resume_scripts']()
licenses = '\n\n'.join(name + '\n' + (HERE / 'vendor' / name).read_text()
    for name in ('pdfjs-LICENSE.txt', 'pdfjs-cmaps-LICENSE.txt', 'fflate-LICENSE.txt'))
runtime = '(() => {const INTERVIEW_PHOTO=' + json.dumps(image) + ';\n' + app + '\n})();'
html = '''<style>''' + css + '''</style>
<div id="hkroles" data-role-app="interview">
<header class="p-top">HKChat Finance</header>
<main id="role-main"></main>
<div id="iv-announcer" class="iv-sr" role="status" aria-live="polite"></div>
<dialog id="iv-confirm" class="iv-confirm" aria-labelledby="iv-confirm-title" aria-describedby="iv-confirm-desc">
<h2 id="iv-confirm-title"></h2><p id="iv-confirm-desc"></p>
<div class="iv-actions"><button type="button" class="iv-secondary" data-confirm="cancel">留在這裏</button><button type="button" class="iv-primary" data-confirm="yes">確認繼續</button></div>
</dialog>
</div>
<script>''' + content.replace('</script', '<\\/script') + '</script>\n<!-- Third-party notices\n' + licenses.replace('--', '- -') + '\n-->\n' + reader + '\n<script>' + runtime.replace('</script', '<\\/script') + '</script>\n'
(FINANCE / 'interview-fragment.html').write_text(html)
print(f'interview-fragment.html: {len(html.encode()):,} bytes, local PDF/DOCX/TXT reader')
