import type { MenuItem } from "@/lib/mogodu-data";
import { money } from "@/lib/mogodu-data";
import { useStore } from "@/lib/store";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { cart, addOne, removeOne } = useStore();
  const qty = cart[item.id] ?? 0;

  return (
    <div className="card-panel p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        width={816}
        height={816}
        className="mb-3 aspect-square w-full rounded-2xl object-cover"
      />
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-display text-lg">{item.name}</h3>
        <span className="shrink-0 font-mono text-sm font-medium">{money(item.price)}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => removeOne(item.id)}
            disabled={qty === 0}
            aria-label={`Remove one ${item.name}`}
            className="grid size-9 place-items-center rounded-full border border-input text-lg leading-none transition-colors hover:bg-foreground/5 disabled:opacity-40"
          >
            −
          </button>
          <span className="w-5 text-center font-mono text-sm" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => addOne(item.id)}
            aria-label={`Add one ${item.name}`}
            className="grid size-9 place-items-center rounded-full bg-primary text-lg leading-none text-primary-foreground transition-colors hover:bg-primary/90"
          >
            +
          </button>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {money(qty * item.price)}
        </span>
      </div>
    </div>
  );
}
