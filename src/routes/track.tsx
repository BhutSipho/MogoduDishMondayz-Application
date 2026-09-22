import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { money } from "@/lib/mogodu-data";
import { ORDER_STATUSES, useStore } from "@/lib/store";
import { StatusTimeline } from "@/components/StatusTimeline";

const searchSchema = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/track")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Track your order — Mogodu Monday" },
      {
        name: "description",
        content:
          "Enter your order reference to see whether your mogodu is received, preparing, ready or completed.",
      },
      { property: "og:title", content: "Track your order — Mogodu Monday" },
      {
        property: "og:description",
        content: "Four simple statuses from the potjie to your hands.",
      },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const { orders, findOrder, advanceOrder, hydrated } = useStore();
  const [input, setInput] = useState(ref ?? "");

  const active = ref ? findOrder(ref) : undefined;
  const notFound = Boolean(ref) && hydrated && !active;

  function lookup(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value) {
      toast.error("Enter your order reference, e.g. MM-2481");
      return;
    }
    navigate({ to: "/track", search: { ref: value } });
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl text-balance">Track your order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the reference from your confirmation, e.g. MM-2481.
      </p>

      <form onSubmit={lookup} className="mt-5 flex max-w-md flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Order reference"
          placeholder="MM-2481"
          className="min-w-0 flex-1 rounded-full border border-input bg-card px-5 py-3 font-mono text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Track
        </button>
      </form>

      {notFound ? (
        <p className="mt-4 text-sm font-medium text-destructive">
          No order found for “{ref}” on this device.
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {active ? (
          <div className="card-panel p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">
                {ORDER_STATUSES[active.statusIndex]}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">{active.ref}</span>
            </div>
            <StatusTimeline order={active} />

            <ul className="mt-6 divide-y divide-border border-t border-border pt-4 text-sm">
              {active.lines.map((line) => (
                <li key={line.id} className="flex justify-between py-2">
                  <span>
                    {line.name} × {line.qty}
                  </span>
                  <span className="font-mono">{money(line.qty * line.price)}</span>
                </li>
              ))}
              <li className="flex justify-between py-2 font-semibold">
                <span>Total</span>
                <span className="font-mono">{money(active.total)}</span>
              </li>
            </ul>

            {active.statusIndex < ORDER_STATUSES.length - 1 ? (
              <div className="mt-6 rounded-2xl bg-background p-4">
                <p className="font-mono text-[10px] text-muted-foreground">
                  KITCHEN VIEW (MVP) — NO STAFF LOGIN YET
                </p>
                <button
                  type="button"
                  onClick={() => {
                    advanceOrder(active.ref);
                    toast.success(
                      `${active.ref} moved to ${ORDER_STATUSES[active.statusIndex + 1]}`,
                    );
                  }}
                  className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  Move to {ORDER_STATUSES[active.statusIndex + 1]}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="card-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Your orders</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {orders.length} ON THIS DEVICE
            </span>
          </div>
          {!hydrated ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet.{" "}
              <Link to="/menu" className="font-semibold text-primary hover:underline">
                Start with the menu
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-2">
              {orders.map((order) => (
                <li key={order.ref}>
                  <Link
                    to="/track"
                    search={{ ref: order.ref }}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-background p-3 transition-colors hover:bg-accent/15"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-sm">{order.ref}</span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {new Date(order.placedAt).toLocaleString("en-ZA", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold">
                        {ORDER_STATUSES[order.statusIndex]}
                      </span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {money(order.total)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
