import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { advance, newPose } from './motion.mjs';

const $ = (id) => document.getElementById(id);
const canvas=$('scene'),overlay=$('overlay'),intro=$('intro');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#16252b');
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.015,40);
camera.position.set(.95,.74,1.25);
let renderer;
try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled=true;
  renderer.xr.enabled=true;
  renderer.xr.setReferenceSpaceType('local');
} catch(error){
  $('loading-status').textContent='3D表示を利用できません';
  $('availability').textContent='WebGLが使えるChromeで開いてください';
  throw error;
}

scene.add(new THREE.HemisphereLight('#ffffff','#5a676b',2.35));
const sunlight=new THREE.DirectionalLight('#fff5df',3.0);
sunlight.position.set(-3,6,3);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);
sunlight.shadow.camera.left=-2;sunlight.shadow.camera.right=2;sunlight.shadow.camera.top=2;sunlight.shadow.camera.bottom=-2;
sunlight.shadow.normalBias=.004;sunlight.shadow.bias=-.00001;scene.add(sunlight,sunlight.target);
try {const gen=new THREE.PMREMGenerator(renderer);scene.environment=gen.fromScene(new RoomEnvironment(),.04).texture;gen.dispose();}catch(error){console.warn('No studio reflections',error)}

const podiumMaterial=new THREE.MeshStandardMaterial({color:'#303c42',metalness:.58,roughness:.34});
const edgeMaterial=new THREE.MeshBasicMaterial({color:'#a6f4d4',toneMapped:false});
const blackMaterial=new THREE.MeshBasicMaterial({color:'#030709',side:THREE.DoubleSide});
const doorMaterial=new THREE.MeshStandardMaterial({color:'#384b54',metalness:.5,roughness:.38});
const showcase=new THREE.Group();scene.add(showcase);
let introCar=null;
const demoFloor=new THREE.Mesh(new THREE.CircleGeometry(1.65,90),new THREE.MeshStandardMaterial({color:'#26373b',metalness:.06,roughness:.8}));
demoFloor.rotation.x=-Math.PI/2;demoFloor.receiveShadow=true;demoFloor.position.y=-.012;showcase.add(demoFloor);
const floorRing=new THREE.Mesh(new THREE.RingGeometry(.47,.485,70),new THREE.MeshBasicMaterial({color:'#85cdbb',side:THREE.DoubleSide,transparent:true,opacity:.45}));
floorRing.rotation.x=-Math.PI/2;floorRing.position.y=.004;showcase.add(floorRing);
const grid=new THREE.GridHelper(3.3,18,'#4c6669','#2b4448');grid.position.y=-.008;showcase.add(grid);

const reticle=new THREE.Group();reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
const targetRing=new THREE.Mesh(new THREE.RingGeometry(.08,.086,48),new THREE.MeshBasicMaterial({color:'#b2fddd',side:THREE.DoubleSide,depthTest:false}));targetRing.rotation.x=-Math.PI/2;reticle.add(targetRing);
for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
 const dash=new THREE.Mesh(new THREE.BoxGeometry(.034,.002,.004),edgeMaterial);
 dash.position.set(Math.cos(angle)*.11,0,Math.sin(angle)*.11);
 dash.rotation.y=-angle;
 reticle.add(dash);
}

const state={mode:'intro',phase:'idle',driving:false,pose:newPose(),keys:{left:false,right:false,forward:false,reverse:false},lift:0,time:0,summon:null,car:null,modelReady:false,previewYaw:.65,previewPitch:.38,previewDistance:1.45,mouseDrag:null,hitSource:null,hitPose:null,hitReady:false,session:null};
let baseGLTF=null;
const modelLoader=new GLTFLoader();
const truckScale=.62/.978553;
const floorClip=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function createCar(clipped=false){
 const outer=new THREE.Group();
 const car=baseGLTF.scene.clone(true);
 car.scale.setScalar(truckScale);
 const b=new THREE.Box3().setFromObject(car),center=b.getCenter(new THREE.Vector3());
 car.position.set(-center.x,-b.min.y+.004,-center.z);
 car.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=true;
  o.receiveShadow=true;
  const ms=Array.isArray(o.material)?o.material:[o.material];
  const next=ms.map(m=>{const mat=m.clone();mat.envMapIntensity=.85;mat.clippingPlanes=clipped?[floorClip]:[];mat.clipShadows=clipped;return mat});
  o.material=Array.isArray(o.material)?next:next[0];
 });
 outer.add(car);
 return outer;
}

