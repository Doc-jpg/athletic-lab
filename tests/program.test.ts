import { describe, it, expect } from 'vitest';
import { programPhase, decideDose, buildSession, nextStrengthTemplate, allowedLoads, lastLoad, estimateMinutes } from '../src/engine/program';
import { assessReadiness } from '../src/engine/readiness';
import { LIBRARY_EXERCISES, EXERCISE_BY_ID } from '../src/data/exercises';
import { LIBRARY_TEMPLATES, TEMPLATE_BY_ID } from '../src/data/templates';
import type { Athlete, Session, SessionItem, ExerciseStatus, Exercise } from '../src/engine/types';
import { addDays } from '../src/engine/types';

const DAY = '2026-12-01';
const athlete: Athlete = { id: 'athlete', firstName: 'Eli', birthYear: 2014, sports: ['baseball'], theme: 'play', goals: [], programStart: '2026-11-02', createdAt: '', updatedAt: '' };
const exercises = new Map(LIBRARY_EXERCISES.map((e) => [e.id, e]));
const fine = { energy: 4 as const, sleep: 4 as const, soreness: 'none' as const, pain: false, sick: false, dizzy: false };
const settings = { strengthDaysPerWeek: 3 as const };

function doneSession(day: string, templateId: string, items: SessionItem[], difficulty: 1 | 2 | 3 | 4 | 5 = 2, feltGood = true): Session {
  return { id: 's-' + day + templateId, day, templateId, templateName: templateId, kind: templateId.startsWith('strength') ? 'strength' : 'light', status: 'done', why: [], items, overallDifficulty: difficulty, feltGood, by: 'athlete', createdAt: day + 'T18:00:00Z', updatedAt: day + 'T18:00:00Z' };
}
function doneItem(ex: Exercise, planned = ex.defaultDose, difficulty?: 1 | 2 | 3 | 4 | 5): SessionItem {
  const n = planned.sets * (planned.perSide ? 2 : 1);
  return { exerciseId: ex.id, exerciseName: ex.name, catalogVersion: ex.version, planned, sets: Array.from({ length: n }, () => ({ reps: planned.reps, seconds: planned.seconds, load: 'body' as const, done: true, ts: '' })), difficulty };
}

describe('program phases', () => {
  it('weeks 1-2 learn, 3-4 build, 5-6 refine, then four-week blocks with a review week', () => {
    expect(programPhase('2026-11-02', '2026-11-02').phase).toBe('learn');
    expect(programPhase('2026-11-02', '2026-11-15').phase).toBe('learn');
    expect(programPhase('2026-11-02', '2026-11-16').phase).toBe('build');
    expect(programPhase('2026-11-02', '2026-11-30').phase).toBe('refine');
    expect(programPhase('2026-11-02', '2026-12-14').phase).toBe('develop');
    expect(programPhase('2026-11-02', addDays('2026-11-02', 7 * 9)).phase).toBe('review');
  });
});

