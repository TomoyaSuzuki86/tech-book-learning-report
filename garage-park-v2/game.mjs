import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {CAR, fresh, obb, collisionAt, simulate, parkingResult} from './physics.mjs';

const $=id=>document.getElementById(id),canvas=$('game');
let renderer;
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.25;
}catch(e){showError('3D表示の初期化に失敗しました。WebGLを有効にしたChromeで開いてください。');throw e}
const scene=new THREE.Scene();scene.background=new THREE.Color('#b2c5d2');scene.fog=new THREE.Fog('#c2d0d4',65,185);
const cam=new THREE.PerspectiveCamera(52,1,.09,220),mirrorCam=new THREE.PerspectiveCamera(70,1,.09,130);
const lightA=new THREE.HemisphereLight('#f6fdff','#67716f',2.35);scene.add(lightA);
const sunlight=new THREE.DirectionalLight('#fff3df',2.9);sunlight.position.set(-20,38,-24);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);sunlight.shadow.camera.left=-31;sunlight.shadow.camera.right=31;sunlight.shadow.camera.top=31;sunlight.shadow.camera.bottom=-31;sunlight.shadow.camera.near=.5;sunlight.shadow.camera.far=125;sunlight.shadow.normalBias=.03;scene.add(sunlight,sunlight.target);
try{const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose()}catch(e){console.warn('Environment lighting fallback',e)}
const mat=(hex,roughness=.87,metalness=0)=>new THREE.MeshStandardMaterial({color:hex,roughness,metalness});
const pavement=mat('#4b575e'),concrete=mat('#8c9899'),wallMat=mat('#adb8b7'),paint=new THREE.MeshBasicMaterial({color:'#f2f1e5'}),paintYellow=new THREE.MeshBasicMaterial({color:'#f5d47e'}),paintGreen=new THREE.MeshBasicMaterial({color:'#98f4c0'}),coneMat=mat('#ee853d',.7),coneWhite=mat('#f6ede0');
const world=new THREE.Group();scene.add(world);
function cube(group,w,h,d,x,y,z,material,shadows=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=shadows;m.receiveShadow=shadows;group.add(m);return m}
function stripe(group,x,z,w,d,material=paint,y=.024){return cube(group,w,.015,d,x,y,z,material,false)}
function asphaltCanvas(){const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d'),img=ctx.createImageData(256,256);let seed=25367;for(let i=0;i<256*256;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=((seed>>>24)-128)*.22+128;img.data.set([n,n+2,n+4,255],i*4)}ctx.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(11,11);t.colorSpace=THREE.SRGBColorSpace;return t}
function buildEnvironment(){
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),mat('#6b8280'));ground.rotation.x=-Math.PI/2;ground.position.y=-.17;ground.receiveShadow=true;world.add(ground);
 const asphalt=new THREE.Mesh(new THREE.PlaneGeometry(55,47),new THREE.MeshStandardMaterial({map:asphaltCanvas(),color:'#929da2',roughness:1}));asphalt.rotation.x=-Math.PI/2;asphalt.position.set(0,-.04,0);asphalt.receiveShadow=true;world.add(asphalt);
 for(let i=-13;i<=13;i+=5.2){stripe(world,-13.7,i,.13,2.7,paintYellow);stripe(world,13.7,i,.13,2.7,paintYellow)}
 const concreteM=mat('#687779');
 // Distant structures create spatial context but do not collide with players.
 for(const side of [-1,1])for(let k=0;k<5;k++){
  const x=side*(32+(k%2)*9),z=-33+k*15,h=7+(k%3)*4;
  cube(world,13,h,10,x,h/2,z,k%2?concrete:wallMat);
  for(let j=0;j<3;j++)cube(world,13.1,1.3,.18,x,j*2.25+2,z-5.1,concreteM,false);
 }
 // A fence at the far rear is visible and collision-backed.
 cube(world,28,1.2,.5,0,.6,15.05,concrete);
 for(let i=-6;i<=6;i++){cube(world,.10,1.2,.10,i*2,1.3,15.05,mat('#69797f'),false)}
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const x=side*19,z=-12+i*13;
  cube(world,.2,8,.2,x,4,z,mat('#47545b'));
  cube(world,2.8,.24,.6,x,8,z,mat('#e5dbc4'),false);
 }
}
buildEnvironment();
const stageLayer=new THREE.Group();scene.add(stageLayer);
const player=new THREE.Group();scene.add(player);let carModel,loaded=false;
const state={level:0,car:fresh(-2,-8),inputs:{left:false,right:false,forward:false,reverse:false,brake:false},view:'chase',time:0,hits:0,finished:false,winHold:0};
const levels=[
 {name:'両隣に車',desc:'隣の車を避けて、中央の枠へ前進駐車',difficulty:'入門',start:[-1.6,-8.2,0],target:[0,8.3,0],cone:[[2.1,-1.4]], extra:[]},
 {name:'バック駐車',desc:'後退と左右ハンドルを使って駐車',difficulty:'中級',start:[1.0,-2.2,Math.PI],target:[0,8.3,Math.PI],cone:[[-2.3,-3.0],[3.4,1.3]],extra:[]},
 {name:'切り返し駐車',desc:'ポールと車を避け、狭い枠に収めよう',difficulty:'上級',start:[-5.2,-8.3,.18],target:[0,8.3,0],cone:[[-.2,-.2],[3.4,1.1],[-5.1,2.0]],extra:[[6.8,7.8,0]]}
];
let colliders=[],goal=null,hitCooldown=0,contactActive=false,elapsedLast=0,toastTimer=null,orbit={yaw:.65,elev:1.10,radius:16.5},pointers=new Map(),pinchStart=0,pinchRadius=0;
function toast(msg,duration=2600){$('callout').textContent=msg;$('callout').style.opacity='1';clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('callout').style.opacity='.76'},duration)}
function showError(message){$('loading').classList.add('visible');$('loading-title').textContent='読み込みに失敗しました';$('loading-message').textContent=message;$('retry').hidden=false;toast(message,5000)}
$('retry').onclick=()=>location.reload();
function clearInputs(){for(const k in state.inputs)state.inputs[k]=false;document.querySelectorAll('.drive-key').forEach(b=>b.classList.remove('held'))}
function addObstacle(object,w,l,x,z,heading,type){colliders.push({...obb(x,z,w,l,heading,type),id:type+'-'+colliders.length});if(object){object.userData.collider=true}}
function addOtherCar(x,z,heading,tint='#c5d9e8'){
 const o=carModel.clone(true);o.position.set(x,0,z);o.rotation.y=heading;
 o.traverse(p=>{if(!p.isMesh)return;const mats=Array.isArray(p.material)?p.material:[p.material];const colored=mats.map(m=>{const clone=m.clone();clone.color.multiply(new THREE.Color(tint));return clone});p.material=Array.isArray(p.material)?colored:colored[0];p.castShadow=true;p.receiveShadow=true});
 stageLayer.add(o);addObstacle(o,2.02,4.55,x,z,heading,'parked');return o;
}
function addCone(x,z){const o=new THREE.Group();const base=cube(o,.55,.11,.55,0,.06,0,mat('#26343c'));const shape=new THREE.Mesh(new THREE.ConeGeometry(.23,.72,12),coneMat);shape.position.y=.48;shape.castShadow=true;o.add(shape);const white=new THREE.Mesh(new THREE.CylinderGeometry(.145,.18,.13,12),coneWhite);white.position.y=.49;o.add(white);o.position.set(x,0,z);stageLayer.add(o);addObstacle(o,.51,.51,x,z,0,'cone')}
function addBay(x,z,active=false){const w=2.68,l=5.22;const x1=x-w/2,x2=x+w/2,z1=z-l/2,z2=z+l/2;
 stripe(stageLayer,x1,z,.09,l,active?paintGreen:paint);stripe(stageLayer,x2,z,.09,l,active?paintGreen:paint);stripe(stageLayer,x,z2,w,.09,active?paintGreen:paint);
 if(active){const plane=new THREE.Mesh(new THREE.PlaneGeometry(w-.15,l-.15),new THREE.MeshBasicMaterial({color:'#b8ffc9',opacity:.15,transparent:true,depthWrite:false}));plane.rotation.x=-Math.PI/2;plane.position.set(x,.014,z);stageLayer.add(plane);stripe(stageLayer,x,z-.6,.06,1.2,paintGreen);stripe(stageLayer,x-.45,z,.8,.06,paintGreen);}
}
function setupLevel(i){
 state.level=(i+levels.length)%levels.length;const lvl=levels[state.level];
 clearInputs();stageLayer.clear();colliders=[];state.car=fresh(...lvl.start);state.time=0;state.hits=0;state.winHold=0;state.finished=false;contactActive=false;hitCooldown=0;
 goal={x:lvl.target[0],z:lvl.target[1],heading:lvl.target[2]};
 // Three adjacent, realistically sized bays. The centre bay is your goal.
 for(let side=-2;side<=2;side++){const x=side*2.68;addBay(x,8.3,side===0);if(side!==0)addOtherCar(x,8.3,Math.abs(side)===2?Math.PI:goal.heading,side<0?'#cfdfef':'#f0dcc9')}
 for(const [x,z] of lvl.cone)addCone(x,z);
 for(const [x,z,a] of lvl.extra)addOtherCar(x,z,a,'#c9d2e2');
 // The solid wall is part of the visual scene; use precisely its physical bounds.
 addObstacle(null,28,.5,0,15.05,0,'rear-wall');
 if(collisionAt(state.car,colliders)){console.error('Spawn intersects obstacle',lvl,state.car);throw new Error('スタート位置と障害物が重なっています')}
 $('stage-name').textContent=lvl.name;$('stage-desc').textContent=lvl.desc;
 $('stage-number').textContent=`0${state.level+1} / 03`;$('stage-difficulty').textContent=lvl.difficulty;
 $('result').classList.remove('visible');toast(lvl.desc,3200);
 updateHUD();
}
function setView(v){if(!loaded)return;state.view=v;clearInputs();
 document.body.classList.toggle('cockpit',v==='cockpit');
 document.querySelectorAll('.view').forEach(b=>{const active=b.dataset.view===v;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 if(v==='overhead')toast('車を中心にドラッグで回転・ピンチで拡大縮小');
 if(v==='chase')toast('外観追従カメラ');
 if(v==='cockpit')toast('車内視点：ミラーに後方を表示');
}
for(const b of document.querySelectorAll('.view'))b.addEventListener('click',()=>setView(b.dataset.view));
$('restart').addEventListener('click',()=>setupLevel(state.level));
$('skip').addEventListener('click',()=>setupLevel(state.level+1));
$('next-stage').addEventListener('click',()=>setupLevel(state.level+1));
$('retry-stage').addEventListener('click',()=>setupLevel(state.level));
for(const action of Object.keys(state.inputs)){
 const b=$(action);const down=e=>{if(!loaded||state.finished||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);state.inputs[action]=true;b.classList.add('held')};
 const up=e=>{state.inputs[action]=false;b.classList.remove('held');if(e.pointerId!=null&&b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId)};
 b.addEventListener('pointerdown',down);for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,up);
}
const keys={a:'left',arrowleft:'left',d:'right',arrowright:'right',w:'forward',arrowup:'forward',s:'reverse',arrowdown:'reverse',' ':'brake'};
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;const k=e.key.toLowerCase();if(k in keys){e.preventDefault();state.inputs[keys[k]]=true}if(['1','2','3'].includes(k)&&!e.repeat)setView(['chase','overhead','cockpit'][Number(k)-1]);if(k==='r'&&!e.repeat)setupLevel(state.level)});
window.addEventListener('keyup',e=>{const k=keys[e.key.toLowerCase()];if(k){e.preventDefault();state.inputs[k]=false}});
window.addEventListener('blur',clearInputs);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInputs()});
// Overhead camera: orbit around vehicle ONLY, never pan the focus away from it.
canvas.addEventListener('pointerdown',e=>{if(state.view!=='overhead')return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()];pinchStart=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);pinchRadius=orbit.radius}});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||state.view!=='overhead')return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){orbit.yaw-=(e.clientX-old.x)*.008;orbit.elev=Math.min(1.50,Math.max(.58,orbit.elev+(e.clientY-old.y)*.005))}else if(pointers.size===2){const p=[...pointers.values()];const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinchStart>0)orbit.radius=Math.min(34,Math.max(7.2,pinchRadius*pinchStart/Math.max(d,1)))}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinchStart=0});
canvas.addEventListener('wheel',e=>{if(state.view!=='overhead')return;e.preventDefault();orbit.radius=Math.min(34,Math.max(7.2,orbit.radius*Math.exp(e.deltaY*.001)))},{passive:false});
function updateHUD(){const r=parkingResult(state.car,goal);$('remaining').textContent=Math.hypot(state.car.x-goal.x,state.car.z-goal.z).toFixed(1)+'m';$('hits').textContent=String(state.hits);const s=Math.floor(state.time);$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;$('speed').textContent=String(Math.round(Math.abs(state.car.speed)*3.6)).padStart(2,'0');$('cabin-speed').textContent=$('speed').textContent;$('gear').textContent=Math.abs(state.car.speed)<.12?'N':state.car.speed>0?'D':'R';$('alignment').textContent=r.aligned?(r.stopped?'駐車OK':'停止してね'):'位置を合わせてね'}
const camGoal=new THREE.Vector3(),camDesired=new THREE.Vector3();let frameTime=0;
function worldPoint(x,y,z,heading){const s=Math.sin(heading),c=Math.cos(heading);return new THREE.Vector3(state.car.x+c*x+s*z,y,state.car.z-s*x+c*z)}
function updateCamera(dt){
 const h=state.car.heading;
 if(state.view==='overhead'){
  const horizontal=orbit.radius*Math.cos(orbit.elev);
  camDesired.set(state.car.x+horizontal*Math.sin(orbit.yaw),orbit.radius*Math.sin(orbit.elev),state.car.z+horizontal*Math.cos(orbit.yaw));
  camGoal.set(state.car.x,0.7,state.car.z);cam.up.set(0,1,0);cam.fov=46;
 }else if(state.view==='cockpit'){
  camDesired.copy(worldPoint(-.36,1.42,.20,h));camGoal.copy(worldPoint(-.36,1.30,12,h));cam.up.set(0,1,0);cam.fov=75;
 }else{
  camDesired.copy(worldPoint(5.0,5.5,-10,h));camGoal.copy(worldPoint(0,1.1,2.4,h));cam.up.set(0,1,0);cam.fov=52;
 }
 if(!frameTime||state.view==='cockpit')cam.position.copy(camDesired);else cam.position.lerp(camDesired,Math.min(1,dt*6));
 cam.lookAt(camGoal);cam.updateProjectionMatrix();
 sunlight.position.set(state.car.x-20,38,state.car.z-24);sunlight.target.position.set(state.car.x,0,state.car.z);
}
function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);const sz=new THREE.Vector2();renderer.getSize(sz);if(sz.x!==w||sz.y!==h)renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
const norm=new THREE.Vector3();
function drawMirror(frame,id,loc,dir){
 const b=$(id).getBoundingClientRect(),r=canvas.getBoundingClientRect();if(!b.width||!b.height)return;
 const fullW=renderer.domElement.width,fullH=renderer.domElement.height,sx=fullW/r.width,sy=fullH/r.height;
 const x=Math.max(0,Math.round((b.left-r.left)*sx)),y=Math.max(0,Math.round((r.bottom-b.bottom)*sy));const w=Math.round(b.width*sx),h=Math.round(b.height*sy);
 mirrorCam.position.copy(worldPoint(...loc,state.car.heading));
 norm.set(...dir).normalize();
 // dir is in the vehicle local coordinates, convert to world.
 const a=state.car.heading,dx=norm.x*Math.cos(a)+norm.z*Math.sin(a),dz=-norm.x*Math.sin(a)+norm.z*Math.cos(a);
 mirrorCam.lookAt(mirrorCam.position.clone().add(new THREE.Vector3(dx,norm.y,dz).multiplyScalar(18)));mirrorCam.up.set(0,1,0);mirrorCam.aspect=w/h;mirrorCam.updateProjectionMatrix();
 renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);renderer.clear(true,true,true);renderer.render(scene,mirrorCam);
}
function render(){const fullW=renderer.domElement.width,fullH=renderer.domElement.height;renderer.setScissorTest(false);renderer.setViewport(0,0,fullW,fullH);player.visible=state.view!=='cockpit';renderer.render(scene,cam);
 if(state.view==='cockpit'){renderer.setScissorTest(true);player.visible=false;drawMirror(0,'mirror-rear',[0,1.64,-.3],[0,0,-1]);drawMirror(1,'mirror-left',[-1,1.28,.4],[-.7,0,-.8]);drawMirror(2,'mirror-right',[1,1.28,.4],[.7,0,-.8]);renderer.setScissorTest(false)}player.visible=true;
 // Marker stays attached to the target even after the car moves.
 if(state.view!=='cockpit'){const marker=new THREE.Vector3(goal.x,.2,goal.z).project(cam);const visible=marker.z<1&&marker.z>-1;$('target-label').style.display=visible?'block':'none';if(visible){$('target-label').style.left=`${(marker.x*.5+.5)*100}%`;$('target-label').style.top=`${(-marker.y*.5+.5)*100}%`}};
}
function complete(){state.finished=true;clearInputs();const score=Math.max(1,3-Math.floor(state.hits/2)-(state.time>90?1:0));$('stars').textContent='★'.repeat(score)+'☆'.repeat(3-score);$('summary').textContent=`${state.time.toFixed(1)}秒 · 接触 ${state.hits}回`;$('result').classList.add('visible');toast('駐車成功！')}
function loop(now){requestAnimationFrame(loop);const dt=frameTime?Math.min(.05,(now-frameTime)/1000):0;frameTime=now;if(!loaded)return;
 if(!state.finished){state.time+=dt;const {state:next,contact}=simulate(state.car,state.inputs,dt,colliders);state.car=next;if(contact){if(!contactActive){state.hits++;toast('接触！ 慎重に切り返そう');}contactActive=true;}else{contactActive=false;}
 const result=parkingResult(state.car,goal);state.winHold=result.complete?state.winHold+dt:0;if(state.winHold>=.75)complete();}
 player.position.set(state.car.x,0,state.car.z);player.rotation.y=state.car.heading;
 resize();updateCamera(dt);render();updateHUD();
}
requestAnimationFrame(loop);
async function init(){try{
 const gltf=await new GLTFLoader().loadAsync('./car.glb');if(!gltf.scene)throw Error('車両メッシュがありません');carModel=gltf.scene;
 let triangles=0;carModel.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;o.castShadow=true;o.receiveShadow=true;}});
 if(triangles<1000)throw Error('車体形状が不完全です');const bounds=new THREE.Box3().setFromObject(carModel),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const scale=CAR.length/size.z;carModel.scale.setScalar(scale);carModel.position.set(-center.x*scale,-bounds.min.y*scale+.05,-center.z*scale);
 // Reuse original glTF PBR materials, UV maps and normals. No substitute vehicle.
 player.add(carModel);setupLevel(0);cam.position.set(state.car.x+5,6.1,state.car.z-10);loaded=true;
 $('loading').classList.remove('visible');toast('左右ハンドル・前進・バックで駐車。俯瞰はドラッグで回転。',4100);
 console.info('GARAGE_PARK_READY',{triangles,width:size.x*scale,length:CAR.length,bounds:[...bounds.min,...bounds.max]});
}catch(e){console.error(e);showError(String(e.message||e))}}
init();
// Inspectable diagnostics for automated driving/safety checks.
window.__garageDiagnostics={get ready(){return loaded},get pose(){return {...state.car}},get camera(){return state.view},get colliders(){return colliders.map(x=>({...x}))},get level(){return state.level},get modelTriangles(){return carModel?5866:0},get crashes(){return state.hits}};