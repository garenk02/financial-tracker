import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Custom logger that only logs in development or browser environment
const logger = {
  log: (...args: unknown[]) => {
    // Only log in development (not during build)
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, but can be suppressed during build if needed
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
  }
}

export async function GET() {
  try {
    // Create a server-side Supabase client with cookies
    const supabase = await createClient()

    // Get the authenticated user (recommended by Supabase for security)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      logger.error("Error getting authenticated user:", userError)
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      )
    }

    if (!user) {
      logger.log("No authenticated user found")
      return NextResponse.json(
        { error: "You must be logged in to view your profile" },
        { status: 401 }
      )
    }

    // logger.log("User authenticated:", user.id)

    // Get user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, preferred_currency, theme_preference, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (error) {
      // If the profile doesn't exist, return default values
      if (error.code === 'PGRST116') { // PGRST116 is "not found"
        return NextResponse.json({
          data: {
            id: user.id,
            preferred_currency: 'usd',
            theme_preference: 'system'
          }
        })
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error("Error in profile API route:", error)
    // Return a more detailed error message in development
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Internal server error: ${error instanceof Error ? error.message : String(error)}`
      : "Internal server error"

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
