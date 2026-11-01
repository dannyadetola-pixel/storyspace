// Converts a stored Supabase public URL into our same-origin proxy path.
// See api/media/[...path]/route.ts for why images load through this.
export function toProxyUrl(mediaUrl: string | null | undefined): string | null {
  if (!mediaUrl) return null;
  const marker = "/storage/v1/object/public/";
  const index = mediaUrl.indexOf(marker);
  if (index === -1) return mediaUrl;
  return `/api/media/${mediaUrl.slice(index + marker.length)}`;
}