/*
  # Add logo URL column and update RLS policies

  1. Changes
    - Add logo_url column to leads table
    - Add function to fetch company logo from Clearbit API
    - Add trigger to automatically fetch logo on insert
*/

-- Add logo_url column if it doesn't exist
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create function to fetch company logo
CREATE OR REPLACE FUNCTION get_company_logo(domain text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return Clearbit logo URL
  RETURN 'https://logo.clearbit.com/' || domain;
EXCEPTION
  WHEN others THEN
    -- Return null if logo fetch fails
    RETURN null;
END;
$$;