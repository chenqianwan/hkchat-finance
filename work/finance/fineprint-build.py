"""Build the independent finance fineprint fragment from authored local sources."""
from pathlib import Path
import base64
import json
import re

BASE = Path(__file__).resolve().parent
ASSETS = BASE.parent.parent / 'outputs'
s = (BASE / 'fineprint-base.html').read_text()
cases = json.loads((BASE / 'fineprint-cases.json').read_text())
extras = json.loads((BASE / 'fineprint-extra-cases.json').read_text())
assert len(cases) == 3 and len(extras) >= 3
assert len({c['id'] for c in cases + extras}) == len(cases + extras)
for c in cases + extras:
    assert len(c['clauses']) == 5 and sum(q['risk'] for q in c['clauses']) == 3
    assert len(c['questions']) == 3 and c['sourceGroup'] in ('bank', 'insurance')
    assert not re.search(r'[$€£¥￥]|\d\s*%|\d\s*元', json.dumps(c, ensure_ascii=False))

def data_image(path):
    return 'data:image/webp;base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

def js_json(value):
    return json.dumps(value, ensure_ascii=False).replace('</script', '<\\/script')

s = s.replace('__FINEPRINT_BASE_CASES__', js_json(cases))
s = s.replace('</style>', (BASE / 'fineprint-generation.css').read_text() + '\n' + (BASE / 'fineprint-ad-cards.css').read_text() + '\n</style>', 1)
images = {
    'finance': {'src': data_image(ASSETS / 'fraud-domain-backgrounds' / 'finance.webp'), 'alt': 'AI 生成示意照片：銀行服務櫃位上的文件與查詢情境。'},
    'insurance': {'src': data_image(ASSETS / 'fraud-domain-backgrounds' / 'insurance.webp'), 'alt': 'AI 生成示意照片：家居桌面上的文件、房屋模型與雨傘。'},
    'work': {'src': data_image(ASSETS / 'fraud-domain-backgrounds' / 'work.webp'), 'alt': 'AI 生成示意照片：在窗邊閱讀文件的上班族。'},
}
ad_script = (BASE / 'fineprint-ad-cards.js').read_text().replace('__FINEPRINT_AD_IMAGES__', js_json(images))
start = s.index('const fresh=')
end = s.index('let state=restore();', start)
state_code = r'''const fresh=()=>({version:2,view:'home',caseId:null,selected:[],answer:null,questionOpen:false,completed:[],generated:[]});
function restore(){
 const next=fresh();
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(!saved||![1,2].includes(saved.version))return next;
  const seen=new Set();
  if(saved.version===2&&Array.isArray(saved.generated))for(const e of saved.generated){
   if(!e||typeof e.id!=='string'||!/^generated-[1-9]\d*$/.test(e.id)||!Number.isSafeInteger(Number(e.id.slice(10)))||seen.has(e.id)||!TEMPLATE_MAP.has(e.templateId)||!Number.isInteger(e.seed)||e.seed<0||e.seed>4294967295)continue;
   const entry={id:e.id,templateId:e.templateId,seed:e.seed};seen.add(e.id);next.generated.push(entry);CASES.push(makeGenerated(entry));
  }
  next.completed=CASES.filter(c=>Array.isArray(saved.completed)&&saved.completed.includes(c.id)).map(c=>c.id);
  const c=CASES.find(c=>c.id===saved.caseId);if(c){next.caseId=c.id;next.view=['home','challenge','result'].includes(saved.view)?saved.view:'home';next.selected=c.clauses.filter(q=>Array.isArray(saved.selected)&&saved.selected.includes(q.id)).map(q=>q.id);next.answer=c.questions.some(q=>q.id===saved.answer)?saved.answer:null;next.questionOpen=Boolean(saved.questionOpen)}
  return next;
 }catch{return next}
}
'''
s = s[:start] + state_code + s[end:]
generation_script = (BASE / 'fineprint-generation.js').read_text().replace('__FINEPRINT_HERO_IMAGE__', js_json(data_image(ASSETS / 'home-card-backgrounds' / 'fineprint.webp')))
helper = 'const EXTRA_CASES=' + js_json(extras) + ';\n' + generation_script + '\n' + ad_script
s = s.replace('const esc=value=>', helper + '\nconst esc=value=>', 1)
s = s.replace("if(!button||!root.contains(button))return;if(button.dataset.case)", "if(!button||button.disabled||!root.contains(button))return;if(button.dataset.action==='generate'){generateChallenge();return}if(generating)return;if(button.dataset.case)", 1)
assert '__FINEPRINT_' not in s
(BASE / 'fineprint-fragment.html').write_text(s)
print('Built finance fineprint: 3 base cases, 3 template variants, embedded photo cards and original interactive flow.')
