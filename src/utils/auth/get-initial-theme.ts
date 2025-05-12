'use server'

import { createClient } from '@supabase/supabase-js'

// This is a server action that can be called from server components
export async function getInitialTheme(): Promise<string> {
  try {
    // Create a server-side Supabase client without cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get the authenticated user (recommended by Supabase for security)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("No authenticated user found, using default theme: dark")
      return "dark" // Default to dark theme as per database schema
    }

    // Get user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('theme_preference')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return "dark" // Default to dark theme as per database schema
    }

    if (data?.theme_preference) {
      console.log("Found user theme preference:", data.theme_preference)
      // Validate that the theme is one of the allowed values
      if (['light', 'dark', 'system'].includes(data.theme_preference)) {
        return data.theme_preference
      }
    }

    console.log("No valid theme preference found, using default: dark")
    return "dark" // Default to dark theme as per database schema
  } catch (error) {
    console.error("Error getting initial theme:", error)
    return "dark" // Default to dark theme as per database schema
  }
}
