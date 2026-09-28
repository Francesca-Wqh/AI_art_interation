import {drawWorkshop, drawInk} from './workshop-art.js?v=08';
import {workColors,defaultWork,normalizeWork,inkColors} from './workshop-model.js?v=08';
import {commissionFor} from './commissions.js?v=08';
// Small deterministic raster studies drawn locally; no generated historical claims or external assets.
export function drawStudy(canvas,id,choice,work=null){
 if(work){drawWorkshop(canvas,id,work,-2);return;}
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.save();c.scale(w/640,h/420);
 c.fillStyle='#e8dac0';c.fillRect(0,0,640,420);c.fillStyle='#202b41';c.fillRect(22,22,596,376);
 const line=(x,y,x2,y2,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
 if(id==='books'){const y=choice==='sky'?275:155;c.fillStyle='#344f78';c.fillRect(22,22,596,y-22);for(let i=0;i<12;i++){c.fillStyle='#e8cc8d';c.fillRect(50+i*47,45+(i*31)%(y-70),4,4);}c.fillStyle='#736c75';c.fillRect(22,y,596,398-y);c.fillStyle='#c8a365';c.fillRect(55,y-25,160,120);c.fillStyle='#efd28c';c.fillRect(65,y+8,140,25);c.fillStyle='#243446';c.fillRect(430,y-60,140,165);line(250,y+100,370,395,'#ae9f86',4);}
 if(id==='cloth'){const alt=choice==='cool';const rain=choice==='rain';c.fillStyle=rain?'#526b82':alt?'#246566':'#214575';c.fillRect(22,22,596,376);c.fillStyle=alt?'#dc9176':'#e8c167';c.fillRect(140,80,360,260);for(let x=145;x<500;x+=9)line(x,80,x,340,'#ffffff22',2);for(let y=86;y<340;y+=8)line(140,y,500,y,'#382f4433',2);}
 if(id==='atelier'){c.fillStyle='#536a7a';c.fillRect(22,22,596,376);c.fillStyle='#b99e85';c.beginPath();c.ellipse(320,240,120,140,0,0,Math.PI*2);c.fill();c.fillStyle='#8c7063';c.fillRect(278,75,84,40);c.save();c.beginPath();c.ellipse(320,240,115,135,0,0,Math.PI*2);c.clip();for(let i=0;i<120;i++){const x=180+(i*57)%260,y=110+(i*43)%250;c.strokeStyle=i%2?'#e0bb89':'#796b86';c.lineWidth=choice==='flow'?7:4;c.beginPath();c.moveTo(x,y);if(choice==='flow')c.quadraticCurveTo(x+28,y-22,x+52,y+12);else c.lineTo(x+13,y);c.stroke();}c.restore();}
 if(id==='produce'){c.fillStyle='#9b8c73';c.fillRect(22,260,596,138);for(let i=0;i<6;i++){const spread=choice==='scattered',x=spread?95+i*85:240+(i%3)*55,y=spread?253+(i%2)*40:230+Math.floor(i/3)*48;c.fillStyle=i%2?'#b2a353':'#cc8660';c.beginPath();c.ellipse(x,y,29,27,0,0,7);c.fill();line(x,y-24,x+4,y-36,'#5c6550',3);}}
 if(id==='wine'){c.fillStyle=choice==='green'?'#6a806d':'#98545d';c.fillRect(22,22,596,376);c.fillStyle='#c2ad86';c.fillRect(22,345,596,53);c.fillStyle='#283f38';c.fillRect(264,145,112,198);c.fillRect(297,67,46,90);c.fillStyle='#d9c5a2';c.fillRect(266,226,108,65);line(285,166,285,210,'#a4b5a0',8);}
 if(id==='bakery'){c.fillStyle=choice==='moon'?'#506b98':'#bc764b';c.fillRect(22,22,596,376);c.fillStyle='#e1b275';c.beginPath();c.ellipse(320,253,195,74,-.10,0,7);c.fill();for(let i=0;i<5;i++)line(190+i*58,226-i*3,212+i*58,269-i*3,choice==='moon'?'#94aac0':'#ffe0a0',12);}
 if(id==='florist'){for(let i=0;i<9;i++){const wild=choice==='wild',x=wild?90+(i*87)%450:260+(i*41)%130,y=wild?75+(i*59)%190:112+(i*37)%95;line(320,335,x,y,'#809178',5);c.fillStyle=i%2?'#e0ad70':'#c990a1';for(let j=0;j<6;j++){c.beginPath();c.ellipse(x+Math.cos(j)*16,y+Math.sin(j)*16,15,13,0,0,7);c.fill();}}c.fillStyle='#bac1b8';c.fillRect(281,305,78,75);}
 c.restore();
}
export function drawPostcard(canvas,state={}){
 const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.save();c.scale(w/1000,h/760);
 const works=state.works||{},q=state.choices||{},books=normalizeWork('books',works.books)||defaultWork('books',q.books),cloth=normalizeWork('cloth',works.cloth)||defaultWork('cloth',q.cloth),atelier=normalizeWork('atelier',works.atelier)||defaultWork('atelier'),produce=normalizeWork('produce',works.produce)||(q.produce?defaultWork('produce',q.produce):null),wine=normalizeWork('wine',works.wine)||(q.wine?defaultWork('wine',q.wine):null),bakery=normalizeWork('bakery',works.bakery)||(q.bakery?defaultWork('bakery',q.bakery):null),florist=normalizeWork('florist',works.florist)||(q.florist?defaultWork('florist',q.florist):null);
 const colors=workColors(cloth),warm=colors.warm,cold=colors.cold,shadow=colors.shadow,layout=books.layout??0,density=books.density??.48,weather=cloth.weather??0;
 const frame=wine?`hsl(${wine.hue*160},29%,39%)`:'#88765f';
 const polygon=(pts,color)=>{c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 const line=(x,y,x2,y2,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
 const ellipse=(x,y,rx,ry,color,rotation=0)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fill();};
 c.fillStyle='#eee2c9';c.fillRect(0,0,1000,760);c.fillStyle=frame;c.fillRect(27,27,946,642);c.fillStyle=cold;c.fillRect(40,40,920,616);
 c.save();c.beginPath();c.rect(40,40,920,616);c.clip();
 const focusShift=(books.x-.5)*210,horizonShift=(books.y-.5)*120;
 c.translate(focusShift,0);c.translate(500,350);c.scale(books.zoom,books.zoom);c.translate(-500,-350);
 let horizon=layout===0?420:layout===1?285:layout===2?340:325;horizon+=horizonShift;
 // Sky field reacts globally to the mixed palette.
 c.fillStyle=cold;c.fillRect(-260,-40,1520,Math.max(260,horizon+40));
 if(weather===1){for(let i=0;i<14;i++)ellipse(-100+(i*97)%1250,80+(i%5)*72,130,38,'#edf0e715');}
 if(weather===2){for(let i=0;i<44;i++)line(-80+(i*83)%1220,45+(i*47)%Math.max(140,horizon-30),-92+(i*83)%1220,86+(i*47)%Math.max(140,horizon-30),'#d9e6ed55',2);}
 const starCount=Math.round(10+(1-density)*32+(weather===0?12:0));
 for(let i=0;i<starCount;i++){const x=-60+(i*137)%1120,y=62+(i*71)%Math.max(90,horizon-100);ellipse(x,y,i%5===0?4:2.1,i%5===0?4:2.1,'#efd294');}
 const windows=(x,y,width,height,count)=>{for(let i=0;i<count;i++){const xx=x+18+(i*53)%Math.max(30,width-35),yy=y+25+(i*67)%Math.max(40,height-45);c.fillStyle=i%3===0?warm:'#384b57';c.fillRect(xx,yy,22,34);}};
 if(layout===0){
  polygon([[-180,horizon+35],[355,horizon-5],[420,656],[-180,656]],'#827683');polygon([[355,horizon-5],[1120,horizon+24],[1120,656],[420,656]],'#596d74');
  c.fillStyle=warm;c.fillRect(-70,horizon-145,330,260);c.fillStyle='#394b5e';c.fillRect(690,horizon-125,360,255);windows(-70,horizon-145,330,220,Math.round(3+density*7));windows(690,horizon-125,360,220,Math.round(2+density*6));
  c.fillStyle=warm;c.fillRect(-80,horizon-18,375,34);
 }
 if(layout===1){
  c.fillStyle=warm;c.fillRect(-120,80,630,520);c.fillStyle='#f0cf86';c.fillRect(-130,155,660,48);c.fillStyle=shadow;c.fillRect(510,145,610,455);
  windows(-80,190,540,340,Math.round(6+density*14));windows(530,160,530,370,Math.round(3+density*9));
  polygon([[-180,horizon+100],[1120,horizon+25],[1120,656],[-180,656]],'#756f76');
  for(let i=0;i<Math.round(3+density*8);i++){const x=60+i*82,y=horizon+155-(i%3)*14;ellipse(x,y,34,12,'#eadcc2');line(x,y,x,y+48,'#735d49',5);}
 }
 if(layout===2){
  const vanish=500+(books.x-.5)*180;polygon([[-180,656],[vanish-42,horizon],[vanish+42,horizon],[1120,656]],'#7f7880');polygon([[-180,horizon-20],[vanish-42,horizon],[-180,656]],warm);polygon([[1120,horizon-45],[vanish+42,horizon],[1120,656]],'#384d5d');
  line(-180,656,vanish,horizon,'#d6bd8b55',6);line(1120,656,vanish,horizon,'#d6bd8b55',6);
  for(let i=0;i<Math.round(4+density*10);i++){const t=(i+1)/(6+density*10),x=vanish+(i%2?1:-1)*(70+t*330),y=horizon+t*230,scale=.35+t*.8;c.fillStyle=i%3===0?warm:'#334952';c.fillRect(x,y,28*scale,58*scale);}
 }
 if(layout===3){
  c.fillStyle='#101922';c.fillRect(-180,-40,1280,696);c.fillStyle=cold;c.fillRect(155,70,690,475);c.fillStyle=warm;c.fillRect(155,300,330,245);c.fillStyle='#3a4c5c';c.fillRect(485,255,360,290);windows(155,300,690,220,Math.round(4+density*9));
  c.strokeStyle='#a77e4f';c.lineWidth=34;c.strokeRect(130,45,740,525);line(500,52,500,560,'#a77e4f',22);line(137,285,860,285,'#a77e4f',16);c.fillStyle='#5c4939';c.fillRect(-180,570,1280,86);
 }
 // Legacy optional-light data remains renderable for old saves.
 if(bakery){const bx=80+bakery.light[0]*800,by=110+bakery.light[1]*500,light=bakery.temperature>.5?'#abc6ed':'#f4bd69';ellipse(bx,by,120+cloth.glow*90,52+cloth.glow*45,light+'28',-.16);line(bx,by,bx+(500-bx)*.5,Math.min(630,horizon+210),light+'88',8);}
 // Legacy saves had only a gesture category; keep it visually meaningful after migration.
 if(!works.atelier&&q.atelier){if(q.atelier==='flow'){for(let i=0;i<7;i++){const y=115+i*42;c.strokeStyle=i%2?'#a9c5d388':'#f2ce8777';c.lineWidth=6+i%3;c.beginPath();c.moveTo(120,y);c.quadraticCurveTo(430,y-55,820,y+22);c.stroke();}}else{for(let i=0;i<9;i++)line(170+(i%3)*210,130+Math.floor(i/3)*75,245+(i%3)*210,130+Math.floor(i/3)*75,i%2?'#a9c5d377':'#f2ce8766',5);}}
 // User marks first remain visible, then semantic echoes grow beside them.
 if(atelier.strokes.length){drawInk(c,atelier.strokes,45,45,910,Math.max(300,horizon-55));for(const s of atelier.strokes){const pts=s.points;if(!pts.length)continue;const mapped=pts.map(p=>[45+p[0]*910,45+p[1]*Math.max(300,horizon-55)]);if(pts.length===1){const [x,y]=mapped[0];ellipse(x,y,9+s.width*150,9+s.width*150,inkColors[s.color]+'55');continue;}const a=mapped[0],b=mapped.at(-1),dx=b[0]-a[0],dy=b[1]-a[1];if(Math.abs(dx)>Math.abs(dy)*1.35){line(a[0],Math.min(640,a[1]+185),b[0],Math.min(640,b[1]+185),inkColors[s.color]+'66',5+s.width*130);line(a[0],Math.min(650,a[1]+198),b[0],Math.min(650,b[1]+198),inkColors[s.color]+'22',11+s.width*180);}else{c.strokeStyle=inkColors[s.color]+'3d';c.lineWidth=12+s.width*160;c.beginPath();mapped.forEach(([x,y],i)=>i?c.lineTo(x+18,y-9):c.moveTo(x+18,y-9));c.stroke();}}}
 // The lights the player actually reached become a second layer of marks.
 if(atelier.hits?.length){const beacons=[[.18,.28],[.37,.18],[.57,.29],[.76,.18],[.84,.34]];for(const index of atelier.hits){const [px,py]=beacons[index]||beacons[0],x=45+px*910,y=45+py*Math.max(300,horizon-55);ellipse(x,y,16+index*2,16+index*2,inkColors[(index+1)%inkColors.length]+'55');line(x-25,y+28,x+38,y+8,inkColors[(index+1)%inkColors.length]+'88',3);}}
 // Rain turns the road into a major reflective plane.
 if(weather===2){c.fillStyle='#b9d2dd1f';c.fillRect(-180,Math.max(390,horizon),1280,656-Math.max(390,horizon));for(let i=0;i<18;i++){const x=-40+(i*83)%1060,y=Math.max(420,horizon)+25+(i%7)*28;line(x,y,x+36+(i%3)*20,y,warm+'55',3);}}
 // Legacy produce data remains renderable for old saves.
 if(produce){c.fillStyle='#725e49';c.fillRect(-40,535,430,90);ellipse(170,535,230,42,'#dac9aa');for(const [i,p] of produce.items.entries()){const x=-5+p[0]*390,y=500+p[1]*120;ellipse(x,y,18,17,i%2?'#c69b5f':'#bd745d');line(x,y-15,x+4,y-28,'#52634c',3);}}
 if(florist){for(const [i,p] of florist.flowers.entries()){const x=700+(p[0]-.5)*360,y=250+p[1]*280;line(850,630,x,y,'#7e9878',5);ellipse(x,y,13,13,i%2?'#d8a16f':'#c9869a');}c.fillStyle='#a6afac';c.fillRect(805,575,92,80);}
 c.restore();
 // A restrained paint texture, no longer overpowering the player's marks.
 for(let i=0;i<95;i++){const x=45+(i*113)%905,y=45+(i*73)%606;line(x,y,x+5+(i%4)*3,y+(i%3)-1,i%2?'#f1d4a225':'#9db8c127',1.4+(i%3));}
 c.fillStyle='#464a4e';c.font='23px Georgia';c.fillText(commissionFor(state.brief).title,43,705);c.font='14px sans-serif';c.textAlign='right';c.fillText(state.finished?'已交付给今晚的客人':'创作中的夜晚',955,704);c.fillStyle='#8b8272';c.font='11px sans-serif';c.fillText('COMPOSITION / LIGHT / GESTURE · '+commissionFor(state.brief).guest,955,735);c.restore();
}
