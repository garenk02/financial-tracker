'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'

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

// Get recent transactions for the current user
export async function getRecentTransactions(limit = 5) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view transactions" }
    }

    // Query to get recent transactions
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        description,
        date,
        is_income,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent transactions:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error)
    return { error: "Failed to fetch recent transactions" }
  }
}

// Get current balance for the user
export async function getCurrentBalance() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view your balance" }
    }

    // Query to get all transactions
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, is_income')
      .eq('user_id', user.id)

    if (error) {
      console.error("Error fetching transactions for balance:", error)
      return { error: error.message }
    }

    // Calculate balance
    const balance = data.reduce((total, transaction) => {
      if (transaction.is_income) {
        return total + transaction.amount
      } else {
        return total - transaction.amount
      }
    }, 0)

    return { success: true, balance }
  } catch (error) {
    console.error("Failed to calculate current balance:", error)
    return { error: "Failed to calculate current balance" }
  }
}

// Get monthly spending summary
export async function getMonthlySpendingSummary() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view spending summary" }
    }

    // Get current month and year
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()

    // Get monthly budget if exists
    const { data: budgetData, error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('total_budget')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single()

    if (budgetError && budgetError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching monthly budget:", budgetError)
      return { error: budgetError.message }
    }

    // Get current month's expenses
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    const { data: expensesData, error: expensesError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('is_income', false)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)

    if (expensesError) {
      console.error("Error fetching monthly expenses:", expensesError)
      return { error: expensesError.message }
    }

    // Calculate total spent
    const totalSpent = expensesData.reduce((sum, transaction) => sum + transaction.amount, 0)
    
    // Default budget if none exists
    const budget = budgetData?.total_budget || 3000

    return { 
      success: true, 
      data: {
        spent: totalSpent,
        budget: budget,
        remaining: budget - totalSpent,
        percentage: Math.round((totalSpent / budget) * 100)
      }
    }
  } catch (error) {
    console.error("Failed to fetch monthly spending summary:", error)
    return { error: "Failed to fetch monthly spending summary" }
  }
}

// Get expense breakdown by category for the current month
export async function getExpenseBreakdown() {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view expense breakdown" }
    }

    // Get current month and year
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()
    
    // Get start and end of month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

    // Get expenses with categories
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', user.id)
      .eq('is_income', false)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)

    if (error) {
      console.error("Error fetching expense breakdown:", error)
      return { error: error.message }
    }

    // Group by category
    const categoryMap = new Map()
    
    data.forEach(transaction => {
      if (!transaction.categories) return
      
      const categoryId = transaction.categories.id
      const categoryName = transaction.categories.name
      const categoryColor = transaction.categories.color
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          amount: 0
        })
      }
      
      categoryMap.get(categoryId).amount += transaction.amount
    })
    
    // Convert to array and sort by amount
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)

    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to fetch expense breakdown:", error)
    return { error: "Failed to fetch expense breakdown" }
  }
}
