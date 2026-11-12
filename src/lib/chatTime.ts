const TZ = "Africa/Lagos";

// Calendar day in Lagos time, as YYYY-MM-DD, so two dates can be compared by day.
function dayKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

// WhatsApp-style chat timestamps:
//   today            -> 14:05
//   yesterday        -> Yesterday
//   within a week    -> Mon
//   older            -> 3 Oct 2026
export function formatChatTime(date: Date, now: Date = new Date()): string {
  const key = dayKey(date);
  if (key === dayKey(now)) {
    return date.toLocaleTimeString("en-NG", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (key === dayKey(new Date(now.getTime() - 86_400_000))) {
    return "Yesterday";
  }
  const daysAgo = (now.getTime() - date.getTime()) / 86_400_000;
  if (daysAgo < 7) {
    return date.toLocaleDateString("en-NG", { timeZone: TZ, weekday: "short" });
  }
  return date.toLocaleDateString("en-NG", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
