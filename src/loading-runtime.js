/* Runs before the standalone game's embedded art has arrived. */
(()=>{
 const root=document.documentElement,screen=document.getElementById('loadingScreen'),status=document.getElementById('loadingStatus');let finished=false,failed=false;
 document.getElementById('loadingRetry').onclick=()=>location.reload();
 window.__gameLoading={
  preparing(){if(!finished&&!failed)status.textContent='Preparing the dungeon…';},
  ready(){
   if(finished||failed)return;finished=true;
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const app=document.getElementById('app');app?.removeAttribute('inert');app?.removeAttribute('aria-hidden');root.classList.remove('game-loading');
    screen.classList.add('is-complete');screen.setAttribute('aria-hidden','true');
    const card=document.getElementById('overlayCard');if(card&&!document.getElementById('overlay').classList.contains('hidden'))card.focus({preventScroll:true});
    setTimeout(()=>screen.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:200);
   }));
  },
  fail(){
   if(finished||failed)return;failed=true;screen.classList.add('is-failed');status.textContent='The dungeon couldn’t open. Please try again.';document.getElementById('loadingRetry').hidden=false;
  }
 };
 window.addEventListener('error',event=>{if(event.target===window&&event.message)window.__gameLoading.fail();});
 window.addEventListener('unhandledrejection',()=>window.__gameLoading.fail());
})();
