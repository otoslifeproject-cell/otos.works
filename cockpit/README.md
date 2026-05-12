# OTOS OneAction™ Bubble Engine v1

A standalone animation prototype for the OTOS Cockpit. Demonstrates the OneAction™ principle: the user has one main thing to consider, with other tasks held gently behind it.

## What it does

- Displays a living pod of task bubbles with one dominant OneAction bubble at the centre
- Secondary and tertiary bubbles orbit around it at different sizes and opacities
- Clicking a secondary bubble **inspects** it (grows, reveals two calm action buttons) — it does not immediately become the OneAction
- Choosing **Make this OneAction** physically moves that bubble to the centre; the old OneAction demotes and moves back
- Choosing **Open / Do** expands the bubble into a rounded execution surface
- **Mark Complete** fades the current OneAction out and the next priority bubble rises
- **Defer** moves the current task to the back of the queue
- All motion is smooth, spatially legible, and ADHD-safe

## How to run locally

1. Drop the `cockpit/` folder anywhere on your machine
2. Open `index.html` in a browser directly (no server needed — it is pure HTML/CSS/JS)
3. Alternatively serve it: `npx serve cockpit` or `python3 -m http.server 8080` from inside the folder

## State machine

```
REST  ──click secondary──▶  INSPECTING
         │                       │
         │              ┌────────┴────────────┐
         │              ▼                     ▼
         │          PROMOTING           ACTION_MODE
         │              │                     │
         │              ▼             Mark Complete / Defer
         │            REST            ──────────────────▶  COMPLETING
         │                                                      │
         └──────────────────────────────────────────────────▶  REST
```

State function map:

| Transition            | Function              |
|-----------------------|-----------------------|
| REST → INSPECTING     | `inspectBubble(id)`   |
| INSPECTING → REST     | `collapseInspect()`   |
| INSPECTING → PROMOTING→ REST | `promoteBubble(id)` |
| INSPECTING/REST → ACTION_MODE | `openActionMode(id)` |
| ACTION_MODE → REST    | `backFromAction()`    |
| ACTION_MODE → COMPLETING → REST | `completeCurrentAction()` |
| ACTION_MODE → REST    | `deferCurrentAction()` |

## How to integrate into the OTOS Cockpit

1. Copy `bubble_engine.js` and `styles.css` into the Cockpit asset tree
2. Add `<link rel="stylesheet" href="styles.css">` to the Cockpit `<head>`
3. Add `<div id="oneaction-bubble-engine"><div id="bubble-field"></div></div>` wherever the bubble field should live
4. Add `<div id="engine-hint" class="engine-hint">Click any bubble to inspect it</div>` inside the wrapper
5. Replace `TASK_DATA` at the top of `bubble_engine.js` with a live data feed or API call
6. Call `init()` once data is ready; call `renderBubbleField()` after any data change
7. The root element `#oneaction-bubble-engine` is self-contained — no global CSS conflicts

## File structure

```
cockpit/
  index.html          — wrapper page (standalone use)
  styles.css          — all visual styles and animation tokens
  bubble_engine.js    — state machine, render, position, transitions
  README.md           — this file
  QA_BUBBLE_ENGINE.md — QA checklist
```
