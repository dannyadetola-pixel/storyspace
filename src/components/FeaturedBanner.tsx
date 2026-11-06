"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toProxyUrl } from "@/lib/media";
import VerifiedBadge from "@/components/VerifiedBadge";

export type FeaturedSlide = {
  id: string;
  title: string;
  byline: string;
  isVerified?: boolean;
  description: string | null;
  coverUrl: string | null;
  href?: string; // where the slide goes; defaults to the book page
  sponsored?: boolean; // shows the "Advertisement" label
};

const AUTO_MS = 6000;

// Wide banner at the top of the homepage. It moves on its own every few
// seconds, pauses while the cursor is over it, and the arrows and dots move
// it by hand. Book slides and sponsored slides share the same strip.
export default function FeaturedBanner({ slides }: { slides: FeaturedSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      const count = slides.length;
      if (!track || count === 0) return;
      const target = ((next % count) + count) % count;
      const child = track.children[target] as HTMLElement | undefined;
      if (child) {
        track.scrollTo({
          left: child.offsetLeft - track.offsetLeft,
          behavior: "smooth",
        });
      }
      setIndex(target);
    },
    [slides.length]
  );

  // Keeps the dots in step when the user swipes or scrolls by hand.
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, i) => {
      const left = (child as HTMLElement).offsetLeft - track.offsetLeft;
      const distance = Math.abs(left - track.scrollLeft);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    if (nearest !== index) setIndex(nearest);
  }

  // Moves on its own. It waits while the cursor is over the banner, and while
  // the tab is hidden, so nothing moves while nobody is looking.
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) goTo(index + 1);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [index, paused, slides.length, goTo]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {slides.map((slide) => {
          const cover = toProxyUrl(slide.coverUrl);
          return (
            <Link
              key={`${slide.sponsored ? "ad" : "book"}-${slide.id}`}
              href={slide.href ?? `/books/${slide.id}`}
              className="relative block h-64 w-[88%] shrink-0 snap-start overflow-hidden rounded-2xl bg-gradient-to-r from-app-primary to-app-secondary sm:h-72 lg:w-[80%]"
              style={
                cover
                  ? {
                      backgroundImage: `url('${cover}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                {slide.sponsored && (
                  <span className="mb-2 inline-block rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    Advertisement
                  </span>
                )}
                <h2 className="text-2xl font-semibold">{slide.title}</h2>
                <p className="flex items-center text-sm text-white/80">
                  {slide.byline}
                  {slide.isVerified && <VerifiedBadge />}
                </p>
                {slide.description && (
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80">
                    {slide.description}
                  </p>
                )}
                <span className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-app-text">
                  {slide.sponsored ? "Learn more" : "Read now"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-app-text shadow-md"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-app-text shadow-md"
      >
        ›
      </button>

      <div className="mt-3 flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={`dot-${slide.id}-${i}`}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-app-primary dark:bg-app-primary-dark"
                : "w-2 bg-black/20 dark:bg-white/25"
            }`}
          />
        ))}
      </div>
    </section>
  );
}