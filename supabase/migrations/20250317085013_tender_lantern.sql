/*
  # Insert example leads data
  
  1. Changes
    - Insert example companies as leads
    - Each lead includes:
      - Company details
      - Contact information
      - Status
      - Description
      - Logo URL
*/

DO $$ 
DECLARE
  user_id uuid;
BEGIN
  -- Get the first user from the users table as an example
  SELECT id INTO user_id FROM users LIMIT 1;
  
  -- Only proceed if we have a user
  IF user_id IS NOT NULL THEN
    -- Insert example leads
    INSERT INTO leads (
      user_id,
      company_name,
      industry,
      location,
      employees,
      website,
      email,
      phone,
      status,
      description,
      logo_url,
      last_contact
    ) VALUES 
    (
      user_id,
      'TechVision Solutions',
      'Software Development',
      'San Francisco, CA',
      '100-250',
      'techvision.com',
      'contact@techvision.com',
      '+1 (555) 123-4567',
      'Active',
      'Leading provider of enterprise software solutions with a focus on AI and machine learning applications.',
      'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      now() - interval '2 days'
    ),
    (
      user_id,
      'GreenEnergy Dynamics',
      'Renewable Energy',
      'Austin, TX',
      '250-500',
      'greenenergy.com',
      'info@greenenergy.com',
      '+1 (555) 234-5678',
      'New Lead',
      'Innovative renewable energy solutions provider specializing in solar and wind power technologies.',
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      now() - interval '1 day'
    ),
    (
      user_id,
      'HealthTech Innovations',
      'Healthcare Technology',
      'Boston, MA',
      '500-1000',
      'healthtech.com',
      'contact@healthtech.com',
      '+1 (555) 345-6789',
      'Qualified',
      'Cutting-edge healthcare technology solutions improving patient care and medical operations.',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      now()
    );
  END IF;
END $$;