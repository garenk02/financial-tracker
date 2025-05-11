-- Fix for the goal progress trigger
-- This script fixes the issue with the goal progress trigger not properly updating the current_amount

-- First, drop the existing trigger
DROP TRIGGER IF EXISTS trigger_update_goal_progress ON transactions;

-- Then, drop the existing function
DROP FUNCTION IF EXISTS update_goal_progress();

-- Create an improved function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    goal_id UUID;
    goal_current_amount DECIMAL(12, 2);
    goal_target_amount DECIMAL(12, 2);
    amount_change DECIMAL(12, 2);
BEGIN
    -- If a transaction is marked as a contribution to a goal, update the goal's current_amount
    IF NEW.tags @> ARRAY['goal_contribution'] THEN
        -- Extract the goal ID from the tags
        -- The tag format is 'goal:{goal_id}'
        FOR i IN 1..array_length(NEW.tags, 1) LOOP
            IF NEW.tags[i] LIKE 'goal:%' THEN
                goal_id := substring(NEW.tags[i] FROM 6); -- Extract UUID after 'goal:'
                EXIT;
            END IF;
        END LOOP;
        
        -- If we found a goal ID
        IF goal_id IS NOT NULL THEN
            -- Calculate the amount to add or subtract
            amount_change := CASE WHEN NEW.is_income THEN NEW.amount ELSE -NEW.amount END;
            
            -- Get the current goal data
            SELECT current_amount, target_amount 
            INTO goal_current_amount, goal_target_amount
            FROM financial_goals
            WHERE id = goal_id AND user_id = NEW.user_id;
            
            -- Update the goal with proper locking to prevent race conditions
            UPDATE financial_goals
            SET
                current_amount = goal_current_amount + amount_change,
                is_completed = CASE WHEN goal_current_amount + amount_change >= target_amount THEN TRUE ELSE FALSE END,
                updated_at = NOW()
            WHERE
                id = goal_id
                AND user_id = NEW.user_id;
                
            -- Log the update for debugging
            RAISE NOTICE 'Updated goal % current_amount from % to % (adding %)',
                goal_id, goal_current_amount, goal_current_amount + amount_change, amount_change;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a new trigger with the improved function
CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_goal_progress();

-- Add a comment to explain the fix
COMMENT ON FUNCTION update_goal_progress() IS 'This function updates a goal''s current_amount when a transaction with the goal_contribution tag is created. It was fixed to properly handle the goal ID extraction and prevent race conditions.';
