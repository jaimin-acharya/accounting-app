-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vendor', 'labour', 'material', 'labour_attendance', 'material_stock', 'other')),
  party_name TEXT NOT NULL,
  party_gstin TEXT,
  party_pan TEXT,
  quantity NUMERIC,
  subtotal_amount NUMERIC,
  tax_rate NUMERIC,
  tax_amount NUMERIC,
  amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy to allow users to select their own entries
CREATE POLICY "Users can select their own entries" ON entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own entries
CREATE POLICY "Users can insert their own entries" ON entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own entries
CREATE POLICY "Users can update their own entries" ON entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own entries
CREATE POLICY "Users can delete their own entries" ON entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- If you created the table before these columns existed, run this block too.
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS party_gstin TEXT,
  ADD COLUMN IF NOT EXISTS party_pan TEXT,
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC;