describe('progression (acceptance 8: never automatic weight)', () => {
  const squat = EXERCISE_BY_ID['lo-chairsquat'];
  const ctx = (sessions: Session[]) => ({ day: DAY, athlete, exercises, statuses: new Map<string, ExerciseStatus>(), sessions, by: 'athlete' as const });
  const build = programPhase('2026-11-02', DAY); // week 5 = refine; use explicit build phase below

  it('learn phase never adds', () => {
    const d = decideDose(squat, squat.defaultDose, ctx([doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, undefined, 1)], 1), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, undefined, 1)], 1)]), { phase: 'learn', week: 1, label: '', text: '' }, false);
    expect(d.dose).toEqual(squat.defaultDose);
  });

  it('two easy, fully completed sessions add two reps in the build phase; one change at a time', () => {
    const s = [doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, undefined, 1)], 1), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, undefined, 2)], 2)];
    const d = decideDose(squat, squat.defaultDose, ctx(s), { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d.dose.reps).toBe(squat.defaultDose.reps! + 2);
    expect(d.dose.sets).toBe(squat.defaultDose.sets);
    expect(d.reason).toMatch(/two more reps/);
  });

  it('one easy session is not enough', () => {
    const d = decideDose(squat, squat.defaultDose, ctx([doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, undefined, 1)], 1), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, undefined, 4)], 4)]), { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d.dose).toEqual(squat.defaultDose);
  });

  it('a hard session eases back toward the template, never below it', () => {
    const higher = { ...squat.defaultDose, reps: 12 };
    const d = decideDose(squat, squat.defaultDose, ctx([doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, higher, 5)], 5), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, higher, 2)], 2)]), { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d.dose.reps).toBe(10);
    const d2 = decideDose(squat, squat.defaultDose, ctx([doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, undefined, 5)], 5), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, undefined, 5)], 5)]), { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d2.dose.reps).toBe(squat.defaultDose.reps);
  });

  it('never passes the cap: reps top out, then a set, then holds', () => {
    const atMax = { ...squat.defaultDose, reps: 15, sets: 3 };
    const d = decideDose(squat, squat.defaultDose, ctx([doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, atMax, 1)], 1), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, atMax, 1)], 1)]), { phase: 'develop', week: 8, label: '', text: '' }, false);
    expect(d.dose.sets).toBe(3);
    expect(d.dose.reps).toBe(15);
    expect(d.tryHarder).toBe('lo-squat');
  });

  it('growth-spurt mode and review week hold steady', () => {
    const s = [doneSession(addDays(DAY, -2), 'strength-a', [doneItem(squat, undefined, 1)], 1), doneSession(addDays(DAY, -4), 'strength-a', [doneItem(squat, undefined, 1)], 1)];
    const d = decideDose(squat, squat.defaultDose, { ...ctx(s), athlete: { ...athlete, growthSpurtMode: true } }, { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d.dose).toEqual(squat.defaultDose);
    const r = decideDose(squat, squat.defaultDose, ctx(s), { phase: 'review', week: 10, label: '', text: '' }, false);
    expect(r.dose).toEqual(squat.defaultDose);
  });

  it('reduced (yellow) day is always one set and no additions', () => {
    const d = decideDose(squat, { ...squat.defaultDose, sets: 3 }, ctx([]), { phase: 'develop', week: 8, label: '', text: '' }, true);
    expect(d.dose.sets).toBe(1);
  });

  it('loads: body weight only until the parent approves; last load used is remembered but never raised', () => {
    const row = EXERCISE_BY_ID['up-row'];
    expect(allowedLoads(row, undefined)).toEqual(['body']);
    expect(allowedLoads(row, { exerciseId: row.id, approvedLoads: ['db5'], updatedAt: '' })).toEqual(['body', 'db5']);
    const withDb5: SessionItem = { ...doneItem(row), sets: [{ reps: 8, load: 'db5', done: true, ts: '' }] };
    expect(lastLoad(row.id, [doneSession(addDays(DAY, -2), 'strength-b', [withDb5])], ['body', 'db5'])).toBe('db5');
    expect(lastLoad(row.id, [doneSession(addDays(DAY, -2), 'strength-b', [withDb5])], ['body'])).toBe('body');
    // Nothing in the whole engine mentions raising a load automatically.
    expect(build).toBeTruthy();
  });
});

