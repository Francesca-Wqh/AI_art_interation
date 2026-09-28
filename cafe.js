import {cafeShop,cafeRoom,cafeAnchor,createCafeDoorState,cafeRoomContains,requestCafeDoorToggle,advanceCafeDoor} from './cafe-door.js?v=08';
import {doorLayout,worldToLocal} from './layout.js?v=08';

export function addCafe({T,scene,group,mesh,box,cyl,ball,rod,mat,M,labelTexture,colliders,warmLights}){
 const root=group('09_Cafe_Interior'),moving=group('10_Cafe_Moving'),art=group('11_Cafe_Painting');
 function local(parent){const g=new T.Group();g.position.set(cafeShop.x,.16,cafeShop.z);g.rotation.y=Math.PI/2;parent.add(g);return g;}
 const g=local(root),mg=local(moving),ag=local(art),d=doorLayout(cafeShop),half=cafeShop.width/2;
 const wall=mat('#d5b788','plaster',.9,0,{emissive:'#735939',emissiveIntensity:.10});
 box(0,-.07,-1.65,2.9,.14,3.3,M.walnut,g,0);
 for(let u=-1.30;u<half;u+=.25)box(u,.005,-1.65,.241,.016,3.24,M.wood,g,.002);
 box(0,3.38,-1.65,2.9,.16,3.3,wall,g);
 box(0,1.67,-3.3,2.9,3.34,.18,wall,g);
 for(const u of [-half,half]){box(u,1.67,-1.65,.18,3.34,3.3,wall,g);box(u,.13,-1.65,.21,.26,3.3,M.walnut,g);}
 // Fill only the sides of the arch at walking height, never the open portal.
 for(const sign of [-1,1])box(sign*.89,1.18,0,.34,2.36,.14,M.door,g);
 box(0,2.65,0,1.98,.56,.12,M.door,g);
 // A street-facing, unlit plaque stays legible under the awning without extra lights.
 const welcome=new T.MeshBasicMaterial({map:labelTexture('咖啡馆 · 入口','CAFÉ / ENTRÉE · 靠近按 E 开门','#efdeb5','#253c39'),toneMapped:false});
 const sign=mesh(new T.PlaneGeometry(1.72,.43),welcome,0,2.65,.20,g);
 sign.name='Cafe_Entrance_Sign';sign.castShadow=false;sign.receiveShadow=false;
 // Cream jambs sit outside the clear opening; the moving leaf and collision stay unchanged.
 for(const u of [-d.width/2-.05,d.width/2+.05]){const jamb=box(u,1.2,.06,.10,2.4,.2,M.cream,g);jamb.name='Cafe_Entrance_Jamb';}
 box(0,2.40,.06,d.width+.20,.10,.2,M.cream,g);
 const entryWood=mat('#aa7946','wood',.78),entryPanel=mat('#bc905b','wood',.82);
 const hinge=new T.Group();hinge.position.set(d.hinge,0,0);mg.add(hinge);
 box(d.leafWidth/2,1.17,0,d.leafWidth,2.30,.07,entryWood,hinge);
 for(const y of [.50,1.44,2.0])box(d.leafWidth/2,y,.042,d.leafWidth-.17,y===.5?.69:.36,.024,entryPanel,hinge);
 for(const z of [-.09,.09]){cyl(d.leafWidth-.14,1.13,z,.028,.14,M.brass,hinge,10);ball(d.leafWidth-.14,1.16,z,.036,.036,.036,M.brass,hinge);}
 for(const y of [.26,1.98])cyl(.005,y,0,.02,.14,M.iron,hinge,10);
 hinge.traverse(o=>{if(o.isMesh)o.castShadow=false;});
 const door=createCafeDoorState();colliders.push(door.portal,door.leaf);
 // A narrow counter and book cupboard leave a 1.7m approach to the easel.
 box(.66,.92,-2.85,1.2,.08,.5,M.wood,g);
 for(const u of [.16,1.16])box(u,.45,-2.85,.07,.90,.4,M.walnut,g);
 box(.5,.983,-2.78,.36,.035,.28,M.paper,g);
 for(const y of [.38,1.02,1.66,2.3])box(-1.11,y,-2,.38,.05,1.55,M.wood,g);
 for(const y of [.42,1.06,1.70])for(let i=0;i<6;i++)box(-1.1,y+.16,-2.6+i*.23,.20,.30,.15,i%2?M.paper:M.door,g);
 rod([0,3.30,-1.1],[0,2.80,-1.1],.015,M.iron,g);ball(0,2.71,-1.1,.09,.14,.09,M.glow,g);
 const roomLight=new T.PointLight('#f5d39b',0,5,2);roomLight.position.set(-5.5,2.7,2.1);scene.add(roomLight);
 const entry={light:roomLight,intensity:0};warmLights.push(entry);
 // This canvas is deliberately dynamic and excluded from static batching.
 const image=document.createElement('canvas');image.width=1000;image.height=760;
 const texture=new T.CanvasTexture(image);texture.colorSpace=T.SRGBColorSpace;
 const paintingMaterial=new T.MeshBasicMaterial({map:texture,toneMapped:false});
 // Slim wooden easel legs support the canvas without narrowing the approach.
 for(const u of [-.42,.78])rod([u,.02,-2.94],[u*.72+.05,2.54,-3.16],.027,M.wood,g);
 box(.18,1.12,-3.00,1.83,.065,.24,M.wood,g);
 box(.18,1.78,-3.12,1.72,1.34,.08,M.walnut,g);
 const painting=mesh(new T.PlaneGeometry(1.6,1.22),paintingMaterial,.18,1.78,-3.06,ag);painting.castShadow=false;
 let action=null,inside=false;
 function update(position,dt,lightsOn,story){
  if(door.target===0&&door.progress>0){const p=worldToLocal(cafeShop,position.x,position.z);if(p.u>d.hinge-.27&&p.u<d.hinge+d.width+.27&&p.v<.4&&p.v> -d.width-.3)door.target=1;}
  advanceCafeDoor(door,dt);hinge.rotation.y=door.progress*Math.PI/2;inside=cafeRoomContains(position);
  entry.intensity=Math.hypot(position.x+5.5,position.z-2.1)<7?21:0;roomLight.intensity=lightsOn?entry.intensity:0;
  action=null;const p=worldToLocal(cafeShop,position.x,position.z);
  if(Math.hypot(p.u,p.v)<2.1&&Math.abs(p.u)<.95)action={kind:'cafe-door',label:`${door.target?'关门':'开门'} · 咖啡馆`};
  if(inside&&Math.hypot(position.x-cafeAnchor.x,position.z-cafeAnchor.z)<1.30)action={kind:'cafe-story',label:!story.started?'领取夜色手记':story.finished?'查看我的夜景':story.canFinish?'完成我的夜景':'翻开夜色手记'};
  return {inside,action};
 }
 function interact(position){if(action?.kind==='cafe-door'){if(!requestCafeDoorToggle(door,position))return '请先离开门扇活动区域，再开关门。';window.dispatchEvent(new CustomEvent('cafe:door-change',{detail:{shopId:'cafe',open:!!door.target}}));return `咖啡馆 · 正在${door.target?'开门':'关门'}`;}return null;}
 return {staticGroups:[root],walkableAreas:[cafeRoom],door,update,interact,image,texture,anchor:cafeAnchor};
}
