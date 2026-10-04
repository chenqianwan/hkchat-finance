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
let customCase=null,launch=0,scenarioDraft='';
const current=()=>customCase&&customCase.id===s.caseId?customCase:CASES.find(c=>c.id===s.caseId)||CASES[0];
function save(){R.save(customCase&&s.caseId===customCase.id?fresh():s)}
function sessionNote(){return customCase&&s.caseId===customCase.id?'<p class="cv-note">自訂情境按示例資料組合，只保留於今次頁面；重新整理後清除。</p>':''}
function makeCustom(prompt){
 const base=/保障|保單|保单|保險|保险|條款|条款|摘要|除外責任/.test(prompt)?CASES[1]:/結單|结单|通知|登入|登錄|登录|電郵|电邮/.test(prompt)?CASES[0]:null;
 if(base)return {...base,id:'custom',title:'自訂今集：'+prompt,tag:base.tag+' · 自訂',prompt,desc:prompt,
  premise:'你主持虛構文字節目《金融講清楚》。今集由觀眾問題「'+prompt+'」出發，用以下'+(base.id==='statement'?'電子結單':'保障文件')+'示例資料組稿，唔對觀眾嘅真實個案作判斷。',
  seed:'大家好，今集想同大家拆解「'+prompt+'」。我哋先分清問題，再用資料卡講解。',
  opening:'「'+prompt+'」——你會點解釋？'+base.opening,
  example:'圍繞「'+prompt+'」，我哋用以下虛構例子練習。'+base.example,
  followups:base.followups.map(q=>({...q,question:'針對「'+prompt+'」，'+q.question}))};
 return {id:'custom',title:'自訂今集：'+prompt,tag:'觀眾疑問小節目 · 自訂',prompt,desc:prompt,
  premise:'你主持虛構文字節目《金融講清楚》。觀眾提出「'+prompt+'」。今集練習將疑問、已知資料同待核實嘅部分分開講；未有資料支持嘅答案先留待查證。',
  sources:[],sourceNote:'呢個自訂題目未有已核實嘅主題資料。以下係組稿練習提示，唔係事實查證或真實個案答案。',
  fact:'先交代觀眾問緊乜，再分開「已知資料」同「待核實問題」。未有可靠資料支持時，唔好將推測寫成確定結論。',
  seed:'大家好，今集問題係「'+prompt+'」。我哋先整理已知資料，再列出待核實嘅部分。',
  opening:'「'+prompt+'」——要答之前，我哋有邊啲已知資料，又有邊啲仍然待核實？',
  example:'喺今次虛構例子入面，阿晴問「'+prompt+'」，但未有提供原始文件或完整背景。我哋先列出需要核實嘅問題，唔急住替佢落結論。',
  closing:'今集先收好「'+prompt+'」呢個問題：分清已知資料同待核實部分，再查閱相應原始資料。未有依據嘅答案暫時留白。',
  keywords:/已知|資料|资料|核實|核实|查證|查证|推測|推测|結論|结论/,
  followups:[
   {re:/已知|資料|资料/,question:'關於「'+prompt+'」，邊一部分有資料支持，邊一部分仍然待核實？可以喺稿入面分開講嗎？',hint:'今集目前只有觀眾嘅問題，未有足夠主題資料支持確定答案。我哋先列出待核實嘅部分，再查閱原始資料。',label:'已知同待核實嘅分別'},
   {re:/核實|核实|查證|查证|推測|推测|結論|结论/,question:'你提到要核實「'+prompt+'」。未有可靠資料之前，觀眾應該點理解今集嘅答案？',hint:'今集提供嘅係問題整理同組稿示例；冇資料支持嘅部分先保持未確認，唔把推測當作結論。',label:'講清楚答案嘅邊界'}
  ]};
}
function goHome(){launch++;s=fresh();customCase=null;save();home()}

