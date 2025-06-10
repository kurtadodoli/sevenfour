-- Add index for profile search
CREATE INDEX idx_user_profile_search ON users (first_name, last_name, email, phone, city, country);
