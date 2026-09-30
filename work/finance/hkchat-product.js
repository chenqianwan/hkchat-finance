(()=>{
 const app=document.querySelector('#hklegal,#hkcourt,#hkmoral,#hkdetect,#hkquiz,#hkfineprint,#hkshare,#hkauthenticity,#hkmediation,#hkcouncil,#hkhome,#hkmatch,#hkspot');
 if(!app)return;
 const toggle=app.querySelector('.p-menu-button'),nav=app.querySelector('.p-nav');
 if(!toggle||!nav)return;
 const close=()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false');};
 toggle.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));});
 document.addEventListener('click',e=>{if(!app.querySelector('.p-header').contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){close();toggle.focus();}});
 window.lucide?.createIcons({attrs:{width:18,height:18}});
})();
