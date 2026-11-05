# Architecture

## Reused from Dugout Dad and Dugout Lab (inspected 2026-11-02)

Same stack and shape: Vite + React + TypeScript PWA, Dexie (IndexedDB), fflate ZIP backups with SHA-256 manifests, hash router, vite-plugin-pwa precaching, GitHub Pages deploy through `.github/workflows/pages.yml`, zero-dependency static server, vitest with fake-indexeddb, Playwright acceptance walks. Reused as code: `Sheet.tsx` (bottom sheet, toast, confirm), `ErrorBoundary.tsx`, `hash.ts`, `server.cjs` (port 4175), the Pages workflow, the guided-tour component (new stops), the PIN pattern (now a parent-mode gate instead of a whole-app lock), the two-step share sheet, the merge-by-record restore with a kept-newer-here report, the design tokens (new palette and three themes).

Not reused: anything baseball. No drills, no roster, no generator, no scoring.

## Separation from the other two apps

- Own repository and Pages path, so its own manifest `id`, `start_url` and service-worker scope (`/athletic-lab/`). Own icon (navy, orange bolt, lime arc) and name.
- Own IndexedDB database name (`athletic-lab`). Dugout Dad is `dugout-dad`, Dugout Lab is `dugout-lab`. On an iPhone each home-screen app has its own storage container anyway; on a laptop under `doc-jpg.github.io` they share an origin but not a database. The acceptance walk checks that no Dugout database is touched.
- No file format is shared. An Athletic Lab backup is refused by the other apps and vice versa (format string check).

## Data (src/engine/types.ts, src/db/db.ts)

One Dexie database, schema version 1, tables: athlete, settings, exercises, exerciseStatus, templates, sessions, sportsLogs, checkIns, flags, journal, habits, messages, achievements, missions, supplements, meta. Every record carries `createdAt`/`updatedAt` or `ts`; backup merge keeps the newer copy and never deletes. Sessions snapshot the exercise name and catalog version per item, so history stays readable after a library change. A schema bump adds a `version(n)` line; `tests/persistence.test.ts` proves version-1 rows open after a bump.

Library seeding (`seedLibrary`): exercises and templates with `source: 'library'` are inserted once and refreshed only when `CATALOG_VERSION` / `TEMPLATES_VERSION` moves and the record was never edited (updatedAt === createdAt). Custom and edited items are left alone.

## Readiness engine (src/engine/readiness.ts)

Pure function. Inputs: the day, the check-in, every sports log and session in reach (it filters), the strength-days setting, and the session the program would offer on a green day. Order of evaluation:

1. Body-part blocks from today's and yesterday's logs (heavy throwing or pitching: arm and shoulder; hard basketball, running, tournament: legs, jump, sprint), plus Pitch Smart rest days from any pitch count in the last four days, plus the cumulative-load ratio (7-day load against the 28-day weekly average).
2. Red (pain, sick, dizzy): return at once with no offer, Foundations off, and parent alerts.
3. Orange: tournament, day load 6 or more, two activities adding to 4 or more, energy "wiped out", very sore, or load ratio 1.5 or more. Offer: Recovery; Foundations optional.
4. Yellow: day load 3 to 5, heavy day yesterday, low energy, sleep 2 or less, a little sore, six active days in a row, or load ratio 1.3 or more. Offer: Light day, reduced (one set each).
5. Green: the planned strength session unless strength was inside 48 hours or the weekly cap is reached (then Athletic coordination), and coordination becomes Light day if legs are blocked.

Every branch appends a plain-words reason. Alerts become `flags` for the parent dashboard.

## Program and progression (src/engine/program.ts)

