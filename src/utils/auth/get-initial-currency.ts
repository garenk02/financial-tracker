'use server'

import { createClient } from '@supabase/supabase-js'

// This is a server action that can be called from server components
export async function getInitialCurrency(): Promise<string> {
  try {
    // Create a server-side Supabase client without cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get the authenticated user (recommended by Supabase for security)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // console.log("No authenticated user found, using default currency")
      return "usd"
    }

    // Get user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_currency')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return "usd"
    }

    if (data?.preferred_currency) {
      console.log("Found user currency preference:", data.preferred_currency)
      return data.preferred_currency.toLowerCase()
    }

    return "usd"
  } catch (error) {
    console.error("Error getting initial currency:", error)
    return "usd"
  }
}
