# Admin Dashboard Access Guide

## 🎯 Admin Dashboard sudah TERINTEGRASI!

Admin Dashboard sudah ada di dalam aplikasi dan **siap digunakan**. Anda tidak perlu membuat file baru.

## ✅ Cara Akses Admin Dashboard

### Opsi 1: Melalui Tombol Admin (Paling Mudah)

1. Login ke aplikasi
2. Pastikan user Anda memiliki role `admin` di database
3. Klik tombol **🛡️ Admin** di header aplikasi (tombol berwarna biru/indigo)
4. Admin Dashboard langsung terbuka!

### Opsi 2: Update Role ke Admin

Jika belum admin, jalankan query ini di Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin', status = 'approved' 
WHERE email = 'email-anda@example.com';
```

### Opsi 3: Route Langsung (Sudah Ditambahkan!)

Saya sudah menambahkan route `/admin` di main.jsx.

Sekarang Anda bisa akses langsung:
- **URL:** `http://my.speedplan.space/admin`
- **Akan:** Cek auth → Cek role admin → Buka Admin Dashboard

## 🔐 Keamanan

Route `/admin` sudah dilengkapi:
- ✅ Cek authentication (harus login)
- ✅ Cek admin role (hanya admin bisa akses)
- ✅ Auto redirect jika bukan admin:
  - Belum login → ke `/login`
  - Bukan admin → alert + redirect ke `/app`

## 📊 Fitur Admin Dashboard

1. **User Management**
   - Lihat semua user
   - Search user (email, username, phone)
   - Filter berdasarkan status

2. **User Actions**
   - Approve pending user
   - Deny user
   - Update role (admin/user)
   - Set expiry date
   - Delete user (+ semua data)

3. **Statistics**
   - Total users
   - Pending users
   - Approved users
   - Denied users

## 🚀 Testing

Setelah deploy:
1. Buka `http://my.speedplan.space/admin`
2. Login dengan akun admin
3. Admin Dashboard terbuka!

---

**Semua sudah siap!** 🎉

URL Admin: `http://my.speedplan.space/admin`
Atau klik tombol 🛡️ di dalam aplikasi.
