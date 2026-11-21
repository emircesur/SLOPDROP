import SwiftUI

struct Screen: View {
  var body: some View {
    ZStack {
      Color.white.ignoresSafeArea()
      VStack {
        Text("Welcome").font(.system(size: 13))
        Image(systemName: "sparkles")
        Circle().frame(width: 8, height: 8)
        Text("🚀 Fast")
      }
      .background(.ultraThinMaterial)
      .background(.thinMaterial)
      .background(.regularMaterial)
    }
  }
}
