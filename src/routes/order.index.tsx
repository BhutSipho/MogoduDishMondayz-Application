import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MENU, money } from "@/lib/mogodu-data";
import { useStore, type Customer } from "@/lib/store";

export const Route = createFileRoute("/order/")({
  head: () => ({
    meta: [
      { title: "Place an order — Mogodu Monday" },
      {
        name: "description",
        content:
          "Check your order summary, add your contact details and send your mogodu order to the kitchen.",
      },
      { property: "og:title", content: "Place an order — Mogodu Monday" },
      {
        property: "og:description",
        content: "Collect in Soweto or take delivery within 8km. Pay on collection or delivery.",
      },
    ],
  }),
  component: OrderPage,
});

type Errors = Partial<Record<"name" | "phone" | "address" | "cart", string>>;

function OrderPage() {
  const navigate = useNavigate();
  const { cartLines, cartTotal, cartCount, addOne, removeOne, setQty, placeOrder, hydrated } =
    useStore();

  const [form, setForm] = useState<Customer>({
    name: "",
    phone: "",
    collection: "Collect",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const next: Errors = {};
    if (cartCount === 0) next.cart = "Add at least one dish before ordering.";
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, "")))
      next.phone = "Enter a 10-digit SA mobile number, e.g. 0821234567.";
    if (form.collection === "Delivery" && form.address.trim().length < 6)
      next.address = "Enter the delivery address.";
    return next;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const order = placeOrder(form);
    toast.success(`Order ${order.ref} sent to the kitchen`);
    navigate({ to: "/order/confirmed", search: { ref: order.ref } });
  }

  const deliveryFee = form.collection === "Delivery" && cartTotal > 0 ? 25 : 0;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl text-balance">Your order</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Check the summary, then leave your details. Payment happens on collection or delivery.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* SUMMARY */}
        <div className="card-panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Order summary</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {cartCount} ITEM{cartCount === 1 ? "" : "S"}
            </span>
          </div>

          {!hydrated ? (
            <p className="text-sm text-muted-foreground">Loading your order…</p>
          ) : cartLines.length === 0 ? (
            <div className="rounded-2xl bg-background p-5 text-sm text-muted-foreground">
              Your order is empty.{" "}
              <Link to="/menu" className="font-semibold text-primary hover:underline">
                Browse the menu
              </Link>{" "}
              to add a dish.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cartLines.map((line) => (
                <li key={line.id} className="flex items-center gap-3 py-3">
                  <img
                    src={MENU.find((item) => item.id === line.id)?.image}
                    alt={line.name}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{line.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {money(line.price)} each
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Remove one ${line.name}`}
                      onClick={() => removeOne(line.id)}
                      className="grid size-8 place-items-center rounded-full border border-input text-lg leading-none hover:bg-foreground/5"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-mono text-sm">{line.qty}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${line.name}`}
                      onClick={() => addOne(line.id)}
                      className="grid size-8 place-items-center rounded-full bg-primary text-lg leading-none text-primary-foreground hover:bg-primary/90"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, 0)}
                      className="ml-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
                    >
                      REMOVE
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono">{money(cartTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {form.collection === "Delivery" ? "Delivery (within 8km)" : "Collection"}
              </dt>
              <dd className="font-mono">{deliveryFee ? money(deliveryFee) : "Free"}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl">{money(cartTotal + deliveryFee)}</dd>
            </div>
          </dl>
          {errors.cart ? (
            <p className="mt-3 text-sm font-medium text-destructive">{errors.cart}</p>
          ) : null}
        </div>

        {/* FORM */}
        <form onSubmit={submit} noValidate className="card-panel p-5 sm:p-6">
          <h2 className="mb-4 font-display text-2xl">Your details</h2>

          <label className="block text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Thandi Mokoena"
            autoComplete="name"
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          ) : null}

          <label className="mt-4 block text-sm font-medium" htmlFor="phone">
            Mobile number
          </label>
          <input
            id="phone"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="0821234567"
            autoComplete="tel"
          />
          {errors.phone ? (
            <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
          ) : null}

          <fieldset className="mt-4">
            <legend className="text-sm font-medium">How will you get it?</legend>
            <div className="mt-2 flex gap-2">
              {(["Collect", "Delivery"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm({ ...form, collection: option })}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                    form.collection === option
                      ? "bg-primary text-primary-foreground"
                      : "border border-input hover:bg-foreground/5"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          {form.collection === "Delivery" ? (
            <>
              <label className="mt-4 block text-sm font-medium" htmlFor="address">
                Delivery address
              </label>
              <input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="123 Vilakazi St, Orlando West"
                autoComplete="street-address"
              />
              {errors.address ? (
                <p className="mt-1 text-xs text-destructive">{errors.address}</p>
              ) : null}
            </>
          ) : null}

          <label className="mt-4 block text-sm font-medium" htmlFor="notes">
            Notes for the kitchen (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="mt-1 w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Extra chakalaka, no chilli"
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Place order · {money(cartTotal + deliveryFee)}
          </button>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
            MVP: NO ONLINE PAYMENT. YOU PAY CASH OR CARD ON COLLECTION / DELIVERY.
          </p>
        </form>
      </div>
    </section>
  );
}
