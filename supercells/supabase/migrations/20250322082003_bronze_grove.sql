/*
  # Update lead status handling and automation
  
  1. Changes
    - Add "Converted" to valid lead statuses
    - Add trigger to automatically set status based on lead score
    - Update existing leads to match new status rules
    
  2. Status Rules
    - Lead score >= 85: "Qualified"
    - Lead score < 85: "New Lead"
    - After message sent: "Converted"
    - Manual setting: "Lost"
    
  3. Data Safety
    - Preserve existing "Converted" and "Lost" statuses
    - Only update status for leads that need reclassification
*/

-- Update status check constraint to include "Converted"
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('New Lead', 'Qualified', 'Converted', 'Lost'));

-- Create function to update status based on lead score
CREATE OR REPLACE FUNCTION update_lead_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update status if it's not already Converted or Lost
  IF NEW.status NOT IN ('Converted', 'Lost') THEN
    -- Set status based on lead score
    IF NEW.lead_score >= 85 THEN
      NEW.status = 'Qualified';
    ELSE
      NEW.status = 'New Lead';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status
CREATE OR REPLACE TRIGGER update_lead_status_trigger
  BEFORE INSERT OR UPDATE OF lead_score ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_status();

-- Update existing leads to match new status rules
UPDATE leads
SET status = CASE
  WHEN lead_score >= 85 THEN 'Qualified'
  ELSE 'New Lead'
END
WHERE status NOT IN ('Converted', 'Lost');