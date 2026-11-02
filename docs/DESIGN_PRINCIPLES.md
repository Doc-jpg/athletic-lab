# Design principles

Carried over from Dugout Lab (Deren, 2026-11-02: "blend comprehensiveness, thoroughness and granularity with ease of use, quick interactions, and a clean, simple UI for actual users who aren't technical at all") and re-aimed at a twelve-year-old with a phone in one hand.

1. **Thirty seconds to a plan.** The check-in defaults to "a normal day", so a kid with nothing to report taps Save and gets a color and a session. Sports are added by tapping a chip; three chips (how long, how hard, anything big) are all it asks.
2. **One tap per set.** In the player, a set is one big button. Holds count themselves down. Rest timers can be skipped. Reps can be nudged with plus and minus, never typed.
3. **Depth behind a fold, never gone.** Every exercise carries steps, cues, mistakes, skip conditions, versions and history; the player shows the picture and the cues, and "How to do it" and "Why it matters" open on demand.
4. **Say why, every time.** The readiness card lists its reasons; every swapped exercise says what it replaced and why; every dose says why it is what it is ("Holding steady until two sessions in a row feel easy").
5. **Nothing is required to start.** Name, birth year, sports, a look. Goals, form checks, weights, reminders and the parent name come later, from the place they are used.
6. **Hard rules never relax.** Red means no workout. A blocked body part stays blocked even when Eli picks a different session. A weight never appears without a parent's approval. The engine's fallbacks can swap and drop, never override.
7. **Nothing punishes.** Skipping, stopping, missing a week: no streak, no lost badge, no scolding message. Smart recovery choices earn badges. The message pool is checked by a test for guilt, shame and body talk.
8. **Words a kid uses.** "Wiped out", "A little sore", "Something hurts", "Felt good". No codes, no RPE, no load percentages on screen (the load score sits under "Why this day" for the curious).
9. **Transparent, not surveilled.** Parent mode is behind a PIN and shows exactly what the "What a parent can see" card says. Private notes are private on the phone, in parent mode and in the parent pack.
10. **Works offline, one-handed, on a phone.** Big targets, bottom sheets, no hover, live state saved on every change so a closed app reopens mid-set.
11. **Test the path a new kid walks.** `scripts/acceptance.cjs` starts from an empty phone: setup, check-in with pitching, a full workout, offline reload, a journal note offline, a red day, parent mode, backup and restore, the tour.
