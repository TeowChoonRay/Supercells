/*
  # Remove analysis columns from leads table
  
  1. Changes
    - Remove lead_score column
    - Remove ai_interest_level column
    - Remove ai_evidence column
    - Remove analysis_notes column
    - Remove last_analyzed_at column
*/

ALTER TABLE leads
DROP COLUMN IF EXISTS lead_score,
DROP COLUMN IF EXISTS ai_interest_level,
DROP COLUMN IF EXISTS ai_evidence,
DROP COLUMN IF EXISTS analysis_notes,
DROP COLUMN IF EXISTS last_analyzed_at;