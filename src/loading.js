/* Reveal the game after the intro and its first scene can actually be painted. */
function finishGameLoading(){
 const loading=window.__gameLoading;if(!loading)return;loading.preparing();
 primeEnvironment(biomeIndex());
 const images=new Set([...document.querySelectorAll('#app img')].filter(image=>image.getClientRects().length));
 for(const image of environmentImages.values())images.add(image);
 for(const image of rareEliteImages.values())images.add(image);
 for(const image of Object.values(equipmentImages||{}))images.add(image);
 for(const image of DeepwellAvatar.images())images.add(image);
 for(const image of combatFxImages.values())images.add(image);
 Promise.allSettled([...images].map(image=>image.decode())).then(()=>{render();loading.ready();}).catch(()=>loading.fail());
}