function box(parent,w,h,d,x,y,z,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;parent.add(mesh);return mesh}
function hatchAt(group){
 const hatch=new THREE.Group();group.add(hatch);
 const opening=new THREE.Mesh(new THREE.PlaneGeometry(.75,.93),blackMaterial);opening.rotation.x=-Math.PI/2;opening.position.y=.003;hatch.add(opening);
 for(const side of [-1,1]){
   const edge=box(hatch,.012,.010,.95,side*.38,.012,0,edgeMaterial);edge.castShadow=false;
 }
 for(const side of [-1,1]){
   const edge=box(hatch,.78,.010,.012,0,.012,side*.47,edgeMaterial);edge.castShadow=false;
 }
 const doors=new THREE.Group();hatch.add(doors);
 const left=box(doors,.365,.018,.93,-.19,.025,0,doorMaterial);
 const right=box(doors,.365,.018,.93,.19,.025,0,doorMaterial);
 const platform=new THREE.Group();hatch.add(platform);
 const disk=box(platform,.705,.024,.87,0,0,0,podiumMaterial);disk.castShadow=false;
 box(platform,.705,.009,.018,0,.016,.42,edgeMaterial).castShadow=false;
 box(platform,.705,.009,.018,0,.016,-.42,edgeMaterial).castShadow=false;
 return{hatch,doors,left,right,platform};
}
function clearKeys(){for(const k in state.keys)state.keys[k]=false;for(const button of document.querySelectorAll('.drive-button'))button.classList.remove('held')}
function updateUI(){
 const active=state.mode!=='intro';overlay.classList.toggle('active',active);intro.hidden=active;
 $('exit-preview').setAttribute('aria-label',state.mode==='ar'?'ARを終了':'閉じる');
 const scanning=state.mode==='ar'&&state.phase==='scanning';
 $('place-row').hidden=!scanning;
 $('place-button').disabled=!state.hitReady;
 const placed=state.phase==='ready';
 $('summon-again').hidden=!placed;
 $('mode-toggle').hidden=!placed;
 $('mode-toggle').textContent=state.driving?'鑑賞に戻る':'運転する';
 $('drive-pad').hidden=!placed||!state.driving;
 const hint=$('hint');
 if(state.phase==='scanning')hint.textContent=state.hitReady?'場所が決まりました':'床や机をゆっくり映してください';
 else if(state.phase==='rising')hint.textContent='愛車を呼び出しています…';
 else if(state.phase==='ready')hint.textContent=state.driving?'長押しで前進・バック・方向転換':'周囲を歩いて愛車を眺めよう';
 else hint.textContent='';
}

function summonAt(position,angle=0){
 if(!state.modelReady)return;
 if(state.summon){scene.remove(state.summon.root);state.summon=null}
 const root=new THREE.Group();root.position.copy(position);root.rotation.y=angle;scene.add(root);
 const hatch=hatchAt(root);
 const carGroup=new THREE.Group();root.add(carGroup);
 const car=createCar(true);carGroup.add(car);
 carGroup.position.y=-.32;hatch.platform.position.y=-.32;
 const floorHeight=position.y;
 sunlight.position.copy(position).add(new THREE.Vector3(-3,6,3));sunlight.target.position.copy(position);sunlight.target.updateMatrixWorld();
 floorClip.constant=-floorHeight+.008;
 state.summon={root,carGroup,car,hatch};
 state.car=carGroup;
 state.pose=newPose();
 state.lift=0;state.phase='rising';state.driving=false;
 reticle.visible=false;
 clearKeys();updateUI();
 playLiftSound();
}
function replay(){clearKeys();state.driving=false;state.pose=newPose();
 if(state.mode==='ar'){
   if(state.summon){scene.remove(state.summon.root);state.summon=null}
   state.hitReady=false;state.phase='scanning';updateUI();
 } else summonAt(new THREE.Vector3(0,0,0),0);
}
function playLiftSound(){
 // Only a subtle short synthesized motor sound; no external copyrighted audio.
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
  const ctx=new Ctx();const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='sawtooth';osc.frequency.setValueAtTime(62,ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(98,ctx.currentTime+1.05);
  osc.frequency.linearRampToValueAtTime(72,ctx.currentTime+2);
  gain.gain.setValueAtTime(.0001,ctx.currentTime);
  gain.gain.linearRampToValueAtTime(.014,ctx.currentTime+.22);
  gain.gain.linearRampToValueAtTime(.007,ctx.currentTime+1.5);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+2.25);
  osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+2.3);
  osc.onended=()=>ctx.close();
 }catch(e){/* visuals work if audio isn't allowed */}
}
function animateLift(dt){
 if(state.phase!=='rising'||!state.summon)return;
 state.lift=Math.min(3.4,state.lift+dt);
 const {hatch,carGroup,car}=state.summon;
 const t=state.lift;
 // Open hatch doors, then lift the (world-clipped) original car from below the floor.
 const open=Math.min(1,Math.max(0,(t-.08)/.62));
 const smooth=open*open*(3-2*open);
 hatch.left.position.x=-.19-smooth*.39;hatch.right.position.x=.19+smooth*.39;
 const rise=Math.min(1,Math.max(0,(t-.68)/1.92));
 const easing=1-Math.pow(1-rise,3);
 carGroup.position.y=-.32+easing*.355;
 hatch.platform.position.y=-.32+easing*.35;
 const glow=Math.sin(t*5)*.15+.8;
 edgeMaterial.color.setRGB(.57*glow,.95*glow,.77*glow);
 if(t>=3.05){
  state.phase='ready';carGroup.position.y=.035;hatch.platform.position.y=.018;
  car.traverse(o=>{if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{m.clippingPlanes=[];m.clipShadows=false;m.needsUpdate=true})}});
  updateUI();
 }
}

