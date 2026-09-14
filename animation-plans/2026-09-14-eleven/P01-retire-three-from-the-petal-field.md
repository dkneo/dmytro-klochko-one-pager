# P01 — Retire three.js from the petal field; keep every petal

- **Status**: TODO
- **Commit**: bb2e3f5
- **Severity**: HIGH (performance)
- **Category**: Performance — script weight and main-thread cost
- **Estimated scope**: 1 file rewritten (`src/scripts/petal-field.js`, 355 lines), 1 dependency removed, tests unchanged

## Problem

The homepage's single largest asset is the petal field's bundle, and almost all of it is three.js:

```
dist/_astro/petal-field.*.js   520,574 bytes raw   129,422 bytes gzipped
```

Lighthouse, home desktop: `petal-field.js total 639ms (script 614ms)`; main thread "Script Evaluation 837ms"; TBT 120ms; "unused-javascript: 54KB of 132KB". Everything else on the page combined is a fraction of that. The module imports the whole renderer:

```js
// src/scripts/petal-field.js:15 — current
import * as THREE from "three";
```

and uses sixteen symbols of it (`WebGLRenderer`, `Scene`, `PerspectiveCamera`, `InstancedMesh`, `PlaneGeometry`, `MeshBasicMaterial`, `CanvasTexture`, `Matrix4`, `Quaternion`, `Euler`, `Vector3`, `Color`, `AdditiveBlending`, `DoubleSide`, `SRGBColorSpace`, `DynamicDrawUsage`). `WebGLRenderer` alone drags ~400KB of shader and material machinery in for what is, visually, 44 soft pink sprites with depth, a two-axis tumble, a slow wind, and a parting around the cursor.

The field loads on idle and only on desktop fine-pointer with motion welcome (`src/layouts/Layout.astro:348-358`), so first paint is not blocked. It still costs every desktop visitor ~130KB and ~600ms of main-thread time a few seconds in, which is exactly when they start scrolling.

## Target

The same field, drawn by ~250 lines of hand-written WebGL (or Canvas 2D if WebGL is unavailable), bundle ≤ 8KB gzipped, script evaluation ≤ 15ms. Nothing visible changes:

- same petal count (44), same sprite (the `dotTexture` / petal texture code stays verbatim — it is Canvas 2D already),
- same depth: perspective divide `s = f / (f + z)` for size and `alpha *= s` for distance fade,
- same two-axis tumble (rotation about x and y per petal, per frame), same slow wind, same cursor parting (repulsion falloff), same additive blending,
- same lifecycle: `start()` export, `sky-3d` class on `<html>` when running, pause on `visibilitychange`, stop when motion tier changes, canvas `aria-hidden`.

Implementation shape (WebGL 1, no extensions required):

```js
// one program: position (vec2), size (float), alpha (float), rotation (vec2 cos/sin of tilt) per petal
// draw as instanced quads via ANGLE_instanced_arrays when present, else 44 draw calls (trivial)
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE)  → additive, identical to THREE.AdditiveBlending
// texture: the existing petal canvas, uploaded once with gl.texImage2D, premultiplied off
```

Fallback when `canvas.getContext("webgl")` is null: Canvas 2D with `globalCompositeOperation = "lighter"`, petals sorted by z each frame, `drawImage` with `setTransform` for scale and tilt. This is the same visual within a pixel; the CSS petals remain the fallback below that, as now.

## Repo conventions to follow

- The module is loaded lazily from `src/layouts/Layout.astro:348-358` via `import("../scripts/petal-field.js").then((m) => m.start())`. Keep the `start` export and the `sky-3d` handshake so the CSS petals stand down exactly as before.
- Derived, not invented: the sprite is the CSS petal redrawn (`dotTexture`, the petal shape `border-radius 100% 6% 100% 6%`). Do not design a new petal.
- Reduced motion, data saver and phones never load the field (`root.dataset.motionTier !== "rich"` gate). Do not touch the gate.
- Tests: `tests/homepage-motion.test.mjs` "the phone stylesheet leaves the hero films as its only ambient motion" and `tests/house-rules.test.mjs` must stay green.

## Steps

1. Read `src/scripts/petal-field.js` in full. Copy out, verbatim, the texture builders (`dotTexture`, the petal canvas), the petal state model (positions, z range, spin rates, wind, cursor parting maths), the `start()`/stop lifecycle and the `visibilitychange` handling.
2. Replace the three.js scene with a WebGL program as described in Target: one vertex shader that takes per-petal `aCenter (vec2, clip space)`, `aSize`, `aAlpha`, `aTilt (vec2)`, builds a quad from a unit corner attribute, applies the tilt as a 2D squash (`cos` on x, `cos` on y of the two tumble angles — this is exactly what a camera sees of a plane tumbling on two axes), and a fragment shader that samples the petal texture and multiplies by `aAlpha`. Blend `SRC_ALPHA, ONE`.
3. Keep the per-frame simulation identical (same constants). Write the 44 petals' attributes into one `Float32Array` and `bufferSubData` it per frame; draw with `ANGLE_instanced_arrays` if available, else loop `drawArrays` per petal.
4. Add the Canvas 2D fallback path behind `if (!gl)`.
5. Remove `three` from `package.json` dependencies (`npm uninstall three`). Confirm nothing else imports it: `grep -rn "from \"three\"" src` must return only the old line you replaced.
6. Build. Confirm `ls -la dist/_astro/petal-field*.js` is under 12KB raw and there is no other bundle over 60KB raw except CSS.

## Boundaries

- Do NOT change the petal count, colours, speeds, sprite, wind or cursor behaviour. This is a renderer swap, not a redesign.
- Do NOT touch the loader gate in `Layout.astro` or the CSS petal fallback in `dream.css`.
- Do NOT add a new dependency (no pixi, no ogl, no regl).
- If the current code does not match the excerpts above (drift since bb2e3f5), STOP and report.

## Verification

- **Mechanical**: `npm run build` green; `node --test tests/*.test.mjs` green; bundle size as in step 6; Lighthouse home desktop "Script Evaluation" under 150ms total and "unused-javascript" no longer lists the field.
- **Feel check**: open `/` on a desktop with a mouse, wait four seconds. Confirm 44 petals fall with depth (far ones smaller, dimmer, slower), tumble on two axes, lean with the wind, part around the cursor within the same radius as before, and glow additively where two overlap. Record 5 seconds before and after at 60fps and step through frame by frame side by side: the two fields must be indistinguishable in density, size range, and brightness.
- **Done when**: the bundle is ≤ 8KB gzipped, `three` is gone from `package.json`, and the side-by-side frame check shows no visible difference.
