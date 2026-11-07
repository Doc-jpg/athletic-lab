/**
 * The Daily Readiness Engine.
 *
 * Pure function: today's sports logs and check-in, plus the last several days of logs and
 * sessions, in; a color, the reasons, the body parts to leave alone, and a recommendation out.
 * The colors are training guidance for a healthy kid, never medical clearance.
 *
 * Hard rules never relax (same lesson as Dugout Lab's generator):
 *   RED    pain, illness, dizziness or other significant symptoms: no training, tell a parent. The Easy day (two
 *          minutes of breathing) is still offered, because there is always something and it keeps the habit.
 *   ORANGE heavy sports workload today (or an all-day tournament): the five-minute stretch is the whole workout.
 *   YELLOW moderate workload, or poor sleep/energy, or a strength session inside 48 hours: reduced volume, no loading.
 *   GREEN  fresh and recovered: the planned session.
 * Body-part blocks: heavy throwing blocks arm and shoulder loading for today and tomorrow;
 * intense basketball, sprinting or running blocks extra jumping, sprinting and hard leg work.
 */
import type { CheckIn, SportsLog, Session, LoadTag, ReadinessColor, Day, SessionKind, Settings } from './types';
import { addDays, daysBetween, DEMANDING_KINDS } from './types';

export interface ReadinessInput {
  day: Day;
  checkIn?: Pick<CheckIn, 'energy' | 'sleep' | 'soreness' | 'pain' | 'sick' | 'dizzy'> | null;
  /** Logs for today and the previous days (any range; the engine filters by day). */
  logs: SportsLog[];
  /** Sessions in any state; the engine looks at done ones. */
  sessions: Session[];
  settings: Pick<Settings, 'strengthDaysPerWeek'>;
  /** What the program would offer on a green day (A/B alternation, coordination). */
  planned?: { kind: SessionKind; templateId: string; name: string };
}

export interface Readiness {
  color: ReadinessColor;
  headline: string;
  reasons: string[];
  /** Load tags to avoid in any session offered today. */
  blocked: LoadTag[];
  blockedWhy: string[];
  /** The session the app offers (templateId). Never none: a red day still gets the Easy day. Reduced means one set per exercise and no loading. */
  offer: { templateId: string; name: string; kind: SessionKind; reduced: boolean };
  /** The Daily 5: fine today, fine but optional, or not today. */
  foundations: 'yes' | 'optional' | 'no';
  loadToday: number;
  loadYesterday: number;
  /** Things the parent should see (a flag is created for these). */
  alerts: string[];
}

const DUR = { short: 1, medium: 2, long: 3 } as const;
const INT = { easy: 1, medium: 2, hard: 3 } as const;

/** One log's load score, 1 to 9. Tournaments count as the top of the range. */
export function logLoad(l: SportsLog): number {
  if (l.tournament) return 9;
  return DUR[l.duration] * INT[l.intensity];
}

export function dayLoad(logs: SportsLog[], day: Day): number {
  return logs.filter((l) => l.day === day).reduce((s, l) => s + logLoad(l), 0);
}

function isHeavyLegs(l: SportsLog): boolean {
  const score = logLoad(l);
  return !!l.heavyRunning || !!l.tournament || ((l.sport === 'basketball' || l.sport === 'running' || l.sport === 'soccer' || l.sport === 'football') && score >= 6);
}

function isHeavyArm(l: SportsLog): boolean {
  return !!l.heavyThrowing || !!l.pitched || (l.pitchCount ?? 0) > 0;
}

