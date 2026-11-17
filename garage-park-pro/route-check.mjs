import {createCar,box,simulate,assessParking} from './physics.mjs';
const obs=[...[-5.5,-2.75,2.75,5.5].map(x=>box(x,7.7,2.02,4.55,Math.PI,'car')), ...[-5.5,-2.75,0,2.75,5.5].map(x=>box(x,10.17,1.95,.2,0,'stop')),box(0,11.05,16,.45,0,'wall'),box(-8,-2,.4,27),box(8,-2,.4,27),box(-5.6,-.8,.52,.52),box(5.5,-2.5,.52,.52),...[-7.25,7.25].flatMap(x=>[4.1,-10].map(z=>box(x,z,.68,.68)))];
let c=createCar(-2.25,-2.6,3.42),hits=0,finished=false;
for(let i=0;i<1200;i++){
 const d=7.7-c.z;
 const desiredHeading=Math.PI+Math.atan2(-c.x,Math.max(4.5,d*1.2));
 const error=Math.atan2(Math.sin(desiredHeading-c.heading),Math.cos(desiredHeading-c.heading));
 const steer=Math.max(-1,Math.min(1,error*3));
 const brake = d<.5 && Math.abs(c.velocity)> .07;
 const input={gear:'R',throttle:!brake,brake,steer};
 const out=simulate(c,input,1/60,obs);c=out.car;if(out.contact)hits++;
 if(i%60===0)console.log(i/60,c.x.toFixed(2),c.z.toFixed(2),c.heading.toFixed(2),c.velocity.toFixed(2),'contact',out.contact?.kind);
 if(assessParking(c,{x:0,z:7.7,heading:Math.PI}).complete){finished=true;console.log('PARKED at',i/60);break}
}
console.log('result',finished,c,hits);