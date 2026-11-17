# GARAGE PARK / PRECISION PARKING

Standalone, one-mission parking game for mobile Chrome, using the user's original Tripo AI GLB model. This is a separate rebuild from `garage-park-v2`.

## Core gameplay
- One *back-in parking* course with realistic 2.75 m bays, parked cars on both sides, wheel stops, cones and a real wall.
- Precise gear selection (D/R), independent accelerator/brake, touch steering wheel and optional left/right buttons; keyboard controls also supported.
- Dynamic camera follows travel direction in D/R, overhead orbit stays centered on the player's car (drag to rotate, pinch/scroll to zoom), and cockpit camera with three independent rendered mirrors. No free pan or return-to-car button.
- Independent physics module with midpoint bicycle model; true right-turn from the driver's perspective (car's front +Z). Static oriented-box obstacles, collision haptics and escape by reversing.
- Position, angle and zero-speed checks for parking clear; 0-contact and quick clear earns three stars.
- Three.js GLTFLoader preserves source model shape, UVs, normals and physically-based textures. Neighbour cars reuse the same mesh as color-tinted variants. Original car wheels are not separately animatable because the original GLB has one mesh.
- One parking course deliberately perfected before additional missions.

## Keyboard
- `W`/`↑`: accelerator; `S`/`↓` or `Space`: brake
- `A`/`←`, `D`/`→`: left/right steering
- `Q`: Reverse, `E`: Drive
- `1`, `2`, `3`: chase, overhead, cockpit
- `Escape`: pause

## Local testing
Serve with an HTTP server (modules are not supported via `file://`), e.g. `python -m http.server 8080` and open localhost in Chrome. Three.js is imported from jsDelivr, so a network connection is required.

`node --test physics.test.mjs`

`node route-check.mjs` checks that a deterministic reverse-parking controller can complete the course without hitting obstacles. This is a reachability smoke test, not an in-game autopilot.

## Limits
- GLB model is single mesh; wheels cannot visually steer until the model is split into parts.
- Cockpit instrument panel is an approximation, not a scan of the actual car interior.
- WebGL rendering and Android multitouch should be judged from live browser checks, not inferred from passing Node tests.