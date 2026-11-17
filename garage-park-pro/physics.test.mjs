import test from 'node:test';
import assert from 'node:assert/strict';
import {createCar, integrate, simulate, intersects, box, assessParking} from './physics.mjs';
const run=(init,input,seconds=2,obs=[])=>{let car=init;let contact=null;for(let i=0;i<Math.round(seconds*60);i++){const r=simulate(car,input,1/60,obs);car=r.car;contact ||=r.contact}return {car,contact}};
test('right steering in forward moves toward driver right (-X)',()=>{
 const s=run(createCar(),{steer:1,throttle:true,gear:'D'}).car;
 assert.ok(s.x<-.8,`x=${s.x}`);assert.ok(s.heading<-.15);
});
test('left steering is the opposite direction',()=>{
 const s=run(createCar(),{steer:-1,throttle:true,gear:'D'}).car;
 assert.ok(s.x>.8&&s.heading>.15);
});
test('reverse gear genuinely drives backward and reverses yaw direction',()=>{
 const straight=run(createCar(),{steer:0,throttle:true,gear:'R'}).car;
 assert.ok(straight.z< -3);
 const right=run(createCar(),{steer:1,throttle:true,gear:'R'}).car;
 assert.ok(right.heading>.1);
});
test('stationary steering cannot rotate the car in place',()=>{
 const s=run(createCar(),{steer:1,throttle:false,gear:'D'}).car;
 assert.equal(s.heading,0);
});
test('braking and changing gear are smooth',()=>{
 const moving=run(createCar(),{steer:0,throttle:true,gear:'D'}).car;
 const braking=run(moving,{steer:0,throttle:false,brake:true,gear:'D'},1).car;
 assert.equal(braking.velocity,0);
 const reverse=run(braking,{steer:0,throttle:true,gear:'R'},2).car;
 assert.ok(reverse.velocity<0);
});
test('collision aligns with the visible collider, and backing out works',()=>{
 const obstacles=[box(0,6,3,1,0,'wall')];
 const {car,contact}=run(createCar(),{steer:0,throttle:true,gear:'D'},4,obstacles);
 assert.ok(contact);assert.ok(car.z<3.3);assert.equal(intersects(car,obstacles),null);
 const away=run(car,{steer:0,throttle:true,gear:'R'},3,obstacles).car;
 assert.ok(away.z<car.z-1);
});
test('parking requires correct x,z,yaw AND stopped',()=>{
 const goal={x:0,z:8.0,heading:Math.PI};
 assert.ok(assessParking(createCar(0,8,Math.PI),goal).complete);
 assert.ok(!assessParking(createCar(0.6,8,Math.PI),goal).complete);
 assert.ok(!assessParking(createCar(0,8,0),goal).complete);
 assert.ok(!assessParking({...createCar(0,8,Math.PI),velocity:.8},goal).complete);
});