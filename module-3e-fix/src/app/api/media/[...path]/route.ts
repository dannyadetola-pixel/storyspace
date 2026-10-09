import { NextResponse } from "next/server";

// The browser talking directly to Supabase's storage domain has been
// getting a 400 on every embedded image load, despite the exact same URL
// working fine when opened directly — something about how a browser
// requests an *embedded* cross-origin image differs enough to trigger it.
// Routing through our own server sidesteps the question entirely: this is
// a plain server-to-server fetch (no browser involved, no cross-origin
// headers to trip over), and the browser only ever talks to our own
// domain, which is about as reliable as a fetch path gets.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${path
    .map(encodeURIComponent)
    .join("/")}`;

  const upstream = await fetch(supabaseUrl);

  if (!upstream.ok) {
    return new NextResponse("Image not found", { status: 404 });
  }

  const buffer = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
