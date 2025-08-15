-- Waitlist Automation for Maziwa Smart
-- This script creates the waitlist table and automation triggers

-- Create waitlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  farm_name VARCHAR(255),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist notifications table
CREATE TABLE IF NOT EXISTS waitlist_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_id UUID REFERENCES waitlist(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_requested_at ON waitlist(requested_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_notifications_waitlist_id ON waitlist_notifications(waitlist_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_notifications_status ON waitlist_notifications(status);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waitlist (admins can see all, users can see their own)
CREATE POLICY "Admins can manage all waitlist entries" ON waitlist FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can view their own waitlist entry" ON waitlist FOR SELECT USING (
  auth.jwt() ->> 'email' = email
);

-- RLS Policies for waitlist notifications (admins only)
CREATE POLICY "Admins can manage waitlist notifications" ON waitlist_notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Function to notify admins of new waitlist entries
CREATE OR REPLACE FUNCTION notify_admin_new_waitlist()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for admins
  INSERT INTO waitlist_notifications (
    waitlist_id,
    notification_type,
    recipient_email,
    subject,
    message
  )
  SELECT 
    NEW.id,
    'new_waitlist_entry',
    'admin@maziwasmart.com',
    'New Waitlist Entry - ' || NEW.full_name,
    'A new user has joined the waitlist:
    
Name: ' || NEW.full_name || '
Email: ' || NEW.email || '
Phone: ' || COALESCE(NEW.phone_number, 'Not provided') || '
Farm: ' || COALESCE(NEW.farm_name, 'Not provided') || '
Location: ' || COALESCE(NEW.location, 'Not provided') || '
Requested: ' || NEW.requested_at || '

Please review and process this waitlist entry in the admin dashboard.';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify admins of new waitlist entries
DROP TRIGGER IF EXISTS trigger_notify_admin_new_waitlist ON waitlist;
CREATE TRIGGER trigger_notify_admin_new_waitlist
  AFTER INSERT ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_waitlist();

-- Function to update waitlist updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating waitlist timestamps
DROP TRIGGER IF EXISTS trigger_update_waitlist_updated_at ON waitlist;
CREATE TRIGGER trigger_update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();

-- Function to automatically approve waitlist entries (optional)
CREATE OR REPLACE FUNCTION auto_approve_waitlist()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve if certain conditions are met
  IF NEW.status = 'pending' AND (
    NEW.farm_name IS NOT NULL OR 
    NEW.phone_number IS NOT NULL
  ) THEN
    NEW.status = 'approved';
    NEW.processed_at = NOW();
    
    -- Create notification for approval
    INSERT INTO waitlist_notifications (
      waitlist_id,
      notification_type,
      recipient_email,
      subject,
      message
    ) VALUES (
      NEW.id,
      'waitlist_approved',
      NEW.email,
      'Welcome to Maziwa Smart - Account Approved!',
      'Congratulations! Your Maziwa Smart account has been approved.
      
You can now sign up and start using our dairy farm management system:
- Track milk production
- Manage cow health records
- Monitor feed consumption
- Generate reports

Visit our signup page to create your account: [SIGNUP_URL]

Welcome to the Maziwa Smart family!'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional trigger for auto-approval (uncomment if needed)
-- DROP TRIGGER IF EXISTS trigger_auto_approve_waitlist ON waitlist;
-- CREATE TRIGGER trigger_auto_approve_waitlist
--   BEFORE INSERT ON waitlist
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_approve_waitlist();

-- Insert sample admin notification settings
INSERT INTO app_settings (user_id, setting_key, setting_value, setting_type, description)
SELECT 
  id,
  'waitlist_notifications',
  '{"email_enabled": true, "sms_enabled": false, "auto_approve": false}',
  'admin',
  'Waitlist notification preferences'
FROM admin_users 
WHERE email = 'admin@maziwasmart.com'
ON CONFLICT (user_id, setting_key) DO NOTHING;

-- Success message
SELECT 
  'Waitlist automation setup completed successfully!' as message,
  'Tables created: waitlist, waitlist_notifications' as tables,
  'Triggers created: notify_admin_new_waitlist, update_waitlist_updated_at' as triggers,
  'RLS policies enabled for security' as security;
