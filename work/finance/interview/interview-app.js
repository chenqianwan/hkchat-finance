(() => {
  'use strict';
  const C=window.HKInterviewContent, main=document.getElementById('role-main'), root=document.getElementById('hkroles');
  const E=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy=value=>JSON.parse(JSON.stringify(value));
  const blank=()=>({id:'custom',name:'我的履歷',label:'我的背景',school:'',focus:'',experience:'',project:'',skills:[],summary:'',custom:true});
  const s={view:'setup',source:'demo',profile:copy(C.profiles[0]),profileId:C.profiles[0].id,roleId:C.roles[0].id,index:0,rounds:[],answers:[],draft:'',followDraft:'',followEditing:false,busy:false,fileName:'',rawText:'',paste:'',warnings:[],customReady:false,confirmed:false,error:'',practiceIndex:0,practiceDraft:'',practiceResult:null,usedSample:false,followUsedSample:false};
  let fileToken=0, pendingConfirm=null;
  const originLabel=a=>a.sample?'示範回答':a.sampleStarted?'曾用示範起稿':'';
  const followLabel=a=>a.followSample?'示範補充':a.followSampleStarted?'曾用示範起稿':'';
  try{localStorage.removeItem('hkchat-finance-role-interview');}catch{}
  const role=()=>C.roles.find(r=>r.id===s.roleId)||C.roles[0];
  const round=()=>s.rounds[s.index];
  const list=value=>Array.isArray(value)?value:String(value||'').split(/[,，、\n]/).map(x=>x.trim()).filter(Boolean);
  const button=(text,act,secondary=false,extra='')=>'<button type="button" class="'+(secondary?'iv-secondary':'iv-primary')+'" data-act="'+act+'" '+extra+'>'+text+'</button>';
  const field=(key,label,value,multiline=true,placeholder='',max=700)=>'<label class="iv-field"><span>'+E(label)+'</span>'+(multiline?'<textarea data-profile="'+key+'" maxlength="'+max+'" placeholder="'+E(placeholder)+'">'+E(value)+'</textarea>':'<input data-profile="'+key+'" maxlength="'+max+'" value="'+E(value)+'" placeholder="'+E(placeholder)+'">')+'</label>';
  const statusName={observed:'找到文字線索',develop:'可再補充',unknown:'未能判讀'};
  const disclosure=()=>'<p class="iv-disclosure">情境演示 · 回應按預設線索配對，未接即時 AI 模型。文字提示只供練習，唔代表完整理解、能力評核或錄取預測。背景同回答只留喺此頁記憶體；重新整理會清除。</p>';
  const flow=step=>'<ol class="iv-flow" aria-label="面試流程">'+['準備背景','模擬面試','復盤提升'].map((label,i)=>'<li'+(i===step?' aria-current="step"':'')+'><span>0'+(i+1)+'</span>'+label+'</li>').join('')+'</ol>';
  function say(text){document.getElementById('iv-announcer').textContent=text;}
  function render(html,focus=true){
    main.innerHTML=html;
    root.dataset.view=s.view;
    if(focus){const h=main.querySelector('[data-heading]');h?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  }
  function profileFields(){
    const p=s.profile;
    return field('school','學校／教育背景',p.school,false,'例如：香港科技大學',160)+
      field('focus','學習／專業方向',p.focus,false,'例如：AI、金融或數據分析',180)+
      field('project','一段項目經歷',p.project,true,'項目做甚麼？你自己負責哪一部分？',700)+
      field('experience','工作／實習／活動經歷',p.experience,true,'只填你確實做過的事；沒有亦可留空。',700)+
      field('skills','想在面試提到的技能',list(p.skills).join('、'),false,'例如：Python、SQL、資料核對',220)+
      field('summary','補充背景／今次想練甚麼',p.summary,true,'可以寫求職動機或想加強的表達。',900);
  }
  function profileCard(){
    const p=s.profile;
    return '<article class="iv-profile"><div class="iv-profile-title"><div class="iv-profile-mark" aria-hidden="true">'+(s.source==='demo'?'DEMO':'CV')+'</div><div><strong>'+E(p.name||p.label)+'</strong><p>'+E(p.school)+' · '+E(p.focus)+'</p></div></div><dl><div><dt>項目</dt><dd>'+E(p.project||'尚未提供')+'</dd></div><div><dt>經歷</dt><dd>'+E(p.experience||'尚未提供')+'</dd></div></dl><div class="iv-tags">'+list(p.skills).slice(0,6).map(x=>'<span>'+E(x)+'</span>').join('')+'</div></article>';
  }
  function uploadPanel(){
    return '<div class="iv-upload" id="iv-upload"><h3>'+(s.busy?'正在讀取履歷文字…':'帶上你的履歷')+'</h3><p>PDF、DOCX、TXT · 最多 5 MB<br>檔案在瀏覽器處理，不會上傳伺服器。</p>'+(s.busy?'<div class="iv-loader" aria-hidden="true"></div>':'<button class="iv-secondary" type="button" data-act="file">選擇履歷檔案</button>')+'<input type="file" id="iv-file" accept=".pdf,.docx,.txt" hidden></div>'+
      (s.fileName?'<div class="iv-file-pill"><span>'+E(s.fileName)+'<br><small class="iv-muted">已讀取 '+s.rawText.length+' 字，請核對下面背景</small></span><button type="button" data-act="clear-resume" aria-label="移除履歷">×</button></div>':'')+
      s.warnings.map(w=>'<p class="iv-warning">'+E(w)+'</p>').join('')+
      '<details class="iv-details"><summary>也可以貼文字，或手動填背景</summary><div><label class="iv-field"><span>貼上履歷中的相關經歷</span><textarea id="iv-paste" maxlength="16000" placeholder="只需教育、技能、項目和工作經歷。毋須姓名、電話或證件資料。">'+E(s.paste)+'</textarea></label><div class="iv-actions">'+button('讀取這段文字','parse-text',true)+button('直接填背景','manual',true)+'</div></div></details>'+
      (s.customReady?'<section class="iv-section"><div class="iv-section-head"><h2>確認本次面試背景</h2><span>可修改</span></div><p class="iv-note">只會用你確認的內容。留空的經歷不會自動補寫。</p>'+profileFields()+
        (s.rawText?'<details class="iv-details"><summary>對照讀取到的原文</summary><div><div class="iv-raw">'+E(s.rawText)+'</div></div></details>':'')+
        '<label class="iv-note iv-consent"><input id="iv-confirm-profile" type="checkbox" '+(s.confirmed?'checked':'')+'> 我已核對以上內容，用這份背景開始練習。</label></section>':'');
  }
  function setup(focus=true){
    s.view='setup';
    const html='<a class="iv-back" href="index.html">‹ 返回首頁</a>'+
      '<section class="iv-hero"><img src="'+INTERVIEW_PHOTO+'" alt="AI 生成的香港辦公室模擬面試情境"><div><div class="iv-kicker">FINANCE INTERVIEW LAB</div><h1 tabindex="-1" data-heading>中環見工記</h1><p>由你的背景出發，練到下一次回答。<br>AI × 金融職場模擬面試</p></div></section>'+flow(0)+
      '<section><div class="iv-section-head"><h2>先帶入你的背景</h2><span>01 / 準備</span></div><div class="iv-source-tabs" role="group" aria-label="背景來源"><button type="button" data-source="demo" aria-pressed="'+(s.source==='demo')+'">用示範背景</button><button type="button" data-source="custom" aria-pressed="'+(s.source==='custom')+'">用我的履歷</button></div>'+
      (s.source==='demo'?'<div class="iv-profile-choices" role="group" aria-label="選擇示範背景">'+C.profiles.map(p=>'<button type="button" class="iv-chip" data-profile-id="'+E(p.id)+'" aria-pressed="'+(s.profileId===p.id)+'">'+E(p.name)+'</button>').join('')+'</div>'+profileCard()+'<p class="iv-note">虛構畢業生履歷，用作主流程示範；並非院校推薦或真實校友紀錄。</p><details class="iv-details"><summary>查看／調整這份背景</summary><div>'+profileFields()+'</div></details>':uploadPanel())+'</section>'+
      '<section class="iv-section"><div class="iv-section-head"><h2>想練哪個崗位？</h2><span>虛構招聘情境</span></div><div class="iv-job-grid">'+C.roles.map(r=>'<button class="iv-job" type="button" data-job="'+E(r.id)+'" aria-pressed="'+(s.roleId===r.id)+'"><span class="iv-job-copy"><strong>'+E(r.title)+'</strong><small>'+E(r.brief)+'</small></span><span class="iv-radio" aria-hidden="true"></span></button>').join('')+'</div></section>'+
      '<section class="iv-section"><div class="iv-section-head"><h2>這次會練甚麼</h2><span>5 題 · 約 8–10 分鐘</span></div><ol class="iv-agenda"><li>自我介紹</li><li>項目深挖</li><li>模型驗證</li><li>負責任 AI</li><li>業務溝通</li></ol><p class="iv-note">每題最多一次追問，可提前收尾。先看答題方向，再用自己的話回答。</p></section>'+
      '<p class="iv-error" id="iv-error" role="alert">'+E(s.error)+'</p><div class="iv-actions">'+button('準備好，開始面試 <span aria-hidden="true">→</span>','start',false,s.busy?'disabled':'')+'</div>'+disclosure();
    render(html,focus);
  }
  function validateProfile(){
    if(s.busy)return '履歷仍在讀取中，請稍候。';
    if(!String(s.profile.focus||'').trim())return '請先填寫學習或專業方向。';
    if(String(s.profile.project||'').trim().length+String(s.profile.experience||'').trim().length+String(s.profile.summary||'').trim().length<20)return '請補充一段項目、工作或學習經歷，讓面試有背景可跟進。';
    if(s.source==='custom'&&!s.confirmed)return '請先核對背景，再勾選確認。';
    return '';
  }
  function error(text){
    s.error=text;const node=document.getElementById('iv-error');
    if(node){node.textContent=text;node.scrollIntoView({block:'center',behavior:'instant'});}
    say(text);
  }
  function sessionTop(){
    return '<button type="button" class="iv-back" data-act="back-setup">‹ 返回準備</button>'+flow(1)+
      '<div class="iv-session-meta"><span>'+E(role().title)+'</span><span>第 '+(s.index+1)+' / 5 題</span></div><div class="iv-progress" aria-label="第 '+(s.index+1)+' 題，共五題">'+s.rounds.map((_,i)=>'<span class="'+(i<s.index?'is-done':i===s.index?'is-current':'')+'"></span>').join('')+'</div>';
  }
  const interviewer=r=>'<div class="iv-interviewer"><span class="iv-avatar" aria-hidden="true">'+E((r.interviewer.role||'HR').split(' ')[0].slice(0,3))+'</span><div><strong>'+E(r.interviewer.name)+'</strong><small>'+E(r.interviewer.role)+' · 模擬面試官</small></div></div>';
  function editor(id,label,value){
    return '<label class="iv-field iv-answer-box"><span>'+E(label)+'</span><textarea id="'+id+'" maxlength="1400" placeholder="先講結論，再用一件你做過的事作例子。中文、粵語書面表達或英文均可。">'+E(value)+'</textarea></label><div class="iv-counter"><span>先講清楚，比堆術語更重要</span><span id="iv-count">'+value.length+' / 1400</span></div>';
  }
  function question(){
    s.view='question';const r=round();
    render(sessionTop()+interviewer(r)+'<div class="iv-question"><div class="iv-kicker">'+E(r.label)+'</div><h1 tabindex="-1" data-heading>'+E(r.question)+'</h1></div><aside class="iv-context"><strong>本題背景</strong>'+E(r.context)+'</aside>'+
      editor('iv-answer','輪到你回答',s.draft)+
      '<details class="iv-details"><summary>卡住？看看答題方向</summary><div><ul>'+r.promptHints.map(h=>'<li>'+E(h)+'</li>').join('')+'</ul></div></details>'+
      '<div class="iv-sample-bar"><button type="button" class="iv-text-button" data-act="sample">'+(s.source==='demo'&&r.sampleKind!=='structure'?'用示範回答試玩':'插入回答骨架')+'</button><span>'+(s.source==='demo'&&r.sampleKind!=='structure'?'可編輯後再提交':'請補上自己的真實經歷')+'</span></div>'+
      '<p class="iv-error" id="iv-error" role="alert"></p><div class="iv-actions">'+button('回答，接住追問 <span aria-hidden="true">→</span>','answer')+button('先收尾，睇目前復盤','finish-early',true)+'</div>'+disclosure());
  }
  function response(){
    s.view='response';const r=round(),a=s.answers[s.index],f=a.assessment.followUp;
    render(sessionTop()+interviewer(r)+'<div class="iv-kicker">'+E(r.label)+'</div><h1 tabindex="-1" data-heading style="font-size:24px;margin-top:6px">再講深一步</h1><div class="iv-bubble"><span>你剛才的回答'+(originLabel(a)?' · '+originLabel(a):'')+'</span><p>'+E(a.text)+'</p></div>'+
      '<section class="iv-follow"><div class="iv-kicker">面試官追問 · 可選</div><h2>'+E(f.question)+'</h2><p>'+E(f.why)+'</p></section>'+
      (a.followText?'<div class="iv-bubble"><span>你對追問的補充'+(followLabel(a)?' · '+followLabel(a):'')+'</span><p>'+E(a.followText)+'</p></div><p class="iv-note">已保留補充，復盤會一併對照這兩段回答。</p>':s.followEditing?editor('iv-follow-answer','補充一個具體例子／步驟',s.followDraft)+'<div class="iv-sample-bar"><button type="button" class="iv-text-button" data-act="follow-sample">'+(s.source==='demo'&&f.sampleKind!=='structure'?'用示範補充起稿':'用補充骨架起稿')+'</button></div><div class="iv-actions">'+button('記下這段補充','save-follow',true)+'</div>':'<div class="iv-actions">'+button('我想回應追問','open-follow',true)+'</div>')+
      '<p class="iv-error" id="iv-error" role="alert"></p><div class="iv-actions">'+button(s.index===4?'完成面試，睇復盤':'下一題 <span aria-hidden="true">→</span>','next')+'</div><div class="iv-sample-bar"><button type="button" class="iv-text-button" data-act="edit-answer">修改本題回答</button><button type="button" class="iv-text-button" data-act="finish-early">先收尾</button></div>'+disclosure());
  }
  const resultFor=(r,a)=>a?C.assess(r,a.text+(a.followText?'\n'+a.followText:'')):null;
  function evidence(items){
    return '<ul class="iv-evidence-list">'+items.map(item=>'<li><div class="iv-evidence-head"><strong>'+E(item.label)+'</strong><span class="iv-status iv-status-'+E(item.status)+'">'+E(statusName[item.status]||'未能判讀')+'</span></div>'+(item.quote?'<blockquote class="iv-quote">「'+E(item.quote)+'」</blockquote>':'')+'<p>'+E(item.guidance)+'</p></li>').join('')+'</ul>';
  }
  function priorities(){
    const results=[];
    s.answers.forEach((a,i)=>{if(!a)return;const review=resultFor(s.rounds[i],a);const missing=review.items.find(x=>x.status!=='observed');if(missing)results.push({index:i,item:missing});});
    return results.slice(0,3);
  }
  function strengths(){
    const results=[];
    s.answers.forEach((a,i)=>{if(!a)return;const item=resultFor(s.rounds[i],a).items.find(x=>x.status==='observed'&&x.quote);if(item)results.push({index:i,item});});
    return results.slice(0,2);
  }
  function report(){
    s.view='report';const done=s.answers.filter(Boolean).length,follow=s.answers.filter(a=>a?.followText).length,needs=priorities(),found=strengths(),examples=s.answers.filter(a=>a?.sampleStarted||a?.followSampleStarted).length;
    render('<a class="iv-back" href="index.html">‹ 返回首頁</a>'+flow(2)+
      '<section class="iv-report-hero"><div class="iv-kicker">'+(done===5?'本次面試完成':'本次練習紀錄')+'</div><h1 tabindex="-1" data-heading>下次，講得更具體。</h1><p>'+E(role().title)+'<br>'+E(s.profile.school||'自訂背景')+' · '+E(s.profile.focus)+'</p><div class="iv-report-counts"><div><strong>'+done+' / 5</strong><span>已回答題目</span></div><div><strong>'+follow+'</strong><span>追問補充</span></div><div><strong>'+examples+'</strong><span>示範起稿題目</span></div></div></section>'+
      '<p class="iv-note">以下只對照本次文字中的表達線索；未被辨認不等於你不具備該能力。'+(examples?'本次曾使用示範起稿，結果只展示復盤方式。':'')+'</p>'+
      (found.length?'<section class="iv-section"><div class="iv-section-head"><h2>這些表達，值得保留</h2><span>引用你的原句</span></div>'+found.map(({index,item})=>'<article class="iv-guidance"><div class="iv-kicker">第 '+(index+1)+' 題 · '+E(item.label)+'</div><blockquote class="iv-quote">「'+E(item.quote)+'」</blockquote></article>').join('')+'</section>':'')+
      (done===0?'<article class="iv-guidance"><h2>先答一題，先有內容可復盤。</h2><p>今次未有提交回答，唔會產生能力判斷或改進結論。</p><div class="iv-actions">'+button('返回第一題','resume')+'</div></article>':
      '<section class="iv-section"><div class="iv-section-head"><h2>'+(needs.length?'先改善這幾點':'下一次，再驗證表達')+'</h2><span>由你的回答整理</span></div>'+
        (needs.length?needs.map(({index,item})=>'<article class="iv-guidance"><div class="iv-kicker">第 '+(index+1)+' 題 · '+E(s.rounds[index].label)+'</div><h3>'+E(item.label)+'</h3><p>'+E(item.guidance)+'</p><button class="iv-text-button" type="button" data-practice="'+index+'">重練這一題 →</button></article>').join(''):'<article class="iv-guidance"><h3>換一個例子，唔靠原稿再講一次</h3><p>這次文字包含預設觀察線索，仍需由面試官核實經歷與技術內容。試用另一個真實例子，講清楚你自己的取捨。</p></article>')+'</section>')+
      '<section class="iv-section"><div class="iv-section-head"><h2>逐題回看</h2><span>回答 · 線索 · 指導</span></div>'+
      s.rounds.map((r,i)=>{const a=s.answers[i];if(!a)return '<article class="iv-guidance"><div class="iv-kicker">0'+(i+1)+' · '+E(r.label)+'</div><p>本次未回答，未作分析。</p></article>';const review=resultFor(r,a);
        return '<details class="iv-review" data-review="'+i+'"><summary><span>0'+(i+1)+'</span><strong>'+E(r.label)+'</strong><span>'+(originLabel(a)|| (followLabel(a)?'含示範補充':'查看復盤'))+' ＋</span></summary><div class="iv-review-body"><h3>'+E(r.question)+'</h3><div class="iv-bubble"><span>你的原回答'+(originLabel(a)?' · '+originLabel(a):'')+'</span><p>'+E(a.text)+'</p></div>'+
          (a.followText?'<div class="iv-bubble"><span>追問：'+E(a.assessment.followUp.question)+'</span><p>'+E(a.followText)+'</p></div>':'')+
          (!review.recognised?'<p class="iv-warning">這段文字未能可靠配對預設線索。下面提供整理方向，唔當作能力評分。</p>':'')+
          evidence(review.items)+'<details class="iv-details"><summary>'+(s.source==='demo'&&r.sampleKind!=='structure'?'示範可以點講':'可參考的回答結構')+'</summary><div><p class="iv-note">'+(s.source==='demo'&&r.sampleKind!=='structure'?'以下只使用虛構示範背景，不是對你經歷的推斷。':'以下是提綱與假設做法，請自行補上真實經歷。')+'</p><div class="iv-example">'+E(r.strongExample||r.sampleAnswer)+'</div></div></details>'+
          (a.practice?'<details class="iv-details"><summary>查看今次重練紀錄</summary><div><div class="iv-example">'+E(a.practice.text)+'</div>'+evidence(a.practice.assessment.items)+'</div></details>':'')+
          '<div class="iv-actions">'+button('針對這一題再練一次','practice',true,'data-index="'+i+'"')+'</div></div></details>';
      }).join('')+'</section>'+
      (done?'<section class="iv-section"><div class="iv-section-head"><h2>下次面試前，練三件事</h2></div><ol class="iv-plan"><li><div><strong>把一個項目講成自己的經歷</strong><p>寫低背景、你負責的動作、觀察到甚麼，以及仍未做到的部分。</p></div></li><li><div><strong>預備一個失敗或限制的例子</strong><p>講清楚點樣驗證、何時停下來，以及何時交畀同事覆核。</p></div></li><li><div><strong>試一次唔睇稿的短講</strong><p>用本次最想改善的一題，先講結論，再補一個具體證據。</p></div></li></ol></section>':'')+
      '<div class="iv-actions">'+(done?button('下載面試復盤 .txt','download')+button('複製面試筆記','copy',true):'')+(done<5&&done>0?button('繼續未答的題目','resume',true):'')+button('同一背景，再練一次','restart',true)+button('換背景／職位','back-setup',true)+'</div>'+disclosure());
  }
  function practice(index){
    s.view='practice';s.practiceIndex=index;const r=s.rounds[index],a=s.answers[index];s.practiceDraft=a.practice?.text||a.text;s.practiceResult=null;practiceView();
  }
  function practiceView(){
    const i=s.practiceIndex,r=s.rounds[i],a=s.answers[i];
    const before=C.assess(r,a.text),changes=s.practiceResult?s.practiceResult.items.map(item=>({item,previous:before.items.find(x=>x.id===item.id)})):[];
    render('<button class="iv-back" type="button" data-act="report">‹ 返回完整復盤</button>'+flow(2)+'<div class="iv-kicker">針對第 '+(i+1)+' 題重練</div><div class="iv-question"><h1 tabindex="-1" data-heading>'+E(r.question)+'</h1></div><details class="iv-details"><summary>回看上次回答</summary><div><div class="iv-example">'+E(a.text)+'</div></div></details>'+
      editor('iv-practice-answer','今次試吓補清楚',s.practiceDraft)+'<p class="iv-error" id="iv-error" role="alert"></p><div class="iv-actions">'+button('對照前後，記低改進','save-practice')+'</div>'+
      (s.practiceResult?'<section class="iv-section"><div class="iv-section-head"><h2>保留兩版，再看差別</h2></div><p class="iv-note">原回答保留不變。以下對照原主答與新版，不含追問補充；只比較文字線索。</p><div class="iv-comparison">'+changes.map(({item,previous})=>'<div><strong>'+E(item.label)+'</strong><p>'+E(statusName[previous?.status]||'未能判讀')+' <span aria-hidden="true">→</span> '+E(statusName[item.status])+'</p></div>').join('')+'</div>'+evidence(s.practiceResult.items)+'<div class="iv-actions">'+button('帶住重練紀錄，返回復盤','report',true)+'</div></section>':'')+disclosure());
  }
  function sampleText(r,follow=false){
    if(s.source==='demo')return follow?(s.answers[s.index]?.assessment.followUp.sampleAnswer||r.sampleAnswer):r.sampleAnswer;
    return follow?'我會先核對【資料／限制】，再由【誰】確認【甚麼】。如果仍未能確認，我會【下一步】。':'我想用【自己的項目／經歷】作例子。當時要解決【問題】，我親自負責【動作】。我用【方法】檢查結果，發現【觀察／限制】。這段經驗與本職位的關聯是【關聯】。';
  }
  function confirmAction(action,title,text){
    pendingConfirm=action;const d=document.getElementById('iv-confirm');
    d.querySelector('h2').textContent=title;d.querySelector('p').textContent=text;d.showModal();d.querySelector('[data-confirm="cancel"]').focus();
  }
  function start(){
    const reason=validateProfile();if(reason){error(reason);return;}
    s.profile.custom=s.source==='custom';
    s.rounds=C.rounds(copy(s.profile),s.roleId);s.answers=[];s.index=0;s.draft='';s.followDraft='';s.usedSample=false;s.error='';question();
  }
  function submit(){
    const text=s.draft.trim();
    if(text.length<12){error('先寫一句完整回答，或者展開答題方向。');return;}
    if(/【[^】]*】/.test(text)){error('請先用自己的內容填好回答骨架，再提交。');return;}
    const r=round();s.answers[s.index]={text,assessment:C.assess(r,text),sample:s.source==='demo'&&text===r.sampleAnswer.trim(),sampleStarted:s.usedSample,followText:'',followSample:false,followSampleStarted:false,practice:null};
    s.followDraft='';s.followEditing=false;s.followUsedSample=false;response();
  }
  function finish(){s.error='';report();}
  async function parseFile(file){
    if(!file)return;const token=++fileToken;s.busy=true;s.error='';s.fileName='';s.rawText='';s.warnings=[];s.profile=blank();s.customReady=false;s.confirmed=false;setup(false);
    try{
      const result=await window.HKInterviewResume.read(file);
      if(token!==fileToken||s.source!=='custom')return;
      s.rawText=result.text;s.fileName=file.name;s.warnings=result.warnings||[];s.profile={...blank(),...window.HKInterviewResume.suggest(result.text),custom:true,id:'custom'};s.customReady=true;s.busy=false;setup(false);say('履歷文字已讀取，請確認背景。');document.querySelector('[data-profile="school"]')?.scrollIntoView({block:'center',behavior:'instant'});
    }catch(e){if(token!==fileToken)return;s.busy=false;s.error=e.message||'暫時未能讀取，請貼上履歷文字再試。';setup(false);say(s.error);}
  }
  function transcript(){
    let text='中環見工記｜面試練習復盤\n'+role().title+'\n背景：'+(s.profile.school||'自訂')+'｜'+s.profile.focus+'\n'+(s.source==='demo'?'虛構示範履歷':'使用者確認的背景')+'\n預設線索演示；不是能力評核或錄取預測。\n';
    s.rounds.forEach((r,i)=>{const a=s.answers[i];text+='\n\n第 '+(i+1)+' 題｜'+r.label+'\n'+r.question+'\n';if(!a){text+='本次未回答。';return;}text+='回答'+(originLabel(a)?'（'+originLabel(a)+'）':'')+'：\n'+a.text;if(a.followText)text+='\n追問：'+a.assessment.followUp.question+'\n補充'+(followLabel(a)?'（'+followLabel(a)+'）':'')+'：'+a.followText;for(const item of resultFor(r,a).items)text+='\n'+statusName[item.status]+'｜'+item.label+(item.quote?'\n原句：'+item.quote:'')+'\n練習方向：'+item.guidance;if(a.practice)text+='\n重練版本：\n'+a.practice.text;});
    return text;
  }
  main.addEventListener('input',e=>{
    if(e.target.dataset.profile){const key=e.target.dataset.profile;s.profile[key]=key==='skills'?list(e.target.value):e.target.value;s.confirmed=false;const c=document.getElementById('iv-confirm-profile');if(c)c.checked=false;}
    if(e.target.id==='iv-answer')s.draft=e.target.value;
    if(e.target.id==='iv-follow-answer')s.followDraft=e.target.value;
    if(e.target.id==='iv-practice-answer')s.practiceDraft=e.target.value;
    if(e.target.id==='iv-paste')s.paste=e.target.value;
    if(e.target.id==='iv-confirm-profile')s.confirmed=e.target.checked;
    if(['iv-answer','iv-follow-answer','iv-practice-answer'].includes(e.target.id)){const c=document.getElementById('iv-count');if(c)c.textContent=e.target.value.length+' / 1400';}
    const err=document.getElementById('iv-error');if(err)err.textContent='';s.error='';
  });
  main.addEventListener('change',e=>{if(e.target.id==='iv-file')parseFile(e.target.files[0]);if(e.target.id==='iv-confirm-profile')s.confirmed=e.target.checked;});
  main.addEventListener('dragover',e=>{const drop=e.target.closest('#iv-upload');if(drop){e.preventDefault();drop.classList.add('is-dragging');}});
  main.addEventListener('dragleave',e=>e.target.closest('#iv-upload')?.classList.remove('is-dragging'));
  main.addEventListener('drop',e=>{if(e.target.closest('#iv-upload')){e.preventDefault();parseFile(e.dataTransfer.files[0]);}});
  main.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.source){if(b.dataset.source===s.source)return;++fileToken;s.busy=false;s.source=b.dataset.source;s.error='';s.confirmed=false;s.profile=s.source==='demo'?copy(C.profiles.find(p=>p.id===s.profileId)||C.profiles[0]):blank();s.customReady=false;s.fileName='';s.rawText='';s.warnings=[];setup(false);return;}
    if(b.dataset.profileId){if(b.dataset.profileId===s.profileId)return;s.profileId=b.dataset.profileId;s.profile=copy(C.profiles.find(p=>p.id===s.profileId));setup(false);return;}
    if(b.dataset.job){s.roleId=b.dataset.job;setup(false);return;}
    if(b.dataset.practice!==undefined){practice(Number(b.dataset.practice));return;}
    const act=b.dataset.act;
    if(act==='file')document.getElementById('iv-file').click();
    if(act==='clear-resume'){++fileToken;s.busy=false;s.profile=blank();s.customReady=false;s.confirmed=false;s.fileName='';s.rawText='';s.paste='';s.warnings=[];s.error='';setup(false);}
    if(act==='manual'){++fileToken;s.busy=false;s.customReady=true;s.confirmed=false;setup(false);document.querySelector('[data-profile="school"]')?.focus();}
    if(act==='parse-text'){if(s.paste.trim().length<30){error('請貼上至少一段教育、技能或項目經歷。');return;}++fileToken;s.busy=false;s.rawText=s.paste.slice(0,16000);s.profile={...blank(),...window.HKInterviewResume.suggest(s.rawText),custom:true,id:'custom'};s.customReady=true;s.confirmed=false;s.fileName='貼上的履歷文字';s.warnings=[];setup(false);}
    if(act==='start')start();
    if(act==='sample'){s.draft=sampleText(round());s.usedSample=s.source==='demo'&&round().sampleKind!=='structure';const el=document.getElementById('iv-answer');el.value=s.draft;el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();}
    if(act==='answer'&&s.view==='question')submit();
    if(act==='open-follow'){s.followEditing=true;response();document.getElementById('iv-follow-answer')?.focus();}
    if(act==='follow-sample'){s.followDraft=sampleText(round(),true);s.followUsedSample=s.source==='demo'&&s.answers[s.index].assessment.followUp.sampleKind!=='structure';const el=document.getElementById('iv-follow-answer');el.value=s.followDraft;el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();}
    if(act==='save-follow'){if(s.followDraft.trim().length<12||/【[^】]*】/.test(s.followDraft)){error('請寫一段具體補充，並填好骨架中的內容。');return;}s.answers[s.index].followText=s.followDraft.trim();s.answers[s.index].followSampleStarted=s.followUsedSample;s.answers[s.index].followSample=s.source==='demo'&&s.followDraft.trim()===s.answers[s.index].assessment.followUp.sampleAnswer.trim();s.followEditing=false;response();}
    if(act==='next'){if(s.followEditing&&s.followDraft.trim()){confirmAction(()=>{s.followDraft='';s.followEditing=false;next();},'未保存追問補充','離開會捨棄這段未保存文字；你也可以返回先記下補充。');return;}next();}
    if(act==='edit-answer'){s.draft=s.answers[s.index].text;s.usedSample=s.answers[s.index].sampleStarted;question();}
    if(act==='finish-early'){const draft=s.view==='question'?s.draft:s.followEditing?s.followDraft:'';if(draft.trim())confirmAction(finish,'先結束今次練習？','已提交的回答會保留在復盤；目前未提交的草稿不會納入分析。');else finish();}
    if(act==='resume'){s.index=s.rounds.findIndex((_,i)=>!s.answers[i]);if(s.index<0){report();return;}s.draft='';s.usedSample=false;question();}
    if(act==='report')report();
    if(act==='practice')practice(Number(b.dataset.index));
    if(act==='save-practice'){if(s.practiceDraft.trim().length<12){error('請先寫一段完整的新版回答。');return;}if(/【[^】]*】/.test(s.practiceDraft)){error('請先填好骨架中的內容。');return;}s.practiceResult=C.assess(s.rounds[s.practiceIndex],s.practiceDraft.trim());s.answers[s.practiceIndex].practice={text:s.practiceDraft.trim(),assessment:s.practiceResult};practiceView();document.querySelector('.iv-section')?.scrollIntoView({block:'start',behavior:'instant'});say('重練版本已記錄，原回答保留。');}
    if(act==='restart')confirmAction(start,'用同一背景重新練？','今次回答與重練紀錄將清除。可以先下載復盤，再開新一局。');
    if(act==='back-setup')confirmAction(()=>{s.answers=[];s.rounds=[];s.draft='';s.followDraft='';s.error='';setup();},'返回背景設定？','將清除本局回答；已確認的背景仍然保留在此頁。');
    if(act==='download'){const url=URL.createObjectURL(new Blob([transcript()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='HKChat-面試練習復盤.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('復盤文字檔已準備。');}
    if(act==='copy'){try{await navigator.clipboard.writeText(transcript());b.textContent='已複製';say('面試筆記已複製。');}catch{b.textContent='未能複製，可改用下載文字檔';}}
  });
  function next(){s.error='';if(s.index===4){report();return;}s.index++;s.draft='';s.followDraft='';s.followEditing=false;s.usedSample=false;question();}
  document.getElementById('iv-confirm').addEventListener('click',e=>{const b=e.target.closest('[data-confirm]');if(!b)return;const action=pendingConfirm;pendingConfirm=null;document.getElementById('iv-confirm').close();if(b.dataset.confirm==='yes')action?.();});
  document.getElementById('iv-confirm').addEventListener('cancel',()=>{pendingConfirm=null;});
  setup(false);
})();
