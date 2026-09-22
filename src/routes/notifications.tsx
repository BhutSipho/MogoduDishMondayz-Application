import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Updates — Mogodu Monday" },
      {
        name: "description",
        content: "Order status changes and Monday special announcements in one place.",
      },
      { property: "og:title", content: "Updates — Mogodu Monday" },
      {
        property: "og:description",
        content: "In-app updates for your orders and this week's specials.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notes, unread, markAllRead, hydrated } = useStore();

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl text-balance">Updates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order progress and specials, kept in this app.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0}
          className="shrink-0 rounded-full border border-input px-4 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5 disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="card-panel mt-6 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Inbox</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {unread} NEW
          </span>
        </div>
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-start gap-3 rounded-2xl bg-background p-3"
              >
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    note.read ? "bg-foreground/25" : "bg-accent"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{note.title}</span>
                  <span className="block text-sm text-muted-foreground">{note.body}</span>
                  <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.at), { addSuffix: true })} ·{" "}
                    {note.kind === "order" ? "ORDER" : "SPECIAL"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 font-mono text-[10px] leading-relaxed text-muted-foreground">
          MVP: IN-APP UPDATES ONLY. SMS AND PUSH NOTIFICATIONS WOULD NEED AN EXTERNAL
          PROVIDER.
        </p>
      </div>
    </section>
  );
}
