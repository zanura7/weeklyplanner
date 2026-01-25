-- Cek apakah user Anda sudah role admin
-- Jalankan query ini di Supabase SQL Editor

-- 1. Cek semua user
SELECT 
  id,
  email,
  username,
  role,
  status,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Jika email Anda bukan admin, update role:
-- UPDATE profiles 
-- SET role = 'admin', status = 'approved' 
-- WHERE email = 'email-anda@example.com';

-- 3. Cek setelah update
SELECT * FROM profiles WHERE email = 'email-anda@example.com';
