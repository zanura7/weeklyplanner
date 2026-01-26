# CLAUDE.md - AI Agent Context for Weekly Planner

## Project Overview

**Weekly Activity Planner** is a mobile-first React application for tracking sales activities, daily tasks, and AI-powered coaching insights.

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Real-time)
- AI Integration: OpenRouter API for coaching features
- Deployment: Vercel/Netlify

## Repository Structure

```
weekly-planner/
├── src/
│   ├── App.jsx                 # Main application component with calendar grid
│   ├── main.jsx                # Application entry point
│   ├── pages/                  # Page components
│   │   ├── LoginPage.jsx       # Authentication
│   │   ├── RegisterPage.jsx    # User registration
│   │   └── Dashboard.jsx       # Main dashboard (if exists)
│   ├── api/                    # API integration layer
│   │   └── aiClient.js         # OpenRouter AI integration
│   ├── utils/                  # Utility functions
│   │   └── backupService.js    # Data backup functionality
│   └── ErrorBoundary.jsx       # Error handling component
├── public/                     # Static assets
├── docs/                       # Project documentation
├── .env                        # Environment variables (gitignored)
├── .env.example               # Environment template
├── ENV_SETUP.md               # Environment setup guide
└── package.json               # Dependencies and scripts
```

## Key Features

### 1. Weekly Calendar Grid
- 7 days × 15 hours (7:00 - 21:00) view
- Time slots with 30-minute increments
- Mobile-first responsive design
- Click-to-edit activity functionality

### 2. Activity Categories
- **Income Generating**: Sales activities that generate revenue
- **Supporting**: Support tasks for business operations
- **Self Development**: Learning and improvement activities
- **Personal**: Personal time and activities

### 3. Daily Tasks
- 6-item priority list per day
- Task completion tracking
- AI-powered task suggestions (via OpenRouter)

### 4. Sales Metrics
- **Opens**: Number of prospects opened
- **Presents**: Number of presentations given
- **Follows**: Number of follow-ups completed
- **Closes**: Number of sales closed

### 5. AI Coach Feature
- Weekly performance analysis
- Personalized coaching insights
- Powered by OpenRouter API
- Timeout handling for long-running requests

## Database Schema (Supabase)

### Tables
1. **appointments** - Calendar activities
   - id, user_id, day_index, slot_index, category, remarks
   - RLS enabled (user-specific access)

2. **tasks** - Daily task lists
   - id, user_id, day_index, task_text, completed
   - RLS enabled

3. **metrics** - Daily sales metrics
   - id, user_id, day_index, opens, presents, follows, closes
   - RLS enabled

4. **weekly_overviews** - Weekly summaries
   - id, user_id, week_start, remarks, ai_analysis
   - RLS enabled

### Row Level Security (RLS)
- All tables have RLS policies enabled
- Users can only access their own data
- Authenticated users can read/write their records

## Important Implementation Details

### Calendar Grid Rendering
- **Slot Index Fix**: Use `originalSlotIndex` calculated from `TIME_SLOTS.findIndex()` instead of filtered `slotIndex` parameter
- This ensures correct activity mapping when rendering filtered time slots
- See `src/App.jsx` around line 4013 for implementation

### Error Handling
- Error Boundary component wraps the entire app
- Graceful fallback UI for errors
- Console logging in development mode

### API Integration (OpenRouter)
- Located in `src/api/aiClient.js`
- Timeout handling: 30-second timeout with fallback
- Retry logic for failed requests
- Environment variable: `VITE_OPENROUTER_API_KEY`

### State Management
- React hooks (useState, useEffect)
- No external state management library
- Supabase real-time subscriptions for live updates

## Environment Variables

### Required for Production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### Setup Instructions
See `ENV_SETUP.md` for detailed environment configuration guide.

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server
```

### Build for Production
```bash
npm run build        # Build production bundle
npm run preview      # Preview production build
```

### Deployment
```bash
vercel --prod        # Deploy to Vercel production
```

## Security Best Practices

1. **Never commit API keys** to repository
2. **Use environment variables** for all sensitive data
3. **Enable RLS** on all Supabase tables
4. **Validate user input** before database operations
5. **Use Supabase Auth** for authentication
6. **Never expose service role key** in frontend code

## Known Issues & Fixes

### Fixed: Activities Cannot Be Edited
- **Problem**: Clicking on activities didn't open edit dialog
- **Root Cause**: Incorrect slot index calculation when filtering TIME_SLOTS
- **Solution**: Calculate `originalSlotIndex` using `findIndex()` on original array
- **Commit**: 06bf40f

### Fixed: API Key Exposure
- **Problem**: OpenRouter API key stored in .env file
- **Solution**: Removed from .env, managed through Vercel environment variables
- **Commit**: dc64ba8

## Performance Considerations

- Build chunk size warning: 513.58 kB (can be optimized with code splitting)
- Supabase queries optimized with proper indexes
- Lazy loading for large components
- Image optimization for mobile devices

## Testing Checklist

Before deploying changes:
- [ ] Test calendar grid rendering on mobile
- [ ] Test activity creation/editing/deletion
- [ ] Test task completion tracking
- [ ] Test sales metrics input
- [ ] Test AI coach feature
- [ ] Test authentication flow
- [ ] Verify RLS policies are working
- [ ] Check console for errors
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)

## Deployment Platforms

### Vercel (Primary)
- **Production URL**: https://weekly-planner.vercel.app
- **Project**: adiwardanabisnis-7195s-projects/weekly-planner
- **Environment Variables**: Configured in Vercel dashboard

### Alternative: Netlify
- Configuration in `netlify.toml`
- Environment variables set in Netlify dashboard

## AI Agent Guidelines

When working on this codebase:

1. **Understand the mobile-first approach** - All components should be responsive
2. **Preserve RLS policies** - Never disable Row Level Security
3. **Use environment variables** - Never hardcode credentials
4. **Test slot index logic** - Calendar functionality depends on correct indexing
5. **Check error boundaries** - Ensure proper error handling
6. **Verify AI timeouts** - OpenRouter API has 30-second timeout
7. **Maintain code style** - Follow existing patterns and conventions
8. **Test on mobile** - Primary use case is mobile devices

## Common Tasks

### Add New Activity Category
1. Update `CATEGORIES` constant in `src/App.jsx`
2. Add color scheme for new category
3. Update database schema if needed
4. Test category selection UI

### Modify AI Coaching Prompts
1. Edit prompts in `src/api/aiClient.js`
2. Test with various scenarios
3. Handle timeout appropriately
4. Update documentation

### Add New Metric Type
1. Update `metrics` table schema
2. Modify UI in metrics section
3. Update state management
4. Test data persistence

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

## Support

For issues or questions:
1. Check `ENV_SETUP.md` for environment configuration
2. Review `MIGRATION_GUIDE.md` for database setup
3. See `INTEGRATION_STATUS.md` for feature status
4. Check Supabase dashboard for database issues
5. Review Vercel deployment logs

---

**Last Updated**: 2026-01-25  
**Version**: 1.1.0  
**Maintainer**: Development Team
