import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTour } from '../components/Tour';
import { useAthlete } from '../hooks';
import { APP_NAME } from '../version';

const FAQ: Array<[string, string]> = [
  ['What do the colors mean?', 'Green: fresh and recovered, do the planned session. Yellow: moderate sport today, short sleep, or a strength day inside 48 hours; a lighter session with one set each and nothing weighted. Orange: heavy sport day or a tournament; recovery only, with optional easy mobility. Red: something hurts, you feel sick or dizzy; no workout, tell a parent. The colors are training guidance for a healthy kid, never a doctor\'s opinion.'],
  ['Why no arm work after I pitched?', 'A throwing arm already did its work. Loading the shoulder, elbow or forearm again the same day or the next adds stress with no benefit. The app blocks those exercises for the day and the rest days Pitch Smart gives for the pitch count, and swaps in mobility or something for a different body part.'],
  ['Why no jumps after basketball?', 'A hard basketball game is a lot of jumping and sprinting already. Extra jumps and hard leg work that day are pure extra load, so the app takes them out and keeps the rest.'],
  ['Will the app ever add weight on its own?', 'No. It only ever adds a few reps, then a set, and only after two sessions in a row felt easy and were fully done. A 5 lb dumbbell appears as a choice only after a parent has checked the form and approved it for that exercise; 10 lb is a separate parent choice. You pick the weight each set; the app never picks a heavier one.'],
  ['I missed a few days. Did I lose anything?', 'No. Nothing is lost, no streak breaks, no badge goes away, no message scolds you. Check in and pick it back up. Even just the Foundations counts.'],
  ['Why does it say "Holding steady"?', 'Progress comes from form and recovery, not from adding every week. In weeks 1 and 2 nothing is added on purpose. After that the app adds a little only when the last two sessions of that exercise were completed and felt easy.'],
  ['Can I do a different workout than the one it suggests?', 'Yes. Workouts lists all of them, Shortstop Movement included. If you pick something other than the suggestion, the app says why it suggested what it did, then lets you go. Body parts it wants to rest stay swapped out even then.'],
  ['How do I know what a move is supposed to look like?', 'Three ways. The drawing on every exercise moves between the start and the finish of the rep. Most moves also have "Watch it": a short demonstration video that plays right there (it needs a signal). And if a parent has added a clip of you doing it, that shows first. In a workout, tap "Watch it" under the drawing.'],
  ['What is Shortstop Movement?', 'A 25 to 30 minute body-weight session built for a middle infielder: ready position and prep hop, quick feet, crossover and drop-step starts, hip turns on a visual cue, lateral lunges, the hip hinge (the fielding position), skater bounds with a stuck landing, 90/90 hip switches and carioca. It sits in the rotation between Strength A and Strength B (A, Shortstop, B, Shortstop) so it comes once or twice a week inside the weekly cap, and it counts like a strength day for the 48-hour rule. On a hard basketball, running or tournament day the bounds and hops are out; yellow means one set each; orange means recovery; red means nothing. Pick it from Workouts any time.'],
  ['What is Daily Foundations?', 'Three to six easy minutes of breathing, cat-cow, trunk rotation, ankles, hips and a little balance. It is movement, not training, so it is fine on most recovery days. Skip it when you are sick, hurt or wiped out.'],
  ['What can my parent see?', 'Finished and skipped workouts, sports logged, check-ins, recovery days, progress, badges, journal notes that are not private, and safety alerts (pain, sick, dizzy, a stopped workout, a tournament day, a week with no rest day). Not private notes. The full list is on Settings under "What a parent can see".'],
  ['Does it work offline?', 'Yes, all of it. Open it once online after installing, then it runs with no signal. Everything is stored on this phone. Sync between phones is by backup file (Settings, Backup), which merges without overwriting.'],
  ['How do I install it on the home screen?', 'iPhone: open the address in Safari, tap Share, then Add to Home Screen. Android: open it in Chrome, menu, Install app. Open it once while online so it can store itself for offline use.'],
  ['What about food, protein powder, creatine?', 'Real food, water, and sleep. The app never suggests protein powder or creatine for a kid; the pediatrics guidance is clear on that. A parent can record a product a doctor specifically recommended, and that is the only way a supplement shows up.'],
  ['Something hurts during a workout.', 'Tap Stop, pick "Something hurts", and tell a parent. The app marks it for the parent and stops recommending workouts until the next check-in says it is gone. Pain is not something to push through, and the app does not decide whether to see a doctor; a parent does.'],
  ['How do I back up?', 'Settings, Back up everything, then share the file to Files, iCloud Drive, or a computer. Do it every few weeks. A parent pack is the same without private notes, for a parent\'s phone.'],
  ['Why is the app asking me to tell an adult?', 'Because you reported pain, feeling sick or dizziness, or stopped a workout for one of those. The app is a guide, not a coach or a doctor. An adult decides what happens next.']
];

export function HelpPage() {
  const tour = useTour();
  const nav = useNavigate();
  const athlete = useAthlete();
  const [q, setQ] = useState('');
  const shown = FAQ.filter(([a, b]) => !q || (a + ' ' + b).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="col">
      <div className="row between"><h1>Help</h1>{athlete && <Link className="btn sm" to="/settings">Settings</Link>}</div>
      <div className="card">
        <p className="small">{APP_NAME} is a guide for strength, mobility, athletic movement and healthy habits. It adjusts to the sports already played each day, says why, and never punishes a missed day. It is not medical advice and does not replace a doctor.</p>
        {athlete && <button className="btn primary block" onClick={() => { nav('/today'); setTimeout(tour.start, 150); }}>Take the one-minute tour</button>}
      </div>
      <input className="input" placeholder="Search the questions" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card">
        {shown.map(([a, b]) => <details key={a} className="faq"><summary>{a}</summary><p className="small">{b}</p></details>)}
        {shown.length === 0 && <div className="small muted">Nothing matches.</div>}
      </div>
    </div>
  );
}
