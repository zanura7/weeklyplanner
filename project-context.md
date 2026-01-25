# Project Context

## Project Name
Weekly Activity Planner

## Vision
A mobile-first weekly activity planner that helps sales professionals track their daily activities, manage tasks, and receive AI-powered coaching insights to improve their performance.

## Current Phase
Implementation

## Key Decisions
- **Mobile-First Architecture**: Prioritized mobile UX with responsive desktop support
- **Supabase as Backend**: Chosen for real-time sync, authentication, and database management
- **AI Integration**: Google Gemini API for weekly performance analysis and coaching
- **Category-Based Activities**: Four distinct activity categories (Income Generating, Supporting, Self Development, Personal)
- **Daily Metrics Tracking**: Sales pipeline metrics (Opens, Presents, Follows, Closes)

## Technical Stack
- **Frontend**: React 18, Vite 5, TailwindCSS 3
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (optional)
- **Deployment**: Vercel/Netlify ready

## Active Documents
- PRD: `_bmad-output/planning-artifacts/prd.md` (to be created)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` (to be created)
- Current Epic: (to be defined)
- Current Story: (to be defined)

## Constraints
- **Mobile Performance**: Must work smoothly on mid-range mobile devices
- **Offline Capability**: Limited - requires internet for Supabase sync
- **Data Privacy**: User data isolated via RLS policies
- **AI Cost**: Gemini API is optional feature; app works without it
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Project Structure
```
weekly-planner/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Route pages
│   ├── lib/           # Supabase client
│   └── utils/         # Helper functions
├── public/            # Static assets
├── docs/              # Documentation
├── _bmad-output/      # BMAD framework artifacts
│   ├── planning-artifacts/
│   └── implementation-artifacts/
└── *.sql              # Database schema files
```

## Development Workflow
1. **Feature Development**: Use BMAD Method for new features
2. **Bug Fixes**: Use Quick Flow for minor fixes
3. **Documentation**: Update docs/ as features are implemented
4. **Testing**: Manual testing on mobile devices required
5. **Deployment**: Vercel/Netlify with environment variables

## BMAD Configuration
- **Track**: BMad Method (products and platforms)
- **Scale Level**: Level 2-3 (Medium to Large features)
- **Primary Agent**: Developer (Amelia) for implementation
- **Supporting Agents**: Product Manager (John), Architect (Winston)

## Known Issues & Improvements
- Performance indexes added (see `supabase-performance-indexes.sql`)
- Admin role management (see `supabase-admin-schema.sql`)
- Migration guide available (see `MIGRATION_GUIDE.md`)

## Success Metrics
- User engagement (daily active users)
- Activity completion rate
- AI feature adoption (if Gemini API configured)
- Mobile performance (Lighthouse scores)
- Data sync reliability
