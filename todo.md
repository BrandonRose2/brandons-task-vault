# Project TODO

- [x] Full-viewport golden button UI (no header, no padding, no extra UI)
- [x] Button label reads "New Recordings In"
- [x] On click: transitions to "Processing..." with spinner, disables re-click
- [x] Backend tRPC procedure calls Manus API (POST /v2/task.create) with x-manus-api-key
- [x] On success: show "Recordings sent for processing!" then auto-reset after a few seconds
- [x] On error: show "Error — Tap to Retry" and allow retry
- [x] Responsive: scales from tiny 200x100px window to full screen
- [x] Dark/sleek background with golden button as sole focal point
- [x] Write vitest tests for the tRPC procedure
- [x] Redesign button as a 3D tactile arcade-style button with depth, bevels, glossy highlights, shadows, and press-down animation
