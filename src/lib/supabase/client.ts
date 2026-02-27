import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // During static prerendering, NEXT_PUBLIC_ vars may not be available.
  // Use placeholder values so the client can be created without crashing.
  // It won't make real requests during prerendering anyway.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(url, key);
}
