# OTOS OneAction™ Bubble Engine v2

A standalone, dependency-free animation prototype for the OTOS Cockpit. Demonstrates the OneAction™ principle: one task is always primary, held at the centre as a dominant bubble, with all others grouped gently around it. The interface is spatial, not list-based.

## How to run

1. Drop the `cockpit/` folder anywhere on your machine
2. Open `index.html` directly in a browser — no server, no build step, no dependencies
3. Alternatively: `npx serve cockpit` or `python3 -m http.server 8080` from inside the folder

---

## State machine

```
                  ┌─────────────────────────────────────────┐
                  │                  REST                   │
                  │  OneAction centred, cluster around it   │
                  └──────┬──────────────────────────────────┘
                         │ click any bubble
                         ▼
                  ┌─────────────────────────────────────────┐
                  │              INSPECTING                 │
                  │  Clicked bubble reveals buttons         │
                  └──┬──────────────────┬───────────────────┘
                     │                  │
          Make this  │                  │ Open / Do
          OneAction  │                  │ (only on OneAction)
                     ▼                  ▼
             PROMOTING           ACTION_MODE
          (bubble moves to     (bubble expands to
           centre, squeeze)     execution surface)
                     │                  │
                     ▼         ┌────────┴──────────────┐
                   REST        │ Mark Complete / Defer  │
                               └────────────┬──────────┘
                                            │
                                     COMPLETING / DEFERRED
                                            │
                                          REST
```

### State function map

| Transition                         | Function                  |
|------------------------------------|---------------------------|
| REST → INSPECTING                  | `inspectBubble(id)`       |
| INSPECTING → REST                  | `collapseInspect()`       |
| INSPECTING → PROMOTING → REST      | `promoteBubble(id)`       |
| INSPECTING → ACTION_MODE           | `openActionMode(id)`      |
| ACTION_MODE → REST                 | `backFromAction()`        |
| ACTION_MODE → COMPLETING → REST    | `completeCurrentAction()` |
| ACTION_MODE → DEFERRED → REST      | `deferCurrentAction()`    |

---

## Button logic

| Context                        | Buttons shown                              | Not shown           |
|--------------------------------|--------------------------------------------|---------------------|
| Inspect the current OneAction  | Open / Do · Collapse                       | Make this OneAction |
| Inspect a secondary bubble     | Make this OneAction · Collapse             | Open / Do           |
| Action Mode (expanded surface) | Mark Complete · Defer · ← Back            | —                   |

The Open / Do button is only ever shown on the current OneAction. Clicking a secondary bubble can never immediately open action mode — the user must first promote and then open.

---

## Integration instructions

1. Copy `bubble_engine.js` and `styles.css` into the Cockpit asset tree
2. Add `<link rel="stylesheet" href="styles.css">` to the Cockpit `<head>`
3. Add the following to your page where the bubble field should live:
   ```html
   <div id="oneaction-bubble-engine">
     <div id="bubble-field"></div>
     <p class="engine-hint" id="engine-hint">Click any bubble to inspect it</p>
   </div>
   ```
4. Replace `TASK_DATA` at the top of `bubble_engine.js` with a live data feed or API call. Each task requires: `id`, `title`, `subline`, `why`, `nextStep`, `priority` (integer, lower = more urgent), `lane` (people / money / truth / continuity / skyhawk / studio / capture / admin), `status` ('active' to appear)
5. Call `init()` once data is ready; call `renderBubbleField()` after any data change
6. The root element `#oneaction-bubble-engine` is self-contained — no global CSS conflicts
7. To suppress the debug panel, remove `#debug-strip` and `#debug-toggle` from the HTML

---

## File structure

```
cockpit/
  index.html          — standalone wrapper page
  styles.css          — design tokens, layout, animation, component styles
  bubble_engine.js    — state machine, render, layout, transitions
  README.md           — this file
  QA_BUBBLE_ENGINE.md — QA checklist
  MOTION_SPEC.md      — motion design specification
```

---

## What is new in v2

| Area               | v1                                       | v2                                                        |
|--------------------|------------------------------------------|-----------------------------------------------------------|
| Architecture       | Single `.bubble` element                 | Two-layer: `.bubble-wrap` (position) + `.bubble-sphere` (visual) |
| Squeeze effect     | Not present                              | Soft-body contact squeeze at 52% of promotion animation   |
| Cluster layout     | Orbital angles at fixed radii            | Tight pod geometry with explicit dx/dy offsets in vmin    |
| Sizes              | Fractions of viewport min                | Named vmin values in CONFIG.size                          |
| Task data          | Generic placeholder data                 | Exact OTOS task set                                       |
| State: DEFERRED    | Not a distinct state                     | Explicit DEFERRED state before returning to REST          |
| Reduced motion     | CSS media query only                     | CSS media query + runtime toggle via debug panel          |
| Action mode guard  | Open / Do available on all inspected     | Open / Do restricted to current OneAction only            |
| Timing             | inspect 450 / promote 800 / rebalance 900| inspect 400 / promote 750 / rebalance 800 / squeeze 280   |
| Debug              | No debug panel                           | Debug strip with state readout and motion toggle          |