`programPhase` from the program start: weeks 1 to 2 learn, 3 to 4 build, 5 to 6 refine, then four-week blocks (three develop weeks, one review week). `buildSession` turns a template into a session: disabled exercises out; a weighted exercise without a form check swapped for a substitute (first substitute, else the easier version, that is not blocked and needs no check); an exercise carrying a blocked tag swapped the same way or dropped; jumps and sprints dropped on a reduced day. `decideDose` starts from the template dose, moves to what was last done (bounded by the template below and the exercise cap above), and adds two reps, or five seconds, or one set, only when the last two sessions of that exercise were fully completed and felt easy, in a phase that allows it; a hard session eases back toward the template. Growth-spurt mode and review weeks hold. Loads: `allowedLoads` is body weight plus whatever the parent approved for that exercise; `lastLoad` remembers the last choice but never returns a load that is no longer allowed. Nothing in the engine raises a load.

## Messages, badges, missions (src/engine/habits.ts, achievements.ts)

Messages: a pool with a fit function per message (basketball day, throwing day, low sleep, recovery color, days since the last session); the best-fitting message not shown inside the rotation window wins, ties broken by the date; quiet hours return null; once chosen the day's message is recorded and stays. Badges: pure tests over sessions, check-ins, journal and habits; `newBadges` only adds. Missions: three per week picked by week number; progress recomputed on every refresh; unfinished ones expire with the week.

## Parent mode (src/ui/mode.tsx)

Session state, not persisted: `athlete` by default; `enterParent(pin)` checks the salted SHA-256 in settings; drops back after ten minutes in the background or on "Back to Eli mode". The parent page never queries private journal entries. The visibility card on Settings is the whole list of what parent mode shows.

## Backup (src/io/backup.ts)

ZIP of one JSON file per table plus `manifest.json` (format `athletic-lab-backup`, scope `full` or `parent`, SHA-256 per file). `parent` scope strips private journal entries and all PIN fields. Restore: `merge` adds missing records, keeps the newer copy (sessions: the more finished status wins, so a done session is never replaced by a planned copy; athlete: goals are unioned by id), and reports records that were newer here; `replace` clears data tables first and keeps this phone's PINs, parent name and tour flag. Same file twice changes nothing.

## Offline

vite-plugin-pwa precaches the shell (about 580 KB). Data is in IndexedDB. Live workout state (index, paused, elapsed) is written to the session on every change. Installed home-screen apps count as safe storage; a browser tab gets an install prompt. A home-screen icon is not a backup, and the Settings copy says so.

## Sync (src/io/sync.ts, docs/sync-schema.sql)

Automatic two-way sync through a free Supabase project. One table `records(family_id, tbl, id, stamp, data, deleted, device, server_ts)`; `family_id` is sha256 of the family code; every request carries the code in `x-family-key` and the row-level policy compares the hash. A trigger refuses an older stamp and sets `server_ts` on every accepted write. Push: every local record with stamp > lastPush (plus tombstones), upserted in batches; pull: rows with server_ts > lastPullTs, merged with `mergeRecord`; a pull that merged anything pushes again. Triggers: open, foreground, online, two seconds after a write, every two minutes. Not synced: private journal entries, settings, meta, untouched library rows. Without a family code the app is a single-phone app.

## Watch it: drawings, videos, clips (src/ui/components/Figure.tsx, Watch.tsx, src/data/videos.ts, src/io/clips.ts)

Figure draws a stick figure from joint positions and, where a pose has a second frame, eases between the two with requestAnimationFrame (reduced motion → first frame only). `videos.ts` maps exercise id → verified YouTube demos (title, channel, note); `videosFor()` follows `VIDEO_ALIAS` so a progression reuses the base move's demo. `Watch` renders the family's own clips first, then the demos; a YouTube embed (`youtube-nocookie.com`) is created only when tapped. `clips.ts` uploads to the private Supabase storage bucket `clips` at `<familyId>/<exerciseId>/<id>.<ext>` with the family key header (policies in `docs/clips-storage.sql` compare the first path segment with `family_key_id()`), fetches a clip as a blob behind the same header, and deletes file + row + tombstone. The `clips` table (schema v3) is in `DATA_TABLES`, so backups and sync carry the metadata. `scripts/check-videos.cjs` (run by `keepalive.yml`) checks every link with oEmbed every three days.

## Still needing a server
Background push notifications. Everything else the master prompt listed under "requires infrastructure" is in.
