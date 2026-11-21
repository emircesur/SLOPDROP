# Platform matrix

Every surface inherits the floor in [treatment.md](treatment.md). Each adds its own guarantees.

| Surface | Failure mode | Floor additions | Test |
|---|---|---|---|
| iOS / iPadOS | A website in a phone | 44pt targets, Dynamic Type, safe areas, edge-swipe back, tab bar for 2–5 places | Simulator: small iPhone, iPad Split View, dark, largest text |
| Android | An iPhone app in a Material costume | 48dp targets, `sp`, window insets, predictive back, nav bar or rail | Emulator: small phone, tablet/foldable, night mode, `font_scale 2.0` |
| Web app | A page that breaks the web | Real `<button>`/`<a>`, `:focus-visible`, working URLs and back, zoom on, labels | 375/768/1280/1920, dark, 200% zoom, Tab through |
| Website | Every hero is the same hero | Offer clear in seconds, real proof, action visible at 1280×800 | 1280×800, 375, reduced motion |
| visionOS | Head-locked glass panels, unreadable text | Gaze + pinch, hover feedback, opaque content, recenter, ornaments | Device, 30 min, largest text, VoiceOver |
| Quest / PCVR | Forced locomotion, missed frames | 72/90/120 Hz budget, teleport + snap turn, vignette, seated mode | Device, 15 min, performance overlay, hands + controllers |
| WebXR | A desktop page in a headset | Input union, frame budget, comfort options, non-XR fallback | Quest browser + desktop |
| Desktop | A web page pretending to be an app | Keyboard shortcuts, density, window sizes, multi-monitor | 1280×720 to 4K, keyboard only |
| TV | A phone UI scaled up | 10-foot type, focus ring, D-pad paths | 3 m away, remote only |
| Watch | A phone screen shrunk | One glanceable action | Wrist, sunlight |
| Voice | Assumes a screen | Spoken confirmation, undo, interruption tolerance | Hands-free, noisy room |

## Native building blocks

| Stack | Navigation | Lists / refresh | Sheets | Polish |
|---|---|---|---|---|
| SwiftUI | `NavigationStack`, `TabView` | `List`, `.swipeActions`, `.refreshable` | `.sheet`, `.presentationDetents` | SF Symbols, text styles, `ContentUnavailableView`, `.sensoryFeedback` |
| UIKit | `UINavigationController`, `UITabBarController` | `UICollectionView` list, `UIRefreshControl` | `UISheetPresentationController` | SF Symbols, `preferredFont(forTextStyle:)` |
| Compose | `Scaffold`, `TopAppBar`, `NavigationBar` | `LazyColumn` + `key`, `PullToRefreshBox` | `ModalBottomSheet` | `MaterialTheme.typography`, `WindowInsets.safeDrawing`, `imePadding()` |
| React Native / Expo | Native stack, native tabs | `FlatList` / FlashList, `RefreshControl` | Native modal | `Pressable`, safe-area-context, `KeyboardAvoidingView`, `expo-haptics` |
| Flutter | `NavigationBar`, platform routes | `ListView.builder`, `RefreshIndicator` | `showModalBottomSheet` | `textTheme`, `SafeArea`, `.adaptive` |
| Ionic / Capacitor | `ion-tabs`, `ion-nav` | `ion-list`, `ion-refresher`, virtual scroll | `ion-modal` | `mode`, safe-area insets, haptics |
| visionOS | `WindowGroup`, `NavigationStack` | `List`, `LazyVStack` | `.sheet`, volume | Glass for chrome, hover effect, spatial gestures |
| Unity / Quest | XR Interaction Toolkit | Object pool + virtualized list | Spatial panel | URP, XR haptics, `OVRInput` |
| WebXR | DOM overlay or 3D panel | Virtual list, fixed panel size | 3D dialog | `XRSession`, rAF, foveation |

## Stack-specific tells

**React Native / Expo**
- `TouchableOpacity` with the default fade and no other pressed state. Prefer `Pressable`.
- `Alert.alert` for every error, success, and confirmation.
- One root `SafeAreaView` that double-pads headers or leaves them under the notch.
- A JS tab bar or stack that recreates native navigation and loses the feel.
- Starter leftovers: default tint, `ParallaxScrollView`, `HelloWave`, `ThemedText` with no type scale.

**Flutter**
- Material widgets on iOS where `.adaptive` or Cupertino exists.
- `Colors.deepPurple` still the seed from `flutter create`.
- `WillPopScope` (deprecated, breaks predictive back); use `PopScope`.
- Fixed `TextScaler` to stop overflow instead of fixing the layout.

**Ionic / Capacitor**
- `mode="md"` on iOS or `mode="ios"` on Android without a brand reason.
- Desktop CSS on a phone: hover, wide max-widths, multi-column grids.
- Missing `viewport-fit=cover` and safe-area insets.

**Compose / SwiftUI**
- Previews full of invented data that ships as the real empty state.
- A `Card` or rounded background on every row instead of a list.

**Unity / Quest**
- One glass material on every panel; real-time shadows and bloom.
- `GetComponent` in the frame loop; separate material per text element.

## Web floor

- Actions are `<button>`, navigation is `<a href>`.
- Every interactive element has a visible `:focus-visible`.
- Zoom stays on. Inputs at 16px stop iOS zoom-on-focus.
- Every content image has alt text; decoration has `alt=""`.
- URLs mean something: back works, filters and tabs are shareable.
- Contrast 4.5:1 body, 3:1 large text and meaningful icons.
- Every animation has a `prefers-reduced-motion` fallback.
- No horizontal scroll at 375; content capped and centered at 1920.
- Forms: labels, correct `type` and `autocomplete`, errors beside the field in words, entered data kept.
- Nothing invented: no customer counts, logo walls, testimonials, or ratings the user did not supply.

## Two kinds of web page

- **App:** task path first, dense enough for daily use, quiet chrome, content carries the color. A landing hero inside an app is a tell.
- **Site:** the offer is clear in seconds, the action is visible, the proof is real. A dashboard's density inside a landing page is a tell.

Review one scope at a time. A product's marketing site and its app are different reviews.
