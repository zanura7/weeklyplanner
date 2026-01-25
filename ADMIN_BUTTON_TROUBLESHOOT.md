# 🛡️ Cara Mengaktifkan Tombol Admin Dashboard

## Masalah
Tombol Admin Dashboard tidak muncul di header aplikasi.

## ✅ Solusi Cepat

### Langkah 1: Cek User Role Anda

Jalankan query ini di **Supabase Dashboard → SQL Editor**:

```sql
SELECT 
  email,
  username,
  role,
  status
FROM profiles
ORDER BY created_at DESC;
```

### Langkah 2: Jadikan User Anda Sebagai Admin

Ganti `email-anda@example.com` dengan email Anda, lalu jalankan:

```sql
UPDATE profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'email-anda@example.com';
```

### Langkah 3: Refresh Aplikasi

1. Refresh browser (`F5` atau `Ctrl+R`)
2. Login ulang jika perlu
3. **Tombol Admin 🛡️ akan muncul!**

## 📍 Lokasi Tombol Admin

Setelah role admin, tombol akan muncul di header:

```
[➕ New Activity]  [🛡️ Admin]  [✨ Weekly Overview]  [📥 Export]
```

Tombol Admin:
- Warna: **Biru/Indigo** (`bg-indigo-500`)
- Ikon: **Perisai (Shield)** 🛡️
- Teks: "Admin" (desktop) / hanya ikon (mobile)

## 🎯 Cara Membuka Admin Dashboard

Setelah tombol muncul:
1. **Klik tombol 🛡️ Admin**
2. Admin Dashboard terbuka!

## 🔧 Jika Masih Tidak Muncul

### Cek 1: Pastikan Logout dan Login Ulang
```sql
-- Cek role di database
SELECT * FROM profiles WHERE email = 'email-anda@example.com';
```
Pastikan `role` = 'admin' dan `status` = 'approved'

### Cek 2: Hapus Cache Browser
1. Buka DevTools (`F12`)
2. Klik kanan → "Clear cache"
3. Refresh halaman

### Cek 3: Buat User Pertama Menjadi Admin

Jika belum ada admin sama sekali, jalankan:

```sql
UPDATE profiles
SET role = 'admin', status = 'approved'
WHERE id = (
  SELECT id 
  FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);
```

## 📊 Verifikasi

Cek di Supabase SQL Editor:

```sql
SELECT email, role, status 
FROM profiles 
WHERE role = 'admin';
```

Seharusnya menampilkan user Anda dengan `role = 'admin` dan `status = 'approved'`.

---

**Setelah update role, refresh aplikasi dan tombol Admin akan muncul!** 🎉
