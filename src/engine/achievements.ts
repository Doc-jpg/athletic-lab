/**
 * Badges and weekly missions. Earned things are never taken away. Missing a day costs nothing.
 * Safe choices (resting when wiped out, stopping on pain, swapping to easier) earn badges too.
 */
import type { Achievement, CheckIn, Day, JournalEntry, Mission, Session, HabitLog } from './types';
import { addDays, newId, nowIso } from './types';

export interface BadgeDef {
  key: string;
  title: string;
  text: string;
  test: (s: BadgeState) => boolean;
}

export interface BadgeState {
  sessions: Session[];
  checkIns: CheckIn[];
  journal: JournalEntry[];
  habits: HabitLog[];
  day: Day;
}

const done = (s: BadgeState, kind?: Session['kind']) => s.sessions.filter((x) => x.status === 'done' && (!kind || x.kind === kind));
const workouts = (s: BadgeState) => done(s).filter((x) => x.kind === 'strength' || x.kind === 'movement' || x.kind === 'coordination' || x.kind === 'light');

export const BADGES: BadgeDef[] = [
  { key: 'first-checkin', title: 'First answers', text: 'You answered the questions for the first time. Knowing how you feel is the first step.', test: (s) => s.checkIns.length >= 1 },
  { key: 'first-workout', title: 'First workout', text: 'Your first workout is done.', test: (s) => workouts(s).length >= 1 },
  { key: 'five-sessions', title: 'Five workouts', text: 'Five workouts done. It is becoming a habit.', test: (s) => workouts(s).length >= 5 },
  { key: 'ten-sessions', title: 'Ten workouts', text: 'Ten workouts. This is just what you do now.', test: (s) => workouts(s).length >= 10 },
  { key: 'twentyfive-sessions', title: 'Twenty-five workouts', text: 'Twenty-five workouts. You keep doing it.', test: (s) => workouts(s).length >= 25 },
  { key: 'fifty-sessions', title: 'Fifty workouts', text: 'Fifty workouts. That is an athlete who takes care of his body.', test: (s) => workouts(s).length >= 50 },
  { key: 'good-call', title: 'Good call', text: 'You took a gentle day when your body asked for it. That is what smart athletes do.', test: (s) => s.checkIns.some((c) => c.color === 'orange' || c.color === 'red') },
  { key: 'stopped-smart', title: 'Stopped smart', text: 'You stopped a workout because something did not feel right, and you told someone. Exactly right.', test: (s) => s.sessions.some((x) => x.status === 'stopped' && (x.stoppedReason === 'pain' || x.stoppedReason === 'dizzy' || x.stoppedReason === 'sick')) },
  { key: 'foundations-7', title: 'Seven mini workouts', text: 'Seven five-minute mini workouts done. A few easy minutes, lots of days.', test: (s) => done(s, 'foundations').length >= 7 },
  { key: 'foundations-30', title: 'Thirty mini workouts', text: 'Thirty five-minute mini workouts. Your hips and ankles thank you.', test: (s) => done(s, 'foundations').length >= 30 },
  { key: 'balance-30', title: 'Steady on one foot', text: 'You balanced on one foot for 30 seconds on each side.', test: (s) => done(s).some((x) => x.items.some((i) => i.exerciseId.startsWith('bal-single') && i.sets.some((st) => st.done && (st.seconds ?? 0) >= 30))) },
  { key: 'pushup-level', title: 'Push-up level up', text: 'You moved up to a harder kind of push-up.', test: (s) => done(s).some((x) => x.items.some((i) => i.exerciseId === 'up-kneepush' || i.exerciseId === 'up-pushup')) },
  { key: 'journal-5', title: 'Thinker', text: 'Five journal notes. Noticing how things feel is how you get better at them.', test: (s) => s.journal.length >= 5 },
  { key: 'three-week', title: 'Three in a week', text: 'Three workouts in one week.', test: (s) => { for (let i = 0; i < 28; i++) { const end = addDays(s.day, -i); const start = addDays(end, -6); if (workouts(s).filter((x) => x.day >= start && x.day <= end).length >= 3) return true; } return false; } },
  { key: 'coord-first', title: 'Quick feet', text: 'Your first Quick feet workout.', test: (s) => done(s, 'coordination').length >= 1 },
  { key: 'shortstop-first', title: 'Shortstop', text: 'Your first Shortstop Movement workout.', test: (s) => done(s, 'movement').length >= 1 },
  { key: 'shortstop-10', title: 'Ten at shortstop', text: 'Ten Shortstop Movement workouts. Your first step is getting faster without thinking about it.', test: (s) => done(s, 'movement').length >= 10 },
  { key: 'habits-10', title: 'Habit builder', text: 'Ten healthy habits checked off.', test: (s) => s.habits.filter((h) => h.done).length >= 10 }
];

