// Label the actual renderer's surfaces only in isolated test responses.
function armLayerProbe(){
 const colors={farArm:'#3282f0',nearArm:'#18e75b',farHand:'#f01496',nearHand:'#f0d214'},masks={};let probing=false;
 function tinted(c,color){return new Proxy(c,{get(target,key){const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},set(target,key,value){target[key]=key==='fillStyle'||key==='strokeStyle'?color:value;return true;}});}
 function track(name,paint,c,args){
  if(!probing)return paint(c,...args);
  const mask=masks[name]||(masks[name]=document.createElement('canvas'));mask.width=c.canvas.width;mask.height=c.canvas.height;const mc=mask.getContext('2d');mc.setTransform(c.getTransform());paint(mc,...args);
  return paint(colors[name]?tinted(c,colors[name]):c,...args);
 }
 const arm=paintArm,hand=paintHand,head=paintHead,tool=paintTool;
 paintArm=(c,...args)=>track(args[1]<0?'farArm':'nearArm',arm,c,args);
 paintHand=(c,...args)=>track(args[2]<0?'farHand':'nearHand',hand,c,args);
 paintHead=(c,...args)=>track('head',head,c,args);paintTool=(c,...args)=>track('tool',tool,c,args);
 const rgb={farArm:[50,130,240],nearArm:[24,231,91],farHand:[240,20,150],nearHand:[240,210,20]};
 global.armLayerProbe={
  capture(options){
   const canvas=document.createElement('canvas');canvas.width=480;canvas.height=460;const c=canvas.getContext('2d'),facing=options.facing||1,scale=3,x=facing>0?140:340,y=430,rig=poseRig(options);
   for(const mask of Object.values(masks))mask.getContext('2d').clearRect(0,0,mask.width,mask.height);
   probing=true;try{global.DeepwellAvatar.render(c,{...options,x,y,scale});}finally{probing=false;}
   const result={armCrossings:0,armErrors:0,farGrips:0,farGripErrors:0,nearGrips:0,nearGripErrors:0};
   for(const [point,side]of [[rig.back,'far'],[rig.main,'near']]){
    const left=Math.max(0,Math.round(x+point.x*scale*facing)-30),top=Math.max(0,Math.round(y+point.y*scale)-30),width=Math.min(60,canvas.width-left),height=Math.min(60,canvas.height-top),pixels=c.getImageData(left,top,width,height).data;
    const layers=Object.fromEntries(['farHand','nearHand','nearArm','head','tool'].map(name=>[name,masks[name]?.getContext('2d').getImageData(left,top,width,height).data||new Uint8ClampedArray(width*height*4)]));
    // Identify the owning surface, allowing antialiasing at curved joins.
    function matches(i,name){const distance=color=>color.reduce((n,v,k)=>n+(pixels[i+k]-v)**2,0),expected=distance(rgb[name]);return Object.values(rgb).every(color=>expected<=distance(color));}
    function solid(mask,i){const pixel=i/4,column=pixel%width;return column>0&&column<width-1&&pixel>=width&&pixel<(height-1)*width&&[i,i-4,i+4,i-width*4,i+width*4].every(at=>mask[at+3]===255);}
    for(let i=0;i<pixels.length;i+=4){
     if(side==='far'&&solid(layers.farHand,i)&&solid(layers.nearArm,i)&&!layers.nearHand[i+3]&&!layers.head[i+3]){result.armCrossings++;if(!matches(i,'nearArm'))result.armErrors++;}
     if(side==='far'&&solid(layers.farHand,i)&&layers.tool[i+3]>220&&!layers.nearArm[i+3]&&!layers.nearHand[i+3]&&!layers.head[i+3]){result.farGrips++;if(!matches(i,'farHand'))result.farGripErrors++;}
     if(side==='near'&&solid(layers.nearHand,i)&&layers.tool[i+3]>220){result.nearGrips++;if(!matches(i,'nearHand'))result.nearGripErrors++;}
    }
   }return result;
  }
 };
}
function instrumentAvatar(source){
 const seam='global.DeepwellAvatar=Object.freeze({';if(!source.includes(seam)||!source.endsWith('})(window);\n'))throw Error('Avatar instrumentation seam missing');
 return source.replace(seam,'('+armLayerProbe.toString()+')();\n'+seam).replace('})(window);','})(window.__armLayerGlobal={DeepwellEquipmentArt:window.DeepwellEquipmentArt,matchMedia:window.matchMedia.bind(window)});');
}
module.exports={instrumentAvatar};
