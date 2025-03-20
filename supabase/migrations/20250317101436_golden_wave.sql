/*
  # Fix user existence check function

  1. Changes
    - Drop existing function
    - Create new function that properly checks user existence
    - Add proper error handling
    - Ensure proper schema access
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_user_exists(text);

-- Create new function with proper implementation
CREATE OR REPLACE FUNCTION check_user_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM users
        WHERE email = p_email
    ) INTO user_exists;

    RETURN user_exists;
EXCEPTION
    WHEN others THEN
        -- Log error details if needed
        RAISE NOTICE 'Error checking user existence: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Revoke existing permissions
REVOKE ALL ON FUNCTION check_user_exists(TEXT) FROM PUBLIC;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO authenticated;