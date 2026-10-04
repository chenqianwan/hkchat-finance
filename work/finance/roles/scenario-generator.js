(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let serial = 0;
  const pending = new WeakMap();
  function form({placeholder = '講吓你想練習嘅難題……', examples = [], value = ''} = {}) {
    const id = 'sg-topic-' + (++serial);
    return `<section class="sg-compose" aria-labelledby="${id}-title"><div class="sg-heading"><span class="sg-spark" aria-hidden="true">✦</span><div><span class="sg-eyebrow">由你出題</span><h2 id="${id}-title">想試另一個情境？</h2></div><span class="sg-tag">生成演示</span></div><p class="sg-intro">講吓遇到嘅人、場合，同你想練習嘅難題。</p><form data-sg-form novalidate><label class="sg-label" for="${id}">我想練習……</label><textarea id="${id}" data-sg-input maxlength="180" rows="3" placeholder="${esc(placeholder)}" aria-describedby="${id}-help ${id}-error">${esc(value)}</textarea><div class="sg-input-meta"><span id="${id}-help">4–180 字 · 只需虛構情境</span><span data-sg-count>${value.length} / 180</span></div><div class="sg-examples" aria-label="試用出題靈感">${examples.map(x => `<button type="button" data-sg-example="${esc(x)}">${esc(x)}</button>`).join('')}</div><p class="sg-error" id="${id}-error" data-sg-error role="alert"></p><button class="sg-submit" type="submit"><span aria-hidden="true">✦</span> 生成我的情境 <span aria-hidden="true">→</span></button></form><p class="sg-note">靜態演示：按描述組合練習，回應使用示範分支。自訂內容只留在本頁，重新整理即清除。</p></section>`;
  }
  function bind(main, onGenerate) {
    const f = main.querySelector('[data-sg-form]');
    if (!f || f.dataset.bound) return;
    f.dataset.bound = 'true';
    const input = f.querySelector('[data-sg-input]'), error = f.querySelector('[data-sg-error]');
    input.addEventListener('input', () => {
      f.querySelector('[data-sg-count]').textContent = `${input.value.length} / 180`;
      error.textContent = ''; input.removeAttribute('aria-invalid');
    });
    f.querySelectorAll('[data-sg-example]').forEach(b => b.addEventListener('click', () => {
      input.value = b.dataset.sgExample;
      input.dispatchEvent(new Event('input', {bubbles:true})); input.focus();
    }));
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const prompt = input.value.trim();
      if (prompt.length < 4 || prompt.length > 180) {
        error.textContent = '用 4–180 字講吓你想練習嘅情境。'; input.setAttribute('aria-invalid','true'); input.focus(); return;
      }
      const button = f.querySelector('[type="submit"]');
      if (button.disabled) return;
      button.disabled = true;
      try { await onGenerate(prompt); }
      catch (err) {
        console.error('Scenario preparation failed', err);
        if (f.isConnected) error.textContent = '未能準備情境，請再試一次。';
      } finally { button.disabled = false; }
    });
  }
  function prepare(main, {label = '正在生成今次嘅情境', prompt = '', onCancel = () => {}} = {}) {
    pending.get(main)?.();
    return new Promise(resolve => {
      const steps = ['整理題材與背景', '安排角色與問題', '準備好，輪到你出場'];
      let done = false;
      const timers = [];
      main.innerHTML = `<section class="sg-loading" data-sg-loading aria-labelledby="sg-loading-title"><span class="sg-orbit" aria-hidden="true">✦</span><span class="sg-eyebrow">情境生成中</span><h1 id="sg-loading-title" tabindex="-1">${esc(label)}</h1>${prompt ? `<p class="sg-prompt">${esc(prompt)}</p>` : '<p class="sg-prompt">將題材變成一場可以參與嘅練習。</p>'}<ol class="sg-steps">${steps.map((s,i) => `<li data-sg-step="${i}"${i === 0 ? ' aria-current="step"' : ''}><span aria-hidden="true">${i+1}</span>${s}</li>`).join('')}</ol><p class="sg-live" role="status" aria-live="polite">${steps[0]}</p><p class="sg-note">靜態生成演示 · 使用示範內容</p><button type="button" class="sg-cancel" data-sg-cancel>返回修改</button></section>`;
      const panel = main.querySelector('[data-sg-loading]');
      window.scrollTo({top:0,behavior:'instant'});
      main.querySelector('h1').focus({preventScroll:true});
      const finish = value => {
        if (done) return;
        done = true; timers.forEach(clearTimeout); pending.delete(main); resolve(value);
      };
      const cancel = () => finish(false);
      pending.set(main, cancel);
      main.querySelector('[data-sg-cancel]').addEventListener('click', () => {finish(false); onCancel();});
      steps.slice(1).forEach((_,i) => timers.push(setTimeout(() => {
        if (!panel.isConnected) {finish(false); return;}
        panel.querySelectorAll('[data-sg-step]').forEach((li,n) => {
          li.classList.toggle('sg-complete', n <= i);
          if (n === i+1) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
        });
        panel.querySelector('.sg-live').textContent = steps[i+1];
      }, (i+1)*500)));
      timers.push(setTimeout(() => finish(panel.isConnected), 1550));
    });
  }
  window.HKScenario = Object.freeze({form, bind, prepare});
})();
