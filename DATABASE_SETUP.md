# Database Setup Instructions

To complete the setup of the Construction Account Manager, you need to create the database tables in Supabase.

## Step 1: Go to Supabase Dashboard

1. Visit https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar

## Step 2: Run the Migration

Copy the entire contents of `/scripts/init-db.sql` and paste it into the SQL Editor, then click **Run**.

This will create:
- `entries` table with all necessary columns
- Row Level Security (RLS) policies
- Performance indexes

## Step 3: Verify the Setup

After running the SQL:

1. Go to **Table Editor** in the left sidebar
2. You should see the `entries` table in the list
3. Click on it to verify it has the correct columns

## Step 4: Test the Application

1. Return to your app
2. Sign up with a new email account at `/auth/sign-up`
3. Check your email for a confirmation link
4. Click the confirmation link to verify your email
5. You'll be redirected to the dashboard
6. Try adding an entry - it should save to the database

## What the SQL Does

- Creates an `entries` table to store construction account data
- Links entries to authenticated users via `user_id`
- Enables Row Level Security so users can only see their own entries
- Creates indexes for fast queries on `user_id`, `date`, and `category`

If you have any issues, check the Supabase dashboard for error messages.
