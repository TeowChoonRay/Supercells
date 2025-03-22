/*
  # Update avatar types with new tokens

  1. Changes
    - Update avatar_type values from emoji-based to icon-based tokens
    - Safely migrate existing data
    - Update check constraint
    
  2. Migration Safety
    - Update data before adding constraints
    - Use temporary constraint during transition
    - Handle NULL values appropriately
*/

-- First remove the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_avatar_type_check;

-- Add a temporary constraint that allows both old and new values
ALTER TABLE users ADD CONSTRAINT users_avatar_type_temp_check 
  CHECK (avatar_type IS NULL OR avatar_type IN (
    'visionary', 'strategist', 'socialite',
    'brain', 'target', 'handshake'
  ));

-- Update existing data to map to new values
UPDATE users 
SET avatar_type = CASE
  WHEN avatar_type = 'visionary' THEN 'brain'
  WHEN avatar_type = 'strategist' THEN 'target' 
  WHEN avatar_type = 'socialite' THEN 'handshake'
  ELSE avatar_type
END
WHERE avatar_type IN ('visionary', 'strategist', 'socialite');

-- Remove temporary constraint
ALTER TABLE users DROP CONSTRAINT users_avatar_type_temp_check;

-- Add final constraint with only new values
ALTER TABLE users ADD CONSTRAINT users_avatar_type_check 
  CHECK (avatar_type IS NULL OR avatar_type IN ('brain', 'target', 'handshake'));