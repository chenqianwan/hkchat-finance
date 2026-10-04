(() => {
  'use strict';
  const app = document.getElementById('hkroles');
  const main = document.getElementById('role-main');
  const config = JSON.parse(document.getElementById('role-config').textContent);
  const isProduct = config.key === 'product';
  const generator = window.HKScenario;
  let customScenario = null;
  let customPrompt = '';
  let preparing = false;
  const storageKey = `hkchat-finance-role-${config.key}`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const findScenario = id => customScenario?.id === id ? customScenario : config.scenarios.find(s => s.id === id);
  const defaults = s => Object.fromEntries(s.options.map(o => [o.id, o.initial]));
  const fresh = () => ({version:1, view:'home', selected:config.scenarios[0].id, run:null});
  const voteLabels = {yes:'支持試行', hold:'有保留', no:'未能支持'};
  let state = fresh();
  const announce = message => {document.getElementById('r-announcement').textContent = message;};
  const save = () => {try {localStorage.setItem(storageKey, JSON.stringify(state.run?.id === 'custom-manager' ? fresh() : state));} catch (_) {}};
  const validDraft = (draft, s) => draft && s.options.every(o => typeof draft[o.id] === 'boolean');
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored?.version === 1 && ['home','play','result'].includes(stored.view) && findScenario(stored.selected)) {
      if (!stored.run && stored.view === 'home') state = stored;
      else if (stored.run) {
        const s = findScenario(stored.run.id);
        const r = stored.run;
        if (s && validDraft(r.draft,s) && typeof r.note === 'string' && r.note.length <= 240 &&
          ['draft','consult'].includes(r.stage) && Array.isArray(r.rounds) && r.rounds.length <= 3 &&
          r.rounds.every(x => validDraft(x.options,s) && typeof x.note === 'string' && x.note.length <= 240) &&
          (stored.view !== 'result' || r.rounds.length > 0) && (r.stage !== 'consult' || r.rounds.length > 0)) state = stored;
      }
    }
  } catch (_) {}
  const scenario = () => findScenario(state.run?.id || state.selected);
  const last = () => state.run?.rounds.at(-1);
  const sameDraft = () => last() && JSON.stringify(last().options) === JSON.stringify(state.run.draft) && last().note === state.run.note.trim();
  function evaluate(s, options) {
    return s.people.map(p => {
      const rule = p.stance.find(rule => Object.entries(rule.when).every(([k,v]) => options[k] === v));
      return {name:p.name, role:p.role, initial:p.initial, vote:rule?.vote || p.defaultVote,
        reasons:p.reasons.map(reason => options[reason.option] ? reason.yes : reason.no), remaining:p.remaining};
    });
  }
  function button(action, text, cls='r-primary') {return `<button type="button" class="${cls}" data-action="${action}">${text}</button>`;}
  function heading(title, sub, eyebrow) {return `<div class="r-heading">${eyebrow ? `<p class="r-eyebrow">${esc(eyebrow)}</p>` : ''}<h1 tabindex="-1">${esc(title)}</h1>${sub ? `<p class="r-sub">${esc(sub)}</p>` : ''}</div>`;}
  function home() {
    const s = findScenario(state.selected);
    return `<section class="r-photo-hero p-photo-hero"><img src="${config.photo}" alt="${esc(config.photoAlt)}"><div class="r-photo-copy"><p>代入角色 · 最多三輪</p><h1 tabindex="-1">${esc(config.title)}</h1><span>${esc(config.strap)}</span></div></section>
      <p class="r-intro">${esc(config.intro)}</p>
      <ol class="r-workflow">${config.workflow.map((x,i) => `<li><span>${i+1}</span>${esc(x)}</li>`).join('')}</ol>
      ${!isProduct ? generator.form({placeholder:'例如：午飯時間分行排長龍，長者又唔識網上預約',examples:['午飯時間排長龍，點照顧即場客？','客人唔識用自助機，又想保留私隱'],value:customPrompt}) : ''}
      <section aria-labelledby="r-choose"><div class="r-section-line"><h2 id="r-choose">或者，由靈感開始</h2><span>兩個示範題材</span></div>
      <div class="r-scenarios">${config.scenarios.map((x,i) => `<button type="button" class="r-scenario" data-scenario="${esc(x.id)}" aria-pressed="${x.id === state.selected}"><span class="r-scenario-number">0${i+1}</span><span><small>${esc(x.tag)}</small><strong>${esc(x.title)}</strong><span>${esc(x.teaser)}</span></span><span class="r-select-mark" aria-hidden="true">${x.id === state.selected ? '✓' : '＋'}</span></button>`).join('')}</div></section>
      ${button('start',esc(config.start)+' <span aria-hidden="true">→</span>')}
      ${state.run ? button('resume',state.run.finished ? '回看上次決策' : '繼續上次方案','r-secondary') : ''}
      <p class="r-disclosure">虛構角色與 AI 情境照。角色回應按選項預設配對，並非即時 AI 對話。</p>`;
  }
  function topbar() {
    const r = state.run;
    return `<div class="r-topline">${button('home','<span aria-hidden="true">←</span> 換個情境','r-text-button')}<span>${r.rounds.length ? `已完成 ${r.rounds.length} / 3 輪` : '最多三輪 · 隨時定案'}</span></div>`;
  }
  function steps() {
    const r = state.run;
    return `<ol class="r-round-track" aria-label="方案輪次">${[1,2,3].map(n => `<li class="${n <= r.rounds.length ? 'r-done' : n === r.rounds.length+1 ? 'r-now' : ''}"><span>${n <= r.rounds.length ? '✓' : '0'+n}</span><small>${n <= r.rounds.length ? '已聽意見' : n === r.rounds.length+1 ? '下一輪' : '可選修訂'}</small></li>`).join('')}</ol>`;
  }
  function brief() {
    const s = scenario();
    return `<section class="r-brief"><span class="r-eyebrow">${isProduct ? '設計任務' : '我嘅分行現況'}</span><p>${esc(s.context)}</p><small>${esc(s.constraint)}</small></section>`;
  }
  function options() {
    const s = scenario(), r = state.run, locked = r.rounds.length >= 3;
    return `<fieldset class="r-options" ${locked ? 'disabled' : ''}><legend>${esc(s.editorTitle)}</legend>${s.options.map(o => `<label class="r-option"><span><strong>${esc(o.label)}</strong><small>${esc(o.detail)}</small></span><span class="r-switch"><input type="checkbox" data-option="${esc(o.id)}" aria-label="${esc(o.label)}" ${r.draft[o.id] ? 'checked' : ''}><span class="r-switch-track" aria-hidden="true"></span></span></label>`).join('')}</fieldset>
      <label class="r-note-label" for="r-note">我想補充 <span>選填</span></label><textarea id="r-note" maxlength="240" rows="2" placeholder="例如：試行完，我會再約前線同事傾……" ${locked ? 'disabled' : ''}>${esc(r.note)}</textarea>
      <p class="r-caption">補充會記入你嘅決策；角色回應只按上面四項設定配對。</p>`;
  }
  function clauses(snapshot, className='') {
    return `<ul class="r-clauses ${className}">${scenario().options.map(o => `<li><span aria-hidden="true">${snapshot.options[o.id] ? '✓' : '—'}</span>${esc(snapshot.options[o.id] ? o.on : o.off)}</li>`).join('')}</ul>${snapshot.note ? `<div class="r-own-note"><small>我嘅補充</small><p>${esc(snapshot.note)}</p></div>` : ''}`;
  }
  function voices(snapshot, previous, title='三位點睇？') {
    const responses = evaluate(scenario(),snapshot.options);
    const prev = previous ? evaluate(scenario(),previous.options) : null;
    return `<section class="r-reactions" aria-labelledby="r-voices-title"><div class="r-section-line"><h2 id="r-voices-title">${esc(title)}</h2><span>預設角色反應</span></div><div class="r-voices">${responses.map((p,i) => `<article class="r-voice" data-vote="${p.vote}"><div class="r-speaker"><span class="r-avatar r-avatar-${i}" aria-hidden="true">${esc(p.initial)}</span><div><h3>${esc(p.name)}</h3><small>${esc(p.role)}</small></div><span class="r-vote r-vote-${p.vote}">${voteLabels[p.vote]}</span></div><div class="r-voice-reasons">${p.reasons.map(x => `<p>${esc(x)}</p>`).join('')}</div>${prev && prev[i].vote !== p.vote ? `<p class="r-change">由「${voteLabels[prev[i].vote]}」轉為「${voteLabels[p.vote]}」</p>` : ''}</article>`).join('')}</div></section>`;
  }
  function history() {
    const r = state.run;
    if (!r.rounds.length) return '';
    return `<details class="r-history"><summary>回看 ${r.rounds.length} 輪方案<span aria-hidden="true">＋</span></summary>${r.rounds.map((snap,i) => `<section class="r-history-item"><h3>第 ${i+1} 輪${snap.direct ? ' · 直接定案' : ''}</h3>${clauses(snap)}<p class="r-history-votes">${evaluate(scenario(),snap.options).map(p => `${esc(p.name)}：${voteLabels[p.vote]}`).join(' · ')}</p></section>`).join('')}</details>`;
  }
  function phone(options) {
    const type = scenario().preview;
    if (type === 'notifications') {
      return `<div class="r-phone" aria-label="通知原型預覽"><div class="r-phone-top"><span>9:41</span><span class="r-phone-camera" aria-hidden="true"></span><span>榕灣</span></div><div class="r-phone-screen"><p class="r-phone-date">星期二 · 通知中心</p><div class="r-notification"><span class="r-phone-appmark" aria-hidden="true">榕</span><div><small>榕灣 App · 剛剛</small><strong>${options.hidden ? '你有新提示' : '你關注嘅分行服務時間有更新'}</strong><p>${options.hidden ? '打開 App 查看內容' : '請到服務資訊頁查看詳情'}</p></div></div><div class="r-phone-settings"><h3>通知設定</h3><div><span>${options.separate ? '服務提示' : '服務提示及推廣'}</span><b>已開啟</b></div>${options.separate ? '<div><span>活動推廣</span><b class="r-phone-off">預設關閉</b></div>' : ''}<div><span>推廣發送</span><b>${options.digest ? '每日摘要' : '逐則發送'}</b></div><div><span>推廣時段</span><b>${options.quiet ? '只限日間' : '任何時段'}</b></div></div>${options.separate ? '<p class="r-phone-hint">開啟推廣後，才套用發送安排。</p>' : '<p class="r-phone-hint">同一個開關會控制兩類通知。</p>'}</div><div class="r-phone-bottom" aria-hidden="true"></div></div>`;
    }
    return `<div class="r-phone" aria-label="位置權限原型預覽"><div class="r-phone-top"><span>9:41</span><span class="r-phone-camera" aria-hidden="true"></span><span>榕灣</span></div><div class="r-phone-screen"><p class="r-phone-date">${options.ondemand ? '附近分行' : '榕灣 App 首頁'}</p><div class="r-map" aria-hidden="true"><span class="r-map-road r-road-a"></span><span class="r-map-road r-road-b"></span><span class="r-map-pin">榕</span><small>虛構地圖</small></div><div class="r-permission-sheet"><h3>${options.ondemand ? '用位置幫你搵分行？' : '開啟位置功能？'}</h3><p>${options.scope ? '今次位置只用嚟找附近分行。' : '位置會用嚟找分行及推薦附近活動。'}</p><small>${options.clear ? '離開分行頁後會清走本次位置。' : '保留最近一次位置，下次可以沿用。'}</small><span class="r-preview-button">使用本次位置</span>${options.manual ? '<span class="r-preview-link">唔分享位置，自己揀地區</span>' : '<span class="r-preview-link">稍後再說</span>'}</div></div><div class="r-phone-bottom" aria-hidden="true"></div></div>`;
  }
  function preview() {
    return `<section class="r-preview-panel"><div class="r-section-line"><h2>手機預覽</h2><span>跟住設定即時改</span></div><div id="r-phone-preview">${phone(state.run.draft)}</div><p class="r-preview-caption">畫面只供預覽，唔會發出通知或索取權限。</p></section>`;
  }
  function managerPlay() {
    const s=scenario(), r=state.run, snap=last();
    const consult = r.stage === 'consult';
    return `${topbar()}${heading(s.title, consult ? `第 ${r.rounds.length} 輪意見已收到。你可以保留分歧定案，或者修訂再問。` : '幾個選項可以一齊用。先砌出我認為行得通嘅安排。', s.tag)}${steps()}
      ${consult ? `<section class="r-proposal"><div class="r-section-line"><h2>我提出嘅方案</h2><span>第 ${r.rounds.length} 輪</span></div>${clauses(snap)}</section>${voices(snap,r.rounds.at(-2))}<div class="r-decision-prompt"><strong>最後由我決定。</strong><p>三位嘅意見會幫你看清取捨；唔需要等到全體支持先可以定案。</p></div>${r.rounds.length < 3 ? button('revise','修訂方案，再聽一次') : '<p class="r-limit">三輪已完成。保留未解決嘅分歧，整理最後決策。</p>'}${button('finish','採用呢份方案',r.rounds.length < 3 ? 'r-secondary' : 'r-primary')}${history()}` : `${brief()}${options()}${button('consult','聽三位點講 <span aria-hidden="true">→</span>')}${button('finish','用目前設定直接定案','r-secondary')}${history()}`}`;
  }
  function productStatus() {
    const r=state.run;
    if(r.rounds.length >= 3) return '三輪已完成，呢個版本可以定案。';
    if(!r.rounds.length) return '調整設定，再測試第一版。';
    return sameDraft() ? `第 ${r.rounds.length} 版已測試。改幾個設定，或者就此定案。` : '你有未測試嘅改動；下面反應仍屬上一版。';
  }
  function productPlay() {
    const s=scenario(), r=state.run;
    return `${topbar()}${heading(s.title,'設定一改，原型即時更新。測試後再比較三位嘅反應。',s.tag)}${steps()}${brief()}${preview()}<div class="r-editor">${options()}</div><p id="r-prototype-status" class="r-prototype-status">${productStatus()}</p>${r.rounds.length < 3 ? button('consult',`測試第 ${r.rounds.length+1} 版 <span aria-hidden="true">→</span>`) : ''}${button('finish','採用目前版本',r.rounds.length < 3 ? 'r-secondary' : 'r-primary')}${last() ? `${voices(last(),r.rounds.at(-2),`第 ${r.rounds.length} 版 · 測試反應`)}${history()}` : '<p class="r-disclosure">每次測試會用呢版設定配對三位角色嘅回應，最多三輪。</p>'}`;
  }
  function result() {
    const s=scenario(), r=state.run, snap=last(), reactions=evaluate(s,snap.options);
    const concerns=reactions.filter(p => p.vote !== 'yes');
    const changed = s.options.filter(o => o.initial !== snap.options[o.id]);
    return `${topbar()}<div class="r-result-title"><p class="r-eyebrow">我嘅${isProduct ? '產品決策' : '服務決策'}</p><h1 tabindex="-1">${isProduct ? '呢個版本，我來定。' : '呢套安排，我來定。'}</h1><p>${esc(s.title)} · 經過 ${r.rounds.length} 輪${snap.direct ? '（包括直接定案）' : ''}</p></div>
      <div class="r-result-stats"><div><strong>${reactions.filter(p=>p.vote==='yes').length}<small>/ 3</small></strong><span>支持試行</span></div><div><strong>${changed.length}<small>/ 4</small></strong><span>設定與初版不同</span></div><div><strong>${concerns.length}</strong><span>仍有保留或反對</span></div></div>
      <section class="r-proposal r-final-policy"><div class="r-section-line"><h2>${isProduct ? '我採用嘅產品設定' : '我採用嘅服務安排'}</h2><span>正式記入本局</span></div>${clauses(snap)}</section>
      <section class="r-open-questions"><h2>未傾掂嘅地方</h2>${(concerns.length ? concerns : reactions.slice(0,1)).map(p => `<article><h3>${esc(p.name)} · ${concerns.length ? voteLabels[p.vote] : '支持之後，仍要確認'}</h3><p>${esc(concerns.length ? p.reasons.join('') : p.remaining)}</p>${concerns.length ? `<p class="r-followup">${esc(p.remaining)}</p>` : ''}</article>`).join('')}</section>
      <section class="r-next-step"><h2>我會點跟進？</h2><p>${esc(s.resultNext)}</p><p>${esc(s.learning)}</p></section>${voices(snap,r.rounds.at(-2),'定案時，三位嘅立場')}${history()}
      ${button('replay','同一個情境，試另一套做法')}${button('home','揀另一個難題','r-secondary')}<p class="r-disclosure">本局係預設互動示範，唔代表真實銀行決策或合規評估。</p>`;
  }
  function render(focus=true) {
    app.dataset.view=state.view;
    app.dataset.stage=state.view === 'play' ? (isProduct ? (last() && sameDraft() ? 'tested' : 'prototype') : state.run.stage) : state.view;
    main.innerHTML=state.view === 'home' ? home() : state.view === 'result' ? result() : isProduct ? productPlay() : managerPlay();
    if (state.view === 'home' && !isProduct) generator.bind(main, prompt => prepareStart(null, prompt));
    save();
    if(focus) {
      main.querySelector('h1')?.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
  }
  function start(id) {
    const s=findScenario(id);
    state.selected=id;
    state.run={id, draft:defaults(s), note:'', rounds:[], stage:'draft', finished:false};
    state.view='play';
    render();
  }
  function generateScenario(prompt) {
    const busy = /排隊|排队|輪候|轮候|午飯|午饭|繁忙|預約|预约|queue|lunch/i.test(prompt);
    const topic = prompt.length > 36 ? prompt.slice(0,36) + '…' : prompt;
    const options = [
      {id:'listen',label:'先問清楚最急嘅需要',detail:'接待員逐一確認來意，分清即時解說與需要進一步跟進的問題。',on:'先確認每位客人的需要，再安排合適的解說。',off:'沿用同一套流程，未先確認個別需要。',initial:true},
      {id:'human',label:busy ? '安排即場接待與輪候解說' : '保留人工解說與簡明指引',detail:busy ? '由接待員說明輪候次序與替代時段，但會佔用部分前線人手。' : '客人可找職員逐步解說；指引用短句，讓客人自己確認。',on:busy ? '安排即場接待，講清楚輪候與替代時段。' : '保留人工解說，提供簡明指引。',off:'暫時沿用現有接待方式，未加設協助。',initial:false},
      {id:'private',label:'留一個安靜解說位置',detail:'需要談細節時轉到側邊座位，讓客人自己選擇和確認；座位需要輪流使用。',on:'有需要時使用側邊座位，由客人自己確認選項。',off:'所有問題沿用大堂接待，未安排側邊解說。',initial:false},
      {id:'review',label:'先試行，再按記錄調整',detail:'主管安排負責人，記錄未解決的問題，再檢視人手與跟進時間。',on:'指定負責人記錄問題，試行後再調整安排。',off:'直接沿用方案，未指定檢視和跟進安排。',initial:false}
    ];
    return {id:'custom-manager',tag:'你出題 · 生成情境',title:topic,teaser:prompt,
      context:`今次嘅虛構分行難題：「${prompt}」。你要提出一套服務安排，聽取客人與前線同事的不同需要，再決定如何修訂。`,
      constraint:'演示設定：現有人手不變，側邊只有一組解說座位。以下回應按你的安排配對，不補充真實銀行規則。',
      editorTitle:'面對呢個難題，我會點安排？',options,
      people:[
        {name:'芬姐',role:'需要協助嘅客人',initial:'芬',stance:[{when:{human:false},vote:'no'},{when:{listen:true,human:true},vote:'yes'}],defaultVote:'hold',reasons:[{option:'listen',yes:`你有先問清楚「${topic}」入面我最急嘅需要，我先知道可以點處理。`,no:'未問過我想處理乜，就未必安排到適合我嘅服務。'},{option:'human',yes:'有職員解說下一步，我唔使自己估應該去邊。',no:'未有額外協助，我唔明白流程時仍然唔知搵邊個。'}],remaining:'安排實行之後，要問返需要協助嘅客人是否跟得上。'},
        {name:'樂怡',role:'重視理解與自主嘅客人',initial:'怡',stance:[{when:{private:false},vote:'no'},{when:{private:true,listen:true},vote:'yes'}],defaultVote:'hold',reasons:[{option:'private',yes:'有側邊位置慢慢講，而且由我自己確認，較放心提出疑問。',no:'如果所有細節都喺大堂講，我可能唔敢問清楚。'},{option:'listen',yes:'先聽我嘅需要，唔會一開始就替我揀好。',no:'大家需要唔一樣，我希望先有機會講清楚。'}],remaining:'側邊位置亦要安排輪候，唔可以承諾人人即時用到。'},
        {name:'家敏',role:'前線接待主管',initial:'敏',stance:[{when:{human:true,review:false},vote:'no'},{when:{review:true,listen:true},vote:'yes'}],defaultVote:'hold',reasons:[{option:'human',yes:'增加解說要排好輪值，唔係多一項服務就自然多一個人。',no:'人手暫時較易安排，但客人未解決嘅困難可能再返嚟。'},{option:'review',yes:`針對「${topic}」留低記錄，我哋先知道下一輪應該改邊部分。`,no:'未有負責人跟進，問題可能只係由今日推到聽日。'}],remaining:'試行前要分配接待、解說與跟進的負責人。'}
      ],resultNext:`下一步：針對「${prompt}」記錄客人卡住的位置、前線負擔與未處理事項，再修訂服務安排。`,learning:'本局練習是平衡協助、自主與前線工作。角色支持數只反映這次示範分支。'};
  }
  async function prepareStart(id, prompt = '') {
    if (preparing) return;
    if (isProduct) {start(id); return;}
    preparing = true;
    if (prompt) customPrompt = prompt;
    const ready = await generator.prepare(main, {prompt:prompt || findScenario(id).title,onCancel:() => {state.view='home';render();}});
    preparing = false;
    if (!ready) return;
    if (prompt) {customScenario = generateScenario(prompt); id = customScenario.id;}
    start(id);
  }
  function snapshot(direct) {
    if(state.run.rounds.length >= 3) return false;
    state.run.rounds.push({options:{...state.run.draft},note:state.run.note.trim(),direct});
    return true;
  }
  main.addEventListener('click', e => {
    const target=e.target.closest('button');
    if(!target || target.disabled) return;
    const choice=target.dataset.scenario;
    if(choice && state.view==='home' && findScenario(choice)) {
      state.selected=choice;
      main.querySelectorAll('[data-scenario]').forEach(b => {
        const chosen=b.dataset.scenario===choice;
        b.setAttribute('aria-pressed',String(chosen));
        b.querySelector('.r-select-mark').textContent=chosen?'✓':'＋';
      });
      save(); return;
    }
    const action=target.dataset.action;
    if(action==='start') {prepareStart(state.selected); return;}
    if(action==='home') {state.view='home'; if(state.selected==='custom-manager') state.selected=config.scenarios[0].id; render(); return;}
    if(action==='resume' && state.run) {state.view=state.run.finished || state.run.rounds.length>=3?'result':'play'; render(); return;}
    if(action==='replay' && state.run) {prepareStart(state.run.id); return;}
    if(state.view!=='play' || !state.run) return;
    if(action==='revise' && state.run.rounds.length<3) {state.run.stage='draft'; render(); return;}
    if(action==='consult' && state.run.rounds.length<3) {
      if(!isProduct && state.run.stage!=='draft') return;
      snapshot(false); state.run.stage='consult'; render();
      announce(`第 ${state.run.rounds.length} 輪已完成。三位角色嘅回應已更新。`);
      if(isProduct) {main.querySelector('.r-reactions')?.scrollIntoView({block:'start',behavior:'instant'}); main.querySelector('.r-reactions h2')?.setAttribute('tabindex','-1'); main.querySelector('.r-reactions h2')?.focus({preventScroll:true});}
      return;
    }
    if(action==='finish') {
      if(!sameDraft()) snapshot(true);
      state.run.finished=true; state.view='result'; render(); announce('已記低你嘅決策同未解決嘅分歧。');
    }
  });
  main.addEventListener('change', e => {
    if(state.view!=='play' || state.run.rounds.length>=3) return;
    const id=e.target.dataset.option;
    if(id && scenario().options.some(o=>o.id===id)) {
      state.run.draft[id]=e.target.checked; state.run.stage='draft';
      if(isProduct) {
        document.getElementById('r-phone-preview').innerHTML=phone(state.run.draft);
        document.getElementById('r-prototype-status').textContent=productStatus();
        app.dataset.stage=sameDraft()?'tested':'prototype';
        announce('手機預覽已更新。');
      }
      save();
    }
  });
  main.addEventListener('input', e => {
    if(e.target.id!=='r-note' || state.view!=='play' || state.run.rounds.length>=3) return;
    state.run.note=e.target.value.slice(0,240);
    if(isProduct) {document.getElementById('r-prototype-status').textContent=productStatus();app.dataset.stage=sameDraft()?'tested':'prototype';}
    save();
  });
  render(false);
})();
