(()=>{'use strict';
const D=window.HK_ROLE_DATA,root=document.getElementById('hkroles'),main=document.getElementById('role-main');
if(!D||!root||!main)return;
const KEY='hkchat-finance-role-'+D.key;
const fresh=(scene=0)=>({version:1,scene,view:'home',job:null,answers:{},checked:[],draft:'',fix:'',decision:null,intervention:null,route:null,notice:'',early:false});
let S=fresh(),customScene=null,customPrompt='',generating=false;
const hasScenarioBuilder=['rookie','rescue'].includes(D.key);
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.version===1&&Number.isInteger(saved.scene)&&D.scenes[saved.scene]&&['home','inbox','job','investigate','decision','meeting','route','compose','result'].includes(saved.view)){S=Object.assign(fresh(saved.scene),saved);S.answers=S.answers&&typeof S.answers==='object'?S.answers:{};S.checked=Array.isArray(S.checked)?S.checked.filter(id=>D.scenes[S.scene].sources?.some(x=>x.id===id)).slice(0,3):[];}}catch{}
const scene=()=>customScene||D.scenes[S.scene];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(customScene?fresh(S.scene):S));}catch{}};
const btn=(action,text,cls='role-primary',extra='')=>`<button type="button" class="${cls}" data-action="${action}" ${extra}>${text}</button>`;
const talk=(name,text)=>`<aside class="role-conversation"><strong>${esc(name)}</strong><p>${esc(text)}</p></aside>`;
const doc=(label,text)=>`<article class="role-doc"><span class="role-doc-label">${esc(label)}</span>${(Array.isArray(text)?text:[text]).map(t=>`<p>${esc(t)}</p>`).join('')}</article>`;
const section=(title,body)=>`<section class="role-section"><h3>${esc(title)}</h3>${body}</section>`;
const options=(items,action,chosen)=>`<div class="role-choices">${items.map(o=>btn(action,`<strong>${esc(o.label)}</strong>${o.preview?`<small>${esc(o.preview)}</small>`:''}`,'role-choice',`data-id="${esc(o.id)}"${chosen!==undefined?` aria-pressed="${chosen===o.id}"`:''}`)).join('')}</div>`;
const top=(progress,back='home')=>`<div class="role-topline">${btn(back,back==='inbox'?'‹ 返回待辦':'‹ 揀另一個情境','role-link')}<span class="role-progress">${esc(progress)}</span></div>`;
const end=(label='提早收尾，睇目前紀錄')=>`<div class="role-actions">${btn('end',esc(label),'role-secondary')}</div>`;
const playHead=(eyebrow,title,intro)=>`<p class="role-eyebrow">${esc(eyebrow)}</p><h2 class="role-playtitle" tabindex="-1">${esc(title)}</h2>${intro?`<p class="role-intro">${esc(intro)}</p>`:''}`;
const artifact=(title,body,tag='本局成果')=>`<article class="role-artifact"><header class="role-artifact-head"><span>${esc(title)}</span><span>${esc(tag)}</span></header><div class="role-artifact-body">${body}</div></article>`;
const output=(label,text)=>`<section class="role-artifact-section"><h3>${esc(label)}</h3><p>${esc(text)}</p></section>`;
const find=(list,id)=>list.find(x=>x.id===id);
const exact=(list,text)=>list.find(x=>x.text.trim()===String(text).trim())?.id||'custom';
const customNote='你嘅自訂文字已原樣保存；呢個預設演示未有對文字意思作判讀，會標記為待同事覆核。';
const composer=(id,label,value,placeholder='可用上面的預設句，或者自己改寫。')=>`<label class="role-field" for="${id}">${esc(label)}</label><textarea id="${id}" maxlength="500" placeholder="${esc(placeholder)}">${esc(value)}</textarea><p class="role-input-note">本機預設分支演示。自訂或改寫文字會原樣保存，列作待覆核；唔會假裝已理解內容。</p><p class="role-error" id="role-error" role="alert"></p>`;
function scenarioForm(){
 if(!hasScenarioBuilder||!window.HKScenario)return '';
 const rookie=D.key==='rookie';
 return window.HKScenario.form({value:customPrompt,placeholder:rookie?'例如：第一日返工，客人追問尚待核實嘅聯絡資料更新。':'例如：排練簡報時，發現同事話提交資料更正後即時生效。',examples:rookie?['客人追問聯絡資料更新，主管又等緊我交更。','新網上功能未全面開放，客人想即刻用。']:['簡報寫資料更正即時生效，但流程仲要覆核。','同事話所有查詢即到即辦，我記得有預約限制。']});
}
// Local demo profiles keep every existing choice and consequence playable.
// Free text supplies the case brief; keyword matches select fictional evidence.
function scenarioProfile(prompt){
 if(/更正|資料更新|资料更新|聯絡|联络|地址|電話|电话|電郵|电邮|contact/i.test(prompt))return {
  topic:'聯絡資料更新',received:'已收到資料更正申請，申請內容及身分核實步驟尚待覆核',condition:'服務組須先核對更正內容及身分核實紀錄，再發出更新確認；提交申請並不代表聯絡資料已生效',
  next:'請服務組核實更正內容及身分核實紀錄，確認更新後再通知客人',promise:'聯絡資料已全部更新，即時生效',customer:'我已交咗資料更正申請，之後所有通知係咪即刻用新資料？',
  slide:'提交資料更正申請後，新聯絡資料即時生效。',hint:'流程筆記提到「核對更正內容及身分核實紀錄後發出更新確認」。',precise:'資料更正申請須先核對更正內容及身分核實紀錄，聯絡資料以更新確認通知列明嘅安排生效。',ask:'更正內容同生效安排，係咪要先核實？'
 };
 if(/網上|网上|線上|线上|功能|系統|系统|app|digital/i.test(prompt))return {
  topic:'網上功能試用',received:'客人尚未收到試用邀請，現有查詢途徑仍然保留',condition:'新功能只供獲邀試用客人使用；未獲邀客人沿用原有查詢途徑，毋須重交個人資料',
  next:'核對客人嘅試用邀請狀態，未獲邀前保留原有查詢安排',promise:'所有客人已經開通，原有途徑可以停止',customer:'我搵唔到新功能，係咪要重新交一次個人資料先用到？',
  slide:'新網上功能已向所有客人開放，原有查詢途徑即日停止。',hint:'試用通知上仍寫住「只供獲邀客人」，而且保留原有查詢途徑。',precise:'新網上功能現階段只供獲邀客人試用；未獲邀客人可繼續使用原有查詢途徑。',ask:'試用邀請同原有查詢途徑，係咪要寫返清楚？'
 };
 if(/投訴|投诉|嬲|生氣|生气|不滿|不满|complaint/i.test(prompt))return {
  topic:'客人投訴',received:'已記錄客人投訴，相關服務紀錄仍待主管覆核',condition:'團隊先整理投訴內容及服務紀錄，再由主管確認跟進安排；補救方案及完成時間尚未確定',
  next:'將投訴重點及待查服務紀錄交主管覆核，確認後再回覆客人',promise:'投訴已經解決，補救安排今日全部完成',customer:'我已經講咗問題，你哋可唔可以保證今日處理好？',
  slide:'收到客人投訴，團隊保證即日解決所有問題。',hint:'內部流程只訂明記錄及覆核步驟，未有保證即日解決。',precise:'收到投訴後會先記錄及覆核服務情況，再確認跟進安排；處理結果與時間須另行通知。',ask:'即日解決嘅承諾，有冇原文件支持？'
 };
 if(/預約|预约|到場|到场|到訪|到访|即到|輪候|排隊|排队|時段|时段/i.test(prompt))return {
  topic:'到訪及預約安排',received:'已收到預約登記，確認訊息尚未發出',condition:'一般查詢可在列明時段到場輪候；文件覆核須先預約，收到確認訊息後按所列時段到訪',
  next:'核實查詢類別與預約確認狀態，再通知客人適用安排',promise:'所有查詢都已確認，客人隨時到場即辦',customer:'我交咗登記，係咪所有查詢都可以聽日直接嚟辦？',
  slide:'所有查詢都可以隨時到場，即到即辦。',hint:'安排表分開「一般查詢可輪候」及「文件覆核須預約」。',precise:'列明時段內，一般查詢可到場輪候；文件覆核仍須預約，收到確認後按指定時段到訪。',ask:'文件覆核都可以即到即辦，定係仍需預約？'
 };
 return {
  topic:'自訂服務個案',received:'已收到個案資料，申請內容及適用條件仍待覆核',condition:'團隊先核對資料及適用條件，再由負責同事發出確認通知；收到資料並不代表已批准或已完成',
  next:'整理待查資料與適用條件，交負責同事覆核後再通知客人',promise:'個案已經批准，所有要求可以即時完成',customer:'我已交咗資料，係咪即係已批准，可以即刻照我要求處理？',
  slide:'收到個案資料，就代表所有要求已批准並可即時完成。',hint:'我嘅流程筆記仍有「核對資料、確認條件、發出通知」三步。',precise:'收到個案資料後，須核對資料與適用條件，並由負責同事發出確認通知；未確認前不作批准或完成承諾。',ask:'收到資料之後，係咪仲要核對條件同發出確認？'
 };
}
function makeCustomScene(prompt){
 const p=scenarioProfile(prompt),brief=`你設定嘅情境：「${prompt}」`,c=JSON.parse(JSON.stringify(D.scenes[0]));
 c.id='custom';c.title=p.topic+' · 我的情境';c.subtitle='本機情境演示';
 if(D.key==='rookie'){
  c.intro=brief+'。今日由你接手，先核對下列虛構個案文件，再完成摘要、客人回覆同交更。';
  c.message='我將你提出嘅情境整理成三件待辦。文件同人物反應係本機演示設定；留意目前狀態，未確認嘅事唔好當成已完成。';
  c.documentTitle=p.topic+' · 本局虛構文件';c.document=[brief,'目前個案記錄：'+p.received+'。','本局處理條件：'+p.condition+'。'];
  c.tasks={summary:'核對'+p.topic+'嘅目前狀態與條件。',reply:'回應客人追問，講清尚未確認嘅部分。',report:p.next+'。'};
  c.summaryOptions=[
   {id:'careful',label:'記低目前狀態同待查條件',text:p.received+'；'+p.next+'。',reaction:'阿晴：狀態同下一步都有記低，接手同事可以沿住文件跟進。'},
   {id:'promise',label:'將收到個案寫成已完成',text:p.promise+'。',reaction:'阿晴：文件仍有待核實步驟，呢段摘要會令之後嘅回覆變成未確認承諾。'},
   {id:'vague',label:'只記低：個案已處理',text:p.topic+'已處理。',reaction:'阿晴：睇唔到核實到邊一步，接手同事要再查文件。'}
  ];
  c.customer=p.customer;c.replyOptions=[
   {id:'careful',label:'交代狀態，再講跟進安排',text:'目前'+p.received+'。我會'+p.next+'。',reaction:'客人：明白，原來仲要核實，我等確認通知。阿晴已保留跟進標記。'},
   {id:'promise',label:'先向客人保證已完成',text:p.promise+'，你可以放心。',reaction:'客人已按你嘅承諾安排。阿晴提醒：原文件並未確認，團隊需要補發澄清。'},
   {id:'vague',label:'只叫客人再等一等',text:'你再等吓，有消息我哋會通知。',reaction:'客人：即係而家處理到邊一步？阿晴提醒：回覆未交代目前狀態。'}
  ];
  c.reportOptions=[
   {id:'handover',label:'交代狀態、已覆內容與下一步',text:p.next+'；接手同事需對照摘要及客人回覆，如有未確認承諾先發澄清。',reaction:'主管嘉敏：交更有下一步，我會先對照文件同已發回覆再安排跟進。'},
   {id:'done',label:'告訴主管：全部已完成',text:p.topic+'全部已完成，毋須再跟進。',reaction:'主管嘉敏：核實步驟仲未完成，直接結案會漏咗後續工作。'},
   {id:'ask',label:'標記未結案，請主管覆核',text:p.topic+'未結案，請主管覆核摘要與回覆，再確認跟進安排。',reaction:'主管嘉敏：我收到覆核要求，交更表會保留未結案狀態。'}
  ];
 }else{
  c.intro=brief+'。排練開始，嘉怡用咗下面一句介紹；你要揀提出時機、核實途徑，再交出修訂。文件同人物反應均為本機演示設定。';
  c.slide=p.slide;c.hint=p.hint;c.opening='呢頁係關於'+p.topic+'嘅介紹，我準備畀團隊使用。大家睇吓，有冇漏咗條件？';
  c.interventions=[
   {id:'ask',label:'即場問：'+p.ask,reaction:'嘉怡停低投影片：我哋先核實條件，未確認前暫停使用呢句承諾。',record:'會上即場提出'+p.topic+'嘅適用條件疑問。'},
   {id:'private',label:'先傳訊息畀拍檔，請佢幫手提出',reaction:'拍檔阿彤幫你提出，嘉怡將呢頁標記待核實，等你搵原文件。',record:'透過拍檔提醒簡報負責人，草稿標記待核實。'},
   {id:'wait',label:'記低疑點，排練尾聲再講',reaction:'其他同事已抄錄原句。嘉怡請你修頁，同時補一則更正通知畀與會同事。',record:'排練尾聲才提出，須同步更正同事已抄錄嘅介紹。'}
  ];
  c.routes=[
   {id:'document',label:'核對最新原始流程文件',preview:'查清完整條件同確認步驟。',source:p.topic+'流程文件 · 條件及確認段',fact:p.condition+'。',limit:'呢份本局文件可支持完整修訂條件，並識別原句多作咗邊項承諾。'},
   {id:'author',label:'問寫投影片嘅同事',preview:'了解原句點解寫得咁肯定。',source:'投影片作者的口述',fact:'作者話為咗簡短，刪走咗'+p.topic+'嘅核實條件；佢手上冇最新流程文件，未能確認完整安排。',limit:'口述解釋咗漏寫原因，但不能支持完整修訂措辭。'},
   {id:'ticket',label:'翻一則相關客人查詢記錄',preview:'睇一個個案經歷，留意資料範圍。',source:p.topic+' · 虛構匿名查詢記錄',fact:'記錄顯示一名客人仍在等候確認通知；當中冇列出完整條件，亦冇保證所有個案都同樣處理。',limit:'單一個案提示原句有疑點，未足以確認全部適用條件。'}
  ];
  c.fixOptions=[
   {id:'precise',label:'補回適用條件同確認步驟',text:p.precise},
   {id:'remove',label:'先撤下承諾，標記待核實',text:p.topic+'嘅完整安排待核實；確認原始文件後，再更新本頁。'},
   {id:'keep',label:'保留原句，只加「詳情另詢」',text:p.slide+'詳情請向負責同事查詢。'}
  ];
  c.truth=p.condition+'；原句省略咗限制同確認步驟。';c.followup='由嘉怡核對'+p.topic+'原始流程文件，更新投影片及共享會議紀錄，並安排所需澄清。';
 }
 return c;
}
function home(){return `<section class="role-hero"><img src="${D.photo}" alt="${esc(D.photoAlt)}"><small>AI 情境圖</small><div><p class="role-eyebrow">${esc(D.eyebrow)}</p><h1 tabindex="-1">${esc(D.title)}</h1><p>${esc(D.tagline)}</p></div></section><p class="role-home-intro">${esc(D.intro)}</p>${scenarioForm()}<h2 class="role-home-label">揀一個情境</h2><div class="role-scenes">${D.scenes.map((c,i)=>btn('scene',`<span class="role-scene-num">0${i+1}</span><span class="role-scene-copy"><strong>${esc(c.title)}</strong><small>${esc(c.subtitle)}</small></span><span class="role-tick" aria-hidden="true">${S.scene===i?'✓':'›'}</span>`,'role-scene',`data-index="${i}" aria-pressed="${S.scene===i}"`)).join('')}</div>${btn('start',esc(D.start))}<div class="role-steps">${D.steps.map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="role-note role-home-foot">虛構人物與服務 · ${D.key==='rookie'?'三件待辦':D.key==='verify'?'最多三次調查':'三幕短故事'}<br>預設互動演示，唔係專業能力測試。</p>`;}

