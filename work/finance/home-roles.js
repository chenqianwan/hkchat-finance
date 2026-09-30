(() => {
  const root=document.getElementById('hkhome');
  const tabs=[...root.querySelectorAll('[data-collection]')];
  function select(name,updateURL=false){
    const mode=name==='games'?'games':'roles';
    for(const tab of tabs){
      const on=tab.dataset.collection===mode;
      tab.setAttribute('aria-selected',String(on));
      tab.tabIndex=on?0:-1;
      root.querySelector('#home-'+tab.dataset.collection).hidden=!on;
    }
    root.querySelector('#home-mode-note').textContent=mode==='roles'?'虛構職場 · 揀個情境即刻玩':'AI 情境演示 · 玩住識金融';
    if(updateURL)history.replaceState(null,'','#'+mode);
  }
  for(const tab of tabs){
    tab.addEventListener('click',()=>select(tab.dataset.collection,true));
    tab.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs[1]:tabs[1-tabs.indexOf(tab)];
      select(next.dataset.collection,true);next.focus();
    });
  }
  function route(){
    const hash=location.hash.slice(1);
    select(hash);
    if(hash.startsWith('role-')) root.dispatchEvent(new CustomEvent('hkchat:open-role-group',{detail:hash.slice(5)}));
    else if(root.querySelector('#home-howto').open) root.querySelector('#home-howto').close();
  }
  window.addEventListener('hashchange',route);
  window.addEventListener('popstate',route);
  route();
})();
