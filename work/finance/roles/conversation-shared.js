const main=document.getElementById('role-main');
const E=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R={
 main, E, config:CONFIG, key:'hkchat-finance-role-'+CONFIG.key,
 load(initial){try{const s=JSON.parse(localStorage.getItem(this.key));return s&&s.version===1&&typeof s.view==='string'?{...initial,...s}:initial}catch{return initial}},
 save(s){try{localStorage.setItem(this.key,JSON.stringify({...s,version:1}))}catch{}},
 render(html,focus=true){main.innerHTML=html;if(focus){window.scrollTo({top:0,behavior:'instant'});const h=main.querySelector('h1,h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}},
 async prepare(label,fn){this.render('<section class="cv-loading" role="status"><div class="cv-loader" aria-hidden="true"></div><h1>'+E(label)+'</h1><p>整理今次嘅預設情境</p></section>');await new Promise(resolve=>setTimeout(resolve,540));fn()},
 say(t){document.getElementById('role-announcer').textContent=t},
 hero(){return '<section class="p-photo-hero" style="--p-photo-position:'+E(CONFIG.position||'center 36%')+'"><img class="p-photo-bg" src="'+E(CONFIG.photo)+'" alt="'+E(CONFIG.alt)+'" width="768" height="1024"><div class="p-photo-copy"><span class="p-photo-kicker">'+E(CONFIG.kicker)+'</span><h1>'+E(CONFIG.title)+'</h1><p>'+E(CONFIG.desc)+'</p><div class="p-photo-meta"><span>第一身體驗</span><i aria-hidden="true"></i><span>'+E(CONFIG.time)+'</span></div></div></section>'},
 top(label){return '<div class="cv-topline"><button class="cv-back" data-action="home">‹ 換個情境</button><span class="cv-muted">'+E(label)+' · 虛構情境</span></div>'},
 steps(labels,n){return '<ol class="cv-progress" aria-label="體驗進度">'+labels.map((l,i)=>'<li'+(i===n?' aria-current="step"':'')+'>'+E(l)+'</li>').join('')+'</ol>'},
 note(){return '<div class="cv-disclosure">預設角色／情境演示。回應按關鍵字配對；自由輸入無法完整評估。文字只存喺呢個瀏覽器，唔使提供真實個人資料。</div>'},
 btn(text,action,secondary=false,extra=''){return '<button class="'+(secondary?'cv-secondary':'cv-primary')+'" data-action="'+E(action)+'" '+extra+'>'+E(text)+'</button>'},
 field(id,label,value,placeholder,max=700,script=false){return '<label class="cv-field" for="'+id+'"><span>'+E(label)+'</span><textarea id="'+id+'" '+(script?'class="cv-script" ':'')+'maxlength="'+max+'" placeholder="'+E(placeholder)+'">'+E(value)+'</textarea></label><div class="cv-field-help"><span>可直接修改，亦可用下面嘅提示起稿。</span><span id="'+id+'-count">'+String(value||'').length+' / '+max+'</span></div><p class="cv-error" id="role-error" role="alert"></p>'},
 bindField(id,fn){const el=document.getElementById(id);if(!el)return;el.addEventListener('input',()=>{fn(el.value);const c=document.getElementById(id+'-count');if(c)c.textContent=el.value.length+' / '+el.maxLength;document.getElementById('role-error')?.replaceChildren()})},
 fill(id,text,fn){const el=document.getElementById(id);el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();if(fn)fn(text)},
 error(text){const el=document.getElementById('role-error');if(el){el.textContent=text;el.scrollIntoView({block:'nearest'})}},
 sources(items,desc){return '<details class="cv-disclosure"><summary>概念參考資料</summary><p>'+E(desc)+'</p>'+items.map(s=>'<a href="'+E(s.url)+'" target="_blank" rel="noopener noreferrer">'+E(s.name)+' ↗</a>').join('')+'<p>資料核對：2026年9月30日</p></details>'},
 async copy(text,button){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw new Error('copy')}button.textContent='已複製';this.say('文字已複製，可以貼到你想分享嘅地方。')}catch{button.textContent='未能複製，請長按選取文字';this.say('未能複製，請長按選取文字。')}}
};
