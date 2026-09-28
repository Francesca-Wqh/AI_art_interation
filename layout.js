// One source of truth for the scene and regression tests. Coordinates are metres.
export const tablePositions = [[-2.32,1.28],[-2.37,-2.10],[-2.4,-5.45],[-2.35,-8.47]];
// The chair's back rail is local -Z, so its open/front side is local +Z.
export function facingTable(x,z,tableX,tableZ) {
  return Math.atan2(tableX-x,tableZ-z);
}
export function seatsForTable(x,z) {
  return [[x-.10,z+.84],[x+.10,z-.84]].map(([sx,sz])=>({
    x:sx,z:sz,yaw:facingTable(sx,sz,x,z)
  }));
}
export const tabletop = {
  radius:.45, top:.9625,
  cups:[{x:.07,z:.23,r:.078,rotation:.4},{x:-.07,z:-.23,r:.078,rotation:Math.PI+.4}],
  glass:{x:.25,z:.08,r:.04}, candle:{x:-.23,z:.08,r:.035},
  napkin:{x:.24,z:-.15,w:.15,d:.13}
};
export const shops = [
  {id:'produce',side:'right',x:5.56,z:.4,width:4.6,depth:3.8,height:9.3,title:'ÉPICERIE',label:'杂货铺',subtitle:'FRUITS · LÉGUMES · HUILE',anchorLabel:'果蔬称量台',motif:'金色灯火'},
  {id:'wine',side:'right',x:5.36,z:-7.5,width:5.0,depth:3.8,height:10.4,title:'MARCHAND DE VIN',label:'酒商',subtitle:'VINS · BOUTEILLES · TONNEAUX',anchorLabel:'品酒柜台',motif:'深红回声'},
  {id:'cloth',side:'right',x:5.06,z:-16,width:4.8,depth:3.8,height:8.8,title:'DRAPERIE',label:'布料铺',subtitle:'TOILES · ÉTOFFES · RUBANS',anchorLabel:'布料配色台',motif:'赭黄织线'},
  {id:'bakery',side:'right',x:4.7,z:-24.2,width:5.4,depth:4,height:8.4,title:'BOULANGERIE',label:'面包铺',subtitle:'PAIN · BRIOCHES · FOUR',anchorLabel:'面包制作台',motif:'面包余温'},
  {id:'books',side:'left',x:-3.84,z:-14.2,width:5.4,depth:3.8,height:8.4,title:'LIBRAIRIE',label:'书店',subtitle:'LIVRES · PAPIERS · GRAVURES',anchorLabel:'书信阅读桌',motif:'蓝色夜空'},
  {id:'florist',side:'left',x:-3.84,z:-20.3,width:5.4,depth:3.8,height:9.2,title:'FLEURS',label:'花店',subtitle:'BOUQUETS · PLANTES · GRAINES',anchorLabel:'花束搭配台',motif:'绿色呼吸'},
  {id:'atelier',side:'left',x:-3.84,z:-26.4,width:5.4,depth:3.8,height:8.5,title:'ATELIER',label:'陶器工坊',subtitle:'POTERIES · TERRE · COULEURS',anchorLabel:'陶器工作台',motif:'紫色石路'}
];
// All facade/room geometry, navigation and tests use these same transforms.
export function localToWorld(shop,u,v){const f=shop.side==='left'?1:-1;return {x:shop.x+f*v,z:shop.z-f*u};}
export function worldToLocal(shop,x,z){const f=shop.side==='left'?1:-1;return {u:(shop.z-z)*f,v:(x-shop.x)*f};}
export function localRect(shop,u,v,w,d){return {...localToWorld(shop,u,v),w:d,d:w};}
export function doorLayout(shop){const width=shop.doorWidth??1.18,center=shop.doorCenter??(-shop.width/2+.91);return {center,width,hinge:center-width/2,leafWidth:width-.06};}
export function roomArea(shop){const a=localToWorld(shop,-shop.width/2,-shop.depth),b=localToWorld(shop,shop.width/2,1.5);return {minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minZ:Math.min(a.z,b.z),maxZ:Math.max(a.z,b.z)};}
export function roomContains(shop,p){const {u,v}=worldToLocal(shop,p.x,p.z);return Math.abs(u)<shop.width/2-.1&&v<-.15&&v>-shop.depth+.1;}
export function shopFixtures(shop){return [
  {u:.45,v:.84,w:Math.min(2.5,shop.width-2.05),d:.86,kind:'display'},
  {u:.40,v:-2.9,w:1.9,d:.66,kind:'counter'},
  {u:shop.width/2-.32,v:-1.8,w:.48,d:2.65,kind:'shelf'}
];}
export function shopWalls(shop){const d=doorLayout(shop),left=-shop.width/2,right=shop.width/2,a=d.center-d.width/2,b=d.center+d.width/2;return [
  localRect(shop,(left+a)/2,0,a-left,.18),localRect(shop,(b+right)/2,0,right-b,.18),
  localRect(shop,left,-shop.depth/2,.20,shop.depth),localRect(shop,right,-shop.depth/2,.20,shop.depth),
  localRect(shop,0,-shop.depth,shop.width,.20)
];}
export const shopObstacles=shops.flatMap(s=>shopFixtures(s).map(f=>localRect(s,f.u,f.v,f.w,f.d)));
