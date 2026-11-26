import {defaultWork, normalizeWork, strokeMetrics, clamp} from './workshop-model.js?v=08-en';

export const COMMISSIONS = [
 {id:'last-train',guest:'The traveler who missed the last train',title:'The Night I Missed the Last Train',quote:'“I only remember the long street and one last light still shining.”',brief:'Leave a path into the distance and gather the warm light in one place.',targets:{quiet:.72,distance:.78,warmth:.42,motion:.28,space:.72},suggestions:['A receding street or open sky','One main source of warm light','A few foreground subjects']},
 {id:'crowded-silence',guest:'The guest sitting alone by the window',title:'A Crowd, Yet Still So Quiet',quote:'“There were voices everywhere, but that night felt like being behind glass.”',brief:'Fill the scene, but keep its rhythm steady, its colors cool, and one area open.',targets:{quiet:.68,distance:.48,warmth:.34,motion:.36,space:.5},suggestions:['More visual subjects','Predominantly cool colors','Slow, steady strokes']},
 {id:'after-rain',guest:'The guest coming off a night shift',title:'The Café After the Rain',quote:'“The lights had fallen to the ground; the pavement was brighter than the sky.”',brief:'Place reflections low in the scene and use flowing strokes to capture the air after rain.',targets:{quiet:.48,distance:.42,warmth:.55,motion:.72,space:.38},suggestions:['Choose after-rain weather','Light from below or to the side','Long horizontal strokes']}
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
 ['quiet','quiet','lively'],['distance','distant','intimate'],['warmth','warm','cool'],['motion','flowing','steady'],['space','open','full']
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
 if (resonance > .82) response=`“That is the feeling. ${strongest.join(' and ')}, yet the lights are still there.”`;
 else if (resonance > .68) response=`“Not quite as I remember it. Your night feels more ${strongest[0]}; perhaps memories change.”`;
 else response=`“That was not my night, but I would like to remember it this way: more ${strongest.join(' and ')}.”`;
 return {commission,analysis,resonance,response,traits:nightTraits(analysis)};
}
