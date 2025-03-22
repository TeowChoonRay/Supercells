/*
  # Add AI analysis columns to leads table

  1. Changes
    - Add lead_score column (0-10 scale)
    - Add ai_interest_level column (0-10 scale)
    - Add ai_evidence column for storing evidence text
    - Add analysis_notes column for additional notes
    - Add last_analyzed_at timestamp
    - Add constraints to ensure valid score ranges
*/

-- Add new columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS lead_score integer,
ADD COLUMN IF NOT EXISTS ai_interest_level integer,
ADD COLUMN IF NOT EXISTS ai_evidence text,
ADD COLUMN IF NOT EXISTS analysis_notes text,
ADD COLUMN IF NOT EXISTS last_analyzed_at timestamptz;

-- Add constraints to new columns
ALTER TABLE leads 
ADD CONSTRAINT leads_lead_score_check CHECK (lead_score >= 0 AND lead_score <= 10),
ADD CONSTRAINT leads_ai_interest_level_check CHECK (ai_interest_level >= 0 AND ai_interest_level <= 10);