# Weekly Activity Planner

A mobile-first weekly activity planner built with React, Vite, and Supabase. Track your sales activities, daily tasks, and get AI-powered coaching insights.

## Features

- **Weekly Calendar Grid**: Visual 7-day × 15-hour schedule (7:00 - 21:00)
- **Activity Categories**: Income Generating, Supporting, Self Development, Personal
- **Daily Tasks**: 6-item priority list per day with AI generation
- **Sales Metrics**: Track Opens, Presents, Follows, and Closes daily
- **AI Coach**: Get weekly performance analysis powered by Google Gemini
- **Mobile-First Design**: Optimized for mobile devices with responsive desktop view
- **Real-time Sync**: Data syncs across devices via Supabase
- **Export Reports**: Generate HTML reports for weekly reviews

## Prerequisites

- Node.js 18+
- Supabase account
- Google Cloud account (for Gemini AI - optional)

## Setup

1. **Clone and install dependencies**:
   ```bash
   cd weekly-planner
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure Supabase**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Go to **SQL Editor** and run the contents of `supabase-schema.sql`
   - Go to **Authentication → Providers** and enable:
     - Google (requires Google OAuth credentials)
     - Anonymous sign-ins (optional, for guest mode)
   - Go to **Settings → API** and copy:
     - Project URL → `VITE_SUPABASE_URL`
     - anon/public key → `VITE_SUPABASE_ANON_KEY`

4. **Configure Gemini AI (Optional)**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Add it to your `.env` file as `VITE_GEMINI_API_KEY`

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Database Schema

Run the `supabase-schema.sql` file in your Supabase SQL Editor. It creates:
- `appointments` - Calendar activities
- `tasks` - Daily task lists
- `metrics` - Daily sales metrics (O/P/F/R)
- `weekly_overviews` - Weekly remarks and AI analysis

All tables have Row Level Security (RLS) enabled so users can only access their own data.

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

## Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import your repository
4. Add environment variables in Netlify dashboard
5. Deploy

## License

MIT
