/*
  # Add lead scoring fields
  
  1. Changes
    - Add lead_score column to store AI-generated score (0-10)
    - Add ai_interest_level to store AI interest analysis (0-10)
    - Add ai_evidence to store evidence of AI interest
    - Add analysis_notes for additional AI insights
    - Add last_analyzed_at timestamp
    
  2. Data Safety
    - Use nullable columns to avoid data loss
    - Add default values where appropriate
    - Maintain existing data
*/

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lead_score integer CHECK (lead_score >= 0 AND lead_score <= 10),
ADD COLUMN IF NOT EXISTS ai_interest_level integer CHECK (ai_interest_level >= 0 AND ai_interest_level <= 10),
ADD COLUMN IF NOT EXISTS ai_evidence text,
ADD COLUMN IF NOT EXISTS analysis_notes text,
ADD COLUMN IF NOT EXISTS last_analyzed_at timestamptz;