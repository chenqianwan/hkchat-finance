"""Export an independent HKChat Finance static site without changing HKChat Legal."""
from pathlib import Path
import base64, json, re, subprocess, sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / 'outputs/hkchat-finance'
OUT.mkdir(parents=True, exist_ok=True)
GAME_APPS = [('quiz','財智快打','trophy'),('spot','金融大找茬','scan-eye'),('fineprint','金融細字挑戰','file-search'),('fraud','金融防騙局','scan-search')]

ROLES = json.loads((HERE/'role-apps.json').read_text())
ROLE_GROUPS = json.loads((HERE/'role-groups.json').read_text())
ROLE_BY_KEY = {r['key']:r for r in ROLES}
assert sorted(key for group in ROLE_GROUPS for key in group['members']) == sorted(ROLE_BY_KEY), 'Every role must belong to exactly one group'
ROLE_APPS = [(r['key'],r['title'],r['icon']) for r in ROLES]
APPS = ROLE_APPS + GAME_APPS

def group_link(group):
    return f"hkchat-{group['members'][0]}-mobile.html" if len(group['members'])==1 else 'index.html#role-'+group['key']

def photo(name):
    return 'data:image/webp;base64,' + base64.b64encode((OUT/'assets'/name).read_bytes()).decode()

def home():
    source = (HERE/'home-mobile-template.html').read_text()
    cards = {m[0]: m[1] for m in re.findall(r'(<article class="home-app" data-app="([^"]+)">.*?</article>)', source, flags=re.S) for m in [(m[1],m[0])]}
    selected=[]
    details={
      'quiz':('quiz','財智快打','一人闖五關，試玩財智 PK。'),
      'spot':('share','金融大找茬','一張生活圖，搵出三處金融疑點。'),
      'fineprint':('fineprint','金融細字挑戰','宣傳好吸引，細字有咩條件？'),
      'fraud':('fraud','金融防騙局','聽佢點講，追問線索再判斷。')}
    for key,(old,title,desc) in details.items():
        card=cards[old].replace(f'data-app="{old}"',f'data-app="{key}"').replace(f'data-howto="{old}"',f'data-howto="{key}"')
        card=card.replace('hkchat-share-mobile.html','hkchat-spot-mobile.html')
        card=re.sub(r'__HOME_PHOTO_[A-Z]+__',lambda m:photo(f'home-{key}.webp'),card)
        card=re.sub(r'(aria-label=")查看[^"]+的玩法',lambda m:m[1]+'查看'+title+'的玩法',card)
        card=re.sub(r'(<a class="home-card-link"[^>]+>).*?(</a>)',lambda m:m[1]+title+m[2],card,flags=re.S)
        card=re.sub(r'(<p id="home-[^"]+-desc">).*?(</p>)',lambda m:m[1]+desc+m[2],card,flags=re.S)
        card=card.replace('揀選法律闖關模式','揀選財智闖關模式').replace('線上 PK','PK 對戰')
        selected.append(card)
    source=re.sub(r'(<section class="home-grid"[^>]*>).*?(</section>)',lambda m:m[1]+'\n'+''.join(selected)+'\n'+m[2],source,count=1,flags=re.S)
    source=source.replace('HKChat Legal','HKChat Finance').replace('生活法律，','生活金融，').replace('由細字到街坊事，揀個情境試吓。','揀個身份做主角，或者玩個生活挑戰。').replace('揀選生活法律應用','揀選金融生活應用').replace('從日常小事，識多一點。','AI 情境演示 · 玩住識金融')
    howto={
      'quiz':{'intro':'自己闖五關，或者試玩一場財智 PK。','steps':[['揀一種玩法','銀行、保障或日常理財，揀個情境生成五關挑戰。'],['作答，再睇解說','每題揀一個答案，睇清理由和知識來源；單人模式會按作答調整後面的題目。'],['睇結果，再挑戰','回看本局得分和重點。PK 目前使用演示對手，體驗同題比拼。']]},
      'spot':{'intro':'一張 AI 生活圖，藏住三處值得留意的金融細節。','steps':[['揀個金融場景','從服務枱、保障諮詢、金融群組揀一幕，也可以輸入題材配對情境。'],['點出三處疑點','直接點圖片找細節；卡住可以用提示，或改用文字找。'],['睇解說，再換一幕','對照每處細節與教育資料來源，隨時看答案或開始下一幕。']]},
      'fineprint':{'intro':'廣告講得吸引，對照細字才知道適用條件。','steps':[['揀張虛構廣告','從金融服務場景開始，或生成另一張條款挑戰。'],['點出重要條件','選出需要再問清楚的細字；也可以點預設問題了解更多。'],['提交，再睇發現','逐條對照理由，分清宣傳、限制與一般說明，再玩下一局。']]},
      'fraud':{'intro':'三位虛構角色，各有說法。由你追問，再找出誤導風險。','steps':[['揀個金融話題','從銀行資料、保障服務或金融群組揀一個場景，也可輸入題材。'],['有疑問，就追問','每輪可揀一位角色，點預設問題或自己打字，再對照記錄。'],['隨時作出判斷','最多五輪，隨時可以收尾。結果會展示線索和核實方法。']]}}
    for group in ROLE_GROUPS:
        howto[group['key']] = {'intro':group['intro'],'steps':group['steps']}
        if len(group['members'])>1:
            howto[group['key']]['modes'] = [ROLE_BY_KEY[key] for key in group['members']]
    rolecards=[]
    for group in ROLE_GROUPS:
        key,title=group['key'],group['title']
        attrs=' data-role-group="'+key+'" aria-haspopup="dialog" aria-controls="home-howto" aria-expanded="false"' if len(group['members'])>1 else ''
        rolecards.append('<article class="home-app" data-app="'+key+'"><div class="home-photo-layer" aria-hidden="true"><img src="'+photo('role-'+group['photo']+'.webp')+'" width="800" height="600" alt="" decoding="async" loading="lazy"></div><div class="home-card-top"><button class="home-info" type="button" data-howto="'+key+'" aria-label="查看'+title+'的玩法" aria-haspopup="dialog" aria-controls="home-howto" aria-expanded="false"><span>玩法</span><i data-lucide="chevron-down" aria-hidden="true"></i></button></div><h2><a class="home-card-link" href="'+group_link(group)+'"'+attrs+' aria-describedby="home-'+key+'-desc">'+title+'</a></h2><p id="home-'+key+'-desc">'+group['description']+'</p></article>')
    tabs='<div class="home-collections" role="tablist" aria-label="選擇體驗類型"><button type="button" id="home-roles-tab" role="tab" aria-selected="true" aria-controls="home-roles" data-collection="roles">角色體驗 <span>'+str(len(ROLE_GROUPS))+'</span></button><button type="button" id="home-games-tab" role="tab" aria-selected="false" aria-controls="home-games" tabindex="-1" data-collection="games">生活挑戰 <span>4</span></button></div>'
    rolepanel='<section class="home-grid" id="home-roles" role="tabpanel" aria-labelledby="home-roles-tab">'+''.join(rolecards)+'</section>'
    source=source.replace('<section class="home-grid" aria-label="揀選金融生活應用">',tabs+rolepanel+'<section class="home-grid" id="home-games" role="tabpanel" aria-labelledby="home-games-tab" hidden>')
    source=source.replace('AI 情境演示 · 玩住識金融','<span id="home-mode-note">虛構職場 · 揀個情境即刻玩</span>')
    source=source.replace('</style>',(HERE/'home-roles.css').read_text()+'</style>',1)
    source+='\n<script>'+ (HERE/'home-roles.js').read_text()+'</script>\n'
    source=re.sub(r'<script>\s*\{\s*const HOWTO = .*?</script>',lambda m:'<script>(()=>{const HOWTO = '+json.dumps(howto,ensure_ascii=False)+';\n'+(HERE/'home-howto.js').read_text()+'\n})();</script>',source,count=1,flags=re.S)
    source=source.replace('</style>','\n#hkhome .home-app{min-height:226px}#hkhome .home-app[data-app="quiz"] h2{min-height:25px}#hkhome .home-app[data-app="spot"] .home-photo-layer img{object-position:center 33%}#hkhome .home-note{margin-bottom:14px}\n</style>',1)
    (HERE/'home-fragment.html').write_text(source)
    return source

