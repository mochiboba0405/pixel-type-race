# Supabase Realtime Setup

This game uses Supabase Realtime for multiplayer rooms.

## What Supabase Features Are Used

This MVP does not need database tables.

It uses ephemeral Realtime channels:

- Presence: tracks who is currently connected to a room.
- Broadcast: sends game events between players in the same room.

No SQL migrations are required for the current app.

## Room Channel Name

Every player in a room subscribes to the exact same channel name:

```txt
typing-race-room:ROOMCODE
```

Example:

```txt
typing-race-room:ABCD12
```

The room code is normalized to uppercase before building the channel name.

## Realtime Events

The app currently sends these channel events:

- `presence`: player list and public profile data
- `race-start`: host starts the first round or next round
- `player-progress`: live WPM, accuracy, progress, and finish status
- `race-finish`: round winner and round results
- `match-results`: final match winner, score table, and round history
- `match-config`: host changes number of rounds
- `scenery-change`: host changes shared scenery

## Create a Supabase Project

1. Go to `https://supabase.com`.
2. Sign in or create an account.
3. Click `New project`.
4. Choose an organization.
5. Enter a project name, for example `type-race-game`.
6. Set a database password. Save it somewhere private.
7. Choose the closest region to your players.
8. Click `Create new project`.
9. Wait for the project to finish provisioning.

## Get Project URL and Anon Key

1. Open your Supabase project.
2. Go to `Project Settings`.
3. Open `Data API`.
4. Copy the Project URL.
5. Copy the public anon key.

Use only the anon public key in this frontend app.

Do not use the service role key in Vite, GitHub, or browser code.

## Local Environment File

Create `.env.local` in the project root:

```txt
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Then restart the dev server:

```bash
npm run dev
```

The app logs Realtime connection details in the browser console.

## Vercel Environment Variables

In Vercel:

1. Open your Vercel project.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Select the environments you want, usually Production, Preview, and Development.
6. Save.
7. Redeploy the project.

Environment variable changes do not apply to old deployments until you redeploy.

## Testing Multiplayer

1. Deploy to Vercel after setting env vars.
2. Open the deployed site in two different browsers or devices.
3. Create a room on device A.
4. Copy the room link.
5. Join from device B.
6. Open the browser console on both devices.
7. Confirm both devices log the same:

```txt
roomCode
channelName
subscription status: SUBSCRIBED
presence sync
player join
```

The shared channel should look like:

```txt
typing-race-room:ABCD12
```

If the deployed site says Realtime is offline, check Vercel environment variables and redeploy.

## Production Notes

This app intentionally keeps room state temporary. If every player leaves, the room disappears.

Useful future upgrades:

- Add a `match_results` table for saved match history.
- Add user authentication for permanent accounts.
- Add Row Level Security for saved profile or match tables.
