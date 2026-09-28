import {mountWorkshop,WORKSHOP_GUIDES} from './workshop-ui.js?v=08';
import {defaultWork,workChoice,describeWork} from './workshop-model.js?v=08';
import {STUDIES,studyFor,STORAGE_KEY} from './interactions.js?v=08';
import {evaluateCommission} from './commissions.js?v=08';
import {drawPostcard} from './postcard.js?v=08';
import {shops,doorLayout,localToWorld} from './layout.js?v=08';
import {cafeShop} from './cafe-door.js?v=08';

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
 function meta(){text('p','原创交互叙事 · 店铺、练习与故事均为创作性补全，不是 1888 年街道的史实复原。','story-fine');}
 function commissionPanel(commission=story.commission){const panel=document.createElement('div');panel.className='commission-brief';const title=document.createElement('b'),body=document.createElement('span');title.textContent=`${commission.guest} · 《${commission.title}》`;body.textContent=`${commission.quote} ${commission.brief} 提示：${commission.suggestions.join(' / ')}`;panel.append(title,body);content.append(panel);return panel;}
 function openStation(id){const s=studyFor(id);if(!s)return;if(station)studies.restore(station);station=id;mode='station';atCafe=false;draft=story.work(id)||defaultWork(id,story.choice(id));
  header(`核心创作 ${s.number} / ${s.shop}`,s.title,'这不是一道题，而是一段可以反复尝试的动作。你可以回应客人的记忆，也可以故意画成自己的夜晚。');
  if(story.started)commissionPanel();
  dialog.classList.add('is-workshop');
  const host=document.createElement('div');content.append(host);
  const record=button(story.started?'把这份创作收进手记':'先去咖啡馆接下委托',()=>{if(!story.started){tracked='cafe';close();toast('咖啡馆位于黄色棚下；走进第一扇门，在画架前按 E 领取手记并接下委托。');return;}const r=story.recordWork(id,workshop.value);if(r.ok){save();tracked=nextTarget();close();toast(storageOK?r.message:r.message+' 本次存储不可用，刷新会丢失进度。');}else toast(r.message);},true);
  record.id='record-study';record.disabled=story.started&&!story.work(id);
  workshop=mountWorkshop({host,id,initial:draft,snapshot:()=>story.snapshot(),onChange:(work,changed)=>{draft=work;studies.preview(id,workChoice(id,work),work);record.disabled=story.started&&(!changed&&!story.work(id)||id==='atelier'&&!work.strokes.length);}});
  button('暂时离开，不保存这次修改',close);
  text('p',s.context,'story-fine');
  show();
 }
 function nextTarget(){return !story.started?'cafe':STUDIES.find(s=>s.core&&!story.choice(s.id))?.id||'cafe';}
 function renderCommissionPicker(){
  text('p','先从三位客人的记忆中选择一份委托。它不是标准答案，只会改变最终反馈与创作方向。','story-path');
  const grid=document.createElement('div');grid.className='commission-grid';content.append(grid);
  const cards=[];
  const refresh=()=>cards.forEach(({button,id})=>button.setAttribute('aria-pressed',String(id===selectedBrief)));
  for(const commission of story.commissions){const card=document.createElement('button');card.className='commission-card';card.setAttribute('type','button');card.setAttribute('aria-pressed','false');const title=document.createElement('strong'),quote=document.createElement('span'),brief=document.createElement('small');title.textContent=commission.title;quote.textContent=`${commission.guest}：${commission.quote}`;brief.textContent=commission.brief;card.append(title,quote,brief);card.onclick=()=>{selectedBrief=commission.id;refresh();};grid.append(card);cards.push({button:card,id:commission.id});}
  refresh();
 }
 function appendStudyList(studiesToShow,label){
  text('p',label,'overline');
  const list=document.createElement('div');list.className='journal-list';content.append(list);
  for(const s of studiesToShow){const choice=s.choices.find(c=>c.id===story.choice(s.id));const row=document.createElement('button');row.className='journal-row';row.innerHTML=`<span class="journal-number" style="color:${s.color}">${choice?'✓':s.number}</span><span><b>${s.shop} <em>${s.core?'核心':'可选'}</em></b><small>${story.work(s.id)?describeWork(s.id,story.work(s.id)):choice?choice.label:WORKSHOP_GUIDES[s.id][0]}</small></span><span aria-hidden="true">↗</span>`;row.onclick=()=>{tracked=s.id;close();toast(`已标记${s.shop}，请自行走过去；靠近柜台按 E。`);};list.append(row);}
 }
 function openJournal(isCafe=false){
  if(station)studies.restore(station);station=null;draft=null;mode='journal';atCafe=isCafe;
  header('UNE COMMANDE / 一份夜间委托',!story.started?'今晚，谁在等待一幅画？':story.finished?'这段记忆已经有了新的样子':'把一段记忆，画成你的夜晚',!story.started?'三位客人各带来一段不完整的夜晚。选择一份委托，再用三种动作回应它。':story.finished?'客人的记忆不是评分标准。你可以继续修改作品，让同一份委托长出完全不同的夜色。':'完成三间店的三种游戏就能交付；每一间都用不同的动作留下痕迹。');
  if(!story.started){
   renderCommissionPicker();
   if(isCafe)button('接下这份委托 · 开始创作',()=>{const result=story.start(selectedBrief);tracked=nextTarget();save();openJournal(true);toast(result.message);},true);
   else button('标记咖啡馆方向',()=>{tracked='cafe';close();},true);
  }else{
   commissionPanel();
   text('p',`三种游戏 ${story.coreCount} / 3${storageOK?' · 自动保存在此浏览器':' · 存储不可用，本次刷新将丢失进度'}`,'story-progress');
   if(story.canFinish&&isCafe)button(story.finished?'查看我的夜景':'把我的手作汇成夜景',()=>{const result=story.finish();save();const evaluation=evaluateCommission(story.snapshot());if(result.changed&&!addToGallery(evaluation))toast('作品已完成，但浏览器画廊存储不可用。');showFinal(evaluation);},true);
   else if(story.canFinish)button('标记咖啡馆 · 回去交付作品',()=>{tracked='cafe';close();},true);
  }
  appendStudyList(STUDIES.filter(s=>s.core),'三项核心创作');
  text('p','列表只标记方向，不会传送。按 J 随时查看；走近店门按 E，自己走进去，再靠近柜台按 E。三间店各有一种不同的小游戏。','story-fine');
  if(readGallery().length)button('查看咖啡馆画廊',openGallery);
  const details=document.createElement('details');details.innerHTML='<summary>艺术依据与虚构边界</summary><p>以《夜间露天咖啡座》的夜空、暖灯和可见笔触为视觉起点。我们把“构图、颜色关系、笔触节奏”设计成当代观众可比较的创作活动；这里没有模拟梵高本人，也不冒充他的书信原文。</p><p>客人、委托和反馈均为原创虚构。反馈只描述作品与记忆之间的呼应，不判定对错。</p>';content.append(details);meta();
  if(story.started)button('重新开始这一夜…',confirmReset);
  show();
 }
 function appendTraits(evaluation){const list=document.createElement('div');list.className='trait-list';for(const trait of evaluation.traits){const item=document.createElement('div');item.className='trait-item';const name=document.createElement('b'),value=document.createElement('span');name.textContent=trait.label;value.textContent=`${Math.round(trait.value*100)} / 100`;item.append(name,value);list.append(item);}content.append(list);}
 function showFinal(evaluation=evaluateCommission(story.snapshot())){mode='final';station=null;header('LA NUIT LIVRÉE / 委托完成',`《${evaluation.commission.title}》`,'同一份记忆不会只有一种画法。下面是客人从你的构图、光色和笔触中感受到的夜晚。');
  const image=document.createElement('img');image.src=cafe.image.toDataURL('image/png');image.alt='保留我的拼接、色点和笔迹的个人夜景';image.className='final-postcard';content.append(image);
  text('p',`${evaluation.commission.guest}看了很久，说：${evaluation.response}`,'story-lead');
  text('p',`与委托的呼应程度 ${Math.round(evaluation.resonance*100)}% · 这不是分数，只表示作品与这段记忆的接近方式。`,'story-progress');
  appendTraits(evaluation);
  text('p',story.notes().filter(s=>s.selected).map(s=>story.work(s.id)?describeWork(s.id,story.work(s.id)):s.choices.find(c=>c.id===s.selected).label).join(' / '),'story-fine');
  const a=document.createElement('a');a.className='story-primary download-postcard';a.textContent='保存我的夜景 PNG';a.download='my-night-in-arles.png';a.href=image.src;content.append(a);
  button('回到现场，看咖啡馆里的画',close,true);button('查看咖啡馆画廊',openGallery);button('翻开我的委托手记',()=>openJournal(true));meta();show();
 }
 function openGallery(){mode='gallery';station=null;const entries=readGallery();header('CAFÉ GALLERY / 咖啡馆画廊','每一次交付，都是不同的夜晚',entries.length?'这里保留最近六次交付。即使选择同一位客人，不同的构图、天气和笔触也会留下不同作品。':'画廊还是空的。完成第一份委托后，作品会挂在这里。');
  const grid=document.createElement('div');grid.className='gallery-grid';content.append(grid);
  for(const entry of entries){const item=document.createElement('div');item.className='gallery-item';const image=document.createElement('img'),title=document.createElement('b'),detail=document.createElement('small');image.src=entry.image;image.alt=`画廊作品：${entry.title}`;title.textContent=entry.title;detail.textContent=`${entry.guest} · ${(entry.traits||[]).join(' / ')}`;item.append(image,title,detail);grid.append(item);}
  button(story.started?'返回我的委托手记':'返回委托选择',()=>openJournal(atCafe),true);show();
 }
 function confirmReset(){mode='reset';header('NEW NIGHT','重新开始这一夜？','这会清除当前委托、手作和完成状态，但咖啡馆画廊中的旧作品会保留。');button('取消，保留我的委托',()=>openJournal(atCafe),true);button('确认清除，选择新委托',()=>{story.reset();selectedBrief=story.brief;for(const s of STUDIES)studies.restore(s.id);tracked='cafe';save();openJournal(atCafe);});show();}
 function hud(position,yaw){const shop=tracked==='cafe'?cafeShop:shops.find(s=>s.id===tracked),d=doorLayout(shop),p=localToWorld(shop,d.center,1.0),dist=Math.hypot(p.x-position.x,p.z-position.z);const targetYaw=Math.atan2(-(p.x-position.x),-(p.z-position.z)),angle=Math.atan2(Math.sin(targetYaw-yaw),Math.cos(targetYaw-yaw));const bearing=dist<2.2?'就在附近':Math.abs(angle)>2.35?'在身后':Math.abs(angle)<.48?'在前方':angle>0?'在左侧':'在右侧';
  const phase=!story.started?'去咖啡馆选择委托':story.finished?'作品已交付 · 可以继续修改':story.canFinish?'回咖啡馆交付作品':`核心创作 · ${story.coreCount}/3`;
  const text=`${phase}|${shop.label}|${bearing}|${Math.round(dist)}`;if(text===lastHud)return;lastHud=text;
  $('palette-status').textContent=phase;$('story-status').textContent=`${shop.id==='cafe'?'咖啡馆入口（黄色棚下）':shop.label} · ${bearing} · 约 ${Math.round(dist)} m`;
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
