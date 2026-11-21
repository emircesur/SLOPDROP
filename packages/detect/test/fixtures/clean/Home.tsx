export function Home({ orders }: { orders: Order[] }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-semibold">Today's orders</h1>
      <ul className="mt-4 divide-y divide-neutral-200">
        {orders.map((order) => (
          <li key={order.id} className="flex items-center justify-between py-3">
            <span>{order.customer}</span>
            <span className="font-mono tabular-nums">{order.total}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-6 h-11 w-full rounded-sm bg-neutral-900 text-white"
      >
        Export today's orders
      </button>
    </main>
  );
}
