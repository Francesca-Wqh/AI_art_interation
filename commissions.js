import {defaultWork, normalizeWork, strokeMetrics, clamp} from './workshop-model.js?v=08';

export const COMMISSIONS = [
 {id:'last-train',guest:'错过末班车的人',title:'错过末班车的晚上',quote:'“我只记得街道很远，最后一盏灯还亮着。”',brief:'留出一条通往远处的路，让暖光集中在一个地方。',targets:{quiet:.72,distance:.78,warmth:.42,motion:.28,space:.72},suggestions:['街道纵深或天空留白','一个主要暖光','少量前景主体']},
 {id:'crowded-silence',guest:'独自坐在窗边的人',title:'很多人，却还是很安静',quote:'“四周都是声音，但那晚像隔着一层玻璃。”',brief:'允许画面丰富，但让节奏稳定、颜色偏冷，并留下一处空白。',targets:{quiet:.68,distance:.48,warmth:.34,motion:.36,space:.5},suggestions:['较多视觉主体','冷色占主导','稳定而缓慢的笔触']},
 {id:'after-rain',guest:'刚结束夜班的人',title:'雨停之后的咖啡馆',quote:'“灯都落在地上，路面比天空更亮。”',brief:'让低处出现反光，用流动笔触保存雨后的空气。',targets:{quiet:.48,distance:.42,warmth:.55,motion:.72,space:.38},suggestions:['选择雨后天气','低处或侧面的光','水平长笔触']}
];
export const commissionFor = id => COMMISSIONS.find(c => c.id === id) || COMMISSIONS[0];

export function analyzeNight(state = {}) {
 const works = state.works || {}, books = normalizeWork('books', works.books) || defaultWork('books'), cloth = normalizeWork('cloth', works.cloth) || defaultWork('cloth'), atelier = normalizeWork('atelier', works.atelier) || defaultWork('atelier');
 const metrics = strokeMetrics(atelier.strokes);
 const layoutDistance = [0.72, .28, .9, .62][books.layout];
 const layoutSpace = [0.88, .32, .48, .62][books.layout];
 const activity = clamp(metrics.length / 8 + atelier.strokes.length / 45);
 const motion = clamp(metrics.turns / 20 + metrics.length / 10 + (cloth.weather === 2 ? .22 : 0));
 const warmth = clamp(cloth.balance * .58 + (1 - cloth.cool) * .14 + cloth.glow * .28);
 const space = clamp(layoutSpace * .62 + (1 - books.density) * .38);
 const quiet = clamp(1 - activity * .56 - motion * .24 + space * .28);
 const distance = clamp(layoutDistance * .65 + (1 / books.zoom - .66) * .5 + space * .12);
 return {quiet,distance,warmth,motion,space,activity};
}

const axis = [
 ['quiet','安静','热闹'],['distance','疏远','亲密'],['warmth','温暖','冷冽'],['motion','流动','稳定'],['space','留白','丰满']
];
export function nightTraits(analysis) {
 return axis.map(([key,high,low]) => ({key,label:analysis[key] >= .5 ? high : low,value:analysis[key]}));
}
export function evaluateCommission(state = {}) {
 const commission = commissionFor(state.brief), analysis = analyzeNight(state);
 const keys = Object.keys(commission.targets), distance = keys.reduce((sum,key)=>sum+Math.abs(analysis[key]-commission.targets[key]),0)/keys.length;
 const resonance = clamp(1-distance);
 const strongest = nightTraits(analysis).sort((a,b)=>Math.abs(b.value-.5)-Math.abs(a.value-.5)).slice(0,2).map(t=>t.label);
 let response;
 if (resonance > .82) response=`“就是这种感觉。${strongest.join('、')}，但灯还愿意留着。”`;
 else if (resonance > .68) response=`“和我记得的不完全一样。你的夜晚更${strongest[0]}，也许记忆本来就会改变。”`;
 else response=`“这不是我的那一晚，但我愿意把它记成这样。它更${strongest.join('、')}。”`;
 return {commission,analysis,resonance,response,traits:nightTraits(analysis)};
}
