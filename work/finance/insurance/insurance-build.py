"""Build a self-contained insurance adviser conversation demo."""
from pathlib import Path
import json
import base64

HERE = Path(__file__).resolve().parent
FINANCE = HERE.parent
ROOT = FINANCE.parent.parent
data = json.loads((HERE / 'insurance-cases.json').read_text())
photo = ROOT / 'outputs/hkchat-finance/assets/role-insurance.webp'
data['photo'] = 'data:image/webp;base64,' + base64.b64encode(photo.read_bytes()).decode()
css = (FINANCE / 'roles/conversation-shared.css').read_text() + '\n' + (HERE / 'insurance.css').read_text() + '\n' + (FINANCE / 'roles/scenario-generator.css').read_text()
app = (FINANCE / 'roles/scenario-generator.js').read_text() + '\n' + (HERE / 'insurance-app.js').read_text()
payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
html = '<style>' + css + '''</style>
<div id="hkroles" data-role-app="insurance">
<header class="p-top">HKChat Finance</header><main id="role-main"></main>
<div id="ins-announcer" class="cv-sr" role="status" aria-live="polite"></div>
<dialog id="ins-confirm" class="ins-dialog" aria-labelledby="ins-confirm-title" aria-describedby="ins-confirm-desc">
<h2 id="ins-confirm-title">重新開始這次會面？</h2><p id="ins-confirm-desc">將清除本局對話與重練紀錄。你可以先返回複製筆記。</p>
<div class="cv-actions"><button type="button" class="cv-secondary" data-confirm="cancel">留在這裏</button><button type="button" class="cv-primary" data-confirm="yes">確認繼續</button></div></dialog>
</div><script>(()=>{'use strict';const DATA=''' + payload + ';\n' + app.replace('</script', '<\\/script') + '\n})();</script>\n'
(FINANCE / 'insurance-fragment.html').write_text(html)
print(f'insurance-fragment.html: {len(html.encode()):,} bytes; two customers, three rounds')
