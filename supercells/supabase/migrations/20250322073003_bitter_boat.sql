/*
  # Add email logging system

  1. New Tables
    - `email_sent`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `lead_id` (uuid, foreign key to leads)
      - `company_name` (text)
      - `industry` (text)
      - `message_content` (text)
      - `message_type` (text) - 'email' or 'linkedin'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Select: Users can read their own sent emails
      - Insert: Users can log their own sent emails
*/

-- Create email_sent table
CREATE TABLE IF NOT EXISTS email_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  lead_id uuid REFERENCES leads(id) NOT NULL,
  company_name text NOT NULL,
  industry text,
  message_content text NOT NULL,
  message_type text CHECK (message_type IN ('email', 'linkedin')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_sent ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own sent emails"
  ON email_sent
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log own sent emails"
  ON email_sent
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS email_sent_user_id_idx ON email_sent(user_id);
CREATE INDEX IF NOT EXISTS email_sent_lead_id_idx ON email_sent(lead_id);
CREATE INDEX IF NOT EXISTS email_sent_created_at_idx ON email_sent(created_at);