function setDriving(enable){if(state.phase!=='ready')return;state.driving=enable;clearKeys();updateUI()}
$('summon-again').addEventListener('click',replay);
$('mode-toggle').addEventListener('click',()=>setDriving(!state.driving));
$('place-button').addEventListener('click',()=>placeAtReticle());
overlay.addEventListener('beforexrselect',e=>{if(e.target.closest('button'))e.preventDefault()});
function placeAtReticle(){if(state.mode!=='ar'||state.phase!=='scanning'||!state.hitReady)return;
 const position=new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
 const forward=new THREE.Vector3();renderer.xr.getCamera(camera).getWorldDirection(forward);
 const angle=Math.atan2(forward.x,forward.z)+Math.PI; // The car's nose faces the viewer after summoning.
 summonAt(position,angle);
}
const controller=renderer.xr.getController(0);controller.addEventListener('select',placeAtReticle);scene.add(controller);
for(const btn of document.querySelectorAll('[data-drive]')){
 const action=btn.dataset.drive;
 const release=e=>{state.keys[action]=false;btn.classList.remove('held');if(e?.pointerId!=null&&btn.hasPointerCapture(e.pointerId))btn.releasePointerCapture(e.pointerId)};
 btn.addEventListener('pointerdown',e=>{if(!state.driving||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();btn.setPointerCapture(e.pointerId);state.keys[action]=true;btn.classList.add('held')});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(event,release);
}
const keyMap={a:'left',arrowleft:'left',d:'right',arrowright:'right',w:'forward',arrowup:'forward',s:'reverse',arrowdown:'reverse'};
window.addEventListener('keydown',e=>{const k=keyMap[e.key.toLowerCase()];if(!k||!state.driving)return;e.preventDefault();state.keys[k]=true});
window.addEventListener('keyup',e=>{const k=keyMap[e.key.toLowerCase()];if(k){e.preventDefault();state.keys[k]=false}});
window.addEventListener('blur',clearKeys);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearKeys()});

function previewCamera(){
 const {previewYaw:y,previewPitch:p,previewDistance:r}=state;
 camera.position.set(Math.sin(y)*Math.cos(p)*r,Math.sin(p)*r+.09,Math.cos(y)*Math.cos(p)*r);
 camera.lookAt(0,.12,0);
}
canvas.addEventListener('pointerdown',e=>{if(state.mode==='ar'||e.pointerType==='mouse'&&e.button!==0)return;state.mouseDrag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{const drag=state.mouseDrag;if(!drag||drag.id!==e.pointerId||state.mode==='ar')return;state.previewYaw-=(e.clientX-drag.x)*.007;state.previewPitch=Math.max(.15,Math.min(1.2,state.previewPitch+(e.clientY-drag.y)*.005));drag.x=e.clientX;drag.y=e.clientY});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(state.mouseDrag?.id===e.pointerId)state.mouseDrag=null});
canvas.addEventListener('wheel',e=>{if(state.mode==='ar')return;e.preventDefault();state.previewDistance=Math.max(.65,Math.min(2.6,state.previewDistance*Math.exp(e.deltaY*.001)))},{passive:false});

