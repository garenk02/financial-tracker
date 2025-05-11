// src/utils/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  // In Next.js 15+, cookies() is async
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(/* name, value, options */) {
          // This is a server-side only operation, cookies are set in middleware
          // We're just implementing the interface here
        },
        remove(/* name, options */) {
          // This is a server-side only operation, cookies are removed in middleware
          // We're just implementing the interface here
        },
      },
    }
  )
}