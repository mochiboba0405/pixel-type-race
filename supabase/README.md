# Supabase Realtime Notes

This MVP does not need SQL migrations.

It uses Supabase Realtime channels directly:

- `presence` keeps the player list fresh.
- `broadcast` sends race start and race finish messages.

Room channels are named like this:

```txt
typing-race:ROOMID
```

For a production version, useful next steps would be:

- Save completed race results in a table.
- Add authentication for persistent profiles.
- Add row-level security policies for saved data.
