import {createDoorState,advanceDoor,requestDoorToggle} from './doors.js?v=08';
import {roomContains,localToWorld,localRect,shopWalls} from './layout.js?v=08';
// The first arch is replaced by a real doorway. Coordinates shared with rendering.
export const cafeShop={id:'cafe',label:'咖啡馆',side:'left',x:-4.08,z:2.1,width:2.9,depth:3.30,doorCenter:0,doorWidth:1.42};
export const cafeRoom={minX:-7.38,maxX:-2.5,minZ:.65,maxZ:3.55};
export const cafeAnchor={id:'cafe:night-study',shopId:'cafe',label:'夜色手记与画架',...localToWorld(cafeShop,.12,-1.95)};
export const cafeFixtures=[localRect(cafeShop,.66,-2.85,1.2,.5),localRect(cafeShop,-1.11,-2.0,.38,1.55)];
// Exclude the original solid building from this one room; all other recesses stay closed.
export const cafeBuildingColliders=[
 {x:-5.8,z:(-9.9+.55)/2,w:3.7,d:.55+9.9},
 {x:-5.8,z:(3.65+4.1)/2,w:3.7,d:4.1-3.65},
 ...shopWalls(cafeShop),...cafeFixtures
];
export const createCafeDoorState=()=>createDoorState(cafeShop);
export const cafeRoomContains=p=>roomContains(cafeShop,p);
export const requestCafeDoorToggle=requestDoorToggle;
export const advanceCafeDoor=advanceDoor;
