'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { goalSchema, addFundsSchema, type GoalFormValues, type AddFundsFormValues } from './schemas'

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

// Get all goals for the current user
export async function getGoals() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
      return { error: "Authentication error: " + userError.message }
    }

    if (!user) {
      return { error: "You must be logged in to view goals" }
    }

    // Query to get goals
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching goals:", error)
      return { error: error.message }
    }

    // Ensure numeric values are properly parsed and force a fresh calculation
    const processedData = data?.map(goal => {
      // Parse numeric values
      const currentAmount = typeof goal.current_amount === 'string'
        ? parseFloat(goal.current_amount)
        : goal.current_amount || 0

      const targetAmount = typeof goal.target_amount === 'string'
        ? parseFloat(goal.target_amount)
        : goal.target_amount || 0

      // Calculate percentage for debugging
      const percentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100)

      return {
        ...goal,
        current_amount: currentAmount,
        target_amount: targetAmount,
        // Add a calculated percentage field for debugging
        _percentage: percentage
      }
    })

    return { success: true, data: processedData }
  } catch (error) {
    console.error("Server error in getGoals:", error)
    return {
      error: error instanceof Error
        ? `Error fetching goals: ${error.message}`
        : "Failed to fetch goals: Unknown error"
    }
  }
}

// Add a new financial goal
export async function addGoal(formData: GoalFormValues) {
  try {
    // Validate the form data
    const validatedData = goalSchema.parse(formData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
      return { error: "Authentication error: " + userError.message }
    }

    if (!user) {
      return { error: "You must be logged in to add a goal" }
    }

    // Calculate monthly contribution if auto_allocate is true
    let monthlyContribution = validatedData.monthly_contribution

    if (validatedData.auto_allocate && !monthlyContribution) {
      const startDate = new Date(validatedData.start_date)
      const targetDate = new Date(validatedData.target_date)
      const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
                         (targetDate.getMonth() - startDate.getMonth())

      if (monthsDiff > 0) {
        const remainingAmount = validatedData.target_amount - (validatedData.current_amount || 0)
        monthlyContribution = remainingAmount / monthsDiff
      } else {
        // If target date is in the same month or earlier, set to full amount
        monthlyContribution = validatedData.target_amount - (validatedData.current_amount || 0)
      }
    }

    // Prepare goal data
    const goalData = {
      user_id: user.id,
      name: validatedData.name,
      target_amount: validatedData.target_amount,
      current_amount: validatedData.current_amount || 0,
      start_date: validatedData.start_date,
      target_date: validatedData.target_date,
      is_completed: false,
      auto_allocate: validatedData.auto_allocate || false,
      monthly_contribution: monthlyContribution || null,
    }

    // Insert the goal
    const { data, error } = await supabase.from('financial_goals').insert(goalData).select()

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    // Revalidate the goals page with stronger cache invalidation
    revalidatePath('/goals', 'layout')
    return { success: true, data }
  } catch (error) {
    console.error("Server error in addGoal:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error adding goal: ${error.message}`
        : "Failed to add goal: Unknown error"
    }
  }
}

