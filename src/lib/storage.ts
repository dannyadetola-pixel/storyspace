import { createClient } from "@supabase/supabase-js";

// Server-side only — this uses the service role (or newer "secret") key,
// which bypasses row-level security. It must never be exposed to the
// browser, which is exactly why this file is only ever imported from API
// routes, never from a "use client" component.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "post-media";

export async function uploadImageToSupabase(
  path: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
