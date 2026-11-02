# Side Three

A phone web app for **Ember London**, our Dlala Thukzin weekend (11–15 Feb 2027). Everyone shoots on their phone; the app files each clip by day and moment and presses it all into a b-roll film scored to *three steps forward*.

## Screens

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | Turntable | Countdown, live stats, the playlist on a spinning record |
| `/trip` | The trip | Your name on clips, flights, stay, one-day-per-track tracklist |
| `/capture` | Capture | Records video and photos, tags the moment, Dlala shot list |
| `/crate` | The crate | Every clip by day, with retagging, saving and deleting |
| `/film` | The film | 60s / 2:30 / 3 min reel with Ember, Night bus or Daylight grade; saves a 9:16 video and exports the original-quality archive (zip + manifest) |

## How data works right now

Clips are stored **on each phone** (IndexedDB). Nothing uploads yet. Shared uploads across the group are the next step (Supabase, per the PRD).

## Develop

```bash
npm install
npm run dev
```

Trip details (dates, venue, playlist, shot list) live in `lib/trip.ts`.

Deployed on Vercel from `main`.