function rookieInbox(){const c=scene(),done=Object.keys(S.answers).length;return top(`${done} / 3 件待辦已記錄`)+playHead('我的第一日 · '+c.title,'我的工作收件匣',c.intro)+talk(S.notice?'最新回應':c.colleague,S.notice||c.message)+`<div class="role-inbox">${[
 ['summary','核對文件，寫摘要',c.tasks?.summary||'核對文件，把目前狀態寫入紀錄。'],['reply','回覆客人',c.tasks?.reply||'選一段回覆，或寫自己的草稿。'],['report','向主管匯報',c.tasks?.report||'交代處理狀態與下一步。']
].map(([id,title,desc])=>btn('job',`<span><strong>${esc(title)}</strong><small>${esc(desc)}</small></span><span class="role-job-status">${S.answers[id]?'查看／改寫':'未處理 ›'}</span>`,'role-job',`data-id="${id}"`)).join('')}</div><div class="role-actions">${btn('end',done===3?'整理我的交更紀錄':'提早交更，保留待辦',done===3?'role-primary':'role-secondary')}</div><p class="role-note role-bottom-note">完成一件，就會更新一份成果；改寫會取代該件紀錄。可以自行揀次序。</p>`;}
function rookieJob(){const c=scene(),names={summary:'核對文件，寫摘要',reply:'回覆客人',report:'向主管匯報'};let html=top('三件待辦 · '+names[S.job],'inbox')+playHead(c.title,names[S.job]);
 if(S.job==='summary')html+=doc(c.documentTitle,c.document)+section('我要點樣記低？',options(c.summaryOptions,'summary',S.answers.summary?.id));
 if(S.job==='reply'){html+=talk('客人的查詢 · 虛構對話',c.customer);html+=S.answers.summary?doc('我已寫的摘要',S.answers.summary.text):`<p class="role-notice">我仲未完成「核對文件，寫摘要」。可以返回待辦先查文件，亦可以先寫回覆草稿。</p>`;html+=section('先揀一句，再按需要改寫',options(c.replyOptions,'reply-preset',exact(c.replyOptions,S.draft)));html+=composer('role-draft','我的回覆草稿',S.draft);html+=`<div class="role-actions">${btn('send-reply','保存回覆，睇客人反應')}</div>`;}
 if(S.job==='report'){html+=doc('目前的處理紀錄',[`摘要：${S.answers.summary?.text||'未處理'}`,`客人回覆：${S.answers.reply?.text||'未處理'}`]);html+=talk('主管嘉敏 · 虛構對話','交更時，請講清楚你做咗咩，同埋邊一步仲要跟。');html+=options(c.reportOptions,'report',S.answers.report?.id);}
 return html+end();
}
function rookieResult(){const c=scene(),a=S.answers,done=Object.keys(a).length;
 const good=a.summary?.id==='careful'&&a.reply?.id==='careful'&&['handover','ask'].includes(a.report?.id);
 const danger=a.summary?.id==='promise'||a.reply?.id==='promise'||a.report?.id==='done';
 const custom=a.reply?.id==='custom';
 let title=done<3?'交更了，仍有待辦':good?'三件事，交代得上':danger?'交更前，要補一則澄清':custom?'草稿留低了，等同事覆核':'紀錄齊了，還有細節要補';
 let desc=done<3?`你記錄咗 ${done} 件待辦，餘下工作已標記「未處理」，接手同事睇得到。`:good?'摘要、客人回覆同交更安排互相對得上；仍需按故事流程完成跟進。':danger?'部分紀錄將未完成步驟寫成已完成，主管會先要求澄清，唔會直接結案。':custom?customNote:'有啲紀錄未交代目前狀態，接手同事仍要再查原文件。';
 let body=resultHead(title,desc)+artifact('我的交更紀錄',output('情境',c.title)+output('摘要',a.summary?.text||'未處理 · 待接手同事查看文件。')+output('給客人的回覆',a.reply?.text||'未處理 · 尚未保存回覆。')+output('向主管的交代',a.report?.text||'未處理 · 尚未交代下一步。'));
 body+=talk('主管嘉敏 · 收到交更後',done<3?'我會保留未處理標記，先補齊資料再安排接手。':good?'我收到你嘅紀錄，下一位同事知道目前狀態同跟進方向。':custom?'你嘅自訂回覆仍需人工覆核，我唔會將佢當作已核實內容。':'我會先對照演示文件，修正未確認承諾，再交畀同事跟進。');
 body+=section('對照原文件',doc(c.documentTitle,c.document));
 body+=`<details class="role-log"><summary>回看本局三件事</summary><ol>${['summary','reply','report'].map((k,i)=>`<li>${['核對文件，寫摘要','回覆客人','向主管匯報'][i]}：${esc(a[k]?.reaction||'未處理，保留待辦。')}</li>`).join('')}</ol></details>`;
 return body+resultActions();
}

