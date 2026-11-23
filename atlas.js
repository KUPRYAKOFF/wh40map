'use strict';
const $ = id => document.getElementById(id);
const canvas=$('view'), ctx=canvas.getContext('2d');
const tau=Math.PI*2, clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let seed=40000;
function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296}
function gauss(){return Math.sqrt(-2*Math.log(Math.max(.0001,rand())))*Math.cos(tau*rand())}
const regions={
 'Солар':[-27,28,'#d6b479'],'Обскурус':[-38,-44,'#9badce'],'Ультима':[52,4,'#78b5c6'],
 'Темпестус':[-17,63,'#cc927d'],'Пацификус':[-68,8,'#96b69e'],'Без привязки':[0,0,'#a5acb9']};
const anchors={'Terra':[-26,25,1],'Mars':[-25.1,24.4,1],'Cadia':[-46,-32,0],'Fenris':[-25,-30,2],'Baal':[31,-48,2],'Macragge':[61,41,0],"T'au":[78,24,0],'Armageddon':[-18,12,1],'Necromunda':[-17,27,0],'Catachan':[16,36,0],'Medrengard':[-53,-36,-1],'Sicarus':[-50,-43,0],'Prospero':[18,-2,0],'Sortiarius':[19,-1,1]};
const groups={};
for(const w of worlds){
 w.region=Object.keys(regions).find(r=>w.loc.startsWith('Сегментум '+r))||(/Око Ужаса/.test(w.loc)?'Обскурус':/Восточная окраина/.test(w.loc)?'Ультима':'Без привязки');
 if(w.en==='Stygies VIII')w.region='Пацификус';
 let [x,z,color]=regions[w.region];w.color=color;
 let key=['Миры Саббат','подсектор Аурелия','Система Карува','Ультрамар','система Истваан','Око Ужаса','сектор Скар','Восточная окраина'].find(k=>w.loc.includes(k));
 if(key){const fixed={'Око Ужаса':[-51,-39],'Ультрамар':[61,41],'Восточная окраина':[76,20],'Система Карува':[24,67]};if(!groups[key])groups[key]=fixed[key]||[x+gauss()*6,z+gauss()*6];[x,z]=groups[key]}
 const spread=key?3.8:11;
 w.pos=anchors[w.en]||[x+gauss()*spread,z+gauss()*spread,gauss()*2.5];
}
const eye={name:'Око Ужаса',en:'Eye of Terror',region:'Обскурус',color:'#e67fb9',pos:[-53,-40,2],status:'Варп-аномалия',desc:'Область, где варп соприкасается с реальным пространством. Из глубин Ока начинались Чёрные крестовые походы.',loc:'Сегментум Обскурус. Ориентир на краю Ока — Кадианские врата.'};
const all=[...worlds,eye], leaders=[eye,...['Terra','Cadia','Fenris','Baal','Macragge',"T'au",'Armageddon','Catachan'].map(n=>worlds.find(w=>w.en===n))];
for(const region of Object.keys(regions))$('segment').add(new Option(region,region));
let visible=all, selected=null, hit=[], width,height,yaw=-.11,tilt=.83,target=[0,0,0],zoom=1,dirty=true;
function invalidate(){dirty=true}
function reset(){yaw=-.11;tilt=.83;target=[0,0,0];zoom=1;hide();invalidate()}
function hide(){selected=null;$('detail').hidden=true;updateList();invalidate()}
function select(w,focus=true){
 selected=w;$('kind').textContent=w===eye?'ВАРП-АНОМАЛИЯ':'ДОСЬЕ МИРА';$('worldName').textContent=w.name;$('eng').textContent=w.en;
 $('description').textContent=w.desc;$('status').textContent=w.status;$('location').textContent=w.loc;$('detail').hidden=false;
 if(focus){target=[...w.pos];zoom=2.2}
 $('catalog').classList.remove('open');updateList();invalidate();
}
function norm(s){return s.toLowerCase().replace(/ё/g,'е').replace(/[’'\s-]/g,'')}
function updateList(){
 const query=norm($('query').value),region=$('segment').value;
 visible=all.filter(w=>(!region||w.region===region)&&norm(w.name+' '+w.en).includes(query));
 const frag=document.createDocumentFragment();
 for(const w of visible){
 const b=document.createElement('button');b.className='entry';b.setAttribute('aria-pressed',w===selected);
 const orb=document.createElement('i');orb.className='orb';orb.style.setProperty('--tint',w.color);
 const label=document.createElement('span');label.textContent=w.name;const en=document.createElement('small');en.textContent=w.en;label.append(en);b.append(orb,label);b.onclick=()=>select(w);frag.append(b)}
 if(!visible.length){const m=document.createElement('p');m.id='empty';m.textContent='Совпадений нет';frag.append(m)}
 $('count').textContent=visible.length+' / '+all.length;$('list').replaceChildren(frag);invalidate()
}
for(const id of ['query','segment'])$(id).oninput=()=>{hide()};
$('eyeJump').onclick=()=>{$('query').value='';$('segment').value='';select(eye)};
$('home').onclick=reset;$('close').onclick=hide;$('catalogToggle').onclick=()=>$('catalog').classList.toggle('open');$('help').onclick=()=>{$('hint').hidden=!$('hint').hidden};
function magnify(f){zoom=clamp(zoom*f,.45,18);invalidate()}
$('plus').onclick=()=>magnify(1.3);$('minus').onclick=()=>magnify(1/1.3);
const stars=[],clouds=[],background=[],colors=['#95bdde','#c3d4df','#e4c298','#76a5bb','#b7a1bf'];
function armPoint(){
 const radius=Math.pow(rand(),.65)*93, arm=Math.floor(rand()*4),a=arm*Math.PI/2+radius*.036+gauss()*(.084+radius*.0006);
 return [radius*Math.cos(a)+gauss()*2,radius*Math.sin(a)+gauss()*2,gauss()*(1+5*Math.exp(-radius/20))]}
for(let i=0;i<9500;i++){
 const p=armPoint();stars.push({p,c:colors[Math.floor(rand()*colors.length)],s:.18+rand()**4*.85,a:.2+rand()*.65});
}
function glow(color){const im=document.createElement('canvas');im.width=im.height=96;const c=im.getContext('2d'),g=c.createRadialGradient(48,48,0,48,48,48);for(const [s,a] of [[0,.9],[.19,.48],[.54,.13],[1,0]])g.addColorStop(s,'rgba('+color+','+a+')');c.fillStyle=g;c.fillRect(0,0,96,96);return im}
const mist=[glow('78,129,168'),glow('116,147,168'),glow('167,135,103'),glow('118,76,151')],core=glow('245,192,129'),warp=glow('214,64,137');
for(let i=0;i<1500;i++){let p=armPoint();clouds.push({p,s:3+rand()*8,im:mist[Math.floor(rand()*4)]})}
for(let i=0;i<400;i++)background.push([rand(),rand(),rand()]);
const tendrils=[];
for(let j=0;j<30;j++){const path=[],phase=rand()*tau,r=3+rand()*10;for(let i=0;i<44;i++){const a=phase+i*.055;
 path.push([eye.pos[0]+Math.cos(a)*r*(.3+i/60),eye.pos[1]+Math.sin(a)*r*.65,2+Math.sin(a*2+j)*2])}tendrils.push(path)}
let focal,dist,cy,sy,ct,st;
function project(p){
 const x=p[0]-target[0],z=p[1]-target[1],y=p[2]-target[2],horizontal=x*cy-z*sy,depth=x*sy+z*cy;
 const f=focal/(dist-depth*ct-y*st);
 return {x:width*.5+horizontal*f,y:height*.51+(depth*st-y*ct)*f,f};
}
function line(path,color){ctx.strokeStyle=color;ctx.beginPath();let move=true;for(const point of path){let p=project(point);if(p.f<=0){move=true;continue}if(move)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);move=false}ctx.stroke()}
const rings=[24,46,68,90,97].map(r=>Array.from({length:181},(_,i)=>[r*Math.cos(i*tau/180),r*Math.sin(i*tau/180),-3]));
function blob(im,p,r){if(p.f<=0)return;const s=Math.min(2000,r*p.f);ctx.drawImage(im,p.x-s,p.y-s,s*2,s*2)}
function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,tau);ctx.fill()}
function draw(){
 cy=Math.cos(yaw);sy=Math.sin(yaw);ct=Math.cos(tilt);st=Math.sin(tilt);dist=230;focal=Math.min(width*.0049,height*.0064)*dist*zoom;
 ctx.clearRect(0,0,width,height);for(const [x,y,v] of background){ctx.globalAlpha=.15+v*.52;ctx.fillStyle='#b6cedc';ctx.fillRect(x*width,y*height,.5+v,.5+v)}
 ctx.globalAlpha=1;ctx.lineWidth=.7;
 for(const r of rings)line(r,'#728da03d');
 for(let i=0;i<12;i++){const a=i*tau/12;line([[0,0,-3],[97*Math.cos(a),97*Math.sin(a),-3]],'#698ba526')}
 ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.115;
 for(const c of clouds)blob(c.im,project(c.p),c.s);
 const center=project([0,0,0]);ctx.globalAlpha=.72;blob(core,center,17);blob(core,center,6);
 for(const s of stars){const p=project(s.p);if(p.f<=0||p.x<0||p.x>width||p.y<0||p.y>height)continue;ctx.globalAlpha=s.a;ctx.fillStyle=s.c;const r=Math.min(3,s.s*(.65+.1*p.f));ctx.fillRect(p.x,p.y,r,r)}
 ctx.globalAlpha=.8;blob(warp,project(eye.pos),14);
 for(const path of tendrils)line(path,'rgba(225,105,181,.42)');
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 hit=visible.map(w=>({w,...project(w.pos)})).filter(p=>p.f>0&&p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height).sort((a,b)=>a.f-b.f);
 for(const p of hit){const important=leaders.includes(p.w)||p.w===selected;const r=p.w===eye?4:important?3.5:2.1;
 dot(p.x,p.y,r+3,p.w.color+'27');dot(p.x,p.y,r,p.w.color);
 if(important){ctx.strokeStyle=p.w.color;ctx.beginPath();ctx.arc(p.x,p.y,p.w===selected?11:7,0,tau);ctx.stroke()}}
 const blocks=[];
 let order=[...new Set([selected,...leaders,...(zoom>1.6||visible.length<14?visible:[])])].filter(Boolean);
 for(const w of order){const p=hit.find(v=>v.w===w);if(!p)continue;
 ctx.font=(w===eye?'bold ':'')+'12px Arial';const name=w.name.split(' / ')[0],tw=ctx.measureText(name).width;
 const x=p.x+12,y=p.y-8;if(blocks.some(b=>x<b.x+b.w&&x+tw>b.x&&Math.abs(y-b.y)<16))continue;blocks.push({x,y,w:tw});
 ctx.lineWidth=3;ctx.strokeStyle='#090c14';ctx.strokeText(name,x,y);ctx.fillStyle=w===eye?'#ffb5d8':'#e3e7e8';ctx.fillText(name,x,y)}
 $('scale').textContent='× '+zoom.toFixed(1).replace('.',',');
}
function resize(){const box=canvas.getBoundingClientRect();width=box.width;height=box.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);invalidate()}
new ResizeObserver(resize).observe(canvas);
function frame(){if(dirty&&width){dirty=false;draw()}requestAnimationFrame(frame)}requestAnimationFrame(frame);
function pan(dx,dy){const k=focal/dist||1;target[0]-=(dx*cy+dy*st*sy)/k;target[1]-=(-dx*sy+dy*st*cy)/k;target[2]+=dy*ct/k;invalidate()}
const pointers=new Map();let dragged=false,start;
canvas.oncontextmenu=e=>e.preventDefault();
canvas.onpointerdown=e=>{canvas.focus();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){dragged=false;start=[e.clientX,e.clientY]}else dragged=true};
canvas.onpointermove=e=>{const old=pointers.get(e.pointerId);if(!old)return;const x=e.clientX,y=e.clientY,dx=x-old[0],dy=y-old[1];if(Math.hypot(x-start[0],y-start[1])>4)dragged=true;
 if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1];const d=Math.hypot(old[0]-other[0],old[1]-other[1]);if(d>4)magnify(Math.hypot(x-other[0],y-other[1])/d);pan(dx/2,dy/2)}
 else if(e.buttons===2||e.shiftKey||e.buttons===4)pan(dx,dy);else{yaw+=dx*.006;tilt=clamp(tilt+dy*.006,-1.45,1.55);invalidate()}pointers.set(e.pointerId,[x,y])};
canvas.onpointerup=e=>{pointers.delete(e.pointerId);if(dragged||e.button!==0)return;const box=canvas.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;
 const nearest=hit.map(p=>[Math.hypot(p.x-x,p.y-y),p.w]).sort((a,b)=>a[0]-b[0])[0];if(nearest&&nearest[0]<14)select(nearest[1],false)};
canvas.onpointercancel=e=>{pointers.delete(e.pointerId);dragged=true};
canvas.addEventListener('wheel',e=>{e.preventDefault();magnify(Math.exp(-clamp(e.deltaY,-250,250)*.0018))},{passive:false});
canvas.onkeydown=e=>{const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(dir){e.preventDefault();if(e.shiftKey)pan(dir[0]*28,dir[1]*28);else{yaw+=dir[0]*.12;tilt=clamp(tilt+dir[1]*.1,-1.45,1.55);invalidate()}}else if(['+','='].includes(e.key))magnify(1.25);else if(e.key==='-')magnify(.8);else if(e.key==='Home')reset();else if(e.key==='Escape')hide()};
updateList();
