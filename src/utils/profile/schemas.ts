import { z } from 'zod'

// Schema for updating user preferences
export const userPreferencesSchema = z.object({
  preferred_currency: z.string().min(1, { message: "Currency is required" }),
  theme_preference: z.string().min(1, { message: "Theme is required" }),
})

export type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>
