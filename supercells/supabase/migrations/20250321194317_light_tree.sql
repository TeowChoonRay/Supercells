/*
  # Add lead details and compatibility metrics

  1. New Tables
    - `lead_details`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `decision_maker` (text) - Name and role of decision maker
      - `recent_activity` (jsonb) - Array of recent AI-related activities
      - `compatibility_metrics` (jsonb) - Compatibility test scores
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure users can only access their own leads' details
*/

-- Create lead_details table
CREATE TABLE IF NOT EXISTS lead_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  decision_maker text,
  recent_activity jsonb DEFAULT '[]'::jsonb,
  compatibility_metrics jsonb DEFAULT '{
    "negotiation_style_match": 0,
    "decision_making_speed": 0,
    "budget_alignment": 0,
    "business_needs_match": 0
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lead_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own lead details"
  ON lead_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_details.lead_id
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lead details"
  ON lead_details
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_details.lead_id
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own lead details"
  ON lead_details
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_details.lead_id
      AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_details.lead_id
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own lead details"
  ON lead_details
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_details.lead_id
      AND leads.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS lead_details_lead_id_idx ON lead_details(lead_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_lead_details_updated_at
  BEFORE UPDATE ON lead_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();