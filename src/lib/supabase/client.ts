import { createClient } from "@supabase/supabase-js";

let client:
  | ReturnType<typeof createClient>
  | null = null;

function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  if (!client) client = createClient(normalizeSupabaseUrl(url), key);
  return client;
}
