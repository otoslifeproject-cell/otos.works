# QA Checklist — OTOS OneAction™ Bubble Engine v1

Run through each item after any change. Mark ✅ pass / ❌ fail / ⚠️ partial.

---

## Base State (REST)

- [ ] One dominant bubble is clearly larger than all others
- [ ] The dominant bubble is centred on screen
- [ ] No modal, card, or panel is visible on load
- [ ] Secondary bubbles show title text only (no subline, no buttons)
- [ ] Tertiary bubbles are smaller and lower opacity than secondary
- [ ] The hint text "Click any bubble to inspect it" is visible
- [ ] The dominant bubble has a subtle float animation
- [ ] Bubbles do not overlap each other
- [ ] Layout fills the viewport without overflow scrollbars
- [ ] Warm cream background is visible (no harsh black/white)

---

## Inspect State

- [ ] Clicking a secondary bubble transitions it to inspect state
- [ ] The inspected bubble grows smoothly (not a snap)
- [ ] The inspected bubble moves toward centre slightly but does not jump there
- [ ] The inspected bubble reveals its subline text
- [ ] Two primary buttons appear: **Make this OneAction** and **Open / Do**
- [ ] A **Collapse** button is also present
- [ ] No card, modal, or rectangular panel appears
- [ ] The inspected bubble retains its circular/spherical shape
- [ ] The current OneAction remains visible behind/around the inspected bubble
- [ ] Non-inspected bubbles soften (lower opacity) but remain visible
- [ ] Clicking **Collapse** returns everything to REST state smoothly

---

## Promotion State

- [ ] Clicking **Make this OneAction** triggers a physical move animation
- [ ] The inspected bubble moves to the centre position
- [ ] The inspected bubble grows to the OneAction size
- [ ] The previous OneAction shrinks and moves to a secondary slot
- [ ] Other bubbles rebalance their positions around the new OneAction
- [ ] Motion is spatially legible (you can follow which bubble is which)
- [ ] No bubble teleports (all movement is animated)
- [ ] After animation, the system returns cleanly to REST state
- [ ] The promoted bubble now has the float animation

---

## Open / Do (Action Mode)

- [ ] Clicking **Open / Do** expands the bubble into an execution surface
- [ ] The execution surface is large, rounded, and bubble-like (not a rectangle)
- [ ] It shows: task title, subline, "why this matters", "next step"
- [ ] Three buttons are present: **Mark Complete**, **Defer**, **← Back**
- [ ] The experience feels like the bubble expanded, not like a modal appeared
- [ ] Clicking **← Back** returns to REST state

---

## Completion

- [ ] Clicking **Mark Complete** fades/shrinks the current OneAction bubble
- [ ] The next highest priority bubble rises to the OneAction position
- [ ] All remaining bubbles rebalance around the new OneAction
- [ ] The completed bubble is removed from the field
- [ ] No sudden list or panel appears
- [ ] The system ends in a clean REST state with the new OneAction centred

---

## Deferral

- [ ] Clicking **Defer** moves the current OneAction to the end of the queue
- [ ] The next task rises to the OneAction position
- [ ] The deferred task becomes a secondary bubble (still visible)
- [ ] All bubbles rebalance smoothly

---

## Accessibility / Motion

- [ ] Reduced-motion mode shortens all transitions to ~80ms (test via OS setting)
- [ ] No animation loops or transitions run constantly (only float on OneAction)
- [ ] Buttons are keyboard-focusable
- [ ] Text is readable against bubble backgrounds at all sizes

---

## Layout / Responsiveness

- [ ] Works on laptop viewport (~1366×768)
- [ ] Works on large desktop (~1920×1080)
- [ ] Bubbles resize correctly on window resize
- [ ] No overflow scroll is introduced at any tested size

---

## Code Quality

- [ ] No external dependencies (no CDN links, no npm modules)
- [ ] `TASK_DATA` array is clearly separated and easy to replace
- [ ] `CONFIG` constants are at the top of `bubble_engine.js`
- [ ] State transitions are clearly named and commented
- [ ] CSS class names are prefixed to avoid conflicts (`bubble-`, `btn-`, etc.)
- [ ] Root container is `#oneaction-bubble-engine` with no global style leakage
