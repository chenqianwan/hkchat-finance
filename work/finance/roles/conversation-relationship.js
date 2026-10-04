const CASES=[
 {id:'notice',title:'通知設定，算完成未？',tag:'電子服務來電',desc:'客戶交咗更改電子結單通知方式嘅申請，卻未收到完成訊息。',caller:'阿琪',opening:'我昨日已經撳咗提交，點解通知方式仲係舊嗰個？交咗申請唔係即刻轉好咩？',context:'你係虛構「小島服務室」嘅客戶經理。阿琪來電問電子結單通知設定。螢幕只顯示「收到申請」，你未見到完成記錄。',facts:[
 {id:'status',title:'畫面狀態',text:'「收到申請」代表申請已記錄；本局尚未顯示「設定完成」。',line:'我而家見到「收到申請」，未見到「設定完成」，所以未能確認已經更改。',re:/收到申請|未見.*完成|唔等於.*完成/},
 {id:'channel',title:'通知安排',text:'虛構服務會喺設定完成後，以應用程式內訊息通知；提交畫面唔係完成通知。',line:'按呢份服務卡，設定完成後會有應用程式內訊息；提交畫面唔係完成通知。',re:/應用程式|程式內|app.*通知|提交畫面唔係/},
 {id:'follow',title:'跟進路線',text:'可交由服務團隊查詢處理狀態。呢份資料冇寫完成時間。',line:'我可以將狀態交畀服務團隊查詢；資料冇寫完成時間，我未能承諾幾時轉好。',re:/服務團隊|未能承諾|冇寫完成時間|查詢.*狀態/}],
 questions:[{label:'問清楚畫面文字',text:'你提交後見到嘅係「收到申請」，定係「設定完成」？',reply:'畫面寫「收到申請」。我以為收到就等於轉咗，原來仲有另一個狀態？',re:/畫面|狀態|收到|完成/},{label:'問清楚通知渠道',text:'你係喺應用程式內，定係其他地方搵完成通知？',reply:'我只係睇咗電郵，未睇過應用程式入面嘅訊息。',re:/通知|電郵|程式|渠道/}],
 risky:/即刻.*轉好|一定.*(今日|即刻|完成)|保證|已經(轉好|完成|更改)|收到.*就(係|等於).*完成/,
 riskReply:'但係我個畫面仍然寫「收到申請」。你可以確認係已經完成，定仲要查詢？',
 reactions:{status:'咁我明白，「收到申請」仲未代表轉好。完成嘅時候，我會喺邊度見到？',channel:'好，我會留意應用程式內訊息。咁而家呢個申請，仲有邊個可以幫我查？',follow:'明白，完成時間仍然要查詢。我想交畀服務團隊跟進，唔想估一個日期。'},pending:'實際完成時間仍未有資料，需要服務團隊查詢。'},
 {id:'summary',title:'摘要冇寫，就係包括？',tag:'保障文件來電',desc:'客戶將一頁虛構保障摘要當成完整條款，想你即刻確認場外活動。',caller:'阿豪',opening:'張摘要寫「指定活動保障」，但冇寫場外活動唔得。咁即係我參加嘅場外活動都包括啦？',context:'你係虛構「小島服務室」嘅客戶經理。今局只討論一套虛構文件：一頁摘要，同一份練習條款。你手上冇阿豪活動嘅完整資料。',facts:[
 {id:'status',title:'摘要角色',text:'本局嘅一頁摘要只列出重點；「冇寫不包括」唔代表已確認包括。',line:'呢張摘要只列重點，冇寫不包括並唔等於已確認包括，要對照完整練習條款。',re:/只列.*重點|完整.*條款|摘要.*唔等於|並唔等於/},
 {id:'channel',title:'練習條款',text:'虛構條款只列「場內指定活動」。未列明場外活動安排。',line:'我手上嘅練習條款只列「場內指定活動」，未列明場外活動安排。',re:/場內指定活動|未列明.*場外|只列.*場內/},
 {id:'follow',title:'未確認資料',text:'需要活動名稱、地點同適用條款版本，交服務團隊核對；本局唔會確認實際保障。',line:'需要先整理活動名稱、地點同條款版本，交畀服務團隊核對；而家未能確認係咪包括。',re:/條款版本|服務團隊.*核對|未能確認|未確定/}],
 questions:[{label:'問清楚睇緊邊份文件',text:'你而家睇緊係一頁摘要，定係完整練習條款？',reply:'我只有一頁摘要，仲未打開完整條款。原來兩份唔係一樣？',re:/文件|摘要|條款/},{label:'問清楚活動情況',text:'你講緊場內定場外活動？手上有冇活動名稱同地點？',reply:'係場外活動。我而家未有正式活動名稱同地點，所以未畀到完整資料你。',re:/活動|地點|名稱|場外|場內/}],
 risky:/一定.*(包括|保障)|保證|全部.*包括|肯定.*包括|冇寫.*就.*包括|摘要(?:就係|即係|等於|完全係)完整/,
 riskReply:'但我未提供活動資料，條款又只寫場內。你係確認咗，定係仲需要核對？',
 reactions:{status:'明白，摘要冇寫唔代表已經確認。咁你手上嗰份條款實際寫咗咩？',channel:'原來條款只列場內，未講場外。咁我仲要準備啲咩先可以查清楚？',follow:'好，我會先整理活動名稱、地點同條款版本。今次先當未確認，等服務團隊核對。'},pending:'場外活動係咪適用仍然未確認；活動資料同條款版本需要進一步核對。'}
];
const fresh=()=>({version:1,view:'home',caseId:null,turn:0,mode:'ask',draft:'',history:[],covered:[],callerText:'',reaction:null});
let s=R.load(fresh());if(!['home','call','reaction','result'].includes(s.view)||!Array.isArray(s.history)||!Array.isArray(s.covered)||s.turn>3||s.turn<0||(!CASES.some(c=>c.id===s.caseId)&&s.view!=='home'))s=fresh();
let customCase=null,launch=0,scenarioDraft='';
const current=()=>customCase&&customCase.id===s.caseId?customCase:CASES.find(c=>c.id===s.caseId)||CASES[0];
function save(){R.save(customCase&&s.caseId===customCase.id?fresh():s)}
function sessionNote(){return customCase&&s.caseId===customCase.id?'<p class="cv-note">自訂情境按示例資料組合，只保留於今次頁面；重新整理後清除。</p>':''}
function makeCustom(prompt){
 const base=/保障|保單|保单|保险|保險|條款|条款|摘要/.test(prompt)?CASES[1]:/通知|結單|结单|設定|设置|電郵|电邮/.test(prompt)?CASES[0]:null;
 if(base)return {...base,id:'custom',title:'我嘅來電情境',tag:base.tag+' · 自訂',prompt,
  desc:prompt,context:'你係虛構「小島服務室」嘅客戶經理。今次練習：「'+prompt+'」。以下沿用'+(base.id==='notice'?'通知設定':'保障文件')+'示例資料；使用者提供嘅情境唔視為已核實事實。',
  opening:'我想問「'+prompt+'」。'+base.opening,
  questions:base.questions.map((q,i)=>({...q,text:(i===0?'關於你講嘅「'+prompt+'」，':'')+q.text})),
  completeReply:base.id==='notice'?'明白：提交唔係完成，要留意應用程式內訊息；完成時間就交服務團隊查詢。':'明白：摘要只列重點，場外活動仲未確認。我會補齊活動資料，再交服務團隊核對。',
  empathy:'我明白你想釐清「'+prompt+'」，唔想靠估。'};
 return {id:'custom',title:'我嘅來電情境',tag:'服務疑問來電 · 自訂',prompt,desc:prompt,caller:'阿澄',
  opening:'我想問「'+prompt+'」。你可唔可以而家就畀一個確定答案我？',
  context:'你係虛構「小島服務室」嘅客戶經理。客戶提出「'+prompt+'」。你手上只有今局事實卡，冇已核實嘅個案記錄，先釐清需要，再交代查詢路線。',
  facts:[
   {id:'status',title:'目前已知',text:'本局只收到客戶對「'+prompt+'」嘅描述，未有個案記錄可核實。',line:'我收到你嘅描述，但未有個案記錄可以核實，暫時未能確認結果。',re:/未有.*(記錄|记录)|未能確認|未能确认|未.*核實|未.*核实/},
   {id:'channel',title:'先釐清資料',text:'先確認想處理嘅具體問題同畫面／文件文字；唔需要提供真實個人資料。',line:'我想先確認你想處理嘅具體問題，以及畫面或文件寫咗咩。唔需要提供真實個人資料。',re:/具體問題|具体问题|畫面|画面|文件/},
   {id:'follow',title:'跟進安排',text:'整理待確認問題，交服務團隊核對。呢份練習資料冇處理時限或結果。',line:'我會整理待確認問題交服務團隊核對；資料冇處理時限，未能承諾完成時間。',re:/服務團隊|服务团队|處理時限|处理时限|完成時間|完成时间/}
  ],
  questions:[
   {label:'釐清最想解決嘅事',text:'關於「'+prompt+'」，你最想先釐清邊一部分？',reply:'我最想先知道應該查啲咩，再決定下一步。唔需要你而家估一個結果。',re:/最想|邊一部分|哪.*部分|先釐清/},
   {label:'問清楚資料來源',text:'你講嘅「'+prompt+'」係根據邊個畫面或文件？可以只講文字內容，唔使提供個人資料。',reply:'我而家未整理到畫面或文件嘅原文；呢個情境暫時未有其他可核實資料。',re:/畫面|画面|文件|來源|来源/}
  ],risky:/保證|保证|一定.*(完成|成功|解決|解决)|已經.*(完成|解決)|已经.*(完成|解决)/,
  riskReply:'但你仲未有個案記錄，係確認咗，定係仍然要核對？',
  reactions:{status:'明白，而家只係收到我嘅描述，未確認結果。咁你要先問清楚咩？',channel:'好，我會先整理具體問題同畫面或文件內容。之後由邊個跟進？',follow:'好，先整理問題交服務團隊核對，時間同結果等有資料先再確認。'},
  completeReply:'明白，我會整理問題同文件內容，等服務團隊核對；而家未有確認結果或完成時間。',
  empathy:'我明白你想釐清「'+prompt+'」，唔想靠估。',pending:'「'+prompt+'」嘅具體安排、處理結果同時限，都需要核對個案資料。'};
}
function goHome(){launch++;s=fresh();customCase=null;save();home()}

