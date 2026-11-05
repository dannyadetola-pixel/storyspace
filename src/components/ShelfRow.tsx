import type { ReactNode } from "react";

// One horizontal row: a small subtitle, a bold title, then a strip of cards
// that scrolls sideways. Children should be items sized with shrink-0 and
// snap-start, like BookCard.
export default function ShelfRow({
  kicker,
  title,
  children,
}: {
  kicker?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        {kicker && (
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
            {kicker}
          </p>
        )}
        <h2 className="text-xl font-semibold text-app-text dark:text-app-text-dark">
          {title}
        </h2>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
        {children}
      </div>
    </section>
  );
}
