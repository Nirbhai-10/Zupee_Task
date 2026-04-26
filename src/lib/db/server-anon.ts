import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Demo-mode Supabase client used by API routes for writes when there's
 * no service-role key. Prefers `SUPABASE_SERVICE_ROLE_KEY` if present
 * (production-safe), otherwise falls back to the anon key — which works
 * because migration 0005 disabled RLS on user-data tables for the
 * prototype. Re-enable RLS + drop the anon fallback before shipping.
 */

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseDemoClient(): SupabaseClient<Database> | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "bharosa/demo-server" } },
  });
  return cached;
}

/** Default seeded user — used by demo writes that don't have a real
 *  authenticated session. Matches the UUID seeded in migration 0004. */
export const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";
