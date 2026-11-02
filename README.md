# Side Three — Ember London

A private app for our girls' trip to London for Dlala Thukzin at the Roundhouse (12 and 13 Feb 2027). It holds the trip, collects everything we shoot, and presses it into one b-roll film for our live-music documentary.

## Flows

| Route | What it does |
| --- | --- |
| `/` | Turntable home: the record spins, the countdown to takeoff, the *three steps forward* playlist (Spotify embed) |
| `/join` | Join the record with your name; your clips are credited to you |
| `/trip` | The girls, flights and stay, and the five days as a tracklist |
| `/trip/details` | Add your flight, landing time, the stay and check-in |
| `/fits` | Post your outfit for night one and night two |
| `/capture` | Live camera: record clips, tag the moment, Dlala shot list and counter |
| `/crate` | Everything we've shot, by day, plus sample tiles |
| `/notes` | Voice-note answers for the documentary and your one-line liner note |
| `/film` | Before Sunday: still recording. After: the film plays our clips in order, with length and grade |
| `/film/press` | The pressing reveal |
| `/film/drop` | Every clip of the set, played together as one grid |
| `/sleeve` | Your personal record sleeve, with your best clip as the cover |

## Where things are saved

For now everything stays on the phone it was shot on (IndexedDB and localStorage), so the app works with no backend. `supabase/schema.sql` has the tables and access rules for the shared version: trips, members and media, with uploads to a private `media` bucket.

## Run it

```bash
npm install
npm run dev
```

Camera and microphone need HTTPS or localhost. Deploy to Vercel and open the link on your phone, then Add to Home Screen.

## Still to fill in

Edit `lib/trip.ts`: the girls' names, flights, the stay and the Saturday plan.
