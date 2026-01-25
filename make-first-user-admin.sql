-- Script untuk Membuat User Pertama Menjadi Admin
-- Jalankan di Supabase SQL Editor

-- Cek apakah ada admin
SELECT COUNT(*) as admin_count
FROM profiles
WHERE role = 'admin';

-- Jika tidak ada admin (0), buat user pertama menjadi admin:
UPDATE profiles
SET role = 'admin', status = 'approved'
WHERE id = (
  SELECT id 
  FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verifikasi hasil
SELECT 
  id,
  email,
  username,
  role,
  status
FROM profiles
WHERE role = 'admin';
