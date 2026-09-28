import * as T from 'three';
import { advancePosition } from './navigation.js?v=08';
import { tablePositions, seatsForTable, tabletop, shops, localToWorld, doorLayout } from './layout.js?v=08';
import { addCommerce } from './commerce.js?v=08';
import { addCafe } from './cafe.js?v=08-entry';
import { createNightPalette, STORAGE_KEY } from './interactions.js?v=08';
import { addStudies } from './studies.js?v=08';
import { createStoryUI } from './story-ui.js?v=08-entry';
import { cafeBuildingColliders, cafeShop } from './cafe-door.js?v=08';
// A deliberately small, offline, art-directed material study. All assets are procedural.
const $=id=>document.getElementById(id), canvas=$('scene');
let seed=18880918;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const rand=(a,b)=>a+(b-a)*rnd(),pick=a=>a[Math.floor(rnd()*a.length)];
const scene=new T.Scene();scene.background=new T.Color('#172b49');scene.fog=new T.FogExp2('#253a55',.022);
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});}catch(e){$('load-message').textContent='WebGL2 初始化失败；请使用支持硬件加速的浏览器。';throw e;}
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.info.autoReset=false;
const camera=new T.PerspectiveCamera(53,1,.07,90), world=new T.Group();world.name='Cafe_Le_Soir_Detail_Study';scene.add(world);
const colliders=[],warmLights=[],sharedGeometries=new Map();
function hash(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,period){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),h=(a,b)=>hash(((a%period)+period)%period,((b%period)+period)%period);return T.MathUtils.lerp(T.MathUtils.lerp(h(ix,iy),h(ix+1,iy),u),T.MathUtils.lerp(h(ix,iy+1),h(ix+1,iy+1),u),v);}
function surface(kind,size=512){
 const al=document.createElement('canvas'),he=document.createElement('canvas'),ro=document.createElement('canvas');for(const c of [al,he,ro])c.width=c.height=size;
 const ac=al.getContext('2d'),hc=he.getContext('2d'),rc=ro.getContext('2d'),ai=ac.createImageData(size,size),hi=hc.createImageData(size,size),ri=rc.createImageData(size,size);
 const bases={plaster:[192,151,83],stone:[141,137,121],wood:[126,90,52],fabric:[164,125,58],blue:[76,89,111],marble:[210,201,171],leaf:[70,85,46]};const base=bases[kind];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const u=x/size,v=y/size,n1=noise(u*8,v*8,8),n2=noise(u*32,v*32,32),n3=noise(u*128,v*128,128),grain=hash(x,y),n=n1*.45+n2*.32+n3*.23;let h=n,t=(n-.5)*36,r=.85;
 if(kind==='plaster'){h=n*.6+grain*.12;t=(n-.5)*44+(grain-.5)*9;r=.9;}
 if(kind==='stone'){const pits=grain>.97?.19:0;h=n*.63+grain*.08-pits;t=(n-.5)*46-pits*45;r=.82;}
 if(kind==='wood'){const grainline=Math.sin(u*220+noise(u*5,v*3,15)*12+Math.sin(v*6.283)*2);h=grainline*.1+n*.45;t=grainline*10+(n-.5)*33;r=.52+n*.2;}
 if(kind==='fabric'){h=(Math.sin(x*Math.PI)*Math.sin(y*Math.PI))*.04+grain*.2+n*.3;t=(n-.5)*28+((x%3===0||y%3===0)?-8:0);r=.92;}
 if(kind==='marble'){const vein=Math.pow(Math.abs(Math.sin(u*16+v*10+n1*6)),25);t=(n-.5)*17-vein*41;h=n*.08;r=.25+vein*.15;}
 if(kind==='blue'){h=n*.6+grain*.1;t=(n-.5)*31;r=.86;}
 if(kind==='leaf'){h=n*.5;t=(n-.5)*25;}
 const k=(y*size+x)*4;for(let j=0;j<3;j++){ai.data[k+j]=Math.max(0,Math.min(255,base[j]+t));hi.data[k+j]=T.MathUtils.clamp(h*255,0,255);ri.data[k+j]=r*255;}ai.data[k+3]=hi.data[k+3]=ri.data[k+3]=255;
 }
 ac.putImageData(ai,0,0);hc.putImageData(hi,0,0);rc.putImageData(ri,0,0);
 // Hairline weathering, grain and tiny chipped patches, attached to UVs rather than screen.
 if(kind==='plaster'||kind==='blue'){for(let i=0;i<100;i++){const x=rand(0,size),y=rand(0,size);ac.strokeStyle='rgba(74,60,46,.10)';ac.lineWidth=rand(.3,1.2);ac.beginPath();ac.moveTo(x,y);ac.lineTo(x+rand(-3,3),y+rand(2,18));ac.stroke();}}
 if(kind==='wood'){for(let i=0;i<200;i++){let x=rand(0,size);ac.strokeStyle='rgba(22,13,7,.14)';ac.lineWidth=rand(.3,1.3);ac.beginPath();ac.moveTo(x,0);ac.bezierCurveTo(x+2,size*.3,x-2,size*.7,x,size);ac.stroke();}}
 const tx=c=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};const map=tx(al);map.colorSpace=T.SRGBColorSpace;return {map,bumpMap:tx(he),roughnessMap:tx(ro)};
}
const tex={};for(const k of ['plaster','stone','wood','fabric','blue','marble','leaf'])tex[k]=surface(k,k==='plaster'?1024:512);
function mat(color,kind,roughness=.85,metalness=0,extra={}){return new T.MeshStandardMaterial({color,roughness,metalness,...(kind?tex[kind]:{}),bumpScale:kind==='stone'?.022:.012,...extra});}
const M={
 plaster:mat('#ffe3a5','plaster'),worn:mat('#c1b295','plaster'),stone:mat('#d2ccbc','stone'),curb:mat('#eee0ba','stone'),
 blue:mat('#a7b5ce','blue'),blueDark:mat('#63758b','blue'),rose:mat('#ad8e8a','blue'),cream:mat('#edcc86','plaster'),
 wood:mat('#e6c196','wood',.7),walnut:mat('#86694d','wood',.75),door:mat('#566c59',null,.7,0,{bumpMap:tex.wood.bumpMap,bumpScale:.007}),shutter:mat('#465b56',null,.8,0,{bumpMap:tex.wood.bumpMap,bumpScale:.009}),
 iron:mat('#242c2e',null,.48,.65),brass:mat('#c9974e',null,.31,.75),edge:mat('#d7b47b',null,.72),
 marble:mat('#fff1d6','marble',.45),ceramic:mat('#efe2c3',null,.24),coffee:mat('#241207',null,.17),
 fabric:mat('#ffe1a1','fabric'),leaves:mat('#9daf72','leaf'),soil:mat('#30271e','stone'),terracotta:mat('#a76b47','stone'),
 inside:mat('#876038','wood'),glass:mat('#dfdac7',null,.14,.06,{transparent:true,opacity:.30,depthWrite:false}),wine:mat('#52252b',null,.24),black:mat('#111b20',null,.9),paper:mat('#e4d5b7',null,.92),
 glow:mat('#ffe3a0',null,.26,0,{emissive:'#ffb74b',emissiveIntensity:3.2}),window:mat('#b88d50',null,.75,0,{emissive:'#c98137',emissiveIntensity:.35})
};
// Low-cost reflection environment: blue sky plus warm architectural light panels.
const ec=document.createElement('canvas');ec.width=512;ec.height=256;const ectx=ec.getContext('2d'),eg=ectx.createLinearGradient(0,0,0,256);eg.addColorStop(0,'#5f7dab');eg.addColorStop(.48,'#445774');eg.addColorStop(.55,'#8a7355');eg.addColorStop(1,'#242727');ectx.fillStyle=eg;ectx.fillRect(0,0,512,256);ectx.filter='blur(12px)';ectx.fillStyle='#f1c77d';ectx.fillRect(74,90,55,60);ectx.fillRect(265,99,35,40);
const et=new T.CanvasTexture(ec);et.mapping=T.EquirectangularReflectionMapping;et.colorSpace=T.SRGBColorSpace;const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromEquirectangular(et);scene.environment=env.texture;scene.environmentIntensity=.46;et.dispose();pmrem.dispose();
function group(name){const g=new T.Group();g.name=name;world.add(g);return g;}
function mesh(geo,material,x=0,y=0,z=0,parent=world){const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function rounded(w,h,d,r=.025){const key=[w,h,d,r].join('/');if(sharedGeometries.has(key))return sharedGeometries.get(key);const g=new T.BoxGeometry(w,h,d,r?3:1,r?3:1,r?3:1),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;const v=new T.Vector3(),c=new T.Vector3();r=Math.min(r,w*.24,h*.24,d*.24);
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);if(r){c.set(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));v.sub(c).normalize().multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z);}const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,nx>.5?v.z:v.x,ny>.5?v.z:v.y);}g.computeVertexNormals();sharedGeometries.set(key,g);return g;}
function box(x,y,z,w,h,d,m,parent=world,r=.018){return mesh(rounded(w,h,d,r),m,x,y,z,parent);}
const sphereGeo=new T.SphereGeometry(1,16,10),cylGeo=new T.CylinderGeometry(1,1,1,16);
function ball(x,y,z,sx,sy,sz,m,parent=world){const o=mesh(sphereGeo,m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;}
function cyl(x,y,z,r,h,m,parent=world,segments=20){const o=mesh(segments===16?cylGeo:new T.CylinderGeometry(r,r,h,segments),m,x,y,z,parent);if(segments===16)o.scale.set(r,h,r);return o;}
function rod(a,b,r,m,parent=world){const v=new T.Vector3(...a),w=new T.Vector3(...b),o=mesh(cylGeo,m,...v.clone().add(w).multiplyScalar(.5).toArray(),parent);o.scale.set(r,v.distanceTo(w),r);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),w.sub(v).normalize());return o;}
function tube(points,r,m,parent=world,segments=32){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,6,false),m,0,0,0,parent);}
function ring(x,y,z,r,t,m,parent=world){const o=mesh(new T.TorusGeometry(r,t,7,32),m,x,y,z,parent);o.rotation.x=Math.PI/2;return o;}
function collider(x,z,w,d){colliders.push({x,z,w,d});}
const architecture=group('01_Limewash_Masonry'),furniture=group('02_Bentwood_Marble'),details=group('03_Handcrafted_Details'),street=group('04_Street'),backdrop=group('05_Surroundings');
// Stone pavement: individually beveled setts, slight subsidence, close-grained bump maps.
box(0,-.11,-7,18,.2,46,M.soil,street,0);
const stones=[];for(let row=0;row<94;row++)for(let col=0;col<25;col++){const x=-4+col*.40+(row%2)*.2,z=8-row*.38;stones.push({x:x+rand(-.01,.01),z:z+rand(-.01,.01),y:rand(-.009,.006),c:rand(.80,1.04),sy:rand(.94,1.06)});}
const cobbleGeo=rounded(.378,.12,.348,.035),cobbles=new T.InstancedMesh(cobbleGeo,M.stone,stones.length);cobbles.name='Weathered_setts';cobbles.castShadow=false;cobbles.receiveShadow=true;const dm=new T.Object3D(),color=new T.Color();stones.forEach((s,i)=>{dm.position.set(s.x,s.y,s.z);dm.rotation.y=rand(-.035,.035);dm.scale.set(rand(.97,1.02),s.sy,rand(.97,1.02));dm.updateMatrix();cobbles.setMatrixAt(i,dm.matrix);color.setRGB(s.c,s.c*.975,s.c*.93);cobbles.setColorAt(i,color);});world.add(cobbles);
// Terrace slabs, curb joints and recessed drain.
box(-2.62,.045,-3.0,3.2,.15,15,M.stone,street,0);
for(let z=4.15;z>-11;z-=.8){box(-.97,.11,z,.25,.23,.776,M.curb,street,.027);for(let x of [-3.45,-2.7,-1.95])box(x,.132,z,.738,.07,.776,M.curb,street,.018);}
for(let z=4;z>-11;z-=.6){box(-.68,.061,z,.14,.016,.55,M.iron,street,.004);for(let k=0;k<5;k++)box(-.68,.073,z-.20+k*.10,.16,.012,.025,M.stone,street,.003);}
// Four real arched recesses. No flat pictures on the storefront.
const faceX=-4.08, bays=[2.1,-1.25,-4.6,-7.95];
function archShape(w,h,bottom=0){const s=new T.Shape();s.moveTo(-w/2,bottom);s.lineTo(w/2,bottom);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,bottom);return s;}
function archObject(shape,depth,m,x,z,parent=architecture){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});const o=mesh(g,m,x,0,z,parent);o.rotation.y=Math.PI/2;return o;}
for(const [i,z] of bays.entries()){
 const wall=new T.Shape();wall.moveTo(-1.675,0);wall.lineTo(1.675,0);wall.lineTo(1.675,4.3);wall.lineTo(-1.675,4.3);wall.closePath();wall.holes.push(archShape(2.0,3.10,.19));archObject(wall,.39,M.plaster,faceX-.35,z);
 const border=archShape(2.25,3.27,.14);border.holes.push(archShape(2.0,3.10,.18));archObject(border,.12,M.cream,faceX+.04,z);
 if(i===0)continue; // Actual door and open room are built by cafe.js.
 const inner=archShape(1.98,3.09,.22);const glazing=new T.MeshStandardMaterial({color:'#a8b7aa',roughness:.16,metalness:.2,transparent:true,opacity:.10,depthWrite:false,side:T.DoubleSide});const pane=archObject(inner,.008,glazing,faceX-.27,z);pane.castShadow=false;
 // Recess, frame, transom, beveled lower panels, brass hardware.
 for(const s of [-1,1]){box(faceX-.01,1.21,z+s*.935,.18,2.08,.07,M.door,architecture);box(faceX+.05,.65,z+s*.465,.15,.87,.82,M.door,architecture);box(faceX+.135,.65,z+s*.465,.016,.69,.66,M.walnut,architecture);}
 box(faceX+.03,1.52,z,.16,2.64,.065,M.door,architecture);box(faceX+.035,2.12,z,.16,.08,1.9,M.door,architecture);
 for(const dz of [-.62,-.31,.31,.62])box(faceX-.03,2.65,z+dz,.075,.48,.025,M.door,architecture,.004);
 for(const dz of [-.12,.12]){box(faceX+.16,1.2,z+dz,.02,.23,.055,M.brass,details,.009);rod([faceX+.20,1.13,z+dz],[faceX+.20,1.28,z+dz],.018,M.brass,details);}
 box(faceX+.22,.18,z,.6,.14,2.27,M.curb,architecture,.025);
 // Visible lit interior alcove through upper glazed opening: shelf, bottles, hanging globe.
 box(-5.78,1.74,z,.14,3.10,2.04,M.inside,architecture);
 box(-5.00,.21,z,1.65,.07,1.97,M.walnut,architecture);
 for(const dz of [-1.01,1.01])box(-5.0,1.74,z+dz,1.63,3.1,.09,M.inside,architecture);
 box(-5.45,1.14,z,.55,.07,1.89,M.walnut,details);
 box(-5.57,2.02,z,.28,.06,1.89,M.walnut,details);
 for(let j=0;j<7;j++){const bz=z-.76+j*.24;cyl(-5.50,2.18,bz,.045,.25,j%2?M.door:M.brass,details,12);cyl(-5.50,2.34,bz,.018,.08,M.door,details,10);}
 rod([-5.10,3.10,z],[-5.10,2.65,z],.012,M.iron,details);ball(-5.10,2.55,z,.105,.14,.105,M.glow,details);
 box(faceX-.20,1.66,z,.028,.075,1.73,M.walnut,details);
 for(let j=0;j<6;j++){const bz=z-.7+j*.26;const bottleMat=j%2?M.door:M.brass;cyl(faceX-.13,1.82,bz,.037,.23,bottleMat,details,12);cyl(faceX-.13,1.97,bz,.016,.075,bottleMat,details,10);}
 // Small warm panel at the back of the room, behind shelf geometry.
 box(-5.695,1.66,z,.02,.50,1.73,M.window,details,.005);
}
// Solid building above arches, string courses, chipped foundation and return wall.
box(-5.95,5.6,-2.92,3.45,3.2,13.5,M.plaster,architecture,.015);box(-5.95,1.9,4.01,3.7,3.8,.31,M.plaster,architecture);
box(-3.96,3.83,-2.92,.45,.20,13.75,M.cream,architecture);box(-3.98,4.17,-2.92,.32,.11,13.7,M.curb,architecture);box(-3.94,7.23,-2.92,.45,.18,13.8,M.cream,architecture);
for(let z=3.6;z>-9.65;z-=.43){if(z>1.30&&z<2.90)continue;box(-3.97,.33,z,.12,rand(.24,.47),.39,M.worn,details,.013);}
colliders.push(...cafeBuildingColliders);
function shutters(x,y,z,parent=architecture,material=M.shutter){
 box(x,y,z,.035,1.64,.98,M.black,parent);box(x+.08,y-.89,z,.36,.14,1.38,M.curb,parent);
 for(const side of [-1,1]){const sz=z+side*.78;box(x+.08,y,sz,.095,1.81,.46,material,parent);for(let k=0;k<12;k++){const o=box(x+.15,y-.72+k*.13,sz,.07,.082,.37,material,parent,.004);o.rotation.z=-.16;}for(const dy of [-.7,.7])box(x+.18,y+dy,sz,.03,.04,.43,M.iron,parent,.004);}
 box(x+.04,y,z,.06,1.57,.044,M.cream,parent);box(x+.04,y+.06,z,.06,.048,.93,M.cream,parent);
}
for(const z of bays)shutters(-4.17,5.69,z);
// Roof edge with individually overlapped curved clay tiles, gutter and drain pipe.
for(let z=3.75;z>-9.7;z-=.23){const o=mesh(new T.CylinderGeometry(.135,.135,.45,10,1,true,0,Math.PI),M.terracotta,-4.04,7.4,z,details);o.rotation.x=Math.PI/2;}
rod([-3.87,7.28,3.85],[-3.87,.25,3.85],.055,M.iron,details);for(let y=1;y<7;y+=1.4)box(-3.91,y,3.85,.16,.04,.16,M.iron,details,.008);
// Sloped canvas canopy with seams and a scalloped hem, built as true geometry.
const awning=new T.BufferGeometry(),ap=[],au=[],indices=[];const nz=96,nx=8;
for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/nz,x=-4.12+2.57*u,z=4.02-13.8*v,y=3.75-.44*u+Math.sin(v*Math.PI*32)*.016-u*(1-u)*.055;ap.push(x,y,z);au.push(u*1.2,v*6);}
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d);}awning.setAttribute('position',new T.Float32BufferAttribute(ap,3));awning.setAttribute('uv',new T.Float32BufferAttribute(au,2));awning.setIndex(indices);awning.computeVertexNormals();const fabric=M.fabric.clone();fabric.side=T.DoubleSide;mesh(awning,fabric,0,0,0,architecture);
for(let z=3.80;z>-9.7;z-=.43){const valance=new T.Shape();valance.moveTo(-.215,3.33);valance.lineTo(.215,3.33);valance.lineTo(.215,3.15);valance.bezierCurveTo(.15,3.03,-.15,3.03,-.215,3.15);valance.closePath();archObject(valance,.018,fabric,-1.535,z,details);}
for(const z of [3.93,-2.92,-9.74]){rod([-1.54,.15,z],[-1.54,3.37,z],.033,M.iron,details);cyl(-1.54,.27,z,.065,.18,M.iron,details,12);rod([-4.04,3.68,z],[-1.54,3.33,z],.024,M.iron,details);tube([[-1.54,2.86,z],[-1.77,3.1,z],[-2.13,3.18,z],[-2.28,3.15,z]],.019,M.iron,details);collider(-1.54,z,.10,.10);}
rod([-1.54,3.31,4],[-1.54,3.31,-9.8],.032,M.iron,details);
// Fine painted lettering and a real hanging sign.
function labelTexture(text,sub,bg='#172c29',fg='#ddc795',w=1024,h=256){const c=document.createElement('canvas');c.width=w;c.height=h;const ct=c.getContext('2d');ct.fillStyle=bg;ct.fillRect(0,0,w,h);ct.strokeStyle=fg;ct.lineWidth=2;ct.strokeRect(14,14,w-28,h-28);ct.textAlign='center';ct.fillStyle=fg;ct.font=`${h*.27}px Georgia`;ct.fillText(text,w/2,h*.49);ct.font=`${h*.09}px Georgia`;ct.fillText(sub,w/2,h*.76);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
const signTex=labelTexture('CAFÉ · LE SOIR','CAFÉ  —  VIN  —  CONVERSATION');const signMat=mat('#ffffff',null,.8,0,{map:signTex});const sign=mesh(new T.PlaneGeometry(2.64,.68),signMat,-3.772,4.46,.43,details);sign.rotation.y=Math.PI/2;
box(-3.84,4.46,.43,.1,.75,2.74,M.walnut,details);
// Thonet-inspired bentwood chairs with curved rails, woven seats and joint collars.
const weave=document.createElement('canvas');weave.width=weave.height=256;const wc=weave.getContext('2d');wc.fillStyle='#8d6937';wc.fillRect(0,0,256,256);for(let i=0;i<256;i+=8){wc.strokeStyle=i%16?'#b69351':'#614a2d';wc.lineWidth=3;wc.beginPath();wc.moveTo(i,0);wc.lineTo(i,256);wc.moveTo(0,i);wc.lineTo(256,i);wc.stroke();}const wt=new T.CanvasTexture(weave);wt.colorSpace=T.SRGBColorSpace;const wicker=mat('#e5c487',null,.82,0,{map:wt});
function chair(x,z,a){const g=new T.Group();g.position.set(x,.165,z);g.rotation.y=a;g.name="Chair_front_plus_Z";furniture.add(g);cyl(0,.46,0,.215,.055,M.wood,g,24);cyl(0,.491,0,.187,.008,wicker,g,32);ring(0,.465,0,.22,.018,M.walnut,g);
 for(const sx of [-1,1])for(const sz of [-1,1]){tube([[sx*.21,.015,sz*.205],[sx*.18,.25,sz*.17],[sx*.15,.47,sz*.13]],.018,M.wood,g,10);cyl(sx*.17,.34,sz*.16,.022,.035,M.brass,g,10);}
 ring(0,.19,0,.18,.012,M.wood,g);
 tube([[-.17,.43,-.14],[-.215,.79,-.2],[-.17,1.03,-.21],[0,1.09,-.22],[.17,1.03,-.21],[.215,.79,-.2],[.17,.43,-.14]],.022,M.wood,g,36);
 tube([[-.13,.54,-.16],[-.10,.84,-.20],[0,.93,-.21],[.10,.84,-.20],[.13,.54,-.16]],.015,M.wood,g,26);
 const footprint=.47*(Math.abs(Math.cos(a))+Math.abs(Math.sin(a)));collider(x,z,footprint,footprint);
}
function cup(x,y,z,rot=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=rot;details.add(g);const profile=[[0,0],[.052,0],[.067,.008],[.075,.026],[.077,.038],[.071,.043],[.047,.044],[.046,.045]].map(v=>new T.Vector2(...v));mesh(new T.LatheGeometry(profile,28),M.ceramic,0,0,0,g);const cprof=[[.026,.032],[.029,.037],[.033,.058],[.037,.096],[.036,.103],[.032,.103],[.03,.093],[.023,.046]].map(v=>new T.Vector2(...v));mesh(new T.LatheGeometry(cprof,28),M.ceramic,0,0,0,g);cyl(0,.092,0,.029,.002,M.coffee,g,24);const h=mesh(new T.TorusGeometry(.023,.006,8,18,Math.PI*1.5),M.ceramic,.04,.074,0,g);h.rotation.z=-Math.PI*.75;rod([-.046,.046,-.008],[-.095,.042,-.037],.003,M.brass,g);ball(-.098,.044,-.038,.01,.003,.006,M.brass,g);}
function wineglass(x,y,z){cyl(x,y+.004,z,.038,.008,M.glass,details,20);rod([x,y+.008,z],[x,y+.115,z],.004,M.glass,details);const g=new T.LatheGeometry([[.001,.095],[.03,.117],[.038,.16],[.031,.195],[.028,.197],[.032,.16],[.026,.122],[.001,.102]].map(a=>new T.Vector2(...a)),24);mesh(g,M.glass,x,y,z,details);cyl(x,y+.137,z,.029,.029,M.wine,details,20);}

for(const [i,[x,z]] of tablePositions.entries()){
 const y=.96;cyl(x,y-.03,z,.45,.065,M.marble,furniture,48);ring(x,y-.04,z,.448,.014,M.brass,furniture);cyl(x,.54,z,.045,.74,M.iron,furniture,16);cyl(x,.23,z,.09,.12,M.iron,furniture,16);
 for(let j=0;j<3;j++){const a=j*Math.PI*2/3;const q=[Math.cos(a),Math.sin(a)];tube([[x,.43,z],[x+q[0]*.08,.28,z+q[1]*.08],[x+q[0]*.34,.20,z+q[1]*.34]],.027,M.iron,furniture,12);ball(x+q[0]*.34,.195,z+q[1]*.34,.048,.018,.048,M.iron,furniture);}
 collider(x,z,.94,.94);for(const seat of seatsForTable(x,z))chair(seat.x,seat.z,seat.yaw);
 for(const c of tabletop.cups)cup(x+c.x,tabletop.top,z+c.z,c.rotation);
 wineglass(x+tabletop.glass.x,tabletop.top,z+tabletop.glass.z);
 const n=tabletop.napkin;box(x+n.x,tabletop.top+.0045,z+n.z,n.w,.009,n.d,M.paper,details,.002);
 // Small brass candle holder; atmosphere without an extra dynamic light per candle.
 cyl(x+tabletop.candle.x,tabletop.top+.0175,z+tabletop.candle.z,.035,.035,M.brass,details,16);cyl(x+tabletop.candle.x,tabletop.top+.085,z+tabletop.candle.z,.015,.10,M.ceramic,details,16);ball(x+tabletop.candle.x,tabletop.top+.159,z+tabletop.candle.z,.009,.024,.009,M.glow,details);
}
// Lanterns with glass chambers, metal muntins and soft emissive bulbs.
function lantern(z){const x=-3.32,y=2.72;rod([-4,y+.53,z],[x,y+.53,z],.022,M.iron,details);tube([[-3.93,y+.50,z],[-3.75,y+.79,z],[-3.45,y+.80,z],[x,y+.52,z]],.019,M.iron,details);rod([x,y+.55,z],[x,y+.26,z],.02,M.iron,details);
 const hood=mesh(new T.ConeGeometry(.20,.17,4),M.iron,x,y+.29,z,details);hood.rotation.y=Math.PI/4;box(x,y+.19,z,.25,.035,.25,M.brass,details,.006);box(x,y-.18,z,.23,.035,.23,M.iron,details,.006);
 for(const sx of [-1,1])for(const sz of [-1,1])rod([x+sx*.105,y-.17,z+sz*.105],[x+sx*.115,y+.19,z+sz*.115],.011,M.iron,details);ball(x,y,z,.073,.145,.073,M.glow,details);cyl(x,y-.21,z,.06,.05,M.brass,details,12);
 const light=new T.PointLight('#ffc573',19,6,2);light.position.set(x+.15,y,z);scene.add(light);warmLights.push({light,intensity:19});}
for(const z of [3.52,.45,-2.94,-6.27,-9.60])lantern(z);
// Door-side menu board: legible object-scale details rather than oversized floating UI.
const menuCanvas=document.createElement('canvas');menuCanvas.width=512;menuCanvas.height=768;const mc=menuCanvas.getContext('2d');mc.fillStyle='#24382e';mc.fillRect(0,0,512,768);mc.strokeStyle='#cabb92';mc.lineWidth=2;mc.strokeRect(19,19,474,730);mc.textAlign='center';mc.fillStyle='#e0d2ac';mc.font='58px Georgia';mc.fillText('LE SOIR',256,132);mc.font='20px Georgia';mc.fillText('CAFÉ • VIN • ARLES',256,187);mc.font='26px Georgia';for(const [i,t] of ['MENU DU JOUR','────────','Soupe à l’oignon','Pain de campagne','Fromage & olives','────────','Prenez votre temps.'].entries())mc.fillText(t,256,300+i*48);mc.font='24px Georgia';mc.fillText('SERVICE EN TERRASSE',256,689);const menuTex=new T.CanvasTexture(menuCanvas);menuTex.colorSpace=T.SRGBColorSpace;menuTex.anisotropy=8;
const menuMat=mat('#ffffff',null,.92,0,{map:menuTex}),mg=new T.Group();mg.position.set(-1.9,.16,3.25);mg.rotation.y=.28;details.add(mg);box(0,.55,0,.62,1.06,.07,M.walnut,mg);mesh(new T.PlaneGeometry(.53,.91),menuMat,0,.56,.041,mg);for(const s of [-1,1]){rod([s*.28,.04,.12],[s*.28,1.12,0],.025,M.wood,mg);rod([s*.28,.04,-.44],[s*.28,1.12,0],.023,M.wood,mg);}collider(-1.9,3.1,.7,.6);
// Plants: dozens of curved leaves, not a single faceted green sphere.
const leafG=new T.SphereGeometry(1,7,4);function plant(x,z,s=1){const y=.18;const pg=new T.LatheGeometry([[.17,0],[.19,.05],[.22,.39],[.245,.41],[.25,.45],[.21,.45],[.205,.4],[.18,.06]].map(a=>new T.Vector2(a[0]*s,a[1]*s)),24);mesh(pg,M.terracotta,x,y,z,details);cyl(x,y+.40*s,z,.205*s,.02,M.soil,details,20);
 for(let b=0;b<8;b++){const a=rand(0,Math.PI*2),h=rand(.8,1.4)*s,dx=Math.cos(a)*rand(.15,.35)*s,dz=Math.sin(a)*rand(.15,.35)*s;rod([x,y+.35*s,z],[x+dx,y+h,z+dz],.01*s,M.walnut,details);for(let k=0;k<7;k++){let t=.3+k*.1;for(const sign of [-1,1]){const o=mesh(leafG,M.leaves,x+dx*t+sign*Math.sin(a)*.07*s,y+h*t+.22*s,z+dz*t+sign*Math.cos(a)*.07*s,details);o.scale.set(.045*s,.018*s,.14*s);o.rotation.set(rand(-.6,.6),a+sign*.7,rand(-.3,.3));}}}collider(x,z,.5*s,.5*s);}
plant(-3.42,3.15,.95);plant(-1.9,-10.5,1.25);plant(4.25,-3.4,1.45);
// Supporting buildings are now hollow commercial shells, with independent rooms.
box(.1,3,-33,10,6,3,M.blueDark,backdrop);box(.9,7,-33,2.0,5,2.6,M.blue,backdrop);const spire=mesh(new T.ConeGeometry(1.5,2.3,4),M.blueDark,.9,10.6,-33,backdrop);spire.rotation.y=Math.PI/4;box(.9,8.4,-31.64,.58,1.18,.06,M.black,backdrop);
// Independently batched shells and interiors; doors remain dynamic.
let savedStory=null;try{savedStory=localStorage.getItem(STORAGE_KEY);}catch{}
const palette=createNightPalette(savedStory);let storyUI;
const commerce=addCommerce({T,scene,group,mesh,box,cyl,ball,rod,ring,mat,M,labelTexture,colliders,warmLights,onAnchor:shopId=>{storyUI.openStation(shopId);return {message:null};}});
const cafe=addCafe({T,scene,group,mesh,box,cyl,ball,rod,mat,M,labelTexture,colliders,warmLights});
const studies=addStudies({T,group,box,cyl,ball,rod,mesh,M,story:palette});
const shop=new T.PointLight('#edb575',12,6,2);shop.position.set(4.9,1.9,-5.4);scene.add(shop);warmLights.push({light:shop,intensity:12});
// One small non-shadow light makes the near produce readable without another shadow map.
const produceLight=new T.PointLight('#f2c58f',15,5.5,2);produceLight.position.set(4.60,2.23,.4);scene.add(produceLight);warmLights.push({light:produceLight,intensity:15});
// Street lamps and a handful of small scattered leaves.
for(const z of [-12,-23]){rod([3.7,.1,z],[3.7,3.7,z],.043,M.iron,details);cyl(3.7,.24,z,.095,.4,M.iron,details);box(3.7,3.7,z,.27,.07,.27,M.iron,details);ball(3.7,3.88,z,.10,.17,.10,M.glow,details);const cap=mesh(new T.ConeGeometry(.22,.19,4),M.iron,3.7,4.14,z,details);cap.rotation.y=Math.PI/4;const l=new T.PointLight('#efc384',8,6,2);l.position.set(3.7,3.7,z);scene.add(l);warmLights.push({light:l,intensity:8});}
for(let i=0;i<50;i++){const o=mesh(leafG,M.terracotta,rand(-.4,4.8),.08,rand(-13,6),details);o.scale.set(.025,.003,.075);o.rotation.y=rand(0,6.28);}
// Grounding shadows baked as small radial alpha decals under tables and plant pots.
const sh=document.createElement('canvas');sh.width=sh.height=128;const shc=sh.getContext('2d'),sg=shc.createRadialGradient(64,64,3,64,64,64);sg.addColorStop(0,'rgba(14,19,24,.72)');sg.addColorStop(.4,'rgba(14,19,24,.28)');sg.addColorStop(1,'rgba(14,19,24,0)');shc.fillStyle=sg;shc.fillRect(0,0,128,128);const sht=new T.CanvasTexture(sh);const shm=new T.MeshBasicMaterial({map:sht,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});for(const [x,z] of tablePositions){const o=mesh(new T.PlaneGeometry(1.5,1.5),shm,x,.174,z);o.rotation.x=-Math.PI/2;o.castShadow=false;}
// Star field with restrained hand-painted strokes, not oversized glowing polygons.
const sk=document.createElement('canvas');sk.width=2048;sk.height=1024;const sc=sk.getContext('2d'),grad=sc.createLinearGradient(0,0,0,1024);grad.addColorStop(0,'#081627');grad.addColorStop(.45,'#173761');grad.addColorStop(.63,'#526479');grad.addColorStop(1,'#253449');sc.fillStyle=grad;sc.fillRect(0,0,2048,1024);
for(let i=0;i<12000;i++){const x=rand(0,2048),y=rand(0,620);sc.globalAlpha=rand(.02,.08);sc.strokeStyle='#7794a7';sc.lineWidth=rand(.6,1.4);sc.beginPath();sc.moveTo(x,y);sc.lineTo(x+rand(3,13),y+rand(-2,2));sc.stroke();}
sc.globalAlpha=1;for(let i=0;i<210;i++){const x=rand(0,2048),y=rand(90,505),r=rand(.6,1.6);const gr=sc.createRadialGradient(x,y,0,x,y,r*4);gr.addColorStop(0,'rgba(249,225,171,.9)');gr.addColorStop(.2,'rgba(220,214,182,.55)');gr.addColorStop(1,'rgba(220,214,182,0)');sc.fillStyle=gr;sc.fillRect(x-r*4,y-r*4,r*8,r*8);}
const skyTex=new T.CanvasTexture(sk);skyTex.colorSpace=T.SRGBColorSpace;const sky=mesh(new T.SphereGeometry(75,40,24),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}),0,0,0,scene);sky.castShadow=false;
// Only TWO shadow maps, updated on demand; no point-light cube shadow maps.
scene.add(new T.HemisphereLight('#97b9e9','#5e4932',.86));
const moon=new T.DirectionalLight('#9ebfe9',1.2);moon.position.set(5,12,4);moon.target.position.set(-2,0,-4);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);Object.assign(moon.shadow.camera,{left:-11,right:11,top:13,bottom:-13,near:1,far:35});moon.shadow.normalBias=.035;moon.shadow.bias=-.00015;scene.add(moon,moon.target);
const key=new T.SpotLight('#ffd18b',100,17,1.23,.75,2);key.position.set(-1.8,3.09,.5);key.target.position.set(-2.0,.2,-3.1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.025;key.shadow.bias=-.0003;key.shadow.camera.near=.15;scene.add(key,key.target);warmLights.push({light:key,intensity:100});
// Static batching by material within spatial chunks preserves useful culling.
function batch(g){g.updateMatrixWorld(true);const buckets=new Map();g.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.material.transparent){const p=o.getWorldPosition(new T.Vector3());const k=o.material.uuid+':'+Math.floor(p.z/7);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o);}});for(const items of buckets.values()){if(items.length<2)continue;let count=0;const gs=items.map(o=>{const q=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();q.applyMatrix4(o.matrixWorld);count+=q.attributes.position.count;return q;});const result=new T.BufferGeometry();for(const [a,n] of [['position',3],['normal',3],['uv',2]]){const v=new Float32Array(count*n);let offset=0;for(const q of gs){if(q.attributes[a])v.set(q.attributes[a].array,offset);offset+=q.attributes.position.count*n;}result.setAttribute(a,new T.BufferAttribute(v,n));}result.computeBoundingSphere();const o=mesh(result,items[0].material,0,0,0,g);o.name=g.name+'_batch';for(const i of items)i.removeFromParent();for(const q of gs)q.dispose();}}
for(const g of [architecture,furniture,details,street,backdrop,...commerce.staticGroups,...cafe.staticGroups])batch(g);
// Free unused construction geometry buffers; live batches, instancing and sky are retained.
const used=new Set();scene.traverse(o=>{if(o.geometry)used.add(o.geometry);});for(const g of sharedGeometries.values())if(!used.has(g))g.dispose();
// HDR scene + half-resolution depth AO + quarter-resolution bloom. No ray tracing.
const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true});target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
const aoTarget=new T.WebGLRenderTarget(1,1,{depthBuffer:false}),bloomA=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false}),bloomB=bloomA.clone();
const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1),quad=new T.Mesh(new T.PlaneGeometry(2,2));postScene.add(quad);
const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const aoMat=new T.ShaderMaterial({uniforms:{depth:{value:target.depthTexture},inverseProjection:{value:camera.projectionMatrixInverse},projection:{value:camera.projectionMatrix},enabled:{value:1}},vertexShader:vs,fragmentShader:`
precision highp float;varying vec2 vUv;uniform sampler2D depth;uniform mat4 inverseProjection,projection;uniform float enabled;
vec3 positionAt(vec2 uv){float d=texture2D(depth,uv).r;vec4 p=inverseProjection*vec4(uv*2.-1.,d*2.-1.,1.);return p.xyz/p.w;}
void main(){float d=texture2D(depth,vUv).r;if(d>.9999||enabled<.5){gl_FragColor=vec4(1.);return;}vec3 p=positionAt(vUv);vec3 n=normalize(cross(dFdx(p),dFdy(p)));if(dot(n,-p)<0.)n=-n;vec3 tangent=normalize(cross(n,abs(n.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.)));vec3 bitangent=cross(n,tangent);float oc=0.;
for(int i=0;i<10;i++){float fi=float(i),a=fi*2.39996;float r=.11+.029*fi;vec3 offset=(tangent*cos(a)+bitangent*sin(a))*.83+n*.55;vec3 s=p+offset*r;vec4 projected=projection*vec4(s,1.);vec2 uv=projected.xy/projected.w*.5+.5;if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))continue;vec3 q=positionAt(uv);float range=1.-smoothstep(.16,.62,abs(p.z-q.z));oc+=(q.z>s.z+.018?1.:0.)*range;}
float ao=1.-oc*.067;gl_FragColor=vec4(vec3(ao),1.);}`});
const bloomMat=new T.ShaderMaterial({uniforms:{image:{value:target.texture},stepUV:{value:new T.Vector2()},extract:{value:1}},vertexShader:vs,fragmentShader:`varying vec2 vUv;uniform sampler2D image;uniform vec2 stepUV;uniform float extract;vec3 sampleBright(vec2 uv){vec3 c=texture2D(image,uv).rgb;return extract>.5?c*max(0.,max(c.r,max(c.g,c.b))-1.25)/(max(c.r,max(c.g,c.b))+.001):c;}void main(){vec3 c=sampleBright(vUv)*.227027;c+=(sampleBright(vUv+stepUV*1.384615)+sampleBright(vUv-stepUV*1.384615))*.316216;c+=(sampleBright(vUv+stepUV*3.230769)+sampleBright(vUv-stepUV*3.230769))*.070270;gl_FragColor=vec4(c,1.);}`});
const postMat=new T.ShaderMaterial({uniforms:{image:{value:target.texture},ao:{value:aoTarget.texture},bloom:{value:bloomB.texture},pixel:{value:new T.Vector2()},paint:{value:.25},useAO:{value:1}},vertexShader:vs,fragmentShader:`
varying vec2 vUv;uniform sampler2D image,ao,bloom;uniform vec2 pixel;uniform float paint,useAO;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 c=texture2D(image,vUv).rgb;vec3 avg=c;float w=1.;for(int i=0;i<4;i++){vec2 o=vec2(i<2?-1.:1.,i==0||i==2?-1.:1.)*pixel*1.3;vec3 s=texture2D(image,vUv+o).rgb;float a=exp(-length(s-c)*12.);avg+=s*a;w+=a;}c=mix(c,avg/w,paint*.42);
float a=texture2D(ao,vUv).r*.4;a+=(texture2D(ao,vUv+vec2(pixel.x*2.,0.)).r+texture2D(ao,vUv-vec2(pixel.x*2.,0.)).r+texture2D(ao,vUv+vec2(0.,pixel.y*2.)).r+texture2D(ao,vUv-vec2(0.,pixel.y*2.)).r)*.15;
c*=mix(1.,a,useAO);c+=texture2D(bloom,vUv).rgb*.16;float vig=1.-smoothstep(.18,.78,length((vUv-.5)*vec2(1.,.84)))*.15;c*=vig;
gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
float grain=(hash(floor(vUv/pixel))-.5)*.006*paint;gl_FragColor.rgb+=grain;
}`});
const profiles={balanced:{max:1440,dpr:1.25,shadow:1024,ao:true,fps:30},detail:{max:1920,dpr:1.6,shadow:2048,ao:true,fps:60},low:{max:1080,dpr:1,shadow:512,ao:false,fps:30}};
let quality='balanced',frameW=0,frameH=0,lightOn=true,paint=.25,paused=false,toastTimer;
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3600);}
function setRenderSize(w,h){frameW=w;frameH=h;renderer.setPixelRatio(1);renderer.setSize(w,h,false);target.setSize(w,h);aoTarget.setSize(Math.max(1,Math.round(w*.5)),Math.max(1,Math.round(h*.5)));bloomA.setSize(Math.max(1,Math.round(w*.25)),Math.max(1,Math.round(h*.25)));bloomB.setSize(Math.max(1,Math.round(w*.25)),Math.max(1,Math.round(h*.25)));postMat.uniforms.pixel.value.set(1/w,1/h);camera.aspect=w/h;camera.updateProjectionMatrix();}
function resize(){const p=profiles[quality],ratio=Math.min(devicePixelRatio,p.dpr,p.max/Math.max(innerWidth,innerHeight));setRenderSize(Math.max(1,Math.round(innerWidth*ratio)),Math.max(1,Math.round(innerHeight*ratio)));}
function applyQuality(){const p=profiles[quality];for(const l of [moon,key]){l.shadow.mapSize.set(p.shadow,p.shadow);if(l.shadow.map){l.shadow.map.dispose();l.shadow.map=null;}}aoMat.uniforms.enabled.value=p.ao?1:0;postMat.uniforms.useAO.value=p.ao?1:0;renderer.shadowMap.needsUpdate=true;resize();}
addEventListener('resize',resize);applyQuality();
const startPosition=new T.Vector3(2.7,1.74,6.35),lookAt=new T.Vector3(-2.1,2.18,-3.9);let yaw=0,pitch=0;
function reset(){camera.position.copy(startPosition);camera.lookAt(lookAt);camera.rotation.order='YXZ';yaw=camera.rotation.y;pitch=camera.rotation.x;$('location').innerHTML='露台入口 <span>05 — NIGHT SKETCHBOOK</span>';}
reset();
// Optional documentable starting positions, not routes or automatic camera motion.
const initialView=new URLSearchParams(location.search).get('view');if(initialView==='table'){camera.position.set(-.80,1.50,2.9);camera.lookAt(-2.30,.98,1.25);yaw=camera.rotation.y;pitch=camera.rotation.x;}else if(initialView==='shops'){camera.position.set(.7,1.74,4.6);camera.lookAt(5.1,1.7,-2.0);yaw=camera.rotation.y;pitch=camera.rotation.x;}else if(initialView==='facade'){camera.position.set(2.0,1.72,-4.0);camera.lookAt(-3.9,2.8,-1.2);yaw=camera.rotation.y;pitch=camera.rotation.x;}
if(initialView==='shops')$('location').innerHTML='街对面 · 商业街 <span>05 — SEVEN STUDIES</span>';
if(initialView==='table')$('location').innerHTML='桌椅近景 <span>05 — SEATING DETAILS</span>';
// Inspection bookmarks only change the initial position, never script walking.
if(initialView==='street'){camera.position.set(.8,1.72,-10.8);camera.lookAt(-.8,2,-22);yaw=camera.rotation.y;pitch=camera.rotation.x;}
if(initialView==='door'){
 const requested=[...shops,cafeShop].find(s=>s.id===new URLSearchParams(location.search).get('shop'))||shops[0];
 const d=doorLayout(requested),p=localToWorld(requested,d.center,requested.id==='cafe'?1.05:1.65),target=localToWorld(requested,d.center,-2);
 camera.position.set(p.x,1.72,p.z);camera.lookAt(target.x,1.60,target.z);yaw=camera.rotation.y;pitch=camera.rotation.x;
}
let commerceState={currentShop:null,currentLabel:null,action:null},cafeState={inside:false,action:null},interactionText='';
function interact(){
 if($('help-dialog').open||storyUI.open)return;enter();
 commerceState=commerce.update(camera.position,0,lightOn);cafeState=cafe.update(camera.position,0,lightOn,palette);
 let message=null;
 if(cafeState.action?.kind==='cafe-story')storyUI.openJournal(true);
 else if(cafeState.action)message=cafe.interact(camera.position);
 else message=commerce.interact(camera.position);
 if(message)toast(message);if(!storyUI.open)canvas.focus();
}
$('interact').onclick=interact;
const keys=new Set();let drag=false,lx=0,ly=0,locked=false;
storyUI=createStoryUI({story:palette,studies,cafe,toast,
 onPause(){keys.clear();drag=false;document.body.classList.add('story-open');if(document.pointerLockElement)document.exitPointerLock();},
 onResume(){keys.clear();drag=false;document.body.classList.remove('story-open');canvas.focus();}
});
function enter(){document.body.classList.add('walking');canvas.focus();}
$('enter').onclick=()=>{enter();toast('WASD 自由行走 · 咖啡馆领取手记 · J 查看方向');};
$('reset').onclick=()=>{reset();enter();};
function toggleLight(){lightOn=!lightOn;$('lighting').textContent=lightOn?'暖灯 · 开':'暖灯 · 关';for(const {light,intensity} of warmLights)light.intensity=lightOn?intensity:0;M.glow.emissiveIntensity=lightOn?3.2:.02;M.window.emissiveIntensity=lightOn?.35:.02;canvas.focus();}
$('lighting').onclick=toggleLight;
$('quality').onchange=e=>{quality=e.target.value;applyQuality();frameTimes=[];frames=0;fpsStart=performance.now();toast(`已切换${e.target.selectedOptions[0].textContent} · ${frameW} × ${frameH}`);canvas.focus();};
$('paint').oninput=e=>{paint=+e.target.value/100;postMat.uniforms.paint.value=paint;$('paint-value').value=e.target.value;};
$('help').onclick=()=>{keys.clear();drag=false;if(document.pointerLockElement)document.exitPointerLock();$('help-dialog').showModal();};
$('close-help').onclick=()=>{$('help-dialog').close();canvas.focus();};
$('help-dialog').addEventListener('close',()=>{keys.clear();canvas.focus();});
$('pointer-lock').onclick=async()=>{$('help-dialog').close();enter();try{await canvas.requestPointerLock();}catch{toast('此浏览器未允许鼠标锁定，请按住鼠标拖动环顾。');}};
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;document.body.classList.toggle('locked',locked);drag=false;});
document.addEventListener('pointerlockerror',()=>toast('鼠标锁定不可用；按住鼠标仍可自由环顾。'));
const keyCode=e=>e.code||({w:'KeyW',a:'KeyA',s:'KeyS',d:'KeyD',r:'KeyR',e:'KeyE',j:'KeyJ'}[e.key?.toLowerCase()]||e.key);
addEventListener('keydown',e=>{if($('help-dialog').open||storyUI.open||['INPUT','SELECT','BUTTON','A','SUMMARY'].includes(document.activeElement.tagName))return;const code=keyCode(e);if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(code))e.preventDefault();keys.add(code);
 // Preserve short taps that begin and end between animation frames.
 if(!e.repeat){const f=Number(code==='KeyW')-Number(code==='KeyS'),s=Number(code==='KeyD')-Number(code==='KeyA');if(f||s)move(f,s,1/60,e.shiftKey);if(code==='ArrowLeft')yaw+=.02;if(code==='ArrowRight')yaw-=.02;}
 if(code==='KeyJ'&&!e.repeat){e.preventDefault();storyUI.openJournal(false);}if(code==='KeyE'&&!e.repeat){e.preventDefault();interact();}if(code==='KeyR')reset();if(code==='Escape')document.body.classList.remove('walking');});
