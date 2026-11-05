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
  { key: 'first-checkin', title: 'Checked in', text: 'First readiness check-in. Knowing how you feel is step one.', test: (s) => s.checkIns.length >= 1 },
  { key: 'first-workout', title: 'First session', text: 'One session in the book.', test: (s) => workouts(s).length >= 1 },
  { key: 'five-sessions', title: 'Five sessions', text: 'Five sessions done. The habit is forming.', test: (s) => workouts(s).length >= 5 },
  { key: 'ten-sessions', title: 'Ten sessions', text: 'Ten sessions. This is a routine now.', test: (s) => workouts(s).length >= 10 },
  { key: 'twentyfive-sessions', title: 'Twenty-five sessions', text: 'Twenty-five. Serious consistency.', test: (s) => workouts(s).length >= 25 },
  { key: 'fifty-sessions', title: 'Fifty sessions', text: 'Fifty sessions. That is an athlete who takes care of his body.', test: (s) => workouts(s).length >= 50 },
  { key: 'good-call', title: 'Good call', text: 'Took a recovery day when the body asked for it. That is what smart athletes do.', test: (s) => s.checkIns.some((c) => c.color === 'orange' || c.color === 'red') },
  { key: 'stopped-smart', title: 'Stopped smart', text: 'Stopped a session because something did not feel right and told someone. Exactly right.', test: (s) => s.sessions.some((x) => x.status === 'stopped' && (x.stoppedReason === 'pain' || x.stoppedReason === 'dizzy' || x.stoppedReason === 'sick')) },
  { key: 'foundations-7', title: 'Foundations x7', text: 'Seven Daily Foundations done. A few easy minutes, a lot of days.', test: (s) => done(s, 'foundations').length >= 7 },
  { key: 'foundations-30', title: 'Foundations x30', text: 'Thirty Foundations. Your hips and ankles thank you.', test: (s) => done(s, 'foundations').length >= 30 },
  { key: 'balance-30', title: 'Steady as a rock', text: 'Held a single-leg balance for 30 seconds a side.', test: (s) => done(s).some((x) => x.items.some((i) => i.exerciseId.startsWith('bal-single') && i.sets.some((st) => st.done && (st.seconds ?? 0) >= 30))) },
  { key: 'pushup-level', title: 'Push-up level up', text: 'Moved to a harder push-up version.', test: (s) => done(s).some((x) => x.items.some((i) => i.exerciseId === 'up-kneepush' || i.exerciseId === 'up-pushup')) },
  { key: 'journal-5', title: 'Thinker', text: 'Five journal notes. Noticing how things feel is how you get better at them.', test: (s) => s.journal.length >= 5 },
  { key: 'three-week', title: 'Three in a week', text: 'Three sessions in one week.', test: (s) => { for (let i = 0; i < 28; i++) { const end = addDays(s.day, -i); const start = addDays(end, -6); if (workouts(s).filter((x) => x.day >= start && x.day <= end).length >= 3) return true; } return false; } },
  { key: 'coord-first', title: 'Quick feet', text: 'First athletic coordination session.', test: (s) => done(s, 'coordination').length >= 1 },
  { key: 'shortstop-first', title: 'Six on the field', text: 'First Shortstop Movement session.', test: (s) => done(s, 'movement').length >= 1 },
  { key: 'shortstop-10', title: 'Range', text: 'Ten Shortstop Movement sessions. The first step is getting automatic.', test: (s) => done(s, 'movement').length >= 10 },
  { key: 'habits-10', title: 'Habit builder', text: 'Ten healthy habits checked off.', test: (s) => s.habits.filter((h) => h.done).length >= 10 }
];

/** Badges newly earned given current state; the caller saves them. */
export function newBadges(state: BadgeState, have: Achievement[]): Achievement[] {
  const owned = new Set(have.map((a) => a.key));
  const ts = nowIso();
  return BADGES.filter((b) => !owned.has(b.key) && b.test(state)).map((b) => ({ id: newId(), key: b.key, title: b.title, text: b.text, earnedAt: ts }));
}

/** Monday of the week containing `day`. */
export function weekStartOf(day: Day): Day {
  const d = new Date(day + 'T12:00:00');
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  return addDays(day, -dow);
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
  { key: 'foundations-3', title: 'Foundations on 3 days', text: 'Three to six easy minutes, three different days.', target: 3, progress: (s, ws) => new Set(done(s, 'foundations').filter((x) => inWeek(x.day, ws)).map((x) => x.day)).size },
  { key: 'journal-1', title: 'Write one note', text: 'One line in the journal about how something felt.', target: 1, progress: (s, ws) => s.journal.filter((j) => inWeek(j.day, ws)).length },
  { key: 'checkin-4', title: 'Check in 4 days', text: 'Open the app and say how you feel on four days.', target: 4, progress: (s, ws) => new Set(s.checkIns.filter((c) => inWeek(c.day, ws)).map((c) => c.day)).size },
  { key: 'balance-chal', title: 'Balance challenge', text: 'Do single-leg balance in any session this week.', target: 1, progress: (s, ws) => done(s).filter((x) => inWeek(x.day, ws) && x.items.some((i) => i.exerciseId.startsWith('bal-') && i.sets.some((st) => st.done))).length },
  { key: 'water-4', title: 'Water on 4 days', text: 'Check off the water habit four days this week.', target: 4, progress: (s, ws) => s.habits.filter((h) => h.habit === 'water' && h.done && inWeek(h.day, ws)).length },
  { key: 'sessions-2', title: 'Two sessions', text: 'Any two sessions this week, whatever color the days turn out.', target: 2, progress: (s, ws) => workouts(s).filter((x) => inWeek(x.day, ws)).length },
  { key: 'sleep-good-3', title: 'Three good sleeps', text: 'Rate sleep Good or Great on three check-ins.', target: 3, progress: (s, ws) => s.checkIns.filter((c) => inWeek(c.day, ws) && c.sleep >= 4).length },
  { key: 'coord-1', title: 'Quick feet', text: 'One athletic coordination session on a fresh day.', target: 1, progress: (s, ws) => done(s, 'coordination').filter((x) => inWeek(x.day, ws)).length }
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
