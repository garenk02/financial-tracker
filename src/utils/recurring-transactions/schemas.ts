import { z } from 'zod'
import { RecurringFrequency } from '@/types/recurring-transactions'

// Define schemas for recurring transaction validation
export const recurringTransactionSchema = z.object({
  amount: z.coerce.number().min(100, { message: "Amount must be at least 100" }),
  description: z.string().min(1, { message: "Description is required" }),
  category_id: z.string().uuid({ message: "Please select a category" }),
  is_income: z.boolean(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] as const),
  start_date: z.string().min(1, { message: "Start date is required" }),
  end_date: z.string().optional().nullable(),
})

export type RecurringTransactionFormValues = z.infer<typeof recurringTransactionSchema>

// Schema for updating a recurring transaction
export const updateRecurringTransactionSchema = recurringTransactionSchema.extend({
  id: z.string().uuid({ message: "Valid recurring transaction ID is required" }),
})

export type UpdateRecurringTransactionFormValues = z.infer<typeof updateRecurringTransactionSchema>

// Schema for deleting a recurring transaction
export const deleteRecurringTransactionSchema = z.object({
  id: z.string().uuid({ message: "Valid recurring transaction ID is required" }),
})

export type DeleteRecurringTransactionFormValues = z.infer<typeof deleteRecurringTransactionSchema>
