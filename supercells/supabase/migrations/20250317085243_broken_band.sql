/*
  # Add profile fields to users table

  1. Changes
    - Add display_name column
    - Add profile_image_url column
    - Update RLS policies
*/

-- Add new columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Update policies to allow profile updates
CREATE POLICY "Users can update their profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);