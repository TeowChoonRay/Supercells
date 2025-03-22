/*
  # Update storage bucket policies for avatars

  1. Changes
    - Drop existing policies before recreating them
    - Update policy checks to use STARTS_WITH for more reliable filename checks
    - Maintain same security model but with improved implementation
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
END $$;

-- Create a new public bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  STARTS_WITH(name, auth.uid()::text)
);

CREATE POLICY "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  STARTS_WITH(name, auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'avatars' AND
  STARTS_WITH(name, auth.uid()::text)
);

CREATE POLICY "Allow users to delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  STARTS_WITH(name, auth.uid()::text)
);

CREATE POLICY "Allow public to view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');