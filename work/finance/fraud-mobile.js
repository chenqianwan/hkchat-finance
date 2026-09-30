(()=>{'use strict';
const CASES=__FRAUD_CASE_DATA__,DOMAINS=__FRAUD_DOMAIN_DATA__,STORAGE='hkchat-finance:fraud:v1';
const root=document.getElementById('hkdetect');if(!root)return;
const content=root.querySelector('#d-content'),dialog=root.querySelector('#d-dialog');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>'<i data-lucide="'+n+'" aria-hidden="true"></i>';
const findDomain=id=>DOMAINS.find(d=>d.id===id);
const fresh=()=>({version:1,screen:'hub',domain:'',caseKey:'',round:1,stage:0,target:'p0',interviews:[],read:[],accused:'',hints:0,hubTopic:'',generated:false,seed:0,questionDrafts:{}});
let state=fresh(),notice='',lastFile='';
function cleanText(value,max=120){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
function currentCase(){return CASES[state.caseKey];}
function person(id){return currentCase()?.suspects.find(p=>p.id===id);}
function file(id){return currentCase()?.evidence.find(e=>e.id===id);}
function question(id){return currentCase()?.questions.find(q=>q.id===id);}
function restore(){try{
 const old=JSON.parse(localStorage.getItem(STORAGE));if(old?.version!==1)return;
 const n=fresh();n.hubTopic=cleanText(old.hubTopic);n.domain=findDomain(old.domain)?old.domain:'';
 if(CASES[old.caseKey]){n.caseKey=old.caseKey;n.domain=n.domain||CASES[n.caseKey].domain;n.stage=[0,1,4,5].includes(old.stage)?old.stage:0;n.round=Number.isInteger(old.round)?Math.min(5,Math.max(1,old.round)):1;n.target=CASES[n.caseKey].suspects.some(p=>p.id===old.target)?old.target:'p0';n.accused=CASES[n.caseKey].suspects.some(p=>p.id===old.accused)?old.accused:'';n.generated=old.generated===true;n.seed=Number(old.seed)>>>0;n.read=(Array.isArray(old.read)?old.read:[]).filter(id=>CASES[n.caseKey].evidence.some(e=>e.id===id));n.hints=Math.min(3,Math.max(0,Number(old.hints)||0));}
 n.screen=old.screen==='case'&&n.caseKey?'case':old.screen==='domain'&&n.domain?'domain':'hub';if(n.stage===5&&!n.accused)n.stage=4;state=n;
 state.interviews=(Array.isArray(old.interviews)?old.interviews:[]).filter(e=>e&&person(e.suspectId)&&Number.isInteger(e.round)&&e.round>=1&&e.round<=5&&((e.kind==='preset'&&question(e.questionId)?.suspectId===e.suspectId&&question(e.questionId)?.round===e.round)||(e.kind==='custom'&&typeof e.text==='string'))).slice(-60).map(e=>({kind:e.kind,suspectId:e.suspectId,round:e.round,questionId:e.kind==='preset'?e.questionId:'',text:e.kind==='custom'?cleanText(e.text,500):''}));
 }catch{state=fresh();}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{notice='呢個瀏覽器未能保存進度，你仍然可以繼續玩。';}}
function randomSeed(){if(window.crypto?.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0];}return Math.floor(Math.random()*4294967296);}
function loadCase(key,generated=false,seed=0){if(!CASES[key])return;const topic=state.hubTopic;state={...fresh(),screen:'case',domain:CASES[key].domain,caseKey:key,hubTopic:topic,generated,seed};notice='';save();render(true);}
function showDomain(id){if(!findDomain(id))return;state.domain=id;state.screen='domain';notice='';save();render(true);}
function button(action,label,primary=true,disabled=false){return '<button type="button" class="'+(primary?'d-primary':'d-secondary')+' d-full" data-action="'+action+'"'+(disabled?' disabled':'')+'>'+label+'</button>';}
function avatar(p){return '<span class="d-avatar tone-'+currentCase().suspects.findIndex(x=>x.id===p.id)+'" aria-hidden="true">'+esc(p.name[0])+'</span>';}
function speech(id,text){const p=person(id);return '<article class="d-speech"><div class="d-speaker">'+avatar(p)+'<div><strong>'+esc(p.name)+'</strong><small>'+esc(p.role)+'</small></div></div><p>'+esc(text)+'</p></article>';}
function archive(){return '<details id="d-records"><summary>核對原始記錄 '+icon('chevron-down')+'</summary><div class="d-evidence-grid">'+currentCase().evidence.map(e=>'<button type="button" class="d-evidence-card'+(state.read.includes(e.id)?' read':'')+'" data-evidence="'+e.id+'"><span class="d-evhead">'+e.id+icon('file-text')+'</span><strong>'+esc(e.title)+'</strong><small>'+(state.read.includes(e.id)?'已閱 · 再睇一次':'打開完整記錄')+'</small></button>').join('')+'</div></details>';}
function references(refs){return '<details class="d-references"><summary>教育參考 '+icon('external-link')+'</summary><ul>'+refs.map(r=>'<li><a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.title)+'</a></li>').join('')+'</ul><p class="d-small">參考資料只用作一般教育；本局機構、人物、文件同對話全部虛構。</p></details>';}
__FRAUD_DOMAIN_VIEWS__
function intro(){const c=currentCase();return fraudPhotoHero(DOMAIN_PHOTOS[c.domain],c.title,c.subtitle,'金融防騙局',c.domain)+'<section class="d-ticket"><span class="d-overline">'+esc(c.kicker)+'</span><h2>邊句說法最值得警惕？</h2><p>'+esc(c.intro)+'</p><div class="d-ticket-bottom"><span>先睇說法，再核對記錄</span><strong>隨時判斷</strong></div></section>'+(state.generated?'<p class="d-demo-note">已按話題配對預設劇本。呢局係本機示範，唔係真人個案分析。</p>':'')+'<div class="d-cast">'+c.suspects.map(p=>'<div class="d-cast-card">'+avatar(p)+'<strong>'+esc(p.name)+'</strong><small>'+esc(p.role)+'</small></div>').join('')+'</div>'+button('start','開始對話 '+icon('arrow-right'))+(state.generated?'<button type="button" class="d-link d-full" data-action="reroll">'+icon('shuffle')+'換一個同類劇本</button>':'')+mission();}
__FRAUD_INTERVIEWS__
__FRAUD_CONVERSATION__
function render(scroll=false){root.dataset.view=state.screen==='case'&&state.stage===1?'conversation':'other';root.querySelector('#d-hero-placeholder').hidden=true;content.innerHTML=state.screen==='hub'?hub():state.screen==='domain'?domainPage():('<button type="button" class="d-link d-back" data-action="case-scenes">'+icon('arrow-left')+esc(findDomain(currentCase().domain).label)+'</button>'+(state.stage===0?intro():state.stage===1?conversation():state.stage===4?accusation():result()));root.querySelector('#d-status').textContent=notice;window.lucide?.createIcons({attrs:{width:18,height:18}});if(scroll)window.scrollTo({top:0,behavior:'instant'});}
function openFile(id){const e=file(id);if(!e)return;lastFile=id;if(!state.read.includes(id)){state.read.push(id);save();}dialog.innerHTML='<div class="d-dialog-head"><span class="d-overline">記錄 '+esc(id)+'</span><button type="button" class="d-close" data-action="close-dialog" aria-label="關閉記錄">'+icon('x')+'</button></div><h2 id="d-dialog-title">'+esc(e.title)+'</h2><p class="d-doc-body">'+esc(e.body)+'</p><p class="d-doc-source">'+esc(e.source)+'</p><div class="d-dialog-actions">'+button('close-dialog','睇完了 '+icon('check'))+'</div>';window.lucide?.createIcons({attrs:{width:18,height:18}});dialog.showModal();}
root.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.domain){showDomain(b.dataset.domain);return;}
 if(b.dataset.case){loadCase(b.dataset.case);return;}
 if(b.dataset.topic){state.hubTopic=b.dataset.topic;root.querySelector('#d-topic').value=state.hubTopic;root.querySelector('#d-topic').focus();save();return;}
 if(b.dataset.evidence){openFile(b.dataset.evidence);return;}
 if(b.dataset.target&&state.stage===1&&person(b.dataset.target)){state.target=b.dataset.target;save();render();root.querySelector('[data-target="'+state.target+'"]').focus({preventScroll:true});return;}
 if(b.dataset.question&&state.stage===1){const q=question(b.dataset.question);if(q?.suspectId===state.target&&q.round===state.round&&!wasAsked(q.id)){state.interviews.push({kind:'preset',questionId:q.id,suspectId:q.suspectId,round:state.round});afterInterview();}return;}
 const a=b.dataset.action;if(!a)return;notice='';
 if(a==='close-dialog'){dialog.close();return;}
 if(a==='home'){state.screen='hub';}
 else if(a==='case-scenes'){showDomain(currentCase().domain);return;}
 else if(a==='resume'&&currentCase()){state.screen='case';}
 else if(a==='random-domain'){showDomain(DOMAINS[randomSeed()%DOMAINS.length].id);return;}
 else if(a==='random'){const d=findDomain(state.domain);if(!d)return;const keys=d.cases.map(e=>e.key).filter(k=>k!==state.caseKey);loadCase(keys[randomSeed()%keys.length]||d.cases[0].key);return;}
 else if(a==='reroll'){const d=findDomain(currentCase().domain);const keys=d.cases.map(e=>e.key).filter(k=>k!==state.caseKey);loadCase(keys[0]||state.caseKey,true,randomSeed());return;}
 else if(a==='reset'){loadCase(state.caseKey,state.generated,state.seed);return;}
 else if(a==='start'&&currentCase()){state.stage=1;state.round=1;}
 else if(a==='next-round'&&state.stage===1&&state.round<5){state.round++;}
 else if(a==='prev-round'&&state.stage===1&&state.round>1){state.round--;}
 else if(a==='accuse'&&state.stage===1){state.stage=4;}
 else if(a==='back'&&[4,5].includes(state.stage)){state.stage=1;}
 else if(a==='reveal'&&state.stage===4&&person(state.accused)){state.stage=5;}
 else if(a==='hint'&&state.stage===1){state.hints=Math.min(3,state.hints+1);}
 else return;save();render(a!=='hint');
});
root.addEventListener('input',ev=>{if(ev.target.id==='d-topic'){state.hubTopic=ev.target.value.slice(0,120);root.querySelector('#d-topic-error').textContent='';save();}if(ev.target.id==='d-question-input'&&state.stage===1){state.questionDrafts[state.target]=ev.target.value.slice(0,500);root.querySelector('#d-question-send').disabled=!ev.target.value.trim();}});
root.addEventListener('submit',ev=>{if(ev.target.id==='d-question-form'){ev.preventDefault();submitFollowup();return;}if(ev.target.id!=='d-custom-form')return;ev.preventDefault();const topic=cleanText(root.querySelector('#d-topic').value);if(topic.length<2){root.querySelector('#d-topic-error').textContent='寫至少兩個字，揀個練習方向。';return;}state.hubTopic=topic;const seed=randomSeed(),pick=window.HKFinanceFraudGenerator.select(topic,seed,state.screen==='domain'?state.domain:'',CASES,DOMAINS);loadCase(pick.key,true,seed);});
root.addEventListener('change',ev=>{if(ev.target.name==='culprit'&&state.stage===4&&person(ev.target.value)){state.accused=ev.target.value;save();root.querySelector('[data-action="reveal"]').disabled=false;}});
dialog.addEventListener('click',ev=>{if(ev.target!==dialog)return;const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();});
dialog.addEventListener('close',()=>{const card=root.querySelector('[data-evidence="'+lastFile+'"]');if(card){card.classList.add('read');card.querySelector('small').textContent='已閱 · 再睇一次';card.focus({preventScroll:true});}});
restore();render();
})();
