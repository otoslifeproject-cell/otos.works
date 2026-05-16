# OTOS Design System Feature Lock v3 — Layout Cleanup

This pass locks the intended layered behaviour:

1. Hero behaviour
- Only the hero image layer is visually static/locked on desktop.
- Hero copy scrolls away normally.
- The page shell scrolls upward over the locked image.
- Mobile falls back to normal non-fixed image behaviour for stability.

2. Route/proof pane behaviour
- Section 06 route panes use a reusable image-backed glass pane system.
- The image sits behind the full section, not only behind one card.
- The copy card and route panes sit inside a shared glass shell.
- Legacy black-slab and route-list background pseudo-layers are disabled.

3. Proof/stat windows
- Evidence proof windows use simple bold numbers with forward/back settle motion.
- Motion stops after the first reveal.
- Reduced-motion users get no animation.

Do not replace this with sticky whole-section behaviour. The image locks; the text scrolls.
