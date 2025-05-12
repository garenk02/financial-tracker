'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  recurringTransactionSchema,
  updateRecurringTransactionSchema,
  deleteRecurringTransactionSchema,
  type RecurringTransactionFormValues,
  type UpdateRecurringTransactionFormValues,
  type DeleteRecurringTransactionFormValues
} from './schemas'
import { isRecurringTransactionDue, getNextDate } from '@/types/recurring-transactions'

// Create a Supabase client for server actions
async function createActionClient() {
  const cookieStore = cookies()

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

// Add a new recurring transaction
export async function addRecurringTransaction(formData: RecurringTransactionFormValues) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to add a recurring transaction" }
    }

    // Validate the form data
    const validatedData = recurringTransactionSchema.parse(formData)

    // Prepare recurring transaction data
    const recurringTransactionData = {
      user_id: user.id,
      amount: validatedData.amount,
      description: validatedData.description,
      category_id: validatedData.category_id,
      is_income: validatedData.is_income,
      frequency: validatedData.frequency,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date || null,
    }

    // Insert the recurring transaction and return with category data
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert(recurringTransactionData)
      .select(`
        *,
        categories:category_id (
          id,
          name,
          color
        )
      `)

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    // Revalidate the transactions page
    revalidatePath('/transactions')
    revalidatePath('/')

    return { success: true, data }
  } catch (error) {
    console.error("Server error in addRecurringTransaction:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error adding recurring transaction: ${error.message}`
        : "Failed to add recurring transaction: Unknown error"
    }
  }
}

// Update an existing recurring transaction
export async function updateRecurringTransaction(formData: UpdateRecurringTransactionFormValues) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to update a recurring transaction" }
    }

    // Validate the form data
    const validatedData = updateRecurringTransactionSchema.parse(formData)

    // Prepare recurring transaction data
    const recurringTransactionData = {
      amount: validatedData.amount,
      description: validatedData.description,
      category_id: validatedData.category_id,
      is_income: validatedData.is_income,
      frequency: validatedData.frequency,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date || null,
    }

    // Update the recurring transaction
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(recurringTransactionData)
      .eq('id', validatedData.id)
      .eq('user_id', user.id) // Ensure the user owns this recurring transaction
      .select(`
        *,
        categories:category_id (
          id,
          name,
          color
        )
      `)

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    // Revalidate the transactions page
    revalidatePath('/transactions')
    revalidatePath('/')

    return { success: true, data }
  } catch (error) {
    console.error("Server error in updateRecurringTransaction:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error updating recurring transaction: ${error.message}`
        : "Failed to update recurring transaction: Unknown error"
    }
  }
}

// Delete a recurring transaction
export async function deleteRecurringTransaction(formData: DeleteRecurringTransactionFormValues) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to delete a recurring transaction" }
    }

    // Validate the form data
    const validatedData = deleteRecurringTransactionSchema.parse(formData)

    // Delete the recurring transaction
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', validatedData.id)
      .eq('user_id', user.id) // Ensure the user owns this recurring transaction

    if (error) {
      console.error("Database error:", error)
      return { error: "Database error: " + error.message }
    }

    // Revalidate the transactions page
    revalidatePath('/transactions')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error("Server error in deleteRecurringTransaction:", error)

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: `Validation error: ${errorMessage}` }
    }

    return {
      error: error instanceof Error
        ? `Error deleting recurring transaction: ${error.message}`
        : "Failed to delete recurring transaction: Unknown error"
    }
  }
}

// Get recurring transactions for the current user
export async function getRecurringTransactions() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view recurring transactions" }
    }

    // Query to get recurring transactions
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching recurring transactions:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Server error in getRecurringTransactions:", error)
    return {
      error: error instanceof Error
        ? `Error fetching recurring transactions: ${error.message}`
        : "Failed to fetch recurring transactions: Unknown error"
    }
  }
}

// Process due recurring transactions
export async function processDueRecurringTransactions() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to process recurring transactions" }
    }

    // Get all recurring transactions for the user
    const { data: recurringTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error("Error fetching recurring transactions:", fetchError)
      return { error: fetchError.message }
    }

    if (!recurringTransactions || recurringTransactions.length === 0) {
      return { success: true, message: "No recurring transactions found" }
    }

    const today = new Date()
    const processedTransactions = []

    // Process each recurring transaction
    for (const recurringTx of recurringTransactions) {
      // Skip if end date exists and is in the past
      if (recurringTx.end_date && new Date(recurringTx.end_date) < today) {
        continue
      }

      // Get the most recent transaction for this recurring transaction
      const { data: latestTransactions, error: latestError } = await supabase
        .from('transactions')
        .select('date')
        .eq('recurring_id', recurringTx.id)
        .order('date', { ascending: false })
        .limit(1)

      if (latestError) {
        console.error(`Error fetching latest transaction for recurring ID ${recurringTx.id}:`, latestError)
        continue
      }

      const lastTransactionDate = latestTransactions && latestTransactions.length > 0
        ? new Date(latestTransactions[0].date)
        : null

      // Check if a new transaction should be created
      if (isRecurringTransactionDue(recurringTx, lastTransactionDate)) {
        // Calculate the next date for the transaction
        const nextDate = lastTransactionDate
          ? getNextDate(lastTransactionDate, recurringTx.frequency)
          : new Date(recurringTx.start_date)

        // Format the date as YYYY-MM-DD
        const formattedDate = nextDate.toISOString().split('T')[0]

        // Create a new transaction
        const transactionData = {
          user_id: user.id,
          amount: recurringTx.amount,
          description: recurringTx.description,
          date: formattedDate,
          category_id: recurringTx.category_id,
          is_income: recurringTx.is_income,
          recurring_id: recurringTx.id,
          tags: ['recurring_transaction']
        }

        const { data: newTransaction, error: insertError } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()

        if (insertError) {
          console.error(`Error creating transaction for recurring ID ${recurringTx.id}:`, insertError)
          continue
        }

        processedTransactions.push(newTransaction)
      }
    }

    // Revalidate paths if any transactions were processed
    if (processedTransactions.length > 0) {
      revalidatePath('/transactions')
      revalidatePath('/')
    }

    return {
      success: true,
      message: `Processed ${processedTransactions.length} recurring transactions`,
      data: processedTransactions
    }
  } catch (error) {
    console.error("Server error in processDueRecurringTransactions:", error)
    return {
      error: error instanceof Error
        ? `Error processing recurring transactions: ${error.message}`
        : "Failed to process recurring transactions: Unknown error"
    }
  }
}
