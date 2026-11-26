// A lightweight entrance for testing the SAME production workbenches, not a second implementation.
import {STUDIES,createNightPalette} from './interactions.js?v=08-en';
import {createStoryUI} from './story-ui.js?v=08-en';
import {WORKSHOP_GUIDES} from './workshop-ui.js?v=08-en';
const storageKey='cafe-night-workshop-preview-v08';
let saved=null;try{saved=localStorage.getItem(storageKey);}catch{/* read-only/private contexts still allow an in-memory session */}
const story=createNightPalette(saved);story.start();
const image=document.createElement('canvas');image.width=1000;image.height=760;
let toastTimer=0;
const toast=message=>{const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),5000);};
const buttons=new Map();
function refresh(){for(const s of STUDIES){const button=buttons.get(s.id);if(button)button.querySelector('small').textContent=`${story.choice(s.id)?'✓ Saved':s.number} / Core workshop · ${s.shop}`;}document.getElementById('lab-count').textContent=`Core ${story.coreCount} / 3 · Saved ${story.collectedCount} / 3`;}
const ui=createStoryUI({story,storageKey,studies:{preview(){},restore(){}},cafe:{image,texture:{}},onPause(){},onResume:refresh,onChange:refresh,toast});
document.getElementById('journal').onclick=()=>ui.openJournal(true);
for(const s of STUDIES){const button=document.createElement('button');button.className='lab-card';const number=document.createElement('small'),title=document.createElement('strong'),text=document.createElement('span');title.textContent=WORKSHOP_GUIDES[s.id][0];text.textContent=WORKSHOP_GUIDES[s.id][3];button.append(number,title,text);button.onclick=()=>ui.openStation(s.id);document.getElementById('workshop-gallery').append(button);buttons.set(s.id,button);}
refresh();
