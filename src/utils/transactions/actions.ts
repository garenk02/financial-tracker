'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { expenseSchema, incomeSchema, type ExpenseFormValues, type IncomeFormValues } from './schemas'

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

// Add an expense transaction
export async function addExpense(formData: ExpenseFormValues) {
  try {
    console.log("Server received expense data:", formData);

    // Validate the form data
    const validatedData = expenseSchema.parse(formData);
    console.log("Validated expense data:", validatedData);

    // Create Supabase client
    const supabase = await createActionClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("User authentication error:", userError);
      return { error: "Authentication error: " + userError.message };
    }

    if (!user) {
      return { error: "You must be logged in to add an expense" };
    }

    console.log("User authenticated:", user.id);

    // Prepare transaction data
    const transactionData = {
      user_id: user.id,
      amount: validatedData.amount,
      description: validatedData.description,
      date: validatedData.date,
      category_id: validatedData.category_id,
      is_income: false, // This is an expense
      tags: validatedData.tags || [],
    };

    console.log("Preparing to insert transaction:", transactionData);

    // Insert the transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select();

    if (error) {
      console.error("Database error:", error);
      return { error: "Database error: " + error.message };
    }

    // Revalidate the transactions page and dashboard
    revalidatePath('/transactions');
    revalidatePath('/');

    console.log("Transaction added successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Server error in addExpense:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation error: ${errorMessage}` };
    }

    return {
      error: error instanceof Error
        ? `Error adding expense: ${error.message}`
        : "Failed to add expense: Unknown error"
    };
  }
}

// Add an income transaction
export async function addIncome(formData: IncomeFormValues) {
  try {
    console.log("Server received income data:", formData);

    // Validate the form data
    const validatedData = incomeSchema.parse(formData);
    console.log("Validated income data:", validatedData);

    // Create Supabase client
    const supabase = await createActionClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("User authentication error:", userError);
      return { error: "Authentication error: " + userError.message };
    }

    if (!user) {
      return { error: "You must be logged in to add income" };
    }

    console.log("User authenticated:", user.id);

    // Prepare transaction data
    const transactionData = {
      user_id: user.id,
      amount: validatedData.amount,
      description: validatedData.description,
      date: validatedData.date,
      category_id: validatedData.category_id,
      is_income: true, // This is income
      tags: validatedData.tags || [],
    };

    console.log("Preparing to insert transaction:", transactionData);

    // Insert the transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select();

    if (error) {
      console.error("Database error:", error);
      return { error: "Database error: " + error.message };
    }

    // Revalidate the transactions page and dashboard
    revalidatePath('/transactions');
    revalidatePath('/');

    console.log("Transaction added successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Server error in addIncome:", error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation error: ${errorMessage}` };
    }

    return {
      error: error instanceof Error
        ? `Error adding income: ${error.message}`
        : "Failed to add income: Unknown error"
    };
  }
}

// Get categories for the current user
export async function getCategories(type?: 'income' | 'expense') {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view categories" }
    }

    // Query to get categories
    let query = supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user.id},is_default.eq.true`)

    // Filter by type if provided
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { error: "Failed to fetch categories" }
  }
}

// Get all transactions with filtering options
export async function getTransactions({
  type,
  page = 1,
  limit = 20,
  search = '',
}: {
  type?: 'all' | 'income' | 'expense';
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  try {
    // Create Supabase client
    const supabase = await createActionClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to view transactions" }
    }

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Start building the query
    let query = supabase
      .from('transactions')
      .select(`
        id,
        amount,
        description,
        date,
        is_income,
        tags,
        created_at,
        categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(from, to)

    // Apply type filter if provided
    if (type === 'income') {
      query = query.eq('is_income', true)
    } else if (type === 'expense') {
      query = query.eq('is_income', false)
    }

    // Apply search filter if provided
    if (search) {
      query = query.ilike('description', `%${search}%`)
    }

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching transactions:", error)
      return { error: error.message }
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      // Apply the same filters for consistent count
      .ilike(search ? 'description' : 'id', search ? `%${search}%` : '*')
      .eq(type === 'income' ? 'is_income' : 'id', type === 'income' ? true : type === 'expense' ? false : '*')

    if (countError) {
      console.error("Error counting transactions:", countError)
    }

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    }
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return { error: "Failed to fetch transactions" }
  }
}
