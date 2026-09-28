import {normalizeWork, workChoice, copyWork} from './workshop-model.js?v=08';
import {commissionFor, COMMISSIONS} from './commissions.js?v=08';
// v08 keeps the seven physical storefronts, but the playable loop is three deep core workshops.
export const STORAGE_KEY='cafe-night-study-v08';
export const STUDIES=[
 {id:'books',shop:'书店',core:true,number:'01',title:'拼一条街：把四块夜景接成一条视线',concept:'构图 · 像翻动一封没有写完的信',color:'#769cca',prompt:'拖动四块街景，让道路、窗框与灯光彼此接上；空格旋转当前片段。',context:'参考同时代艺术中对构图与观看路径的重视，但不要求复原某一幅名画。',choices:[{id:'sky',label:'天空线',detail:'让断开的光线指向上方，留下更多呼吸。'},{id:'street',label:'街道线',detail:'让道路与建筑把视线带向远处。'}]},
 {id:'cloth',shop:'布料铺',core:true,number:'02',title:'编织一束光：把色点放进夜里',concept:'色彩 · 让颜色并置，而不是回答颜色题',color:'#d8ae66',prompt:'把九枚色点拖进天空、灯下或湿路三条布带；空格切换天气。',context:'把印象派的色彩并置转成可操作的布面练习：玩家决定颜色相遇的位置。',choices:[{id:'cool',label:'冷色留在天空',detail:'天空更深，灯光更像一个局部事件。'},{id:'warm',label:'暖色铺向灯下',detail:'让窗灯成为街道的呼吸。'},{id:'rain',label:'颜色落进湿路',detail:'把灯光拖到低处，留下雨后回声。'}]},
 {id:'atelier',shop:'陶器工坊',core:true,number:'03',title:'追着灯光写一笔：让观察变成动作',concept:'笔触 · 不是涂满画面，而是跟随正在消失的光',color:'#a291c6',prompt:'按住并沿着五盏短暂出现的灯画；追上的灯会成为星光、风和倒影。',context:'把梵高式的夜间观察与高更、修拉时代的形色实验转成一笔一笔的身体记忆。',choices:[{id:'calm',label:'慢慢追光',detail:'少量灯点，留下安静的空气。'},{id:'flow',label:'连续追光',detail:'更多灯点连成流动的路径。'}]}
];
export const studyFor=id=>STUDIES.find(s=>s.id===id)||null;
export function createNightPalette(saved=null){
 let started=false,finished=false,choices={},works={},brief='last-train';
 try{const s=typeof saved==='string'?JSON.parse(saved):saved;if([5,6,7,8].includes(s?.version)&&s.started===true){started=true;brief=commissionFor(s.brief).id;for(const study of STUDIES){let c=s.choices?.[study.id];if(study.id==='cloth'&&c==='gold-blue')c='warm';if(study.id==='cloth'&&c==='coral-teal')c='cool';if(study.choices.some(o=>o.id===c)){choices[study.id]=c;const w=s.version>=6?normalizeWork(study.id,s.works?.[study.id]):null;if(w&&(study.id!=='atelier'||w.strokes.length)){works[study.id]=w;choices[study.id]=workChoice(study.id,w);}}}finished=s.finished===true&&STUDIES.filter(s=>s.core).every(s=>choices[s.id]);}}catch{/* corrupt storage starts clean */}
 const count=()=>Object.keys(choices).length,coreCount=()=>STUDIES.filter(s=>s.core&&choices[s.id]).length;
 return {
  get started(){return started;},get finished(){return finished;},get canFinish(){return started&&coreCount()===3;},get collectedCount(){return count();},get coreCount(){return coreCount();},get total(){return STUDIES.length;},get brief(){return brief;},get commission(){return commissionFor(brief);},get commissions(){return COMMISSIONS;},
  choice:id=>Object.hasOwn(choices,id)?choices[id]:null,
  work:id=>Object.hasOwn(works,id)?copyWork(works[id]):null,
  start(selectedBrief=brief){const changed=!started;brief=commissionFor(selectedBrief).id;started=true;return {ok:true,changed,message:changed?`今晚的客人带来《${commissionFor(brief).title}》。完成构图、光色与笔触三项创作。`:'今晚的委托已经开始。'};},
  record(id,choice){const s=studyFor(id);if(!started)return {ok:false,message:'先回咖啡馆，接下今晚客人的委托。'};if(!s||!s.choices.some(c=>c.id===choice))return {ok:false,message:'请选择一个有效的观察结果。'};const changed=choices[id]!==choice||!!works[id];delete works[id];choices[id]=choice;if(changed)finished=false;return {ok:true,changed,message:`已记录 · ${s.choices.find(c=>c.id===choice).label}${coreCount()===3?'。可以回咖啡馆交付作品了。':'。继续完成今晚的三项核心创作。'}`};},
  recordWork(id,raw){const w=normalizeWork(id,raw);if(!started||!w||(id==='atelier'&&!w.strokes.length))return {ok:false,message:'先接下委托，并在绘画站至少留下一道自己的痕迹。'};const changed=JSON.stringify(works[id])!==JSON.stringify(w);works[id]=w;choices[id]=workChoice(id,w);if(changed)finished=false;return {ok:true,changed,message:`已保存 · ${studyFor(id).shop}的${studyFor(id).core?'核心创作':'创作'}${coreCount()===3?'。可以回咖啡馆交付今晚的作品了。':'。继续探索。'}`};},
  finish(){if(!started||coreCount()!==3)return {ok:false,message:'先完成构图、光色与笔触三项核心创作。'};const changed=!finished;finished=true;return {ok:true,changed,message:`《${commissionFor(brief).title}》已经完成，并挂进咖啡馆画廊。`};},
  reset(){started=false;finished=false;choices={};works={};brief='last-train';},
  snapshot:()=>({version:8,started,finished,choices:{...choices},works:copyWork(works),...(started?{brief}: {})}),
  notes:()=>STUDIES.map(s=>({...s,selected:choices[s.id]??null}))
 };
}
