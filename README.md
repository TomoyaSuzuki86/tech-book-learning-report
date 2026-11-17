# GARAGE PARK / DRIVE LAB (phase 1)

A clean rebuild of the user's parking-game prototype, prioritizing the original Tripo AI GLB's appearance and a reliable open-lot driving experience **before** implementing parking and mirrors.

## Features
- Three.js glTF 2.0 loader uses the model's original PBR material maps, without a substitute car or custom shaders.
- Chase, overhead, and orbital inspection views.
- Drive with touch buttons (supports multi-touch) or WASD / arrow keys. Hold `Space` for brake. `R` resets, `1`/`2`/`3` change cameras.
- Simple bicycle-model motion in metres/seconds with fixed-step-like dt cap. No obstacle colliders until the visual/driving baseline has been approved.
- Clear errors when WebGL or the GLB cannot load. No fake placeholder car.

## Build
Requires Node.js 22+.

```
npm install
npm test
npm run dev
npm run build
```

Render static site: build `npm ci && npm run build` (or `npm install && npm run build` if the lockfile is unavailable), publish `dist`.

## Acceptance gate before phase 2
1. See the intended vehicle from front and rear, with wheels, windows and correct texture materials.
2. Confirm sustained forwards motion, backwards motion, directional steering, and braking on a physical Pixel Chrome browser.
3. Confirm no invisible collision at spawn and the three camera modes operate.
4. Only after approval: introduce collision proxies (Rapier), parking bays/criteria, and cockpit geometry/mirror render targets. These features are **not implemented yet**.

## Notes
- The source model has 1 mesh (5,866 triangles), so its wheels and doors cannot be animated individually without mesh separation.
- The bundled model is geometry-preserving but JPEG-optimized for web delivery. Source FBX/GLB supplied by the user are unchanged.
- Live 3D WebGL could not be tested in the local sandbox due to graphics restrictions. Node unit tests validate motion equations, not rendering quality.