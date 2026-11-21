# Spatial

For visionOS, Meta Quest, PCVR, and WebXR. Platform HIG values win when stricter.

## Measure angles, not pixels

| Element | Minimum |
|---|---|
| Body text | 1.2° vertical (1° hard floor) |
| Headline | 2° |
| Gaze target | 2° (3° for primary actions) |
| Direct touch | 2.5° at arm's length |
| Line length | 60–80 characters |

At 1.5 m, 1° is about 2.6 cm. A 26 px size at that distance is roughly 1°, which is why a monitor preview is not evidence. Thin weights disappear at distance and in motion.

## Three depth planes

| Plane | Distance | Content |
|---|---|---|
| Near | 0.35–0.6 m | Direct manipulation, hand menu, grab |
| Mid | 1–2 m | Panels, lists, forms, media |
| Far | 3–10 m | Context, scene, large visuals, no body text |

One plane per task. Large panels farther, small controls closer. Keep a stable world reference (floor, desk, window); fully floating UI causes disorientation.

## Interaction

- Near field: direct touch. Far field: ray or gaze + pinch, with a visible endpoint, hover highlight, and confirmation.
- Gaze alone is not selection. Gaze + explicit confirm. Dwell must be configurable and cancellable.
- Three feedback moments: hover (visual), commit (audio/haptic), result (state).
- Input parity: hands and controllers both reach every action.
- Text entry: system keyboard or dictation; custom 3D keyboards are a last resort.
- No hidden gestures.

## Comfort (non-negotiable)

- Camera motion only with user intent. No head bob, roll, acceleration, or snap stop.
- Default: teleport + snap turn (30–45°). Smooth locomotion is an option.
- If smooth locomotion exists: vignette, speed cap, stable horizon, seated mode.
- Recenter on one gesture, always available. Height calibration on first run.
- Seated mode is first-class.
- Long sessions: break prompt around 20 minutes, easy path to passthrough.

## Color and passthrough

- Opaque content surfaces. Glass belongs to chrome.
- Never body text directly on passthrough. Use a panel at ≥90% opacity or a solid text plate.
- Contrast 4.5:1 body, 3:1 large text, against the worst background the panel can sit on.
- No pure white on bright passthrough, no pure black on dark.
- Color is never the only signal.
- Bloom is not hierarchy.

## Frame budget

| Hz | Budget |
|---|---|
| 72 | 13.9 ms |
| 90 | 11.1 ms |
| 120 | 8.3 ms |

No per-frame allocation, no `GetComponent`/`find` in the loop, bake lighting, no real-time shadows on UI, cap material variants, instance repeated panels, enable foveated rendering and late-latching. A frame drop is a comfort bug.

## Tells

- Head-locked HUD or menu [`xr.headlocked-hud`]
- Text below 1°, gaze targets below 2° [`xr.small-gaze-target`]
- Glass on every surface [`xr.glass-everywhere`], bloom everywhere [`xr.bloom-glow`]
- Inconsistent panel depth or scale [`xr.depth-mismatch`]
- Forced smooth locomotion [`xr.forced-locomotion`], no comfort layer [`xr.no-comfort`]
- Ray only, no direct touch or controller parity [`xr.raycast-only`]
- No recenter or height calibration [`xr.no-recenter`]
- White text on passthrough [`xr.passthrough-contrast`]
- A 2D web page floating in space [`xr.flat-web-panel`]
- No captions or text alternatives [`xr.no-captions`]
- Silent interaction [`xr.no-feedback`]
- Realistic hands or avatars [`xr.uncanny-avatar`]
- Frames below target [`perf.frame-budget`]

## Review protocol

1. Run on the device.
2. Read at 0.5 m, 1.5 m, 3 m.
3. Seated and standing; hands and controllers.
4. Use continuously 15–30 minutes; note nausea, eye strain, neck strain.
5. Measure frame time with the platform overlay.
6. Check contrast in bright and dark passthrough.
7. Test largest text, VoiceOver/Dwell, one-handed use.
8. Say what was not tested. "Not profiled" applies here too.

A screenshot is never a pass in spatial.
