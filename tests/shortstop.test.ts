import { describe, it, expect } from 'vitest';
import { LIBRARY_EXERCISES, EXERCISE_BY_ID } from '../src/data/exercises';
import { LIBRARY_TEMPLATES, TEMPLATE_BY_ID } from '../src/data/templates';
import { assessReadiness } from '../src/engine/readiness';
import { buildSession, decideDose, nextStrengthTemplate, estimateMinutes } from '../src/engine/program';
import type { Athlete, ExerciseStatus, Session, SessionItem, SportsLog, Exercise } from '../src/engine/types';
import { addDays } from '../src/engine/types';

const DAY = '2026-12-01';
const athlete: Athlete = { id: 'athlete', firstName: 'Eli', birthYear: 2014, sports: ['baseball'], theme: 'play', goals: [], programStart: '2026-11-02', createdAt: '', updatedAt: '' };
const exercises = new Map(LIBRARY_EXERCISES.map((e) => [e.id, e]));
const fine = { energy: 4 as const, sleep: 4 as const, soreness: 'none' as const, pain: false, sick: false, dizzy: false };
const settings = { strengthDaysPerWeek: 3 as const };
const SS = ['ss-ready', 'ss-crossover', 'ss-dropstep', 'ss-hipturn', 'ss-latlunge', 'ss-hinge', 'ss-skater', 'ss-quickfeet', 'ss-ninety', 'ss-carioca'];
const log = (p: Partial<SportsLog>): SportsLog => ({ id: 'l', day: DAY, ts: '', sport: 'basketball', duration: 'long', intensity: 'hard', by: 'athlete', ...p });
function doneSession(day: string, templateId: string, kind: Session['kind'], items: SessionItem[] = [], difficulty: 1 | 2 | 3 | 4 | 5 = 2): Session {
  return { id: 's-' + day + templateId, day, templateId, templateName: templateId, kind, status: 'done', why: [], items, overallDifficulty: difficulty, feltGood: true, by: 'athlete', createdAt: day + 'T18:00:00Z', updatedAt: day + 'T18:00:00Z' };
}
function doneItem(ex: Exercise, planned = ex.defaultDose, difficulty?: 1 | 2 | 3 | 4 | 5): SessionItem {
  const n = planned.sets * (planned.perSide ? 2 : 1);
  return { exerciseId: ex.id, exerciseName: ex.name, catalogVersion: ex.version, planned, sets: Array.from({ length: n }, () => ({ reps: planned.reps, seconds: planned.seconds, load: 'body' as const, done: true, ts: '' })), difficulty };
}

describe('Shortstop Movement: library gates', () => {
  it('all ten exercises exist, complete, in the infield area, body weight only, no loaded twisting', () => {
    for (const id of SS) {
      const e = EXERCISE_BY_ID[id];
      expect(e, id).toBeTruthy();
      expect(e.area).toBe('infield');
      expect(e.loads).toEqual(['body']);
      expect(e.needsFormCheck).toBeFalsy();
      expect(e.why.toLowerCase(), id).toMatch(/short|infield|ball|throw|field|glove/);
      expect(e.cues.length).toBeGreaterThanOrEqual(2);
      expect(e.commonErrors.length, id).toBeGreaterThanOrEqual(1);
      expect(e.skipIf.length, id).toBeGreaterThanOrEqual(1);
      expect(e.substitutes.length + (e.easier ? 1 : 0), id).toBeGreaterThanOrEqual(1);
      expect(e.defaultDose.sets).toBeLessThanOrEqual(3);
      if (e.maxDose) expect(e.maxDose.sets).toBeLessThanOrEqual(4);
    }
    expect(JSON.stringify(SS.map((id) => EXERCISE_BY_ID[id])).toLowerCase()).not.toMatch(/to failure|max effort|all-out|dumbbell|weighted/);
  });

  it('bound and hop items carry the jump tag; starts carry sprint; mobility items carry nothing', () => {
    expect(EXERCISE_BY_ID['ss-skater'].loadTags).toEqual(expect.arrayContaining(['legs', 'jump']));
    expect(EXERCISE_BY_ID['ss-ready'].loadTags).toEqual(expect.arrayContaining(['legs', 'jump']));
    for (const id of ['ss-crossover', 'ss-dropstep', 'ss-hipturn']) expect(EXERCISE_BY_ID[id].loadTags, id).toEqual(expect.arrayContaining(['legs', 'sprint']));
    expect(EXERCISE_BY_ID['ss-ninety'].loadTags).toEqual([]);
    expect(EXERCISE_BY_ID['ss-carioca'].loadTags).toEqual([]);
  });

  it('the template is 25 to 30 minutes, warm-up first, cooldown last, every section present', () => {
    const t = TEMPLATE_BY_ID['shortstop'];
    expect(t).toBeTruthy();
    expect(t.kind).toBe('movement');
    expect(t.sequence).toBe('M');
    expect(t.minutes).toBeGreaterThanOrEqual(25);
    expect(t.minutes).toBeLessThanOrEqual(30);
    const ids = t.items.map((i) => i.exerciseId);
    expect(EXERCISE_BY_ID[ids[0]].area).toBe('warmup');
    expect(EXERCISE_BY_ID[ids[ids.length - 1]].area).toBe('cooldown');
    expect(ids).toEqual(expect.arrayContaining(SS));
    for (const i of t.items) expect(EXERCISE_BY_ID[i.exerciseId], i.exerciseId).toBeTruthy();
    expect(LIBRARY_TEMPLATES.filter((x) => x.sequence === 'M').length).toBe(1);
  });
});

