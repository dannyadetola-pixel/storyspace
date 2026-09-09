import { createClient } from "@supabase/supabase-js";

// Server-side only — this uses the service role (or newer "secret") key,
// which bypasses row-level security. It must never be exposed to the
// browser, which is exactly why this file is only ever imported from API
// routes, never from a "use client" component.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    // Required for the secret/service_role key to actually get admin
    // privileges in a server-rendered environment like Next.js — without
    // these, Supabase silently restricts it as if it were unauthenticated,
    // which is what's been causing every "not found" error so far.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const BUCKET = "post-media";
let bucketEnsured = false;

async function ensureBucketExists(): Promise<void> {
  if (bucketEnsured) return;
  const { error } = await supabase.storage.getBucket(BUCKET);
  if (error) {
    // Bucket doesn't exist (or isn't reachable) — create it fresh, public,
    // so this never depends on someone having set it up correctly by hand.
    const { error: createError } = await supabase.storage.createBucket(
      BUCKET,
      { public: true }
    );
    // Two near-simultaneous uploads could both reach this point before
    // either finishes creating it — that's fine, not a real failure.
    if (createError && !createError.message.toLowerCase().includes("exists")) {
      throw createError;
    }
  }
  bucketEnsured = true;
}

export async function uploadImageToSupabase(
  path: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await ensureBucketExists();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, { contentType, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}