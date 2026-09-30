// This prototype draws from authored scenarios; no model or network request is made.
const FINEPRINT_HERO_IMAGE=__FINEPRINT_HERO_IMAGE__;
const TEMPLATE_MAP=new Map([...CASES,...EXTRA_CASES].map(c=>[c.id,c]));
let generating=false,generationStep=0,generationTimers=[],generationToken=0;
function makeGenerated(entry){
 const base=TEMPLATE_MAP.get(entry.templateId);
 const c=JSON.parse(JSON.stringify(base));
 c.artworkKey=base.artworkKey||base.id;
 c.id=entry.id;c.generated=true;c.sequence=Number(entry.id.slice(10));
 c.clauses.forEach(q=>q.id=entry.id+'-'+q.id);
 c.questions.forEach(q=>q.id=entry.id+'-'+q.id);
 // Mix the order while keeping each clause and its explanation together.
 let seed=entry.seed>>>0;
 for(let i=c.clauses.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[c.clauses[i],c.clauses[j]]=[c.clauses[j],c.clauses[i]];}
 return c;
}
function generatorHTML(){
 if(!generating)return '<div class="fp-generator" id="fp-generator" aria-busy="false"><button type="button" class="fp-generate-button" data-action="generate"><span><strong>再來一個新挑戰</strong><small>從示範模板抽選，再練一次</small></span><span class="fp-generate-plus" aria-hidden="true">＋</span></button></div>';
 const lines=['正在抽選金融情境…','正在整理宣傳與細字…','新挑戰快準備好了…'];
 return '<div class="fp-generator fp-generating" id="fp-generator" aria-busy="true"><div class="fp-generation-top"><span class="fp-generation-spinner" aria-hidden="true"></span><div role="status" aria-live="polite"><strong>'+lines[generationStep]+'</strong><small>預設示範模板 · 正在準備下一關</small></div><button type="button" class="fp-generating-button" data-action="generate" disabled>生成中</button></div><div class="fp-generation-progress" aria-hidden="true"><i style="width:'+([24,61,90][generationStep])+'%"></i></div><div class="fp-generation-skeleton" aria-hidden="true"><i></i><i></i></div></div>';
}
function updateGeneration(){const panel=main.querySelector('#fp-generator');if(panel)panel.outerHTML=generatorHTML();}
function stopGeneration(){generationToken++;generationTimers.forEach(clearTimeout);generationTimers=[];const wasBusy=generating;generating=false;if(wasBusy&&state.view==='home')render();}
function generateChallenge(){
 if(generating||state.view!=='home')return;
 generating=true;generationStep=0;const token=++generationToken;render();
 main.querySelector('#fp-generator').scrollIntoView({block:'nearest',behavior:'auto'});
 generationTimers=[setTimeout(()=>{if(token!==generationToken)return;generationStep=1;updateGeneration();},750),setTimeout(()=>{if(token!==generationToken)return;generationStep=2;updateGeneration();},1500),setTimeout(()=>{
  if(token!==generationToken)return;
  const used=new Set(state.generated.map(g=>g.templateId));
  let choices=EXTRA_CASES.filter(c=>!used.has(c.id));
  if(!choices.length)choices=[...TEMPLATE_MAP.values()].filter(c=>!used.has(c.id));
  if(!choices.length){const last=state.generated.at(-1)?.templateId;choices=[...TEMPLATE_MAP.values()].filter(c=>c.id!==last);}
  const template=choices[Math.floor(Math.random()*choices.length)];
  const number=state.generated.reduce((max,g)=>Math.max(max,Number(g.id.slice(10))),0)+1;
  const entry={id:'generated-'+number,templateId:template.id,seed:Math.floor(Math.random()*4294967296)};
  state.generated.push(entry);CASES.push(makeGenerated(entry));generating=false;generationTimers=[];save();render();
  const card=main.querySelector('[data-case="'+entry.id+'"]');card.scrollIntoView({block:'nearest',behavior:'auto'});card.focus({preventScroll:true});
 },2300)];
}
function home(){
 const active=current(),disabled=generating?' disabled':'';
 const ordered=[...CASES.filter(c=>c.generated).reverse(),...CASES.filter(c=>!c.generated)];
 return '<section class="p-photo-hero fp-photo-hero"><img class="p-photo-bg" src="'+FINEPRINT_HERO_IMAGE+'" alt="" width="640" height="480" decoding="async" fetchpriority="high"><div class="p-photo-copy"><span class="p-photo-kicker">一句宣傳，未講晒的條件</span><h1 data-focus>金融細字挑戰</h1><p>一張金融宣傳，五條細字。試試找出值得再問清楚的地方。</p></div></section>'+generatorHTML()+(active?'<button type="button" class="fp-resume" data-action="resume"'+disabled+'><span>繼續查看 · '+esc(active.label)+'</span>'+icon('arrow')+'</button>':'')+'<div class="fp-section-title"><h2>選一關，練練眼力</h2><span class="fp-muted">'+state.completed.length+' / '+CASES.length+' 已通關</span></div><div class="fp-scenes">'+ordered.map(c=>'<button type="button" class="fp-scene'+(c.generated?' fp-generated-scene':'')+'" data-case="'+c.id+'"'+disabled+'><img class="fp-scene-photo" src="'+AD_IMAGES[c.artworkKey].src+'" alt="" width="640" height="480" loading="lazy"><span class="fp-scene-copy">'+(c.generated?'<span class="fp-new-label">新挑戰 · '+String(c.sequence).padStart(2,'0')+'</span>':'')+'<strong>'+esc(c.label)+'</strong><small>'+esc(c.teaser)+'</small></span>'+(state.completed.includes(c.id)?'<span class="fp-cleared">已通關</span>':icon('arrow').replace('<svg ','<svg class="fp-scene-arrow" '))+'</button>').join('')+'</div><p class="fp-home-note">虛構金融情境 · 每局約 1 分鐘<br>新挑戰取自預設示範模板，並變換細字順序。</p>'+sourcesHTML();
}
window.addEventListener('pagehide',stopGeneration);
