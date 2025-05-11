# Database Schema and Fixes

This directory contains the database schema and fixes for the financial tracker application.

## Schema

The main schema file is `schema.sql`, which contains the complete database schema for the application.

## Fixes

### Goal Progress Trigger Fix

The file `fix-goal-trigger.sql` contains a fix for the goal progress trigger. This fix addresses an issue where the goal percentage wasn't updating correctly after adding funds to a goal.

#### Issue Description

The original trigger had the following issues:
1. It was using a complex CASE expression that could lead to race conditions
2. It wasn't properly extracting the goal ID from the tags array
3. It wasn't properly handling the current_amount update

#### How to Apply the Fix

To apply the fix, run the SQL commands in `fix-goal-trigger.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `fix-goal-trigger.sql`
5. Run the query

This will:
1. Drop the existing trigger and function
2. Create an improved function with better error handling and logging
3. Create a new trigger with the improved function

#### Verification

After applying the fix, you can verify it works by:

1. Adding funds to a goal
2. Checking that the goal's current_amount and percentage are updated correctly
3. Checking the Supabase logs for the "Updated goal" notice

## Application Changes

The application code has also been updated to work with the fixed trigger:

1. In `src/utils/goals/actions.ts`, the `addFundsToGoal` function now:
   - Creates a transaction with the goal tag first
   - Lets the database trigger update the goal's current_amount
   - Fetches the updated goal data to return to the client

This ensures that the goal percentage is always updated correctly when adding funds.
