import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SPECIALS, menuItem, money } from "@/lib/mogodu-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/specials")({
  head: () => ({
    meta: [
      { title: "Monday Specials — Mogodu Monday" },
      {
        name: "description",
        content:
          "A different mogodu special every Monday of the month, from potjie mogodu to the mopane combo.",
      },
      { property: "og:title", content: "Monday Specials — Mogodu Monday" },
      {
        property: "og:description",
        content: "This month's Monday rotation of mogodu specials and prices.",
      },
    ],
  }),
  component: SpecialsPage,
});

function SpecialsPage() {
  const { addOne } = useStore();
  const featured = SPECIALS[0];
  const featuredImage = menuItem(featured.itemId)?.image;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl text-balance">Monday Specials</h1>
      <p className="mt-1 max-w-[52ch] text-sm text-muted-foreground">
        One special per Monday, rotating through the month. First pot on at 11:00.
      </p>

      <div className="card-panel mt-6 grid gap-6 overflow-hidden p-5 md:grid-cols-2 md:p-6">
        {featuredImage ? (
          <img
            src={featuredImage}
            alt={featured.name}
            loading="lazy"
            width={816}
            height={816}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        ) : null}
        <div className="flex flex-col justify-center">
          <span className="font-mono text-[10px] tracking-wide text-primary uppercase">
            This Monday
          </span>
          <h2 className="mt-2 font-display text-3xl">{featured.name}</h2>
          <p className="mt-2 text-muted-foreground">{featured.note}</p>
          <div className="mt-4 font-display text-4xl text-primary">
            {money(featured.price)}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                addOne(featured.itemId);
                toast.success(`${featured.name} added to your order`);
              }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Add to order
            </button>
            <Link
              to="/calendar"
              className="rounded-full border border-input px-6 py-3 text-sm font-semibold transition-colors hover:bg-foreground/5"
            >
              See the calendar
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-display text-2xl">The rest of the rotation</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIALS.slice(1).map((special, index) => (
          <div key={special.id} className="card-panel p-5">
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              Monday {index + 2}
            </span>
            <h3 className="mt-1 font-display text-xl">{special.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{special.note}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-sm font-medium">{money(special.price)}</span>
              <button
                type="button"
                onClick={() => {
                  addOne(special.itemId);
                  toast.success(`${special.name} added to your order`);
                }}
                className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
