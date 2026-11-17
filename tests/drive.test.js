import test from 'node:test';
import assert from 'node:assert/strict';
import { freshCar, stepCar, SPEC } from '../src/drive.js';
const run = (s, input, secs=2) => {
  for (let i = 0; i < Math.round(secs * 60); i++) s = stepCar(s, input, 1/60);
  return s;
};
test('a car advances when the forward pedal is held without obstacles', () => {
  const s = run(freshCar(), { forward:true });
  assert.ok(s.z > 4, `Expected forward movement, got ${s.z}`);
  assert.ok(Math.abs(s.x) < 0.001);
});
test('a car reverses when the reverse pedal is held', () => {
  const s = run(freshCar(), { reverse:true });
  assert.ok(s.z < -3, `Expected reverse movement, got ${s.z}`);
});
test('steering produces turns, not blocked movement', () => {
  const s = run(freshCar(), { forward:true, right:true });
  assert.ok(s.heading > 0.25);
  assert.ok(s.x > 0.2);
});
test('coasting and braking work; brake can stop completely', () => {
  const moving = run(freshCar(), {forward:true}, 2);
  const coast = run(moving, {}, 1);
  assert.ok(coast.speed < moving.speed && coast.speed > 0);
  const stopped = run(coast, {brake:true}, 2);
  assert.equal(stopped.speed,0);
});
test('reverse steering changes yaw in opposite direction', () => {
  const s = run(freshCar(), {reverse:true,right:true},2);
  assert.ok(s.heading < -0.1);
});
test('time step is clamped, runaway jumps are prevented', () => {
  const s=stepCar(freshCar(), {forward:true},3);
  assert.ok(s.speed<=SPEC.acceleration*.051);
});