import Link from "next/link";

export type GridTile = {
  key: string;
  href: string;
  title: string;
  image: string | null;
};

// Mixed-size grid. Every seventh tile is a large 2x2 block, and dense packing
// fills the gaps those blocks leave, so the grid has rhythm rather than a
// uniform table.
export default function ExploreGrid({ tiles }: { tiles: GridTile[] }) {
  return (
    <div className="grid grid-flow-dense grid-cols-3 auto-rows-[7rem] gap-1 sm:auto-rows-[9rem] sm:gap-2">
      {tiles.map((tile, i) => {
        const large = i % 7 === 0;
        return (
          <Link
            key={tile.key}
            href={tile.href}
            className={`group relative overflow-hidden rounded-md bg-gradient-to-br from-app-primary to-app-secondary ${
              large ? "col-span-2 row-span-2" : ""
            }`}
          >
            {tile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tile.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center p-2 text-center font-serif text-xs text-white">
                {tile.title}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
