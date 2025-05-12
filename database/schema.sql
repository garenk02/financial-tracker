-- Financial Tracker Database Schema
-- This schema assumes auth.users is already set up by Supabase
--
-- Authentication Flow:
-- 1. User signs up through Supabase Auth
-- 2. A trigger automatically creates a profile for the new user
-- 3. The profile is linked to auth.users via the id foreign key
-- 4. Row Level Security (RLS) ensures users can only access their own data
-- 5. When a user is deleted, the ON DELETE CASCADE constraint ensures all their data is removed

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    preferred_currency TEXT DEFAULT 'usd',
    theme_preference TEXT DEFAULT 'dark',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT,
    icon TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recurring_transactions table
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_income BOOLEAN NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_income BOOLEAN NOT NULL,
    tags TEXT[] DEFAULT '{}',
    recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create financial_goals table
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    auto_allocate BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_contribution DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create monthly_budgets table
CREATE TABLE monthly_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    total_budget DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, month, year)
);

-- Create budget_categories table
CREATE TABLE budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES monthly_budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    allocated_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (budget_id, category_id)
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_monthly_budgets_user_id_month_year ON monthly_budgets(user_id, month, year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_categories_modtime
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_transactions_modtime
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_recurring_transactions_modtime
BEFORE UPDATE ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_financial_goals_modtime
BEFORE UPDATE ON financial_goals
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_monthly_budgets_modtime
BEFORE UPDATE ON monthly_budgets
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_budget_categories_modtime
BEFORE UPDATE ON budget_categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create function to generate recurring transactions
CREATE OR REPLACE FUNCTION generate_recurring_transactions()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new transaction based on the recurring transaction
    INSERT INTO transactions (
        user_id,
        amount,
        description,
        date,
        category_id,
        is_income,
        recurring_id
    ) VALUES (
        NEW.user_id,
        NEW.amount,
        NEW.description,
        NEW.start_date,
        NEW.category_id,
        NEW.is_income,
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate initial transaction when a recurring transaction is created
CREATE TRIGGER trigger_generate_recurring_transaction
AFTER INSERT ON recurring_transactions
FOR EACH ROW EXECUTE FUNCTION generate_recurring_transactions();

-- Create function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- If a transaction is marked as a contribution to a goal, update the goal's current_amount
    IF NEW.tags @> ARRAY['goal_contribution'] THEN
        -- Find goals that might be affected and update them
        UPDATE financial_goals
        SET
            current_amount = current_amount + CASE WHEN NEW.is_income THEN NEW.amount ELSE -NEW.amount END,
            is_completed = CASE WHEN current_amount + CASE WHEN NEW.is_income THEN NEW.amount ELSE -NEW.amount END >= target_amount THEN TRUE ELSE FALSE END,
            updated_at = NOW()
        WHERE
            user_id = NEW.user_id
            AND is_completed = FALSE
            AND NEW.tags @> ARRAY['goal:' || id::text];
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal progress when a transaction is created
CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_goal_progress();

-- Insert default categories
INSERT INTO categories (name, type, color, icon, is_default) VALUES
('Salary', 'income', '#4CAF50', 'money-bill', TRUE),
('Investments', 'income', '#8BC34A', 'chart-line', TRUE),
('Gifts', 'income', '#CDDC39', 'gift', TRUE),
('Other Income', 'income', '#FFC107', 'plus-circle', TRUE),
('Housing', 'expense', '#F44336', 'home', TRUE),
('Transportation', 'expense', '#FF5722', 'car', TRUE),
('Food', 'expense', '#FF9800', 'utensils', TRUE),
('Utilities', 'expense', '#9C27B0', 'bolt', TRUE),
('Healthcare', 'expense', '#E91E63', 'medkit', TRUE),
('Entertainment', 'expense', '#3F51B5', 'film', TRUE),
('Shopping', 'expense', '#2196F3', 'shopping-bag', TRUE),
('Education', 'expense', '#03A9F4', 'graduation-cap', TRUE),
('Personal Care', 'expense', '#00BCD4', 'spa', TRUE),
('Travel', 'expense', '#009688', 'plane', TRUE),
('Subscriptions', 'expense', '#673AB7', 'calendar-alt', TRUE),
('Miscellaneous', 'expense', '#607D8B', 'ellipsis-h', TRUE);

-- Create function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    display_name_val TEXT;
BEGIN
    -- Safely extract display name with error handling
    BEGIN
        -- Try to get the name from metadata if available
        IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'full_name' THEN
            display_name_val := NEW.raw_user_meta_data->>'full_name';
        ELSE
            display_name_val := NEW.email;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Fallback to email if there's any error
        display_name_val := NEW.email;
    END;

    -- Insert a new profile for the new user
    INSERT INTO profiles (id, display_name)
    VALUES (NEW.id, display_name_val);

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RETURN NEW; -- Still return NEW to allow the user creation to succeed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- The profile should be automatically deleted due to the ON DELETE CASCADE constraint
    -- But we can add additional cleanup logic here if needed in the future
    RETURN OLD;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_user_deletion function: %', SQLERRM;
    RETURN OLD; -- Still return OLD to allow the user deletion to succeed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to call the function when a user is deleted
CREATE TRIGGER on_auth_user_deleted
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_user_deletion();

-- Create function to handle user updates (like email changes)
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If email changed and display_name was based on email, update it
    BEGIN
        IF NEW.email <> OLD.email AND (
            SELECT display_name FROM profiles WHERE id = NEW.id
        ) = OLD.email THEN
            UPDATE profiles
            SET display_name = NEW.email,
                updated_at = NOW()
            WHERE id = NEW.id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but continue
        RAISE LOG 'Error updating profile display_name: %', SQLERRM;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_user_update function: %', SQLERRM;
    RETURN NEW; -- Still return NEW to allow the user update to succeed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to call the function when a user is updated
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can only see and modify their own profile
CREATE POLICY profiles_policy ON profiles
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow the trigger function to create profiles
CREATE POLICY profiles_insert_policy ON profiles FOR INSERT
    WITH CHECK (true);  -- The function runs with SECURITY DEFINER so this is safe

-- Allow the trigger function to update profiles
CREATE POLICY profiles_update_policy ON profiles FOR UPDATE
    USING (id = auth.uid() OR EXISTS (
        SELECT 1 FROM auth.users WHERE id = profiles.id
    ));

-- Categories: users can see default categories and their own custom categories
CREATE POLICY categories_select_policy ON categories FOR SELECT
    USING (is_default OR user_id = auth.uid());

-- Categories: users can only modify their own custom categories
CREATE POLICY categories_modify_policy ON categories FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY categories_update_policy ON categories FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY categories_delete_policy ON categories FOR DELETE
    USING (user_id = auth.uid());

-- Transactions: users can only see and modify their own transactions
CREATE POLICY transactions_policy ON transactions
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Recurring Transactions: users can only see and modify their own recurring transactions
CREATE POLICY recurring_transactions_policy ON recurring_transactions
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Financial Goals: users can only see and modify their own goals
CREATE POLICY financial_goals_policy ON financial_goals
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Monthly Budgets: users can only see and modify their own budgets
CREATE POLICY monthly_budgets_policy ON monthly_budgets
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Budget Categories: users can only see and modify budget categories for their own budgets
CREATE POLICY budget_categories_policy ON budget_categories
    USING (budget_id IN (SELECT id FROM monthly_budgets WHERE user_id = auth.uid()))
    WITH CHECK (budget_id IN (SELECT id FROM monthly_budgets WHERE user_id = auth.uid()));

-- Create a function to get the current user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT *
    FROM profiles
    WHERE id = auth.uid();
$$;

-- Create a function to check if the current user has a profile
CREATE OR REPLACE FUNCTION current_user_has_profile()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
    );
$$;
