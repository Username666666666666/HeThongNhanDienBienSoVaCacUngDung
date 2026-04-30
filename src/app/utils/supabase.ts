import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
// Make sure to configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // ✅ Keep session on page reload / tab switch
    autoRefreshToken: true,      // ✅ Automatically refresh token
    detectSessionInUrl: true,    // ✅ Required for OAuth (Google, Facebook)
    storage: localStorage,       // ✅ Use localStorage for session persistence
  },
});