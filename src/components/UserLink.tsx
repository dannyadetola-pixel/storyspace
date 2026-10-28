import Link from "next/link";

// Renders a username as a link to that user's public profile, with the
// verified badge beside it. Don't wrap this inside another Link (e.g. a
// whole card that is itself a link) — nested links are invalid HTML and
// clicks behave unpredictably. Use a plain container for those cards.
export default function UserLink({
  username,
  isVerified = false,
  className = "",
}: {
  username: string;
  isVerified?: boolean;
  className?: string;
}) {
  return (
    <>
      <Link
        href={`/u/${username}`}
        className={`hover:underline underline-offset-2 ${className}`}
      >
        {username}
      </Link>
      {isVerified && (
        <span
          aria-hidden="true"
          className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
        />
      )}
    </>
  );
}