addEventListener('keyup',e=>keys.delete(keyCode(e)));addEventListener('blur',()=>{keys.clear();drag=false;});
document.addEventListener('visibilitychange',()=>{keys.clear();drag=false;paused=document.hidden;});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||storyUI.open||$('help-dialog').open)return;enter();if(!locked){drag=true;lx=e.clientX;ly=e.clientY;canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
canvas.addEventListener('pointermove',e=>{if(locked||storyUI.open)return;if(drag){yaw-=(e.clientX-lx)*.003;pitch=T.MathUtils.clamp(pitch-(e.clientY-ly)*.0028,-1.1,1.08);lx=e.clientX;ly=e.clientY;}});
document.addEventListener('mousemove',e=>{if(locked&&!storyUI.open){yaw-=e.movementX*.0024;pitch=T.MathUtils.clamp(pitch-e.movementY*.0024,-1.1,1.08);}});
function move(f,s,dt,slow=false){if(!f&&!s)return;
 const next=advancePosition(camera.position,yaw,f,s,dt,colliders,slow,[...commerce.walkableAreas,...cafe.walkableAreas]);
 camera.position.x=next.x;camera.position.z=next.z;
 const elevation=camera.position.x<-.83&&camera.position.z<4.6&&camera.position.z> -10.9?.14:0;camera.position.y=T.MathUtils.lerp(camera.position.y,1.70+elevation,1-Math.exp(-dt*9));document.body.classList.add('walking');$('location').innerHTML='自由游走 <span>YOUR PACE, YOUR POINT OF VIEW</span>';}
let padConnected=false,padPrevious=[];
function gamepad(dt){
 const p=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.mapping==='standard');padConnected=!!p;
 if(!p){padPrevious=[];return;}const pressed=p.buttons.map(b=>b.pressed);
 if(storyUI.open)storyUI.gamepad(p,padPrevious);
 else if(!$('help-dialog').open){
  const dead=v=>Math.abs(v)<.17?0:Math.sign(v)*(Math.abs(v)-.17)/.83;
  move(-dead(p.axes[1]||0),dead(p.axes[0]||0),dt);yaw-=dead(p.axes[2]||0)*dt*1.35;pitch=T.MathUtils.clamp(pitch-dead(p.axes[3]||0)*dt,-1.1,1.08);
  if(pressed[2]&&!padPrevious[2])interact();
  else if(pressed[9]&&!padPrevious[9])storyUI.openJournal(false);
  else {if(pressed[0]&&!padPrevious[0])toggleLight();if(pressed[3]&&!padPrevious[3])reset();}
 }
 padPrevious=pressed;
}
let drawCalls=0,triangles=0,lastRenderMS=0,renderSamples=[];
function pass(mat,out){quad.material=mat;renderer.setRenderTarget(out);renderer.render(postScene,postCamera);}
function render(){const start=performance.now();renderer.info.reset();camera.rotation.set(pitch,yaw,0,'YXZ');renderer.setRenderTarget(target);renderer.render(scene,camera);triangles=renderer.info.render.triangles;drawCalls=renderer.info.render.calls;
 pass(aoMat,aoTarget);bloomMat.uniforms.image.value=target.texture;bloomMat.uniforms.extract.value=1;bloomMat.uniforms.stepUV.value.set(2/target.width,0);pass(bloomMat,bloomA);bloomMat.uniforms.image.value=bloomA.texture;bloomMat.uniforms.extract.value=0;bloomMat.uniforms.stepUV.value.set(0,1/bloomA.height);pass(bloomMat,bloomB);pass(postMat,null);lastRenderMS=performance.now()-start;}
