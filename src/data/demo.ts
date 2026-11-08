/**
 * Sample data ("practice mode"): three weeks of made-up sessions, sports, check-ins and notes so the
 * app can be explored before Eli has any history. Every record id starts with "demo-" so it can be
 * removed in one tap. Nothing here is a real person's data.
 */
import type { AthleticLabDB } from '../db/db';
import { seedLibrary } from '../db/db';
import type { CheckIn, Session, SessionItem, SportsLog, JournalEntry, HabitLog } from '../engine/types';
import { addDays, todayDay } from '../engine/types';
import { EXERCISE_BY_ID } from './exercises';
import { TEMPLATE_BY_ID } from './templates';

export const DEMO_PREFIX = 'demo-';

function itemsFor(templateId: string, difficulty: 1 | 2 | 3 | 4 | 5, ts: string): SessionItem[] {
  const t = TEMPLATE_BY_ID[templateId];
  return t.items.filter((i) => !i.requiresFormCheck).map((i) => {
    const e = EXERCISE_BY_ID[i.exerciseId];
    const sets = Array.from({ length: i.dose.sets }, () => ({ reps: i.dose.reps, seconds: i.dose.seconds, load: 'body' as const, done: true, ts }));
    return { exerciseId: e.id, exerciseName: e.name, catalogVersion: e.version, planned: i.dose, sets, difficulty, feltGood: difficulty <= 3 };
  });
}

export async function loadDemo(database: AthleticLabDB): Promise<void> {
  await seedLibrary(database);
  const today = todayDay();
  const sessions: Session[] = [];
  const logs: SportsLog[] = [];
  const checkIns: CheckIn[] = [];
  const journal: JournalEntry[] = [];
  const habits: HabitLog[] = [];
  // 21 days back to yesterday. Pattern: Mon strength A, Tue baseball practice, Wed coordination, Thu strength B,
  // Sat basketball game (heavy), Sun rest; some foundations most days.
  for (let i = 21; i >= 1; i--) {
    const day = addDays(today, -i);
    const dow = new Date(day + 'T12:00:00').getDay();
    const ts = new Date(day + 'T17:30:00').toISOString();
    const id = (k: string) => `${DEMO_PREFIX}${k}-${day}`;
    const diff: 1 | 2 | 3 | 4 | 5 = i > 14 ? 3 : i > 7 ? 2 : 2;
    if (dow === 2 || dow === 4) logs.push({ id: id('log'), day, ts, sport: 'baseball', label: 'Practice', duration: 'medium', intensity: 'medium', heavyThrowing: dow === 4 && i % 2 === 0, by: 'athlete' });
    if (dow === 6) logs.push({ id: id('log'), day, ts, sport: 'basketball', label: 'Game', duration: 'long', intensity: 'hard', heavyRunning: true, by: 'athlete' });
    const energy = (dow === 0 ? 2 : dow === 6 ? 3 : 4) as CheckIn['energy'];
    const color = dow === 6 ? 'orange' : dow === 4 && i % 2 === 0 ? 'yellow' : dow === 0 ? 'yellow' : 'green';
    checkIns.push({ id: id('chk'), day, ts: new Date(day + 'T16:00:00').toISOString(), energy, sleep: dow === 0 ? 2 : 4, soreness: dow === 0 ? 'some' : 'none', pain: false, sick: false, dizzy: false, color, by: 'athlete' });
    if (dow === 1) sessions.push({ id: id('s'), day, templateId: 'strength-a', templateName: 'Strength A', kind: 'strength', status: 'done', readiness: 'green', why: ['Sample workout'], items: itemsFor('strength-a', diff, ts), startedAt: ts, finishedAt: ts, overallDifficulty: diff, feltGood: true, by: 'athlete', createdAt: ts, updatedAt: ts });
    if (dow === 3) sessions.push({ id: id('s'), day, templateId: 'coordination', templateName: 'Quick feet', kind: 'coordination', status: 'done', readiness: 'green', why: ['Sample workout'], items: itemsFor('coordination', 2, ts), startedAt: ts, finishedAt: ts, overallDifficulty: 2, feltGood: true, by: 'athlete', createdAt: ts, updatedAt: ts });
    if (dow === 4 && i % 2 === 1) sessions.push({ id: id('s'), day, templateId: 'strength-b', templateName: 'Strength B', kind: 'strength', status: 'done', readiness: 'green', why: ['Sample workout'], items: itemsFor('strength-b', diff, ts), startedAt: ts, finishedAt: ts, overallDifficulty: diff, feltGood: true, by: 'athlete', createdAt: ts, updatedAt: ts });
    if (dow === 4 && i % 2 === 0) sessions.push({ id: id('s'), day, templateId: 'light', templateName: 'Short gentle workout', kind: 'light', status: 'done', readiness: 'yellow', why: ['Heavy throwing today, so a light day'], items: itemsFor('light', 1, ts), startedAt: ts, finishedAt: ts, overallDifficulty: 1, feltGood: true, by: 'athlete', createdAt: ts, updatedAt: ts });
    if (dow !== 6 && dow !== 0 && i % 3 !== 0) sessions.push({ id: id('f'), day, templateId: 'foundations', templateName: 'Five-minute mini workout', kind: 'foundations', status: 'done', readiness: color as any, why: [], items: itemsFor('foundations', 1, ts), startedAt: ts, finishedAt: ts, by: 'athlete', createdAt: ts, updatedAt: ts });
    if (dow === 1 || dow === 6) journal.push({ id: id('j'), day, ts, updatedAt: ts, text: dow === 6 ? 'Legs were really tired after basketball.' : 'Push-ups were easier today.', isPrivate: false, by: 'athlete' });
    if (dow === 3) journal.push({ id: id('jp'), day, ts, updatedAt: ts, text: 'Private note: felt nervous before the game but it went fine.', isPrivate: true, by: 'athlete' });
    for (const h of ['water', 'meal', 'sleep'] as const) if ((i + h.length) % 4 !== 0) habits.push({ id: id('h-' + h), day, habit: h, done: true, ts });
  }
  // Balance seconds grow over the three weeks so the progress chart has a line to show.
  for (const s of sessions) for (const it of s.items) if (it.exerciseId === 'bal-single') { const i = 21 - Math.round((new Date(today + 'T12:00:00').getTime() - new Date(s.day + 'T12:00:00').getTime()) / 86400000); it.sets = it.sets.map((x) => ({ ...x, seconds: 15 + Math.min(20, i) })); it.planned = { ...it.planned, seconds: 15 + Math.min(20, i) }; }
  await database.transaction('rw', [database.sessions, database.sportsLogs, database.checkIns, database.journal, database.habits, database.meta], async () => {
    await database.sessions.bulkPut(sessions);
    await database.sportsLogs.bulkPut(logs);
    await database.checkIns.bulkPut(checkIns);
    await database.journal.bulkPut(journal);
    await database.habits.bulkPut(habits);
    await database.meta.put({ key: 'demoLoaded', value: true });
  });
}

export async function removeDemo(database: AthleticLabDB): Promise<number> {
  let n = 0;
  await database.transaction('rw', [database.sessions, database.sportsLogs, database.checkIns, database.journal, database.habits, database.achievements, database.missions, database.meta], async () => {
    for (const t of [database.sessions, database.sportsLogs, database.checkIns, database.journal, database.habits]) n += await (t as any).where('id').startsWith(DEMO_PREFIX).delete();
    await database.meta.put({ key: 'demoLoaded', value: false });
  });
  return n;
}
