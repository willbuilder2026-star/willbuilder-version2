# willbuilder2026-star

A minimal Next.js app wired to Supabase Auth, for testing real account
creation against the `willbuilder2026-star` Supabase project.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. In Supabase → **Project Settings → API**, copy the **Project URL** and
   **anon public** key into `.env.local`.
3. `npm install`
4. `npm run dev` — open http://localhost:3000

## Deploying

Push this repo to GitHub, then import it in Vercel. Add the same two
environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project's Settings →
Environment Variables before the first deploy.

## What this proves

- Signing up creates a real row in Supabase's `auth.users` table.
- "Create a draft Will row" inserts into the `wills` table using the
  signed-in user's own `user_id`, and Row Level Security means you'll
  only ever see your own rows back.

This is a starting point, not the full 15-stage questionnaire — the next
step is building one page per stage against the other tables in the
schema.