/** Badges newly earned given current state; the caller saves them. */
export function newBadges(state: BadgeState, have: Achievement[]): Achievement[] {
  const owned = new Set(have.map((a) => a.key));
  const ts = nowIso();
  return BADGES.filter((b) => !owned.has(b.key) && b.test(state)).map((b) => ({ id: newId(), key: b.key, title: b.title, text: b.text, earnedAt: ts }));
}

/** Sunday of the week containing `day` (Sunday is the first day of the week in this house). */
export function weekStartOf(day: Day): Day {
  const d = new Date(day + 'T12:00:00');
  return addDays(day, -d.getDay());
}

interface MissionDef {
  key: string;
  title: string;
  text: string;
  target: number;
  progress: (s: BadgeState, weekStart: Day) => number;
}

const inWeek = (day: Day, ws: Day) => day >= ws && day <= addDays(ws, 6);

export const MISSIONS: MissionDef[] = [
  { key: 'foundations-3', title: 'Mini workout on 3 days', text: 'Five easy minutes on three different days.', target: 3, progress: (s, ws) => new Set(done(s, 'foundations').filter((x) => inWeek(x.day, ws)).map((x) => x.day)).size },
  { key: 'journal-1', title: 'Write one note', text: 'Write one line in the journal about how something felt.', target: 1, progress: (s, ws) => s.journal.filter((j) => inWeek(j.day, ws)).length },
  { key: 'checkin-4', title: 'Answer the questions on 4 days', text: 'Open the app and say how you feel on four different days.', target: 4, progress: (s, ws) => new Set(s.checkIns.filter((c) => inWeek(c.day, ws)).map((c) => c.day)).size },
  { key: 'balance-chal', title: 'Balance challenge', text: 'Balance on one foot in any workout this week.', target: 1, progress: (s, ws) => done(s).filter((x) => inWeek(x.day, ws) && x.items.some((i) => i.exerciseId.startsWith('bal-') && i.sets.some((st) => st.done))).length },
  { key: 'water-4', title: 'Water on 4 days', text: 'Tap the water habit on four days this week.', target: 4, progress: (s, ws) => s.habits.filter((h) => h.habit === 'water' && h.done && inWeek(h.day, ws)).length },
  { key: 'sessions-2', title: 'Two workouts', text: 'Any two workouts this week, whatever color the days turn out.', target: 2, progress: (s, ws) => workouts(s).filter((x) => inWeek(x.day, ws)).length },
  { key: 'sleep-good-3', title: 'Three good sleeps', text: 'Say your sleep was Good or Great on three days.', target: 3, progress: (s, ws) => s.checkIns.filter((c) => inWeek(c.day, ws) && c.sleep >= 4).length },
  { key: 'coord-1', title: 'Quick feet', text: 'One Quick feet workout on a green day.', target: 1, progress: (s, ws) => done(s, 'coordination').filter((x) => inWeek(x.day, ws)).length }
];

/** Three missions for the week, picked by week number so they rotate. */
export function missionsForWeek(weekStart: Day, existing: Mission[]): Mission[] {
  const mine = existing.filter((m) => m.weekStart === weekStart);
  if (mine.length) return mine;
  const n = Math.floor(new Date(weekStart + 'T12:00:00').getTime() / (7 * 86400000));
  const picks = [MISSIONS[n % MISSIONS.length], MISSIONS[(n + 3) % MISSIONS.length], MISSIONS[(n + 5) % MISSIONS.length]];
  const uniq = [...new Map(picks.map((p) => [p.key, p])).values()];
  return uniq.map((p) => ({ id: newId(), weekStart, key: p.key, title: p.title, text: p.text, target: p.target, progress: 0 }));
}

export function updateMissionProgress(missions: Mission[], state: BadgeState): Mission[] {
  return missions.map((m) => {
    const def = MISSIONS.find((d) => d.key === m.key);
    if (!def) return m;
    const progress = Math.min(def.target, def.progress(state, m.weekStart));
    const doneAt = m.doneAt ?? (progress >= def.target ? nowIso() : undefined);
    return progress === m.progress && doneAt === m.doneAt ? m : { ...m, progress, doneAt };
  });
}
