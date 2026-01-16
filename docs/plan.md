# Admin Dashboard - Implementation Plan

## Overview
Implement an admin dashboard system for the Weekly Planner app that allows administrators to manage user access, approvals, and permissions.

## Architecture

### User Roles
1. **Admin** - Full access to admin dashboard, can manage users
2. **User** - Regular user access to weekly planner features

### User Lifecycle
```
Sign Up → Pending Approval → Admin Approves/Denies → Active/Denied
                                    ↓
                           Set Expiry Date
                                    ↓
                           User can access app until expiry
```

## Features

### 1. Authentication Updates
- Update sign up form with additional fields (mobile)
- Add forgot password functionality
- Role-based login routing (Admin → Dashboard, User → Planner)

### 2. Admin Dashboard
- View all users list
- Approve/Deny pending users
- Set usage duration (expiry date) per user
- Export user reports
- Assign/change user roles

### 3. Access Control
- Users with "pending" status cannot access planner
- Users with expired access cannot access planner
- Only admins can access admin dashboard

## Database Schema Changes

### profiles table (new/updated)
```sql
- id (uuid, references auth.users)
- email (text)
- username (text)
- mobile (text)
- role (text: 'admin' | 'user')
- status (text: 'pending' | 'approved' | 'denied')
- expiry_date (date, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

## Tech Stack
- Frontend: React (existing)
- Backend: Supabase (existing)
- Auth: Supabase Auth (existing)
- Database: PostgreSQL via Supabase

## Security Considerations
- Row Level Security (RLS) for profiles table
- Admin-only access to user management functions
- Secure password reset flow via Supabase