// Update an existing goal
export async function updateGoal(goalId: string, formData: GoalFormValues) {
  try {
    // Validate the form data
    const validatedData = goalSchema.parse(formData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
      return { error: "Authentication error: " + userError.message }
    }

    if (!user) {
      return { error: "You must be logged in to update a goal" }
    }

    // Calculate monthly contribution if auto_allocate is true
    let monthlyContribution = validatedData.monthly_contribution

    if (validatedData.auto_allocate && !monthlyContribution) {
      const startDate = new Date(validatedData.start_date)
      const targetDate = new Date(validatedData.target_date)
      const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
                         (targetDate.getMonth() - startDate.getMonth())

      if (monthsDiff > 0) {
        const remainingAmount = validatedData.target_amount - (validatedData.current_amount || 0)
        monthlyContribution = remainingAmount / monthsDiff
      } else {
        // If target date is in the same month or earlier, set to full amount
        monthlyContribution = validatedData.target_amount - (validatedData.current_amount || 0)
      }
    }

    // Check if the goal is completed
    const isCompleted = (validatedData.current_amount || 0) >= validatedData.target_amount

    // Prepare goal data
    const goalData = {
      name: validatedData.name,
      target_amount: validatedData.target_amount,
      current_amount: validatedData.current_amount || 0,
      start_date: validatedData.start_date,
      target_date: validatedData.target_date,
      is_completed: isCompleted,
      auto_allocate: validatedData.auto_allocate || false,
      monthly_contribution: monthlyContribution || null,
      updated_at: new Date().toISOString(),
    }

    // Update the goal
    const { data, error } = await supabase
      .from('financial_goals')
      .update(goalData)
      .eq('id', goalId)
      .eq('user_id', user.id) // Ensure the user owns this goal
      .select()

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    // Revalidate the goals page with stronger cache invalidation
    revalidatePath('/goals', 'layout')
    return { success: true, data }
  } catch (error) {
    console.error("Server error in updateGoal:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error updating goal: ${error.message}`
        : "Failed to update goal: Unknown error"
    }
  }
}

// Delete a goal
export async function deleteGoal(goalId: string) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
      return { error: "Authentication error: " + userError.message }
    }

    if (!user) {
      return { error: "You must be logged in to delete a goal" }
    }

    // Delete the goal
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id) // Ensure the user owns this goal

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    // Revalidate the goals page with stronger cache invalidation
    revalidatePath('/goals', 'layout')

    return { success: true }
  } catch (error) {
    console.error("Server error in deleteGoal:", error)
    return {
      error: error instanceof Error
        ? `Error deleting goal: ${error.message}`
        : "Failed to delete goal: Unknown error"
    }
  }
}

// Add funds to a goal
export async function addFundsToGoal(formData: AddFundsFormValues) {
  try {
    // Validate the form data
    const validatedData = addFundsSchema.parse(formData)

    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
      return { error: "Authentication error: " + userError.message }
    }

    if (!user) {
      return { error: "You must be logged in to add funds to a goal" }
    }

    // Get the current goal data
    const { data: goalData, error: goalError } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('id', validatedData.goal_id)
      .eq('user_id', user.id) // Ensure the user owns this goal
      .single()

    if (goalError) {
      console.error("Error fetching goal:", goalError)
      return { error: "Error fetching goal: " + goalError.message }
    }

    if (!goalData) {
      return { error: "Goal not found" }
    }

    // Convert values to numbers for calculation if needed
    // These values are used in the transaction data below

    // Create a transaction with the goal tag
    // This will trigger the database function to update the goal's current_amount
    const transactionData = {
      user_id: user.id,
      amount: validatedData.amount,
      description: `Contribution to goal: ${goalData.name}`,
      date: new Date().toISOString().split('T')[0],
      is_income: false, // This is an expense (money allocated to a goal)
      tags: ['goal_contribution', `goal:${validatedData.goal_id}`],
    }

    // Insert the transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      return { error: "Error creating transaction: " + transactionError.message }
    }

    // The goal should be updated by the database trigger, but let's fetch the updated goal data
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('id', validatedData.goal_id)
      .eq('user_id', user.id) // Ensure the user owns this goal
      .single()

    if (error) {
      console.error("Error fetching updated goal:", error)
      return { error: "Error fetching updated goal: " + error.message }
    }

    // Revalidate the goals page and transactions page with stronger cache invalidation
    revalidatePath('/goals', 'layout')
    revalidatePath('/transactions', 'layout')

    // Return the updated goal data
    return { success: true, data }
  } catch (error) {
    console.error("Server error in addFundsToGoal:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error adding funds: ${error.message}`
        : "Failed to add funds: Unknown error"
    }
  }
}