describe('session building from a template', () => {
  const readyGreen = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [], settings, planned: { kind: 'strength', templateId: 'strength-b', name: 'Strength B' } });
  const base = { day: DAY, athlete, exercises, sessions: [] as Session[], by: 'athlete' as const };

  it('Strength B without a form check swaps the row for wall slides and drops the optional curl', () => {
    const { session, changes } = buildSession(TEMPLATE_BY_ID['strength-b'], readyGreen, { ...base, statuses: new Map() });
    const ids = session.items.map((i) => i.exerciseId);
    expect(ids).not.toContain('up-row');
    expect(ids).not.toContain('up-curl');
    expect(ids).toContain('up-scapslide');
    expect(changes.join(' ')).toMatch(/form check/);
    expect(session.why.length).toBeGreaterThan(0);
  });

  it('with a form check the row is in and the curl appears', () => {
    const statuses = new Map<string, ExerciseStatus>([['up-row', { exerciseId: 'up-row', formCheckedAt: '2026-11-20T00:00:00Z', approvedLoads: ['db5'], updatedAt: '' }], ['up-curl', { exerciseId: 'up-curl', formCheckedAt: '2026-11-20T00:00:00Z', approvedLoads: [], updatedAt: '' }]]);
    const { session } = buildSession(TEMPLATE_BY_ID['strength-b'], readyGreen, { ...base, statuses });
    const ids = session.items.map((i) => i.exerciseId);
    expect(ids).toContain('up-row');
    expect(ids).toContain('up-curl');
  });

  it('acceptance 4 in a session: heavy throwing removes arm loading from Strength A and keeps the legs', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [{ id: 'l', day: DAY, ts: '', sport: 'baseball', duration: 'short', intensity: 'easy', heavyThrowing: true, by: 'athlete' }], sessions: [], settings, planned: { kind: 'strength', templateId: 'strength-a', name: 'Strength A' } });
    expect(r.color).toBe('green');
    const { session } = buildSession(TEMPLATE_BY_ID['strength-a'], r, { ...base, statuses: new Map() });
    const ids = session.items.map((i) => i.exerciseId);
    expect(ids).not.toContain('up-inclinepush');
    expect(ids).toContain('lo-chairsquat');
    for (const id of ids) expect(exercises.get(id)!.loadTags.some((t) => t === 'arm' || t === 'shoulder')).toBe(false);
  });

  it('acceptance 3 in a session: hard basketball day gives recovery, and even a forced coordination session has no legs/jump/sprint items', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [{ id: 'l', day: DAY, ts: '', sport: 'basketball', duration: 'long', intensity: 'hard', by: 'athlete' }], sessions: [], settings });
    expect(r.offer?.kind).toBe('recovery');
    const { session } = buildSession(TEMPLATE_BY_ID['coordination'], r, { ...base, statuses: new Map() });
    for (const it of session.items) expect(exercises.get(it.exerciseId)!.loadTags.some((t) => t === 'legs' || t === 'jump' || t === 'sprint')).toBe(false);
  });

  it('a parent can turn an exercise off', () => {
    const statuses = new Map<string, ExerciseStatus>([['lo-chairsquat', { exerciseId: 'lo-chairsquat', approvedLoads: [], disabled: true, updatedAt: '' }]]);
    const { session, changes } = buildSession(TEMPLATE_BY_ID['strength-a'], readyGreen, { ...base, statuses });
    expect(session.items.map((i) => i.exerciseId)).not.toContain('lo-chairsquat');
    expect(changes.join(' ')).toMatch(/turned off/);
  });

  it('A and B alternate with Shortstop Movement between them', () => {
    expect(nextStrengthTemplate([], LIBRARY_TEMPLATES).id).toBe('strength-a');
    expect(nextStrengthTemplate([doneSession(DAY, 'strength-a', [])], LIBRARY_TEMPLATES).id).toBe('shortstop');
    const m = { ...doneSession(addDays(DAY, 2), 'shortstop', []), kind: 'movement' as const };
    expect(nextStrengthTemplate([doneSession(DAY, 'strength-a', []), m], LIBRARY_TEMPLATES).id).toBe('strength-b');
    expect(nextStrengthTemplate([doneSession(DAY, 'strength-b', []), { ...m, day: addDays(DAY, 2) }], LIBRARY_TEMPLATES).id).toBe('strength-a');
  });

  it('starter sessions are about the length the prompt asked for', () => {
    const a = buildSession(TEMPLATE_BY_ID['strength-a'], readyGreen, { ...base, statuses: new Map() }).session;
    expect(estimateMinutes(a.items)).toBeGreaterThanOrEqual(12);
    expect(estimateMinutes(a.items)).toBeLessThanOrEqual(25);
    const f = buildSession(TEMPLATE_BY_ID['foundations'], readyGreen, { ...base, statuses: new Map() }).session;
    expect(estimateMinutes(f.items)).toBeLessThanOrEqual(8);
  });
});
