// Recurring transaction related types
import { TransactionCategory } from './transactions';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  is_income: boolean;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string | null;
  user_id?: string; // Optional as it might not be returned in some contexts
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  // The categories field can be either a single object or null
  categories?: TransactionCategory | null;
}

// Helper function to get the next date based on frequency
export function getNextDate(date: Date, frequency: RecurringFrequency): Date {
  const nextDate = new Date(date);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
}

// Helper function to format frequency for display
export function formatFrequency(frequency: RecurringFrequency): string {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return frequency;
  }
}

// Helper function to check if a recurring transaction is due
export function isRecurringTransactionDue(
  recurringTransaction: RecurringTransaction, 
  lastTransactionDate: Date | null
): boolean {
  const today = new Date();
  const startDate = new Date(recurringTransaction.start_date);
  
  // If end date exists and is in the past, the recurring transaction is not due
  if (recurringTransaction.end_date) {
    const endDate = new Date(recurringTransaction.end_date);
    if (endDate < today) {
      return false;
    }
  }
  
  // If there's no last transaction, check if start date is today or in the past
  if (!lastTransactionDate) {
    return startDate <= today;
  }
  
  // Calculate the next due date based on the last transaction date
  const nextDueDate = getNextDate(lastTransactionDate, recurringTransaction.frequency);
  
  // Check if the next due date is today or in the past
  return nextDueDate <= today;
}
