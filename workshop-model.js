// v08: three differentiated workshop games — arrange, distribute, and trace.
export const WORKSHOP_IDS = ['books', 'cloth', 'atelier'];
export const COMPOSITION_NAMES = ['天空留白', '咖啡馆近景', '街道纵深', '窗内望街'];
export const WEATHER_NAMES = ['晴朗', '薄雾', '雨后'];
export const inkColors = ['#f2ce87', '#a9c5d3', '#d49b99', '#6e9092'];
export const TILE_SLOTS = [[.25,.25],[.75,.25],[.25,.75],[.75,.75]];
export const BEACONS = [[.18,.28],[.37,.18],[.57,.29],[.76,.18],[.84,.34]];
export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const rounded = v => Math.round(v * 10000) / 10000;
const number = (v, fallback, min = 0, max = 1) => typeof v === 'number' && Number.isFinite(v) ? rounded(clamp(v, min, max)) : fallback;
const integer = (v, fallback, min, max) => Number.isInteger(v) ? Math.max(min, Math.min(max, v)) : fallback;
const point = (p, fallback, min = .08, max = .92) => [number(p?.[0], fallback[0], min, max), number(p?.[1], fallback[1], min, max)];
export const copyWork = value => JSON.parse(JSON.stringify(value));

const tileDefaults = () => TILE_SLOTS.map(([x,y]) => ({x,y,r:0}));
const chipDefaults = () => [
  {x:.16,y:.16,kind:0}, {x:.30,y:.16,kind:1}, {x:.44,y:.16,kind:2},
  {x:.58,y:.16,kind:3}, {x:.72,y:.16,kind:4}, {x:.84,y:.16,kind:5},
  {x:.28,y:.50,kind:6}, {x:.50,y:.50,kind:7}, {x:.72,y:.50,kind:8}
];

