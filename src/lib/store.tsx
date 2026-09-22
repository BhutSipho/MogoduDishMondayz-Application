import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MENU, menuItem, money } from "@/lib/mogodu-data";

export const ORDER_STATUSES = [
  "Order Received",
  "Preparing",
  "Ready",
  "Completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Customer {
  name: string;
  phone: string;
  collection: "Collect" | "Delivery";
  address: string;
  notes: string;
}

export interface Order {
  ref: string;
  lines: OrderLine[];
  total: number;
  customer: Customer;
  placedAt: string;
  statusIndex: number;
  history: { status: OrderStatus; at: string }[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "order" | "special";
}

type Cart = Record<string, number>;

interface Persisted {
  cart: Cart;
  orders: Order[];
  notes: Note[];
}

const STORAGE_KEY = "mogodu-monday-v1";

const SEED_NOTES: Note[] = [
  {
    id: "seed-special",
    title: "This Monday: Potjie Mogodu R85",
    body: "Triple-cooked tripe, pap & chakalaka. Available from 11:00 while the pot lasts.",
    at: new Date().toISOString(),
    read: false,
    kind: "special",
  },
  {
    id: "seed-hours",
    title: "Kitchen opens 11:00, Mon–Sat",
    body: "Order ahead and collect at 14 Kat River Rd, or take delivery within 8km.",
    at: new Date(Date.now() - 3600_000).toISOString(),
    read: false,
    kind: "special",
  },
];

interface StoreValue {
  hydrated: boolean;
  cart: Cart;
  cartLines: OrderLine[];
  cartCount: number;
  cartTotal: number;
  setQty: (id: string, qty: number) => void;
  addOne: (id: string) => void;
  removeOne: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (customer: Customer) => Order;
  advanceOrder: (ref: string) => void;
  findOrder: (ref: string) => Order | undefined;
  notes: Note[];
  unread: number;
  markAllRead: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function nextRef(orders: Order[]) {
  const n = 2480 + orders.length + 1;
  return `MM-${n}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<Cart>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.notes?.length) setNotes(parsed.notes);
      }
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, orders, notes }));
    } catch {
      /* storage may be unavailable */
    }
  }, [hydrated, cart, orders, notes]);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 99);
      return next;
    });
  }, []);

  const addOne = useCallback((id: string) => {
    setCart((prev) => ({ ...prev, [id]: Math.min((prev[id] ?? 0) + 1, 99) }));
  }, []);

  const removeOne = useCallback((id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] ?? 0) - 1;
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const cartLines = useMemo<OrderLine[]>(
    () =>
      MENU.filter((item) => (cart[item.id] ?? 0) > 0).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: cart[item.id],
      })),
    [cart],
  );

  const cartCount = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = cartLines.reduce((sum, line) => sum + line.qty * line.price, 0);

  const pushNote = useCallback((note: Omit<Note, "id" | "at" | "read">) => {
    setNotes((prev) => [
      { ...note, id: crypto.randomUUID(), at: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const placeOrder = useCallback(
    (customer: Customer) => {
      const now = new Date().toISOString();
      const order: Order = {
        ref: nextRef(orders),
        lines: cartLines,
        total: cartTotal,
        customer,
        placedAt: now,
        statusIndex: 0,
        history: [{ status: "Order Received", at: now }],
      };
      setOrders((prev) => [order, ...prev]);
      pushNote({
        kind: "order",
        title: `Order ${order.ref} received`,
        body: `${cartCount} item${cartCount === 1 ? "" : "s"} · ${money(cartTotal)}. We'll update you as it cooks.`,
      });
      setCart({});
      return order;
    },
    [cartLines, cartTotal, cartCount, pushNote],
  );

  const advanceOrder = useCallback(
    (ref: string) => {
      let message: { title: string; body: string } | null = null;
      setOrders((prev) =>
        prev.map((order) => {
          if (order.ref !== ref) return order;
          const nextIndex = Math.min(order.statusIndex + 1, ORDER_STATUSES.length - 1);
          if (nextIndex === order.statusIndex) return order;
          const status = ORDER_STATUSES[nextIndex];
          const at = new Date().toISOString();
          message = {
            title: `Order ${order.ref}: ${status}`,
            body:
              status === "Preparing"
                ? "In the potjie now — about 15 minutes."
                : status === "Ready"
                  ? "Ready for collection or on its way to you."
                  : "Enjoyed it? See you next Monday.",
          };
          return {
            ...order,
            statusIndex: nextIndex,
            history: [...order.history, { status, at }],
          };
        }),
      );
      if (message) pushNote({ kind: "order", ...message });
    },
    [pushNote],
  );

  const findOrder = useCallback(
    (ref: string) =>
      orders.find((order) => order.ref.toLowerCase() === ref.trim().toLowerCase()),
    [orders],
  );

  const markAllRead = useCallback(() => {
    setNotes((prev) => prev.map((note) => ({ ...note, read: true })));
  }, []);

  const value: StoreValue = {
    hydrated,
    cart,
    cartLines,
    cartCount,
    cartTotal,
    setQty,
    addOne,
    removeOne,
    clearCart,
    orders,
    placeOrder,
    advanceOrder,
    findOrder,
    notes,
    unread: notes.filter((note) => !note.read).length,
    markAllRead,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export { menuItem };
