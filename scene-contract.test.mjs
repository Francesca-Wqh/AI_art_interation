// CPU-side scene contract checks only. Does NOT start or automate a browser or claim WebGL visual QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {addCafe} from './cafe.js';
import {addCommerce} from './commerce.js';
import {addStudies} from './studies.js';
import {createNightPalette,STUDIES} from './interactions.js';
import {drawPostcard,drawStudy} from './postcard.js';
import {defaultWork} from './workshop-model.js';
import {cafeAnchor,cafeShop} from './cafe-door.js';
function canvasStub(){const ops=[];const context=new Proxy({ops},{get(o,k){if(k in o)return o[k];return (...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),`nonfinite canvas argument in ${String(k)}`);ops.push([k,...args]);};},set(o,k,v){o[k]=v;ops.push(['set',k,v]);return true;}});return {width:1000,height:760,getContext:()=>context,ops};}
function fixture(){
 const scene=new T.Scene(),colliders=[],warmLights=[],M={};for(const key of ['walnut','wood','paper','door','brass','iron','glow','leaves','ceramic','terracotta','stone','cream','worn','blue','blueDark','black','glass','window','shutter','fabric','curb','rose'])M[key]=new T.MeshStandardMaterial({color:'#c8ab84'});
 const group=name=>{const g=new T.Group();g.name=name;scene.add(g);return g;};
 const mesh=(geo,material,x=0,y=0,z=0,parent=scene)=>{assert.ok(material?.isMaterial,'undefined material');assert.ok([x,y,z].every(Number.isFinite));const o=new T.Mesh(geo,material);o.position.set(x,y,z);parent.add(o);return o;};
 const box=(x,y,z,w,h,d,m,parent=scene)=>{assert.ok([w,h,d].every(v=>Number.isFinite(v)&&v>0));return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);};
 const cyl=(x,y,z,r,h,m,parent=scene,segments=16)=>mesh(new T.CylinderGeometry(r,r,h,segments),m,x,y,z,parent);
 const ball=(x,y,z,sx,sy,sz,m,parent=scene)=>{const o=mesh(new T.SphereGeometry(1,8,6),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;};
 const rod=(a,b,r,m,parent=scene)=>{const p=new T.Vector3(...a),q=new T.Vector3(...b);const o=mesh(new T.CylinderGeometry(r,r,p.distanceTo(q),8),m,0,0,0,parent);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());return o;};
 const ring=(x,y,z,r,t,m,parent=scene)=>mesh(new T.TorusGeometry(r,t,6,12),m,x,y,z,parent);
 const mat=(color,kind,roughness=.8,metalness=0,extra={})=>new T.MeshStandardMaterial({color,roughness,metalness,...extra});
 return {T,scene,group,mesh,box,cyl,ball,rod,ring,mat,M,colliders,warmLights,labelTexture:()=>new T.Texture()};
}
function withDocument(fn){const old=globalThis.document,oldWindow=globalThis.window;globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');return canvasStub();}};globalThis.window={dispatchEvent(){}};try{return fn();}finally{globalThis.document=old;globalThis.window=oldWindow;}}
test('CPU assembly of café + seven shops + live studies has finite transforms and bounded resources',()=>withDocument(()=>{
 const f=fixture(),story=createNightPalette(),cafe=addCafe(f),commerce=addCommerce(f),studies=addStudies({...f,story});
 const statics=new Set([...cafe.staticGroups,...commerce.staticGroups]);assert.ok(!statics.has(studies.stations.get('books').g));
 for(const s of STUDIES)for(const c of s.choices)studies.preview(s.id,c.id);
 f.scene.updateMatrixWorld(true);let meshes=0;f.scene.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.name+' has invalid transform');if(o.isMesh){meshes++;assert.ok(o.material?.isMaterial);const p=o.geometry.attributes.position;assert.ok([...p.array].every(Number.isFinite));}});
 assert.ok(meshes>100);assert.equal(commerce.doors.length,7);assert.equal(studies.stations.size,STUDIES.length);assert.equal(f.warmLights.length,3,'one café light + two pooled shop lights');assert.ok(f.warmLights.every(e=>!e.light.castShadow));
 assert.equal(cafe.update(cafeAnchor,.016,true,story).action.kind,'cafe-story');
 const maxY=studies.stations.get('atelier').g.position.y;assert.ok(Number.isFinite(maxY));
}));
test('actual commerce handlers reopen doors when closing onto visitor',()=>withDocument(()=>{
 const f=fixture(),commerce=addCommerce(f),d=commerce.doors[0];d.progress=.8;d.target=0;
 const position={x:d.shop.x+.2,z:d.shop.z+d.layout.center};commerce.update(position,.016,true);
 assert.equal(d.target,1);assert.ok(d.progress>.8);
}));
test('each hands-on work produces distinct finite study and postcard raster commands',()=>{
 const base={};
 for(const s of STUDIES){const work=defaultWork(s.id);if(s.id==='atelier')work.strokes=[{color:1,width:.014,points:[[.15,.7],[.52,.3],[.85,.65]]}];base[s.id]=work;}
 for(const s of STUDIES){const altered=JSON.parse(JSON.stringify(base[s.id]));if(s.id==='books')altered.tiles[0].x=.84;if(s.id==='cloth')altered.chips.forEach((p,i)=>p.y=i<5?.8:.16);if(s.id==='atelier')altered.hits=[0,2,4];const first=canvasStub(),second=canvasStub();drawStudy(first,s.id,s.id==='atelier'? 'flow':'warm',base[s.id]);drawStudy(second,s.id,s.id==='atelier'? 'flow':'warm',altered);assert.notDeepEqual(first.ops,second.ops,s.id+' study must visibly differ');}
 const a=canvasStub();drawPostcard(a,{finished:true,works:base});
 for(const s of STUDIES){const altered=JSON.parse(JSON.stringify(base));if(s.id==='books')altered.books.tiles[0].x=.84;if(s.id==='cloth')altered.cloth.chips.forEach((p,i)=>p.y=i<5?.8:.16);if(s.id==='atelier')altered.atelier.hits=[0,2,4];const b=canvasStub();drawPostcard(b,{finished:true,works:altered});assert.notDeepEqual(a.ops,b.ops,s.id+' must affect final image');}
 const again=canvasStub();drawPostcard(again,{finished:true,works:base});assert.deepEqual(a.ops,again.ops,'output must be deterministic');
});
test('live studies hide outside their own doorway approach, limiting additional draw work',()=>withDocument(()=>{
 const f=fixture(),studies=addStudies({...f,story:createNightPalette()});studies.update({x:0,z:-16});
 assert.equal([...studies.stations.values()].filter(s=>s.g.visible).length,0);
 studies.update(studies.stations.get('books').position);
 assert.equal([...studies.stations.values()].filter(s=>s.g.visible).length,1);
 assert.ok(studies.stations.get('books').g.visible);
}));

