import { toProxyUrl } from "@/lib/media";

// WhatsApp-style avatar. With no uploaded picture it shows a grey circle with a
// white silhouette: one person for a user, two people for a group.
export default function Avatar({
  src,
  kind = "user",
  size = 44,
}: {
  src: string | null | undefined;
  kind?: "user" | "group";
  size?: number;
}) {
  const url = toProxyUrl(src);
  const box = { width: size, height: size };

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        style={box}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={box}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#D1D7DB] dark:bg-[#54656F]"
    >
      <svg viewBox="0 0 24 24" className="h-[72%] w-[72%] text-white" fill="currentColor">
        {kind === "group" ? (
          <>
            <circle cx="9" cy="8.5" r="3.2" />
            <path d="M3 19.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5z" />
            <circle cx="16.5" cy="9.5" r="2.6" />
            <path d="M14.2 14.3c.4-.1.8-.1 1.3-.1 2.7 0 4.5 1.8 4.5 4.3v.5h-4.6c0-1.7-.5-3.2-1.2-4.7z" />
          </>
        ) : (
          <>
            <circle cx="12" cy="8.5" r="4" />
            <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7z" />
          </>
        )}
      </svg>
    </span>
  );
}
