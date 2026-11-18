// Car front is local +Z; Three.js positive rotation around +Y turns +Z toward +X.
// All positions and speeds are in metres; model length is 0.62 m in AR.
export const DRIVING = Object.freeze({
  maxForward: .48, maxReverse: .25, acceleration: .75, braking: 1.6,
  coasting: 1.15, steerAngle: .60, wheelbase: .38, steerSpeed: 4.6,
});
export const newPose = () => ({x:0,z:0,yaw:0,speed:0,steer:0});
const toward=(v,to,by)=>v<to?Math.min(to,v+by):Math.max(to,v-by);
export function advance(prev, keys, delta){
  const dt=Math.max(0,Math.min(.05,delta));
  const s={...prev};
  if(!dt)return s;
  // A forward-facing driver uses right=positive yaw and left=negative yaw.
  const desired=Number(Boolean(keys.right))-Number(Boolean(keys.left));
  s.steer=toward(s.steer,desired,dt*DRIVING.steerSpeed);
  const throttle=Number(Boolean(keys.forward))-Number(Boolean(keys.reverse));
  if(!throttle)s.speed=toward(s.speed,0,DRIVING.coasting*dt);
  else if(s.speed*throttle<0)s.speed=toward(s.speed,0,DRIVING.braking*dt);
  else s.speed+=throttle*DRIVING.acceleration*dt;
  s.speed=Math.min(DRIVING.maxForward,Math.max(-DRIVING.maxReverse,s.speed));
  // Use midpoint bicycle integration, not a fixed rear-wheel rotation pivot.
  const yawStep=s.speed*Math.tan(s.steer*DRIVING.steerAngle)/DRIVING.wheelbase*dt;
  const mid=s.yaw+yawStep/2;
  s.x+=Math.sin(mid)*s.speed*dt;
  s.z+=Math.cos(mid)*s.speed*dt;
  s.yaw+=yawStep;
  return s;
}