test('café entrance plaque faces the street and jambs preserve the clear doorway',()=>withDocument(()=>{
 const f=fixture(),labels=[];f.labelTexture=(...args)=>{labels.push(args);return new T.Texture();};
 addCafe(f);f.scene.updateMatrixWorld(true);
 const sign=f.scene.getObjectByName('Cafe_Entrance_Sign');assert.ok(sign);
 assert.equal(labels[0][0],'Café · Entrance');assert.match(labels[0][1],/press E to open/);
 assert.ok(sign.material.isMeshBasicMaterial);assert.equal(sign.material.toneMapped,false);
 assert.equal(sign.castShadow,false);assert.equal(sign.receiveShadow,false);
 const normal=new T.Vector3(0,0,1).transformDirection(sign.matrixWorld);
 assert.ok(normal.x>.999,'plaque must face +X, towards the street');
 assert.ok(sign.getWorldPosition(new T.Vector3()).x>cafeShop.x+.16,'plaque must sit in front of the existing arch trim');
 assert.ok(sign.geometry.parameters.width>=1.7);
 let jambs=0;f.scene.traverse(o=>{if(o.name==='Cafe_Entrance_Jamb'){
  jambs++;assert.ok(Math.abs(o.position.x)-o.geometry.parameters.width/2>=cafeShop.doorWidth/2-1e-9,'jamb must not narrow the opening');
 }});assert.equal(jambs,2);
 assert.equal(f.warmLights.length,1,'entrance signage must not introduce another light');
}));

test('continuous workshop data updates room artwork and cancel restores committed textures without adding lights',()=>withDocument(()=>{
 const f=fixture(),story=createNightPalette();story.start();story.recordWork('books',defaultWork('books'));
 const studies=addStudies({...f,story}),s=studies.stations.get('books'),baseline=s.image.ops.length;
 const draft=defaultWork('books');draft.tiles[0].x=.82;studies.preview('books','street',draft);assert.ok(s.image.ops.length>baseline);const draftSignature=s.signature;
 studies.restore('books');assert.notEqual(s.signature,draftSignature);assert.equal(s.signature,'sky'+JSON.stringify(story.work('books')));
 const frameCount=s.image.ops.length;studies.restore('books');assert.equal(s.image.ops.length,frameCount,'unchanged restore must not regenerate textures');assert.equal(f.warmLights.length,0);
}));
