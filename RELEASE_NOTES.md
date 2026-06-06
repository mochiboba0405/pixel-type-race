# Pixel Type Race v1.0 Release Notes

Welcome to Pixel Type Race v1.0, the first full release of our cozy real-time multiplayer typing racer.

Race your friends through pixel-night streets, cheer each other on in the lobby, and keep typing even when your fingers get a little too excited. This release turns the project into a complete multiplayer game loop, from room creation to final match results.

## What's New

### Multiplayer Rooms

Create a room, share the join link, and race together in the same session. Each room keeps its own players, scenery, match settings, and race state.

### Realtime Player Sync

Players now appear live as they join, leave, type, finish, and move across the track. Progress bars, racer positions, round results, and match results sync across connected clients using Supabase Realtime.

### Multi-Round Races

Hosts can run matches across 1, 3, 5, 7, or 10 rounds. Each round gets a fresh prompt, round winners are tracked, and the final match winner is decided by round wins with average WPM as the tie-breaker.

### Room Chat

Every room includes a shared chat panel for lobby chatter, race reactions, and post-round celebrations. Messages include player names, avatars, timestamps, and stay neatly contained in their own scrollable panel.

### Difficulty Settings

Hosts can choose Easy, Medium, or Hard prompts before starting a match. Easy prompts are short and friendly, Medium adds longer sentences, and Hard brings punctuation, capitalization, numbers, and trickier words.

### Avatar Customization

Players can personalize their profile with display names, pixel avatars, and favorite scenery. Avatar categories include Girl, Boy, and Neutral styles, with hair, outfit, and accessory options for a cute game-room feel.

### Accuracy Scoring

Scoring now includes WPM, accuracy, finish time, round wins, average WPM, average accuracy, and match win rate. Final results make it clear who won each round and who took the whole match.

### Mistake-Tolerant Typing

Typing no longer stops when you make a mistake. Players can keep going through substitutions, missing characters, extra characters, punctuation mistakes, and capitalization errors.

The prompt display now uses edit-distance alignment, so one small typo does not turn the rest of the sentence red. Accuracy is calculated from the actual edit distance between what you typed and the prompt.

### Supabase + Vercel Deployment

Pixel Type Race is ready for real deployment with Vite, React, Supabase Realtime, and Vercel. Add your Supabase URL and anon key as Vercel environment variables, redeploy, and multiplayer rooms can sync across devices.

## v1.0 Highlights

- Real-time multiplayer typing races
- Shareable room codes and join links
- Host-controlled match start and next-round flow
- Live player progress and racer movement
- Multi-round scoring and final match results
- Built-in room chat
- Difficulty-based prompt pools
- Cute pixel avatars and scenery themes
- Mistake-tolerant typing with fair accuracy scoring
- Deployment-ready Supabase Realtime setup

## Thanks for Racing

Pixel Type Race v1.0 is built for friendly competition, typing practice, and tiny arcade energy. Grab a room link, pick an avatar, choose a difficulty, and race under the city lights.
