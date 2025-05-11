'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  monthlyBudgetSchema,
  categoryBudgetSchema,
  categoryBudgetsSchema,
  type MonthlyBudgetFormValues,
  type CategoryBudgetFormValues,
  type CategoryBudgetsFormValues
} from './schemas'

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

// Get the current monthly budget
export async function getCurrentMonthlyBudget(month?: number, year?: number) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view budget" }
    }

    // Get current month and year if not provided
    const now = new Date()
    const currentMonth = month || now.getMonth() + 1 // 1-12
    const currentYear = year || now.getFullYear()

    // Get monthly budget if exists
    const { data, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching monthly budget:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch monthly budget:", error)
    return { error: "Failed to fetch monthly budget" }
  }
}

// Create or update a monthly budget
export async function createOrUpdateMonthlyBudget(formData: MonthlyBudgetFormValues) {
  try {
    // Validate form data
    const validatedData = monthlyBudgetSchema.parse(formData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to update budget" }
    }

    // Get current month and year if not provided
    const now = new Date()
    const month = validatedData.month || now.getMonth() + 1 // 1-12
    const year = validatedData.year || now.getFullYear()

    // Check if budget already exists for this month/year
    const { data: existingBudget, error: checkError } = await supabase
      .from('monthly_budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', month)
      .eq('year', year)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing budget:", checkError)
      return { error: checkError.message }
    }

    let result;

    // Prepare budget data
    const budgetData = {
      user_id: user.id,
      total_budget: validatedData.total_budget,
      month,
      year
    }

    if (existingBudget) {
      // Update existing budget
      result = await supabase
        .from('monthly_budgets')
        .update(budgetData)
        .eq('id', existingBudget.id)
        .select()
    } else {
      // Create new budget
      result = await supabase
        .from('monthly_budgets')
        .insert(budgetData)
        .select()
    }

    if (result.error) {
      console.error("Error saving budget:", result.error)
      return { error: result.error.message }
    }

    // Revalidate the budget page and dashboard
    revalidatePath('/budget', 'layout')
    revalidatePath('/', 'layout')

    return { success: true, data: result.data[0] }
  } catch (error) {
    console.error("Server error in createOrUpdateMonthlyBudget:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error updating budget: ${error.message}`
        : "Failed to update budget: Unknown error"
    }
  }
}

// Get budget categories for a specific monthly budget
export async function getBudgetCategories(budgetId: string) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view budget categories" }
    }

    // Verify the budget belongs to the user
    const { error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('id')
      .eq('id', budgetId)
      .eq('user_id', user.id)
      .single()

    if (budgetError) {
      console.error("Error verifying budget ownership:", budgetError)
      return { error: "Budget not found or access denied" }
    }

    // Get budget categories
    const { data, error } = await supabase
      .from('budget_categories')
      .select(`
        id,
        allocated_amount,
        categories (
          id,
          name,
          type,
          color,
          icon
        )
      `)
      .eq('budget_id', budgetId)

    if (error) {
      console.error("Error fetching budget categories:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch budget categories:", error)
    return { error: "Failed to fetch budget categories" }
  }
}

// Create or update a budget category allocation
export async function updateCategoryBudget(budgetId: string, formData: CategoryBudgetFormValues) {
  try {
    // Validate form data
    const validatedData = categoryBudgetSchema.parse(formData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to update budget categories" }
    }

    // Verify the budget belongs to the user
    const { error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('id')
      .eq('id', budgetId)
      .eq('user_id', user.id)
      .single()

    if (budgetError) {
      console.error("Error verifying budget ownership:", budgetError)
      return { error: "Budget not found or access denied" }
    }

    // Check if budget category already exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('budget_categories')
      .select('id')
      .eq('budget_id', budgetId)
      .eq('category_id', validatedData.category_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing budget category:", checkError)
      return { error: checkError.message }
    }

    let result;

    // Prepare category budget data
    const categoryBudgetData = {
      budget_id: budgetId,
      category_id: validatedData.category_id,
      allocated_amount: validatedData.allocated_amount
    }

    if (existingCategory) {
      // Update existing category budget
      result = await supabase
        .from('budget_categories')
        .update(categoryBudgetData)
        .eq('id', existingCategory.id)
        .select()
    } else {
      // Create new category budget
      result = await supabase
        .from('budget_categories')
        .insert(categoryBudgetData)
        .select()
    }

    if (result.error) {
      console.error("Error saving category budget:", result.error)
      return { error: result.error.message }
    }

    // Revalidate the budget page and dashboard
    revalidatePath('/budget', 'layout')
    revalidatePath('/', 'layout')

    return { success: true, data: result.data[0] }
  } catch (error) {
    console.error("Server error in updateCategoryBudget:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error updating category budget: ${error.message}`
        : "Failed to update category budget: Unknown error"
    }
  }
}

// Update multiple category budgets at once
export async function updateMultipleCategoryBudgets(formData: CategoryBudgetsFormValues) {
  try {
    // Validate form data
    const validatedData = categoryBudgetsSchema.parse(formData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to update budget categories" }
    }

    // Verify the budget belongs to the user
    const { error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('id')
      .eq('id', validatedData.budget_id)
      .eq('user_id', user.id)
      .single()

    if (budgetError) {
      console.error("Error verifying budget ownership:", budgetError)
      return { error: "Budget not found or access denied" }
    }

    // Process each allocation
    const results = []
    for (const allocation of validatedData.allocations) {
      // Check if budget category already exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('budget_categories')
        .select('id')
        .eq('budget_id', validatedData.budget_id)
        .eq('category_id', allocation.category_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing budget category:", checkError)
        continue // Skip this one but continue with others
      }

      // Prepare category budget data
      const categoryBudgetData = {
        budget_id: validatedData.budget_id,
        category_id: allocation.category_id,
        allocated_amount: allocation.allocated_amount
      }

      let result;
      if (existingCategory) {
        // Update existing category budget
        result = await supabase
          .from('budget_categories')
          .update(categoryBudgetData)
          .eq('id', existingCategory.id)
          .select()
      } else {
        // Create new category budget
        result = await supabase
          .from('budget_categories')
          .insert(categoryBudgetData)
          .select()
      }

      if (result.error) {
        console.error("Error saving category budget:", result.error)
      } else {
        results.push(result.data[0])
      }
    }

    // Revalidate the budget page and dashboard
    revalidatePath('/budget', 'layout')
    revalidatePath('/', 'layout')

    return { success: true, data: results }
  } catch (error) {
    console.error("Server error in updateMultipleCategoryBudgets:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error updating category budgets: ${error.message}`
        : "Failed to update category budgets: Unknown error"
    }
  }
}
