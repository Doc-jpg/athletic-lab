# Decisions and lessons

## 2026-11-12, v0.10.0, hard days in a row, not one day judged alone (Deren: "He's had basketball tryouts all week, so when he does his check-in, it's been a five-minute stretch as his workout... I really need him to be working on strength building and agility and athleticism... if today was hard, but nothing was yesterday, then you still do workout, but if today was hard, yesterday was hard, maybe you do a medium workout, and if today is the third day in a row... something light")

- **What went wrong.** Three rules each sent a busy kid to the stretch or the gentle workout: a long all-out day was orange on its own; the "busier than usual" brake compared this week with the four-week average, and in an app with one week of history the week is the month, so the ratio read 4.0 and went orange every day; and "six active days in a row" went yellow for a kid whose plan is something every day.
- **The rule now.** A hard sport day is load 6 or more (an hour or more of all-out playing, a long real game, a tournament). The engine counts hard days in a row ending today (`hardStreak`). First hard day: the full planned workout. Second in a row: the planned strength workout with each move once ("A shorter workout today"); if strength was done yesterday or the weekly cap is reached, the Short gentle workout. Third or more: the Short gentle workout. A day that is not hard resets the count. An all-day tournament counts as two.
- **Sport alone never gives the stretch.** Orange is only "no energy" or "very sore" from his own answers. That is the safety valve, along with low energy, poor sleep and a little sore (gentle workout) and red for pain, sick or dizzy. All unchanged.
- **Blocks.** Hard basketball, running, soccer or football takes out jumps and sprints only; leg strength moves stay. "Lots of running or jumping" or a tournament still takes out hard leg work too. When the plan is Quick feet or Shortstop Movement (all sprints and jumps) on such a day, a strength workout takes its place if strength is allowed, instead of the gentle workout.
- **Parent alerts, no day change.** The four-week ratio (now needs three weeks of history) and six hard days in a row only raise an alert.
- **Kept on purpose.** 48 hours between strength or Shortstop days and the weekly cap (his own rules from the master prompt). In a five-day tryout week that means roughly: Monday full strength, Tuesday gentle (strength was yesterday), Wednesday on gentle. If he wants more than that, the lever is the 48-hour rule, not the sport threshold.
- **Lesson.** A load rule that compares against history must be tested on a device with no history. And "something every day" and "rest after six active days" cannot both change the day.

## 2026-11-08 (afternoon), v0.9.0, a driveway shoot-around is not a workout (Deren: "He chose 45 minutes or less because he shot around in the driveway for a few minutes. And when he answered that, it suggested a five-minute stretch session, which I should not do... time is not necessarily the issue here... We don't want to not get weightlifting in on those days")

