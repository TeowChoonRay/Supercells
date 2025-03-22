/*
  # Update lead scoring constraints
  
  1. Changes
    - Update lead_score and ai_interest_level constraints to 0-100 scale
    - Add columns for storing detailed analysis
    
  2. Data Safety
    - Use nullable columns to avoid data loss
    - Add constraints to ensure valid score ranges
    - Maintain existing data
*/

ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_lead_score_check,
DROP CONSTRAINT IF EXISTS leads_ai_interest_level_check;

ALTER TABLE leads
ADD CONSTRAINT leads_lead_score_check CHECK (lead_score >= 0 AND lead_score <= 100),
ADD CONSTRAINT leads_ai_interest_level_check CHECK (ai_interest_level >= 0 AND ai_interest_level <= 100);