async function beginAR(){
 if(!state.modelReady)return;
 $('start-ar').disabled=true;
 $('loading-status').textContent='ARカメラを準備しています…';
 try{
  const session=await navigator.xr.requestSession('immersive-ar',{
   requiredFeatures:['hit-test','dom-overlay'],domOverlay:{root:overlay},
   optionalFeatures:['local-floor']
  });
  state.session=session;
  session.addEventListener('end',onAREnd,{once:true});
  await renderer.xr.setSession(session);
  const viewer=await session.requestReferenceSpace('viewer');
  state.hitSource=await session.requestHitTestSource({space:viewer});
  state.hitPose=null;state.hitReady=false;
  scene.background=null;
  renderer.setClearColor(0x000000,0);
  showcase.visible=false;
  if(state.summon){scene.remove(state.summon.root);state.summon=null}
  state.mode='ar';state.phase='scanning';state.driving=false;
  updateUI();
 }catch(error){
  console.error('AR setup error',error);
  $('loading-status').textContent='ARを開始できませんでした';
  $('availability').textContent='対応端末・Chrome・ARサービスの設定をご確認ください';
  $('start-ar').disabled=false;
  if(state.session){try{await state.session.end()}catch(e){}}
 }
}
function onAREnd(){
 state.session=null;
 if(state.hitSource){try{state.hitSource.cancel()}catch(e){}state.hitSource=null}
 state.hitReady=false;state.hitPose=null;reticle.visible=false;
 if(state.summon){scene.remove(state.summon.root);state.summon=null}
 state.mode='intro';state.phase='idle';state.driving=false;clearKeys();
 scene.background=new THREE.Color('#16252b');renderer.setClearColor('#16252b',1);
 showcase.visible=true;if(introCar)introCar.visible=true;
 $('start-ar').disabled=false;
 $('loading-status').textContent='';
 updateUI();
}
function beginPreview(){
 if(!state.modelReady)return;
 state.mode='preview';state.phase='idle';
 showcase.visible=true;if(introCar)introCar.visible=false;
 intro.hidden=true;
 state.previewYaw=.65;state.previewPitch=.38;state.previewDistance=1.45;
 summonAt(new THREE.Vector3(0,0,0),0);
 updateUI();
}
$('start-ar').addEventListener('click',beginAR);
$('start-preview').addEventListener('click',beginPreview);
$('exit-preview').addEventListener('click',async()=>{if(state.mode==='ar'&&state.session){await state.session.end()}else{if(state.summon){scene.remove(state.summon.root);state.summon=null}state.mode='intro';state.phase='idle';state.driving=false;if(introCar)introCar.visible=true;clearKeys();updateUI()}});

let last=0;
function renderFrame(time,frame){
 const dt=last?Math.min(.05,Math.max(0,(time-last)/1000)):0;last=time;
 if(state.mode==='ar'&&frame&&state.phase==='scanning'&&state.hitSource){
  const results=frame.getHitTestResults(state.hitSource);
  const ref=renderer.xr.getReferenceSpace();
  const pose=results.length&&ref?results[0].getPose(ref):null;
  state.hitReady=Boolean(pose);
  reticle.visible=Boolean(pose);
  if(pose)reticle.matrix.fromArray(pose.transform.matrix);
  $('place-button').disabled=!state.hitReady;
  $('hint').textContent=state.hitReady?'場所が決まりました':'床や机をゆっくり映してください';
 }
 animateLift(dt);
 if(state.phase==='ready'&&state.driving&&state.car){
  state.pose=advance(state.pose,state.keys,dt);
  state.car.position.set(state.pose.x,.035,state.pose.z);
  state.car.rotation.y=state.pose.yaw;
 }
 if(state.mode!=='ar'){previewCamera();}
 renderer.render(scene,camera);
}
renderer.setAnimationLoop(renderFrame);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)});

async function boot(){
 try{
  baseGLTF=await modelLoader.loadAsync('./car.glb');
  let faces=0;baseGLTF.scene.traverse(o=>{if(o.isMesh)faces+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3});
  if(faces<1000)throw new Error('3Dモデルの形状を確認できません');
  const display=createCar(false);showcase.add(display);display.position.y=.017;introCar=display;
  state.modelReady=true;
  $('start-preview').disabled=false;
  $('loading-status').textContent='';
  let supported=false;
  try{supported=Boolean(navigator.xr&&await navigator.xr.isSessionSupported('immersive-ar'))}catch(e){supported=false}
  $('start-ar').disabled=!supported;
  $('start-ar').hidden=!supported;
  if(!supported){$('availability').textContent='この端末ではARを利用できません。3Dでお試しください。';$('start-preview').textContent='3Dで試す'}
  console.info('GARAGE_AR_READY',{triangles:faces,arSupported:supported});
 }catch(error){
  console.error('Failed to initialize model',error);
  $('loading-status').textContent='愛車を読み込めませんでした';
  $('availability').textContent='再読み込みしてください';
 }
}
boot();
window.__garageAR={get phase(){return state.phase},get mode(){return state.mode},get arSupported(){return !$('start-ar').hidden&&state.modelReady},get pose(){return {...state.pose}},get ready(){return state.modelReady}};