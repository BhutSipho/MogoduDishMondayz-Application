import { createFileRoute, Link } from "@tanstack/react-router";
import { MENU, money } from "@/lib/mogodu-data";
import { MenuItemCard } from "@/components/MenuItemCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Mogodu Monday" },
      {
        name: "description",
        content:
          "Potjie mogodu, mogodu stew, mogodu biltong and the mopane combo. Pick your dishes and set quantities.",
      },
      { property: "og:title", content: "Menu — Mogodu Monday" },
      {
        property: "og:description",
        content: "Four house dishes, cooked fresh every trading day in Soweto.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { cartCount, cartTotal } = useStore();

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl text-balance">The Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the plus to build your order — the total follows you around.
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {MENU.length.toString().padStart(2, "0")} ITEMS
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MENU.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      <div className="card-panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground">YOUR ORDER</div>
          <div className="font-display text-2xl">
            {cartCount} item{cartCount === 1 ? "" : "s"} · {money(cartTotal)}
          </div>
        </div>
        <Link
          to="/order"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue to order
        </Link>
      </div>
    </section>
  );
}
