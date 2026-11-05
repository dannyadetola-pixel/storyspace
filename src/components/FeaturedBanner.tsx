"use client";

import { useRef } from "react";
import Link from "next/link";
import { toProxyUrl } from "@/lib/media";

export type FeaturedSlide = {
  id: string;
  title: string;
  byline: string;
  description: string | null;
  coverUrl: string | null;
  href?: string; // where the slide goes; defaults to the book page
  sponsored?: boolean; // shows the "Advertisement" label
};

// Wide banner at the top of the homepage. Book slides and sponsored slides
// share the same strip, so the arrows move through both.
export default function FeaturedBanner({ slides }: { slides: FeaturedSlide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative">
      <div
        ref={trackRef}
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
                <p className="text-sm text-white/80">{slide.byline}</p>
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
        onClick={() => move(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-app-text shadow-md"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-app-text shadow-md"
      >
        ›
      </button>
    </section>
  );
}
