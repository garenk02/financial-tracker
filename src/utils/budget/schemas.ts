import { z } from 'zod'

// Schema for creating/updating a monthly budget
export const monthlyBudgetSchema = z.object({
  total_budget: z.coerce.number().positive({ message: "Budget amount must be a positive number" }),
  month: z.coerce.number().min(1).max(12).optional(), // Will default to current month if not provided
  year: z.coerce.number().min(2000).max(2100).optional(), // Will default to current year if not provided
})

// Schema for allocating budget to a category
export const categoryBudgetSchema = z.object({
  category_id: z.string().uuid({ message: "Valid category ID is required" }),
  allocated_amount: z.coerce.number().min(0, { message: "Allocated amount cannot be negative" }),
})

// Schema for allocating budget to multiple categories at once
export const categoryBudgetsSchema = z.object({
  budget_id: z.string().uuid({ message: "Valid budget ID is required" }),
  allocations: z.array(
    z.object({
      category_id: z.string().uuid({ message: "Valid category ID is required" }),
      allocated_amount: z.coerce.number().min(0, { message: "Allocated amount cannot be negative" }),
    })
  ),
})

// Types based on the schemas
export type MonthlyBudgetFormValues = z.infer<typeof monthlyBudgetSchema>
export type CategoryBudgetFormValues = z.infer<typeof categoryBudgetSchema>
export type CategoryBudgetsFormValues = z.infer<typeof categoryBudgetsSchema>
