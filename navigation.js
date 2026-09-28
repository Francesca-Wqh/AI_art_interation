// Pure navigation math, shared by the actual scene and node:test.
export const bounds={minX:-3.73,maxX:4.97,minZ:-28,maxZ:7.1};
export function canOccupy(x,z,colliders,radius=.19,areas=[]){
 if(![bounds,...areas].some(b=>x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ))return false;
 return !colliders.some(c=>c.enabled!==false&&Math.abs(x-c.x)<c.w/2+radius&&Math.abs(z-c.z)<c.d/2+radius);
}
export function advancePosition(position,yaw,f,s,dt,colliders,slow=false,areas=[]){
 const len=Math.max(1,Math.hypot(f,s)),speed=slow?.58:1.5;
 const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/len*speed*dt;
 const dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/len*speed*dt;
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.07));
 let {x,z}=position;
 for(let i=0;i<count;i++){
  if(canOccupy(x+dx/count,z,colliders,.19,areas))x+=dx/count;
  if(canOccupy(x,z+dz/count,colliders,.19,areas))z+=dz/count;
 }
 return {x,z};
}
