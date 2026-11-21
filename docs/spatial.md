# Spatial design: VR, MR, XR

Two-dimensional habits do not survive the move to three dimensions. A layout that looks clean in a screenshot can cause nausea in a headset, and a button that looks big enough on a monitor can be unaimable at two meters.

This reference covers visionOS, Meta Quest, PCVR, and WebXR. Platform HIG values win when they are stricter.

## 1. Measure in angles, not pixels

A pixel has no physical size in a headset. What the user experiences is the visual angle a thing subtends.

| Element | Minimum | Notes |
|---|---|---|
| Body text | 1.2° vertical | 1° is the hard floor; 1.2–1.5° reads comfortably |
| Headline | 2° | Hierarchy comes from angle, not from px |
| Gaze target | 2° | 3° for primary actions |
| Direct-touch target | 2.5° at arm's length | Roughly a fingertip with margin |
| Line length | 60–80 characters | Longer lines force head movement |

At 1.5 m, 1° is about 2.6 cm. A 26 px type size at that distance is roughly 1°, which is why "it looks fine on the monitor" is not evidence.

Corollaries:

- Text inside a panel scales with distance. A panel at 0.5 m and the same panel at 3 m need different type sizes if they must read equally.
- Depth is not decoration. Moving a panel closer makes it more important and more tiring.
- Thin and light font weights disappear at distance and with motion. Use regular or medium.

## 2. Depth planes

| Plane | Distance | Content | Constraint |
|---|---|---|---|
| Near | 0.35–0.6 m | Direct manipulation, hand menu, grab | Only within arm's reach |
| Mid | 1–2 m | Panels, lists, forms, media | Default working plane |
| Far | 3–10 m | Context, scene, large visuals | No readable body text |

Rules:

- One plane per task. Mixing planes inside one task forces repeated accommodation.
- Large panels go farther; small controls come closer.
- Never place a control at a distance where its angular size falls below 2°.
- Keep a stable world reference (floor, desk, window). Fully floating UI causes disorientation.

## 3. Interaction

- **Near field:** direct touch (poke, pinch, grab). Targets sized for a fingertip, not a cursor.
- **Far field:** ray or gaze plus pinch. The ray needs a visible endpoint, a hover highlight on the target, and a confirmation (sound, haptic, state change).
- **Gaze alone is not selection.** Gaze plus an explicit confirm. Dwell, if offered, must be configurable and cancellable.
- **Three feedback moments:** hover (visual), commit (audio/haptic), result (state). A silent button reads as broken.
- **Input parity:** hand tracking and controller both reach every action. A feature that requires one input does not exist for users with the other.
- **Text entry:** system keyboard or dictation; custom 3D keyboards are a last resort.
- **No hidden gestures.** A gesture that is not discoverable is not an interaction.

## 4. Comfort

Non-negotiable:

- Camera motion only with user intent. No head bob, no roll, no acceleration, no snap stop.
- Default locomotion is teleport plus snap turn (30–45°). Smooth locomotion is an option, never the default.
- If smooth locomotion exists: vignette, speed cap, stable horizon, seated mode.
- Recenter on one gesture, available at all times. Height calibration on first run.
- Seated mode is a first-class option, not an accessibility afterthought.
- Long sessions: offer a break prompt around 20 minutes, and an easy path to passthrough.
- Avoid virtual mirrors, forced camera cuts, and scripted head movement.

## 5. Typography and color

- Opaque content surfaces. Glass belongs to chrome, not to text.
- Passthrough is a moving, bright, high-frequency background. Never put body text directly on it. Use a panel at ≥90% opacity, or a solid text plate.
- Contrast: 4.5:1 for body, 3:1 for large text, measured against the worst background the panel can sit on.
- Avoid pure white on bright passthrough, and pure black on dark passthrough.
- Color is never the only signal. Status needs a label, a shape, or a position.
- Bloom is not hierarchy. If everything glows, nothing does.

## 6. Performance budget

