"""Build a self-contained financial-literacy quiz fragment with inline images."""
from pathlib import Path
import base64
import json
import re
import runpy

BASE = Path(__file__).resolve().parent
runpy.run_path(str(BASE / 'quiz-data.py'))
stories = json.loads((BASE / 'finance-quiz-stories.json').read_text())
assert {s['id'] for s in stories} == {'bank', 'insurance', 'daily'}
seen = set()
required = ['scene', 'speaker', 'statement', 'question', 'explanation', 'takeaway', 'legalLabel', 'sourceLabel']
for s in stories:
    assert len(s['questions']) == 5 and s['aliases'] and s['intro']
    for q in s['questions']:
        for item in (q, q['twist']):
            assert item['id'] not in seen
            seen.add(item['id'])
            assert len(item['options']) == 3 and 0 <= item['correct'] < 3
            assert all(item[k] for k in required)
            assert re.match(r'https://www\.(hkma\.gov\.hk|ifec\.org\.hk)/', item['sourceUrl'])
            copy = ' '.join(item[k] for k in required) + ' '.join(item['options'])
            assert not re.search(r'[$€£¥￥％%]|港元|港幣|美元|人民幣|法律|律師|HKChat Legal', copy)
        assert q['twist']['changed']

assets = BASE.parent.parent / 'outputs' / 'fraud-domain-backgrounds'
bank_photo = assets / 'bank.webp'
if not bank_photo.exists():
    bank_photo = assets / 'finance.webp'
photo_files = {'bank': bank_photo, 'insurance': assets/'insurance.webp', 'daily': assets/'work.webp'}
def inline(path):
    return 'data:image/webp;base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

css = '\n'.join((BASE / f).read_text() for f in ('finance-quiz.css', 'finance-quiz-duel.css'))
data = json.dumps(stories, ensure_ascii=False).replace('</', '<\\/')
quiz_js = (BASE/'finance-quiz.js').read_text().replace('__QUIZ_STORIES__', data).replace('__QUIZ_BRIEF_PHOTOS__', json.dumps({k:inline(v) for k,v in photo_files.items()})).replace('__QUIZ_HOME_PHOTO__', json.dumps(inline(bank_photo)))
js = (BASE/'finance-quiz-duel.js').read_text() + '\n' + quiz_js
assert 'hkchat-finance-quiz-generated-v1' in js
assert 'hkchat-law' not in js and '法律' not in js
html = '<style>'+css+'</style>\n<div id="hkquiz"><header class="p-top">HKChat Finance</header><main class="q-main" id="q-main"></main></div>\n<script>'+js+'</script>\n'
(BASE/'quiz-fragment.html').write_text(html)
print('Built quiz-fragment.html: 3 stories; 5-round adaptive solo; local demo PK; all assets inline.')
