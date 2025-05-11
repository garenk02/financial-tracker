import { z } from 'zod'

// Define schemas for goal validation
export const goalSchema = z.object({
  name: z.string().min(1, { message: "Goal name is required" }),
  target_amount: z.coerce.number().positive({ message: "Target amount must be a positive number" }),
  current_amount: z.coerce.number().min(0, { message: "Current amount cannot be negative" }).default(0),
  start_date: z.string().min(1, { message: "Start date is required" }),
  target_date: z.string().min(1, { message: "Target date is required" }),
  auto_allocate: z.boolean().default(false),
  monthly_contribution: z.coerce.number().min(0).optional(),
})

export const addFundsSchema = z.object({
  goal_id: z.string().uuid({ message: "Invalid goal ID" }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number" }),
})

// Explicitly define the form values type to match what the form expects
export interface GoalFormValues {
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  auto_allocate: boolean;
  monthly_contribution?: number;
}

export type AddFundsFormValues = z.infer<typeof addFundsSchema>
