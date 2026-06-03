# Project Guide

This app is split into small files so each part has one clear job.

## Root files

- `package.json`: Lists the app dependencies and scripts. `npm run dev` starts Vite, `npm run build` checks and builds the app, and `npm run preview` serves the built files locally.
- `index.html`: The single HTML page Vite uses. React mounts into `<div id="root"></div>`.
- `tsconfig.json`: TypeScript settings. Strict mode helps catch common beginner mistakes.
- `vite.config.ts`: Turns on the React plugin for Vite.
- `vercel.json`: Sends every deployed route back to `index.html`, so `/room/ROOMID` links work on Vercel.
- `.env.example`: Shows the Supabase environment variables the app expects.
- `README.md`: Setup, local running, Supabase, and Vercel deployment notes.
- `PROJECT_GUIDE.md`: This file.

## Public assets

- `public/favicon.svg`: Browser tab icon.
- `public/pixel/backgrounds/layer-clouds.svg`: Repeating cloud layer for the parallax background.
- `public/pixel/backgrounds/layer-hills.svg`: Hill and ground layer for the parallax background.
- `public/pixel/backgrounds/layer-sparkles.svg`: Small sparkle layer for the sky.

## App entry

- `src/main.tsx`: Starts React and imports global CSS.
- `src/app/App.tsx`: A tiny router. It shows `HomePage` at `/` and `RoomPage` at `/room/:roomId`.
- `src/vite-env.d.ts`: Gives TypeScript names for Vite environment variables.

## Pages

- `src/pages/HomePage.tsx`: The first screen. It shows profile setup, create room, and join room.
- `src/pages/RoomPage.tsx`: The full room flow. It handles lobby, countdown, active race, round results, match results, local stats, and score display.

## Layout and scenery

- `src/components/layout/PageShell.tsx`: Shared page wrapper with the hero area and background.
- `src/components/scenery/ParallaxBackground.tsx`: The theme-based parallax scene. It reads the current scenery and draws the sky, moon, skyline, trees, lamps, sidewalk, and tiny humans.
- `src/components/scenery/SceneryPicker.tsx`: The shared scenery control. Home uses it before creating a room, and the host uses it in the lobby.

## Profile components

- `src/components/profile/ProfileSetup.tsx`: Lets the player edit username, avatar, favorite scenery, and shows upgraded lifetime stats.
- `src/components/profile/AvatarPicker.tsx`: Renders categorized Girl, Boy, and Neutral avatar choices with category tabs.
- `src/components/profile/PixelAvatar.tsx`: Draws a pixel avatar with CSS blocks, including hairstyle and accessory variants.
- `src/components/profile/ProfileModal.tsx`: Shows another player's public profile when their lobby avatar is clicked.

## Room components

- `src/components/room/JoinRoomForm.tsx`: Takes a room code and navigates to that room.
- `src/components/room/RoomInvite.tsx`: Shows the room code and copyable room link.
- `src/components/room/PlayerList.tsx`: Shows connected players, host badge, progress, and WPM. Player avatars are clickable to open profiles.
- `src/components/room/HostControls.tsx`: Shows the host-only start button or waiting status.

## Race components

- `src/components/race/RaceTrack.tsx`: Draws player lanes and moves avatars based on progress.
- `src/components/race/TypingPrompt.tsx`: Colors each prompt character as correct, wrong, current, or untouched.
- `src/components/race/TypingInput.tsx`: The textarea where the player types during a race.
- `src/components/race/StatsBar.tsx`: Shows live WPM, accuracy, progress, and elapsed time.
- `src/components/race/RoundResultsScreen.tsx`: Shows the winner of one round plus every player's WPM, accuracy, and finish time.
- `src/components/race/MatchResultsScreen.tsx`: Shows the final match winner, match scoreboard, and round history.
- `src/components/race/MatchScoreboard.tsx`: Shows the current score across rounds while players stay in the room.

## Feature logic

- `src/features/profile/profileTypes.ts`: TypeScript shapes for avatar categories, hairstyles, accessories, profiles, and local stats.
- `src/features/profile/profileStorage.ts`: Loads, migrates, and saves profile data in local storage, and gives each tab a session player ID.
- `src/features/profile/useLocalProfile.ts`: React hook for reading, editing, and updating local profile stats.
- `src/features/room/roomUtils.ts`: Creates room IDs, remembers which local session is host, stores the local room scenery, and builds room URLs.
- `src/features/race/raceTypes.ts`: TypeScript shapes for race phases, players, shared public profile data, scenery changes, round counts, round results, match scores, starts, finishes, and metrics.
- `src/features/race/raceUtils.ts`: Picks unused prompts for each round, creates match and round IDs, sorts players, and calculates match winners.
- `src/features/race/typingMetrics.ts`: Calculates WPM, accuracy, progress, and time.
- `src/features/race/useRaceRoom.ts`: The multiplayer hook. It connects to Supabase Realtime, tracks presence, shares public profile details, syncs the shared scenery, broadcasts race starts, broadcasts finishes, and has demo mode when Supabase is not configured.

## Shared libraries and data

- `src/lib/ids.ts`: Makes random player and room IDs.
- `src/lib/storage.ts`: Small JSON helpers for browser local storage.
- `src/lib/supabaseClient.ts`: Creates the Supabase client if env vars are present.
- `src/data/avatarOptions.ts`: The available pixel avatars, grouped into Girl, Boy, and Neutral categories with hairstyle/accessory metadata.
- `src/data/prompts.ts`: Beginner-friendly typing prompts.
- `src/data/sceneryThemes.ts`: The list of scenery themes. Each theme has a name, mood, scene type, and colors used by the parallax background.

## Styles

- `src/styles/globals.css`: Browser resets, dark arcade typography, inputs, selects, and headings.
- `src/styles/theme.css`: Glassy panels, neon buttons, profile UI, avatar category tabs, profile modal, room UI, scenery controls, prompt UI, and responsive rules.
- `src/styles/pixel.css`: Pixel avatar styling, hairstyle/accessory variants, theme-based parallax background styling, tiny humans, street scenery, and race track styling.

## Shared scenery state

- Home starts with a random scenery and lets the player choose or randomize it.
- Creating a room saves that scenery for the host.
- The host shares the scenery through Supabase Presence and broadcasts changes with `scenery-change`.
- Joiners read the host's scenery from room presence, so everyone sees the same background.

## Multi-round matches

- The host chooses 1, 3, 5, 7, or 10 rounds before starting.
- `useRaceRoom` starts each round with a different prompt and broadcasts `race-start`.
- When the first player finishes a round, `useRaceRoom` creates a round result snapshot and broadcasts `race-finish`.
- Between rounds, the host sees `Next Round`; non-host players wait.
- After the final round, match scores are sorted by round wins, then average WPM as the tie breaker.
- `Play Again` starts a fresh match at round 1 while keeping everyone in the same room.

## Profile upgrades

- Local profiles now include username, avatar, favorite scenery, lifetime wins, total races, highest WPM, average WPM, average accuracy, and win rate.
- Avatar choices are grouped as Girl, Boy, and Neutral.
- Girl and Boy avatars use hairstyle/accessory metadata so CSS can draw different pixel silhouettes.
- Public profile data is sent through room presence, which lets the profile modal show another player without adding login or database tables.

## Supabase

- `supabase/README.md`: Explains why the MVP does not need database tables and how Realtime channels are used.