- **What went wrong.** The sport card asked "How long" (under 45, about an hour, over 90) and "How hard" (Easy, Medium, Hard) with both defaulting to the middle. A 20-minute shoot-around saved as a medium hour (load 4), the yellow line sat at 3, and a lifting day became the Short gentle workout. Tapping the sport twice made two medium logs and an orange day. Time was being read as exertion.
- **Effort first, in pictures, required.** "How hard were you going? Pick the one that looks most like what you did." Four choices, each with one line of what it looks like: Messing around (shooting around in the driveway, playing catch; not out of breath), Moving some (drills, PE, a relaxed game), Really playing (a real game or scrimmage; sweating, breathing hard), All out (as hard as you could go; worn out after). No default. Save my answers and Add stay off until every sport has an answer, with a line saying why. Duration stays, asked second.
- **Scoring.** Messing around is 0 for anything under an hour and a half and 1 after that. The other three keep the old 1 to 3 multiplier. Old logs still score as they did.
- **Thresholds moved so he lifts.** Yellow (Short gentle workout) now needs load 6: an hour of all-out playing or a long real game. Orange needs 9: a long all-out game, a tournament, or two real activities (each load 2 or more) adding to 8 or more. "Yesterday was a big day" now needs 9 yesterday. An hour of a real game (4) is green with full strength; a short all-out game (3) is green. The heavy-legs block for basketball, running, soccer and football stays at 6 and still strips jumps and hard leg work from a green session when "Lots of running or jumping" is tapped.
- **The app says so.** Green reasons now name it: "Messing around (shooting around, playing catch) is not a workout, so today is still a normal day." / "What you did today was not big enough to change your workout. Only an hour or more of hard playing does that." The FAQ has "Does shooting around in the driveway count as sport?" The parent week shows the effort words instead of raw keys.
- **Lesson.** Any check-in answer that can turn a training day into a rest day must not have a default, and must be asked in pictures of what happened, not in a scale word. Dance Lab still asks dance class as a flat 4 by design (Vivi's app is meant to go gentle on class days); if that ever reads wrong, it gets the same treatment.

## 2026-11-08, v0.8.0, My jobs (Deren: "pushes that are more kind of personal responsibility... Eli is supposed to scoop the dog poop at least, and I mean at least, minimum, Monday evening and Thursday evening. That's because the trash gets taken out Monday night for Tuesday morning pick up, and the yard gets mowed on Fridays... he needs to think ahead... he's getting a new basketball goal installed today and it has a light")

- A **My jobs** card on Today, right under the daily questions. Three lines: creatine and multivitamin (read from the day's answers, with a "Took them now? Change my answers" link), **Scoop the dog poop**, and **Shots on the goal** ("not a job, just a good idea").
- The poop schedule is in `src/engine/jobs.ts`: scoop days are Monday (the trash goes out tonight) and Thursday (the lawn gets mowed tomorrow). The card says which it is and why, in those words. The day before (Sunday, Wednesday) it asks him to think ahead: "do you have practice or a game tomorrow evening, or is rain or snow coming? If yes, scoop today instead." A scoop the day before counts for the scoop day. A missed scoop day follows him for two days ("You missed Monday's scoop. Do it today, the first chance you get.") and raises one parent alert (`job-missed`), then the next scoop day takes over. Any other day: "No scoop due today. Next scoop day: Thursday. Scooping sooner is always fine." No weather data in the app (it is offline-first); the question does the thinking-ahead.
- Stored as habit logs (`scoop`, `shots`), so they sync, back up and show on the parent week ("scooped the poop" in green on the day; the weekly line lists which days). Both are also on the Habits page. Two daily messages back it up on scoop days and the day before; one about the lit goal.
- Nothing is scored, nothing nags twice. The card is the instruction; the parent alert is the consequence.

## 2026-11-08, v0.7.0, written for a literal reader (Deren, after the same pass on Vivi's app: "push some of these simplified explanations to Eli's app as well. Feel like sometimes you get too cute and rather you just be clear")

- **Labels say what they are.** Looks are "Blue and orange / Plain and simple / Dark with lime" with color dots, not Playful / Minimal / Pro sports. Hero line: "Strength, stretching, quick feet and good habits for a young athlete. A little bit every day."
- **Workout names say what you do, not how it feels.** Daily 5 → Five-minute mini workout; Easy workout → Short gentle workout; Easy day → Just breathing. Headlines: "A short gentle workout today", "No workout today: just breathing, and tell a parent". Strength A, Strength B, Shortstop Movement, Quick feet and Five-minute stretch stay.
- **One word per thing.** "workout" (never "session"), "Answer the questions" (never "check in"), "rounds" (never "sets"), "add" (never "log"). Energy and sleep in words. Creatine and multivitamin as "yes" / "no" and the question names them ("Did you take your creatine and multivitamin today?").
- **No idioms.** "Eat like you mean it", "first play of the day", "already behind", "runs on", "wiped out", "no big deal", "the whole plan", "a stop sign", "push through", "Steady as a rock", "Six on the field", "Range" are gone. Explicit shape comparisons ("back flat like a table") stay.
- **Plain words for body parts and ideas.** Every "what it builds" line rewritten: no glute, hamstring, hip flexor, quad, core, stability, mobility, rotation or range without the plain words first. Move names that were not self-explaining now carry what you do: "Dead bug (lie on your back, arms and legs up)", "Stand on one foot", "Front plank (hold your body straight like a board)", "Slow belly breathing".
- **Doses in sentences**, hold versus do-it-for, "so far" on the clock, "How many this round", questions that are questions, empty cards hidden, "Open Dad's page".
- The engine's reasons were rewritten in the same voice ("You threw a lot today, so no extra arm or shoulder work."). Pitch Smart rest-day reasons keep their numbers.
- Method, same as Dance Lab: dump every screen's text with Playwright, read it as a literal twelve-year-old, rewrite, dump again. The FAQ was rewritten whole.

## 2026-11-07 (night), v0.6.2, creatine and multivitamin on the check-in (Deren: "I need him to attest that he took his creatine and that he took his multivitamin that day")

- Two buttons under the sleep and soreness questions: Creatine, Multivitamin. Tap to say yes; a no is just a no and gets written down. Saved on the day's check-in (`creatine`, `multivitamin`), so it syncs and backs up like everything else; older check-ins have neither field and show nothing.
- Today's "Checked in" line shows Creatine ✓/✗ and Vitamin ✓/✗. The parent view's week shows yes/no per day and a count for the week.
- The app still does not suggest any supplement; that stays a parent's decision. The FAQ and the Habits page were reworded from "never" to "the app does not suggest; the check-in records what you were given". The library and message pool still never mention it (tested).

Newest first. Append here; this is where the next session starts.

## 2026-11-07 (evening), v0.6.1, the player did not tell him what to tap (Eli's first real session)

Eli's report, through Deren: it told him what to do and had a timer, then said "Skip to next"; nothing acknowledged he had done the stretch. His summary read "No sets were completed. Skipped: everything." Diagnosis from the code and his screen: the clock at the top was the whole-workout elapsed time, not a stretch timer; the thing that logs a set was a small box below the fold labeled "SET 1 / 30s" that nothing told him to tap; and the only big button was "Skip to next", so that is what he pressed. Design failure, not a user failure.

Fix in both apps (Dad Lab got it as v0.1.5):
- One big button right under the drawing, always the one thing to do: "▶ Start the 30 second timer" for timed moves (the countdown then sits in the same spot, with Done early), "✓ Did it" for rep moves, "(left set 1 of 2)" when there is more than one. The small set boxes stay underneath for undo only, labeled as such.
- When the last set is done the card flashes "✓ Done. Next one coming up…" and moves on by itself after about a second and a half (the phone buzzes when a timer ends). On the last move it says "Tap Finish workout."
- "Skip to next" is now a quiet "Skip this one" and only becomes the bright "Next ›" once the move is done.
- The elapsed clock reads "4:12 total" in small text so it is not mistaken for the exercise timer.
- The acceptance walk waits for the auto-advance instead of pressing Next.

Lesson for the design principles: the big button is the instruction. If a 12-year-old can finish a session without logging a thing, the player is wrong, not the kid.

## 2026-11-07, v0.6.0, something every day, in Eli's words (Deren: "same mentality. Something every day ... this is a 12-year-old who doesn't know movements, doesn't know exercises, doesn't know muscle groups")

- **There is always something.** A red day (pain, sick, dizzy) no longer ends in "No workout today". It offers the **Easy day**: two minutes of slow breathing and, if it feels fine, a one-minute walk around the house; it counts as his day, and "tell a parent" stays on the card. The hard rule is unchanged: nothing loads anything on red, and the Workouts list still refuses the training sessions. The engine's `offer` is never null now (tests updated).
- An orange day (tournament, a lot of sport) offers the **Five-minute stretch** as the whole workout, not "optional, skipping is also fine". He already did the hard part; the stretch is the habit.
- **Chain on Today:** "3 days in a row" under the date, counting any done session (Daily 5 and Easy day included) or a logged sport.
- **Plain names everywhere.** Templates: Quick feet (was Athletic coordination), Daily 5 (Daily Foundations), Easy workout (Light day), Five-minute stretch (Recovery), Easy day (new). Areas: Legs, Arms chest and back, Belly and back (core), Quick feet and athletic moves, Shortstop moves, Stretching. Exercises: "Split squat holding a chair", "Push-up on a bench or counter", "One-arm row, hand on a chair", "Lying superman arms (Y and T)", "Standing twists", "Kneel, reach out, hold still", "Opposite hand to opposite knee", "Side step and freeze", "Open the book (back twist)", "Side shuffle (defense slide)", "Three-step sprint starts", "Side lunge", "Hip hinge (the fielding bend)", "Skater jump and freeze", "Sit and switch hips (90/90)", "Carioca (the grapevine run)", "Quick feet over a line", "Drop step (ball over your head)", "Crossover step (ball to the side)", "Hip turn (see it, go)", "Soft landings", "Stop-and-go game". Push versus pull and muscle-group words never appear on his screens; the app just says what to do next, with the moving drawing, three cues and a video.
- FAQ: "Is there a day with nothing to do?" and "I do not know what a move is or what it works." Tour and the colors text rewritten the same way.

## 2026-11-07, v0.5.2, Sunday first (Deren: "Sunday is the first day of the week in my mind")
The Progress calendar and the mission week now run Sunday to Saturday, matching Dad Lab. New missions arrive on Sunday.

## 2026-11-05 (later), animated drawings, demonstration videos and the family's own clips (Deren: "would a 12-year-old who has never seen these moves understand the drawings?")

The honest answer was no, not for footwork: a single stick-figure frame shows a shape, not a movement. Three things changed in v0.5.0.

- **Drawings move.** Forty poses now have a second frame and the figure eases between them (ping-pong, with a pause at each end, `prefers-reduced-motion` respected). Footwork poses start from the ready stance so the first step is visible. Static holds say "(hold)" in the caption.
- **Demonstration videos play inside the app**, one per exercise for the 35 moves a kid is unlikely to know (every infield move, the athletic and coordination drills, core, mobility and the assisted versions; common moves like a plank or push-up have none). Each is the official YouTube embed (`youtube-nocookie.com`, loaded only when tapped, so the page costs nothing until then and works offline minus the video). The links live in `src/data/videos.ts` with title, channel and a one-line note where the clip differs from our version ("shown with a band; do it without one"). Every link passed YouTube's oEmbed check when added, and `scripts/check-videos.cjs` runs in the same three-day GitHub Actions job that keeps the database awake, failing loudly and naming the exercise if a channel ever pulls one. Progressions reuse the base move's demo (`VIDEO_ALIAS`).
- **Not rehosted.** Deren asked whether we could screen-capture the videos and host them ourselves so links never die. We do not: those clips are other people's work and copying them is not ours to do. Evergreen comes from the check job (a dead link is noticed within three days and swapped) and from the next point.
- **The family's own clips.** The slot Deren actually wants: a ten-second clip of Eli doing a move right, shot on a parent's phone. From the parent view, any exercise page has "+ Add a clip of him" (camera or library). The file goes to a private `clips` bucket in the same free Supabase project under `<family hash>/<exercise>/<id>`; storage policies only let a request carrying the family code see, add or delete its own family's folder (verified with curl: wrong key gets nothing, another family's path is refused). The metadata row (`clips` table, schema v3) syncs like everything else, so the clip shows on Eli's phone under "Watch it" ahead of the YouTube demos. Clips are fetched with the family key and played from a local blob, never a public URL. Removal deletes the file and tombstones the row so both phones drop it. 60 MB cap per clip.
- Durations of the YouTube picks were not machine-verified (oEmbed has no length field); the channels chosen are short-format coaching and clinic demos. Weak spots to watch on the phone: the ready-position pick shows the stance but not the hop; the hip-turn pick is a reaction drill rather than a pure hip turn; the row demo uses a heavier dumbbell than Eli would.

## 2026-11-05, Shortstop Movement (Deren: "I want Eli to move like a shortstop")

Two coaches who evaluated Eli this fall said the same thing: quick feet and a good glove, needs more strength and better infield footwork. The library covered general athleticism; nothing was specific to a middle infielder.

- **Ten new exercises** in a new area, "Shortstop movement" (`infield`): ready position hold and prep hop, crossover step starts, drop step starts, hip turn to the ball (visual cue), lateral lunge, bodyweight hip hinge, skater bound and stick, quick-feet pattern (no ladder), 90/90 hip switches, carioca. Same format as the rest; each "why" is written for Eli and tied to playing short ("This is the first step to a ball in the hole"). The exercise page labels it "Why it matters at short".
- **New template "Shortstop Movement"**, kind `movement`, 27 minutes, body weight only: warm-up (march, leg swings, easy skips), footwork and first step (ready and prep hop, quick feet, crossover, drop step, hip turn), lateral strength and power (hinge, lateral lunge, skater bound as optional), hip mobility (90/90, carioca, half-kneeling hip opener), cooldown.
- **Rotation:** A, Shortstop, B, Shortstop, A... so it comes once or twice a week inside the weekly cap. `DEMANDING_KINDS` = strength + movement: the 48-hour rule and the weekly cap treat them alike; the parent setting now reads "Strength and movement days per week".
- **Gates unchanged and applied:** prep hop and skater bound carry the `jump` tag, the starts carry `sprint`, so a hard basketball, running or tournament day takes them out the same way as the existing jump work; yellow = one set each and the jumps and sprints out (9 of 15 items remain); orange = recovery; red = nothing. Progression rules unchanged (learn holds; +2 reps or +5 seconds after two easy completed sessions; caps per exercise; growth-spurt mode holds). No loads anywhere on these ten (library test enforces `loads === ['body']`).
- Two badges: first Shortstop Movement session, ten sessions.
- Tests: `tests/shortstop.test.ts` (10 tests: library gates, template shape and length, green build, hard-basketball block, yellow reduction, red, rotation, 48-hour and weekly cap, progression, hold/bound progress by time and reps only). Walkthrough adds the yellow-day Shortstop session (gate sheet, one set each, 9 items) and the crossover exercise page. 76 unit tests, both device walks green.
- Research note: the drills are standard infield footwork patterns taught in youth baseball (crossover, drop step, prep step, carioca) written in original words; no program was copied. RESEARCH.md gained a short section.

## 2026-11-02 (afternoon), automatic sync (Deren: "I want whatever he does to auto send")

Deren refused the file-based parent pack: he does not want to get on Eli's phone, and Eli should never have to submit anything. He asked that whatever Eli does upload on its own.

- **Design:** a family code made once at parent setup on the athlete's phone (20 characters, no confusable letters), carried to the parent's phone by a link (`#/join?k=CODE`, the code in the hash fragment so it never hits a server log) or typed. Both phones push changed records and pull the other's, keyed by the code; the server (a free Supabase project, organization "Flesher Family", project "athletic-lab", nothing to do with AiroDental) holds one table of records with row-level security on the hash of the code sent in a header. The server never stores the code. Tested from the container that one family's key cannot read or write another's rows.
- **Merge rules are the backup's merge rules** (`mergeRecord` extracted from backup.ts): newer record wins, sessions by finished-status rank, athlete goals union by id. The server also refuses an older stamp. After a pull that merged something, the phone pushes again at once so the union reaches the other phone on its next sync (found by the goal-union test).
- **What never syncs:** private journal entries, settings (PINs, sync state), meta, untouched library rows. Journal deletions travel as tombstones (schema v2 table).
- **When it syncs:** app open, foreground, back online, two seconds after any write (`noteChange` event from the db helpers), every two minutes while open. iPhone web apps do not run in the background; "automatic" means on the next open. A hash-only navigation is not an open (learned in the acceptance script); a reload or a return to the foreground is.
- **Setup flow now:** athlete phone → parent part → "Send myself the parent link" → hand-off. Parent phone → open the link (name, PIN, Connect) or "My own phone" + code. A parent phone that has not yet received the athlete's records shows a waiting card instead of the setup wizard.
- **Parent packs stay** as the no-signal fallback and as a backup; nothing requires them any more.
- **Free Supabase projects pause after a week of no traffic:** `.github/workflows/keepalive.yml` pings the records endpoint every three days (a cloud scheduled task was refused by the harness, so the repo does it). If it pauses anyway, the dashboard restores it in one click.
- Verified: 7 sync tests on a fake server with the same rules plus one live round trip against the real project (`LIVE_SYNC=1 npm test`); the Playwright walk now sets up two simulated phones, syncs a session from Eli's to Dad's and an approval from Dad's to Eli's through the live server.
- Credentials: the publishable key is in `src/sync-config.ts` on purpose (it is public by design; RLS is the lock). No secret key is anywhere in the repo or on the laptop.

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
- **Illustrations are drawn stick figures from joint positions**, original, with the key cue as an orange arrow. Not photos of anyone. Good enough to show the shape; v0.5.0 added motion, in-app demonstration videos and the family's own clips (see the 2026-11-05 entry).
- **No server, honestly.** Backup card says remote parent access and auto-sync are not enabled. Device notifications are optional, permission-gated, and only while the app is open; nothing promises background alerts.
- **Parent PIN starts as the one Deren gave in chat** and is changeable in Parent mode. The hash is salted; the PIN is not in any file or backup.

Research: docs/RESEARCH.md (AAP, CDC, NSCA, AASM, Pitch Smart, Armored Heat concept; sources not reached are listed there). Growth-spurt mode is marked a design assumption, not a cited rule.

Verification in this session: 58 vitest tests (readiness, program and progression, library gates, persistence, backup and merge, badges and missions), Playwright walkthrough from an empty phone as an iPhone 13 and as a Pixel 5 (33 checks each), screenshots in `scripts/shots/`. Not done: a real iPhone pass (share sheet, Add to Home Screen, Notification permission). That is the first item on the roadmap.

## Lessons for the first real week

- The check-in is the whole data entry. If Eli does not check in, nothing is assumed and nothing is offered.
- Expect the first strength session to be slightly off (too short, a swap that reads oddly). Write it here and push; the engine learns nothing from it yet.
- The sample data is for exploring. Remove it before his first real session (Settings) so Progress is his alone.
