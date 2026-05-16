# OTOS Continuity — Design System Feature Lock v2

## Static hero behaviour
The hero is a retained, cinematic background plane. On desktop, the hero remains visually static while the next page layer scrolls up over it. This is a locked layout behaviour, not a one-off page trick.

Mobile fallback: do not force fixed background behaviour on small screens. Use stable absolute images to avoid black/blank hero states.

## Image-backed pane system
Final route panes should sit over a warm, image-backed glass plane. The pane must not become a black slab. The visual intent is:

- page-specific image behind the three route panes
- warm cream glassmorphism
- soft blur and transparency
- readable route cards
- image visible but not distracting

Use this pattern for future proof windows, route options, and partner navigation blocks.

## Proof/stat windows
Evidence and numbers pages can use large, simple proof windows inspired by high-end editorial/stat blocks. The figure should animate once, then stop. Every large number must carry a clear label:

- clinical record
- published study figure
- public data
- OTOS planning estimate
- demonstrator assumption

Never present study figures as guaranteed OTOS outcomes.
