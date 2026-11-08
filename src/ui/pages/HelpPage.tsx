import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTour } from '../components/Tour';
import { useAthlete } from '../hooks';
import { APP_NAME } from '../version';

const FAQ: Array<[string, string]> = [
  ['What do the colors mean?', 'Green: you feel fresh, so you do the normal workout. Yellow: you had a big sport day (an hour or more of hard playing), or you did not sleep much, or your last strength day was too recent. You do the Short gentle workout, each move once, no weights. Orange: a tournament, a long all-out game, or two real activities in one day. The five-minute stretch is the whole workout. Red: something hurts, or you feel sick or dizzy. No workout, just two minutes of breathing (Just breathing), and tell a parent. Every color has something small to do, because doing a little every day is the whole point. The color is a helper, not a doctor.'],
  ['Why no arm work after I pitched?', 'Your throwing arm already worked hard. Working the shoulder, elbow or forearm again the same day or the next day adds stress and does not help. So the app leaves those moves out for the day, plus the rest days Pitch Smart says for your pitch count, and gives you a stretch or a move for a different body part instead.'],
  ['Does shooting around in the driveway count as sport?', 'Not really, and the app knows that. When you add a sport, pick how hard you were going: Messing around (shooting around, playing catch, not out of breath), Moving some (drills, PE, a relaxed game), Really playing (a real game, sweating, breathing hard) or All out. Messing around does not change your workout, even for an hour. Only hard playing for an hour or more makes a lighter day. So a driveway shoot-around still means you lift.'],
  ['Why no jumps after basketball?', 'A hard basketball game is already a lot of jumping and running. Extra jumps and hard leg work that day are just extra wear, so the app takes them out and keeps the rest.'],
  ['Will the app ever add weight on its own?', 'No. It only ever adds a few more times, then one more round, and only after two workouts in a row felt easy and you finished them. A 5 pound dumbbell shows up as a choice only after a parent has watched you do the move and said it is okay. 10 pounds is a separate parent choice. You pick the weight each round. The app never picks a heavier one for you.'],
  ['I missed a few days. Did I lose anything?', 'No. Nothing is lost. No badge goes away. No message scolds you. Just answer the questions and start again. Even just the Five-minute mini workout counts.'],
  ['Why does it say "Staying the same"?', 'Getting better comes from doing the moves well and resting, not from adding more every week. In weeks 1 and 2 nothing is added on purpose. After that the app adds a little only when the last two times you did that move felt easy and you finished them.'],
  ['Can I do a different workout than the one it picked?', 'Yes. The Workouts page lists all of them, Shortstop Movement included. If you pick a different one, the app tells you why it picked what it picked, then lets you go. Moves for a body part that needs a rest today are still left out.'],
  ['How do I know what a move is supposed to look like?', 'Three ways. The drawing on every move moves from the start to the finish of the move. Most moves also have "Watch it": a short video that plays right there (it needs internet). And if a parent has added a video clip of you doing it, that shows first. In a workout, tap "Watch it" under the drawing.'],
  ['What is Shortstop Movement?', 'A 25 to 30 minute workout, no weights, made for a shortstop: ready position and the little hop, quick feet, crossover and drop-step first steps, hip turns when you see the ball, side lunges, the fielding bend, skater jumps with a stuck landing, hip switches and carioca. It takes turns with Strength A and Strength B (A, Shortstop, B, Shortstop), so it comes once or twice a week, and it counts like a strength day, so you get a day off between them. On a hard basketball, running or tournament day, the jumps and hops are left out.'],
  ['What is the Five-minute mini workout?', 'Five easy minutes: breathing, cat and cow, standing twists, ankles, hips and a little balance. It is small and easy, so it is fine on most days on top of whatever else you do. Skip it when you are sick, hurt or have no energy. Just breathing covers those days.'],
  ['Is there ever a day with nothing to do?', 'No. Fresh day: a workout. Tired, or a big sport day: the Short gentle workout. Big sports day: the five-minute stretch. Sick or hurt: two minutes of breathing. Something small every day is how it becomes a habit. A five-minute day counts exactly the same as a long one.'],
  ['I do not know what a move is or what it is for.', 'You do not need to. Every move has a page that says what it makes stronger, why it helps you, and how to do it step by step, with a moving drawing, and most have a video. In a workout you only ever see one move at a time, with the picture and three tips. Push, pull, core and words like that are for grown-ups. The app just tells you what to do next.'],
  ['What can my parent see?', 'Workouts you finished or skipped, sports you added, your answers to the questions, gentle days, progress, badges, journal notes that are not marked private, and warnings (something hurt, you felt sick or dizzy, you stopped a workout, a tournament day, a week with no rest day). Not private notes. The whole list is on Settings under "What a parent can see".'],
  ['Does it work with no internet?', 'Yes, all of it. Open it once while you are online after it is installed. After that it works with no signal at all. Everything is saved on this device. When you are online again, it sends your stuff to your parent\'s phone by itself.'],
  ['How do I put it on the home screen?', 'iPad or iPhone: open the address in Safari, tap Share, then Add to Home Screen. Android: open it in Chrome, tap the menu, then Install app. Open it once while online so it can save itself for when there is no internet.'],
  ['What about food, protein powder, creatine?', 'Real food, water, and sleep come first. The app never tells you to take any powder or pill. What your parents give you in the morning (creatine, a multivitamin) is their choice. The questions just ask whether you took them, so it is written down and they can see it.'],
  ['Something hurts during a workout.', 'Tap Stop, tap "Something hurts", and tell a parent. The app marks it for your parent and does not give you workouts until the next time you answer the questions and say it is gone. You never keep going when something hurts. A parent decides about the doctor, not the app.'],
  ['How do I make a backup?', 'That is a grown-up job. Settings, Back up everything, then save the file to Files, iCloud Drive, or a computer. Every few weeks is plenty.'],
  ['Why is the app telling me to tell a parent?', 'Because you said something hurts, or that you feel sick or dizzy, or you stopped a workout for one of those. The app is a helper, not a coach and not a doctor. A parent decides what happens next.']
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
        <p className="small">{APP_NAME} helps an athlete get stronger, looser and quicker, a little bit every day. It looks at the sports you already played, picks what to do, and always says why. It never punishes you for a missed day. It is a helper, not a coach and not a doctor.</p>
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
