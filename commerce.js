import {shops,localToWorld,worldToLocal,localRect,doorLayout,roomArea,roomContains,shopFixtures,shopWalls} from './layout.js?v=08-en';
import {createDoorState,requestDoorToggle,advanceDoor,doorwayOccupied} from './doors.js?v=08-en';

// Generic imagined businesses. No claim of verified 1888 addresses or shop owners.
export function addCommerce({T,scene,group,mesh,box,cyl,ball,rod,ring,mat,M,labelTexture,colliders,warmLights,onAnchor}) {
  const root=group('06_Commercial_Shells'),moving=group('07_Operable_Doors');
  const rooms=[],doors=[],anchors=[],staticGroups=[root];
  const olive=mat('#536144',null,.8),fruit=mat('#baa55d',null,.78),red=mat('#94483a',null,.8);
  const cloth=mat('#91969a','fabric'),bottle=mat('#334334',null,.28,.15),bread=mat('#d7a963','fabric');
  const roomWall=mat('#d8c7a9','plaster',.9,0,{emissive:'#8d6842',emissiveIntensity:.10});
  const pane=mat('#b1c6be',null,.2,.08,{transparent:true,opacity:.13,depthWrite:false});
  const glazes=[mat('#d6c8aa',null,.32),mat('#698b8d',null,.32),M.terracotta];
  const books=[M.door,M.walnut,red,cloth,M.paper];
  function localGroup(parent,s,name){const g=new T.Group();g.name=name;g.position.set(s.x,.075,s.z);g.rotation.y=s.side==='left'?Math.PI/2:-Math.PI/2;parent.add(g);return g;}
  function label(parent,text,sub,w,h,x,y,z,bg='#293f37'){
    const material=mat('#ffffff',null,.86,0,{map:labelTexture(text,sub,bg)});
    box(x,y,z-.04,w+.10,h+.08,.08,M.walnut,parent);
    mesh(new T.PlaneGeometry(w,h),material,x,y,z+.006,parent);
  }
  function crate(g,x,y,z,w=.6,d=.46){
    box(x,y+.025,z,w,.05,d,M.walnut,g);
    for(const side of [-1,1])for(let k=0;k<3;k++){
      box(x,y+.09+k*.072,z+side*d/2,w,.05,.03,M.wood,g,.004);
      box(x+side*w/2,y+.09+k*.072,z,.03,.05,d,M.wood,g,.004);
    }
  }
  function bottleAt(g,x,y,z){
    cyl(x,y+.13,z,.045,.26,bottle,g,12);ball(x,y+.25,z,.045,.043,.045,bottle,g);
    cyl(x,y+.31,z,.019,.09,bottle,g,10);cyl(x,y+.36,z,.022,.024,M.walnut,g,10);
    cyl(x,y+.14,z,.046,.095,M.paper,g,12);
  }
  function barrel(g,x,y,z){
    const profile=[[.24,0],[.29,.08],[.34,.34],[.34,.48],[.29,.75],[.24,.8]].map(p=>new T.Vector2(...p));
    mesh(new T.LatheGeometry(profile,20),M.wood,x,y,z,g);cyl(x,y+.79,z,.24,.02,M.walnut,g,20);
    for(const [dy,r] of [[.08,.29],[.24,.33],[.59,.32],[.73,.295]])ring(x,y+dy,z,r,.018,M.iron,g);
  }
  function vase(g,x,y,z,k=0,s=.85){
    const p=[[.08,0],[.13,.02],[.18,.17],[.14,.29],[.08,.36],[.095,.40],[.074,.40],[.06,.35],[.12,.17],[.10,.04]].map(([a,b])=>new T.Vector2(a*s,b*s));
    mesh(new T.LatheGeometry(p,14),glazes[k%3],x,y,z,g);
  }
  function bouquet(g,x,y,z,k=0){
    vase(g,x,y,z,k,1);
    for(let i=0;i<6;i++){
      const a=i*2.4,dx=Math.cos(a)*.12,dz=Math.sin(a)*.12,dy=.55+(i%3)*.09;
      rod([x,y+.22,z],[x+dx,y+dy,z+dz],.006,M.leaves,g);
      ball(x+dx*.7,y+.43,z+dz*.7,.065,.017,.03,M.leaves,g);
      ball(x+dx,y+dy,z+dz,.048,.035,.048,i%2?fruit:red,g);
      for(let j=0;j<4;j++)ball(x+dx+Math.cos(j*1.57)*.042,y+dy,z+dz+Math.sin(j*1.57)*.042,.035,.020,.035,i%2?M.paper:red,g);
    }
  }
  function goods(g,type,x,y,z,count=5){
    if(type==='produce'){
      crate(g,x,y,z,1.8,.60);
      for(let i=0;i<15;i++)ball(x-.73+(i%5)*.36,y+.24,z-.16+Math.floor(i/5)*.16,.105,.082,.078,[fruit,red,olive][Math.floor(i/5)],g);
    }else if(type==='wine'){
      for(let i=0;i<count;i++)bottleAt(g,x+(i-(count-1)/2)*.27,y,z);
    }else if(type==='cloth'){
      for(let i=0;i<6;i++)box(x-.52+(i%3)*.52,y+.045+Math.floor(i/3)*.095,z,.46,.09,.42,i%2?cloth:M.fabric,g);
    }else if(type==='bakery'){
      box(x,y+.018,z,1.8,.035,.59,M.wood,g);
      for(let i=0;i<5;i++){
        const bx=x-.70+i*.35;ball(bx,y+.11,z,.125,.09,.24,bread,g);
        for(let j=0;j<3;j++){const cut=box(bx,y+.192,z-.13+j*.12,.13,.006,.013,M.paper,g,.002);cut.rotation.y=-.35;}
      }
    }else if(type==='books'){
      for(let i=0;i<9;i++){
        const bx=x-.78+i*.19,h=.24+(i%3)*.05;box(bx,y+h/2,z,.14,h,.22,books[i%5],g,.004);
        box(bx,y+h/2,z+.112,.09,.026,.004,M.paper,g,.001);
      }
    }else if(type==='florist'){
      for(let i=0;i<4;i++)bouquet(g,x-.66+i*.44,y,z,i);
    }else if(type==='atelier'){
      for(let i=0;i<5;i++)vase(g,x-.7+i*.35,y,z,i,.70+(i%2)*.25);
    }
  }
  function table(g,f,h=.79){
    box(f.u,h,f.v,f.w,.07,f.d,M.wood,g);
    for(const a of [-1,1])for(const b of [-1,1])box(f.u+a*(f.w/2-.07),h/2-.018,f.v+b*(f.d/2-.07),.075,h-.035,.075,M.walnut,g);
    box(f.u,.21,f.v,f.w-.12,.05,f.d-.1,M.walnut,g);
  }
  for(const s of shops){
    const g=localGroup(root,s,s.id+'_facade'),d=doorLayout(s),half=s.width/2;
    const left=-half,dl=d.center-d.width/2,dr=d.center+d.width/2;
    // A real hole: never put a solid building box behind the door or room.
    box((left+dl)/2,1.45,0,dl-left,2.9,.18,M.walnut,g);
    box((dr+half)/2,.36,0,half-dr,.72,.18,M.door,g);
    box((dr+half)/2,2.71,0,half-dr,.38,.18,M.walnut,g);
    box(d.center,2.68,0,d.width,.56,.18,M.walnut,g);
    for(const u of [dl-.04,dr+.04])box(u,1.20,.075,.08,2.40,.18,M.wood,g);
    box(d.center,.012,.18,d.width,.024,.55,M.curb,g,.005);
    const displayX=(dr+half)/2,displayW=half-dr-.16;
    const window=box(displayX,1.60,.015,displayW,1.72,.025,pane,g,.003);window.castShadow=false;
    for(const u of [dr+.04,displayX,half-.045])box(u,1.58,.085,.07,1.80,.12,M.walnut,g);
    for(const y of [.72,2.50])box(displayX,y,.10,displayW,.075,.22,M.wood,g);
    label(g,s.title,s.subtitle,s.width-.22,.54,0,3.05,.19,s.id==='wine'?'#49302b':s.id==='books'?'#26334a':'#293f37');
    const canopyMat=['cloth','books'].includes(s.id)?cloth:M.fabric;
    const canopy=box(0,2.72,.57,s.width+.14,.045,1.12,canopyMat,g,.005);canopy.rotation.x=.18;
    box(0,2.57,1.1,s.width+.14,.17,.025,canopyMat,g,.004);
    for(const u of [-half+.1,half-.1])rod([u,2.04,.16],[u,2.62,1.06],.016,M.iron,g);
    // Visible door handles and hinges are attached to the moving leaf, not the wall.
    const dg=localGroup(moving,s,s.id+'_door_root'),hinge=new T.Group();hinge.position.set(d.hinge,0,0);dg.add(hinge);
    const lw=d.leafWidth,leafCenter=lw/2;
    box(leafCenter,1.17,0,lw,2.30,.075,M.door,hinge);
    for(const y of [.45,1.39,1.99])box(leafCenter,y,.043,lw-.19,y===.45?.62:.37,.025,M.wood,hinge);
    for(const z of [-.085,.085]){cyl(lw-.15,1.06,z,.029,.17,M.brass,hinge,10);ball(lw-.15,1.08,z,.036,.035,.036,M.brass,hinge);}
    for(const y of [.29,1.97])cyl(.01,y,0,.021,.13,M.iron,hinge,10);
    hinge.traverse(o=>{if(o.isMesh)o.castShadow=false;}); // Avoid stale cached static shadows on moving doors.
    const state=createDoorState(s);state.object=hinge;doors.push(state);colliders.push(state.portal,state.leaf,...shopWalls(s));
    // Above-ground shell only; the interior volume is genuinely hollow.
    const facadeMat=s.side==='left'?M.blueDark:s.id==='wine'?M.rose:M.blue;
    box(0,(s.height+3.22)/2,-s.depth/2,s.width+.18,s.height-3.22,s.depth,facadeMat,g,.01);
    box(0,3.40,.1,s.width+.3,.13,.26,M.curb,g);
    box(0,s.height,.07,s.width+.3,.15,.28,M.blueDark,g);
    for(const y of [5.0,7.65])if(y+.88<s.height)for(const u of [-s.width*.27,s.width*.27]){
      box(u,y,.012,.87,1.52,.03,M.black,g);box(u,y-.84,.14,1.12,.13,.35,M.curb,g);
      for(const side of [-1,1]){
        box(u+side*.65,y,.10,.31,1.65,.09,M.shutter,g);
        for(let k=0;k<8;k++)box(u+side*.65,y-.60+k*.17,.157,.25,.09,.02,M.door,g,.003);
      }
      box(u,y,.06,.045,1.5,.06,M.cream,g);
    }
    // Independently batched interiors can be hidden when distant, without losing doors.
    const roomRoot=group('08_Room_'+s.id);staticGroups.push(roomRoot);
    const inside=localGroup(roomRoot,s,s.id+'_interior');
    box(0,-.065,-s.depth/2,s.width,.13,s.depth,M.wood,inside,0);
    for(let u=-half+.14;u<half;u+=.28)box(u,.005,-s.depth/2,.269,.015,s.depth-.06,M.wood,inside,.002);
    box(0,3.12,-s.depth/2,s.width,.16,s.depth,roomWall,inside,0);
    box(0,1.54,-s.depth,s.width,3.08,.20,roomWall,inside);
    for(const u of [-half,half]){
      box(u,1.54,-s.depth/2,.20,3.08,s.depth,roomWall,inside);
      box(u+(u<0?.11:-.11),.19,-s.depth/2,.055,.36,s.depth,M.walnut,inside);
    }
    box(0,.19,-s.depth+.12,s.width,.36,.055,M.walnut,inside);
    const fixtures=shopFixtures(s);for(const f of fixtures)colliders.push(localRect(s,f.u,f.v,f.w,f.d));
    const outside=fixtures[0];table(g,outside);goods(g,s.id,outside.u,.83,outside.v);
    const counter=fixtures[1];table(inside,counter);// Live observation objects are added by studies.js.
    const shelf=fixtures[2];
    for(const v of [shelf.v-shelf.d/2,shelf.v+shelf.d/2])box(shelf.u,1.1,v,.47,2.2,.07,M.walnut,inside);
    for(const y of [.30,.94,1.58,2.19])box(shelf.u,y,shelf.v,.48,.055,shelf.d,M.wood,inside);
    // Display goods on shelves in a rotated local group facing the open aisle.
    const shelfGoods=new T.Group();shelfGoods.position.set(shelf.u,0,shelf.v);shelfGoods.rotation.y=-Math.PI/2;inside.add(shelfGoods);
    for(const y of [.33,.97,1.61])goods(shelfGoods,s.id,0,y,0,7);
    if(s.id==='wine')barrel(inside,-half+.5,0,-s.depth+.55);
    if(s.id==='bakery'){
      // A closed oven silhouette on the back wall, outside the entry path.
      box(-half+.57,.77,-s.depth+.19,.87,1.54,.26,M.stone,inside);
      box(-half+.57,.89,-s.depth+.335,.57,.48,.035,M.black,inside);
      box(-half+.57,.70,-s.depth+.36,.59,.055,.11,M.iron,inside);
    }
    // Stable invisible interaction anchor and a modest in-world plaque.
    const anchor=new T.Object3D();anchor.name=s.id+':counter';anchor.position.set(counter.u,1.0,counter.v+.8);anchor.userData={shopId:s.id,anchorId:anchor.name,kind:'art-study'};inside.add(anchor);
    label(inside,s.title,'OBSERVER / CHOISIR / PEINDRE',1.45,.25,.28,2.68,-s.depth+.115);
    const ap=localToWorld(s,counter.u,counter.v+.8);anchors.push({id:anchor.name,shopId:s.id,label:s.anchorLabel,shop:s,...ap});
    const entry=new T.Object3D();entry.name=s.id+':entry';entry.position.set(d.center,0,-.55);inside.add(entry);
    // One fixture per room, but only two pooled non-shadow lights for all seven rooms.
    rod([0,3.02,-1.8],[0,2.59,-1.8],.015,M.iron,inside);
    cyl(0,2.59,-1.8,.18,.05,M.iron,inside,14);ball(0,2.49,-1.8,.085,.105,.085,M.glow,inside);
    rooms.push({shop:s,root:roomRoot,lightPosition:{...localToWorld(s,0,-1.8),y:2.55}});
  }
  const lightPool=Array.from({length:2},()=>{const light=new T.PointLight('#f3cc99',0,7,2);scene.add(light);const entry={light,intensity:0};warmLights.push(entry);return entry;});
  let currentShop=null,nearestAction=null;
  function update(position,dt,lightsOn){
    for(const d of doors){if(d.target===0&&d.progress>0&&doorwayOccupied(d,position))d.target=1;advanceDoor(d,dt);d.object.rotation.y=d.progress*Math.PI/2;}
    const room=rooms.find(r=>roomContains(r.shop,position));
    const id=room?.shop.id??null;
    if(id!==currentShop){
      if(currentShop)window.dispatchEvent(new CustomEvent('cafe:shop-exit',{detail:{shopId:currentShop}}));
      currentShop=id;
      if(id)window.dispatchEvent(new CustomEvent('cafe:shop-enter',{detail:{shopId:id}}));
    }
    const ranked=rooms.map(r=>({r,dist:Math.hypot(r.shop.x-position.x,r.shop.z-position.z)})).sort((a,b)=>a.dist-b.dist);
    for(const {r,dist} of ranked)r.root.visible=r.shop.id===id||dist<11;
    const lit=ranked.filter(q=>q.r.shop.id===id||q.dist<8).sort((a,b)=>(b.r.shop.id===id)-(a.r.shop.id===id)||a.dist-b.dist).slice(0,2);
    for(let i=0;i<lightPool.length;i++){const p=lightPool[i],r=lit[i]?.r;p.intensity=r?17:0;p.light.intensity=lightsOn?p.intensity:0;if(r)p.light.position.set(r.lightPosition.x,r.lightPosition.y,r.lightPosition.z);}
    nearestAction=null;let best=Infinity;
    for(const door of doors){
      const p=worldToLocal(door.shop,position.x,position.z),distance=Math.hypot(p.u-door.layout.center,p.v);
      if(distance<2.1&&Math.abs(p.u-door.layout.center)<.95&&Math.abs(p.v)<1.95&&distance<best){best=distance;nearestAction={kind:'door',door,label:`${door.target?'Close door':'Open door'} · ${door.shop.label}`};}
    }
    const anchor=anchors.find(a=>a.shopId===id&&Math.hypot(a.x-position.x,a.z-position.z)<1.1);
    if(anchor)nearestAction={kind:'anchor',anchor,label:`Create · ${anchor.shop.label}`};
    return {currentShop:id,currentLabel:room?.shop.label??null,action:nearestAction};
  }
  function interact(position){
    if(!nearestAction)return 'Approach a shop door and press E to open it, then move to the counter to create.';
    if(nearestAction.kind==='door'){
      const d=nearestAction.door;
      if(!requestDoorToggle(d,position))return 'Step away from the door so it can open or close.';
      window.dispatchEvent(new CustomEvent('cafe:door-change',{detail:{shopId:d.shop.id,open:!!d.target}}));
      return `${d.shop.label} · ${d.target?'Opening':'Closing'}`;
    }
    const a=nearestAction.anchor;
    window.dispatchEvent(new CustomEvent('cafe:interact',{detail:{shopId:a.shopId,anchorId:a.id}}));
    const result=onAnchor?.(a.shopId);
    return result?.message??null;
  }
  return {root,staticGroups,doors,rooms,anchors,walkableAreas:shops.map(roomArea),shopCount:shops.length,update,interact};
}
