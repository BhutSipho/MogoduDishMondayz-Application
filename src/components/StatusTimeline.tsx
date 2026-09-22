import { ORDER_STATUSES, type Order } from "@/lib/store";

const HINTS = [
  "We've got your order",
  "In the potjie",
  "Collect or out for delivery",
  "Order closed",
];

function time(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusTimeline({ order }: { order: Order }) {
  return (
    <ol className="relative space-y-5">
      <span
        className="absolute top-2 bottom-2 left-4 w-0.5 bg-border"
        aria-hidden="true"
      />
      {ORDER_STATUSES.map((status, index) => {
        const done = index <= order.statusIndex;
        const current = index === order.statusIndex;
        const at = order.history.find((entry) => entry.status === status)?.at;
        return (
          <li key={status} className="relative flex items-center gap-4">
            <span
              className={`z-10 grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                done
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-card text-muted-foreground"
              } ${current ? "ring-4 ring-primary/20" : ""}`}
            >
              {index + 1}
            </span>
            <span className={done ? "" : "text-muted-foreground"}>
              <span className="block font-semibold">{status}</span>
              <span className="block font-mono text-xs text-muted-foreground">
                {done ? `${time(at)} · ${HINTS[index]}` : HINTS[index]}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
