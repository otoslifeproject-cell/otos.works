# OTOS Continuity Design-System Feature Lock

## Static hero image layer
Hero images are now treated as a stable visual plane. On desktop, the hero image stays visually static while the page scrolls over it. On mobile / reduced-motion contexts, the image falls back to a safer non-fixed treatment to avoid blank or black hero states.

## Image-backed route panes
The final route section on each page now carries a page-specific background image behind the three navigation panes. The image is set via:

```html
<section class="section final section--pane-bg" style="--panel-bg:url('images/page-hero1.png')">
```

The panes stay translucent/glass-like above the image. This is now part of the OTOS visual system and can be reused for proof windows, stat windows and partner-route panels.

## Keep
- Current page layout/frame.
- Current filenames.
- Current copy.
- Current image slots.

## Next likely design extension
Use the same image-backed pane system for big proof windows, e.g. 61.3%, START, RCPsych, clinical-letter proof, and partner-route evidence blocks.
