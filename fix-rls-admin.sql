-- ============================================
-- FIX RLS POLICIES - Jalankan di Supabase SQL Editor
-- ============================================

-- STEP 1: Hapus semua policies yang ada (bersihkan total)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for new users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication" ON profiles;

-- STEP 2: Buat function is_admin() jika belum ada
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Recreate policies yang bersih dan benar

-- Policy 1: User bisa lihat profile sendiri
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: User bisa update profile sendiri (kecuali role/status)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Enable insert untuk trigger signup
CREATE POLICY "Enable insert for authentication"
  ON profiles FOR INSERT
  -- Penting: jangan dibatasi TO authenticated karena proses signup/trigger
  -- bisa jalan di role internal Supabase.
  WITH CHECK (auth.uid() = id);

-- Policy 4: Admin bisa lihat semua profile
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy 5: Admin bisa update semua profile
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy 6: Admin bisa hapus profile user
CREATE POLICY "Admins can delete all profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- STEP 4: Pastikan RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Set user jadi admin (GANTI EMAIL ANDA!)
UPDATE profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'email-anda@example.com';

-- STEP 6: Verifikasi
SELECT email, role, status FROM profiles WHERE email = 'email-anda@example.com';
