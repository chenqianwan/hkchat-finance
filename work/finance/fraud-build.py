"""Build the independent Finance fraud fragment. Run from any working directory."""
from pathlib import Path
import base64,json,runpy
base=Path(__file__).resolve().parent
runpy.run_path(str(base/'fraud-data.py'),run_name='__main__')
cases=json.loads((base/'fraud-cases.json').read_text())
domains=json.loads((base/'fraud-domains.json').read_text())
for c in cases.values():
 assert len(c['suspects'])==3 and len(c['evidence'])==3
 for p in c['suspects']:
  assert len(p['rounds'])==5
  for r in range(1,6):assert len([q for q in c['questions'] if q['suspectId']==p['id'] and q['round']==r])==2
assert all(d['cases'] for d in domains)
assets=base.parent.parent/'outputs'
def image(path):return 'data:image/webp;base64,'+base64.b64encode(path.read_bytes()).decode('ascii')
photos={d['id']:image(assets/'fraud-domain-backgrounds'/f"{d['photo']}.webp") for d in domains}
views=(base/'fraud-domain-views.js').read_text().replace('__FRAUD_DOMAIN_PHOTOS__',json.dumps(photos)).replace('__FRAUD_HUB_PHOTO__',json.dumps(image(assets/'home-card-backgrounds'/'fraud.webp')))
js=(base/'fraud-generator.js').read_text()+'\n'+(base/'fraud-mobile.js').read_text()
for token,value in {'__FRAUD_CASE_DATA__':json.dumps(cases,ensure_ascii=False),'__FRAUD_DOMAIN_DATA__':json.dumps(domains,ensure_ascii=False),'__FRAUD_DOMAIN_VIEWS__':views,'__FRAUD_INTERVIEWS__':(base/'fraud-interviews.js').read_text(),'__FRAUD_CONVERSATION__':(base/'fraud-conversation.js').read_text()}.items():js=js.replace(token,value)
assert '__FRAUD_' not in js
js=js.replace('</script','<\\/script')
css=(base/'fraud-mobile.css').read_text()
markup='<div id="hkdetect"><header class="d-top">HKChat Finance</header><main class="d-main"><div id="d-hero-placeholder"></div><div id="d-content"></div><p id="d-status" class="d-live" role="status" aria-live="polite"></p></main><dialog id="d-dialog" aria-labelledby="d-dialog-title"></dialog></div>'
(base/'fraud-fragment.html').write_text('<style>'+css+'</style>\n'+markup+'\n<script>'+js+'</script>\n')
print('Built work/finance/fraud-fragment.html: 3 domains, 6 cases, 180 role/round prompts')

# Optional isolated preview for component QA; production navigation is integrated by build-site.py.
if '--preview' in __import__('sys').argv:
 shared=(base/'hkchat-product.css').read_text()
 icons=(base/'lucide.min.js').read_text()
 head='<!doctype html><html lang="zh-HK"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif}'+shared+'</style></head><body><script>'+icons+'</script>'
 (base/'fraud-preview.html').write_text(head+(base/'fraud-fragment.html').read_text()+'</body></html>')
