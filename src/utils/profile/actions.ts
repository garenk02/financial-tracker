'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { userPreferencesSchema, type UserPreferencesFormValues } from './schemas'

// Create a Supabase client for server actions
async function createActionClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}

// Get the current user's profile
export async function getUserProfile() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user using getUser() which is more secure
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return { error: "You must be logged in to view your profile" }
    }

    const userId = user.id

    // Get user profile directly from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, preferred_currency, theme_preference, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error("Error fetching user profile:", error)

      // If the profile doesn't exist, return an empty profile
      if (error.code === 'PGRST116') { // PGRST116 is "not found"
        return {
          data: {
            id: userId,
            preferred_currency: 'usd',
            theme_preference: 'system'
          }
        }
      }

      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("Server error in getUserProfile:", error)
    return {
      error: error instanceof Error
        ? `Error fetching profile: ${error.message}`
        : "Failed to fetch profile: Unknown error"
    }
  }
}

// Update user preferences
export async function updateUserPreferences(formData: UserPreferencesFormValues) {
  try {
    console.log("Received form data:", formData)

    // Validate form data
    const validatedData = userPreferencesSchema.parse(formData)
    console.log("Validated data:", validatedData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user using getUser() which is more secure
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error:", userError)
      return { error: "You must be logged in to update preferences" }
    }

    const userId = user.id
    console.log("User ID:", userId)

    // Prepare update data
    const updateData = {
      preferred_currency: validatedData.preferred_currency.toLowerCase(),
      theme_preference: validatedData.theme_preference,
      updated_at: new Date().toISOString(),
    }

    console.log("Updating preferences for user", userId, ":", updateData)

    // Use RPC (Remote Procedure Call) to update the profile
    // This bypasses RLS policies and uses the server-side function
    const { data, error } = await supabase.rpc('update_user_preferences', {
      user_id: userId,
      p_currency: updateData.preferred_currency,
      p_theme: updateData.theme_preference
    })

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    console.log("Successfully updated profile:", data)

    // Revalidate all pages that might display user preferences
    revalidatePath('/', 'layout')
    revalidatePath('/settings', 'layout')

    return { success: true, data: updateData }
  } catch (error) {
    console.error("Server error in updateUserPreferences:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error updating preferences: ${error.message}`
        : "Failed to update preferences: Unknown error"
    }
  }
}
