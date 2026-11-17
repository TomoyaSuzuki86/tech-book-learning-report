import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { freshCar, stepCar } from './drive.js';
import './styles.css';

const el = id => document.getElementById(id);
const modelUrl = `${import.meta.env.BASE_URL}car.glb`;
const canvas = el('world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b7cbd2');
scene.fog = new THREE.FogExp2('#c1d0d2', 0.006);
const camera = new THREE.PerspectiveCamera(50, 1, 0.08, 430);
camera.position.set(6.6, 4.4, -9.6);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
} catch (error) {
  fail('3D表示を開始できませんでした', 'WebGLが有効なChromeで開いてください。' + String(error.message || error));
  throw error;
}

const ambient = new THREE.HemisphereLight('#f9fcff', '#5a6264', 2.3);
scene.add(ambient);
const sun = new THREE.DirectionalLight('#fff2dc', 3.2);
sun.position.set(22, 38, -24);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -42;
sun.shadow.camera.right = 42;
sun.shadow.camera.top = 42;
sun.shadow.camera.bottom = -42;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 140;
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 0.028;
scene.add(sun, sun.target);

// A soft studio reflection enhances glTF PBR maps without changing asset materials.
try {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  pmrem.dispose();
} catch (e) {
  console.warn('Environment reflections unavailable; continuing with direct light.', e);
}

const material = (hex, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({color:hex,roughness,metalness});
const asphalt = material('#343d43', .96);
const asphaltBase = material('#252e35', .97);
const lineWhite = new THREE.MeshBasicMaterial({color:'#d9e3df'});
const lineYellow = new THREE.MeshBasicMaterial({color:'#f4c96e'});
const darkConcrete = material('#848e8e');

function plane(w,h,m,x=0,z=0,y=0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
  mesh.rotation.x = -Math.PI/2;
  mesh.position.set(x,y,z);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
function stripe(x,z,w,d,m=lineWhite,y=.018) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,.015,d),m);
  mesh.position.set(x,y,z);
  scene.add(mesh);
  return mesh;
}
function block(x,z,w,h,d,m=darkConcrete){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,h/2,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;
}
function asphaltTexture() {
  const c=document.createElement('canvas');c.width=256;c.height=256;
  const ctx=c.getContext('2d');const data=ctx.createImageData(256,256);
  // Deterministic noise, generated once (no network textures).
  let seed=7529;
  for(let i=0;i<256*256;i++){
    seed=(1664525*seed+1013904223)>>>0;
    const n=(seed>>>24)-128;
    const v=Math.max(20,Math.min(255,142+n*.19));
    data.data.set([v,v+2,v+3,255],i*4);
  }
  ctx.putImageData(data,0,0);
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;
  tx.repeat.set(28,30);tx.colorSpace=THREE.SRGBColorSpace;
  tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  return tx;
}

