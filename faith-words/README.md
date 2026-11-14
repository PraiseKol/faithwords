# Faith Words

A turn-based Bible crossword duel (modelled on the *Crossword Master* game system) with Christian words, clues and picture clues.

## Run it
It is a static site made of ES modules — no build step. Serve the folder over HTTP:

    python3 -m http.server 8080      # or: npx serve .

Open http://localhost:8080 (add `?debug` to the URL to expose `window.fwDebug` for testing).

## How the game works
- 7 × 10 arrow crossword. Blue cells hold clues (text, fill-in-the-blank `__`, or a picture/emoji). Tap a clue to zoom it and select its word.
- You hold 5 letter tiles. Tap a tile, then tap the cell where it belongs (or select a word first, then tap a tile). Wrong guesses are limited to 3 per turn.
- Confirm (✓) ends your turn; Pass skips; Swap changes tiles (paid) or "Swap and Pass" (free).
- **Scoring** (`js/engine.js`): 1 point per correct tile; the tile that finishes a word scores 1 + that word's length; using all 5 tiles in a turn adds +5.
- **Points → levels**: every round's points are added to your lifetime XP. Winning adds +25 XP (+15 on a daily puzzle). Level L → L+1 needs `100 + 50·(L−1)` XP.
- **Coins**: daily check-in pays `10 × (1 + 0.5·(day−1))` for day 1–7 (consecutive days; a missed day resets). Wins pay `20 × (1 + 0.5·(streak−1))` (max ×5); a loss resets the streak. Event puzzles pay +30 on a win.
- **Spend coins**: Hint (20) shows where your tiles fit; Word (40) reveals the selected word (row or column) with no points; Swap (15).
- All numbers live in `js/config.js`.

## Content
- `js/bank.js` — ~500 Bible / church words with clues (`ANSWER|clue|tags|emoji`). Edit and extend it.
- Puzzles are generated from a seed (`js/generator.js`): endless main puzzles, one per calendar day, and 6 puzzles per event (Heroes of Faith, Psalms & Praise, Christmas, Easter, Pentecost).
- Admin panel at `#/admin` (PIN in `js/config.js`, default `faith`): preview any puzzle, edit clues/emoji, add new words, export/import content JSON.
  The PIN is only a screen lock for the offline build — use the `is_admin` role in Supabase for real protection.

## Accounts, cloud save & leaderboard (Supabase) — already connected
This project is wired to the Supabase project **Faith Words** (`js/env.js`). The database (`supabase/schema.sql`) is applied: a `profiles` table with row-level security, an automatic profile on sign-up, and a leaderboard function.
- Me tab → Sign in / Sign up. Points, level, coins, streaks and purchases sync to the cloud; guests still play offline.
- By default Supabase asks new players to confirm their email. To skip that while testing: Supabase dashboard → Authentication → Providers → Email → turn off "Confirm email".
- **Live online matches** (Me → sign in, then Home → Play online): matchmaking pairs two signed-in players (`matchmake` function); the player whose turn it is saves the board, the other app gets it instantly through Supabase Realtime (with a slow poll as a safety net). If nobody is found in ~14 s you get a bot. An opponent idle for 90 s can be claimed as a win. You can rejoin an unfinished match from Home.
- **Shared content**: Admin → "Publish to all players" saves your clue edits and extra words to the `app_content` table; every app loads them on start. Only accounts with `profiles.is_admin = true` can publish (set it in the Supabase table editor after you sign up).
- **Server-side scoring**: the app records every action in a move log. The `fw-api` Edge Function (`supabase/functions/fw-api`) replays the log with the same rules code (`js/serverlogic.js`, `js/replay.js`) and itself awards XP, coins, streaks and puzzle progress; players cannot write those columns (only `name` and `save`). It also checks turn order, max 5 tiles per turn, plausible timing, a 40-matches-per-hour limit, and charges hints/words/swaps from the log. Live matches are guarded by a database trigger (only the player whose turn it is can add moves; the log is append-only). Updating the function: commit, then deploy `index.ts` with the new commit SHA in its import. Remaining limit: against the bot a determined cheater could still script legal moves in real time; online matches are symmetric.
- Theme (light / dark / auto), vibration and sound are in Me → Settings; a first-run how-to explains the rules.

## Android / iOS (Capacitor)
    npm run cap:init          # once; use appId com.faithwords.app
    npx cap add android && npx cap add ios
    npm run cap:sync          # copies the web app into www/ and syncs
    npx cap open android      # build the AAB for Google Play in Android Studio
    npx cap open ios          # Archive in Xcode (needs a Mac) for the App Store
Store submissions also need icons/splash screens, a privacy policy, and a Google Play / Apple Developer account.

## Tests
    node scripts/test-gen.mjs      # generator density/speed
    node scripts/test-engine.mjs   # plays 25 full simulated games
    node scripts/test-server.mjs   # server replay + cheating attempts
    node scripts/test-online.mjs   # two clients syncing a live match (15 games)
