import { z } from 'zod'

// Schema for updating user preferences
export const userPreferencesSchema = z.object({
  preferred_currency: z.string().min(1, { message: "Currency is required" }),
  theme_preference: z.string().min(1, { message: "Theme is required" }),
})

export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>

// Schema for updating user profile
export const userProfileSchema = z.object({
  display_name: z.string().min(1, { message: "Name is required" }),
})

export type UserProfileFormValues = z.infer<typeof userProfileSchema>
