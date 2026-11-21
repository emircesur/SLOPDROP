# Performance

Bugs, lag, and crashes together are the biggest complaint group in low-rated reviews: about a third on the App Store and two fifths on Google Play, more than everything a design pass can fix. A design review cannot measure them. So this file does two things: lists what code can show, and makes sure the report never implies a clean bill of health it did not earn.

## The rule

Performance is never scored from code alone. Every report carries a Performance line:

- `Not profiled.` plus static leads, when you only read code. This is the default.
- `Profiled on <device or emulator>, <build type>, with <tool>:` plus numbers, when you measured.

Simulators and debug builds are not evidence of speed. Say which produced the number.

## What code can show

Report these as "suspected" under Noticeable, never as measured problems.

**Lists**
- Items mapped inside a plain scroll container instead of a virtualized list [`perf.unvirtualized-list`]
- React Native `FlatList` without `keyExtractor`, inline `renderItem` recreated every render, missing `getItemLayout` on fixed rows
- SwiftUI `List`/`ForEach` over a collection without stable identity (`id: \.self` on mutable values)
- Compose `LazyColumn` items without `key`, unstable lambdas causing whole-list recomposition
- Flutter `ListView(children:)` with many children instead of `ListView.builder`

**Main thread**
- JSON parsing, sorting, filtering, or image processing in a render, `body`, composable, or `build`
- Synchronous storage reads in a loop (`AsyncStorage`, large `UserDefaults` blobs, `SharedPreferences.commit` on main)
- Network or database calls started from view construction instead of a task or effect

**Images**
- Full-size remote images as thumbnails with no resizing or caching already in the project
- Large PNGs bundled where an asset catalog or vector would do

**Startup**
- Every SDK initialized before the first frame
- Fonts, remote config, and analytics blocking the first screen

**Web**
- `<img>` without width/height or aspect ratio, so the page jumps
- Hero images not preloaded, or every image eager
- Web fonts blocking text with no `font-display`, or four families where one would do
- Client components and large libraries shipped for content that could render on the server
- Layout read and written in the same frame inside scroll handlers

**Animation**
- JS-driven animation where the native driver or Reanimated is available
- Layout animations on every list row

## Profiling per stack

Only when the user wants it and the app can run. Release or profile builds on a physical device where possible.

| Stack | Tool | Read |
|---|---|---|
| SwiftUI, UIKit | Instruments: Time Profiler, Hangs, SwiftUI template | Hangs over 250 ms, view body counts, main-thread time in scroll |
| Compose, Views | Android Studio Profiler, Macrobenchmark, `dumpsys gfxinfo` | Janky frames, startup, recomposition counts |
| React Native, Expo | Perf Monitor, React DevTools profiler, Flashlight | JS/UI FPS while scrolling, commit durations |
| Flutter | DevTools Performance, profile mode | Build and raster times over 16 ms, shader jank |
| Ionic, Capacitor | Safari Web Inspector / Chrome DevTools on the device WebView | Long tasks, layout shifts, scroll FPS |
| Web | Lighthouse production build, DevTools Performance with CPU throttling, CrUX field data | LCP, INP, CLS, long tasks over 50 ms, per-route bundle |
| Spatial | Platform overlay, GPU capture | Frame time vs 13.9/11.1/8.3 ms, draw calls, overdraw |

## What to write

Under Noticeable, for each lead: file and line, what is suspected, and the fix. Under Not checked, always: "Performance not profiled" unless you did. If the user asked about performance and you could not profile, say so in the verdict instead of burying it.
