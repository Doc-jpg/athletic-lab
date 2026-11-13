import { describe, it, expect } from 'vitest';
import { assessReadiness, pitchRestDays, logLoad } from '../src/engine/readiness';
import type { SportsLog, Session, CheckIn } from '../src/engine/types';
import { addDays } from '../src/engine/types';

const DAY = '2026-11-02';
const log = (p: Partial<SportsLog>): SportsLog => ({ id: 'l' + Math.random(), day: DAY, ts: DAY + 'T17:00:00Z', sport: 'baseball', duration: 'medium', intensity: 'medium', by: 'athlete', ...p });
const fine: Pick<CheckIn, 'energy' | 'sleep' | 'soreness' | 'pain' | 'sick' | 'dizzy'> = { energy: 4, sleep: 4, soreness: 'none', pain: false, sick: false, dizzy: false };
const settings = { strengthDaysPerWeek: 3 as const };
const strengthDone = (day: string): Session => ({ id: 's' + day, day, templateId: 'strength-a', templateName: 'Strength A', kind: 'strength', status: 'done', why: [], items: [], by: 'athlete', createdAt: day + 'T18:00:00Z', updatedAt: day + 'T18:00:00Z' });

describe('readiness engine', () => {
  it('fresh day is green with the planned strength session', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [], settings, planned: { kind: 'strength', templateId: 'strength-a', name: 'Strength A' } });
    expect(r.color).toBe('green');
    expect(r.offer?.templateId).toBe('strength-a');
    expect(r.blocked).toEqual([]);
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('acceptance 3: hard basketball with lots of running blocks legs, jumps and sprints, but one hard day is still a real workout', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'basketball', duration: 'long', intensity: 'hard', heavyRunning: true })], sessions: [], settings, planned: { kind: 'strength', templateId: 'strength-a', name: 'Strength A' } });
    expect(r.blocked).toEqual(expect.arrayContaining(['legs', 'jump', 'sprint']));
    expect(r.color).toBe('green');
    expect(r.offer).toMatchObject({ templateId: 'strength-a', reduced: false });
    expect(r.headline).toBe('Hard day, and still a real workout');
  });

  it('acceptance 3b: an hour of real basketball with lots of jumping blocks legs but keeps the day green (he still lifts, minus the leg work)', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'basketball', duration: 'medium', intensity: 'medium', heavyRunning: true })], sessions: [], settings, planned: { kind: 'strength', templateId: 'strength-a', name: 'Strength A' } });
    expect(r.blocked).toEqual(expect.arrayContaining(['legs', 'jump']));
    expect(r.color).toBe('green');
    expect(r.offer?.templateId).toBe('strength-a');
  });

  it('2026-11-08: a driveway shoot-around is "messing around" and scores nothing, so it is a normal lifting day', () => {
    for (const duration of ['short', 'medium'] as const) {
      const l = log({ sport: 'basketball', duration, intensity: 'messing' });
      expect(logLoad(l)).toBe(0);
    }
    expect(logLoad(log({ sport: 'basketball', duration: 'long', intensity: 'messing' }))).toBe(1);
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'basketball', duration: 'long', intensity: 'messing' })], sessions: [], settings, planned: { kind: 'strength', templateId: 'strength-a', name: 'Strength A' } });
    expect(r.color).toBe('green');
    expect(r.offer?.templateId).toBe('strength-a');
    expect(r.blocked).toEqual([]);
    expect(r.reasons.join(' ')).toMatch(/Messing around .* not a workout/);
  });

  it('2026-11-12: hard days in a row decide the workout. First hard day full, second shorter, third gentle', () => {
    const plan = { kind: 'strength' as const, templateId: 'strength-a', name: 'Strength A' };
    const hard = (ago: number) => log({ day: addDays(DAY, -ago), sport: 'basketball', duration: 'long', intensity: 'hard' });
    const hourReal = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'baseball', duration: 'medium', intensity: 'medium' })], sessions: [], settings, planned: plan });
    expect(hourReal.hardStreak).toBe(0);
    expect(hourReal.reasons.join(' ')).toMatch(/not a hard sport day/);
    // Day 1 of tryouts: a long all-out one. Still the full strength workout, jumps and sprints out, leg strength in.
    const d1 = assessReadiness({ day: DAY, checkIn: fine, logs: [hard(0)], sessions: [], settings, planned: plan });
    expect(d1.hardStreak).toBe(1);
    expect(d1.color).toBe('green');
    expect(d1.offer).toMatchObject({ templateId: 'strength-a', reduced: false });
    expect(d1.blocked).toEqual(expect.arrayContaining(['jump', 'sprint']));
    expect(d1.blocked).not.toContain('legs');
    expect(d1.reasons.join(' ')).toMatch(/One hard day does not change your workout/);
    // Day 2 in a row: the strength workout, each move once.
    const d2 = assessReadiness({ day: DAY, checkIn: fine, logs: [hard(0), hard(1)], sessions: [], settings, planned: plan });
    expect(d2.hardStreak).toBe(2);
    expect(d2.color).toBe('yellow');
    expect(d2.offer).toMatchObject({ templateId: 'strength-a', reduced: true });
    expect(d2.headline).toBe('A shorter workout today');
    // Day 3 and after: the Short gentle workout. Never the stretch from sport alone.
    for (const n of [3, 5]) {
      const r = assessReadiness({ day: DAY, checkIn: fine, logs: Array.from({ length: n }, (_, i) => hard(i)), sessions: [], settings, planned: plan });
      expect(r.hardStreak).toBe(n);
      expect(r.offer.templateId).toBe('light');
      expect(r.color).toBe('yellow');
    }
    // A day off in the middle resets the count.
    const reset = assessReadiness({ day: DAY, checkIn: fine, logs: [hard(0), hard(2), hard(3)], sessions: [], settings, planned: plan });
    expect(reset.hardStreak).toBe(1);
    expect(reset.offer).toMatchObject({ templateId: 'strength-a', reduced: false });
    // Hard yesterday and the day before, nothing hard today: a normal day.
    const after = assessReadiness({ day: DAY, checkIn: fine, logs: [hard(1), hard(2)], sessions: [], settings, planned: plan });
    expect(after.hardStreak).toBe(0);
    expect(after.offer).toMatchObject({ templateId: 'strength-a', reduced: false });
  });

  it('second hard day with strength done yesterday: two days between strength still holds, so the gentle workout', () => {
    const plan = { kind: 'strength' as const, templateId: 'strength-b', name: 'Strength B' };
    const hard = (ago: number) => log({ day: addDays(DAY, -ago), sport: 'basketball', duration: 'long', intensity: 'hard' });
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [hard(0), hard(1)], sessions: [strengthDone(addDays(DAY, -1))], settings, planned: plan });
    expect(r.offer.templateId).toBe('light');
    expect(r.reasons.join(' ')).toMatch(/two days between/);
  });

  it('how he feels still wins: worn out or very sore on a hard day is the stretch; a little sore is gentle', () => {
    const hard = log({ sport: 'basketball', duration: 'long', intensity: 'hard' });
    expect(assessReadiness({ day: DAY, checkIn: { ...fine, energy: 1 }, logs: [hard], sessions: [], settings }).offer.kind).toBe('recovery');
    expect(assessReadiness({ day: DAY, checkIn: { ...fine, soreness: 'alot' }, logs: [hard], sessions: [], settings }).offer.kind).toBe('recovery');
    expect(assessReadiness({ day: DAY, checkIn: { ...fine, soreness: 'some' }, logs: [hard], sessions: [], settings }).offer.templateId).toBe('light');
  });

  it('two activities in one day make one hard day, not a stretch day', () => {
    const plan = { kind: 'strength' as const, templateId: 'strength-a', name: 'Strength A' };
    const mixed = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'basketball', duration: 'medium', intensity: 'messing' }), log({ sport: 'baseball', duration: 'medium', intensity: 'medium' })], sessions: [], settings, planned: plan });
    expect(mixed.hardStreak).toBe(0);
    expect(mixed.offer?.templateId).toBe('strength-a');
    const two = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'pe', duration: 'medium', intensity: 'medium' }), log({ sport: 'baseball', duration: 'medium', intensity: 'medium' })], sessions: [], settings, planned: plan });
    expect(two.hardStreak).toBe(1);
    expect(two.color).toBe('green');
    expect(two.offer).toMatchObject({ templateId: 'strength-a', reduced: false });
  });

  it('old logs without the new effort level still score as before', () => {
    const l = { ...log({ duration: 'medium' }), intensity: 'medium' as const };
    expect(logLoad(l)).toBe(4);
  });

  it('acceptance 4: heavy throwing suppresses demanding arm work today and tomorrow', () => {
    const today = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ heavyThrowing: true, duration: 'short', intensity: 'easy' })], sessions: [], settings });
    expect(today.blocked).toEqual(expect.arrayContaining(['arm', 'shoulder']));
    const tomorrow = assessReadiness({ day: addDays(DAY, 1), checkIn: fine, logs: [log({ heavyThrowing: true })], sessions: [], settings });
    expect(tomorrow.blocked).toEqual(expect.arrayContaining(['arm', 'shoulder']));
    const dayAfter = assessReadiness({ day: addDays(DAY, 2), checkIn: fine, logs: [log({ heavyThrowing: true })], sessions: [], settings });
    expect(dayAfter.blocked).not.toContain('arm');
  });

  it('pitch counts extend the arm rest by the Pitch Smart table', () => {
    expect(pitchRestDays(20)).toBe(0);
    expect(pitchRestDays(35)).toBe(1);
    expect(pitchRestDays(50)).toBe(2);
    expect(pitchRestDays(65)).toBe(3);
    expect(pitchRestDays(66)).toBe(4);
    const r = assessReadiness({ day: addDays(DAY, 3), checkIn: fine, logs: [log({ pitched: true, pitchCount: 60 })], sessions: [], settings });
    expect(r.blocked).toContain('arm');
    const r2 = assessReadiness({ day: addDays(DAY, 4), checkIn: fine, logs: [log({ pitched: true, pitchCount: 60 })], sessions: [], settings });
    expect(r2.blocked).not.toContain('arm');
  });

  it('acceptance 5: a tournament counts as two hard days: a shorter strength workout with the legs left alone, and the parent is told', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ tournament: true })], sessions: [], settings });
    expect(r.hardStreak).toBe(2);
    expect(r.color).toBe('yellow');
    expect(r.offer).toMatchObject({ kind: 'strength', reduced: true });
    expect(r.blocked).toEqual(expect.arrayContaining(['legs', 'jump', 'sprint']));
    expect(r.alerts.some((a) => /Tournament/.test(a))).toBe(true);
    const day2 = assessReadiness({ day: addDays(DAY, 1), checkIn: fine, logs: [log({ tournament: true }), log({ day: addDays(DAY, 1), tournament: true })], sessions: [], settings });
    expect(day2.offer.templateId).toBe('light');
    const next = assessReadiness({ day: addDays(DAY, 1), checkIn: fine, logs: [log({ tournament: true })], sessions: [], settings });
    expect(next.color).toBe('green');
    expect(next.blocked).toContain('legs');
  });

  it('acceptance 6: pain, illness or dizziness is red: only the gentle day (breathing) is offered, with a parent alert', () => {
    for (const k of ['pain', 'sick', 'dizzy'] as const) {
      const r = assessReadiness({ day: DAY, checkIn: { ...fine, [k]: true }, logs: [], sessions: [], settings });
      expect(r.color).toBe('red');
      expect(r.offer.templateId).toBe('easy');
      expect(r.offer.reduced).toBe(true);
      expect(r.foundations).toBe('no');
      expect(r.alerts.length).toBeGreaterThan(0);
      expect(r.reasons.join(' ')).toMatch(/parent/);
    }
  });

  it('red beats everything, even a fresh day with no sport', () => {
    const r = assessReadiness({ day: DAY, checkIn: { ...fine, pain: true }, logs: [], sessions: [], settings });
    expect(r.color).toBe('red');
  });

  it('48 hours between strength sessions: strength yesterday turns a green day into coordination', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [strengthDone(addDays(DAY, -1))], settings, planned: { kind: 'strength', templateId: 'strength-b', name: 'Strength B' } });
    expect(r.color).toBe('green');
    expect(r.offer?.templateId).toBe('coordination');
    const r2 = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [strengthDone(addDays(DAY, -2))], settings, planned: { kind: 'strength', templateId: 'strength-b', name: 'Strength B' } });
    expect(r2.offer?.templateId).toBe('strength-b');
  });

  it('weekly strength cap: three already this week means coordination', () => {
    const sessions = [strengthDone(addDays(DAY, -2)), strengthDone(addDays(DAY, -4)), strengthDone(addDays(DAY, -6))];
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions, settings, planned: { kind: 'strength', templateId: 'strength-b', name: 'Strength B' } });
    expect(r.offer?.templateId).toBe('coordination');
    const r2 = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: sessions.slice(0, 2), settings: { strengthDaysPerWeek: 2 }, planned: { kind: 'strength', templateId: 'strength-b', name: 'Strength B' } });
    expect(r2.offer?.templateId).toBe('coordination');
  });

  it('poor sleep or low energy makes a yellow day with a reduced light session', () => {
    const r = assessReadiness({ day: DAY, checkIn: { ...fine, sleep: 2 }, logs: [], sessions: [], settings });
    expect(r.color).toBe('yellow');
    expect(r.offer?.reduced).toBe(true);
    const r2 = assessReadiness({ day: DAY, checkIn: { ...fine, energy: 1 }, logs: [], sessions: [], settings });
    expect(r2.color).toBe('orange');
  });

  it('a hard day yesterday does not change a normal today', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ day: addDays(DAY, -1), sport: 'basketball', duration: 'long', intensity: 'hard' })], sessions: [], settings });
    expect(r.color).toBe('green');
  });

  it('six easy active days in a row change nothing (something every day is the plan); six hard ones tell the parent', () => {
    const easy = Array.from({ length: 6 }, (_, i) => log({ day: addDays(DAY, -(i + 1)), duration: 'short', intensity: 'easy' }));
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: easy, sessions: [], settings });
    expect(r.color).toBe('green');
    expect(r.alerts).toEqual([]);
    const hardOnes = Array.from({ length: 6 }, (_, i) => log({ day: addDays(DAY, -i), duration: 'long', intensity: 'hard' }));
    const h = assessReadiness({ day: DAY, checkIn: fine, logs: hardOnes, sessions: [], settings });
    expect(h.offer.templateId).toBe('light');
    expect(h.alerts.some((a) => /6 hard sport days in a row/.test(a))).toBe(true);
  });

  it('a week far above the month average tells the parent but does not change the day, and needs three weeks of history', () => {
    const logs: SportsLog[] = [];
    for (let i = 7; i < 28; i++) if (i % 3 === 0) logs.push(log({ day: addDays(DAY, -i), duration: 'short', intensity: 'easy' }));
    for (let i = 1; i <= 6; i++) logs.push(log({ day: addDays(DAY, -i), duration: 'medium', intensity: 'medium' }));
    const r = assessReadiness({ day: DAY, checkIn: fine, logs, sessions: [], settings });
    expect(r.color).toBe('green');
    expect(r.alerts.some((a) => /four-week average/.test(a))).toBe(true);
    // A brand-new app: the only history is this week. No alert, no change.
    const fresh = assessReadiness({ day: DAY, checkIn: fine, logs: logs.filter((l) => l.day >= addDays(DAY, -6)), sessions: [], settings });
    expect(fresh.color).toBe('green');
    expect(fresh.alerts).toEqual([]);
  });

  it('load scores are bounded and tournaments are the top', () => {
    expect(logLoad(log({ duration: 'short', intensity: 'easy' }))).toBe(1);
    expect(logLoad(log({ duration: 'long', intensity: 'hard' }))).toBe(9);
    expect(logLoad(log({ tournament: true, duration: 'short', intensity: 'easy' }))).toBe(9);
  });

  it('never claims medical clearance', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [], sessions: [], settings });
    expect(JSON.stringify(r)).not.toMatch(/cleared|medical clearance/i);
  });
});