export function defaultWork(id) {
 switch (id) {
  case 'books': return {tiles:tileDefaults(), x:.5, y:.55, zoom:1, layout:2, density:.5};
  case 'cloth': return {chips:chipDefaults(), warm:.56, cool:.62, balance:.5, contrast:.62, glow:.56, weather:0};
  case 'atelier': return {strokes:[], hits:[], ink:1, width:.012};
  // Legacy work shapes remain readable when opening an old postcard.
  case 'produce': return {items:Array.from({length:6},(_,i)=>[.38+i%3*.12,.48+Math.floor(i/3)*.14])};
  case 'wine': return {hue:.06};
  case 'bakery': return {light:[.3,.28],temperature:.15};
  case 'florist': return {flowers:Array.from({length:7},(_,i)=>[.35+i%4*.1,.3+Math.floor(i/4)*.15])};
  default: return null;
 }
}
function legacyBooks(input, d) {
 const layout = integer(input.layout, d.layout, 0, 3);
 const x = number(input.x, d.x, .2, .8), y = number(input.y, d.y, .2, .8);
 const order = layout === 2 ? [0,2,1,3] : layout === 3 ? [3,1,2,0] : layout === 1 ? [1,0,3,2] : [0,1,2,3];
 return tileDefaults().map((t,i)=>{const [sx,sy]=TILE_SLOTS[order[i]];return {...t,x:sx+(x-.5)*.16,y:sy+(y-.55)*.12};});
}
function nearestSlot(t) {
 return TILE_SLOTS.reduce((best, slot, i) => {
  const d=Math.hypot(t.x-slot[0],t.y-slot[1]),bd=Math.hypot(t.x-TILE_SLOTS[best][0],t.y-TILE_SLOTS[best][1]);
  return d<bd?i:best;
 },0);
}
function bookShape(tiles) {
 const slots=tiles.map(nearestSlot), unique=new Set(slots).size;
 const center=tiles.reduce((a,t)=>[a[0]+t.x/4,a[1]+t.y/4],[0,0]);
 const spread=tiles.reduce((n,t)=>n+Math.abs(t.x-.5)+Math.abs(t.y-.5),0)/4;
 // Layout is a coarse semantic label for the postcard; the raw tile coordinates
 // still remain in the work and are used by the workshop preview.
 const layout=slots[2]===1||slots[0]===2?2:slots[3]===0||slots[1]===2?3:(unique<4?1:0);
 return {layout,x:rounded(clamp(center[0],.2,.8)),y:rounded(clamp(center[1],.2,.8)),density:rounded(clamp(.25+spread/1.8))};
}
export function normalizeWork(id, input) {
 const d=defaultWork(id);
 if (!d || !input || typeof input !== 'object') return null;
 switch (id) {
  case 'books': {
   const raw=Array.isArray(input.tiles)&&input.tiles.length===4?input.tiles:legacyBooks(input,d);
   const tiles=raw.map((t,i)=>({x:number(t?.x,d.tiles[i].x,.12,.88),y:number(t?.y,d.tiles[i].y,.12,.88),r:integer(t?.r,0,0,3)}));
   const shape=bookShape(tiles);
   return {tiles,x:shape.x,y:shape.y,zoom:number(input.zoom,1,.75,1.5),layout:shape.layout,density:shape.density};
  }
  case 'cloth': {
   const raw=Array.isArray(input.chips)&&input.chips.length===9?input.chips:chipDefaults();
   const chips=raw.map((t,i)=>({x:number(t?.x,d.chips[i].x,.08,.92),y:number(t?.y,d.chips[i].y,.08,.92),kind:integer(t?.kind,i,0,8)}));
   const lanes=[0,1,2].map(l=>chips.filter(t=>t.y>=l/3&&t.y<(l+1)/3).length);
   const balance=clamp((lanes[0]*.2+lanes[1]*.5+lanes[2]*.8)/9);
   const warm=clamp(chips.reduce((n,t)=>n+(t.kind%3===0?1:0),0)/3);
   const cool=clamp(chips.reduce((n,t)=>n+(t.kind%3===1?1:0),0)/3);
   const contrast=clamp(.35+Math.abs(lanes[0]-lanes[2])*.16);
   const glow=clamp(.35+chips.filter(t=>t.y<.34).length*.045);
   const weather=lanes[2]>=4?2:lanes[1]>=4?1:0;
   return {chips,warm, cool, balance:rounded(balance), contrast:rounded(contrast), glow:rounded(glow), weather};
  }
  case 'atelier': return {
   strokes:(Array.isArray(input.strokes)?input.strokes:[]).slice(0,60).filter(s=>s&&Array.isArray(s.points)&&s.points.length).map(s=>({color:integer(s.color,0,0,3),width:number(s.width,.012,.004,.035),points:s.points.slice(0,140).map(p=>point(p,[.5,.5],.045,.955))})),
   hits:(Array.isArray(input.hits)?input.hits:[]).filter(Number.isInteger).map(n=>Math.max(0,Math.min(4,n))).filter((n,i,a)=>a.indexOf(n)===i).sort((a,b)=>a-b), ink:integer(input.ink,1,0,3), width:number(input.width,.012,.004,.035)
  };
  case 'produce': return {items:d.items.map((p,i)=>point(input.items?.[i],p,.1,.9))};
  case 'wine': return {hue:number(input.hue,d.hue)};
  case 'bakery': return {light:point(input.light,d.light),temperature:number(input.temperature,d.temperature)};
  case 'florist': return {flowers:d.flowers.map((p,i)=>point(input.flowers?.[i],p,.12,.88))};
  default: return null;
 }
}
export function workChoice(id, raw) {
 const w=normalizeWork(id,raw); if(!w)return null;
 if(id==='books') return w.layout===2||w.layout===3?'street':'sky';
 if(id==='cloth') return w.weather===2?'rain':w.balance>.55?'warm':'cool';
 if(id==='atelier') return w.hits.length>=3||w.strokes.some(s=>s.points.length>8)?'flow':'calm';
 if(id==='produce') return 'gathered'; if(id==='wine') return w.hue>.45?'green':'red'; if(id==='bakery') return w.temperature>.5?'moon':'ember'; if(id==='florist') return 'cluster';
 return null;
}
export function workColors(w={}) {
 const contrast=w.contrast??.58, glow=w.glow??.55;
 return {warm:`hsl(${15+(w.warm??.5)*45}, ${58+contrast*28}%, ${45+glow*25+(w.balance??.5)*8}%)`,cold:`hsl(${170+(w.cool??.6)*65+(1-(w.balance??.5))*8}, ${28+contrast*40}%, ${18+glow*18-(w.balance??.5)*5}%)`,shadow:`hsl(${190+(w.cool??.6)*45}, ${20+contrast*32}%, ${10+glow*9-(w.balance??.5)*4}%)`};
}
export function describeWork(id,w){
 if(!w)return '';
 if(id==='books')return `${w.tiles.length}/4 块街景已归位 · ${w.layout>=2?'街道线':'天空线'}`;
 if(id==='cloth')return `${w.chips.length} 枚色点 · ${w.weather===2?'雨后反光':w.weather===1?'薄雾叠色':'清晰夜色'} · 暖色 ${Math.round(w.balance*100)}%`;
 if(id==='atelier')return `${w.strokes.length} 道笔迹 · ${w.hits.length}/5 盏灯被追上`;
 return id==='produce'?'6 枚果实 · 成为最终画面的桌面主体':id==='wine'?`街区灵感 · 衬色色相 ${Math.round(w.hue*160)}°`:id==='bakery'?`街区灵感 · ${w.temperature>.5?'偏冷的月光':'偏暖的炉火'}`:'7 枝花 · 成为最终画面的前景节奏';
}
export function strokeMetrics(strokes=[]){let length=0,turns=0,dots=0,horizontal=0,vertical=0;for(const s of strokes){if(s.points.length<2){dots++;continue;}let previousAngle=null;for(let i=1;i<s.points.length;i++){const dx=s.points[i][0]-s.points[i-1][0],dy=s.points[i][1]-s.points[i-1][1];length+=Math.hypot(dx,dy);const angle=Math.atan2(dy,dx);if(Math.abs(dx)>Math.abs(dy)*1.5)horizontal++;if(Math.abs(dy)>Math.abs(dx)*1.5)vertical++;if(previousAngle!==null)turns+=Math.abs(Math.atan2(Math.sin(angle-previousAngle),Math.cos(angle-previousAngle)));previousAngle=angle;}}return {length,turns,dots,horizontal,vertical};}
