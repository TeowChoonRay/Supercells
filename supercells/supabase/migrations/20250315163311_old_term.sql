/*
  # Add avatar selection to users table

  1. Changes
    - Add avatar_type column to users table
    - Add check constraint to ensure valid avatar types
    - Update RLS policies to allow avatar selection
*/

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_type text 
CHECK (avatar_type IN ('visionary', 'strategist', 'socialite'));

-- Update policies to allow avatar selection
CREATE POLICY "Users can update their avatar"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);