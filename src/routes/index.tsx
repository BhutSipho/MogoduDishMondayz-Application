import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import heroImage from "@/assets/hero-potjie.jpg";
import { MENU, SPECIALS, money } from "@/lib/mogodu-data";
import { useStore } from "@/lib/store";
import { MenuItemCard } from "@/components/MenuItemCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mogodu Monday — Tripe that hits different" },
      {
        name: "description",
        content:
          "Slow-cooked mogodu, triple-simmered in a cast-iron potjie. See this week's special, order ahead and track it to your door.",
      },
      { property: "og:title", content: "Mogodu Monday — Tripe that hits different" },
      {
        property: "og:description",
        content: "This Monday's special: Potjie Mogodu with pap and chakalaka, R85.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { addOne } = useStore();
  const special = SPECIALS[0];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:pb-14">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="animate-rise md:col-span-7">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1.5 font-mono text-xs text-primary">
              <span className="size-1.5 rounded-full bg-accent" /> TODAY&apos;S SPECIAL · MONDAY
            </p>
            <h1 className="font-display text-5xl leading-[0.92] text-balance sm:text-6xl md:text-7xl">
              Tripe that
              <br />
              hits <span className="text-primary">different.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg text-pretty text-muted-foreground">
              Slow-cooked mogodu, triple-simmered in a cast-iron potjie since 2019. Served
              hot on a township corner, delivered to your door.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View menu
              </Link>
              <Link
                to="/order"
                className="rounded-full border border-input px-6 py-3 font-semibold transition-colors hover:bg-foreground/5"
              >
                Order now
              </Link>
            </div>
          </div>

          <div className="relative md:col-span-5">
            <div className="relative">
              <img
                src={heroImage}
                alt="Steaming cast-iron potjie of mogodu on a Soweto street corner"
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full rounded-[28px] object-cover"
              />
              <div className="animate-rise absolute -bottom-8 -left-2 w-60 rounded-[22px] bg-card p-5 shadow-float sm:-left-6 md:-left-10 md:w-64">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wide text-primary uppercase">
                    Special
                  </span>
                  <span className="rounded-full bg-accent/25 px-2 py-0.5 font-mono text-xs font-medium text-primary">
                    {money(special.price)}
                  </span>
                </div>
                <div className="mt-2 font-display text-xl">{special.name}</div>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">
                  {special.note}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    addOne(special.itemId);
                    toast.success(`${special.name} added to your order`);
                  }}
                  className="mt-4 w-full rounded-full bg-foreground py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  Add to order
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl text-balance sm:text-4xl">The Menu</h2>
          <Link
            to="/specials"
            className="shrink-0 font-mono text-xs text-primary hover:underline"
          >
            SEE ALL SPECIALS →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MENU.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
