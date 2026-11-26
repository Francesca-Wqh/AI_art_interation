import {workColors} from './workshop-model.js?v=08-en';
import {shops,localToWorld,worldToLocal} from './layout.js?v=08-en';
import {STUDIES} from './interactions.js?v=08-en';
import {drawStudy} from './postcard.js?v=08-en';
// All of this group is dynamic: never pass it to batchStatic(). No additional lights/shadows.
export function addStudies({T,group,box,cyl,ball,rod,mesh,M,story}){
 const root=group('12_Live_Colour_Studies'),stations=new Map();
 for(const study of STUDIES){
  const s=shops.find(s=>s.id===study.id),g=new T.Group();g.position.set(s.x,.075,s.z);g.rotation.y=s.side==='left'?Math.PI/2:-Math.PI/2;root.add(g);
  const image=document.createElement('canvas');image.width=640;image.height=420;
  const texture=new T.CanvasTexture(image);texture.colorSpace=T.SRGBColorSpace;
  const imageMat=new T.MeshBasicMaterial({map:texture,toneMapped:false});
  box(.24,1.80,-s.depth+.17,1.90,1.27,.055,M.walnut,g);
  mesh(new T.PlaneGeometry(1.80,1.18),imageMat,.24,1.80,-s.depth+.205,g);
  const base=new T.Group();base.position.set(.4,.825,-2.9);g.add(base);
  const mats=Array.from({length:3},(_,i)=>new T.MeshStandardMaterial({color:['#d5b887','#5b765a','#b38370'][i],roughness:.7,emissive:'#32281e',emissiveIntensity:.25}));
  let change;
  if(s.id==='cloth'){
   const a=box(-.32,.035,0,.65,.04,.47,mats[0],base),b=box(.32,.055,.04,.60,.05,.44,mats[1],base);
   change=(c,w)=>{const colors=w?workColors(w):null;mats[0].color.set(colors?.warm||(c==='coral-teal'?'#de977c':'#e6c26a'));mats[1].color.set(colors?.cold||(c==='coral-teal'?'#398080':'#456699'));a.scale.x=w?w.balance+.5:1;b.scale.x=w?1.35-w.balance:1;a.rotation.y=w?(w.weather-1)*.11:(c==='coral-teal'?-.13:0);b.rotation.y=-a.rotation.y;mats[0].emissive.set(colors?.warm||'#32281e');mats[1].emissive.set(colors?.cold||'#32281e');mats[0].emissiveIntensity=mats[1].emissiveIntensity=w?.glow?(.08+w.glow*.38):.25;mats[0].roughness=mats[1].roughness=w?1-w.contrast*.45:.7;};
  }else if(s.id==='produce'){
   const fruit=Array.from({length:6},(_,i)=>ball(0,.09,0,.085,.09,.08,mats[i%3],base));
   change=(c,w)=>fruit.forEach((o,i)=>{if(w){o.position.x=(w.items[i][0]-.5)*1.5;o.position.z=(w.items[i][1]-.5)*.6;return;}o.position.x=c==='scattered'?-.66+i*.25:-.23+(i%3)*.18;o.position.z=c==='scattered'?(i%2?-.16:.15):-.1+Math.floor(i/3)*.18;});
  }else if(s.id==='florist'){
   cyl(0,.14,.05,.12,.27,M.ceramic,base,14);const flowers=[];
   for(let i=0;i<7;i++){const f=new T.Group();base.add(f);rod([0,0,0],[0,.28,0],.009,M.leaves,f);for(let j=0;j<5;j++)ball(Math.cos(j*1.25)*.035,.28,Math.sin(j*1.25)*.035,.03,.02,.03,mats[i%3],f);flowers.push(f);}
   change=(c,w)=>flowers.forEach((o,i)=>{if(w){o.position.set((w.flowers[i][0]-.5)*.9,.24+(1-w.flowers[i][1])*.2,0);o.rotation.z=(.5-w.flowers[i][0])*.9;return;}o.position.set((i-3)*(c==='wild'?.062:.029),.24+(i%3)*.025,0);o.rotation.z=(i-3)*(c==='wild'?.22:.09);});
  }else if(s.id==='wine'){
   box(0,.28,-.23,.88,.56,.035,mats[0],base);cyl(0,.16,0,.083,.32,mats[1],base,16);cyl(0,.37,0,.028,.13,mats[1],base,12);cyl(0,.16,0,.084,.12,M.paper,base,16);
   change=(c,w)=>mats[0].color.set(w?`hsl(${w.hue*160},29%,44%)`:(c==='green'?'#718675':'#a76166'));
  }else if(s.id==='bakery'){
   for(let i=0;i<3;i++){const o=ball((i-1)*.4,.08,0,.23,.09,.12,mats[0],base);o.rotation.y=.15;}
   change=(c,w)=>{mats[0].color.set(w?`hsl(${36+w.temperature*175},40%,65%)`:(c==='moon'?'#aab9ce':'#e0b17c'));mats[0].emissive.set(c==='moon'?'#405c84':'#764922');};
  }else if(s.id==='books'){
   box(0,.025,0,.76,.045,.48,M.paper,base);const bars=[box(0,.06,-.2,.64,.025,.035,M.walnut,base),box(0,.06,.2,.64,.025,.035,M.walnut,base)];
   change=(c,w)=>{const layout=w?.layout??(c==='sky'?0:1);bars.forEach((o,i)=>{o.position.x=w?(w.x-.5)*.3:0;o.scale.x=w?(1/w.zoom)*(.78+w.density*.42):1;o.rotation.y=(layout-1.5)*(i?-.09:.09);});bars[0].position.z=layout===0?-.22:layout===2?-.06:-.12;bars[1].position.z=layout===0?.22:layout===3?.06:.14;};
  }else{
   ball(0,.19,0,.22,.21,.19,mats[0],base);cyl(0,.38,0,.11,.13,mats[0],base,16);
   const strokes=[];for(let i=0;i<12;i++){const o=box(-.14+(i%4)*.087,.08+Math.floor(i/4)*.09,.183,.05,.012,.012,mats[1],base);strokes.push(o);}
   change=c=>strokes.forEach((o,i)=>{o.rotation.z=c==='flow'?.5+(i%3)*.12:0;o.scale.x=c==='flow'?1.5:1;});
  }
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  const station={shop:s,g,image,texture,change,choice:null,position:localToWorld(s,0,-2)};stations.set(s.id,station);
 }
 function preview(id,choice,work=null){const a=stations.get(id),signature=choice+JSON.stringify(work);if(!a||a.signature===signature)return;a.signature=signature;a.choice=choice;drawStudy(a.image,id,choice,work);a.texture.needsUpdate=true;a.change(choice,work);}
 function restore(id){const s=STUDIES.find(s=>s.id===id);if(s)preview(id,story.choice(id)||s.choices[0].id,story.work(id));}
 for(const s of STUDIES)restore(s.id);
 function update(position){for(const a of stations.values()){const p=worldToLocal(a.shop,position.x,position.z);a.g.visible=p.v<1.8&&p.v>-a.shop.depth-.3&&Math.abs(p.u)<a.shop.width/2+.4;}}
 return {preview,restore,update,stations};
}