function sourceCards(interactive){const c=scene();return `<div class="role-sources">${c.sources.map(s=>{const checked=S.checked.includes(s.id);return `<article class="role-source ${checked?'is-checked':''}" data-source="${esc(s.id)}"><div class="role-source-top"><h3>${esc(s.label)}</h3><span class="role-source-id">${esc(s.tag)}${checked?' · 已查':''}</span></div><p>${esc(checked?s.fact:s.teaser)}</p>${checked?`<div class="role-reveal"><p>${esc(s.implication)}</p></div>`:interactive&&S.checked.length<3?btn('investigate','用一次機會查閱','',`data-id="${esc(s.id)}"`):'<p>本局未查閱</p>'}</article>`;}).join('')}</div>`;}
function verifyInvestigation(){const c=scene();return top('我的查證 · '+c.title)+playHead('虛構資訊室','呢句消息，查邊度先？',c.intro)+doc('收到的待查原句',c.claim)+talk(c.editor,c.editorMessage)+`<div class="role-budget"><span>調查機會</span><span><strong>${S.checked.length} / 3</strong> 已用</span></div>${S.notice?`<p class="role-notice" role="status">${esc(S.notice)}</p>`:''}`+sourceCards(true)+`<div class="role-actions">${btn('editorial',S.checked.length===3?'調查到此，作編輯決定':'用目前線索，作編輯決定')}${btn('end','提早收尾，保留未核實狀態','role-secondary')}</div>`;}
function verifyDecision(){const c=scene();return top(`已查 ${S.checked.length} / 3 項`)+playHead(c.title,'我的編輯決定','我可以照刊原句、改寫，或者暫緩。結果會保留已查與未查嘅來源。')+doc('待查原句',c.claim)+`<details class="role-log"><summary>展開我查過的線索（${S.checked.length} 項）</summary>${S.checked.length?sourceCards(false):'<p class="role-note">尚未查閱任何來源。</p>'}</details>`+section('選擇處理方法',options([
 {id:'publish',label:'照原句刊出',preview:'保留收到的原句，結果會顯示當中未核實之處。'},
 {id:'correct',label:'寫一段更正稿',preview:'先選用預設句，或寫自己的版本。'},
 {id:'hold',label:'暫緩刊出',preview:'留下調查紀錄，標記仍需核實的來源。'}
 ],'decision-preset',S.decision))+ (S.decision==='correct'?section('我的更正稿',options(c.draftOptions,'verify-preset',exact(c.draftOptions,S.draft)))+composer('role-draft','可編輯的更正稿',S.draft):'')+`<div class="role-actions">${btn('finish-verify','確認決定，睇編輯紀錄')}${S.checked.length<3?btn('back-investigate',`返回調查（尚餘 ${3-S.checked.length} 次）`,'role-secondary'):''}</div><p class="role-error" id="role-decision-error" role="alert"></p>`;}
