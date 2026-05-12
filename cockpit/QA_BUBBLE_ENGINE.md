# QA Checklist — OTOS OneAction™ Bubble Engine v2

Run through each item after any change. Mark ✅ pass / ❌ fail / ⚠️ partial.

---

## Base State (REST)

- [ ] One dominant OneAction bubble is clearly the largest element on screen
- [ ] OneAction bubble is centred on the viewport
- [ ] Tight cluster of secondary and tertiary bubbles sits behind / around the OneAction
- [ ] Cluster feels held together — not scattered across the screen
- [ ] No modal, card, or panel is visible on load
- [ ] Secondary bubbles show title only — no subline text, no buttons
- [ ] Tertiary bubbles are smaller than secondary; all labels remain readable
- [ ] OneAction hierarchy is obvious before reading any text
- [ ] All bubble labels are readable and not clipped
- [ ] Bubbles feel premium and solid — not flat or washed out
- [ ] Hint text "Click any bubble to inspect it" is visible at the bottom
- [ ] OneAction bubble has a subtle float animation (6 s, 10 px vertical)
- [ ] No other bubble animates constantly at REST
- [ ] Warm cream background visible; no harsh black or white
- [ ] No overflow scrollbars at any tested viewport size

---

## Inspect — OneAction bubble

- [ ] Clicking the OneAction bubble → INSPECTING (never straight to Action Mode)
- [ ] A single click never jumps the user into Action Mode
- [ ] OneAction stays centred; it does not move when inspected
- [ ] Buttons shown: **Open / Do** and **Collapse** only
- [ ] **Make this OneAction** is NOT shown when inspecting the OneAction
- [ ] Subline text becomes visible
- [ ] OneAction receives a stronger ring / glow (state-inspecting style)
- [ ] Other bubbles soften (lower opacity), but remain visible
- [ ] No rectangular panel or modal appears
- [ ] Bubble retains its circular spherical shape
- [ ] Pressing Escape collapses back to REST smoothly

---

## Inspect — Secondary bubble

- [ ] Clicking a secondary bubble → INSPECTING
- [ ] Bubble grows smoothly in its cluster position — it does not jump to centre
- [ ] Buttons shown: **Make this OneAction** and **Collapse** only
- [ ] **Open / Do** is NOT shown on a secondary bubble
- [ ] Subline text becomes visible on the inspected bubble
- [ ] Other bubbles soften; OneAction remains visible and clearly dominant
- [ ] No modal or card appears
- [ ] Pressing Escape collapses back to REST smoothly

---

## Promotion

- [ ] Clicking **Make this OneAction** triggers a physical move animation
- [ ] Promoted bubble travels to the centre and grows to OneAction size
- [ ] Old OneAction shrinks and moves to a secondary cluster slot
- [ ] Surrounding bubbles rebalance their positions around the new centre
- [ ] No bubble teleports — all movement is continuously animated
- [ ] Soft-body squeeze-inward plays on the promoted bubble
- [ ] Soft-body squeeze-yield plays on the demoting bubble
- [ ] Squeeze fires at roughly 52 % through the promotion (not instantly)
- [ ] Bubbles return to a clean circular form after squeeze settles
- [ ] Promoted bubble has the float animation once REST is restored
- [ ] System returns cleanly to REST state after promotion

---

## Action Mode

- [ ] **Open / Do** is only accessible from the current OneAction inspect
- [ ] Clicking **Open / Do** on a secondary bubble does nothing (button not shown)
- [ ] OneAction bubble expands smoothly to the large rounded surface
- [ ] Surface is bubble-like and rounded — NOT a separate rectangular modal
- [ ] Content shown: title, subline, "Why this matters" label + text, "Next step" label + text
- [ ] Buttons shown: **Mark Complete**, **Defer**, **← Back**
- [ ] The experience feels like the bubble expanded, not like a modal appeared
- [ ] Surrounding cluster softens but remains visible
- [ ] Clicking **← Back** returns smoothly to REST

---

## Completion

- [ ] Clicking **Mark Complete** begins a fade + scale-down animation on the OneAction
- [ ] After animation, the completed bubble is removed from the field
- [ ] Next highest-priority task rises to the OneAction position
- [ ] All remaining bubbles rebalance around the new OneAction
- [ ] No rectangular list or panel appears at any point
- [ ] System ends in a clean REST state with the new OneAction centred

---

## Deferral

- [ ] Clicking **Defer** moves the current OneAction to the back of the queue
- [ ] Next task rises to the OneAction position smoothly
- [ ] Deferred task reappears as a secondary bubble (still visible in cluster)
- [ ] All bubbles rebalance without teleporting
- [ ] System ends in a clean REST state

---

## Accessible and reduced motion

- [ ] Pressing Escape in INSPECTING state → REST
- [ ] Pressing Escape in ACTION_MODE state → REST
- [ ] All buttons are keyboard-focusable with visible focus ring
- [ ] Reduced-motion OS setting shortens all transitions to ~80 ms
- [ ] Reduced-motion OS setting removes all looping animations
- [ ] Debug panel motion toggle (⚡ Motion: OFF) produces the same reduced-motion behaviour at runtime

---

## Layout and responsiveness

- [ ] Works correctly at laptop viewport (~1366 × 768)
- [ ] Works correctly at large desktop (~1920 × 1080)
- [ ] Bubbles resize correctly on window resize
- [ ] Resize does not cause bubbles to jump — they reposition smoothly
- [ ] Cluster feels tight and pod-like at all tested sizes
- [ ] OneAction dominance is clear at all tested sizes
- [ ] Bubbles may overlap softly, but the OneAction is never obscured

---

## Code integrity

- [ ] No external dependencies (no CDN links, no npm modules)
- [ ] `TASK_DATA` array is clearly separated and easy to replace
- [ ] `CONFIG` object is at the top of `bubble_engine.js`
- [ ] All state transitions are named, guarded, and commented
- [ ] CSS class names are prefixed (`bubble-`, `btn-`, `action-`, etc.) — no global leakage
- [ ] Root container `#oneaction-bubble-engine` is self-contained
- [ ] Debug strip hidden by default; toggle button visible bottom-right
