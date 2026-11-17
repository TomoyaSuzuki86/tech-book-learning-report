// World convention: +Z is forward, +X is right, yaw increases when turning right.
// The vehicle pose tracks its midpoint rather than treating the rear axle as a pivot.
export const CAR = Object.freeze({width:2.02,length:4.55,wheelbase:2.72,rearAxle:-1.25,maxForward:3.8,maxReverse:2.2,accel:2.5,reverseAccel:1.9,brake:5.5,drag:1.1,maxSteer:0.6,steerSpeed:3.7});
export const fresh = (x,z,heading=0)=>({x,z,heading,speed:0,steer:0,odometer:0});
const approach=(a,b,n)=>a<b?Math.min(a+n,b):Math.max(a-n,b);
export function integrate(car,keys,seconds){
  const dt=Math.max(0,Math.min(.05,seconds)), s={...car};
  if(!dt)return s;
  const demand=(Number(!!keys.right)-Number(!!keys.left));
  s.steer=approach(s.steer,demand,CAR.steerSpeed*dt);
  const throttle=Number(!!keys.forward)-Number(!!keys.reverse);
  if(keys.brake||(keys.forward&&keys.reverse))s.speed=approach(s.speed,0,CAR.brake*dt);
  else if(!throttle)s.speed=approach(s.speed,0,CAR.drag*dt);
  else if(s.speed*throttle<0)s.speed=approach(s.speed,0,CAR.brake*dt);
  else s.speed+=throttle*(throttle>0?CAR.accel:CAR.reverseAccel)*dt;
  s.speed=Math.max(-CAR.maxReverse,Math.min(CAR.maxForward,s.speed));
  // Midpoint bicycle model: slip-angle beta maps front-wheel steer to center motion.
  const beta=Math.atan(.5*Math.tan(s.steer*CAR.maxSteer));
  const yawRate=s.speed/CAR.wheelbase*Math.tan(s.steer*CAR.maxSteer)*Math.cos(beta);
  const angle=s.heading+yawRate*dt*.5;
  const traveled=s.speed*dt;
  s.x+=Math.sin(angle+beta)*traveled;
  s.z+=Math.cos(angle+beta)*traveled;
  s.heading+=yawRate*dt;
  s.odometer+=Math.abs(traveled);
  return s;
}
export function obb(x,z,w,l,heading=0,type='block'){return{x,z,w,l,heading,type};}
export function overlap(a,b){
  // SAT: no invisible or arbitrary boundary constraints.
  const ax=[Math.cos(a.heading),-Math.sin(a.heading)], az=[Math.sin(a.heading),Math.cos(a.heading)];
  const bx=[Math.cos(b.heading),-Math.sin(b.heading)], bz=[Math.sin(b.heading),Math.cos(b.heading)];
  const delta=[b.x-a.x,b.z-a.z];
  for(const axis of [ax,az,bx,bz]){
    const proj=(box,ux,uz)=>Math.abs(axis[0]*ux[0]+axis[1]*ux[1])*box.w/2+Math.abs(axis[0]*uz[0]+axis[1]*uz[1])*box.l/2;
    if(Math.abs(delta[0]*axis[0]+delta[1]*axis[1]) >= proj(a,ax,az)+proj(b,bx,bz)-.0001) return false;
  }
  return true;
}
export function collisionAt(car,colliders){const own=obb(car.x,car.z,CAR.width,CAR.length,car.heading,'player');return colliders.find(o=>overlap(own,o))||null;}
export function simulate(car,keys,seconds,colliders){
  let state={...car},contact=null;
  const count=Math.max(1,Math.ceil(seconds/(1/100)));
  for(let i=0;i<count;i++){
    const next=integrate(state,keys,seconds/count);
    const blocked=collisionAt(next,colliders);
    if(!blocked){state=next;continue;}
    contact=blocked;
    // Try the translation without yaw, then pure yaw, to allow gentle sliding along edges.
    const translate={...next,heading:state.heading};
    if(!collisionAt(translate,colliders)){state={...translate,speed:next.speed*.55};continue;}
    const rotate={...state,heading:next.heading};
    if(!collisionAt(rotate,colliders)){state={...rotate,speed:0,steer:next.steer};continue;}
    state={...state,speed:0,steer:next.steer};
  }
  return {state,contact};
}
export function parkingResult(car,target){
  const dx=car.x-target.x,dz=car.z-target.z;
  const side=dx*Math.cos(target.heading)-dz*Math.sin(target.heading);
  const fore=dx*Math.sin(target.heading)+dz*Math.cos(target.heading);
  const angle=Math.abs(Math.atan2(Math.sin(car.heading-target.heading),Math.cos(car.heading-target.heading)));
  const aligned=Math.abs(side)<=.4 && Math.abs(fore)<=.8 && angle<.17;
  return {aligned,stopped:Math.abs(car.speed)<.12,side,fore,angle,complete:aligned&&Math.abs(car.speed)<.12};
}