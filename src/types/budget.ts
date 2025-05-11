// Budget related types
export interface Budget {
  id: string;
  total_budget: number;
  month: number;
  year: number;
  user_id: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface CategoryBudget {
  id: string;
  allocated_amount: number;
  categories: Category; // This is a single Category object, not an array
  spent?: number;
  // budget_id and category_id are not included in the returned data
  // from getCategoryBudgetsWithSpending
}

export interface SpendingData {
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
}

export interface CategoryWithSpending {
  id: string;
  name: string;
  color: string;
  amount: number;
}
