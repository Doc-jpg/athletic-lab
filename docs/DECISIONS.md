# Decisions and lessons

Newest first. Append here; this is where the next session starts.

## 2026-11-02 (afternoon), audience fix (Deren: "it felt confused as to who was the target audience")

Deren opened the live site and the setup screen talked to Eli and to him at once, printed the parent PIN on screen, and asked "who is using it" under the name "Eli's Athletic Lab". He asked for the flow to be deliberate: who sets it up, and how Eli gets it.

- **Two people, two jobs.** Setup is the parent's part, done once on the athlete's phone: whose phone this is, the athlete's name and birth year, sports, the parent's name, a PIN typed twice. Then a hand-off screen addressed to the kid (pick a look, take the tour). From there every screen Eli sees is his, except the "What Dad can see" card.
- **The PIN is never shown on screen** and has no default. The one Deren chose is his to type.
- **Name is "Athletic Lab"**; the app greets the athlete by name only after setup. The manifest and home-screen title match.
- **A parent copy is a real path**: "My own phone" at setup lands on the pack instructions and puts the parent door at the top of Settings; `meta.deviceRole` remembers it.
- **Everything a parent manages lives behind the PIN**: parent packs, restore, sample data, erase moved from Eli's Settings into the parent view. Eli's Settings keeps look, goals, the visibility card, help, tour, a single Back up button, and the parent door.
- Lesson for the next app: write the first-run flow from each person's point of view before building it, and never put a secret in copy.
- The acceptance walk now covers both phones (athlete setup and hand-off; parent-copy setup) and asserts the PIN does not appear in the hand-off text.

## 2026-11-02, Phase 1 build (from the "Build Eli's Athletic Lab" master prompt)

What was carried over from Dugout Lab, on purpose:
- The stack and the shape (see ARCHITECTURE.md) and the ten design principles, re-aimed at a kid (DESIGN_PRINCIPLES.md).
- Hard rules never relax in fallbacks. Dugout Lab's generator once let a rain swap pull in an outdoor drill; here the readiness blocks survive "Do it anyway", the session builder, and the swap sheet (weighted or unchecked versions never show).
- Say why. Every readiness verdict, every swap, every dose carries its reason; the session summary folds them under "Why this session looked like this".
- Two-step share sheet so a cancelled share is not counted as a backup; restore with a preview and a merge that reports what it kept.
- Merge by record, never overwrite. Dugout Lab's lesson (whole-record newer-wins erased a coach's goal) became: goals union by id, a done session never replaced by a planned copy, parent approvals survive a pack from the phone, same file twice changes nothing. All tested.
- Settings fields save on blur; toast timers cleared; live state saved on every change; printables and `window.open` avoided (nothing prints here).
- Tour on the real screens, FAQ with search, a demo mode that can be removed in one tap, PIN with salted hash and a ten-minute background relock.

Decisions specific to this app:
- **Separate app, no shared data.** Own repo, Pages path, manifest id, service-worker scope, database name, icon. The acceptance walk asserts no Dugout database exists on the origin after a full run.
- **Check-in before any workout.** The prompt's first rule. Start opens the check-in if it is missing. Defaults make an uneventful day a two-second check-in.
- **Colors are training guidance, never clearance.** The red path says "tell a parent" and "a doctor decides, not the app"; nothing in the engine or copy says "cleared". A test greps for it.
- **Blocks carry one day and Pitch Smart rest days.** Heavy throwing blocks arm loading today and tomorrow; a pitch count extends that by the 11 to 14 table (1 to 4 days). Hard basketball, running or a tournament blocks legs, jumps and sprints; the day after a tournament is still lighter.
- **Loads.** Body weight for everything until a parent marks the form checked and approves 5 lb for that exercise; 10 lb is a separate parent toggle on the row only. The player remembers the last load used but never offers a higher one by itself. `tests/program.test.ts` covers it, and `tests/library.test.ts` refuses any 10 lb exercise without 5 lb, any weighted exercise without a form check, and any loaded twisting.
- **Progression is one change at a time.** Reps (+2 or +5 seconds), then a set, only after two completed easy sessions, only in build and develop phases, never past the per-exercise cap. Learn phase, review week and growth-spurt mode hold. A hard session eases back toward the template, never below it.
- **Reduced day = one set each, no jumps or sprints, no weights.** Simpler and safer than fractional volume.
- **Private means private.** Private journal entries are filtered out of parent mode queries, the parent pack, and the parent page; full backups keep them (they are the phone's own backup). The visibility card is the whole list; nothing else is collected.
- **No supplements by default.** The library, templates, messages and badges contain no supplement words (tested). A parent can record a clinician's product, dose and schedule; it shows on Habits as "From the doctor" and only a parent can change it.
- **Gamification that cannot punish.** Badges only ever add; missions expire; the message pool is tested against guilt, shame, streak and body-image words; recovery and stopping for pain earn badges.
- **Illustrations are drawn stick figures from joint positions**, original, with the key cue as an orange arrow. Not photos of anyone. Good enough to show the shape; photos or short clips of Eli himself are a Phase 3 idea, stored locally.
- **No server, honestly.** Backup card says remote parent access and auto-sync are not enabled. Device notifications are optional, permission-gated, and only while the app is open; nothing promises background alerts.
- **Parent PIN starts as the one Deren gave in chat** and is changeable in Parent mode. The hash is salted; the PIN is not in any file or backup.

Research: docs/RESEARCH.md (AAP, CDC, NSCA, AASM, Pitch Smart, Armored Heat concept; sources not reached are listed there). Growth-spurt mode is marked a design assumption, not a cited rule.

Verification in this session: 58 vitest tests (readiness, program and progression, library gates, persistence, backup and merge, badges and missions), Playwright walkthrough from an empty phone as an iPhone 13 and as a Pixel 5 (33 checks each), screenshots in `scripts/shots/`. Not done: a real iPhone pass (share sheet, Add to Home Screen, Notification permission). That is the first item on the roadmap.

## Lessons for the first real week

- The check-in is the whole data entry. If Eli does not check in, nothing is assumed and nothing is offered.
- Expect the first strength session to be slightly off (too short, a swap that reads oddly). Write it here and push; the engine learns nothing from it yet.
- The sample data is for exploring. Remove it before his first real session (Settings) so Progress is his alone.
