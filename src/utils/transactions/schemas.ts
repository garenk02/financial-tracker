import { z } from 'zod'

// Define schemas for transaction validation
export const expenseSchema = z.object({
  amount: z.coerce.number().min(100, { message: "Amount must be at least 100" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  category_id: z.string().uuid({ message: "Please select a category" }),
  tags: z.array(z.string()).optional(),
})

export const incomeSchema = z.object({
  amount: z.coerce.number().min(100, { message: "Amount must be at least 100" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  category_id: z.string().uuid({ message: "Please select a category" }),
  tags: z.array(z.string()).optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
export type IncomeFormValues = z.infer<typeof incomeSchema>