function buildLot(){
  plane(900,900,material('#778484',1),0,0,-.16);
  const paved=new THREE.MeshStandardMaterial({map:asphaltTexture(),color:'#828a91',roughness:1});
  plane(148,166,asphaltBase,0,0,-.06);
  plane(126,140,paved,0,0,0);
  // A broad, unobstructed centre lane; all visible objects are well away from spawn.
  stripe(-8,0,.13,116,lineYellow);stripe(8,0,.13,116,lineYellow);
  for(let z=-54;z<=56;z+=6.2) stripe(0,z,.15,3.0,lineWhite);
  // Parking bays are visual context only at this stage, deliberately non-collidable.
  for(const side of [-1,1]){
    for(let z=-51;z<=51;z+=7.0){
      stripe(side*19,z,12.5,.11,lineWhite);
    }
    stripe(side*25,0,.12,109,lineWhite);
    stripe(side*12.65,0,.11,109,lineWhite);
    for(let z=-49;z<=49;z+=14){
      const curb=block(side*32,z,1.8,.3,6,material('#91999a'));
      curb.castShadow=false;
    }
  }
  // A visible start marker and direction arrow that do not block movement.
  stripe(0,-6,10,.24,lineWhite);
  stripe(-.95,8.5,.13,3.8,lineYellow);
  stripe(.95,8.5,.13,3.8,lineYellow);
  const roof=material('#475862',.82),walls=material('#a2a9a9',.9),windows=material('#4c6571',.36,.28);
  for(const s of [-1,1]){
    for(let k=0;k<4;k++){
      const z=-43+k*28;
      const x=s*(52+(k%2)*12);
      block(x,z,15,9+(k%3)*2,19,walls);
      block(x,z-1,15.6,.55,20,roof).position.y=9+(k%3)*2;
      for(let j=0;j<3;j++) block(x-s*7.56,z-5+j*5,.15,3,2.2,windows).position.y=5+j*.2;
    }
  }
  const poleMat=material('#364449',.85),lightMat=new THREE.MeshBasicMaterial({color:'#f6e1b0'});
  for(const side of [-1,1])for(let z=-49;z<=49;z+=24.5){
    const pole=block(side*36,z,.22,9,.22,poleMat);
    const lamp=new THREE.Mesh(new THREE.BoxGeometry(3.2,.25,.75),lightMat);
    lamp.position.set(side*36,9.05,z);lamp.castShadow=false;scene.add(lamp);
  }
  for(const s of [-1,1]) for(let k=0;k<8;k++){
    const x=s*(71+k%2*3),z=-90+k*25;
    const trunk=block(x,z,.65,3.8,.65,material('#625b4f'));
    const green=material(k%2?'#526f59':'#406657');
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.2,1),green);
    crown.position.set(x,5.9,z);crown.castShadow=true;scene.add(crown);
  }
}
buildLot();

const root = new THREE.Group();
scene.add(root);
let ready=false;
let car = freshCar();
let view='follow';
const inputs={left:false,right:false,forward:false,reverse:false,brake:false};
let last=0;
const tmpPos=new THREE.Vector3(), tmpTarget=new THREE.Vector3();
const orbit=new OrbitControls(camera,renderer.domElement);
orbit.enabled=false;
orbit.enableDamping=true;
orbit.dampingFactor=.09;
orbit.minDistance=3.1;orbit.maxDistance=21;
orbit.maxPolarAngle=Math.PI/2-.08;
orbit.target.set(0,1,0);

function setMessage(text,sticky=false){
  el('message-text').textContent=text;
  el('message').classList.remove('hide');
  if(!sticky){clearTimeout(setMessage._timeout);setMessage._timeout=setTimeout(()=>el('message').classList.add('hide'),3300)}
}
function fail(title, detail){
  el('loader').classList.remove('hidden');
  el('load-title').textContent=title;
  el('load-detail').textContent=detail;
  el('reload').hidden=false;
  const orbitIcon=document.querySelector('.loader-orbit');if(orbitIcon)orbitIcon.style.display='none';
  el('status').textContent='読み込みに失敗しました';
}
el('reload').addEventListener('click',()=>window.location.reload());

function selectView(next){
  if(!ready)return;
  view=next;
  const inspecting=view==='orbit';
  orbit.enabled=inspecting;
  for(const b of document.querySelectorAll('[data-view]')){
    const active=b.dataset.view===next;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  }
  if(inspecting){
    clearInputs();car.speed=0;
    camera.up.set(0,1,0);
    tmpTarget.set(car.x,1.05,car.z);
    camera.position.set(car.x+5,car.y||4.2,car.z-8);
    orbit.target.copy(tmpTarget);
    orbit.update();
    setMessage('鑑賞モード：指で回転・ピンチでズーム');
  } else {
    setMessage(next==='top'?'俯瞰モード：車の向きを確認できます':'追従モード：前進・後退・ハンドルを操作できます');
  }
}
function reset(){
  car=freshCar();
  clearInputs();
  root.position.set(0,0,0);
  root.rotation.y=0;
  camera.position.set(6.6,4.4,-9.6);
  orbit.target.set(0,1,0);
  setMessage('スタート位置に戻しました');
}
function clearInputs(){for(const k in inputs)inputs[k]=false;for(const b of document.querySelectorAll('[data-action]'))b.classList.remove('held')}

