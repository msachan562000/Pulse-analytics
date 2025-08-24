# PulseAnalytics (Multi-Channel Dashboard)

Full-stack starter for a **Custom Analytics Dashboard** with OAuth connections to **Google Search Console**, **Facebook/Instagram**, and **LinkedIn**. Data is stored in **SQLite** via Prisma.

## Stack
- **API**: Node.js + Express + Passport OAuth + Prisma (SQLite) + node-cron
- **Providers**: Google (Search Console), Facebook (Pages & IG insights), LinkedIn (basic profile/org stats)
- **Web**: Vite + React

## Quickstart
```bash
unzip pulse-analytics.zip
cd pulse-analytics
npm install

# Configure environment
cp apps/api/.env.example apps/api/.env
# Fill GOOGLE_* , FACEBOOK_* , LINKEDIN_* client IDs/secrets and callback URLs

# DB & Prisma
npm --prefix apps/api run db:setup

# Run all
npm run dev
# API: http://localhost:4101
# Web: http://localhost:5177
```

### OAuth Redirect URIs (for localhost)
- Google:   http://localhost:4101/auth/google/callback
- Facebook: http://localhost:4101/auth/facebook/callback
- LinkedIn: http://localhost:4101/auth/linkedin/callback

> Facebook app in **Development** mode needs your user as a tester and these permissions: `pages_read_engagement`, `pages_show_list`, `instagram_basic`, `instagram_manage_insights`.  
> Search Console requires your Google user to have property access.  
> LinkedIn org stats require organization admin access.

# Pulse-analytics
