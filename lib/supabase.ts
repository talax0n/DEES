import { createClient } from '@supabase/supabase-js'
import { env } from 'prisma/config'

const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL')!
const supabaseAnonKey = env('NEXT_PUBLIC_SUPABASE_ANON_KEY')!

// Browser client (public)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client (admin) — use only in server-side code
export function createServerSupabaseClient() {
  const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
