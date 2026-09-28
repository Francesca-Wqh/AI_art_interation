import test from 'node:test';
import assert from 'node:assert/strict';
import {shops,localToWorld,worldToLocal,localRect,doorLayout,roomArea,roomContains,shopWalls,shopFixtures} from './layout.js?v=04';
import {createDoorState,advanceDoor,requestDoorToggle} from './doors.js?v=04';
import {advancePosition,canOccupy} from './navigation.js';
const areas=shops.map(roomArea);
const fixtures=shops.flatMap(s=>shopFixtures(s).map(f=>localRect(s,f.u,f.v,f.w,f.d)));
const walls=shops.flatMap(shopWalls);
const finish=d=>{for(let i=0;i<40;i++)advanceDoor(d,1/60);};
for(const shop of shops){
 test(`${shop.id}: closed door blocks, open door admits and lets player leave`,()=>{
   const door=createDoorState(shop),d=doorLayout(shop),start=localToWorld(shop,d.center,1.65);
   const obstacles=[...walls,...fixtures,door.portal,door.leaf],yaw=shop.side==='left'?Math.PI/2:-Math.PI/2;
   assert.ok(canOccupy(start.x,start.z,obstacles,.19,areas),'outside approach must be clear');
   const blocked=advancePosition(start,yaw,1,0,2,obstacles,false,areas);
   assert.ok(worldToLocal(shop,blocked.x,blocked.z).v>.2,'closed portal stops player');
   assert.equal(requestDoorToggle(door,start),true);finish(door);assert.equal(door.progress,1);
   const inside=advancePosition(start,yaw,1,0,2.3,obstacles,false,areas);
   assert.ok(roomContains(shop,inside),'player enters true room, not solid facade');
   assert.ok(worldToLocal(shop,inside.x,inside.z).v< -1.5);
   const near=localToWorld(shop,d.center,-.2);assert.equal(requestDoorToggle(door,near),false,'cannot close onto someone');
   const outside=advancePosition(inside,yaw,-1,0,2.3,obstacles,false,areas);
   assert.ok(worldToLocal(shop,outside.x,outside.z).v>1.5);
   assert.equal(requestDoorToggle(door,outside),true);finish(door);assert.equal(door.progress,0);assert.equal(door.portal.enabled,true);
 });
 test(`${shop.id}: walls and display block shortcut; counter remains reachable`,()=>{
   const d=doorLayout(shop),obstacles=[...walls,...fixtures];
   const wall=localToWorld(shop,0,0);assert.equal(canOccupy(wall.x,wall.z,obstacles,.19,areas),false);
   const anchor=localToWorld(shop,.40,-2.1);assert.equal(canOccupy(anchor.x,anchor.z,obstacles,.19,areas),true);
   for(let v=-1.5;v>=-2.1;v-=.1){const p=localToWorld(shop,d.center,v);assert.ok(canOccupy(p.x,p.z,obstacles,.19,areas));}
   for(let u=d.center;u<=.4;u+=.1){const p=localToWorld(shop,u,-2.1);assert.ok(canOccupy(p.x,p.z,obstacles,.19,areas));}
   const rear=localToWorld(shop,0,-shop.depth);assert.equal(canOccupy(rear.x,rear.z,obstacles,.19,areas),false);
 });
}
test('room transforms round trip on both sides of street',()=>{for(const s of shops){const p=localToWorld(s,.71,-1.34),q=worldToLocal(s,p.x,p.z);assert.ok(Math.abs(q.u-.71)<1e-9);assert.ok(Math.abs(q.v+1.34)<1e-9);}});
test('doorway remains blocked during opening animation',()=>{const s=shops[0],door=createDoorState(s),start=localToWorld(s,door.layout.center,1.65);requestDoorToggle(door,start);advanceDoor(door,.1);assert.ok(door.progress>0&&door.progress<1);assert.equal(door.portal.enabled,true);});
test('seven rooms have unique stable ids and do not overlap each other',()=>{assert.equal(new Set(shops.map(s=>s.id)).size,7);for(let i=0;i<shops.length;i++)for(let j=i+1;j<shops.length;j++){const a=shops[i],b=shops[j];if(a.side===b.side)assert.ok(Math.abs(a.z-b.z)>(a.width+b.width)/2);}});
