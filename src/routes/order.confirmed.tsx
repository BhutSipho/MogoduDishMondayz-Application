import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { money } from "@/lib/mogodu-data";
import { useStore } from "@/lib/store";

const searchSchema = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/order/confirmed")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Order confirmed — Mogodu Monday" },
      {
        name: "description",
        content: "Your mogodu order is with the kitchen. Keep your reference to track it.",
      },
      { property: "og:title", content: "Order confirmed — Mogodu Monday" },
      { property: "og:description", content: "Your order is in the potjie queue." },
    ],
  }),
  component: Confirmed,
});

function Confirmed() {
  const { ref } = Route.useSearch();
  const { findOrder, hydrated } = useStore();
  const order = ref ? findOrder(ref) : undefined;

  return (
    <section className="mx-auto max-w-2xl px-5 py-14">
      <div className="card-panel p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 font-display text-3xl">Order confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The kitchen has your order. Keep this reference to track it.
        </p>
        <p className="mt-5 inline-block rounded-full bg-accent/20 px-5 py-2 font-mono text-lg text-primary">
          {ref ?? "—"}
        </p>

        {!hydrated ? null : order ? (
          <ul className="mx-auto mt-6 max-w-sm divide-y divide-border text-left text-sm">
            {order.lines.map((line) => (
              <li key={line.id} className="flex justify-between py-2">
                <span>
                  {line.name} × {line.qty}
                </span>
                <span className="font-mono">{money(line.qty * line.price)}</span>
              </li>
            ))}
            <li className="flex justify-between py-2 font-semibold">
              <span>Total</span>
              <span className="font-mono">{money(order.total)}</span>
            </li>
            <li className="py-2 font-mono text-xs text-muted-foreground">
              {order.customer.collection === "Delivery"
                ? `DELIVERY · ${order.customer.address}`
                : "COLLECT · 14 KAT RIVER RD, SOWETO"}
            </li>
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            We couldn&apos;t find that order on this device.
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/track"
            search={{ ref: ref ?? "" }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Track this order
          </Link>
          <Link
            to="/menu"
            className="rounded-full border border-input px-6 py-3 text-sm font-semibold transition-colors hover:bg-foreground/5"
          >
            Order something else
          </Link>
        </div>
      </div>
    </section>
  );
}
