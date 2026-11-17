/**
 * Deliberately obstacle-free until the vehicle's movement is validated.
 * The vehicle points toward +Z at heading 0; right steering increases heading.
 * Units are metres, seconds, and radians.
 */
export const SPEC = Object.freeze({
  maxForward: 5.5, maxReverse: 2.8, wheelbase: 2.65,
  acceleration: 3.2, reverseAcceleration: 2.4,
  brakeDeceleration: 8.5, coastDeceleration: 1.6,
  maxWheelAngle: 0.56, steeringResponse: 4.5,
});

export const freshCar = () => ({
  x: 0, z: 0, heading: 0, speed: 0, steer: 0,
  travelled: 0,
});

const approach = (now, target, diff) => now < target
  ? Math.min(now + diff, target)
  : Math.max(now - diff, target);

export function stepCar(current, inputs, dt) {
  const s = { ...current };
  const t = Math.max(0, Math.min(dt, 0.05));
  if (!t) return s;
  const steerTarget = (Number(Boolean(inputs.right)) - Number(Boolean(inputs.left)));
  s.steer = approach(s.steer, steerTarget, SPEC.steeringResponse * t);
  const pedal = Number(Boolean(inputs.forward)) - Number(Boolean(inputs.reverse));
  const brake = Boolean(inputs.brake) || (inputs.forward && inputs.reverse);
  const oldSpeed = s.speed;
  if (brake) {
    s.speed = approach(s.speed, 0, SPEC.brakeDeceleration * t);
  } else if (pedal === 0) {
    s.speed = approach(s.speed, 0, SPEC.coastDeceleration * t);
  } else if (oldSpeed !== 0 && Math.sign(oldSpeed) !== Math.sign(pedal)) {
    // Opposite pedal initially brakes. Reversing direction is gradual.
    s.speed = approach(s.speed, 0, SPEC.brakeDeceleration * t);
  } else {
    s.speed += pedal * (pedal > 0 ? SPEC.acceleration : SPEC.reverseAcceleration) * t;
  }
  s.speed = Math.min(SPEC.maxForward, Math.max(-SPEC.maxReverse, s.speed));
  const meanSpeed = (oldSpeed + s.speed) / 2;
  const wheelAngle = s.steer * SPEC.maxWheelAngle;
  const dHeading = (meanSpeed * Math.tan(wheelAngle) / SPEC.wheelbase) * t;
  const midpoint = s.heading + dHeading / 2;
  s.x += Math.sin(midpoint) * meanSpeed * t;
  s.z += Math.cos(midpoint) * meanSpeed * t;
  s.heading += dHeading;
  s.travelled += Math.abs(meanSpeed * t);
  return s;
}