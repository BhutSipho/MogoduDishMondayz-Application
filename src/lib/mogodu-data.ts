import potjieMogodu from "@/assets/dish-potjie-mogodu.jpg";
import mogoduStew from "@/assets/dish-mogodu-stew.jpg";
import biltong from "@/assets/dish-biltong.jpg";
import mopaneCombo from "@/assets/dish-mopane-combo.jpg";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export const MENU: MenuItem[] = [
  {
    id: "potjie-mogodu",
    name: "Potjie Mogodu",
    price: 85,
    description: "Triple-cooked, pap & chakalaka",
    image: potjieMogodu,
  },
  {
    id: "mogodu-stew",
    name: "Mogodu Stew",
    price: 70,
    description: "Spring onion, tomato, pap",
    image: mogoduStew,
  },
  {
    id: "mogodu-biltong",
    name: "Mogodu Biltong",
    price: 120,
    description: "Cured & sliced, 200g",
    image: biltong,
  },
  {
    id: "mopane-combo",
    name: "Mopane Combo",
    price: 95,
    description: "Mopane worms & mogodu",
    image: mopaneCombo,
  },
];

export function menuItem(id: string) {
  return MENU.find((item) => item.id === id);
}

export interface Special {
  id: string;
  name: string;
  itemId: string;
  price: number;
  note: string;
}

/** Specials rotate across the Mondays of a month, starting with the first Monday. */
export const SPECIALS: Special[] = [
  {
    id: "potjie-special",
    name: "Potjie Mogodu",
    itemId: "potjie-mogodu",
    price: 85,
    note: "Triple-cooked tripe, pap & chakalaka",
  },
  {
    id: "stew-special",
    name: "Mogodu Stew",
    itemId: "mogodu-stew",
    price: 70,
    note: "Spring onion, tomato, extra pap free",
  },
  {
    id: "combo-special",
    name: "Mopane Combo",
    itemId: "mopane-combo",
    price: 95,
    note: "Mopane worms & mogodu on one plate",
  },
  {
    id: "biltong-special",
    name: "Mogodu Biltong",
    itemId: "mogodu-biltong",
    price: 120,
    note: "200g cured & sliced, R20 off",
  },
];

export const FEATURED_SPECIAL: Special = SPECIALS[0]!;

export function specialForMondayIndex(index: number): Special {
  return SPECIALS[index % SPECIALS.length]!;
}

/**
 * Trading history for completed months. The live analytics view combines this
 * with orders placed in this app so the six-month view is always populated.
 */
export const HISTORY: { monthsAgo: number; orders: number; revenue: number }[] = [
  { monthsAgo: 5, orders: 168, revenue: 13440 },
  { monthsAgo: 4, orders: 196, revenue: 16072 },
  { monthsAgo: 3, orders: 181, revenue: 14842 },
  { monthsAgo: 2, orders: 234, revenue: 19656 },
  { monthsAgo: 1, orders: 261, revenue: 22446 },
  { monthsAgo: 0, orders: 118, revenue: 10148 },
];

export const CURRENCY = "R";

export function money(amount: number) {
  return `${CURRENCY}${amount.toLocaleString("en-ZA")}`;
}
