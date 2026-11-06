import Link from "next/link";
import { toProxyUrl } from "@/lib/media";
import VerifiedBadge from "@/components/VerifiedBadge";

// Compact read count: 950, 2K, 1.2K, 3.4M. Trailing ".0" is dropped.
function formatCount(n: number): string {
  const trim = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return `${n}`;
}

// Portrait cover card for horizontal rows. The whole card is one link, so the
// byline is plain text here: a link inside a link is invalid HTML.
export default function BookCard({
  href,
  title,
  coverUrl,
  byline,
  isVerified = false,
  meta,
  reads,
}: {
  href: string;
  title: string;
  coverUrl: string | null;
  byline: string;
  isVerified?: boolean;
  meta: string;
  reads?: number;
}) {
  const cover = toProxyUrl(coverUrl);

  return (
    <Link
      href={href}
      className="group block w-36 shrink-0 snap-start sm:w-40 lg:w-44"
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-app-primary to-app-secondary shadow-sm">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center font-serif text-sm font-medium text-white">
            {title}
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-app-text dark:text-app-text-dark">
        {title}
      </p>
      <p className="flex items-center truncate text-xs text-app-text/60 dark:text-app-text-dark/60">
        <span className="truncate">{byline}</span>
        {isVerified && <VerifiedBadge />}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="max-w-full truncate rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-app-text/70 dark:bg-white/10 dark:text-app-text-dark/70">
          {meta}
        </span>
        {reads !== undefined && (
          <span className="shrink-0 text-xs text-app-text/50 dark:text-app-text-dark/50">
            {formatCount(reads)} reads
          </span>
        )}
      </div>
    </Link>
  );
}