pages=[('index.html','首頁','house')]+[(f'hkchat-{key}-mobile.html',title,icon) for key,title,icon in APPS]
mark='data:image/svg+xml;base64,'+base64.b64encode((HERE/'hkchat-official-mark.svg').read_bytes()).decode()
def header(current):
    entries=[('index.html','首頁' if current=='index.html' else '返回首頁','house',['index.html'])]
    entries += [(group_link(g),g['title'],g['icon'],[f'hkchat-{key}-mobile.html' for key in g['members']]) for g in ROLE_GROUPS]
    entries += [(f'hkchat-{key}-mobile.html',title,icon,[f'hkchat-{key}-mobile.html']) for key,title,icon in GAME_APPS]
    links=''
    for index,(file,title,icon,members) in enumerate(entries):
        if index==1: links+='<p class="p-nav-group">角色體驗</p>'
        if index==1+len(ROLE_GROUPS): links+='<p class="p-nav-group">生活挑戰</p>'
        active=' aria-current="page"' if current in members else ''
        links+=f'<a href="{file}"{active}><i data-lucide="{icon}" aria-hidden="true"></i>{title}</a>'
    return '<header class="p-header"><div class="p-heading"><button class="p-menu-button" type="button" aria-label="打開金融導航" aria-controls="p-navigation" aria-expanded="false"><i data-lucide="menu" aria-hidden="true"></i></button><a class="p-wordmark" href="index.html" aria-label="HKChat Finance 首頁"><img class="p-brand-mark" src="'+mark+'" width="27" height="26" alt="" aria-hidden="true">HKChat</a></div><span class="p-section-pill">Finance</span><nav class="p-nav" id="p-navigation" aria-label="金融功能" hidden>'+links+'</nav></header>'

