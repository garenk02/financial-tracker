// Goal related types
export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  is_completed: boolean;
  auto_allocate: boolean;
  monthly_contribution?: number | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  _percentage?: number; // Optional pre-calculated percentage
}
