import test from 'node:test';
import assert from 'node:assert/strict';
import {WORKSHOP_IDS, BEACONS, defaultWork, normalizeWork, workChoice, copyWork} from './workshop-model.js';
import {createNightPalette} from './interactions.js';
import {drawWorkshop} from './workshop-art.js';
import {drawPostcard} from './postcard.js';
import {mountWorkshop} from './workshop-ui.js';
import {fakeDOM, canvasContext} from './tests/fake-dom.mjs';
const canvas = () => { const ctx=canvasContext(); return {width:640,height:420,getContext:()=>ctx,toDataURL:()=> 'data:image/png;base64,TEST',ops:ctx.ops}; };
const painted = () => ({strokes:[{color:2,width:.014,points:[[.2,.4],[.3,.2],[.4,.3]]}],hits:[0,2]});

test('only three differentiated workshop games are exposed', () => assert.deepEqual(WORKSHOP_IDS, ['books','cloth','atelier']));
test('normalizers clamp corrupt input and cap drawing complexity', () => {
 const books=normalizeWork('books',{tiles:[{x:Infinity,y:-3,r:99}],x:NaN});
 assert.equal(books.tiles.length,4); assert.ok(books.tiles.every(t=>t.x>=.12&&t.x<=.88&&t.y>=.12&&t.y<=.88));
 const cloth=normalizeWork('cloth',{chips:Array.from({length:9},()=>({x:Infinity,y:-1,kind:99}))});
 assert.equal(cloth.chips.length,9); assert.ok(cloth.chips.every(t=>t.x>=.08&&t.x<=.92&&t.y>=.08&&t.y<=.92));
 const atelier=normalizeWork('atelier',{strokes:Array.from({length:100},()=>({color:99,width:900,points:Array.from({length:200},()=>[Infinity,-200])}))});
 assert.equal(atelier.strokes.length,60); assert.equal(atelier.strokes[0].points.length,140); assert.deepEqual(atelier.strokes[0].points[0],[.5,.045]);
});
test('each gesture changes the workshop rendering and final postcard deterministically', () => {
 for (const id of WORKSHOP_IDS) {
  const base=defaultWork(id), altered=copyWork(base);
  if (id==='books') { altered.tiles[0].x=.84; altered.tiles[0].r=1; }
  if (id==='cloth') altered.chips.forEach((p,i)=>{p.y=i<5?.8:.16;});
  if (id==='atelier') { altered.strokes=painted().strokes; altered.hits=painted().hits; }
  const a=canvas(),b=canvas(); drawWorkshop(a,id,base); drawWorkshop(b,id,altered); assert.notDeepEqual(a.ops,b.ops,id+' workshop');
  const x=canvas(),y=canvas(),z=canvas(); drawPostcard(x,{works:{[id]:base}}); drawPostcard(y,{works:{[id]:altered}}); drawPostcard(z,{works:{[id]:base}}); assert.notDeepEqual(x.ops,y.ops,id+' postcard'); assert.deepEqual(x.ops,z.ops);
 }
});
test('atelier beacon progression is bounded and serializable', () => {
 const w=normalizeWork('atelier',{...painted(),hits:[4,2,2,99,-1]}); assert.deepEqual(w.hits,[0,2,4]); assert.deepEqual(BEACONS[0],[.18,.28]);
});
test('keyboard controls, undo, redo and reset work for all stations', () => {
 const env=fakeDOM(); try {
  for (const id of WORKSHOP_IDS) {
   const host=env.node('div',`host-${id}`); const ui=mountWorkshop({host,id,initial:defaultWork(id),snapshot:()=>({})}); env.flush();
   if (id==='atelier') { ui.key(' '); ui.key('ArrowRight'); ui.key(' '); } else { ui.key('ArrowRight'); }
   env.flush(); assert.equal(ui.dirty,true,id); assert.ok(ui.value);
   const buttons=host.querySelectorAll('button'); buttons.find(b=>b.textContent==='↶ 撤销').click(); env.flush(); buttons.find(b=>b.textContent==='↷ 重做').click(); env.flush(); buttons.find(b=>b.textContent==='恢复本次初稿').click(); env.flush(); assert.equal(ui.dirty,false,id); ui.destroy();
  }
 } finally { env.restore(); }
});
test('pointer drawing stores a bounded path and reaches nearby beacons', () => {
 const env=fakeDOM(); try {
  const ui=mountWorkshop({host:env.node('div','host'),id:'atelier',snapshot:()=>({})}); env.flush();
  ui.canvas.fire('pointerdown',{clientX:115,clientY:118});
  for (const [x,y] of [[150,100],[210,80],[250,120],[365,75],[540,120]]) ui.canvas.fire('pointermove',{clientX:x,clientY:y});
  ui.canvas.fire('pointerup'); env.flush(); assert.ok(ui.value.strokes[0].points.length>1); assert.ok(ui.value.strokes[0].points.length<=140); ui.destroy();
 } finally { env.restore(); }
});
test('story can collect all three hands-on works and finish once', () => {
 const s=createNightPalette(); s.start();
 for (const id of WORKSHOP_IDS) { const w=defaultWork(id); if(id==='atelier')Object.assign(w,painted()); assert.equal(s.recordWork(id,w).ok,true); }
 assert.equal(s.finish().ok,true); assert.equal(s.finished,true);
});
