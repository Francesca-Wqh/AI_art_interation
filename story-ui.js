import {mountWorkshop,WORKSHOP_GUIDES} from './workshop-ui.js?v=08-en';
import {defaultWork,workChoice,describeWork} from './workshop-model.js?v=08-en';
import {STUDIES,studyFor,STORAGE_KEY} from './interactions.js?v=08-en';
import {evaluateCommission} from './commissions.js?v=08-en';
import {drawPostcard} from './postcard.js?v=08-en';
import {shops,doorLayout,localToWorld} from './layout.js?v=08-en';
import {cafeShop} from './cafe-door.js?v=08-en';

export function createStoryUI({story,studies,cafe,onPause,onResume,onChange,toast,storageKey=STORAGE_KEY}){
 const $=id=>document.getElementById(id),dialog=$('story-dialog'),content=$('story-content');
 const galleryKey=`${storageKey}-gallery-v08`;
 let station=null,draft=null,mode='journal',atCafe=false,tracked='cafe',lastHud='',storageOK=true,workshop=null,selectedBrief=story.brief||'last-train';
 function save(){try{localStorage.setItem(storageKey,JSON.stringify(story.snapshot()));storageOK=true;}catch{storageOK=false;}updateArt();onChange?.();}
 function updateArt(){drawPostcard(cafe.image,story.snapshot());cafe.texture.needsUpdate=true;}
 function readGallery(){try{const value=JSON.parse(localStorage.getItem(galleryKey)||'[]');return Array.isArray(value)?value.filter(item=>item&&typeof item.image==='string').slice(0,6):[];}catch{return [];}}
 function addToGallery(evaluation){const image=cafe.image.toDataURL('image/png'),entry={brief:evaluation.commission.id,title:evaluation.commission.title,guest:evaluation.commission.guest,image,traits:evaluation.traits.map(t=>t.label),timestamp:new Date().toISOString()};try{localStorage.setItem(galleryKey,JSON.stringify([entry,...readGallery()].slice(0,6)));return true;}catch{return false;}}
 function show(){onPause();if(!dialog.open)dialog.showModal();$('close-story').focus();}
 function close(){dialog.close();}
 dialog.addEventListener('close',()=>{workshop?.destroy();workshop=null;dialog.classList.remove('is-workshop');if(station)studies.restore(station);station=null;draft=null;onResume();});
 $('close-story').onclick=close;
 function header(eyebrow,title,description){workshop?.destroy();workshop=null;dialog.classList.remove('is-workshop');content.innerHTML=`<p class="overline">${eyebrow}</p><h2 id="story-title">${title}</h2><p class="story-lead">${description}</p>`;}
 function text(tag,value,className=''){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;content.append(el);return el;}
 function button(label,fn,primary=false,parent=content){const b=document.createElement('button');b.textContent=label;b.className=primary?'story-primary':'story-secondary';b.onclick=fn;parent.append(b);return b;}
 function meta(){text('p','Original interactive fiction · The shops, exercises, and stories are creative additions, not a historical reconstruction of the street in 1888.','story-fine');}
 function commissionPanel(commission=story.commission){const panel=document.createElement('div');panel.className='commission-brief';const title=document.createElement('b'),body=document.createElement('span');title.textContent=`${commission.guest} · “${commission.title}”`;body.textContent=`${commission.quote} ${commission.brief} Suggestions: ${commission.suggestions.join(' / ')}`;panel.append(title,body);content.append(panel);return panel;}
 function openStation(id){const s=studyFor(id);if(!s)return;if(station)studies.restore(station);station=id;mode='station';atCafe=false;draft=story.work(id)||defaultWork(id,story.choice(id));
  header(`Core workshop ${s.number} / ${s.shop}`,s.title,'This is not a quiz but a gesture you can explore again and again. Respond to the guest’s memory, or deliberately create a night of your own.');
  if(story.started)commissionPanel();
  dialog.classList.add('is-workshop');
  const host=document.createElement('div');content.append(host);
  const record=button(story.started?'Save this work to the journal':'Accept a commission at the café first',()=>{if(!story.started){tracked='cafe';close();toast('The café is under the yellow awning. Enter the first door and press E at the easel to collect your journal and accept a commission.');return;}const r=story.recordWork(id,workshop.value);if(r.ok){save();tracked=nextTarget();close();toast(storageOK?r.message:r.message+' Storage is unavailable; refreshing will lose this progress.');}else toast(r.message);},true);
  record.id='record-study';record.disabled=story.started&&!story.work(id);
  workshop=mountWorkshop({host,id,initial:draft,snapshot:()=>story.snapshot(),onChange:(work,changed)=>{draft=work;studies.preview(id,workChoice(id,work),work);record.disabled=story.started&&(!changed&&!story.work(id)||id==='atelier'&&!work.strokes.length);}});
  button('Leave without saving these changes',close);
  text('p',s.context,'story-fine');
  show();
 }
 function nextTarget(){return !story.started?'cafe':STUDIES.find(s=>s.core&&!story.choice(s.id))?.id||'cafe';}
 function renderCommissionPicker(){
  text('p','Choose a commission from three guests and their memories. It is not a correct answer; it guides your creation and the final response.','story-path');
  const grid=document.createElement('div');grid.className='commission-grid';content.append(grid);
  const cards=[];
  const refresh=()=>cards.forEach(({button,id})=>button.setAttribute('aria-pressed',String(id===selectedBrief)));
  for(const commission of story.commissions){const card=document.createElement('button');card.className='commission-card';card.setAttribute('type','button');card.setAttribute('aria-pressed','false');const title=document.createElement('strong'),quote=document.createElement('span'),brief=document.createElement('small');title.textContent=commission.title;quote.textContent=`${commission.guest}: ${commission.quote}`;brief.textContent=commission.brief;card.append(title,quote,brief);card.onclick=()=>{selectedBrief=commission.id;refresh();};grid.append(card);cards.push({button:card,id:commission.id});}
  refresh();
 }
 function appendStudyList(studiesToShow,label){
  text('p',label,'overline');
  const list=document.createElement('div');list.className='journal-list';content.append(list);
  for(const s of studiesToShow){const choice=s.choices.find(c=>c.id===story.choice(s.id));const row=document.createElement('button');row.className='journal-row';row.innerHTML=`<span class="journal-number" style="color:${s.color}">${choice?'✓':s.number}</span><span><b>${s.shop} <em>${s.core?'Core':'Optional'}</em></b><small>${story.work(s.id)?describeWork(s.id,story.work(s.id)):choice?choice.label:WORKSHOP_GUIDES[s.id][0]}</small></span><span aria-hidden="true">↗</span>`;row.onclick=()=>{tracked=s.id;close();toast(`${s.shop} marked. Walk there and press E near the counter.`);};list.append(row);}
 }
 function openJournal(isCafe=false){
  if(station)studies.restore(station);station=null;draft=null;mode='journal';atCafe=isCafe;
  header('A NIGHTTIME COMMISSION',!story.started?'Who is waiting for a painting tonight?':story.finished?'This memory has taken a new shape':'Turn a memory into your own night',!story.started?'Three guests bring fragments of a night. Choose a commission and respond through three different gestures.':story.finished?'The guest’s memory is not a grading rubric. Keep revising to discover a completely different night within the same commission.':'Complete the three workshops to deliver your work; each offers a different way to leave your mark.');
  if(!story.started){
   renderCommissionPicker();
   if(isCafe)button('Accept commission · Start creating',()=>{const result=story.start(selectedBrief);tracked=nextTarget();save();openJournal(true);toast(result.message);},true);
   else button('Mark the café direction',()=>{tracked='cafe';close();},true);
  }else{
   commissionPanel();
   text('p',`Three workshops ${story.coreCount} / 3${storageOK?' · Autosaved in this browser':' · Storage unavailable; refreshing will lose this progress'}`,'story-progress');
   if(story.canFinish&&isCafe)button(story.finished?'View my nightscape':'Bring my work into the nightscape',()=>{const result=story.finish();save();const evaluation=evaluateCommission(story.snapshot());if(result.changed&&!addToGallery(evaluation))toast('Your work is complete, but browser gallery storage is unavailable.');showFinal(evaluation);},true);
   else if(story.canFinish)button('Mark the café · Return to deliver',()=>{tracked='cafe';close();},true);
  }
  appendStudyList(STUDIES.filter(s=>s.core),'Three core workshops');
  text('p','This list marks directions; it does not teleport you. Press J anytime to check it. Press E at a door, walk inside, then press E at the counter. Each of the three shops offers a different activity.','story-fine');
  if(readGallery().length)button('View the café gallery',openGallery);
  const details=document.createElement('details');details.innerHTML='<summary>Artistic references and fictional boundaries</summary><p>The night sky, warm lamps, and visible brushwork of Café Terrace at Night provide a visual starting point. Composition, color relationships, and brushwork become creative activities for contemporary audiences. This experience does not impersonate Van Gogh or present invented text as his letters.</p><p>Guests, commissions, and responses are original fiction. Feedback describes connections between an artwork and a memory, without judging right or wrong.</p>';content.append(details);meta();
  if(story.started)button('Start this night again…',confirmReset);
  show();
 }
 function appendTraits(evaluation){const list=document.createElement('div');list.className='trait-list';for(const trait of evaluation.traits){const item=document.createElement('div');item.className='trait-item';const name=document.createElement('b'),value=document.createElement('span');name.textContent=trait.label;value.textContent=`${Math.round(trait.value*100)} / 100`;item.append(name,value);list.append(item);}content.append(list);}
 function showFinal(evaluation=evaluateCommission(story.snapshot())){mode='final';station=null;header('COMMISSION COMPLETE',`“${evaluation.commission.title}”`,'There is more than one way to paint a memory. Here is the night the guest sees in your composition, light, color, and brushwork.');
  const image=document.createElement('img');image.src=cafe.image.toDataURL('image/png');image.alt='A personal nightscape preserving my fragments, color dots, and strokes';image.className='final-postcard';content.append(image);
  text('p',`${evaluation.commission.guest} looks for a long time, then says: ${evaluation.response}`,'story-lead');
  text('p',`Resonance with the commission ${Math.round(evaluation.resonance*100)}% · This is not a score; it describes how the work relates to this memory.`,'story-progress');
  appendTraits(evaluation);
  text('p',story.notes().filter(s=>s.selected).map(s=>story.work(s.id)?describeWork(s.id,story.work(s.id)):s.choices.find(c=>c.id===s.selected).label).join(' / '),'story-fine');
  const a=document.createElement('a');a.className='story-primary download-postcard';a.textContent='Save my nightscape as PNG';a.download='my-night-in-arles.png';a.href=image.src;content.append(a);
  button('Return to the café and see the painting',close,true);button('View the café gallery',openGallery);button('Open my commission journal',()=>openJournal(true));meta();show();
 }
 function openGallery(){mode='gallery';station=null;const entries=readGallery();header('CAFÉ GALLERY','Every delivery is a different night',entries.length?'Your six most recent deliveries appear here. Even for the same guest, different compositions, weather, and gestures create different works.':'The gallery is empty. Complete your first commission to hang a work here.');
  const grid=document.createElement('div');grid.className='gallery-grid';content.append(grid);
  for(const entry of entries){const item=document.createElement('div');item.className='gallery-item';const image=document.createElement('img'),title=document.createElement('b'),detail=document.createElement('small');image.src=entry.image;image.alt=`Gallery work: ${entry.title}`;title.textContent=entry.title;detail.textContent=`${entry.guest} · ${(entry.traits||[]).join(' / ')}`;item.append(image,title,detail);grid.append(item);}
  button(story.started?'Return to my commission journal':'Return to commission selection',()=>openJournal(atCafe),true);show();
 }
 function confirmReset(){mode='reset';header('NEW NIGHT','Start this night again?','This clears the current commission, workshop drafts, and completion status, but keeps earlier works in the café gallery.');button('Cancel and keep my commission',()=>openJournal(atCafe),true);button('Clear and choose a new commission',()=>{story.reset();selectedBrief=story.brief;for(const s of STUDIES)studies.restore(s.id);tracked='cafe';save();openJournal(atCafe);});show();}
 function hud(position,yaw){const shop=tracked==='cafe'?cafeShop:shops.find(s=>s.id===tracked),d=doorLayout(shop),p=localToWorld(shop,d.center,1.0),dist=Math.hypot(p.x-position.x,p.z-position.z);const targetYaw=Math.atan2(-(p.x-position.x),-(p.z-position.z)),angle=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw));const bearing=dist<2.2?'nearby':Math.abs(angle)>2.35?'behind you':Math.abs(angle)<.48?'ahead':angle>0?'to your left':'to your right';
  const phase=!story.started?'Choose a commission at the café':story.finished?'Work delivered · You can keep revising':story.canFinish?'Return to the café to deliver':`Core workshop · ${story.coreCount}/3`;
  const text=`${phase}|${shop.label}|${bearing}|${Math.round(dist)}`;if(text===lastHud)return;lastHud=text;
  $('palette-status').textContent=phase;$('story-status').textContent=`${shop.id==='cafe'?'Café entrance (under the yellow awning)':shop.label} · ${bearing} · about ${Math.round(dist)} m`;
 }
 function gamepad(p,previous){
  const fresh=i=>p.buttons[i]?.pressed&&!previous[i];
  if(fresh(1)){close();return;}
  const controls=[...dialog.querySelectorAll('button,a,summary,input,canvas[tabindex]')].filter(b=>!b.disabled);
  const active=document.activeElement,index=controls.indexOf(active),left=fresh(14),right=fresh(15),up=fresh(12),down=fresh(13);
  if(fresh(4)||fresh(5)){const direction=fresh(4)?-1:1;controls[(index+direction+controls.length)%controls.length]?.focus();return;}
  if(mode==='station'&&workshop){
   if(active===workshop.canvas){if(left)workshop.key('ArrowLeft');if(right)workshop.key('ArrowRight');if(up)workshop.key('ArrowUp');if(down)workshop.key('ArrowDown');if(fresh(0))workshop.key(' ');return;}
   if(active?.type==='range'&&(left||right)){active.value=Math.max(+active.min,Math.min(+active.max,+active.value+(right?1:-1)*+active.step));active.dispatchEvent(new Event('input',{bubbles:true}));return;}
  }
  if(down||right)controls[(index+1)%controls.length]?.focus();if(up||left)controls[(index-1+controls.length)%controls.length]?.focus();if(fresh(0))active?.click();
 }
 $('journal').onclick=()=>openJournal(false);updateArt();tracked=nextTarget();
 return {openStation,openJournal,hud,gamepad,save,get open(){return dialog.open;},get mode(){return mode;}};
}
