-- Update custom_designs table to properly link with users table
-- This migration modifies the custom_designs table to match the users table structure

USE seven_four_clothing;

-- First, let's add the new columns
ALTER TABLE custom_designs 
ADD COLUMN first_name varchar(50) AFTER customer_name,
ADD COLUMN last_name varchar(50) AFTER first_name,
ADD COLUMN email varchar(100) AFTER last_name;

-- Update existing data to migrate customer_name to first_name and last_name
-- Split customer_name into first and last name (basic split on first space)
UPDATE custom_designs 
SET first_name = SUBSTRING_INDEX(customer_name, ' ', 1),
    last_name = CASE 
        WHEN LOCATE(' ', customer_name) > 0 
        THEN SUBSTRING(customer_name, LOCATE(' ', customer_name) + 1)
        ELSE ''
    END,
    email = customer_email
WHERE customer_name IS NOT NULL;

-- Add foreign key constraint to link with users table
-- Note: This will only work if all email addresses in custom_designs exist in users table
ALTER TABLE custom_designs 
ADD CONSTRAINT fk_custom_designs_user 
FOREIGN KEY (email) REFERENCES users(email) ON UPDATE CASCADE;

-- Create index on email for better performance
CREATE INDEX idx_custom_designs_email ON custom_designs(email);

-- Now we can drop the old columns (but let's keep them for now in case we need rollback)
-- ALTER TABLE custom_designs DROP COLUMN customer_name;
-- ALTER TABLE custom_designs DROP COLUMN customer_email;

-- For now, let's just mark the old columns as deprecated by renaming them
ALTER TABLE custom_designs 
CHANGE COLUMN customer_name customer_name_deprecated varchar(255),
CHANGE COLUMN customer_email customer_email_deprecated varchar(255);