function verifyResult(){const c=scene(),checked=c.sources.filter(x=>S.checked.includes(x.id)),missing=c.sources.filter(x=>!S.checked.includes(x.id)),supported=c.required.every(id=>S.checked.includes(id)),kind=exact(c.draftOptions,S.draft),decision=S.decision||'hold';
 let title,desc;
 if(decision==='publish'){title='原句刊出了，範圍有落差';desc=c.risk+' 編輯要求補發更正。';}
 else if(decision==='hold'){title='先暫緩，留下調查紀錄';desc=S.early?'你提早收尾；原句保留為未核實，冇作刊出處理。':supported?'你已找到主要依據，仍選擇暫緩；可將已查資料交畀值班編輯再確認。':'未查清楚嘅部分已保留，下一位編輯知道要由邊度接手。';}
 else if(kind==='custom'){title='更正草稿，等待文字覆核';desc=customNote;}
 else if(kind==='careful'&&supported){title='更正稿有來源可以對照';desc='你將原句嘅範圍收窄，並查過支持呢段稿嘅主要來源。故事內嘅資料已列在下面。';}
 else if(kind==='careful'){title='更正稿仍欠查證依據';desc='文字用咗完整故事資料，但你未查過全部必要來源，編輯將稿件標記為待核實。';}
 else{title='改了字，原句仍待釐清';desc=kind==='vague'?'加上「據悉」或「網傳」，並冇解決原句擴大範圍嘅問題。':'你保留咗疑問，但未提供完整更正內容，編輯會繼續核實。';}
 const labels={publish:'照原句刊出',correct:'提交更正稿',hold:'暫緩刊出'};
 let body=resultHead(title,desc)+artifact('我的編輯處理紀錄',output('決定',labels[decision])+output(decision==='correct'?'我提交的更正稿':'待查原句',decision==='correct'?S.draft:c.claim)+output('依據',checked.length?checked.map(x=>`${x.tag} · ${x.label}`).join('\n'):'尚未查閱任何來源。'),decision==='publish'?'需補更正':decision==='hold'?'未刊出':kind==='careful'&&supported?'有來源對照':'待覆核');
 body+=section('我查過的來源',checked.length?`<ul class="role-result-checks">${checked.map(s=>`<li><strong>${esc(s.tag+' · '+s.label)}</strong>${esc(s.fact)}</li>`).join('')}</ul>`:'<p class="role-note">本局未使用調查機會。</p>');
 body+=section('本局未查的來源',missing.length?`<ul class="role-result-checks">${missing.map(s=>`<li><strong>${esc(s.tag+' · '+s.label)}</strong>${esc(s.teaser)}</li>`).join('')}</ul>`:'<p class="role-note">所有來源已查閱。</p>');
 body+=doc('結局揭曉 · 完整虛構資料',[c.truth,`主要依據：${c.required.map(id=>{const x=find(c.sources,id);return x.tag+'「'+x.label+'」'+(S.checked.includes(id)?'（你已查）':'（本局未查）');}).join('；')}。`]);
 body+=talk('小朗 · 值班編輯',decision==='publish'?'原句要補發更正。'+c.next:decision==='correct'&&kind==='careful'&&supported?'我可以沿住你列出嘅來源核對稿件，再按資訊室流程處理。':c.next);
 return body+resultActions();
}

