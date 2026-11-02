# Roadmap

## Phase 1 (done 2026-11-02)
Separate installable PWA; readiness check-in and engine with multi-day workload, body-part blocks and Pitch Smart rest days; 50-exercise original library with drawn demonstrations; Strength A and B, Athletic coordination, Daily Foundations, Light day, Recovery; phase-based progression with caps and no automatic weight; interactive player with timers, swaps, pause, notes and a pain-aware Stop; history, journal, calendar, progress charts, badges, missions; habits page; rotating daily messages with quiet hours; three themes; tour and FAQ; sample data; backup, parent pack, restore and merge; parent mode with alerts, approvals, settings, clinician-only supplement record.

## Next five
1. Real-device pass on Eli's iPhone and Deren's: Add to Home Screen, offline open, share sheet for backup and parent pack, Notification permission, PIN relock. Nothing here can be verified from a desktop browser.
2. Form-check flow in the player: a "parent watched this" button on a weighted exercise's first run, writing the form check from inside the session instead of only from the parent dashboard.
3. Season awareness: baseball spring/fall and basketball winter as parent-set seasons that shift the weekly strength cap and the coordination mix.
4. Exercise photos or short clips of Eli himself, stored locally, as an optional replacement for the stick figure (no mechanical analysis, ever).
5. Custom exercises and template editing in the UI (the data model supports both; the screens do not exist yet).

## Phase 2: parent experience
- Done 2026-11-02: automatic sync between phones (family code, Supabase, merge by record) and remote parent access without a file.
- Push notifications where supported, with the same quiet hours (needs a push server).
- Conflict review screen (today conflicts resolve by rule silently; a log of what was merged would help).
- Parent-editable reminders per day of the week.

## Phase 3: long-term intelligence
- Richer progression (per-exercise comfort history, mobility milestones with simple self-tests).
- Educational tips unlocked by badges.
- Age-up: at 13 the Pitch Smart table moves to 13 to 14 (already in the table by number of pitches, the max count is not enforced yet); teenage training blocks with updated supervision text.
- Growth tracking by parent-entered height jumps driving growth-spurt mode automatically.

## Housekeeping
- The AAP 2020 Pediatrics report full text could not be fetched; RESEARCH.md uses the AAP's own summaries. Re-read it when reachable.
- Keep `tests/library.test.ts` as the content gate: any new exercise must pass it.
