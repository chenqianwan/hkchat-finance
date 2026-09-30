const CASES=[
 {id:'statement',title:'電子結單，點解仲要登入？',tag:'銀行服務小概念',desc:'將通知、結單同登入驗證分開講，解答觀眾嘅疑惑。',premise:'你主持一個虛構文字節目《金融講清楚》。今集聽眾阿彤收到結單通知，以為電郵本身就係完整結單。',sources:[{name:'金管局｜常見問題：電子銀行（F2）',url:'https://www.hkma.gov.hk/chi/smart-consumers/frequently-asked-questions/'}],sourceNote:'金管局常見問題 F2 解釋，部分銀行要求登入以核實身分、保護電子結單等客戶資料。各機構安排可能不同。',fact:'部分銀行會要求客戶登入網上銀行先查閱電子結單；登入程序可用嚟核實身分，同保護系統內嘅客戶資料。',seed:'大家好，今日講電子結單。收到通知，就去睇結單啦。',opening:'收到「有新結單」嘅通知，點解仲要登入？通知同結單本身，可以係兩樣嘢。',example:'喺今次虛構例子入面，阿彤收到嘅電郵只係通知；完整結單要經銀行指定嘅登入程序先睇到。',closing:'記住今集兩個重點：分清通知同文件；登入程序可以用嚟核實身分。實際查閱安排要睇有關銀行說明。',keywords:/通知|結單|登入|身分|身份/,followups:[
 {re:/核實|身分|身份|保護/,question:'你講咗核實身分。咁收到一封通知，係咪已經等於手上有完整結單？',hint:'通知內容未必就係完整結單。今次例子嘅通知只係提示有新文件，完整結單仍然要按指定程序查閱。',label:'通知同文件嘅分別'},
 {re:/通知|結單|登入/,question:'我明白要登入，但點解唔直接喺電郵睇晒？登入係為咗做啲咩？',hint:'部分銀行以登入程序核實客戶身分，保護系統內嘅客戶資料；所以通知電郵同查閱完整結單可以分開。',label:'登入程序嘅用途'}]},
 {id:'policy',title:'保障摘要，係咪已經講晒？',tag:'保障文件小概念',desc:'用一頁摘要同完整條款嘅分別，示範點樣講清楚資料邊界。',premise:'你主持一個虛構文字節目《金融講清楚》。今集聽眾阿健只睇過一頁保障摘要，仲未打開完整保單。唔涉及任何真實產品。',sources:[{name:'投委會｜申請投保：查閱保單條件',url:'https://www.ifec.org.hk/web/tc/financial-products/insurance/basics/applying-for-insurance.page'}],sourceNote:'投委會說明保單列出保障期、條件及除外責任等細節。本集只解釋閱讀文件嘅概念，冇評估任何真實保障。',fact:'保單會列出保障期、條件及除外責任等細節。「除外責任」講嘅係保單唔承保嘅風險或事故。',seed:'大家好，今日講保障文件。先睇摘要，了解內容，就係咁簡單。',opening:'一頁摘要好易睇，但係咪已經講晒？今集用一份虛構文件，分清重點介紹同完整細節。',example:'喺今次虛構例子入面，摘要寫「指定活動」，但未列出活動清單。阿健單憑呢一頁，未知道指定範圍同限制。',closing:'閱讀時可以分開三件事：保障寫咗乜、適用條件係乜、邊啲屬除外責任。摘要未有交代嘅部分，仍然要對照完整保單。',keywords:/摘要|條款|保單|除外責任|條件|範圍/,followups:[
 {re:/除外責任/,question:'你提到「除外責任」。可以用一句日常說話解釋呢個詞，唔好只係讀個名？',hint:'簡單講，除外責任就係保單唔承保嘅風險或事故。要知道寫咗邊啲，仍然要睇返完整保單。',label:'除外責任嘅白話解釋'},
 {re:/摘要|條款|保單|條件|範圍/,question:'如果一頁摘要冇寫某個限制，係咪代表一定冇呢個限制？',hint:'摘要未提到，唔代表完整保單一定冇相關條件；要對照保障期、條件及除外責任等細節，先知道文件實際寫咗乜。',label:'摘要未寫嘅部分'}]}
];
const fresh=()=>({version:1,view:'home',caseId:null,draft:'',initial:'',final:'',audience:null,reflection:''});
let s=R.load(fresh());if(!['home','compose','revise','result'].includes(s.view)||(!CASES.some(c=>c.id===s.caseId)&&s.view!=='home'))s=fresh();
const current=()=>CASES.find(c=>c.id===s.caseId)||CASES[0];
function sourceHTML(){const c=current();return R.sources(c.sources,c.sourceNote)}
function facts(){return '<aside class="cv-panel cv-soft cv-context"><strong>今集資料卡</strong><p>'+E(current().fact)+'</p><p class="cv-muted">'+E(current().sourceNote)+'</p></aside>'}
function home(){R.render(R.hero()+'<h2 class="cv-home-heading">今集，你想講邊個題目？</h2><div class="cv-cases">'+CASES.map((c,i)=>'<button class="cv-case" data-case="'+c.id+'"><span>題目 '+String(i+1).padStart(2,'0')+' · '+E(c.tag)+'</span><strong>'+E(c.title)+'</strong><small>'+E(c.desc)+'</small><span class="cv-start-hint">開一個文字節目 →</span></button>').join('')+'</div><p class="cv-note">組稿、接觀眾追問、修成一篇可分享嘅節目稿。</p>'+R.note())}
function compose(){const c=current();R.render(R.top(c.tag)+R.steps(['組一版稿','接觀眾追問','收好節目'],0)+'<h1>我嘅節目編輯枱</h1><p class="cv-muted cv-gap-sm">'+E(c.premise)+'</p>'+facts()+R.field('anchor-script','第一版節目稿',s.draft,'用一個疑問開場，再加例子同重點。',1800,true)+'<div class="cv-script-tools"><button class="cv-chip" data-chunk="opening">換成疑問式開場</button><button class="cv-chip" data-chunk="example">加一個虛構例子 ＋</button><button class="cv-chip" data-chunk="fact">加資料卡解釋 ＋</button><button class="cv-chip" data-chunk="closing">加一句收尾 ＋</button></div><div class="cv-actions">'+R.btn('將首版畀觀眾睇','preview')+'</div><p class="cv-note">文字節目 · 無須錄音或開咪</p>'+sourceHTML()+R.note());R.bindField('anchor-script',v=>{s.draft=v;R.save(s)})}
function audience(text){
 const c=current();if(!c.keywords.test(text))return {question:'呢段稿未配對到今集概念。可唔可以用資料卡，補一句同「'+c.title+'」有關嘅解釋？',hint:c.fact,label:'補回今集概念',unknown:true};
 const q=c.followups.find(f=>f.re.test(text))||c.followups[1];return {...q,unknown:false};
}
function revise(){
 if(!s.audience){s.audience=audience(s.initial);R.save(s)}
 R.render(R.top(current().tag)+R.steps(['組一版稿','接觀眾追問','收好節目'],1)+'<h1>觀眾仲有一個疑問</h1><section class="cv-audience"><span>觀眾阿悅 · 預設追問</span><p>'+E(s.audience.question)+'</p></section><div class="cv-coach"><strong>編輯提示</strong><p>'+E(s.audience.unknown?'呢段自由稿未配對到情境關鍵字，演示未能評估意思。可以保留你嘅寫法，再補上資料卡概念。':'今次根據首版出現嘅詞，追問「'+s.audience.label+'」。試吓將答案直接寫入節目稿，等下一位觀眾都睇得明。')+'</p></div>'+R.field('anchor-script','修訂版節目稿',s.draft,'將觀眾想知道嘅解釋寫入稿。',1800,true)+'<div class="cv-presets"><button class="cv-chip" data-action="hint">將資料卡提示加到稿尾 ＋</button><button class="cv-chip" data-action="restore">回看首版，再改</button></div><details class="cv-compare"><summary>對照已交畀觀眾嘅首版</summary><div><p>'+E(s.initial)+'</p></div></details><div class="cv-actions">'+R.btn('完成今集文字節目','finish')+'</div>'+sourceHTML()+R.note());R.bindField('anchor-script',v=>{s.draft=v;R.save(s)})
}
function differences(){const old=s.initial.split(/\n+/).map(x=>x.trim()).filter(Boolean),now=s.final.split(/\n+/).map(x=>x.trim()).filter(Boolean);return now.filter(x=>!old.includes(x))}
function episodeText(){const c=current();return '《金融講清楚》｜'+c.title+'\n虛構主播練習 · 文字節目\n\n'+s.final+'\n\n概念資料：\n'+c.sources.map(x=>x.name+'\n'+x.url).join('\n')+'\n\n預設角色／情境演示；節目稿由使用者編輯。'}
function result(){const c=current(),added=differences(),changed=s.initial.trim()!==s.final.trim();R.render(R.top(c.tag)+R.steps(['組一版稿','接觀眾追問','收好節目'],2)+'<section class="cv-result-title"><span class="cv-kicker">我嘅文字節目</span><h1>今集，講到呢度</h1><p class="cv-muted">你編輯嘅稿已經收好，可以複製分享。</p></section><article class="cv-paper"><span class="cv-kicker">《金融講清楚》 · 虛構主播練習</span><h2>'+E(c.title)+'</h2><div class="cv-episode" id="anchor-episode">'+E(s.final)+'</div></article><section class="cv-coach"><strong>今次修訂記錄</strong><p>'+E(changed?'你修改咗首版。以下對照會保留原文，同新增或改寫嘅段落，方便自己判斷有冇答到觀眾。':'今次定稿同首版一樣，未有文字改動。你可以再編輯，加入觀眾追問嘅解釋。')+'</p><p>'+E(c.keywords.test(s.final)?'稿件配對到今集概念用詞；呢個只係文字線索，唔代表內容已經核實或講解完整。':'定稿未配對到今集概念用詞，演示無法評估自由稿嘅意思。')+'</p></section><details class="cv-compare" open><summary>睇清楚首版同修訂</summary><div><strong>首版 · '+s.initial.length+' 字</strong><p>'+E(s.initial)+'</p></div><div><strong>修訂版 · '+s.final.length+' 字</strong>'+(added.length?added.map(t=>'<p class="cv-newline">'+E(t)+'</p>').join(''):'<p>'+(changed?'本次刪減咗首版內容，冇新增段落。':'文字維持不變。')+'</p>')+'</div></details><div class="cv-actions">'+R.btn('複製完整節目稿','copy')+R.btn('再改一改','edit',true)+R.btn('開另一集','home',true)+'</div>'+sourceHTML()+R.note())}
function render(){({home,compose,revise,result}[s.view]||home)()}
function start(id){const c=CASES.find(c=>c.id===id);s={...fresh(),view:'compose',caseId:id,draft:c.seed};R.save(s);R.prepare('開好今集嘅編輯枱',render)}
main.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;if(b.dataset.case){start(b.dataset.case);return}
 if(b.dataset.chunk){const key=b.dataset.chunk,c=current();let text=s.draft;if(key==='opening'){const lines=text.split(/\n/);lines[0]=c.opening;text=lines.join('\n')}else{text+=(text?'\n\n':'')+c[key]}if(text.length>1800){R.error('稿件接近字數上限，請先刪減少少。');return}R.fill('anchor-script',text);return}
 const a=b.dataset.action;
 if(a==='home'){s=fresh();R.save(s);home()}
 if(a==='preview'){if(s.draft.trim().length<8){R.error('先寫一兩句節目內容，或者用起稿提示。');return}s.initial=s.draft.trim();s.audience=audience(s.initial);s.view='revise';R.save(s);R.prepare('觀眾睇緊你嘅首版',render)}
 if(a==='hint'){const text=s.draft+(s.draft?'\n\n':'')+s.audience.hint;if(text.length>1800){R.error('稿件接近字數上限，請先刪減少少。');return}R.fill('anchor-script',text)}
 if(a==='restore'){R.fill('anchor-script',s.initial);R.say('已將首版放回編輯欄，可以再修改。')}
 if(a==='finish'){if(s.draft.trim().length<8){R.error('留低一兩句節目內容，再完成今集。');return}s.final=s.draft.trim();s.view='result';R.save(s);R.prepare('排好你嘅文字節目',render)}
 if(a==='edit'){s.view='revise';s.draft=s.final;R.save(s);revise()}
 if(a==='copy')R.copy(episodeText(),b);
});
render();
