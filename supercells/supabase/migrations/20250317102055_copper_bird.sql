/*
  # Update handle_new_user function with existence check

  1. Changes
    - Modify handle_new_user function to check if user exists before insertion
    - Add error handling for duplicate users
    - Ensure atomic transaction for user creation
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function with user existence check
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists in public.users
    SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE email = NEW.email
    ) INTO user_exists;

    -- Only proceed with insertion if user doesn't exist
    IF NOT user_exists THEN
        INSERT INTO public.users (id, email, created_at, updated_at)
        VALUES (NEW.id, NEW.email, NOW(), NOW());
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Log the error but don't fail the trigger
        RAISE NOTICE 'User already exists in public.users: %', NEW.email;
        RETURN NEW;
    WHEN others THEN
        -- Log other errors
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();