for(const button of document.querySelectorAll('[data-action]')){
  const action=button.dataset.action;
  function end(e){
    inputs[action]=false;button.classList.remove('held');
    if(e?.pointerId!=null&&button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId);
  }
  button.addEventListener('pointerdown',e=>{
    if(!ready||view==='orbit'||(e.pointerType==='mouse'&&e.button!==0))return;
    e.preventDefault();button.setPointerCapture(e.pointerId);
    inputs[action]=true;button.classList.add('held');
  });
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,end);
}
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>selectView(b.dataset.view));
el('reset').addEventListener('click',reset);
const keyActions={w:'forward',arrowup:'forward',s:'reverse',arrowdown:'reverse',a:'left',arrowleft:'left',d:'right',arrowright:'right',' ':'brake'};
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(key in keyActions){e.preventDefault();if(ready&&view!=='orbit')inputs[keyActions[key]]=true}
  if(!e.repeat&&key==='r')reset();
  if(!e.repeat&&['1','2','3'].includes(key))selectView({1:'follow',2:'top',3:'orbit'}[key]);
});
window.addEventListener('keyup',e=>{const action=keyActions[e.key.toLowerCase()];if(action){e.preventDefault();inputs[action]=false}});
window.addEventListener('blur',clearInputs);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInputs()});

function updateCamera(dt){
  if(view==='orbit'){
    orbit.target.set(car.x,1.05,car.z);
    orbit.update();return;
  }
  const a=1-Math.exp(-4.8*Math.max(0,dt));
  const sx=Math.sin(car.heading),cz=Math.cos(car.heading);
  if(view==='top'){
    // Top-down: +Z points toward the top of the screen.
    camera.up.set(0,0,1);
    tmpPos.set(car.x,27,car.z-.01);
    tmpTarget.set(car.x,0,car.z);
    camera.fov=44;
  }else{
    camera.up.set(0,1,0);
    tmpPos.set(car.x + sx*(-9.5) + cz*5.8,5.1,car.z+cz*(-9.5)-sx*5.8);
    tmpTarget.set(car.x+sx*3.0,1.05,car.z+cz*3.0);
    camera.fov=51;
  }
  camera.position.lerp(tmpPos,a);
  camera.lookAt(tmpTarget);
  camera.updateProjectionMatrix();
  // Shadow coverage follows the car rather than being stuck at spawn.
  sun.position.set(car.x+22,38,car.z-24);
  sun.target.position.set(car.x,0,car.z);
}
function updateHUD(){
  el('speed').textContent=String(Math.round(Math.abs(car.speed)*3.6)).padStart(2,'0');
  el('gear').textContent=Math.abs(car.speed)<.03?'N':car.speed>0?'D':'R';
  el('distance').textContent=car.travelled.toFixed(1)+'m';
}
const resize=()=>{const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
window.addEventListener('resize',resize);resize();

function loop(now){
  requestAnimationFrame(loop);
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(ready){
    if(view!=='orbit'){
      car=stepCar(car,inputs,dt);
      root.position.set(car.x,0,car.z);
      root.rotation.y=car.heading;
    }
    updateCamera(dt);
    updateHUD();
  }
  renderer.render(scene,camera);
}
requestAnimationFrame(loop);

// For reproducible smoke checks: no mutation hooks or hidden gameplay alterations.
window.__garageParkDiagnostics=Object.freeze({
  get state(){return {...car}},
  get modelLoaded(){return ready},
  get currentView(){return view},
  get renderCalls(){return renderer.info.render.calls},
});

async function load(){
  try{
    const gltf=await new GLTFLoader().loadAsync(modelUrl);
    const object=gltf.scene;
    if(!object?.children?.length)throw new Error('車体メッシュが含まれていません');
    let triangles=0;