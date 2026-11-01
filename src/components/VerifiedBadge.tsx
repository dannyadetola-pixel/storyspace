// Small gold star with a black tick. Used everywhere a verified account
// appears, so changing the design means editing this one file.
export default function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="Verified"
      className={`inline-block w-3.5 h-3.5 ml-1 align-middle shrink-0 ${className}`}
    >
      <path
        d="M12 1 L14.94 7.95 L22.46 8.6 L16.76 13.55 L18.47 20.9 L12 17 L5.53 20.9 L7.24 13.55 L1.54 8.6 L9.06 7.95 Z"
        fill="#D4AF37"
        stroke="#000"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 12.2 L11 14.4 L15.2 9.9"
        fill="none"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}