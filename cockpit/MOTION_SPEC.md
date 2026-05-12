# Motion Specification — OTOS OneAction™ Bubble Engine v2

This document describes every timed, eased, and animated behaviour in the Bubble Engine. It is the source of truth for any motion design decision.

---

## Timing table

| Event                   | Duration | Variable              |
|-------------------------|----------|-----------------------|
| Inspect (open / close)  | 400 ms   | `CONFIG.timing.inspect`   |
| Promote (bubble to centre) | 750 ms | `CONFIG.timing.promote`   |
| Rebalance (cluster settle) | 800 ms | `CONFIG.timing.rebalance` |
| Complete (fade + shrink) | 650 ms  | `CONFIG.timing.complete`  |
| Defer (reorder + settle) | 700 ms  | `CONFIG.timing.defer`     |
| Squeeze (soft-body effect) | 280 ms | `CONFIG.timing.squeeze`   |
| Hover (button micro)    | 180 ms   | CSS `--t-hover`           |
| Reduced motion fallback | 80 ms    | Hard-coded via media query and runtime flag |

---

## Easing rationale

Three named easings are used throughout the engine. Each is chosen for what it communicates.

### Spring — `cubic-bezier(0.34, 1.25, 0.64, 1)`
Used for entrances, promotions, and growth. The overshoot past 1.0 gives a physical, alive quality — the bubble arrives with energy, not just slides in. Used on `transform`, `width`, and `height` transitions on `.bubble-wrap`.

### Smooth — `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
Used for fades, subline reveals, button appearances, and opacity transitions. No overshoot — calm and readable. Used on `opacity`, `transition-delay` sequences inside `.bubble-sphere`.

### Settle — `cubic-bezier(0.22, 1, 0.36, 1)`
Used for exits and collapses. Fast start, very long tail — the element decelerates gently to rest like a cushion. Closer to real-world physics than an ease-out. Used on completion and deferral sequences.

---

## Two-layer architecture and why it matters for motion

The Bubble Engine separates position from appearance into two DOM elements:

- **`.bubble-wrap`** handles: `transform` (translate to x/y position), `width`, `height`, `z-index`, `border-radius`, and `transition`. This is the positioning layer.
- **`.bubble-sphere`** handles: gradient, box-shadow, squeeze animation via `scaleX`/`scaleY` keyframes. This is the visual layer.

Because `transform` on `.bubble-wrap` controls position and `transform` on `.bubble-sphere` controls squeeze, both can animate simultaneously without conflicting. If they were on the same element, a CSS `transition` on `transform` for position would overwrite the `animation` keyframe for squeeze, and the effect would be lost.

---

## Soft-body contact effect

### What it is
When a bubble is promoted to OneAction, the transition simulates a soft physical body arriving at the centre — like a fluid sphere pressing through space. The promoted bubble squeezes inward on arrival; the displaced (demoting) bubble yields sideways.

### When it triggers
At **52 % through the promote animation** (i.e., `CONFIG.timing.promote * 0.52` = 390 ms into a 750 ms move). This is the point at which the promoted bubble is approximately reaching the centre — the squeeze looks like a physical contact moment.

### How it works
The function `triggerSqueeze(promotedId, demotedId)` finds the `.bubble-sphere` elements of both bubbles and adds CSS classes:

- `squeeze-inward` on the promoted bubble
- `squeeze-yield` on the demoting bubble

These classes trigger keyframe animations that run entirely on `.bubble-sphere` via `scaleX`/`scaleY`, independently of the `transform: translate` running on `.bubble-wrap`.

Classes are removed after `CONFIG.timing.squeeze + 60 ms` to leave the elements clean.

### What it looks like

**squeeze-inward** (promoted bubble arriving):
```
0%   → scaleX(1.00) scaleY(1.00)   normal
30%  → scaleX(0.90) scaleY(1.08)   compressed on X, tall on Y
65%  → scaleX(1.04) scaleY(0.97)   slight overshoot back
100% → scaleX(1.00) scaleY(1.00)   settled
```

**squeeze-yield** (demoting bubble being displaced):
```
0%   → scaleX(1.00) scaleY(1.00)   normal
30%  → scaleX(1.06) scaleY(0.91)   pushed wide, short
65%  → scaleX(0.97) scaleY(1.02)   slight overshoot
100% → scaleX(1.00) scaleY(1.00)   settled
```

Both use the spring easing `cubic-bezier(0.34, 1.25, 0.64, 1)`.

---

## Cluster layout

The secondary and tertiary bubbles form a tight pod around the OneAction, not an evenly spaced orbit.

### Secondary slots (up to 6 bubbles)
Offsets are defined as explicit `{ dx, dy }` pairs in `CONFIG.cluster.secondary`, in vmin units. At a 1000 px viewport min, 1 vmin ≈ 10 px.

| Slot | dx (vmin) | dy (vmin) | Approximate screen direction |
|------|-----------|-----------|------------------------------|
| 0    | −16       | −11       | Upper-left                   |
| 1    | +13       | −15       | Upper-right                  |
| 2    | +20       | +4        | Right                        |
| 3    | −18       | +8        | Left                         |
| 4    | +5        | +19       | Lower-right                  |
| 5    | −8        | −19       | Upper-left-ish               |

The OneAction diameter is 28 vmin (radius 14 vmin). Secondary bubbles at ~13–20 vmin offset will partially overlap or sit just touching the OneAction — this creates the clustered pod feel, not a spaced orbit.

### Tertiary slots (up to 4 bubbles)
Tertiary bubbles sit further out, behind the secondary layer.

| Slot | dx (vmin) | dy (vmin) |
|------|-----------|-----------|
| 0    | +14       | +25       |
| 1    | −25       | +11       |
| 2    | +23       | −14       |
| 3    | −12       | −26       |

---

## Float animation

The OneAction bubble floats vertically at REST to signal it is alive and primary.

- **Keyframes:** `0%` and `100%` at natural position; `50%` translated 10 px upward
- **Duration:** 6 s
- **Easing:** `ease-in-out` (standard CSS, no custom easing)
- **Applied to:** `.bubble-wrap.role-primary.state-rest` only
- **Suppressed:** as soon as state leaves REST, or if any other role class is applied, or if reduced motion is active

Only the OneAction bubble floats. No other bubble animates continuously.

---

## Reduced motion

When `prefers-reduced-motion: reduce` is active (via OS setting), or when `CONFIG._reducedMotion` is set to `true` via the runtime debug toggle:

- All `transition-duration` values on `.bubble-wrap`, `.bubble-subline`, `.bubble-actions`, `.action-inner`, `.engine-hint`, and `.btn` are forced to 80 ms via `!important`
- All looping `animation` values are set to `none !important` (this removes the float and the squeeze keyframes)
- The `durationForRole()` function returns 80 ms immediately, bypassing all timing config values
- No squeeze effect fires (guarded by `if (!CONFIG.reducedMotion)` in `promoteBubble`)

The result is a fully functional interface with instant-feeling transitions rather than no transitions at all.

---

## State-based motion priority

When ACTION_MODE is active, the bubble surface has expanded. No other positional transition should override this. The layout calculation returns the `action` role only for the inspected OneAction, suppressing all secondary/tertiary rebalancing. Other bubbles soften (opacity 0.35, pointer-events off) but do not animate position while action mode is open.

Position transitions only resume once `backFromAction()`, `completeCurrentAction()`, or `deferCurrentAction()` is called — at which point `positionAllBubbles()` runs with the appropriate timing.
