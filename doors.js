import {doorLayout,localRect,worldToLocal} from './layout.js?v=08-en';
// The portal stays blocked until the leaf is completely open. No teleporting.
export function createDoorState(shop){
  const layout=doorLayout(shop);
  return {shop,layout,progress:0,target:0,portal:{...localRect(shop,layout.center,0,layout.width,.22),enabled:true},leaf:{...localRect(shop,layout.center,0,layout.leafWidth,.08),enabled:true}};
}
export function doorwayOccupied(door,position){
  const {u,v}=worldToLocal(door.shop,position.x,position.z),d=door.layout;
  return u>d.hinge-.27&&u<d.hinge+d.width+.27&&v> -d.width-.30&&v<.40;
}
export function requestDoorToggle(door,position){
  if(doorwayOccupied(door,position))return false;
  door.target=door.target?0:1;return true;
}
export function advanceDoor(door,dt){
  // Callers reopen closing doors if doorwayOccupied() becomes true.
  const old=door.progress,step=Math.max(0,Math.min(dt,.1))*1.8;
  door.progress+=Math.sign(door.target-door.progress)*Math.min(step,Math.abs(door.target-door.progress));
  const angle=door.progress*Math.PI/2,d=door.layout;
  const u=d.hinge+Math.cos(angle)*d.leafWidth/2,v=-Math.sin(angle)*d.leafWidth/2;
  Object.assign(door.leaf,localRect(door.shop,u,v,Math.cos(angle)*d.leafWidth+.08,Math.sin(angle)*d.leafWidth+.08));
  door.portal.enabled=door.progress<.999;
  return old!==door.progress;
}
