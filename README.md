# Pixel Type Race

A beginner-friendly realtime multiplayer typing race game built with React, Vite, Supabase Realtime, and Vercel.

## What it includes

- Local player profile with display name, pixel avatar, and stats
- Room creation with shareable join links
- Host-only start button
- Multi-round matches with host-selected round counts
- Supabase Realtime presence for live player lists
- Supabase Realtime broadcasts for race starts and winners
- Live progress, WPM, accuracy, and winner screen
- Round results, match score, and final match winner
- Cute pixel-style parallax background layers

## Run locally

Install dependencies:

```bash
npm install
```

Copy the example environment file:

```bash
cp .env.example .env.local
```

Add your Supabase values to `.env.local`, then start the app:

```bash
npm run dev
```

The app also has a local demo mode when Supabase env vars are missing. Demo mode lets one player try the race flow, but realtime multiplayer requires Supabase.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo into Vercel.
3. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.

`vercel.json` sends all routes back to `index.html`, so room links like `/room/ABCD12` work after deployment.

## Supabase setup

No database tables are required for this MVP. It uses ephemeral Realtime channels:

- Presence tracks connected players in each room.
- Broadcast sends host start and race finish events.

Create a Supabase project, copy the Project URL and anon public key, then place them in your environment variables.