export function assessReadiness(input: ReadinessInput): Readiness {
  const { day, checkIn, logs, sessions, settings } = input;
  const yesterday = addDays(day, -1);
  const todayLogs = logs.filter((l) => l.day === day);
  const yLogs = logs.filter((l) => l.day === yesterday);
  const loadToday = dayLoad(logs, day);
  const loadYesterday = dayLoad(logs, yesterday);
  const reasons: string[] = [];
  const alerts: string[] = [];
  const blocked = new Set<LoadTag>();
  const blockedWhy: string[] = [];

  // Body-part blocks carry one day: a heavy-throwing day blocks arm loading today and tomorrow.
  for (const l of todayLogs) {
    if (isHeavyArm(l)) {
      blocked.add('arm');
      blocked.add('shoulder');
      blockedWhy.push(l.pitched ? 'You pitched today, so no extra arm or shoulder work.' : 'Heavy throwing today, so no extra arm or shoulder work.');
    }
    if (isHeavyLegs(l)) {
      blocked.add('legs');
      blocked.add('jump');
      blocked.add('sprint');
      blockedWhy.push(l.tournament ? 'Tournament day: no extra leg work, sprints or jumps.' : `Hard ${l.sport === 'basketball' ? 'basketball' : 'running'} today, so no extra sprints, jumps or hard leg work.`);
    }
  }
  for (const l of yLogs) {
    if (isHeavyArm(l) && !blocked.has('arm')) {
      blocked.add('arm');
      blocked.add('shoulder');
      blockedWhy.push('Heavy throwing yesterday, so the arm still gets a day off from loading.');
    }
    if (l.tournament && !blocked.has('legs')) {
      blocked.add('legs');
      blocked.add('jump');
      blocked.add('sprint');
      blockedWhy.push('Tournament yesterday: legs get another easy day.');
    }
  }
  // Pitch Smart rest days: a pitch count logged in the last few days keeps the arm unloaded for the
  // table's rest days (11 to 14 years: 21 to 35 pitches 1 day, 36 to 50 two, 51 to 65 three, 66+ four).
  for (const l of logs) {
    const n = l.pitchCount ?? 0;
    if (n <= 0 || l.day > day) continue;
    const rest = pitchRestDays(n);
    const ago = daysBetween(l.day, day);
    if (ago >= 1 && ago <= rest && !blocked.has('arm')) {
      blocked.add('arm');
      blocked.add('shoulder');
      blockedWhy.push(`${n} pitches ${ago === 1 ? 'yesterday' : ago + ' days ago'} means ${rest} rest day${rest === 1 ? '' : 's'} for the arm (Pitch Smart).`);
    }
  }
  // Cumulative load brake (slow-down only): this week's sport load against the four-week average.
  const week = sumLoad(logs, addDays(day, -6), day);
  const month = sumLoad(logs, addDays(day, -27), day);
  const weeklyAvg = month / 4;
  const ratio = weeklyAvg > 0 && month >= 12 ? week / weeklyAvg : 0;

  // RED: symptoms. Nothing else matters.
  if (checkIn && (checkIn.pain || checkIn.sick || checkIn.dizzy)) {
    if (checkIn.pain) { reasons.push('You said something hurts. Pain is a stop sign, not something to push through.'); alerts.push('Reported pain at check-in.'); }
    if (checkIn.sick) { reasons.push('You feel sick. Rest, fluids, and tell a parent.'); alerts.push('Reported feeling sick at check-in.'); }
    if (checkIn.dizzy) { reasons.push('You feel dizzy. Sit down, drink some water, and tell a parent now.'); alerts.push('Reported dizziness at check-in.'); }
    return {
      color: 'red',
      headline: 'Easy day: breathe, and tell a parent',
      reasons: [...reasons, 'Tell a parent or another adult how you feel. If it is more than tired muscles, a doctor is the right call. The app does not decide that.', 'Two minutes of slow breathing still counts as your day. Nothing else today.'],
      blocked: [...blocked],
      blockedWhy,
      offer: { templateId: 'easy', name: 'Easy day', kind: 'recovery', reduced: true },
      foundations: 'no',
      loadToday,
      loadYesterday,
      alerts
    };
  }

  // Recent training: strength inside 48 hours, strength count this week, rest day this week.
  const done = sessions.filter((s) => s.status === 'done');
  // Strength and Shortstop Movement both load the legs: 48 hours between any two, and both count against the weekly cap.
  const lastStrength = done.filter((s) => DEMANDING_KINDS.includes(s.kind) && s.day <= day).sort((a, b) => b.day.localeCompare(a.day))[0];
  const hoursSinceStrength = lastStrength ? daysBetween(lastStrength.day, day) * 24 : Infinity;
  const weekStart = addDays(day, -6);
  const strengthThisWeek = done.filter((s) => DEMANDING_KINDS.includes(s.kind) && s.day >= weekStart && s.day < day).length;
  const activeDays = new Set<Day>();
  for (let i = 1; i <= 6; i++) {
    const d = addDays(day, -i);
    if (done.some((s) => s.day === d && s.kind !== 'foundations' && s.kind !== 'recovery') || logs.some((l) => l.day === d)) activeDays.add(d);
  }
  const noRestDay = activeDays.size >= 6;

  // Score the day.
  let color: ReadinessColor = 'green';
  const tournament = todayLogs.some((l) => l.tournament);
  const twoSports = todayLogs.length >= 2 && loadToday >= 4;
  if (tournament) { color = 'orange'; reasons.push('All-day tournament. That was the workout; a five-minute stretch is all that is left.'); alerts.push('Tournament day logged.'); }
  else if (loadToday >= 6) { color = 'orange'; reasons.push('A lot of sport already today (long and hard). Nothing extra is needed.'); }
  else if (twoSports) { color = 'orange'; reasons.push('Two activities today add up to a heavy day.'); }
  else if (checkIn?.energy === 1) { color = 'orange'; reasons.push('Energy is wiped out. Five easy minutes and rest is the smart move.'); }
  else if (checkIn?.soreness === 'alot') { color = 'orange'; reasons.push('Very sore. Sore muscles need a stretch and a night of sleep, not more work.'); }
  else if (ratio >= 1.5) { color = 'orange'; reasons.push('This week has been a lot heavier than usual on sport. A stretch today keeps the rest of the week good.'); alerts.push('Sports load this week is more than 1.5 times the four-week average.'); }
  else {
    if (ratio >= 1.3) { color = 'yellow'; reasons.push('Sports load this week is running high compared with the last month, so lighter today.'); }
    if (loadToday >= 3) { color = 'yellow'; reasons.push('Moderate sport today, so a lighter session.'); }
    if (loadYesterday >= 6 && color === 'green') { color = 'yellow'; reasons.push('Yesterday was a heavy day; today stays lighter.'); }
    if (checkIn?.energy === 2) { color = 'yellow'; reasons.push('Energy is low.'); }
    if (checkIn && checkIn.sleep <= 2) { color = 'yellow'; reasons.push('Short or rough sleep. Lighter today; tonight matters.'); }
    if (checkIn?.soreness === 'some') { color = 'yellow'; reasons.push('A little sore, so easier work today.'); }
    if (noRestDay) { color = 'yellow'; reasons.push('Six active days in a row. A real rest day this week is part of the plan.'); alerts.push('No rest day in the last six days.'); }
  }
  if (color === 'green') reasons.push('Fresh, slept okay, nothing heavy today or yesterday.');

  // What to offer.
  let offer: Readiness['offer'];
  let foundations: Readiness['foundations'] = 'yes';
  if (color === 'orange') {
    offer = { templateId: 'recovery', name: 'Five-minute stretch', kind: 'recovery', reduced: false };
    foundations = 'optional';
  } else if (color === 'yellow') {
    offer = { templateId: 'light', name: 'Easy workout', kind: 'light', reduced: true };
  } else {
    const planned = input.planned ?? { kind: 'strength', templateId: 'strength-a', name: 'Strength A' };
    const demanding = DEMANDING_KINDS.includes(planned.kind);
    if (demanding && hoursSinceStrength < 48) {
      reasons.push(`${lastStrength?.kind === 'movement' ? 'Shortstop Movement' : 'Strength'} was ${hoursSinceStrength === 0 ? 'today' : 'yesterday'}; legs get 48 hours between demanding days, so today is Quick feet.`);
      offer = { templateId: 'coordination', name: 'Quick feet', kind: 'coordination', reduced: false };
    } else if (demanding && strengthThisWeek >= settings.strengthDaysPerWeek) {
      reasons.push(`Already ${strengthThisWeek} strength or movement sessions this week (the plan is ${settings.strengthDaysPerWeek}), so today is Quick feet.`);
      offer = { templateId: 'coordination', name: 'Quick feet', kind: 'coordination', reduced: false };
    } else {
      offer = { templateId: planned.templateId, name: planned.name, kind: planned.kind, reduced: false };
    }
    // Blocks can take the planned session apart; coordination and Shortstop Movement are all legs.
    if ((offer.kind === 'coordination' || offer.kind === 'movement') && blocked.has('legs')) {
      reasons.push(`Legs already worked hard today, so it is the Easy workout instead of ${offer.kind === 'movement' ? 'Shortstop Movement' : 'Quick feet'}.`);
      offer = { templateId: 'light', name: 'Easy workout', kind: 'light', reduced: true };
    }
  }

  const headline = color === 'green' ? 'Fresh and ready' : color === 'yellow' ? 'Easy workout today' : 'Big day already: five-minute stretch';
  return { color, headline, reasons, blocked: [...blocked], blockedWhy, offer, foundations, loadToday, loadYesterday, alerts };
}

/** Pitch Smart rest days for ages 11 to 14. */
export function pitchRestDays(pitches: number): number {
  if (pitches <= 20) return 0;
  if (pitches <= 35) return 1;
  if (pitches <= 50) return 2;
  if (pitches <= 65) return 3;
  return 4;
}

function sumLoad(logs: SportsLog[], from: Day, to: Day): number {
  return logs.filter((l) => l.day >= from && l.day <= to).reduce((s, l) => s + logLoad(l), 0);
}

/** Days in a row with something done (any session, the Daily 5 and the Easy day included) or a sport logged. */
export function chain(sessions: Session[], logs: SportsLog[], day: Day): { length: number; aliveToday: boolean } {
  const days = new Set([...sessions.filter((s) => s.status === 'done').map((s) => s.day), ...logs.map((l) => l.day)]);
  const aliveToday = days.has(day);
  let d = aliveToday ? day : addDays(day, -1);
  let n = 0;
  while (days.has(d)) { n += 1; d = addDays(d, -1); }
  return { length: n, aliveToday };
}

export const COLOR_WORDS: Record<ReadinessColor, string> = { green: 'Green', yellow: 'Yellow', orange: 'Orange', red: 'Red' };
