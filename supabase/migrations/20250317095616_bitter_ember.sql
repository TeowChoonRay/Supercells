/*
  # Add function to check if user exists in auth schema
  
  1. New Functions
    - check_user_exists: Checks if a user exists in auth.users by email
    
  2. Security
    - Function is accessible to authenticated and anon users
    - Only checks email existence, no other user data is exposed
*/

CREATE OR REPLACE FUNCTION check_user_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE email = p_email
    );
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO authenticated;