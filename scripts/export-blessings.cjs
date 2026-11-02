/* Small, original vector emblems for the combat blessing collection. */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const shapes={
 fervor:['#e8b07c','<path d="M30 79 66 20 73 25 41 84Z"/><path d="m23 61 26 16m-26 4 9 5"/>'],
 windstep:['#a8ded7','<path d="M16 36h40q20 0 14-13-8-11-16 0M16 49h56q22 0 12 14-7 9-15 0M22 64h27q14 0 9 14"/>'],
 stoneguard:['#c7d6a6','<path d="m20 65 14-30 25-9 23 27-9 25H37Z"/><path d="m53 26-9 23 17 8-15 20m-2-28-22 16"/>'],
 silence:['#c3abf4','<path d="m38 75-5-45 15-12 15 12-5 45Z"/><path d="M26 85 78 15M21 28l8 9m43 30 8 8"/>'],
 quagmire:['#a8dcf2','<path d="M48 16v66M18 48h60M25 25l47 47m0-47L25 72M34 22l14 11 14-11M34 75l14-12 14 12"/>'],
 bounty:['#f2d282','<ellipse cx="49" cy="59" rx="29" ry="19"/><path d="M20 51v13q28 27 58 0V51M27 39q20-20 44-2M49 42v29m-7-25q21-1 6 10-15 11 9 10"/>'],
 harvest:['#aeda93','<path d="M46 80V33m0 27Q18 61 19 36q23-1 27 24Zm1-16Q51 17 76 19q0 23-29 25Zm0 28q3-19 27-20 1 23-27 20Z"/>'],
 cascade:['#a9c3f3','<path d="m55 16-23 34 21-1-13 32 27-39-20 2Z"/><circle cx="19" cy="66" r="8"/><circle cx="79" cy="30" r="8"/><path d="m26 60 11-8m24-14 11-5"/>'],
 momentum:['#e9a985','<path d="m20 27 28 22-28 22m30-44 28 22-28 22M17 80h62"/>'],
 longarm:['#d1dca9','<path d="M19 49h60m-45-15L19 49l15 15m30-30 15 15-15 15M27 19h44M27 80h44"/>'],
 combat_language:['#c887ff','<path d="m48 17 29 49H19Z"/><path d="M48 33v16m0 6v3"/><path d="M23 76h50"/>']
};
const file=path.join(root,'src/elite-boon-icons.json'),icons=JSON.parse(fs.readFileSync(file,'utf8')),folder=path.join(root,'assets/svg/blessings');fs.mkdirSync(folder,{recursive:true});
for(const [id,[color,shape]]of Object.entries(shapes)){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><radialGradient id="b"><stop stop-color="#36394a"/><stop offset="1" stop-color="#141923"/></radialGradient></defs><circle cx="48" cy="48" r="45" fill="url(#b)" stroke="#bba271" stroke-width="2"/><circle cx="48" cy="48" r="40" fill="none" stroke="${color}" stroke-opacity=".35"/><g fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
 fs.writeFileSync(path.join(folder,id+'.svg'),svg);icons['codex-'+(id==='combat_language'?id:'elite_boon_'+id)+'.svg']='data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
}
(async()=>{const {createRuntime}=require('../tests/runtime.cjs'),runtime=await createRuntime();try{const page=await runtime.browser.newPage();for(const id of Object.keys(shapes)){const key='codex-'+(id==='combat_language'?id:'elite_boon_'+id)+'.svg',uri=icons[key];icons[key]=await page.evaluate(async uri=>{const image=new Image();image.src=uri;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=192;canvas.getContext('2d').drawImage(image,0,0,192,192);return canvas.toDataURL('image/webp',.96);},uri);fs.writeFileSync(path.join(folder,id+'.webp'),Buffer.from(icons[key].split(',')[1],'base64'));}fs.writeFileSync(file,JSON.stringify(icons));console.log('Exported '+Object.keys(shapes).length+' original emblems and their WebP caches.');}finally{await runtime.close();}})().catch(e=>{console.error(e);process.exit(1)});