reset=(HERE/'hkchat-refresh-reset.js').read_text().replace("startsWith('hkchat-')","startsWith('hkchat-finance')")
shim=reset+"\nwindow.openai={widgetState:null,setWidgetState:async function(next){this.widgetState=next;}};"
mobile='html,body{margin:0;padding:0!important;width:100%;min-height:100%;overflow-x:clip;scroll-behavior:auto;color-scheme:light dark;background:light-dark(#fff,#17151b)}body{display:block}@media(min-width:481px){body{background:light-dark(#f7f7f8,#100e13)}}:is(#hkhome,#hkquiz,#hkspot,#hkfineprint,#hkdetect,#hkroles){min-height:100svh;min-height:100dvh;max-width:480px;margin:0 auto;border-radius:0!important}input,textarea,select{font-size:16px}button,a,input,select,textarea,summary{touch-action:manipulation}button{-webkit-tap-highlight-color:transparent}noscript{display:block;padding:24px;font:16px sans-serif}'
product=(HERE/'hkchat-product.css').read_text().replace(',#hkspot)',',#hkspot,#hkroles)')+'\n#hkroles{max-width:480px;margin:auto;background:var(--p-bg);color:var(--p-text);color-scheme:light dark}#hkroles [hidden]{display:none!important}.p-nav-group{font-size:11px;color:var(--p-muted);margin:8px 13px 4px;letter-spacing:.4px}#hkroles [data-focus][tabindex=\"-1\"]:focus{outline:none}\n'
runtime=(HERE/'hkchat-product.js').read_text().replace(',#hkspot\'',',#hkspot,#hkroles\'')
vendor=(HERE/'lucide.min.js').read_text().replace('</script','<\\/script')
fragments={'index.html':home()}
for key,_,_ in APPS:
    path=HERE/f'{key}-fragment.html'
    if path.exists(): fragments[f'hkchat-{key}-mobile.html']=path.read_text()
    elif '--partial' not in sys.argv: raise FileNotFoundError(path)
for file,fragment in fragments.items():
    title=dict((a,b) for a,b,_ in pages)[file]
    fragment=re.sub(r'<header class="(?:p|d)-top">.*?</header>',lambda m:header(file),fragment,count=1,flags=re.S)
    footer='<footer class="p-footer">HKChat · Finance</footer>'
    fragment=fragment.replace('</main>','</main>'+footer if file in {f'hkchat-{key}-mobile.html' for key,_,_ in ROLE_APPS} else footer+'</main>',1)
    html='<!doctype html><html lang="zh-HK"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="color-scheme" content="light dark"><meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#17151b" media="(prefers-color-scheme: dark)"><meta name="description" content="HKChat Finance：職場、銀行、App 設計與財經編輯四組角色體驗，加上四個生活金融小遊戲，香港日常玩住識。"><title>HKChat Finance · '+title+'</title><script>'+shim+'</script><style>'+mobile+'</style></head><body><noscript>請啟用 JavaScript，體驗金融生活小遊戲。</noscript><script>'+vendor+'</script>'+fragment+'<style>'+product+'</style><script>'+runtime+'</script></body></html>'
    (OUT/file).write_text(html)
    print(file,len(html.encode()),'bytes')
(OUT/'.nojekyll').touch()
