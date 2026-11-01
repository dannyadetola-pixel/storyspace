import Link from "next/link";
import VerifiedBadge from "@/components/VerifiedBadge";

// Renders a username as a link to that user's public profile, with the
// verified badge beside it. Don't wrap this inside another Link — nested
// links are invalid HTML.
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
      {isVerified && <VerifiedBadge />}
    </>
  );
}