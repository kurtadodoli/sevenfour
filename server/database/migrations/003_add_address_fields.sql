-- Add address fields to users table
ALTER TABLE users
ADD COLUMN street_address VARCHAR(255) NULL,
ADD COLUMN apartment_suite VARCHAR(100) NULL,
ADD COLUMN city VARCHAR(100) NULL,
ADD COLUMN state_province VARCHAR(100) NULL,
ADD COLUMN postal_code VARCHAR(20) NULL,
ADD COLUMN country VARCHAR(100) NULL,
ADD COLUMN profile_picture_url VARCHAR(255) NULL;
