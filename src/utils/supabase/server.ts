// src/utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name, value, options) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name, options) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}