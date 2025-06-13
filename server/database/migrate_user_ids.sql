-- Update database schema to use long random user IDs
-- This script will update the existing schema and migrate data

-- First, check current data
SELECT 'Current users before migration:' as status;
SELECT user_id, email, role FROM users;

-- Create a backup table
CREATE TABLE users_backup AS SELECT * FROM users;

-- Add a new column for the long random ID
ALTER TABLE users ADD COLUMN new_user_id BIGINT UNSIGNED;

-- Generate random IDs for existing users (16-digit numbers)
UPDATE users SET new_user_id = FLOOR(1000000000000000 + RAND() * 8999999999999999);

-- Make sure all IDs are unique (regenerate if duplicates exist)
SET @duplicate_count = (SELECT COUNT(*) FROM (SELECT new_user_id, COUNT(*) as cnt FROM users GROUP BY new_user_id HAVING cnt > 1) as dups);

WHILE @duplicate_count > 0 DO
    UPDATE users u1 
    SET new_user_id = FLOOR(1000000000000000 + RAND() * 8999999999999999)
    WHERE u1.new_user_id IN (
        SELECT new_user_id FROM (
            SELECT new_user_id FROM users 
            GROUP BY new_user_id 
            HAVING COUNT(*) > 1
        ) as duplicates
    );
    SET @duplicate_count = (SELECT COUNT(*) FROM (SELECT new_user_id, COUNT(*) as cnt FROM users GROUP BY new_user_id HAVING cnt > 1) as dups);
END WHILE;

-- Update foreign key references (if any exist)
-- Note: Update any other tables that reference user_id here

-- Drop the old primary key and foreign key constraints
ALTER TABLE users DROP PRIMARY KEY;

-- Drop the old user_id column
ALTER TABLE users DROP COLUMN user_id;

-- Rename the new column to user_id
ALTER TABLE users CHANGE new_user_id user_id BIGINT UNSIGNED NOT NULL;

-- Add the primary key back
ALTER TABLE users ADD PRIMARY KEY (user_id);

-- Show results
SELECT 'Users after migration:' as status;
SELECT user_id, email, role FROM users;

-- Drop the backup table (uncomment if you're sure the migration worked)
-- DROP TABLE users_backup;