| Refresh | Frame budget | Notes |
|---|---|---|
| 72 Hz | 13.9 ms | Quest baseline; never miss it |
| 90 Hz | 11.1 ms | Standard target |
| 120 Hz | 8.3 ms | Upper tier; comfort, not marketing |

- No per-frame allocation.
- No `GetComponent`, `find`, or LINQ in the frame loop.
- Bake lighting; no real-time shadows on UI.
- Cap material variants; instance repeated panels.
- Enable foveated rendering where available, and late-latching if the runtime supports it.
- Stereo doubles the draw cost. Budget for it from the start.
- A frame drop is a comfort bug, not a polish item.

## 7. Platform notes

**visionOS**

- Windows, volumes, and immersive spaces are different containers; pick one per task.
- Ornaments attach actions to a window without stealing content space.
- Hover effects are the primary affordance; if you suppress them, replace them with something as clear.
- Glass background effects are for chrome and controls; content sits on opaque material.
- Respect the system's focus and accessibility features (VoiceOver, Dwell, Switch Control, Zoom).
- Use points and the platform's text styles; let the system handle scale.

**Meta Quest / PCVR**

- Comfort settings belong in the first-run flow and in a persistent menu.
- Hand tracking is not a substitute for controllers; support both.
- Guardian and boundary are part of the experience; never hide them.
- Passthrough has different exposure and color than the render; check text in both.
- Use the platform's UI set for system dialogs and keyboards.

**WebXR**

- Input is whatever the browser gives you: controllers, hands, mouse, touch. Design for the union.
- Session start requires a user gesture; do not auto-enter immersive mode.
- Frame budget is shared with the browser; test on the target headset's browser, not on desktop emulation.
- Provide a non-XR fallback for every flow.

## 8. Anti-patterns

| Pattern | Rule | Why it fails | Fix |
|---|---|---|---|
| Head-locked HUD or menu | `xr.headlocked-hud` | Moves with the head, destroys world reference, causes nausea | Body- or world-lock; recenter |
| Text below 1° | `xr.small-gaze-target` | Unreadable at distance, worse in motion | Increase angle or move closer |
| Glass on every surface | `xr.glass-everywhere` | Text competes with passthrough, contrast collapses | Opaque content surfaces |
| Bloom everywhere | `xr.bloom-glow` | No hierarchy; eye goes to the brightest thing | Emissive only for state |
| Random panel depths | `xr.depth-mismatch` | Repeated accommodation, no spatial logic | Three planes, one per task |
| Forced smooth locomotion | `xr.forced-locomotion` | Motion sickness on first run | Teleport default, smooth optional |
| No vignette / speed cap | `xr.no-comfort` | Nausea in seconds | Comfort layer, seated mode |
| Ray only | `xr.raycast-only` | Unusable at arm's length, no parity | Direct touch plus ray |
| No recenter | `xr.no-recenter` | User is stuck at the wrong height or angle | One-gesture recenter |
| White text on passthrough | `xr.passthrough-contrast` | Unreadable in bright rooms | Opaque plate |
| A web page in space | `xr.flat-web-panel` | 2D layout does not become spatial design | Rebuild for spatial hierarchy |
| No captions | `xr.no-captions` | Audio-only content is inaccessible | Captions and text alternatives |
| Silent interaction | `xr.no-feedback` | Reads as broken | Hover, sound, haptic, state |
| Realistic hands/avatars | `xr.uncanny-avatar` | Uncanny, distracting | Stylized or abstract representation |

## 9. Review protocol

A spatial review is never signed off from a screenshot.

1. Run on the device.
2. Read at 0.5 m, 1.5 m, and 3 m.
3. Seated and standing; hands and controllers.
4. Use continuously for 15–30 minutes; note nausea, eye strain, neck strain.
5. Measure frame time with the platform's overlay. A drop below target is a finding.
6. Check contrast in bright and dark passthrough.
7. Test the largest text size, VoiceOver/Dwell, and one-handed use.
8. State explicitly what was not tested. "Not profiled" applies to spatial too.
