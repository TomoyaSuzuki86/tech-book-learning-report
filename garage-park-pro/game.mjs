import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {VEHICLE,createCar,box,intersects,simulate,assessParking} from './physics.mjs';

const $ = (id)=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#afc4c9');scene.fog=new THREE.Fog('#bbcbcd',65,170);
const camera=new THREE.PerspectiveCamera(50,1,.08,230);
const mirrorCamera=new THREE.PerspectiveCamera(70,1,.09,140);
let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
}catch(err){$('overlay-title').textContent='3D表示できません';$('overlay-text').textContent='WebGLに対応したブラウザで開いてください';throw err;}

const sun=new THREE.DirectionalLight('#ffefda',3.1);sun.castShadow=true;sun.position.set(-18,38,-20);sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;sun.shadow.camera.near=.1;sun.shadow.camera.far=110;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
scene.add(new THREE.HemisphereLight('#f5faff','#515c5a',2.4));
try{const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.05).texture;pmrem.dispose();}catch(err){console.warn('No studio reflection fallback',err)}
const mats={
 asphalt:new THREE.MeshStandardMaterial({color:'#59686d',roughness:.98}),
 base:new THREE.MeshStandardMaterial({color:'#7a8785',roughness:.9}),
 concrete:new THREE.MeshStandardMaterial({color:'#9ca9a7',roughness:.89}),
 wall:new THREE.MeshStandardMaterial({color:'#b7c3bd',roughness:.8}),
 yellow:new THREE.MeshBasicMaterial({color:'#efd394'}),
 white:new THREE.MeshBasicMaterial({color:'#e9f1ed'}),
 green:new THREE.MeshBasicMaterial({color:'#9ce9a6'}),
 red:new THREE.MeshStandardMaterial({color:'#e67840',roughness:.76}),
 dark:new THREE.MeshStandardMaterial({color:'#303e43',roughness:.87}),
 metal:new THREE.MeshStandardMaterial({color:'#53656d',roughness:.45,metalness:.5}),
 black:new THREE.MeshStandardMaterial({color:'#192326',roughness:.88}),
 foliage:new THREE.MeshStandardMaterial({color:'#46675c',roughness:.95}),
};
const stage=new THREE.Group();scene.add(stage);
const parkedGroup=new THREE.Group();stage.add(parkedGroup);
const carRoot=new THREE.Group();scene.add(carRoot);
let vehicleModel=null,ready=false;
let colliders=[];
const target={x:0,z:7.7,heading:Math.PI};
const spawn={x:-2.25,z:-2.6,heading:3.42};
const state={car:createCar(spawn.x,spawn.z,spawn.heading),gear:'R',steerInput:0,steerWheelAngle:0,mode:'wheel',camera:'follow',playing:false,paused:false,finished:false,seconds:0,contacts:0,hold:0,lastContactAt:-999,elapsed:0};
const inputs={throttle:false,brake:false,turnLeft:false,turnRight:false};
const orbit={azimuth:-.68,elevation:1.07,distance:15.8};
let cameraLast=0,toastUntil=0,draggingWheel=null;
let wheelAngle=0;
const edgeOpacity=new THREE.Color('#c1f9b7');
const cameraDesired=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),helperVec=new THREE.Vector3();
function mesh(parent,geometry,material,x=0,y=0,z=0,cast=true){const obj=new THREE.Mesh(geometry,material);obj.position.set(x,y,z);obj.castShadow=cast;obj.receiveShadow=true;parent.add(obj);return obj}
function prism(parent,w,h,l,x,y,z,m,cast=true){return mesh(parent,new THREE.BoxGeometry(w,h,l),m,x,y,z,cast)}
function ground(parent,w,l,x=0,z=0,y=0,m=mats.asphalt){const o=mesh(parent,new THREE.PlaneGeometry(w,l),m,x,y,z,false);o.rotation.x=-Math.PI/2;return o}
function mark(w,l,x,z,m=mats.white,y=.027){return prism(stage,w,.012,l,x,y,z,m,false)}
function showBanner(text,seconds=3){$('guide').textContent=text;toastUntil=performance.now()+seconds*1000}
function calcDistance(){return Math.hypot(state.car.x-target.x,state.car.z-target.z)}
function addCollider(x,z,w,l,heading=0,kind='static'){colliders.push(box(x,z,w,l,heading,kind))}
function parkingLotTexture(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),data=g.createImageData(256,256);let s=97842;for(let p=0;p<256*256;p++){s=(Math.imul(s,1664525)+1013904223)>>>0;const n=(s>>>24)-128,base=145+n*.20;data.data.set([base,base+2,base+4,255],p*4)}g.putImageData(data,0,0);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(12,11);tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tx}
function addTextSign(label,w,h,x,y,z,rotate=0){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const g=canvas.getContext('2d');g.fillStyle='#182a2c';g.fillRect(0,0,512,128);g.fillStyle='#bdf5a8';g.font='900 52px system-ui,sans-serif';g.textAlign='center';g.fillText(label,256,82);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const obj=mesh(stage,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}),x,y,z,false);obj.rotation.y=rotate;return obj;
}
function makeScene(){
 ground(stage,150,150,0,0,-.11,new THREE.MeshStandardMaterial({color:'#869a90',roughness:1}));
 const asphalt=new THREE.MeshStandardMaterial({map:parkingLotTexture(),color:'#929da1',roughness:.98});ground(stage,28,32,0,0,-.04,asphalt);
 // Tight parking row, real-size bays: 2.75 × 5.45m; central bay is the target.
 const centers=[-5.5,-2.75,0,2.75,5.5];const bayStart=4.99,bayEnd=10.41;
 for(let i=0;i<centers.length;i++){
  const x=centers[i],goal=i===2;
  const paint=goal?mats.green:mats.white;
  mark(.083,bayEnd-bayStart,x-1.375,(bayStart+bayEnd)/2,paint);
  mark(.083,bayEnd-bayStart,x+1.375,(bayStart+bayEnd)/2,paint);
  mark(2.75,.083,x,bayEnd,paint);
  if(goal){
   const luminous=new THREE.MeshBasicMaterial({color:'#84f2ad',transparent:true,opacity:.15,depthWrite:false});ground(stage,2.64,5.25,x,7.69,.008,luminous);
   mark(.08,1.3,x,6.9,paint,.03);mark(.9,.08,x,7.56,paint,.03);
  }
 }
 // Wheel stops and curbs are actual visible geometry with matching collision volumes.
 for(const x of centers){prism(stage,1.95,.19,.2,x,.095,10.17,mats.concrete);addCollider(x,10.17,1.95,.2,0,'wheel-stop');}
 prism(stage,16,1.15,.45,0,.575,11.05,mats.wall);addCollider(0,11.05,16,.45,0,'wall');
 for(const x of [-8,8]){prism(stage,.4,1.1,27,x,.55,-2,mats.concrete);addCollider(x,-2,.4,27,0,'fence');}
 for(let z=-9;z<5;z+=4){mark(.11,2.0,-6.7,z,mats.yellow);mark(.11,2.0,6.7,z,mats.yellow)}
 // Chevron approach arrow: legible from the initial low-angle chase camera.
 for(let i=0;i<3;i++){mark(.08,1.2,-.5+i*.45,-4+i*.5,mats.yellow)}
 addTextSign('PRECISION PARK',3.7,.92,0,1.5,10.77);
 for(const x of [-7.25,7.25])for(const z of [4.1,-10]){
   prism(stage,.68,3.8,.68,x,1.9,z,mats.concrete);
   for(let stripe=0;stripe<3;stripe++){
    prism(stage,.72,.16,.72,x,.45+stripe*.33,z,mats.yellow,false);
   }
   addCollider(x,z,.68,.68,0,'pillar');
 }
 // Cones have their own colliders and never appear only as invisible barriers.
 for(const [x,z] of [[-5.6,-.8],[5.5,-2.5]]){
  prism(stage,.52,.07,.52,x,.035,z,mats.black,false);
  mesh(stage,new THREE.ConeGeometry(.22,.68,12),mats.red,x,.40,z);
  mesh(stage,new THREE.CylinderGeometry(.14,.17,.12,12),mats.white,x,.43,z,false);
  addCollider(x,z,.52,.52,0,'cone');
 }
 // Distant architecture creates depth and authentic curbside context.
 const buildingMats=[new THREE.MeshStandardMaterial({color:'#9baca8',roughness:.93}),new THREE.MeshStandardMaterial({color:'#a2b1b6',roughness:.83})];
 for(const side of [-1,1])for(let row=0;row<3;row++){
  const x=side*(19+row%2*7),z=-18+row*19,h=7+row*3;
  prism(stage,12,h,13,x,h*.5,z,buildingMats[row%2]);
  for(let n=0;n<3;n++)prism(stage,12.03,1.9,.11,x,2.2+n*2.7,z-6.6,mats.metal,false);
 }
 for(const side of [-1,1])for(const z of [-12,16]){
  const x=side*14;
  prism(stage,.45,3,.45,x,1.5,z,new THREE.MeshStandardMaterial({color:'#715f4d'}));
  mesh(stage,new THREE.IcosahedronGeometry(2.45,1),mats.foliage,x,4.4,z);
 }
}
makeScene();
function attachParkedCar(x,tint){
  const clone=vehicleModel.clone(true);
  clone.traverse(item=>{
    if(!item.isMesh)return;
    item.castShadow=true;item.receiveShadow=true;
    const original=Array.isArray(item.material)?item.material:[item.material];
    const materials=original.map(m=>{const next=m.clone();next.color.multiply(new THREE.Color(tint));next.roughness=Math.min(1,(next.roughness||.5)+.12);return next});
    item.material=Array.isArray(item.material)?materials:materials[0];
  });
  const parked = new THREE.Group();
  parked.add(clone);
  parked.rotation.y=Math.PI;
  parked.position.set(x,0,7.7);
  parkedGroup.add(parked);
  addCollider(x,7.7,VEHICLE.width,VEHICLE.length,Math.PI,'parked-car');
}
function worldPoint(localX,localY,localZ,angle=state.car.heading){const c=Math.cos(angle),s=Math.sin(angle);return new THREE.Vector3(state.car.x+localX*c+localZ*s,localY,state.car.z-localX*s+localZ*c)}
function setGear(gear){
 if(!ready||state.finished)return;
 if(Math.abs(state.car.velocity)>.25){showBanner('ギア切替は停止してから',1.8);return;}
 state.gear=gear;
 for(const el of document.querySelectorAll('[data-gear]')){const selected=el.dataset.gear===gear;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected))}
 showBanner(gear==='R'?'R：アクセルでバック':'D：アクセルで前進',1.7);
}
for(const el of document.querySelectorAll('[data-gear]'))el.addEventListener('click',()=>setGear(el.dataset.gear));
function setView(name){
 state.camera=name;
 for(const el of document.querySelectorAll('[data-view]')){const selected=el.dataset.view===name;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected))}
 document.body.classList.toggle('cockpit',name==='cockpit');
 if(name==='orbit')showBanner('ドラッグで車を中心に回転・ピンチで拡大',3);
 else if(name==='cockpit')showBanner('3つのミラーで後方を確認',2.6);
 else showBanner('進行方向に追従するカメラ',2);
}
for(const el of document.querySelectorAll('[data-view]'))el.addEventListener('click',()=>setView(el.dataset.view));
function hold(el,key){
 el.addEventListener('pointerdown',e=>{if(!ready||!state.playing||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();el.setPointerCapture(e.pointerId);inputs[key]=true;el.classList.add('held')});
 const release=e=>{inputs[key]=false;el.classList.remove('held');if(e.pointerId!=null&&el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId)};
 for(const n of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(n,release);
}
hold($('accelerator'),'throttle');hold($('brake'),'brake');
function pressSteer(el,key){
 el.addEventListener('pointerdown',e=>{if(!state.playing)return;e.preventDefault();el.setPointerCapture(e.pointerId);inputs[key]=true;el.classList.add('active')});
 const release=e=>{inputs[key]=false;el.classList.remove('active');if(e.pointerId!=null&&el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId)};
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,release);
}
pressSteer($('steer-left'),'turnLeft');pressSteer($('steer-right'),'turnRight');
function resetInputs(){for(const k of Object.keys(inputs))inputs[k]=false;for(const b of document.querySelectorAll('.held,.steer-arrow.active'))b.classList.remove('held','active');draggingWheel=null;wheelAngle=0;state.steerInput=0;updateWheelFace();}
function updateWheelFace(){ $('wheel-face').style.transform=`rotate(${wheelAngle.toFixed(1)}deg)`;$('steering-wheel').setAttribute('aria-valuenow',String(Math.round(wheelAngle/155*100)))}
const steeringElement=$('steering-wheel');
const angleFor=e=>{const r=steeringElement.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)};
steeringElement.addEventListener('pointerdown',e=>{if(!state.playing||state.mode!=='wheel')return;if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();steeringElement.setPointerCapture(e.pointerId);draggingWheel={pointerId:e.pointerId,previous:angleFor(e)}});
steeringElement.addEventListener('pointermove',e=>{if(!draggingWheel||draggingWheel.pointerId!==e.pointerId)return;const a=angleFor(e);let d=a-draggingWheel.previous;if(d>Math.PI)d-=2*Math.PI;if(d< -Math.PI)d+=2*Math.PI;draggingWheel.previous=a;wheelAngle=Math.max(-155,Math.min(155,wheelAngle+d*180/Math.PI));updateWheelFace()});
for(const event of ['pointercancel','pointerup','lostpointercapture'])steeringElement.addEventListener(event,e=>{if(draggingWheel?.pointerId===e.pointerId)draggingWheel=null});
steeringElement.addEventListener('keydown',e=>{if(!state.playing)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();wheelAngle=Math.max(-155,Math.min(155,wheelAngle+(e.key==='ArrowRight'?20:-20)));updateWheelFace();}if(e.key==='Home'){e.preventDefault();wheelAngle=0;updateWheelFace()}});
$('mode-toggle').addEventListener('click',()=>{state.mode=state.mode==='wheel'?'buttons':'wheel';resetInputs();$('steering-wheel').hidden=state.mode!=='wheel';$('button-steer').hidden=state.mode!=='buttons';$('mode-toggle').textContent=state.mode==='wheel'?'ボタンに切替':'ハンドルに切替';$('mode-toggle').setAttribute('aria-label',state.mode==='wheel'?'左右ボタン操作に切替':'ハンドル操作に切替')});
const keys={w:'throttle',arrowup:'throttle',s:'brake',arrowdown:'brake',a:'turnLeft',arrowleft:'turnLeft',d:'turnRight',arrowright:'turnRight',' ':'brake'};
window.addEventListener('keydown',e=>{
 if(e.target===steeringElement)return;
 const key=e.key.toLowerCase();
 if(key in keys){e.preventDefault();inputs[keys[key]]=true}
 if(!e.repeat&&key==='q')setGear('R');
 if(!e.repeat&&key==='e')setGear('D');
 if(!e.repeat&&['1','2','3'].includes(key))setView(['follow','orbit','cockpit'][Number(key)-1]);
 if(!e.repeat&&key==='escape'&&state.playing)pauseGame();
});
window.addEventListener('keyup',e=>{const key=keys[e.key.toLowerCase()];if(key){e.preventDefault();inputs[key]=false}});
window.addEventListener('blur',()=>{inputs.throttle=false;inputs.brake=false;inputs.turnLeft=false;inputs.turnRight=false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.playing)pauseGame()});
// An orbit around the *car*: gestures never translate the camera pivot away from it.
const orbitPointers=new Map();let pinchSize=0,pinchRadius=0;
const canvas=$('scene');
canvas.addEventListener('pointerdown',e=>{if(state.camera!=='orbit'||!state.playing)return;canvas.setPointerCapture(e.pointerId);orbitPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(orbitPointers.size===2){const p=[...orbitPointers.values()];pinchSize=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);pinchRadius=orbit.distance}});
canvas.addEventListener('pointermove',e=>{if(!orbitPointers.has(e.pointerId)||state.camera!=='orbit')return;const old=orbitPointers.get(e.pointerId);orbitPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(orbitPointers.size===1){orbit.azimuth-=(e.clientX-old.x)*.008;orbit.elevation=Math.min(1.47,Math.max(.46,orbit.elevation+(e.clientY-old.y)*.005))}else if(orbitPointers.size===2){const p=[...orbitPointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinchSize>0)orbit.distance=Math.min(26,Math.max(7,pinchRadius*pinchSize/Math.max(1,d)))}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{orbitPointers.delete(e.pointerId);if(orbitPointers.size<2)pinchSize=0});
canvas.addEventListener('wheel',e=>{if(state.camera!=='orbit')return;e.preventDefault();orbit.distance=Math.max(7,Math.min(26,orbit.distance*Math.exp(e.deltaY*.001)))},{passive:false});
function resetMission(){
 resetInputs();state.car=createCar(spawn.x,spawn.z,spawn.heading);state.gear='R';state.seconds=0;state.contacts=0;state.hold=0;state.lastContactAt=-999;state.finished=false;
 carRoot.position.set(spawn.x,0,spawn.z);carRoot.rotation.y=spawn.heading;
 document.querySelectorAll('[data-gear]').forEach(x=>{const selected=x.dataset.gear==='R';x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',String(selected))});
 $('speed').textContent='00';$('time').textContent='00:00';$('contacts').textContent='0';$('distance').textContent='0.0 m';$('gear-readout').textContent='R';
}
function showOverlay(type){
 $('overlay').classList.add('active');
 const start=$('start-button'),secondary=$('secondary-button'),number=$('overlay-number'),headline=$('overlay-title'),desc=$('overlay-text'),stars=$('result-score'),hint=$('start-hint');
 secondary.hidden=true;stars.hidden=true;
 if(type==='intro'){number.textContent='MISSION 01';headline.innerHTML='狙え、<em>一発駐車。</em>';desc.innerHTML='両脇に停まる車を避けて、バックで枠の中央へ。<br/>接触せず、まっすぐ停めよう。';start.textContent=ready?'運転を開始':'読み込み中…';start.disabled=!ready;hint.textContent='左のハンドルと、右のギア・ペダルで操作'}
 else if(type==='pause'){number.textContent='PAUSED';headline.innerHTML='運転を<em>一時停止。</em>';desc.innerHTML='落ち着いて、次の切り返しを考えよう。';start.textContent='運転を再開';start.disabled=false;secondary.hidden=false;secondary.textContent='最初から';hint.textContent='';}
 else if(type==='result'){number.textContent='PARKING CLEARED';headline.innerHTML='駐車、<em>成功。</em>';const score=state.contacts===0&&state.seconds<85?3:state.contacts<3?2:1;stars.textContent='★'.repeat(score)+'☆'.repeat(3-score);stars.hidden=false;desc.innerHTML=`${state.seconds.toFixed(1)} 秒　·　接触 ${state.contacts} 回<br/>${score===3?'パーフェクトな駐車！':'もう一度挑戦して、満点を目指そう。'}`;start.textContent='もう一度挑戦';start.disabled=false;hint.textContent='';}
 $('overlay').dataset.type=type;
}
$('start-button').addEventListener('click',()=>{
 if(!ready)return;
 if($('overlay').dataset.type!=='pause')resetMission();
 state.playing=true;state.paused=false;$('overlay').classList.remove('active');$('pause').setAttribute('aria-label','一時停止');
 showBanner('Rを選んで、アクセルでバック駐車！',3.8);
});
$('secondary-button').addEventListener('click',()=>{resetMission();state.playing=true;state.paused=false;$('overlay').classList.remove('active')});
function pauseGame(){if(!ready||state.finished)return;state.playing=false;state.paused=true;resetInputs();showOverlay('pause')}
$('pause').addEventListener('click',pauseGame);
function hitObstacle(o){
 if(state.seconds-state.lastContactAt<.65)return;
 state.lastContactAt=state.seconds;state.contacts++;$('contacts').textContent=String(state.contacts);
 showBanner('接触！ ハンドルを切り返そう',2.5);
 try{navigator.vibrate?.(42)}catch{}
}
function getGuidance(){
 const evaluation=assessParking(state.car,target);
 if(evaluation.aligned)return evaluation.stopped?'そのまま停止してクリア':'位置OK。ブレーキで停止';
 const d=calcDistance();
 if(d>7)return 'Rギアで後退。狭い枠を狙おう';
 if(d>3.5)return '左右の車に注意して切り返そう';
 if(evaluation.headingError>.2)return '車体を駐車枠と平行に';
 if(Math.abs(evaluation.lateral)>.3)return '中央へ、少しずつ幅寄せ';
 return 'ゆっくり位置を微調整';
}
function updateDisplay(){
 $('speed').textContent=String(Math.round(Math.abs(state.car.velocity)*3.6)).padStart(2,'0');
 $('dash-speed').textContent=$('speed').textContent;
 $('gear-readout').textContent=state.gear;
 $('distance').textContent=state.car.distance.toFixed(1)+' m';
 const t=Math.floor(state.seconds);$('time').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
 if(performance.now()>toastUntil)$('guide').textContent=getGuidance();
}
function setSteering(dt){
 if(state.mode==='wheel'){
  if(!draggingWheel)wheelAngle=wheelAngle>0?Math.max(0,wheelAngle-72*dt):Math.min(0,wheelAngle+72*dt);
  // Keyboard A/D supplements the wheel on desktop.
  const keyboard=Number(inputs.turnRight)-Number(inputs.turnLeft);
  state.steerInput=keyboard||wheelAngle/155;
  updateWheelFace();
 }else{
  state.steerInput=Number(inputs.turnRight)-Number(inputs.turnLeft);
  wheelAngle=state.steerInput*155;
 }
}
function updateSimulation(dt){
 if(!state.playing)return;
 state.seconds+=dt;
 setSteering(dt);
 const moved=simulate(state.car,{steer:state.steerInput,throttle:inputs.throttle,brake:inputs.brake,gear:state.gear},dt,colliders);
 state.car=moved.car;
 if(moved.contact)hitObstacle(moved.contact);
 const result=assessParking(state.car,target);
 state.hold=result.complete?state.hold+dt:0;
 if(state.hold>.75){state.playing=false;state.finished=true;resetInputs();showOverlay('result');try{navigator.vibrate?.([35,55,45])}catch{}}
 carRoot.position.set(state.car.x,0,state.car.z);carRoot.rotation.y=state.car.heading;
 updateDisplay();
}
function updateCamera(dt){
 const h=state.car.heading;
 if(state.camera==='orbit'){
  const radius=orbit.distance,horizontal=radius*Math.cos(orbit.elevation);
  cameraDesired.set(state.car.x+horizontal*Math.sin(orbit.azimuth),radius*Math.sin(orbit.elevation),state.car.z+horizontal*Math.cos(orbit.azimuth));
  cameraTarget.set(state.car.x,.72,state.car.z);camera.fov=48;
 }else if(state.camera==='cockpit'){
  cameraDesired.copy(worldPoint(-.4,1.47,.3,h));cameraTarget.copy(worldPoint(-.4,1.35,17,h));camera.fov=73;
 }else{
  // Driving direction chase: looking toward the parking bay when in Reverse.
  const backward=state.gear==='R';
  cameraDesired.copy(worldPoint(0,6.0,backward?9.4:-9.4,h));
  cameraTarget.copy(worldPoint(0,1.05,backward?-2.6:2.6,h));camera.fov=52;
 }
 const f=Math.min(1,1-Math.exp(-Math.min(.05,dt)*5));
 if(!cameraLast||state.camera==='cockpit'){camera.position.copy(cameraDesired)}else{camera.position.lerp(cameraDesired,f)}
 camera.up.set(0,1,0);camera.lookAt(cameraTarget);camera.updateProjectionMatrix();
 sun.position.set(state.car.x-18,38,state.car.z-20);sun.target.position.set(state.car.x,0,state.car.z);
}
function refreshSize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);const s=new THREE.Vector2();renderer.getSize(s);if(s.x!==w||s.y!==h)renderer.setSize(w,h,false);if(camera.aspect!==w/h){camera.aspect=w/h;camera.updateProjectionMatrix()}}
function drawMirror(id,localPosition,localDirection){
 const r=$(id).getBoundingClientRect(),base=canvas.getBoundingClientRect();if(r.width<4||r.height<4)return;
 const dw=renderer.domElement.width,dh=renderer.domElement.height;
 let x=Math.round((r.left-base.left)*dw/base.width),y=Math.round((base.bottom-r.bottom)*dh/base.height),w=Math.round(r.width*dw/base.width),height=Math.round(r.height*dh/base.height);
 x=Math.max(0,x);y=Math.max(0,y);w=Math.min(w,dw-x);height=Math.min(height,dh-y);if(w<=0||height<=0)return;
 const yaw=state.car.heading,c=Math.cos(yaw),s=Math.sin(yaw);
 const dx=c*localDirection[0]+s*localDirection[2],dz=-s*localDirection[0]+c*localDirection[2];
 mirrorCamera.position.copy(worldPoint(...localPosition,yaw));
 mirrorCamera.lookAt(mirrorCamera.position.clone().add(new THREE.Vector3(dx,localDirection[1],dz).multiplyScalar(20)));
 mirrorCamera.aspect=w/height;mirrorCamera.updateProjectionMatrix();
 renderer.setViewport(x,y,w,height);renderer.setScissor(x,y,w,height);renderer.clear(true,true,true);renderer.render(scene,mirrorCamera);
}
function renderFrame(){
 const dw=renderer.domElement.width,dh=renderer.domElement.height;
 renderer.setScissorTest(false);renderer.setViewport(0,0,dw,dh);
 carRoot.visible=state.camera!=='cockpit';renderer.render(scene,camera);
 if(state.camera==='cockpit'){
  renderer.setScissorTest(true);
  drawMirror('mirror-left',[-1,1.35,.45],[-.68,0,-.78]);
  drawMirror('mirror-rear',[0,1.7,-.2],[0,0,-1]);
  drawMirror('mirror-right',[1,1.35,.45],[.68,0,-.78]);
  renderer.setScissorTest(false);
 }
 carRoot.visible=true;
 if(state.camera!=='cockpit'){
  const pt=new THREE.Vector3(target.x,.22,target.z).project(camera);
  if(pt.z>-1&&pt.z<1&&Math.abs(pt.x)<.93&&Math.abs(pt.y)<.90){$('parking-cue').style.display='block';$('parking-cue').style.left=`${(pt.x*.5+.5)*100}%`;$('parking-cue').style.top=`${(-pt.y*.5+.5)*100}%`}
  else $('parking-cue').style.display='none';
 }
}
function loop(ts){requestAnimationFrame(loop);const dt=cameraLast?Math.min(.042,(ts-cameraLast)/1000):0;cameraLast=ts;
 if(ready){updateSimulation(dt);refreshSize();updateCamera(dt);renderFrame()}else{refreshSize();renderer.render(scene,camera)}
}
requestAnimationFrame(loop);
async function init(){
 try{
  // GLB shape, material maps, normals are preserved from the uploaded asset.
  // A newly published CDN edge can briefly return 404 for the GLB even after
  // the HTML is live. Retry ONCE for a network/404 error only.
  let gltf;
  try { gltf=await new GLTFLoader().loadAsync('./car.glb'); }
  catch (error) {
    if (!/404|failed to fetch|network/i.test(String(error))) throw error;
    await new Promise(resolve=>setTimeout(resolve,1000));
    gltf=await new GLTFLoader().loadAsync('./car.glb?edge=1');
  }
  vehicleModel=gltf.scene;
  let triangles=0;vehicleModel.traverse(node=>{
   if(!node.isMesh)return;triangles+=(node.geometry.index?node.geometry.index.count:node.geometry.attributes.position.count)/3;
   node.castShadow=true;node.receiveShadow=true;
   const list=Array.isArray(node.material)?node.material:[node.material];list.forEach(m=>{if(m&&'envMapIntensity'in m)m.envMapIntensity=.9});
  });
  if(triangles<1000)throw Error('車両モデルの形状が不完全です');
  const bounding=new THREE.Box3().setFromObject(vehicleModel),size=bounding.getSize(new THREE.Vector3()),center=bounding.getCenter(new THREE.Vector3());
  if(size.z<.01)throw Error('モデルの全長が正しくありません');
  const scale=VEHICLE.length/size.z;
  vehicleModel.scale.setScalar(scale);
  vehicleModel.position.set(-center.x*scale,-bounding.min.y*scale+.045,-center.z*scale);
  carRoot.add(vehicleModel);
  for(const [x,tint] of [[-5.5,'#8aa3ae'],[-2.75,'#b2c5cf'],[2.75,'#e4bfb9'],[5.5,'#8a9b94']])attachParkedCar(x,tint);
  if(intersects(state.car,colliders))throw Error('初期位置が障害物に重なっています');
  ready=true;resetMission();
  $('start-button').disabled=false;$('start-button').textContent='運転を開始';
  $('overlay').dataset.type='intro';
  showBanner('準備完了。最初はRギアでバック駐車',3);
  camera.position.copy(worldPoint(0,7.5,9.7));
  console.info('GARAGE_PARK_PRO_READY',{triangles,carWidth:size.x*scale,carLength:VEHICLE.length,colliders:colliders.length});
 }catch(error){console.error('Failed to load original car asset',error);$('overlay-title').textContent='愛車を読み込めませんでした';$('overlay-text').textContent=String(error.message||error);$('start-button').disabled=false;$('start-button').textContent='再読み込み';$('start-button').onclick=()=>location.reload()}
}
init();
window.__garageQA=Object.freeze({get ready(){return ready},get car(){return {...state.car}},get gear(){return state.gear},get contacts(){return state.contacts},get playing(){return state.playing},get camera(){return state.camera},get colliders(){return colliders.map(o=>({...o}))},get parking(){return assessParking(state.car,target)},get elapsed(){return state.seconds}});