import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { money } from "@/lib/mogodu-data";

export function StickyOrderBar() {
  const { cartCount, cartTotal, hydrated } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!hydrated || cartCount === 0 || pathname === "/order") return null;

  return (
    <div className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-muted-foreground">
            {cartCount} ITEM{cartCount === 1 ? "" : "S"}
          </div>
          <div className="font-display text-xl">{money(cartTotal)}</div>
        </div>
        <Link
          to="/order"
          className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Review order
        </Link>
      </div>
    </div>
  );
}
