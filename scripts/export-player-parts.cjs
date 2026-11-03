// Export the same vector shapes used by the live rig; no second set of artwork.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'assets/player');
const fmt=n=>Number(n.toFixed(5)),escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
function multiply(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
class VectorContext{
 constructor(){this.state={matrix:[1,0,0,1,0,0],fillStyle:'#000000',strokeStyle:'#000000',lineWidth:1,lineCap:'butt',lineJoin:'miter',globalAlpha:1,clips:[]};this.stack=[];this.elements=[];this.defs=[];this.beginPath();}
 save(){this.stack.push({...this.state,matrix:[...this.state.matrix],clips:[...this.state.clips]});}
 restore(){if(!this.stack.length)throw Error('Unbalanced vector restore');this.state=this.stack.pop();}
 transform(...matrix){this.state.matrix=multiply(this.state.matrix,matrix);}
 translate(x,y){this.transform(1,0,0,1,x,y);}
 scale(x,y){this.transform(x,0,0,y,0,0);}
 rotate(angle){this.transform(Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle),0,0);}
 beginPath(){this.commands=[];this.pathMatrix=[...this.state.matrix];}
 command(name,...values){this.commands.push(name+values.map(fmt).join(' '));}
 moveTo(x,y){this.command('M',x,y);}
 lineTo(x,y){this.command('L',x,y);}
 quadraticCurveTo(...values){this.command('Q',...values);}
 bezierCurveTo(...values){this.command('C',...values);}
 closePath(){this.commands.push('Z');}
 rect(x,y,width,height){this.moveTo(x,y);this.lineTo(x+width,y);this.lineTo(x+width,y+height);this.lineTo(x,y+height);this.closePath();}
 ellipse(x,y,rx,ry,rotation,start,end){
  if(Math.abs(end-start-Math.PI*2)>1e-6)throw Error('Only full ellipses are used by player parts');
  const dx=rx*Math.cos(rotation),dy=rx*Math.sin(rotation);this.moveTo(x+dx,y+dy);
  this.command('A',rx,ry,rotation*180/Math.PI,1,0,x-dx,y-dy);this.command('A',rx,ry,rotation*180/Math.PI,1,0,x+dx,y+dy);this.closePath();
 }
 pathAttributes(){return 'd="'+this.commands.join(' ')+'" transform="matrix('+this.pathMatrix.map(fmt).join(' ')+')"';}
 append(attributes){let element='<path '+this.pathAttributes()+' '+attributes+'/>';for(const clip of this.state.clips)element='<g clip-path="url(#'+clip+')">'+element+'</g>';this.elements.push(element);}
 fill(){this.append('fill="'+escape(this.fillStyle)+'" opacity="'+fmt(this.globalAlpha)+'"');}
 stroke(){this.append('fill="none" stroke="'+escape(this.strokeStyle)+'" stroke-width="'+fmt(this.lineWidth)+'" stroke-linecap="'+escape(this.lineCap)+'" stroke-linejoin="'+escape(this.lineJoin)+'" opacity="'+fmt(this.globalAlpha)+'"');}
 clip(){const id='clip'+this.defs.length;this.defs.push('<clipPath id="'+id+'" clipPathUnits="userSpaceOnUse"><path '+this.pathAttributes()+'/></clipPath>');this.state.clips.push(id);}
 svg(viewBox){if(this.stack.length)throw Error('Unbalanced vector save');return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+viewBox.join(' ')+'"><defs>'+this.defs.join('')+'</defs>'+this.elements.join('')+'</svg>\n';}
}
for(const key of ['fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','globalAlpha'])Object.defineProperty(VectorContext.prototype,key,{get(){return this.state[key];},set(value){this.state[key]=value;}});
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'src/avatar-rig.js'),'utf8'),context,{timeout:1000});
const avatar=context.window.DeepwellAvatar,slots=avatar.metrics().physicalSlots,sets=['base','melee_1','melee_2','ranged_1','ranged_2','magic_1','magic_2'];
const headViews={melee:[-34,-55,70,83],ranged:[-30,-51,65,78],magic:[-33,-49,66,79]};
const views={head:[-31,-38,62,68],shoulders:[-12,-10,25,21],chest:[-19,-35,38,51],legs:[-18,-5,36,48],boots:[-12,-11,27,22],gloves:[-10,-10,20,20]},metrics=[];
fs.mkdirSync(path.join(folder,'parts'),{recursive:true});
for(const set of sets)for(const slot of slots){
 const recorder=new VectorContext();avatar.drawPart(recorder,slot,{set});const key=(set==='base'?'base':'armor-'+set)+'-'+slot,viewBox=slot==='head'?headViews[set.split('_')[0]]||views.head:views[slot],svg=recorder.svg(viewBox);
 fs.writeFileSync(path.join(folder,'parts',key+'.svg'),svg);metrics.push({key,slot,set,viewBox,paths:recorder.elements.length,bytes:Buffer.byteLength(svg)});
}
fs.writeFileSync(path.join(folder,'vector-metrics.json'),JSON.stringify(metrics,null,2)+'\n');
fs.writeFileSync(path.join(folder,'catalog.json'),JSON.stringify({version:2,style:'illustrated-2d',physicalSlots:slots,armorSets:sets.slice(1),hairstyles:6,vectorParts:metrics.length,tools:8,assets:metrics.length+8,coordinateSystem:'Foot origin; shared shoulders, elbows, knees, wrists and ankles',renderer:'src/avatar-rig.js',sourceSheets:['tools.png','ward-artisan.png']},null,2)+'\n');
console.log('Exported',metrics.length,'independent illustrated SVG parts from the live renderer.');
