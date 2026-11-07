# Athletic Lab (built for Eli)

A personal strength, mobility, athleticism and healthy-habits app for one young athlete. Offline-first web app for an iPhone home screen (Android works too), its own app next to Dugout Dad and Dugout Lab, never touching their data.

- **Live app:** https://doc-jpg.github.io/athletic-lab/ (iPhone: Safari, Share, Add to Home Screen; Android: Chrome, menu, Install app). Open it once online so it can store itself for offline use.
- **Code:** https://github.com/Doc-jpg/athletic-lab (every push to `main` redeploys through GitHub Actions).
- **Who sets it up:** the parent, once, on the athlete's phone (two minutes); then the app talks to the kid. A family link connects the parent's phone, and from then on everything syncs on its own (`docs/IPHONE_SETUP.md`).
- **Docs:** `docs/` (architecture, decisions and lessons, research with sources, roadmap, iPhone and parent setup, design principles, the original master prompt).

## What it does

1. **Daily readiness check-in** (sports played, how long and how hard, throwing or pitching with a pitch count, heavy running, tournament; energy, sleep, soreness; pain, sick, dizzy). Thirty seconds, sensible defaults.
2. **Readiness engine** turns that plus the last four weeks into Green (planned session), Yellow (lighter, one set each, nothing weighted), Orange (recovery only) or Red (no workout, tell a parent), and always says why. Heavy throwing blocks arm and shoulder loading today and tomorrow (longer after a pitch count, per Pitch Smart); intense basketball or running blocks jumps, sprints and hard leg work; tournaments force recovery; 48 hours between strength sessions; a weekly strength cap; a rest-day check; a cumulative-load brake.
3. **Original exercise library** (60 exercises: warm-up, lower, upper, core, balance, coordination, shortstop movement, mobility, cooldown) with what each builds, why it matters beyond sports, steps, cues, common mistakes, when to skip, easier and harder versions, substitutes, an animated drawing, and for the 35 less-obvious moves a demonstration video that plays in the app (verified YouTube embeds, link-checked every three days) plus a slot for the family's own clips of Eli, uploaded from the parent view into a private bucket.
4. **Starter program:** Strength A, Strength B, Shortstop Movement (infield footwork, lateral strength, hip mobility; rotates between A and B), Quick feet, the Daily 5, the Easy workout, the Five-minute stretch, and the Easy day (two minutes of breathing on a red day, so there is always something). Editable templates, never prescriptions.
5. **Progression** by phase (learn, build, refine, four-week blocks with a review week): a few reps, then a set, only after two easy completed sessions, never past the cap, never an automatic weight. Weights appear as a choice only after a parent form-checks and approves them per exercise.
6. **Workout player:** one exercise at a time, one tap per set, hold and rest timers, easier/harder swaps, pause, quick notes, and a Stop that treats pain, dizziness and illness as a parent matter.
7. **Journal, calendar and progress** against his own history only. **Badges** that are never taken away; **weekly missions** that simply expire.
8. **Habits:** water, meals, fruit and vegetables, sleep, play. No calories, no weight, no supplements by default (a parent can record a clinician's instruction).
9. **Parent mode** behind a PIN: alerts, the week, form checks and load approvals, strength days per week, growth-spurt mode, reminders and quiet hours, backups. Everything parent mode shows is listed on a card Eli can read; private journal notes stay private.
10. **Automatic sync** between the athlete's phone and the parent's phone through a family code (private notes and PINs never leave the phone), plus **backup** (ZIP with checksums), **parent pack**, restore with **merge** that never overwrites a newer record, three visual themes, a guided tour and an FAQ, and three weeks of sample data to explore.

## Run the checks

```
npm ci
npm test                      # 76 vitest tests incl. the prompt's acceptance tests
npm run build && node server.cjs
URL=http://localhost:4175/ node scripts/acceptance.cjs          # iPhone 13 walkthrough from an empty phone
DEVICE="Pixel 5" URL=http://localhost:4175/ node scripts/acceptance.cjs
```

Not medical advice. A guide for a healthy kid with a parent nearby; anything that hurts means stop and tell an adult.
