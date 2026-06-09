import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
  console.warn("⚠️ WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing!");
}

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
