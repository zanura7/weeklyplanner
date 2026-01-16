# Admin Dashboard - Task List

## Phase 1: Database Setup
- [x] 1.1 Create profiles table in Supabase with columns: id, email, username, mobile, role, status, expiry_date, created_at, updated_at
- [x] 1.2 Set up Row Level Security (RLS) policies for profiles table
- [x] 1.3 Create trigger to auto-create profile on user signup
- [ ] 1.4 Create initial admin user (manual step - run SQL in Supabase)

## Phase 2: Authentication Updates
- [x] 2.1 Update SignUp form - add mobile field
- [x] 2.2 Add forgot password functionality
- [x] 2.3 Show pending approval message for unapproved users
- [x] 2.4 Block access for denied/expired users

## Phase 3: Admin Dashboard UI
- [x] 3.1 Create AdminDashboard component with user list table
- [x] 3.2 Add approve/deny buttons for pending users
- [x] 3.3 Add expiry date picker for each user
- [x] 3.4 Add role assignment dropdown (Admin/User)
- [ ] 3.5 Add export report button for each user
- [x] 3.6 Add search/filter functionality

## Phase 4: Role-Based Routing
- [x] 4.1 Add role check after login
- [x] 4.2 Route admin to AdminDashboard
- [x] 4.3 Route user to WeeklyPlanner (existing app)
- [x] 4.4 Add navigation between admin dashboard and planner for admins

## Phase 5: Testing & Polish
- [ ] 5.1 Test complete user signup → approval flow
- [ ] 5.2 Test expiry date enforcement
- [ ] 5.3 Test admin role assignment
- [ ] 5.4 Test export functionality
- [ ] 5.5 Deploy to production
