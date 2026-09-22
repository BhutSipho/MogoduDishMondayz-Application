import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

const LINKS = [
  { to: "/menu", label: "Menu" },
  { to: "/specials", label: "Specials" },
  { to: "/track", label: "Track" },
  { to: "/calendar", label: "Calendar" },
  { to: "/notifications", label: "Updates" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { unread } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg text-primary-foreground">
            M
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-base sm:text-lg">
              MOGODU MONDAY
            </span>
            <span className="block font-mono text-[10px] tracking-wide text-muted-foreground">
              TRIPLE COOKED · SOWETO
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary" }}
              >
                {link.label}
                {link.to === "/notifications" && unread > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 grid size-4 place-items-center rounded-full bg-accent font-mono text-[9px] text-accent-foreground">
                    {unread}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
          <Link
            to="/order"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Order now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-full border border-border lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-card px-5 py-3 lg:hidden">
          <ul className="grid gap-1 text-sm font-medium">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  activeProps={{ className: "text-primary bg-background" }}
                >
                  {link.label}
                  {link.to === "/notifications" && unread > 0 ? (
                    <span className="rounded-full bg-accent px-2 font-mono text-[10px] text-accent-foreground">
                      {unread} new
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
