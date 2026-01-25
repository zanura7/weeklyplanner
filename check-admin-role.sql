-- Check your user role in the database
-- Run this in Supabase SQL Editor

SELECT 
  id,
  email,
  username,
  role,
  status,
  expiry_date
FROM profiles
ORDER BY created_at DESC;