describe('Shortstop Movement: readiness, rotation, building and progression', () => {
  const base = { day: DAY, athlete, exercises, sessions: [] as Session[], by: 'athlete' as const, statuses: new Map<string, ExerciseStatus>() };
  const greenPlanned = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [], settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });

  it('on a green day the full session builds, about 25 to 30 minutes', () => {
    expect(greenPlanned.offer?.templateId).toBe('shortstop');
    const { session } = buildSession(TEMPLATE_BY_ID['shortstop'], greenPlanned, base);
    const ids = session.items.map((i) => i.exerciseId);
    expect(ids).toEqual(expect.arrayContaining(SS));
    const min = estimateMinutes(session.items);
    expect(min).toBeGreaterThanOrEqual(20);
    expect(min).toBeLessThanOrEqual(35);
    expect(session.kind).toBe('movement');
  });

  it('hard basketball day: the day is orange, and even a forced session has no bound, hop, sprint or leg items', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ heavyRunning: true })], sessions: [], settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });
    expect(r.color).toBe('orange');
    expect(r.offer?.kind).toBe('recovery');
    const { session } = buildSession(TEMPLATE_BY_ID['shortstop'], r, base);
    const ids = session.items.map((i) => i.exerciseId);
    expect(ids).not.toContain('ss-skater');
    expect(ids).not.toContain('ss-ready');
    expect(ids).not.toContain('ss-crossover');
    for (const id of ids) expect(exercises.get(id)!.loadTags.some((t) => t === 'legs' || t === 'jump' || t === 'sprint'), id).toBe(false);
    expect(ids).toContain('ss-ninety');
  });

  it('medium basketball with lots of jumping: yellow, legs blocked, Shortstop Movement becomes a light day', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ duration: 'medium', intensity: 'medium', heavyRunning: true })], sessions: [], settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });
    expect(r.color).toBe('yellow');
    expect(r.offer?.templateId).toBe('light');
  });

  it('yellow day (short sleep): one set each and the bound and hop are out', () => {
    const r = assessReadiness({ day: DAY, checkIn: { ...fine, sleep: 2 }, logs: [], sessions: [], settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });
    expect(r.color).toBe('yellow');
    expect(r.offer?.reduced).toBe(true);
    const { session } = buildSession(TEMPLATE_BY_ID['shortstop'], r, base);
    expect(session.items.every((i) => i.planned.sets === 1)).toBe(true);
    const ids = session.items.map((i) => i.exerciseId);
    expect(ids).not.toContain('ss-skater');
    expect(ids).not.toContain('ss-ready');
    expect(ids).toContain('ss-hinge');
  });

  it('red day: only the gentle day, never the movement session', () => {
    const r = assessReadiness({ day: DAY, checkIn: { ...fine, pain: true }, logs: [], sessions: [], settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });
    expect(r.offer.templateId).toBe('easy');
  });

  it('rotation: A, Shortstop, B, Shortstop, A', () => {
    const T = LIBRARY_TEMPLATES;
    expect(nextStrengthTemplate([], T).id).toBe('strength-a');
    const a = doneSession('2026-11-24', 'strength-a', 'strength');
    expect(nextStrengthTemplate([a], T).id).toBe('shortstop');
    const m1 = doneSession('2026-11-26', 'shortstop', 'movement');
    expect(nextStrengthTemplate([a, m1], T).id).toBe('strength-b');
    const b = doneSession('2026-11-28', 'strength-b', 'strength');
    expect(nextStrengthTemplate([a, m1, b], T).id).toBe('shortstop');
    const m2 = doneSession('2026-11-30', 'shortstop', 'movement');
    expect(nextStrengthTemplate([a, m1, b, m2], T).id).toBe('strength-a');
  });

  it('counts toward the 48-hour rule and the weekly cap like a strength day', () => {
    const yesterday = doneSession(addDays(DAY, -1), 'shortstop', 'movement');
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [yesterday], settings, planned: { kind: 'strength', templateId: 'strength-b', name: 'Strength B' } });
    expect(r.offer?.templateId).toBe('coordination');
    expect(r.reasons.join(' ')).toMatch(/Shortstop Movement was yesterday/);
    const strengthYesterday = doneSession(addDays(DAY, -1), 'strength-a', 'strength');
    const r2 = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [strengthYesterday], settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });
    expect(r2.offer?.templateId).toBe('coordination');
    const week = [doneSession(addDays(DAY, -2), 'strength-a', 'strength'), doneSession(addDays(DAY, -4), 'shortstop', 'movement'), doneSession(addDays(DAY, -6), 'strength-b', 'strength')];
    const r3 = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: week, settings, planned: { kind: 'movement', templateId: 'shortstop', name: 'Shortstop Movement' } });
    expect(r3.offer?.templateId).toBe('coordination');
    expect(r3.reasons.join(' ')).toMatch(/3 strength or Shortstop workouts/);
  });

  it('progression: learn phase holds; two easy sessions add two reps to the crossover, never automatic beyond that; growth spurt holds', () => {
    const ex = EXERCISE_BY_ID['ss-crossover'];
    const hist = [doneSession(addDays(DAY, -2), 'shortstop', 'movement', [doneItem(ex, undefined, 1)], 1), doneSession(addDays(DAY, -4), 'shortstop', 'movement', [doneItem(ex, undefined, 2)], 2)];
    const ctx = { ...base, sessions: hist };
    expect(decideDose(ex, ex.defaultDose, ctx, { phase: 'learn', week: 1, label: '', text: '' }, false).dose).toEqual(ex.defaultDose);
    const d = decideDose(ex, ex.defaultDose, ctx, { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d.dose.reps).toBe(ex.defaultDose.reps! + 2);
    expect(d.dose.sets).toBe(ex.defaultDose.sets);
    const g = decideDose(ex, ex.defaultDose, { ...ctx, athlete: { ...athlete, growthSpurtMode: true } }, { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(g.dose).toEqual(ex.defaultDose);
    // Holds cap at the exercise max.
    const atMax = { ...ex.defaultDose, reps: 6, sets: 3 };
    const h = [doneSession(addDays(DAY, -2), 'shortstop', 'movement', [doneItem(ex, atMax, 1)], 1), doneSession(addDays(DAY, -4), 'shortstop', 'movement', [doneItem(ex, atMax, 1)], 1)];
    const capped = decideDose(ex, ex.defaultDose, { ...base, sessions: h }, { phase: 'develop', week: 8, label: '', text: '' }, false);
    expect(capped.dose.reps).toBe(6);
    expect(capped.dose.sets).toBe(3);
  });

  it('the hold and the bound progress by seconds and reps, never by load', () => {
    const ready = EXERCISE_BY_ID['ss-ready'];
    const h = [doneSession(addDays(DAY, -2), 'shortstop', 'movement', [doneItem(ready, undefined, 1)], 1), doneSession(addDays(DAY, -4), 'shortstop', 'movement', [doneItem(ready, undefined, 1)], 1)];
    const d = decideDose(ready, ready.defaultDose, { ...base, sessions: h }, { phase: 'build', week: 3, label: '', text: '' }, false);
    expect(d.dose.seconds).toBe(ready.defaultDose.seconds! + 5);
    expect(ready.loads).toEqual(['body']);
  });
});