function rescueMeeting(){const c=scene();return top('第 1 / 3 幕 · 會議中')+playHead(c.title,'呢一刻，我點樣開口？',c.intro)+talk(c.colleague,c.opening)+doc('螢幕上的原句',c.slide)+`<p class="role-notice">我的線索：${esc(c.hint)}</p>`+options(c.interventions,'intervene')+end();}
function rescueRoute(){const c=scene(),choice=find(c.interventions,S.intervention);return top('第 2 / 3 幕 · 核實')+playHead(c.title,'我揀邊條路搵依據？','今幕只揀一條核實途徑。資料有幾完整，會影響修訂稿有原文件支持，定係仍待核實。')+talk(c.colleague,choice?.reaction||c.opening)+options(c.routes,'route')+end();}
function rescueCompose(){const c=scene(),route=find(c.routes,S.route);return top('第 3 / 3 幕 · 修訂')+playHead(c.title,'我交一頁點樣的修訂？','用剛才搵到嘅資料，決定要補條件、先撤下承諾，或者保留原句。')+doc('我查到的資料 · '+route.source,[route.fact,route.limit])+section('選一個修訂方向',options(c.fixOptions,'fix-preset',exact(c.fixOptions,S.fix)))+composer('role-fix','我的修訂投影片',S.fix)+`<div class="role-actions">${btn('finish-rescue','交出修訂，睇隊友反應')}${btn('end','先收尾，保留待修訂項目','role-secondary')}</div>`;}
function rescueResult(){const c=scene(),intervention=find(c.interventions,S.intervention),route=find(c.routes,S.route),kind=exact(c.fixOptions,S.fix),complete=!!S.fix.trim()&&!S.early;let title,desc,status,reaction;
 if(!complete){title='先停一停，交低未完事項';desc='你提早結束會議故事；未完成嘅修訂標記已保留，唔會當作已改好。';status='待修訂';reaction='我收到你嘅記錄，原頁先標記待核實。未完成嘅資料同措辭要再補。';}
 else if(kind==='precise'&&S.route==='document'){title='少了的條件，補回頁面';desc='修訂稿對照過原文件，下一位同事可以看出適用條件。';status='已對照原文件';reaction='條件補得清楚。我會用修訂頁取代原稿，並按你嘅提出時機安排通知。';}
 else if(kind==='precise'){title='修訂有方向，依據要補齊';desc='你寫出完整條件，但本局揀嘅來源未能支持所有措辭，投影片仍標記待核實。';status='待核實';reaction='我會先保留修訂草稿，對過原文件先採用，唔直接當作已確認安排。';}
 else if(kind==='remove'){title='先收起承諾，列明待核實';desc='你移除咗過度肯定嘅原句；簡報仍欠完整安排，要指派同事補回。';status='待補內容';reaction='原句會先撤下，但呢頁仲未交代完整流程，我接手核實再更新。';}
 else if(kind==='keep'){title='提示加了，原句仍要改';desc='額外提示冇改變原句嘅承諾，嘉怡要求重新寫清楚條件。';status='需再修訂';reaction='「詳情請查詢」冇解決前面嘅承諾。我會暫停使用呢頁，再對原始安排。';}
 else{title='自訂修訂，交給隊友覆核';desc=customNote;status='文字待覆核';reaction='我會親自覆核你嘅文字，再對照原文件；演示系統未判斷內容是否完整。';}
 let body=resultHead(title,desc)+artifact('我的修訂投影片',output('原句',c.slide)+output('本局修訂',complete?S.fix:'尚未交出修訂稿。')+output('查證依據',route?route.source+'：'+route.fact:'尚未選擇核實途徑。'),status);
 body+=talk('嘉怡 · 隊友反應',reaction);
 body+=artifact('會議跟進紀錄',output('我點樣提出',intervention?.record||'尚未提出。')+output('接手安排',c.followup)+output('要通知邊個',S.intervention==='wait'?'同事已抄錄原句：除更新投影片外，須向與會同事補發更正紀錄。':S.intervention==='private'?'由拍檔協助通知簡報負責人，確認共享草稿已更新。':'向與會同事確認修訂頁面；未確認前保留待核實標記。'));
 body+=doc('結局揭曉 · 完整虛構安排',c.truth)+`<details class="role-log"><summary>回看我經過的三幕</summary><ol><li>${esc(intervention?.reaction||'第一幕未完成。')}</li><li>${esc(route?route.source+'：'+route.limit:'第二幕未完成。')}</li><li>${esc(complete?'修訂稿已保存，狀態：'+status:'第三幕未完成。')}</li></ol></details>`;
 return body+resultActions();
}
function resultHead(title,desc){return `<section class="role-result-intro"><span class="role-eyebrow">${esc(D.title)} · ${S.early?'提早收尾':'本局回顧'}</span><h2 tabindex="-1">${esc(title)}</h2><p>${esc(desc)}</p></section>`;}
function resultActions(){return `<div class="role-actions">${btn('replay','再試一次，揀另一種處理')}${btn('home','換一個情境','role-secondary')}</div><p class="role-note role-bottom-note">所有人物、文件與反應均為虛構。以上係本局預設故事結果，唔代表真實服務安排或專業能力評核。</p>`;}
function render(focus=true){let html='';const active=document.activeElement,keep=!focus&&active?.matches?.('button[data-action]')?{action:active.dataset.action,id:active.dataset.id,index:active.dataset.index}:null;
 if(S.view==='home')html=home();
 else if(D.key==='rookie')html=S.view==='result'?rookieResult():S.view==='job'?rookieJob():rookieInbox();
 else if(D.key==='verify')html=S.view==='result'?verifyResult():S.view==='decision'?verifyDecision():verifyInvestigation();
 else if(D.key==='rescue')html=S.view==='result'?rescueResult():S.view==='route'?rescueRoute():S.view==='compose'?rescueCompose():rescueMeeting();
 main.innerHTML=html;save();
 if(S.view==='home'&&hasScenarioBuilder&&window.HKScenario)window.HKScenario.bind(main,prompt=>begin(prompt));
 if(focus){const heading=main.querySelector('h1[tabindex],h2[tabindex]');heading?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else if(keep){[...main.querySelectorAll('button[data-action]')].find(b=>b.dataset.action===keep.action&&b.dataset.id===keep.id&&b.dataset.index===keep.index)?.focus({preventScroll:true});}
}
async function begin(prompt){
 if(generating)return;
 const isCustom=typeof prompt==='string',nextScene=isCustom?makeCustomScene(prompt):customScene;
 if(isCustom)customPrompt=prompt;
 generating=true;
 if(hasScenarioBuilder&&window.HKScenario){
  const ready=await window.HKScenario.prepare(main,{label:nextScene?.title||D.scenes[S.scene].title,prompt:isCustom?prompt:customScene?customPrompt:undefined,onCancel:()=>{generating=false;customScene=null;S=fresh(S.scene);render();}});
  if(!ready){generating=false;return;}
 }
 customScene=nextScene;S=fresh(S.scene);S.view={rookie:'inbox',verify:'investigate',rescue:'meeting'}[D.key];generating=false;render();
}
function endNow(){S.early=D.key==='rookie'?Object.keys(S.answers).length<3:true;if(D.key==='verify')S.decision='hold';S.view='result';render();}
function error(text,id='role-error'){const target=document.getElementById(id);if(target){target.textContent=text;target.scrollIntoView({block:'center',behavior:'instant'});}}
main.addEventListener('input',e=>{if(['role-draft','role-fix'].includes(e.target.id)){const errorNode=document.getElementById('role-error');if(errorNode)errorNode.textContent='';}if(e.target.id==='role-draft'){S.draft=e.target.value;const type=exact(D.key==='rookie'?scene().replyOptions:scene().draftOptions,S.draft);main.querySelectorAll('[data-action="reply-preset"],[data-action="verify-preset"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===type)));save();}if(e.target.id==='role-fix'){S.fix=e.target.value;const type=exact(scene().fixOptions,S.fix);main.querySelectorAll('[data-action="fix-preset"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===type)));save();}});
main.addEventListener('click',e=>{const el=e.target.closest('button[data-action]');if(!el||el.disabled||generating)return;const action=el.dataset.action,id=el.dataset.id,c=scene();
 if(action==='scene'){customScene=null;S=fresh(Number(el.dataset.index));render(false);return;}
 if(action==='start'||action==='replay'){begin();return;}
 if(action==='home'){customScene=null;S=fresh(S.scene);render();return;}
 if(action==='end'){endNow();return;}
 if(action==='inbox'){S.view='inbox';render();return;}
 if(action==='job'){S.job=id;S.view='job';if(id==='reply')S.draft=S.answers.reply?.text||S.draft||'';render();return;}
 if(action==='summary'||action==='report'){const item=find(action==='summary'?c.summaryOptions:c.reportOptions,id);if(!item)return;S.answers[action]={id:item.id,text:item.text,reaction:item.reaction};S.notice=item.reaction;S.view='inbox';render();return;}
 if(action==='reply-preset'){S.draft=find(c.replyOptions,id)?.text||'';render(false);document.getElementById('role-draft')?.scrollIntoView({block:'center',behavior:'instant'});return;}
 if(action==='send-reply'){const text=S.draft.trim();if(!text){error('請先揀一句預設回覆，或者寫低你嘅草稿。');return;}const type=exact(c.replyOptions,text),item=find(c.replyOptions,type),reaction=item?.reaction||customNote;S.answers.reply={id:type,text,reaction};S.notice=reaction;S.view='inbox';render();return;}
 if(action==='investigate'){if(S.checked.length>=3||S.checked.includes(id)||!find(c.sources,id))return;S.checked.push(id);S.notice=S.checked.length===3?'三次調查已用完。保留線索，準備作編輯決定。':'新線索已打開。再查另一個來源，或者用目前資料作決定。';render(false);const card=main.querySelector(`[data-source="${id}"]`);if(card){card.tabIndex=-1;card.focus({preventScroll:true});card.scrollIntoView({block:'center',behavior:'instant'});}return;}
 if(action==='editorial'){S.view='decision';render();return;}
 if(action==='back-investigate'){S.view='investigate';render();return;}
 if(action==='decision-preset'){S.decision=id;render(false);return;}
 if(action==='verify-preset'){S.draft=find(c.draftOptions,id)?.text||'';render(false);document.getElementById('role-draft')?.scrollIntoView({block:'center',behavior:'instant'});return;}
 if(action==='finish-verify'){if(!S.decision){error('請先揀一個處理方法。','role-decision-error');return;}if(S.decision==='correct'&&!S.draft.trim()){error('請先選擇更正句，或者寫低你嘅草稿。');return;}S.early=false;S.view='result';render();return;}
 if(action==='intervene'){if(!find(c.interventions,id))return;S.intervention=id;S.view='route';render();return;}
 if(action==='route'){if(!find(c.routes,id))return;S.route=id;S.view='compose';render();return;}
 if(action==='fix-preset'){S.fix=find(c.fixOptions,id)?.text||'';render(false);document.getElementById('role-fix')?.scrollIntoView({block:'center',behavior:'instant'});return;}
 if(action==='finish-rescue'){if(!S.fix.trim()){error('請先揀一個修訂方向，或者寫低你嘅版本。');return;}S.early=false;S.view='result';render();}
});
render(false);
})();
