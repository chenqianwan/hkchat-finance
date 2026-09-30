(()=>{'use strict';
// Interactive prototype: authored financial literacy scenes + local topic matching and adaptive branches. No model request.
const STORIES=__QUIZ_STORIES__,root=document.getElementById('hkquiz'),main=root.querySelector('#q-main'),KEY='hkchat-finance-quiz-generated-v1';
const BRIEF_PHOTOS=__QUIZ_BRIEF_PHOTOS__,HOME_PHOTO=__QUIZ_HOME_PHOTO__;
const paths={arrow:'M5 12h14M13 6l6 6-6 6',back:'M19 12H5M11 6l-6 6 6 6',check:'m5 12 4 4L19 6',book:'M12 21V5M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z',flag:'M5 22V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3Z',spark:'m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3ZM20 2v4M18 4h4',work:'M3 7h18v14H3zM8 7V3h8v4M3 12c6 3 12 3 18 0M10 12h4v4h-4z',online:'M6 2h12v20H6zM10 18h4M6 5h12',repeat:'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M18 18a8 8 0 0 1-14-6',bulb:'M9 18h6M9 21h6M8 15c0-2-3-3-3-7a7 7 0 1 1 14 0c0 4-3 5-3 7M9 15h6',cross:'m6 6 12 12M6 18 18 6',chevron:'m9 5 7 7-7 7'};
const icon=n=>'<svg class="q-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[n]||paths.book)+'"/></svg>';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catalog=new Map();
for(const s of STORIES)for(const q of s.questions){const key=s.id+'/'+q.id;catalog.set(key,{...q,key,baseKey:key,storyId:s.id,isTwist:false});if(q.twist)catalog.set(key+'~twist',{...q.twist,key:key+'~twist',baseKey:key,storyId:s.id,isTwist:true})}
const safeTopic=v=>typeof v==='string'?v.trim().slice(0,80):'';
let state={version:1,view:'home',draft:'',counter:0,sessions:[],active:null},busy=null,timers=[],token=0,error='';
let mode=location.hash==='#pk'?'pk':'solo';
try{
 const p=JSON.parse(localStorage.getItem(KEY)||'null');
 if(p?.version===1){
  state.draft=safeTopic(p.draft);state.counter=Number.isSafeInteger(p.counter)&&p.counter>=0?p.counter:0;
  if(Array.isArray(p.sessions))for(const r of p.sessions.slice(-12)){
   if(!r||!/^round-\d+$/.test(r.id)||state.sessions.some(x=>x.id===r.id)||!STORIES.some(s=>s.id===r.storyId)||!Array.isArray(r.steps)||r.steps.length!==5||!r.steps.every(k=>catalog.get(k)?.storyId===r.storyId))continue;
   const answers=[];if(Array.isArray(r.answers))for(let i=0;i<Math.min(r.answers.length,5);i++){const a=r.answers[i];if(!Number.isInteger(a)||a<0||a>=catalog.get(r.steps[i]).options.length)break;answers.push(a)}
   const complete=r.complete===true&&answers.length===5;let index=r.index;
   if(!Number.isInteger(index)||index<0||index>4||![index,index+1].includes(answers.length))index=Math.min(answers.length,4);
   state.sessions.push({id:r.id,storyId:r.storyId,topic:safeTopic(r.topic)||STORIES.find(s=>s.id===r.storyId).title,seed:Number.isInteger(r.seed)?r.seed>>>0:1,steps:r.steps,answers,index:complete?4:index,complete,tailored:r.tailored===true});
   state.counter=Math.max(state.counter,Number(r.id.slice(6)));
  }
  if(state.sessions.some(r=>r.id===p.active))state.active=p.active;
  const r=state.sessions.find(r=>r.id===state.active);if(r&&['brief','play','result'].includes(p.view))state.view=r.complete?'result':p.view==='result'?'play':p.view;
 }
}catch{}
const run=()=>state.sessions.find(r=>r.id===state.active);
const story=r=>STORIES.find(s=>s.id===r.storyId);
const current=()=>catalog.get(run().steps[run().index]);
const score=r=>r.answers.reduce((sum,a,i)=>sum+Number(a===catalog.get(r.steps[i]).correct),0);
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function source(q){return '<a href="'+esc(q.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(q.sourceLabel)+' ↗</a>'}
function order(seed,count){let x=seed>>>0;const a=Array.from({length:count},(_,i)=>i);for(let i=a.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function matchTopic(topic){const text=topic.toLowerCase();return STORIES.map(s=>({s,score:s.aliases.reduce((n,k)=>n+(text.includes(k.toLowerCase())?k.length:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)[0]?.s}
function modeTabs(){return '<div class="q-mode-tabs" role="group" aria-label="選擇玩法"><button type="button" data-quiz-mode="solo" aria-pressed="'+(mode==='solo')+'">單人闖關</button><button type="button" data-quiz-mode="pk" aria-pressed="'+(mode==='pk')+'">PK 對戰</button></div>'}
function home(){
 const active=run(),history=state.sessions.slice().reverse().filter(r=>r!==active||r.complete),prompts=[['bank','用手機銀行，有咩安全細節要留意？'],['insurance','第一次睇保單，有咩條款要睇清？'],['daily','整理日常收支，應該由邊度開始？']];
 return '<section class="p-photo-hero"><img class="p-photo-bg" src="'+HOME_PHOTO+'" alt="" aria-hidden="true" decoding="async"><div class="p-photo-copy"><span class="p-photo-kicker">你揀話題，情境跟住變</span><h1 tabindex="-1" data-focus>財智快打</h1><p>由一個生活場景，練習多想一步。</p></div></section>'+modeTabs()+'<form id="q-generator" class="q-generator"><label for="q-topic">今次想挑戰咩話題？</label><textarea id="q-topic" maxlength="80" rows="3" placeholder="例如：我想了解手機銀行安全，或點樣睇清保單…">'+esc(state.draft)+'</textarea><div class="q-prompt-chips">'+prompts.map(([id,t])=>'<button type="button" data-topic="'+id+'" data-prompt="'+esc(t)+'">'+icon(id==='bank'?'online':id==='insurance'?'work':'book')+esc(id==='bank'?'手機銀行':id==='insurance'?'睇清保單':'生活收支')+'</button>').join('')+'</div><p class="q-topic-error" id="q-topic-error" role="status">'+esc(error)+'</p><button class="q-primary" type="submit" data-action="generate">'+icon('spark')+' 生成我的關卡 '+icon('arrow')+'</button><div class="q-gen-caption"><span>每局 5 關</span><span>按你的回答調整</span></div></form>'+
 (active&&!active.complete?'<button class="q-resume" type="button" data-session="'+active.id+'"><span>'+icon('flag')+'</span><span><strong>繼續上一局</strong><small>'+esc(active.topic)+' · 第 '+(active.index+1)+' / 5 關</small></span>'+icon('arrow')+'</button>':'')+
 (history.length?'<div class="q-section-head"><h2>為你編排過</h2><span>'+history.length+' 局</span></div><div class="q-history">'+history.map(r=>'<button type="button" data-session="'+r.id+'"><span class="q-history-icon">'+icon(r.complete?'check':'book')+'</span><span><strong>'+esc(r.topic)+'</strong><small>'+esc(story(r).title)+' · '+(r.complete?'完成 · '+score(r)+' / 5':'第 '+(r.index+1)+' / 5 關')+'</small></span>'+icon('chevron')+'</button>').join('')+'</div>':'')+'<p class="q-footnote">本機情境編排示範 · 由預設故事與條件組合，並非即時 AI 對話。<br>一般金融教育 · 引用資料不代表來源機構認可。</p>';
}
function generating(){const b=busy,s=STORIES.find(s=>s.id===b.storyId),labels=['正在配對話題範本','正在編排生活情境','正在整理五關挑戰'];return '<button class="q-back" type="button" data-action="cancel">'+icon('back')+' 返回</button><section class="q-generating" aria-busy="true"><div class="q-generation-orbit">'+icon('spark')+'</div><span class="q-eyebrow">正在編排你的挑戰</span><h1 tabindex="-1" data-focus>'+esc(b.topic)+'</h1><p>'+esc(s.intro)+'</p><ol class="q-generation-steps" aria-live="polite">'+labels.map((label,i)=>'<li class="'+(i<b.step?'done':i===b.step?'active':'')+'"><span>'+(i<b.step?icon('check'):i===b.step?'<i class="q-spinner"></i>':i+1)+'</span>'+label+'</li>').join('')+'</ol><div class="q-generation-preview"><span>'+esc(s.title)+'</span><p>'+esc(s.questions[Math.min(b.step,4)].scene)+'</p><div class="q-generation-bar"><i style="width:'+([26,63,92][b.step])+'%"></i></div></div></section>'}
function brief(){const r=run(),s=story(r);return '<button class="q-back" type="button" data-action="home">'+icon('back')+' 換個話題</button><section class="q-brief-hero" data-brief-theme="'+esc(s.id)+'"><img class="q-brief-photo" src="'+esc(BRIEF_PHOTOS[s.id])+'" alt="" aria-hidden="true" decoding="async"><span class="q-brief-credit">AI 生成場景</span><div class="q-brief-copy"><span class="q-generated-tag">你的情境挑戰已就緒</span><h1 tabindex="-1" data-focus>'+esc(r.topic)+'</h1><p>'+esc(s.intro)+'</p></div></section><div class="q-coach">'+icon('spark')+'<p>'+(r.tailored?'今局會先重溫你上次未掌握嘅重點，再換個條件繼續考你。':'準備好 5 個生活判斷。你答完之後，後面嘅關卡會按回答調整。')+'</p></div><ol class="q-plan">'+r.steps.map((key,i)=>{const q=catalog.get(key);return '<li><span>'+String(i+1).padStart(2,'0')+'</span><div><strong>'+esc(q.scene)+'</strong><small>'+esc(q.legalLabel)+'</small></div></li>'}).join('')+'</ol><button class="q-primary" type="button" data-action="begin">開始我的挑戰 '+icon('arrow')+'</button><button class="q-text-button" type="button" data-action="regenerate">'+icon('repeat')+' 換一組情境</button>'}
function feedback(q,answer){const good=answer===q.correct;return '<section class="q-feedback'+(good?' correct':' missed')+'" aria-labelledby="q-feedback-heading"><div class="q-feedback-heading" role="status"><span>'+icon(good?'check':'bulb')+'</span><h3 id="q-feedback-heading" tabindex="-1">'+(good?'答啱了！':'關鍵條件喺呢度')+'</h3>'+(good?'<b>＋1</b>':'')+'</div><p class="q-answer-label">合適答案：'+esc(q.options[q.correct])+'</p><p class="q-explanation">'+esc(q.explanation)+'</p><div class="q-rule">'+icon('book')+'<span>'+esc(q.takeaway)+'</span></div><details class="q-basis"><summary>睇解說資料</summary><p>'+esc(q.legalLabel)+'</p>'+source(q)+'</details></section>'}
function coachNote(r,q){if(q.isTwist&&r.index>0&&catalog.get(r.steps[r.index-1]).baseKey===q.baseKey){const prev=catalog.get(r.steps[r.index-1]),missed=r.answers[r.index-1]!==prev.correct;return '<div class="q-coach q-branch-note">'+icon('spark')+'<p><strong>'+(missed?'換個條件，重溫啱啱嘅重點':'應你的挑戰，條件變咗')+'</strong>'+esc(q.changed)+'</p></div>'}return '<div class="q-coach q-brief-coach">'+icon('spark')+'<p>'+(r.index===0?'由呢個場景開始，睇下你會點判斷。':'繼續呢個話題，留意另一個金融細節。')+'</p></div>'}
function play(){
 const r=run(),s=story(r),q=current(),answered=r.answers.length>r.index,answer=r.answers[r.index],canTwist=!q.isTwist&&catalog.has(q.baseKey+'~twist')&&r.index<4;
 const adaptive=answered&&answer!==q.correct&&canTwist;
 return '<div class="q-play-top"><button class="q-back" type="button" data-action="home" aria-label="返回話題入口">'+icon('back')+' 我的挑戰</button><span class="q-score">'+icon('star')+' '+score(r)+'</span></div><div class="q-session-topic">'+icon('spark')+'<span>'+esc(r.topic)+'</span></div><div class="q-progress-header"><span>第 <strong>'+(r.index+1)+'</strong> / 5 關</span><span>'+esc(q.scene)+'</span></div><ol class="q-progress" aria-label="關卡進度">'+r.steps.map((key,i)=>'<li class="'+(i<r.answers.length?(r.answers[i]===catalog.get(key).correct?'right':'wrong'):i===r.index?'current':'')+'"'+(i===r.index?' aria-current="step"':'')+' aria-label="第 '+(i+1)+' 關"><span>'+(i<r.answers.length?icon(r.answers[i]===catalog.get(key).correct?'check':'bulb'):i+1)+'</span></li>').join('')+'</ol>'+coachNote(r,q)+
 '<section class="q-scenario"><div class="q-speaker"><span class="q-avatar">'+icon(s.id==='bank'?'online':s.id==='insurance'?'work':'book')+'</span><span>'+esc(q.speaker)+'</span><small>虛構情境</small></div><p>「'+esc(q.statement)+'」</p></section><h2 class="q-question" tabindex="-1" data-focus>'+esc(q.question)+'</h2><p class="q-pick-label">揀一個最合適嘅答案</p><div class="q-options" role="group" aria-label="答案選項">'+order(r.seed+r.index,3).map((i,pos)=>{
 const mark=answered?(i===q.correct?' right':i===answer?' wrong':' muted'):'';
 return '<button class="q-option'+mark+'" type="button" data-answer="'+i+'" aria-pressed="'+(answered&&i===answer)+'"'+(answered?' disabled':'')+'><span class="q-option-letter">'+(answered&&i===q.correct?icon('check'):answered&&i===answer?icon('cross'):['A','B','C'][pos])+'</span><span>'+esc(q.options[i])+'</span>'+(answered&&i===answer?'<small>你揀的</small>':'')+'</button>';
 }).join('')+'</div>'+(answered?feedback(q,answer)+(busy?.kind==='next'?'<div class="q-next-loading" role="status" aria-live="polite"><i class="q-spinner"></i>'+esc(busy.message)+'</div>':
 (r.index<4?'<div class="q-next-coach"><span>'+icon('spark')+'</span><p>'+(adaptive?'啱啱嘅重點值得再練。下一關換個條件，你再判斷一次。':'呢關完成，繼續編排下一個場景。')+'</p></div>':'')+'<button class="q-primary" type="button" data-action="next">'+(r.index===4?'睇我的學習小結':'編排下一關')+' '+icon(r.index===4?'arrow':'spark')+'</button>'+(canTwist&&!adaptive?'<button class="q-secondary" type="button" data-action="twist">'+icon('repeat')+' 換個條件再考我</button>':'')):'<p class="q-gentle">唔使趕時間，諗清楚再揀。</p>');
}
function result(){
 const r=run(),n=score(r),missed=r.steps.filter((key,i)=>r.answers[i]!==catalog.get(key).correct),weak=[...new Set(missed.map(k=>catalog.get(k).takeaway))];
 return '<button class="q-back" type="button" data-action="home">'+icon('back')+' 話題入口</button><section class="q-result-hero"><div class="q-trophy" aria-hidden="true">'+icon(n===5?'star':'spark')+'</div><span class="q-eyebrow">你的學習小結</span><h1 tabindex="-1" data-focus>'+(n===5?'五關全啱，記得重點！':n>=3?'又多識一點金融知識':'將幾個重點帶返生活')+'</h1><p class="q-result-topic">'+esc(r.topic)+'</p><div class="q-result-score"><strong>'+n+'</strong><span>/ 5</span></div><div class="q-result-dots" aria-label="'+n+' 題答啱">'+r.steps.map((key,i)=>'<span class="'+(r.answers[i]===catalog.get(key).correct?'right':'wrong')+'">'+icon(r.answers[i]===catalog.get(key).correct?'check':'bulb')+'</span>').join('')+'</div></section><section class="q-personal-summary"><div>'+icon('spark')+'<strong>'+(weak.length?'下次，先重溫呢幾點':'下次，可以換個條件挑戰')+'</strong></div><p>'+(weak.length?weak.map(esc).join(' '):'今局嘅判斷都答啱。再換一組條件，睇下你會唔會留意到不同細節。')+'</p></section><div class="q-section-head"><h2>今局的五個判斷</h2><span>點開重溫</span></div><div class="q-review">'+r.steps.map((key,i)=>{
 const q=catalog.get(key),good=r.answers[i]===q.correct;
 return '<details class="q-review-card" data-review="'+i+'"><summary><span class="q-review-state '+(good?'right':'wrong')+'">'+icon(good?'check':'bulb')+'</span><span>'+esc(q.takeaway)+'<small>'+(good?'已掌握':'再記一下')+(q.isTwist?' · 條件變化':'')+'</small></span><b aria-hidden="true">＋</b></summary><div class="q-review-copy"><p class="q-review-question">'+esc(q.question)+'</p><p>你揀了：'+esc(q.options[r.answers[i]])+'</p><p class="q-review-answer">合適答案：'+esc(q.options[q.correct])+'</p><p>'+esc(q.explanation)+'</p><p class="q-review-basis">'+esc(q.legalLabel)+'</p>'+source(q)+'</div></details>';
 }).join('')+'</div><button class="q-primary" type="button" data-action="personalize">'+icon('spark')+' '+(weak.length?'按我的錯題，再出一局':'換一組條件，再出一局')+'</button><button class="q-secondary" type="button" data-action="home">換個話題 '+icon('arrow')+'</button><p class="q-footnote">本機情境編排示範 · 小結只反映今局答題。<br>一般金融教育 · 引用資料不代表來源機構認可。</p>';
}
function render(top=false,focus){if(mode==='pk'){duel.render(top,focus);return;}main.innerHTML=state.view==='generating'&&busy?generating():state.view==='home'?home():state.view==='brief'?brief():state.view==='result'?result():play();root.dataset.view=state.view;root.setAttribute('aria-busy',String(Boolean(busy)));if(top)window.scrollTo({top:0,behavior:'instant'});if(focus){const el=main.querySelector(focus);el?.focus({preventScroll:true});if(!top)el?.scrollIntoView({block:'nearest',behavior:'auto'})}}
function stop(){token++;timers.forEach(clearTimeout);timers=[];busy=null;if(state.view==='generating')state.view='home'}
function generate(topic,priority=[],forceStory){
 if(busy)return;topic=safeTopic(topic);const s=forceStory?STORIES.find(s=>s.id===forceStory):matchTopic(topic);state.draft=topic;
 if(!topic||!s){error=topic?'呢個話題暫時未有範本。今次示範支援手機銀行、保險條款同生活收支，可以試下上面嘅例子。':'先寫一個生活話題，或揀上面嘅例子。';state.view='home';save();render(false,'#q-topic');return;}
 error='';const previous=state.sessions.filter(r=>r.storyId===s.id).at(-1),seed=(Math.floor(Math.random()*4294967296))>>>0;const t=++token;
 busy={kind:'session',step:0,topic,storyId:s.id};state.view='generating';save();render(true,'[data-focus]');
 timers=[setTimeout(()=>{if(t!==token)return;busy.step=1;render()},650),setTimeout(()=>{if(t!==token)return;busy.step=2;render()},1300),setTimeout(()=>{
  if(t!==token)return;
  const preferred=[...new Set(priority)].filter(k=>catalog.get(k)?.storyId===s.id).map(k=>catalog.get(k).baseKey);
  const ordered=[...new Set([...preferred,...s.questions.map(q=>s.id+'/'+q.id)])];
  let steps=ordered.map((key,i)=>{
   if(!catalog.has(key+'~twist'))return key;
   const prev=previous?.steps.filter(k=>catalog.get(k).baseKey===key).at(-1);
   if(priority.length&&preferred.includes(key)){const failed=priority.filter(k=>catalog.get(k).baseKey===key).at(-1);return failed.endsWith('~twist')?key:key+'~twist';}
   return prev?(prev.endsWith('~twist')?key:key+'~twist'):i%2===1?key+'~twist':key;
  }).slice(0,5);
  const id='round-'+(++state.counter),r={id,storyId:s.id,topic,seed,steps,answers:[],index:0,complete:false,tailored:priority.length>0};
  state.sessions.push(r);state.sessions=state.sessions.slice(-12);state.active=id;state.view='brief';busy=null;timers=[];save();render(true,'[data-focus]');
 },2050)];
}
function advance(forceTwist=false){
 if(busy||state.view!=='play')return;const r=run(),q=current();if(r.answers.length!==r.index+1)return;
 if(r.index===4){r.complete=true;state.view='result';save();render(true,'[data-focus]');return;}
 const twist=!q.isTwist&&catalog.has(q.baseKey+'~twist')&&(forceTwist||r.answers[r.index]!==q.correct),t=++token;
 busy={kind:'next',message:twist?'正在改變關鍵條件，準備追問…':'正在編排下一個場景…'};render(false,'.q-next-loading');
 timers=[setTimeout(()=>{if(t!==token)return;if(twist){r.steps.splice(r.index+1,0,q.baseKey+'~twist');r.steps=r.steps.slice(0,5)}r.index++;busy=null;timers=[];save();render(true,'[data-focus]')},950)];
}
const duel=window.HKQuizDuel({root,main,stories:STORIES,icon,esc,source,modeTabs,homePhoto:HOME_PHOTO,onSolo:()=>setMode('solo')});
function setMode(next){if(!['solo','pk'].includes(next))return;stop();duel.stop();mode=next;state.view='home';save();try{history.replaceState(null,'',next==='pk'?'#pk':'#solo')}catch{}render(true,'[data-focus]')}
window.addEventListener('hashchange',()=>{if(location.hash==='#pk'||location.hash==='#solo')setMode(location.hash.slice(1))});
root.addEventListener('input',e=>{if(e.target.id==='q-topic'){state.draft=e.target.value.slice(0,80);error='';const note=main.querySelector('#q-topic-error');if(note)note.textContent='';save()}});
root.addEventListener('submit',e=>{if(e.target.id==='q-generator'){e.preventDefault();generate(main.querySelector('#q-topic').value)}});
root.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||!root.contains(b)||b.disabled)return;if(b.dataset.quizMode){setMode(b.dataset.quizMode);return;}if(mode==='pk')return;const action=b.dataset.action;
 if(action==='cancel'||action==='home'){stop();state.view='home';save();render(true,'[data-focus]');return;}
 if(busy)return;
 if(b.dataset.topic){state.draft=b.dataset.prompt;error='';save();render(false,'#q-topic');return;}
 if(b.dataset.session){const r=state.sessions.find(r=>r.id===b.dataset.session);if(!r)return;state.active=r.id;state.view=r.complete?'result':'play';save();render(true,'[data-focus]');return;}
 if(b.dataset.answer!==undefined&&state.view==='play'){
  const r=run(),q=current(),a=Number(b.dataset.answer);if(r.answers.length!==r.index||!Number.isInteger(a)||a<0||a>=q.options.length)return;
  r.answers.push(a);save();render(false,'#q-feedback-heading');return;
 }
 if(action==='begin'&&state.view==='brief'){state.view='play';save();render(true,'[data-focus]');return;}
 if(action==='regenerate'&&run()){generate(run().topic,[],run().storyId);return;}
 if(action==='next'){advance(false);return;}if(action==='twist'){advance(true);return;}
 if(action==='personalize'&&state.view==='result'){const r=run(),missed=r.steps.filter((key,i)=>r.answers[i]!==catalog.get(key).correct);generate(r.topic,missed,r.storyId)}
});
window.addEventListener('pagehide',()=>{duel.stop();const pending=busy;stop();if(pending)save()});
window.addEventListener('pageshow',e=>{if(e.persisted)render()});
if(location.hash==='#solo')state.view='home';
render();
})();
