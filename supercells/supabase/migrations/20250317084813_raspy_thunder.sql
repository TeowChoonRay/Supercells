/*
  # Create leads management system

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `company_name` (text)
      - `industry` (text)
      - `location` (text)
      - `employees` (text)
      - `website` (text)
      - `email` (text)
      - `phone` (text)
      - `status` (text)
      - `description` (text)
      - `logo_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_contact` (timestamptz)

  2. Security
    - Enable RLS on leads table
    - Add policies for:
      - Select: Users can read their own leads
      - Insert: Users can create new leads
      - Update: Users can update their own leads
      - Delete: Users can delete their own leads
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  company_name text NOT NULL,
  industry text,
  location text,
  employees text,
  website text,
  email text,
  phone text,
  status text CHECK (status IN ('New Lead', 'Qualified', 'Active', 'Closed', 'Lost')),
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_contact timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at);

-- Add trigger for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();