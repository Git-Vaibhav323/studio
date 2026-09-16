import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ─── Singleton browser client ─────────────────────────────────────────────────
// Reuse one instance per page load — prevents "Multiple GoTrueClient" warning.
let _browserClient = null;

export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (_browserClient) return _browserClient;
  _browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _browserClient;
};

// Named export for convenience (same singleton)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// ─── Server-side client (service role, no session) ───────────────────────────
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase server credentials not configured');
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

// ─── Server component client (cookie-aware, async) ───────────────────────────
export const createServerComponentSupabaseClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
    return null;
  }
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* called from Server Component — safe to ignore */ }
      },
    },
  });
};