let previous=performance.now(),renderedAt=0,frames=0,fpsStart=previous,fps=0,frameTimes=[],totalFrames=0;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-previous)/1000,.05);previous=now;if(paused)return;
 commerceState=commerce.update(camera.position,dt,lightOn);
 cafeState=cafe.update(camera.position,dt,lightOn,palette);
 studies.update(camera.position);storyUI.hud(camera.position,yaw);
 const activeAction=cafeState.action||commerceState.action;
 const hint=activeAction?`E · ${activeAction.label}`:'';
 if(hint!==interactionText){$('interact').textContent=hint;$('interaction').hidden=!hint;interactionText=hint;}
 const roomText=cafeState.inside?'咖啡馆 · 靠近画架按 E':commerceState.currentLabel?`店内 · ${commerceState.currentLabel} / 靠近柜台按 E`:'店门 E · 手记 J · 自由行走，无规定路线';
 if($('room-status').textContent!==roomText)$('room-status').textContent=roomText;
 if(!$('help-dialog').open&&!storyUI.open){move(Number(keys.has('KeyW'))-Number(keys.has('KeyS')),Number(keys.has('KeyD'))-Number(keys.has('KeyA')),dt,keys.has('ShiftLeft')||keys.has('ShiftRight'));yaw+=(Number(keys.has('ArrowLeft'))-Number(keys.has('ArrowRight')))*dt*1.15;pitch=T.MathUtils.clamp(pitch+(Number(keys.has('ArrowUp'))-Number(keys.has('ArrowDown')))*dt*.8,-1.1,1.08);}
 gamepad(dt);
 const interval=1000/profiles[quality].fps;if(now-renderedAt>=interval-.7){if(renderedAt&&now-renderedAt<250)frameTimes.push(now-renderedAt);if(frameTimes.length>300)frameTimes.shift();renderedAt=now;render();frames++;totalFrames++;}
 if(now-fpsStart>=1000){fps=Math.round(frames*1000/(now-fpsStart));frames=0;fpsStart=now;$('stats').textContent=`${fps} FPS · ${frameW}×${frameH} · ${Math.round(triangles/1000)}k tris`;$('pad').textContent=padConnected?'手柄已连接':'手柄待连接';const sorted=[...frameTimes].sort((a,b)=>a-b);$('diagnostics').textContent=JSON.stringify({ready:true,sceneVersion:'06-hands-on-workshops',palette:{...palette.snapshot(),coreCount:palette.coreCount,canFinish:palette.canFinish},storyPanel:storyUI.open,insideCafe:cafeState.inside,insideShop:commerceState.currentShop,nearbyAction:activeAction?.label??null,doors:[...commerce.doors,cafe.door].map(d=>({id:d.shop.id,open:d.progress===1,progress:+d.progress.toFixed(2)})),visibleRooms:commerce.rooms.filter(r=>r.root.visible).length,shops:commerce.shopCount,chairs:tablePositions.length*2,three:T.REVISION,quality,fps,cap:profiles[quality].fps,framebuffer:[frameW,frameH],camera:camera.position.toArray().map(v=>+v.toFixed(3)),yaw:+yaw.toFixed(3),pitch:+pitch.toFixed(3),drawCalls,triangles,textures:renderer.info.memory.textures,geometries:renderer.info.memory.geometries,frameTimeMedian:sorted.length?+sorted[Math.floor(sorted.length*.5)].toFixed(2):0,frameTimeP95:sorted.length?+sorted[Math.floor(sorted.length*.95)].toFixed(2):0,lightOn,paint,controller:padConnected,collisionBodies:colliders.length,totalFrames,renderer:T.REVISION,exportedImage:'renders/studio.png'});}
}
$('capture').onclick=async()=>{const button=$('capture');button.disabled=true;const oldAspect=camera.aspect;try{setRenderSize(1800,1200);render();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('截图为空');const res=await fetch('/api/save/png',{method:'POST',headers:{'Content-Type':'image/png'},body:blob});if(!res.ok)throw new Error('本地保存失败');toast('已保存：renders/studio.png（1800 × 1200）');}catch(e){toast(e.message);}finally{resize();button.disabled=false;canvas.focus();}};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;$('loading').classList.remove('done');$('load-message').textContent='显存资源暂时不可用。请关闭其他 3D 页面后刷新，或改用流畅档。';});
canvas.addEventListener('webglcontextrestored',()=>location.reload());
commerce.update(camera.position,0,lightOn);cafe.update(camera.position,0,lightOn,palette);studies.update(camera.position);
try{await renderer.compileAsync(scene,camera);renderer.shadowMap.needsUpdate=true;render();$('loading').classList.add('done');requestAnimationFrame(animate);}catch(e){$('load-message').textContent='渲染初始化失败：'+e.message;console.error(e);}
