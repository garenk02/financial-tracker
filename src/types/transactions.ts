// Transaction related types

// Define a simplified category structure for transactions
export interface TransactionCategory {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  is_income: boolean;
  user_id?: string; // Optional as it might not be returned in some contexts
  category_id?: string;
  tags?: string[];
  created_at?: string;
  // The categories field can be either a single object or null
  // This is how it's used in the RecentTransactions component
  categories?: TransactionCategory | null;
}
