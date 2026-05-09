# OTOS Hero Image Tag Patch

Upload the contents of this folder to the `final-prepilot-partner-portal` branch.

This patch does one thing: it makes every hero use a real `<img>` tag inside the hero, instead of relying only on CSS background-image.

Why: the diagnostic page proved the images load, but the actual pages were still showing black hero areas. This bypasses the CSS background issue and makes the hero image visible directly.

Commit message suggestion:

Fix hero images using direct img tags
