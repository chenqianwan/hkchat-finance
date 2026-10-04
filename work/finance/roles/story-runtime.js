(()=>{'use strict';
const D=window.HK_ROLE_DATA,root=document.getElementById('hkroles'),main=document.getElementById('role-main');
if(!D||!root||!main)return;
const KEY='hkchat-finance-role-'+D.key;
const fresh=(scene=0)=>({version:1,scene,view:'home',job:null,answers:{},checked:[],draft:'',fix:'',decision:null,intervention:null,route:null,notice:'',early:false});
let S=fresh();
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.version===1&&Number.isInteger(saved.scene)&&D.scenes[saved.scene]&&['home','inbox','job','investigate','decision','meeting','route','compose','result'].includes(saved.view)){S=Object.assign(fresh(saved.scene),saved);S.answers=S.answers&&typeof S.answers==='object'?S.answers:{};S.checked=Array.isArray(S.checked)?S.checked.filter(id=>D.scenes[S.scene].sources?.some(x=>x.id===id)).slice(0,3):[];}}catch{}
const scene=()=>D.scenes[S.scene];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch{}};
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
function home(){return `<section class="role-hero"><img src="${D.photo}" alt="${esc(D.photoAlt)}"><small>AI 情境圖</small><div><p class="role-eyebrow">${esc(D.eyebrow)}</p><h1 tabindex="-1">${esc(D.title)}</h1><p>${esc(D.tagline)}</p></div></section><p class="role-home-intro">${esc(D.intro)}</p><h2 class="role-home-label">揀一個情境</h2><div class="role-scenes">${D.scenes.map((c,i)=>btn('scene',`<span class="role-scene-num">0${i+1}</span><span class="role-scene-copy"><strong>${esc(c.title)}</strong><small>${esc(c.subtitle)}</small></span><span class="role-tick" aria-hidden="true">${S.scene===i?'✓':'›'}</span>`,'role-scene',`data-index="${i}" aria-pressed="${S.scene===i}"`)).join('')}</div>${btn('start',esc(D.start))}<div class="role-steps">${D.steps.map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="role-note role-home-foot">虛構人物與服務 · ${D.key==='rookie'?'三件待辦':D.key==='verify'?'最多三次調查':'三幕短故事'}<br>預設互動演示，唔係專業能力測試。</p>`;}

function rookieInbox(){const c=scene(),done=Object.keys(S.answers).length;return top(`${done} / 3 件待辦已記錄`)+playHead('我的第一日 · '+c.title,'我的工作收件匣',c.intro)+talk(S.notice?'最新回應':c.colleague,S.notice||c.message)+`<div class="role-inbox">${[
 ['summary','核對文件，寫摘要','核對文件，把目前狀態寫入紀錄。'],['reply','回覆客人','選一段回覆，或寫自己的草稿。'],['report','向主管匯報','交代處理狀態與下一步。']
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
 if(focus){const heading=main.querySelector('h1[tabindex],h2[tabindex]');heading?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else if(keep){[...main.querySelectorAll('button[data-action]')].find(b=>b.dataset.action===keep.action&&b.dataset.id===keep.id&&b.dataset.index===keep.index)?.focus({preventScroll:true});}
}
function begin(){S=fresh(S.scene);S.view={rookie:'inbox',verify:'investigate',rescue:'meeting'}[D.key];render();}
function endNow(){S.early=D.key==='rookie'?Object.keys(S.answers).length<3:true;if(D.key==='verify')S.decision='hold';S.view='result';render();}
function error(text,id='role-error'){const target=document.getElementById(id);if(target){target.textContent=text;target.scrollIntoView({block:'center',behavior:'instant'});}}
main.addEventListener('input',e=>{if(['role-draft','role-fix'].includes(e.target.id)){const errorNode=document.getElementById('role-error');if(errorNode)errorNode.textContent='';}if(e.target.id==='role-draft'){S.draft=e.target.value;const type=exact(D.key==='rookie'?scene().replyOptions:scene().draftOptions,S.draft);main.querySelectorAll('[data-action="reply-preset"],[data-action="verify-preset"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===type)));save();}if(e.target.id==='role-fix'){S.fix=e.target.value;const type=exact(scene().fixOptions,S.fix);main.querySelectorAll('[data-action="fix-preset"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===type)));save();}});
main.addEventListener('click',e=>{const el=e.target.closest('button[data-action]');if(!el||el.disabled)return;const action=el.dataset.action,id=el.dataset.id,c=scene();
 if(action==='scene'){S=fresh(Number(el.dataset.index));render(false);return;}
 if(action==='start'||action==='replay'){begin();return;}
 if(action==='home'){S=fresh(S.scene);render();return;}
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
