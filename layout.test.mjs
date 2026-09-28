import test from 'node:test';
import assert from 'node:assert/strict';
import {tablePositions,seatsForTable,facingTable,tabletop,shopObstacles,shops} from './layout.js';
import {canOccupy,advancePosition} from './navigation.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('all eight chairs face their own table with the open +Z side',()=>{
  let count=0;
  for(const [x,z] of tablePositions)for(const s of seatsForTable(x,z)){
    const d=Math.hypot(x-s.x,z-s.z);
    near(Math.sin(s.yaw),(x-s.x)/d);near(Math.cos(s.yaw),(z-s.z)/d);
    // The back rail (-Z) must be farther from the table than the seat center.
    assert.ok(Math.hypot(x-(s.x-Math.sin(s.yaw)*.22),z-(s.z-Math.cos(s.yaw)*.22))>d);
    count++;
  }
  assert.equal(count,8);
});
test('chair orientation follows a relocated table in all four quadrants',()=>{
  for(const [x,z] of [[3,4],[-3,4],[-3,-4],[3,-4]]){
    const yaw=facingTable(0,0,x,z);near(Math.sin(yaw),x/5);near(Math.cos(yaw),z/5);
  }
});
test('chairs clear tabletop and wall; do not protrude into the curb',()=>{
  for(const [x,z] of tablePositions)for(const s of seatsForTable(x,z)){
    assert.ok(Math.hypot(s.x-x,s.z-z)-tabletop.radius-.22>.15);
    assert.ok(s.x-.27>-3.73);assert.ok(s.x+.27< -1.10);
  }
});
test('tabletop objects stay on marble and do not overlap each other',()=>{
  const n=tabletop.napkin;
  const props=[...tabletop.cups,tabletop.glass,tabletop.candle,{...n,r:Math.hypot(n.w,n.d)/2}];
  for(let i=0;i<props.length;i++){
    const a=props[i];assert.ok(Math.hypot(a.x,a.z)+a.r<tabletop.radius-.02);
    for(let j=i+1;j<props.length;j++){const b=props[j];assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>a.r+b.r+.015);}
  }
});
test('shop stock blocks walking through the counters and barrels',()=>{
  assert.equal(shops.length,7);
  for(const c of shopObstacles)assert.equal(canOccupy(c.x,c.z,shopObstacles),false);
});
test('unobstructed central route passes all seven storefronts',()=>{
  for(let z=6;z>=-27;z-=.2)for(const x of [0,1,2,3])assert.ok(canOccupy(x,z,shopObstacles));
});
