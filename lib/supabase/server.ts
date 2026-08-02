import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Pakai service role key — hanya di server, tidak pernah ke browser
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}