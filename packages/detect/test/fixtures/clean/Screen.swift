import SwiftUI

struct OrdersView: View {
  @State private var orders: [Order] = []

  var body: some View {
    NavigationStack {
      List(orders) { order in
        LabeledContent(order.customer, value: order.total, format: .currency(code: "USD"))
      }
      .navigationTitle("Orders")
      .refreshable { await load() }
    }
  }
}
