import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,newPose} from './motion.mjs';
function drive(keys,time=1.2){let p=newPose();for(let n=0;n<time*60;n++)p=advance(p,keys,1/60);return p}
test('forward goes in front of vehicle (+Z)',()=>{const p=drive({forward:true});assert.ok(p.z>.1);assert.ok(Math.abs(p.x)<.001)});
test('right and forward steer toward vehicle right (+X)',()=>{const p=drive({forward:true,right:true});assert.ok(p.x>.03,p.x);assert.ok(p.yaw>0)});
test('left and forward steer toward vehicle left (-X)',()=>{const p=drive({forward:true,left:true});assert.ok(p.x<-.03,p.x);assert.ok(p.yaw<0)});
test('right while reversing steers toward the opposite direction',()=>{const p=drive({reverse:true,right:true});assert.ok(p.yaw<0);assert.ok(p.z<0)});
test('stopped car cannot rotate in place when steering',()=>{const p=drive({right:true});assert.equal(p.yaw,0);assert.equal(p.speed,0)});
test('letting go causes a full stop',()=>{let p=drive({forward:true},1);for(let n=0;n<120;n++)p=advance(p,{},1/60);assert.equal(p.speed,0)});