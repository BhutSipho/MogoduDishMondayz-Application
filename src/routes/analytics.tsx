import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, isSameMonth, subMonths } from "date-fns";
import { HISTORY, group, money } from "@/lib/mogodu-data";
import { ORDER_STATUSES, useStore } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Mogodu Monday" },
      {
        name: "description",
        content:
          "Six months of Mogodu Monday order volumes, revenue and average order value, plus live orders from this device.",
      },
      { property: "og:title", content: "Analytics — Mogodu Monday" },
      {
        property: "og:description",
        content: "A simple six-month view of orders, revenue and dish mix.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { orders, hydrated } = useStore();

  const months = useMemo(() => {
    const now = new Date();
    return HISTORY.map((entry) => {
      const date = subMonths(now, entry.monthsAgo);
      const live = orders.filter((order) => isSameMonth(new Date(order.placedAt), date));
      return {
        label: format(date, "MMM"),
        orders: entry.orders + live.length,
        revenue: entry.revenue + live.reduce((sum, order) => sum + order.total, 0),
        current: entry.monthsAgo === 0,
      };
    });
  }, [orders]);

  const totalOrders = months.reduce((sum, month) => sum + month.orders, 0);
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  const average = Math.round(totalRevenue / Math.max(totalOrders, 1));
  const peakRevenue = Math.max(...months.map((month) => month.revenue));

  const dishMix = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of orders) {
      for (const line of order.lines) {
        counts.set(line.name, (counts.get(line.name) ?? 0) + line.qty);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const statusCounts = ORDER_STATUSES.map((status, index) => ({
    status,
    count: orders.filter((order) => order.statusIndex === index).length,
  }));

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl text-balance">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trading performance for the last six months.
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          LAST 6 MONTHS
        </span>
      </div>

      <div className="card-panel mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <div className="font-mono text-xs text-muted-foreground">ORDERS</div>
            <div className="font-display text-3xl">{group(totalOrders)}</div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted-foreground">REVENUE</div>
            <div className="font-display text-3xl">{money(totalRevenue)}</div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted-foreground">AVG / ORDER</div>
            <div className="font-display text-3xl">{money(average)}</div>
          </div>
        </div>

        <div className="mt-8 flex h-44 items-stretch gap-2 sm:gap-3">
          {months.map((month, index) => (
            <div
              key={month.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {Math.round(month.revenue / 1000)}k
              </span>
              <div
                className={`animate-bar w-full rounded-t-md ${
                  month.current ? "bg-accent" : "bg-primary/80"
                }`}
                style={{
                  height: `${Math.max((month.revenue / peakRevenue) * 100, 6)}%`,
                  animationDelay: `${index * 0.05}s`,
                }}
                role="img"
                aria-label={`${month.label}: ${month.orders} orders, ${money(month.revenue)} revenue`}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {month.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card-panel p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl">Month by month</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="font-mono text-[10px] text-muted-foreground">
                <th className="pb-2 text-left">MONTH</th>
                <th className="pb-2 text-right">ORDERS</th>
                <th className="pb-2 text-right">REVENUE</th>
                <th className="pb-2 text-right">AVG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {months.map((month) => (
                <tr key={month.label}>
                  <td className="py-2 font-semibold">{month.label}</td>
                  <td className="py-2 text-right font-mono">{month.orders}</td>
                  <td className="py-2 text-right font-mono">{money(month.revenue)}</td>
                  <td className="py-2 text-right font-mono">
                    {money(Math.round(month.revenue / Math.max(month.orders, 1)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-panel p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl">Orders placed here</h2>
          {!hydrated ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders from this device yet — place one and it appears in these figures.
            </p>
          ) : (
            <>
              <ul className="space-y-2 text-sm">
                {statusCounts.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{entry.status}</span>
                    <span className="font-mono">{entry.count}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 mb-2 font-display text-lg">Dish mix</h3>
              <ul className="space-y-2 text-sm">
                {dishMix.map(([name, qty]) => (
                  <li key={name} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {name}
                    </span>
                    <span className="h-2 w-24 overflow-hidden rounded-full bg-background">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{
                          width: `${(qty / Math.max(...dishMix.map(([, q]) => q))) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="w-6 text-right font-mono">{qty}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-5 font-mono text-[10px] leading-relaxed text-muted-foreground">
            MVP: HISTORIC MONTHS ARE THE SHOP&apos;S RECORDED TRADING FIGURES. LIVE ORDERS ARE
            STORED ON THIS DEVICE.
          </p>
        </div>
      </div>
    </section>
  );
}
