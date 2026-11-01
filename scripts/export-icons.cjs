// Slice generated artwork into consistently centered UI badges. Rig textures stay intact.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets/icons');
const catalog=JSON.parse(fs.readFileSync(path.join(dir,'catalog.json')));
const equipment=JSON.parse(fs.readFileSync(path.join(root,'src/equipment-art.json')));
(async()=>{
 const executablePath=['/usr/bin/chromium','/usr/bin/chromium-browser'].find(p=>fs.existsSync(p));
 const browser=await chromium.launch({...(executablePath?{executablePath}:{}),args:['--no-sandbox']});
 try{
  const page=await browser.newPage(),sheets=catalog.sheets.map(s=>({...s,src:'data:image/png;base64,'+fs.readFileSync(path.join(dir,s.file)).toString('base64')}));
  const packed=await page.evaluate(async({sheets,equipment,size})=>{
   const load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});
   const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d',{willReadFrequently:true}),out={},metrics={};
   const bounds=()=>{const d=c.getImageData(0,0,size,size).data;let l=size,t=size,r=0,b=0;for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(d[(y*size+x)*4+3]>128){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}return {x:l,y:t,width:r-l+1,height:b-t+1};};
   const publish=(key,aliases=[])=>{
    // Align the visible painted disc, excluding its faint transparent shadow.
    const b=bounds(),dx=Math.round((size-1)/2-(b.x+(b.width-1)/2)),dy=Math.round((size-1)/2-(b.y+(b.height-1)/2));
    if(dx||dy){const copy=document.createElement('canvas');copy.width=copy.height=size;copy.getContext('2d').drawImage(canvas,0,0);c.clearRect(0,0,size,size);c.drawImage(copy,dx,dy);}
    const src=canvas.toDataURL('image/webp',.93);for(const name of [key,...aliases]){out[name+'.svg']=src;metrics[name]=bounds();}
   };
   for(const sheet of sheets){const image=await load(sheet.src),cw=image.width/sheet.columns,ch=image.height/sheet.rows;
    for(const [i,icon]of sheet.icons.entries()){
     c.clearRect(0,0,size,size);
     if(sheet.regions){
      const [x,y,w,h]=sheet.regions[i];c.save();c.beginPath();c.arc(size/2,size/2,(size-12)/2,0,Math.PI*2);c.clip();c.drawImage(image,x,y,w,h,6,6,size-12,size-12);c.restore();publish(icon.key,icon.aliases);continue;
     }
     c.drawImage(image,(i%sheet.columns)*cw,Math.floor(i/sheet.columns)*ch,cw,ch,0,0,size,size);
     const box=bounds(),copy=document.createElement('canvas');copy.width=copy.height=size;copy.getContext('2d').drawImage(canvas,0,0);
     c.clearRect(0,0,size,size);const w=size-12,h=size-12;
     c.drawImage(copy,box.x,box.y,box.width,box.height,(size-w)/2,(size-h)/2,w,h);publish(icon.key,icon.aliases);
    }
   }
   const frame=()=>{c.clearRect(0,0,size,size);const g=c.createRadialGradient(64,48,8,96,96,91);g.addColorStop(0,'#33434b');g.addColorStop(.7,'#1f303b');g.addColorStop(1,'#101d27');c.beginPath();c.arc(96,96,89,0,Math.PI*2);c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle='#9f8655';c.stroke();c.beginPath();c.arc(96,96,85,0,Math.PI*2);c.lineWidth=1;c.strokeStyle='#d4bb7c66';c.stroke();};
   for(const style of ['melee','ranged','magic'])for(let tier=1;tier<=2;tier++){
    const image=await load(equipment['armor-set-'+style+'_'+tier+'.svg']);frame();const height=145,width=height*image.width/image.height;c.drawImage(image,96-width/2,96-height/2,width,height);
    publish('codex-armor_set_'+style+'_'+tier,tier===1?['style-'+style+'-armor','codex-armor_'+style]:[]);
   }
   const names={sword:'sword',shield:'shield',polearm:'halberd',greatsword:'greatsword',bow:'bow',staff:'staff'};
   for(const [weapon,legacy]of Object.entries(names))for(let tier=1;tier<=2;tier++){
    const image=await load(equipment['weapon-art-'+weapon+'_'+tier+'.svg']);frame();const side=144,scale=side/Math.max(image.width,image.height),w=image.width*scale,h=image.height*scale;c.drawImage(image,96-w/2,96-h/2,w,h);
    const aliases=tier===1?[legacy,'codex-weapon_'+weapon,...(weapon==='sword'?['style-melee-weapon']:weapon==='bow'?['style-ranged-weapon']:weapon==='staff'?['style-magic-weapon']:[])]:[];
    publish('weapon-art-'+weapon+'_'+tier,aliases);
   }
   return {icons:out,metrics};
  },{sheets,equipment,size:catalog.size});
  fs.writeFileSync(path.join(root,'src/painted-icons.json'),JSON.stringify(packed.icons)+'\n');
  fs.writeFileSync(path.join(dir,'metrics.json'),JSON.stringify(packed.metrics,null,2)+'\n');
  console.log('Exported '+Object.keys(packed.icons).length+' centered painted icon bindings.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