function factHTML(){return '<details class="cv-facts" open><summary>今局事實卡 · '+current().facts.length+' 張</summary><div class="cv-fact-list">'+current().facts.map(f=>'<article class="cv-fact"><strong>'+E(f.title)+'</strong><p>'+E(f.text)+'</p><button data-fact="'+f.id+'">將呢點放入草稿 ＋</button></article>').join('')+'</div></details>'}
function historyHTML(){return s.history.length?'<details class="cv-log"><summary>回看通話（'+s.history.length+' 次回應）</summary>'+s.history.map((h,i)=>'<article><strong>我 · '+(h.mode==='ask'?'問清楚':'講解／跟進')+'</strong><p>'+E(h.text)+'</p><strong class="cv-gap-sm">'+E(current().caller)+'</strong><p>'+E(h.reply)+'</p></article>').join('')+'</details>':''}
function respond(text){
 const c=current(),answerText=c.prompt?text.split(c.prompt).join(''):text,riskText=answerText.replace(/未能確認已經更改|唔會保證|唔能夠保證|不能保證|唔可以保證/g,'');if(c.risky.test(riskText))return {kind:'overclaim',reply:c.riskReply,reflection:'呢段文字配對到肯定結果嘅講法，但事實卡未有足夠資料支持。今次冇將相關項目標成已講清楚。',covered:[]};
 if(s.mode==='ask'){
  const q=c.questions.find(q=>q.re.test(answerText));if(q)return {kind:'ask',reply:q.reply,reflection:'來電者按你問到嘅線索補充咗資料。下一步可以打開事實卡，講清楚已知同待確認嘅部分。',covered:[]};
  return {kind:'unknown',reply:'呢個問題未配對到今局嘅資料。可唔可以用畫面、文件或者未確認嘅部分再問一次？',reflection:'演示未能理解呢段自由提問，冇推斷客戶意思或新增資料。',covered:[]};
 }
 const covered=c.facts.filter(f=>f.re.test(answerText)).map(f=>f.id);
 if(!covered.length)return {kind:'unknown',reply:'我仲未清楚呢段說話同我嘅問題有咩關係。你可唔可以參照一張事實卡再講？',reflection:'自由輸入未配對到事實卡重點，演示未能評估內容；原文已保存。',covered:[]};
 const next=c.facts.find(f=>!new Set([...s.covered,...covered]).has(f.id));
 const reply=next?c.reactions[covered[covered.length-1]]:(c.completeReply||(c.id==='notice'?'明白：提交唔係完成，要留意應用程式內訊息；完成時間就交服務團隊查詢。':'明白：摘要只列重點，場外活動仲未確認。我會補齊活動資料，再交服務團隊核對。'));
 return {kind:'explain',reply,reflection:'已配對到「'+covered.map(id=>c.facts.find(f=>f.id===id).title).join('、')+'」嘅內容。呢個記錄只反映提及嘅線索，唔係對整段說話作完整評核。',covered};
}
function home(){R.render(R.hero()+window.HKScenario.form({value:scenarioDraft,placeholder:'例如：客戶交咗申請，但仲未收到電子結單通知',examples:['客戶交咗申請，仲未收到完成通知','客戶只睇保障摘要，想即刻確認活動保障','客戶唔清楚查詢進度，想我交代下一步']})+'<h2 class="cv-home-heading">或者，由示範來電開始</h2><div class="cv-cases">'+CASES.map((c,i)=>'<button class="cv-case" data-case="'+c.id+'"><span>來電 '+String(i+1).padStart(2,'0')+' · '+E(c.tag)+'</span><strong>'+E(c.title)+'</strong><small>'+E(c.desc)+'</small><span class="cv-start-hint">接聽呢通虛構來電 →</span></button>').join('')+'</div><p class="cv-note">先問清楚，再對照資料。最多回應三次。</p>'+R.note());window.HKScenario.bind(main,prompt=>{scenarioDraft=prompt;customCase=makeCustom(prompt);return start(customCase.id)})}
function call(){
 const c=current();R.render(R.top(c.tag)+R.steps(['了解疑問','釐清資料','交代下一步'],Math.min(s.turn,2))+'<h1>我嘅服務工作枱</h1><aside class="cv-panel cv-context"><strong>今次你知道嘅事</strong><p>'+E(c.context)+'</p>'+sessionNote()+'</aside><section class="cv-call"><span>'+E(c.caller)+' · 虛構來電者</span><p>'+E(s.callerText)+'</p></section>'+factHTML()+'<div class="cv-tabs" aria-label="回應方式"><button data-mode="ask" aria-pressed="'+(s.mode==='ask')+'">先問清楚</button><button data-mode="explain" aria-pressed="'+(s.mode==='explain')+'">講解／跟進</button></div>'+R.field('relationship-answer',s.mode==='ask'?'你想問客戶咩？':'你會點向客戶解釋？',s.draft,s.mode==='ask'?'問一個同今次疑問有關嘅問題。':'用事實卡講出已知、未確定同下一步。',900)+'<div class="cv-presets">'+(s.mode==='ask'?c.questions.map((q,i)=>'<button class="cv-chip" data-question="'+i+'">'+E(q.label)+'</button>').join(''):'<button class="cv-chip" data-action="empathetic">先回應對方嘅心情</button><button class="cv-chip" data-action="allfacts">整合三張事實卡起稿</button>')+'</div><div class="cv-actions">'+R.btn('回應客戶 · '+(s.turn+1)+' / 3','send')+(s.turn?R.btn('用現有對話收尾','finish',true):'')+'</div>'+historyHTML()+R.note());R.bindField('relationship-answer',v=>{s.draft=v;save()})
}
function reaction(){const h=s.history[s.history.length-1];R.render(R.top(current().tag)+'<p class="cv-kicker">第 '+s.turn+' 次回應之後</p><h1>客戶點樣接話？</h1><div class="cv-panel"><p class="cv-kicker">我嘅回應</p><p class="cv-answer cv-gap-sm">'+E(h.text)+'</p></div><section class="cv-call"><span>'+E(current().caller)+' · 虛構來電者</span><p>'+E(h.reply)+'</p></section><div class="cv-coach"><strong>今次對話線索</strong><p>'+E(s.reaction.reflection)+'</p></div><div class="cv-actions">'+R.btn(s.turn===3?'整理通話摘要':'繼續通話','next')+(s.turn<3?R.btn('用現有對話收尾','finish',true):'')+'</div>'+R.note())}
function summaryText(){const c=current();return '今日我做客戶經理｜'+c.title+'\n虛構情境通話摘要\n\n已提及重點：\n'+(c.facts.filter(f=>s.covered.includes(f.id)).map(f=>'- '+f.title+'：'+f.text).join('\n')||'尚未配對到已講解重點。')+'\n\n尚未講解：\n'+(c.facts.filter(f=>!s.covered.includes(f.id)).map(f=>'- '+f.title+'：'+f.text).join('\n')||'三張事實卡嘅重點都已提及。')+'\n\n仍待外部確認：'+c.pending+'\n\n對話：\n'+s.history.map(h=>'我：'+h.text+'\n客戶：'+h.reply).join('\n\n')}
function result(){const c=current(),done=c.facts.filter(f=>s.covered.includes(f.id)),left=c.facts.filter(f=>!s.covered.includes(f.id));R.render(R.top(c.tag)+'<section class="cv-result-title"><span class="cv-kicker">來電暫告一段落</span><h1>我嘅通話摘要</h1><p class="cv-muted">分清講過嘅重點，同仍然需要跟進嘅事。</p></section><section class="cv-panel"><h2>已講到嘅重點</h2><p class="cv-muted cv-gap-sm">按文字線索整理，唔代表完整評估。</p>'+(done.length?'<ul class="cv-todo">'+done.map(f=>'<li><strong>'+E(f.title)+'</strong><br>'+E(f.text)+'</li>').join('')+'</ul>':'<p class="cv-muted cv-gap-sm">未配對到事實卡嘅講解內容。</p>')+'</section><section class="cv-panel"><h2>仲未講清楚</h2>'+(left.length?'<ul class="cv-todo">'+left.map(f=>'<li><strong>'+E(f.title)+'</strong><br>'+E(f.text)+'</li>').join('')+'</ul>':'<p class="cv-muted cv-gap-sm">三張事實卡嘅重點都已提及。</p>')+'</section><aside class="cv-coach"><strong>仍然待確認</strong><p>'+E(c.pending)+'</p></aside>'+historyHTML()+'<div class="cv-actions">'+R.btn('複製通話摘要','copy')+R.btn('重新接呢通電話','restart',true)+R.btn('接另一通來電','home',true)+'</div>'+R.note())}
function render(){({home,call,reaction,result}[s.view]||home)()}
async function start(id){const c=customCase&&customCase.id===id?customCase:CASES.find(c=>c.id===id);if(!c)return;const ticket=++launch,ready=await window.HKScenario.prepare(main,{label:'整理來電情境，生成今次問題',prompt:c.prompt||c.desc,onCancel:goHome});if(!ready||ticket!==launch)return;s={...fresh(),view:'call',caseId:id,callerText:c.opening};save();render()}
main.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.case){start(b.dataset.case);return}
 if(b.dataset.mode){s.mode=b.dataset.mode;save();call();document.getElementById('relationship-answer').focus();return}
 if(b.dataset.question!==undefined){R.fill('relationship-answer',current().questions[Number(b.dataset.question)].text);return}
 if(b.dataset.fact){const f=current().facts.find(f=>f.id===b.dataset.fact),next=(s.draft?s.draft+'\n':'')+f.line;if(next.length>900){R.error('草稿接近字數上限，請先刪減少少。');return}s.mode='explain';s.draft=next;save();call();document.getElementById('relationship-answer').focus();return}
 const a=b.dataset.action;
 if(a==='home')goHome();
 if(a==='empathetic')R.fill('relationship-answer',(current().empathy||(current().id==='notice'?'我明白你以為提交後就會即刻轉好。':'我明白你想確認活動係咪包括，唔想靠估。'))+(s.draft?'\n'+s.draft:''));
 if(a==='allfacts')R.fill('relationship-answer',current().facts.map(f=>f.line).join('\n'));
 if(a==='send'){const text=s.draft.trim();if(text.length<4){R.error('先寫一句提問或解釋，亦可以用事實卡起稿。');return}const reaction=respond(text);s.history.push({text,reply:reaction.reply,mode:s.mode});s.covered=[...new Set([...s.covered,...reaction.covered])];s.turn++;s.reaction=reaction;s.callerText=reaction.reply;s.draft='';s.view='reaction';save();R.prepare('整理來電者嘅回應',render)}
 if(a==='next'){s.view=s.turn>=3?'result':'call';s.mode='explain';save();render()}
 if(a==='finish'){s.view='result';save();result()}
 if(a==='restart')start(s.caseId);
 if(a==='copy')R.copy(summaryText(),b);
});
render();
