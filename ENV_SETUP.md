# Environment Variables Setup Guide

## 🔒 Security Best Practices

**NEVER commit actual API keys or secrets to the repository!**

## Local Development Setup

### 1. Environment File Setup

The `.env` file is gitignored and contains your local development credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API Key (for AI coaching features)
# Get your API key from: https://openrouter.ai/keys
# IMPORTANT: Set this in Vercel environment variables for production
VITE_OPENROUTER_API_KEY=
```

### 2. Getting API Keys

#### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

#### OpenRouter (AI Features)
1. Go to [OpenRouter API Keys](https://openrouter.ai/keys)
2. Create a new API key
3. **For local development only:** Add to `.env` file
4. **For production:** Add to Vercel environment variables (see below)

## Production Deployment (Vercel)

### Setting Environment Variables in Vercel

1. Go to your [Vercel Project Dashboard](https://vercel.com/dashboard)
2. Select your project: `weekly-planner`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key | Production, Preview |

5. Click **Save**
6. **Redeploy** your project to apply changes

### Using Vercel CLI

```bash
# Add environment variable
vercel env add VITE_OPENROUTER_API_KEY production

# List all environment variables
vercel env ls

# Pull environment variables to .env.local (for local testing)
vercel env pull .env.local
```

## Production Deployment (Netlify)

### Setting Environment Variables in Netlify

1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Add the following variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key |

5. Click **Save**
6. **Redeploy** your site

## Security Checklist

✅ **DO:**
- Use `.env` for local development only
- Add `.env` to `.gitignore`
- Set environment variables in Vercel/Netlify dashboard
- Rotate API keys if accidentally exposed
- Use different keys for development and production

❌ **DON'T:**
- Commit `.env` file to repository
- Hardcode API keys in source code
- Share API keys in public repositories
- Use service role keys in frontend code
- Commit `.env.local` or `.env.production` files

## Verifying Setup

### Check if API key is accessible in production

1. Open your deployed application
2. Open browser DevTools (F12) → Console
3. Check for environment variable errors
4. Test AI coaching feature to ensure it works

### Common Issues

**Issue:** API features not working in production
**Solution:** 
- Verify environment variables are set in Vercel/Netlify dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

**Issue:** Build errors
**Solution:**
- Ensure all required environment variables have placeholder values
- Add `VITE_` prefix to all client-side variables

## Need Help?

- Supabase: https://supabase.com/docs
- OpenRouter: https://openrouter.ai/docs
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
