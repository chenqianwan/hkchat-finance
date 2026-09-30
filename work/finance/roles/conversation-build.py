"""Rebuild three independent first-person finance conversation fragments."""
from pathlib import Path
import base64, json

HERE = Path(__file__).resolve().parent
FINANCE = HERE.parent
ROOT = FINANCE.parent.parent
ASSETS = ROOT / 'outputs/hkchat-finance/assets'
CONFIGS = {
 'interview':dict(title='中環見工記',kicker='換上應徵者視角',desc='坐低，講出你會點做。三輪對話，練一次有來有往嘅面試。',time='約 4 分鐘',alt='AI 生成示意照片：香港辦公室內進行模擬面試。',fallback='home-quiz.webp'),
 'relationship':dict(title='今日我做客戶經理',kicker='換上客戶經理視角',desc='客戶有啲唔明。邊聽邊問，將資料同未確定嘅事講清楚。',time='約 4 分鐘',alt='AI 生成示意照片：客戶經理在香港辦公室接聽電話。',fallback='home-fraud.webp'),
 'anchor':dict(title='今日我做財經主播',kicker='換上主播視角',desc='將一個金融概念講成人話，接住觀眾追問，寫成你嘅小節目。',time='約 4 分鐘',alt='AI 生成示意照片：香港廣播室內準備文字節目的主播。',fallback='home-fineprint.webp'),
}
css=(HERE/'conversation-shared.css').read_text()
runtime=(HERE/'conversation-shared.js').read_text()
for key,config in CONFIGS.items():
    config={**config,'key':key}
    path=ASSETS/f'role-{key}.webp'
    if not path.exists():
        raise FileNotFoundError(f'Required role hero photo is missing: {path}')
    config.pop('fallback',None)
    config['photo']='data:image/webp;base64,'+base64.b64encode(path.read_bytes()).decode()
    code=(HERE/f'conversation-{key}.js').read_text()
    script='(()=>{\n"use strict";\nconst CONFIG='+json.dumps(config,ensure_ascii=False)+';\n'+runtime+'\n'+code+'\n})();'
    fragment='<style>'+css+'</style>\n<div id="hkroles" data-role-app="'+key+'"><header class="p-top">HKChat Finance</header><main id="role-main"></main><div id="role-announcer" class="cv-sr" aria-live="polite"></div></div>\n<script>'+script.replace('</script','<\\/script')+'</script>\n'
    (FINANCE/f'{key}-fragment.html').write_text(fragment)
    print(f'{key}-fragment.html: {len(fragment.encode())} bytes; photo {path.name}')
