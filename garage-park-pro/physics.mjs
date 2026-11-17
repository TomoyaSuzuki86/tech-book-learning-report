/** Garage Park vehicle dynamics.
 * GLB forward = local +Z, up = +Y; on-screen driver's right = local -X.
 * Positive steering = right; thus a forward right turn DECREASES Three.js yaw.
 * Units: metres, seconds, radians. This module has no DOM/WebGL dependencies.
 */
export const VEHICLE = Object.freeze({
  length: 4.55, width: 2.02, wheelbase: 2.72,
  maxForward: 4.5, maxReverse: 2.4,
  forwardAccel: 2.8, reverseAccel: 2.15, brakeAccel: 8.0, rollingFriction: 1.4,
  maxWheelAngle: 0.57, steerRate: 2.8,
});
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const approach = (a, b, step) => a < b ? Math.min(a + step, b) : Math.max(a - step, b);
export const createCar = (x = 0, z = 0, heading = 0) => ({x, z, heading, velocity: 0, steer: 0, distance: 0});
export function integrate(inputCar, input, dt) {
  const car = {...inputCar};
  const t = clamp(dt || 0, 0, .025);
  if (!t) return car;
  const request = clamp(input.steer || 0, -1, 1);
  car.steer = approach(car.steer, request, VEHICLE.steerRate * t);
  const gear = input.gear === 'R' ? -1 : 1;
  const v0 = car.velocity;
  if (input.brake) {
    car.velocity = approach(v0, 0, VEHICLE.brakeAccel * t);
  } else if (input.throttle) {
    if (Math.abs(v0) > .01 && Math.sign(v0) !== gear) {
      car.velocity = approach(v0, 0, VEHICLE.brakeAccel * t);
    } else {
      car.velocity = v0 + gear * (gear > 0 ? VEHICLE.forwardAccel : VEHICLE.reverseAccel) * t;
    }
  } else {
    car.velocity = approach(v0, 0, VEHICLE.rollingFriction * t);
  }
  car.velocity = clamp(car.velocity, -VEHICLE.maxReverse, VEHICLE.maxForward);
  const speed = (v0 + car.velocity) * .5;
  const wheelAngle = car.steer * VEHICLE.maxWheelAngle;
  // Midpoint two-axle bicycle model, not rear-wheel-as-pivot rotation.
  const beta = Math.atan(.5 * Math.tan(wheelAngle));
  const deltaHeading = -speed / VEHICLE.wheelbase * Math.tan(wheelAngle) * Math.cos(beta) * t;
  const middle = car.heading + .5 * deltaHeading;
  const travel = speed * t;
  car.x += Math.sin(middle - beta) * travel;
  car.z += Math.cos(middle - beta) * travel;
  car.heading += deltaHeading;
  car.distance += Math.abs(travel);
  return car;
}
export const box = (x, z, width, length, heading = 0, kind = 'obstacle') => ({x,z,width,length,heading,kind});
function axes(b) {
  const c=Math.cos(b.heading), s=Math.sin(b.heading);
  return [[c,-s],[s,c]];
}
export function overlap(a,b) {
  // Separating axis theorem, two oriented rectangles. Touching is not penetration.
  const [ax,az] = axes(a), [bx,bz] = axes(b);
  const delta=[b.x-a.x,b.z-a.z];
  for(const axis of [ax,az,bx,bz]){
    const radius=(obj,u,v)=>Math.abs(u[0]*axis[0]+u[1]*axis[1])*obj.width*.5 + Math.abs(v[0]*axis[0]+v[1]*axis[1])*obj.length*.5;
    const dist=Math.abs(delta[0]*axis[0]+delta[1]*axis[1]);
    if(dist >= radius(a,ax,az)+radius(b,bx,bz)-1e-6)return false;
  }
  return true;
}
export function intersects(car, obstacles, width=VEHICLE.width, length=VEHICLE.length) {
  const body=box(car.x,car.z,width,length,car.heading);
  return obstacles.find(item=>overlap(body,item))||null;
}
export function simulate(car, input, seconds, obstacles=[]) {
  let next={...car},contact=null;
  const steps=Math.max(1,Math.ceil(Math.max(0,seconds)/.012));
  const dt=Math.min(Math.max(0,seconds)/steps,.025);
  for(let n=0;n<steps;n++){
    const desired=integrate(next,input,dt);
    const collision=intersects(desired,obstacles);
    if(!collision){next=desired;continue;}
    contact=collision;
    // Retain the last safe pose. Slow to zero instead of entering an obstacle.
    // When the driver reverses, the vehicle can retreat immediately.
    next={...next,steer:desired.steer,velocity:0};
  }
  return {car:next,contact};
}
export function assessParking(car,target) {
  const deltaX=car.x-target.x,deltaZ=car.z-target.z;
  const lateral=deltaX*Math.cos(target.heading)-deltaZ*Math.sin(target.heading);
  const longitudinal=deltaX*Math.sin(target.heading)+deltaZ*Math.cos(target.heading);
  const headingError=Math.abs(Math.atan2(Math.sin(car.heading-target.heading),Math.cos(car.heading-target.heading)));
  const aligned = Math.abs(lateral)<.27 && Math.abs(longitudinal)<.49 && headingError<.13;
  const stopped = Math.abs(car.velocity)<.12;
  return {aligned,stopped,complete:aligned&&stopped,lateral,longitudinal,headingError};
}