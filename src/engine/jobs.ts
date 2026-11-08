/**
 * Eli's jobs. Deren (2026-11-08): scoop the dog poop at least Monday evening (the trash goes out
 * Monday night for Tuesday pickup) and Thursday evening (the yard gets mowed Friday). Scooping more
 * often is fine. If something is in the way on a scoop day (practice, a game, rain, snow), think ahead
 * and scoop the day before. A scoop on the day before counts for that scoop day.
 */
import type { Day, HabitLog } from './types';
import { addDays } from './types';

export const SCOOP_DAYS = [1, 4] as const; // Monday, Thursday

export type ScoopState = 'done-today' | 'due-today' | 'due-tomorrow' | 'missed' | 'clear';

export interface ScoopStatus {
  state: ScoopState;
  headline: string;
  text: string;
  lastDone?: Day;
  /** The scoop day that was missed, when state is 'missed'. */
  missedDay?: Day;
}

const dow = (d: Day) => new Date(d + 'T12:00:00').getDay();
const WHY: Record<number, string> = { 1: 'The trash goes out tonight, so the poop has to be in the trash before then.', 4: 'The lawn gets mowed tomorrow, so the yard has to be clean tonight.' };
const DAYNAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function scooped(logs: HabitLog[], d: Day): boolean {
  return logs.some((l) => l.habit === 'scoop' && l.day === d && l.done);
}

/** Where the poop job stands today. Never a score; just what is due and why. */
export function scoopStatus(logs: HabitLog[], day: Day): ScoopStatus {
  const done = logs.filter((l) => l.habit === 'scoop' && l.done && l.day <= day).map((l) => l.day).sort();
  const lastDone = done[done.length - 1];
  const today = dow(day);
  const satisfied = (dueDay: Day) => scooped(logs, dueDay) || scooped(logs, addDays(dueDay, -1));
  // The most recent scoop day before today, and whether it was covered.
  let prevDue: Day | undefined;
  for (let i = 1; i <= 7; i++) { const d = addDays(day, -i); if ((SCOOP_DAYS as readonly number[]).includes(dow(d))) { prevDue = d; break; } }
  // A miss follows him for two days (Tue and Wed after a Monday; Fri and Sat after a Thursday), then the next scoop day takes over.
  const missed = !!prevDue && prevDue >= addDays(day, -2) && !satisfied(prevDue) && !done.some((d) => d > prevDue!);
  let nextDue: Day = day;
  for (let i = 1; i <= 7; i++) { const d = addDays(day, i); if ((SCOOP_DAYS as readonly number[]).includes(dow(d))) { nextDue = d; break; } }
  const nextLine = `Next scoop day: ${DAYNAME[dow(nextDue)]}${dow(nextDue) === 1 ? ' (trash night)' : ' (the lawn gets mowed Friday)'}.`;

  if (scooped(logs, day)) {
    return { state: 'done-today', headline: 'Scooped today. Done.', text: (SCOOP_DAYS as readonly number[]).includes(today) ? 'That covers today. ' : '', lastDone };
  }
  if (missed) {
    return { state: 'missed', headline: `You missed ${DAYNAME[dow(prevDue!)]}'s scoop.`, text: `Do it today, the first chance you get. ${WHY[dow(prevDue!)]}`, lastDone, missedDay: prevDue };
  }
  if ((SCOOP_DAYS as readonly number[]).includes(today)) {
    if (scooped(logs, addDays(day, -1))) return { state: 'clear', headline: 'You scooped yesterday, so today is covered.', text: 'Scoop again any time you see some.', lastDone };
    return { state: 'due-today', headline: 'Scoop day.', text: `${WHY[today]} Do it before it gets dark.`, lastDone };
  }
  if ((SCOOP_DAYS as readonly number[]).includes(dow(addDays(day, 1)))) {
    const tmr = dow(addDays(day, 1));
    return { state: 'due-tomorrow', headline: 'Tomorrow is a scoop day.', text: `Think ahead: do you have practice or a game tomorrow evening, or is rain or snow coming? If yes, scoop today instead. ${tmr === 1 ? 'Trash goes out tomorrow night.' : 'The lawn gets mowed Friday.'}`, lastDone };
  }
  return { state: 'clear', headline: 'No scoop due today.', text: `${nextLine} Scooping sooner is always fine.`, lastDone };
}

export const SCOOP_RULE = 'At least Monday evening (the trash goes out Monday night) and Thursday evening (the lawn gets mowed Friday). More often is fine. If something is in the way on a scoop day, scoop the day before.';