function sourceHTML(){const c=current();return c.sources.length?R.sources(c.sources,c.sourceNote):'<p class="cv-disclosure">'+E(c.sourceNote)+'</p>'}
function facts(){return '<aside class="cv-panel cv-soft cv-context"><strong>今集資料卡</strong><p>'+E(current().fact)+'</p><p class="cv-muted">'+E(current().sourceNote)+'</p></aside>'}
function home(){R.render(R.hero()+window.HKScenario.form({value:scenarioDraft,placeholder:'例如：想用一分鐘講清楚結單通知同完整結單嘅分別',examples:['一分鐘講清楚結單通知同完整結單嘅分別','向新手解釋保障摘要同完整條款','示範點樣分清一條金融消息嘅已知資料同推測']})+'<h2 class="cv-home-heading">或者，由示範題材開始</h2><div class="cv-cases">'+CASES.map((c,i)=>'<button class="cv-case" data-case="'+c.id+'"><span>題目 '+String(i+1).padStart(2,'0')+' · '+E(c.tag)+'</span><strong>'+E(c.title)+'</strong><small>'+E(c.desc)+'</small><span class="cv-start-hint">開一個文字節目 →</span></button>').join('')+'</div><p class="cv-note">組稿、接觀眾追問、修成一篇可分享嘅節目稿。</p>'+R.note());window.HKScenario.bind(main,prompt=>{scenarioDraft=prompt;customCase=makeCustom(prompt);return start(customCase.id)})}
function compose(){const c=current();R.render(R.top(c.tag)+R.steps(['組一版稿','接觀眾追問','收好節目'],0)+'<h1>我嘅節目編輯枱</h1><p class="cv-muted cv-gap-sm">'+E(c.premise)+'</p>'+sessionNote()+facts()+R.field('anchor-script','第一版節目稿',s.draft,'用一個疑問開場，再加例子同重點。',1800,true)+'<div class="cv-script-tools"><button class="cv-chip" data-chunk="opening">換成疑問式開場</button><button class="cv-chip" data-chunk="example">加一個虛構例子 ＋</button><button class="cv-chip" data-chunk="fact">加資料卡解釋 ＋</button><button class="cv-chip" data-chunk="closing">加一句收尾 ＋</button></div><div class="cv-actions">'+R.btn('將首版畀觀眾睇','preview')+'</div><p class="cv-note">文字節目 · 無須錄音或開咪</p>'+sourceHTML()+R.note());R.bindField('anchor-script',v=>{s.draft=v;save()})}
function audience(text){
 const c=current(),script=c.prompt?text.split(c.prompt).join(''):text;if(!c.keywords.test(script))return {question:'呢段稿未配對到今集概念。可唔可以用資料卡，補一句同「'+c.title+'」有關嘅解釋？',hint:c.fact,label:'補回今集概念',unknown:true};
 const q=c.followups.find(f=>f.re.test(script))||c.followups[1];return {...q,unknown:false};
}
function revise(){
 if(!s.audience){s.audience=audience(s.initial);save()}
 R.render(R.top(current().tag)+R.steps(['組一版稿','接觀眾追問','收好節目'],1)+'<h1>觀眾仲有一個疑問</h1><section class="cv-audience"><span>觀眾阿悅 · 預設追問</span><p>'+E(s.audience.question)+'</p></section><div class="cv-coach"><strong>編輯提示</strong><p>'+E(s.audience.unknown?'呢段自由稿未配對到情境關鍵字，演示未能評估意思。可以保留你嘅寫法，再補上資料卡概念。':'今次根據首版出現嘅詞，追問「'+s.audience.label+'」。試吓將答案直接寫入節目稿，等下一位觀眾都睇得明。')+'</p></div>'+R.field('anchor-script','修訂版節目稿',s.draft,'將觀眾想知道嘅解釋寫入稿。',1800,true)+'<div class="cv-presets"><button class="cv-chip" data-action="hint">將資料卡提示加到稿尾 ＋</button><button class="cv-chip" data-action="restore">回看首版，再改</button></div><details class="cv-compare"><summary>對照已交畀觀眾嘅首版</summary><div><p>'+E(s.initial)+'</p></div></details><div class="cv-actions">'+R.btn('完成今集文字節目','finish')+'</div>'+sourceHTML()+R.note());R.bindField('anchor-script',v=>{s.draft=v;save()})
}
function differences(){const old=s.initial.split(/\n+/).map(x=>x.trim()).filter(Boolean),now=s.final.split(/\n+/).map(x=>x.trim()).filter(Boolean);return now.filter(x=>!old.includes(x))}
function episodeText(){const c=current();return '《金融講清楚》｜'+c.title+'\n虛構主播練習 · 文字節目\n\n'+s.final+'\n\n概念資料：\n'+(c.sources.length?c.sources.map(x=>x.name+'\n'+x.url).join('\n'):c.sourceNote)+'\n\n預設角色／情境演示；節目稿由使用者編輯。'}
function result(){const c=current(),added=differences(),changed=s.initial.trim()!==s.final.trim();R.render(R.top(c.tag)+R.steps(['組一版稿','接觀眾追問','收好節目'],2)+'<section class="cv-result-title"><span class="cv-kicker">我嘅文字節目</span><h1>今集，講到呢度</h1><p class="cv-muted">你編輯嘅稿已經收好，可以複製分享。</p></section><article class="cv-paper"><span class="cv-kicker">《金融講清楚》 · 虛構主播練習</span><h2>'+E(c.title)+'</h2><div class="cv-episode" id="anchor-episode">'+E(s.final)+'</div></article><section class="cv-coach"><strong>今次修訂記錄</strong><p>'+E(changed?'你修改咗首版。以下對照會保留原文，同新增或改寫嘅段落，方便自己判斷有冇答到觀眾。':'今次定稿同首版一樣，未有文字改動。你可以再編輯，加入觀眾追問嘅解釋。')+'</p><p>'+E(c.keywords.test(c.prompt?s.final.split(c.prompt).join(''):s.final)?'稿件配對到今集概念用詞；呢個只係文字線索，唔代表內容已經核實或講解完整。':'定稿未配對到今集概念用詞，演示無法評估自由稿嘅意思。')+'</p></section><details class="cv-compare" open><summary>睇清楚首版同修訂</summary><div><strong>首版 · '+s.initial.length+' 字</strong><p>'+E(s.initial)+'</p></div><div><strong>修訂版 · '+s.final.length+' 字</strong>'+(added.length?added.map(t=>'<p class="cv-newline">'+E(t)+'</p>').join(''):'<p>'+(changed?'本次刪減咗首版內容，冇新增段落。':'文字維持不變。')+'</p>')+'</div></details><div class="cv-actions">'+R.btn('複製完整節目稿','copy')+R.btn('再改一改','edit',true)+R.btn('開另一集','home',true)+'</div>'+sourceHTML()+R.note())}
function render(){({home,compose,revise,result}[s.view]||home)()}
async function start(id){const c=customCase&&customCase.id===id?customCase:CASES.find(c=>c.id===id);if(!c)return;const ticket=++launch,ready=await window.HKScenario.prepare(main,{label:'整理節目題目，生成觀眾問題',prompt:c.prompt||c.desc,onCancel:goHome});if(!ready||ticket!==launch)return;s={...fresh(),view:'compose',caseId:id,draft:c.seed};save();render()}
main.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;if(b.dataset.case){start(b.dataset.case);return}
 if(b.dataset.chunk){const key=b.dataset.chunk,c=current();let text=s.draft;if(key==='opening'){const lines=text.split(/\n/);lines[0]=c.opening;text=lines.join('\n')}else{text+=(text?'\n\n':'')+c[key]}if(text.length>1800){R.error('稿件接近字數上限，請先刪減少少。');return}R.fill('anchor-script',text);return}
 const a=b.dataset.action;
 if(a==='home')goHome();
 if(a==='preview'){if(s.draft.trim().length<8){R.error('先寫一兩句節目內容，或者用起稿提示。');return}s.initial=s.draft.trim();s.audience=audience(s.initial);s.view='revise';save();R.prepare('觀眾睇緊你嘅首版',render)}
 if(a==='hint'){const text=s.draft+(s.draft?'\n\n':'')+s.audience.hint;if(text.length>1800){R.error('稿件接近字數上限，請先刪減少少。');return}R.fill('anchor-script',text)}
 if(a==='restore'){R.fill('anchor-script',s.initial);R.say('已將首版放回編輯欄，可以再修改。')}
 if(a==='finish'){if(s.draft.trim().length<8){R.error('留低一兩句節目內容，再完成今集。');return}s.final=s.draft.trim();s.view='result';save();R.prepare('排好你嘅文字節目',render)}
 if(a==='edit'){s.view='revise';s.draft=s.final;save();revise()}
 if(a==='copy')R.copy(episodeText(),b);
});
render();
