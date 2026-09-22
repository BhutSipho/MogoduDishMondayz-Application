import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { money, specialForMondayIndex } from "@/lib/mogodu-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Mogodu Monday" },
      {
        name: "description",
        content:
          "Every Monday of the month has its own mogodu special. Tap a date to see what's in the pot.",
      },
      { property: "og:title", content: "Calendar — Mogodu Monday" },
      {
        property: "og:description",
        content: "Which special is cooking on which Monday, month by month.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { addOne } = useStore();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);

  const { cells, mondayIndexes } = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    // Monday-first grid: getDay() 1 = Monday
    const lead = (start.getDay() + 6) % 7;
    const indexes = new Map<string, number>();
    let count = 0;
    for (const day of days) {
      if (day.getDay() === 1) {
        indexes.set(day.toDateString(), count);
        count += 1;
      }
    }
    return {
      cells: [...Array(lead).fill(null), ...days] as (Date | null)[],
      mondayIndexes: indexes,
    };
  }, [month]);

  const today = new Date();
  const selectedSpecial =
    selected && selected.getDay() === 1
      ? specialForMondayIndex(mondayIndexes.get(selected.toDateString()) ?? 0)
      : null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl text-balance">Calendar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mondays are special days. Tap one to see what&apos;s in the pot.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card-panel p-5 sm:p-6">
          <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 truncate font-display text-2xl">
              {format(month, "MMMM yyyy")}
            </h2>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setMonth(subMonths(month, 1))}
                className="grid size-9 place-items-center rounded-full border border-input hover:bg-foreground/5"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setMonth(addMonths(month, 1))}
                className="grid size-9 place-items-center rounded-full border border-input hover:bg-foreground/5"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-muted-foreground">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <div key={`${day}-${i}`}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {cells.map((day, index) => {
              if (!day) return <div key={`pad-${index}`} />;
              const isMonday = day.getDay() === 1;
              const isSelected = selected ? isSameDay(day, selected) : false;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(day)}
                  aria-label={format(day, "d MMMM yyyy")}
                  aria-pressed={isSelected}
                  className={`rounded-lg py-2.5 transition-colors ${
                    isMonday
                      ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-foreground/5"
                  } ${isSelected ? "ring-2 ring-accent" : ""} ${
                    isSameDay(day, today) && !isMonday ? "font-semibold text-primary" : ""
                  } ${isSameMonth(day, month) ? "" : "text-muted-foreground"}`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
          <p className="mt-4 font-mono text-[10px] text-muted-foreground">
            MONDAYS = SPECIALS · KITCHEN OPEN MON–SAT 11:00–19:00
          </p>
        </div>

        <div className="card-panel p-5 sm:p-6">
          <h2 className="font-display text-2xl">
            {selected ? format(selected, "EEEE d MMMM") : "Pick a date"}
          </h2>
          {!selected ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Tap any day in the calendar to see what&apos;s cooking.
            </p>
          ) : selectedSpecial ? (
            <>
              <span className="mt-3 inline-block rounded-full bg-accent/20 px-3 py-1 font-mono text-[10px] tracking-wide text-primary uppercase">
                Monday special
              </span>
              <h3 className="mt-2 font-display text-3xl">{selectedSpecial.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{selectedSpecial.note}</p>
              <div className="mt-3 font-display text-3xl text-primary">
                {money(selectedSpecial.price)}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addOne(selectedSpecial.itemId);
                    toast.success(`${selectedSpecial.name} added to your order`);
                  }}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Add to order
                </button>
                <Link
                  to="/menu"
                  className="rounded-full border border-input px-6 py-3 text-sm font-semibold transition-colors hover:bg-foreground/5"
                >
                  See full menu
                </Link>
              </div>
            </>
          ) : selected.getDay() === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Closed on Sundays — the pots rest. Next special is on Monday.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Regular trading day: the full menu is available 11:00–19:00, no special.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
