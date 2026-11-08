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

  it('acceptance 3: heavy basketball suppresses intense leg work (legs, jump, sprint blocked) and turns the day orange', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'basketball', duration: 'long', intensity: 'hard', heavyRunning: true })], sessions: [], settings });
    expect(r.blocked).toEqual(expect.arrayContaining(['legs', 'jump', 'sprint']));
    expect(r.color).toBe('orange');
    expect(r.offer?.kind).toBe('recovery');
  });

  it('acceptance 3b: a medium basketball day with lots of jumping still blocks legs and goes yellow', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ sport: 'basketball', duration: 'medium', intensity: 'medium', heavyRunning: true })], sessions: [], settings });
    expect(r.blocked).toEqual(expect.arrayContaining(['legs', 'jump']));
    expect(r.color).toBe('yellow');
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

  it('acceptance 5: an exhausting tournament offers recovery, not a workout, and flags the parent', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ tournament: true })], sessions: [], settings });
    expect(r.color).toBe('orange');
    expect(r.offer?.kind).toBe('recovery');
    expect(r.foundations).toBe('optional');
    expect(r.alerts.some((a) => /Tournament/.test(a))).toBe(true);
    const next = assessReadiness({ day: addDays(DAY, 1), checkIn: fine, logs: [log({ tournament: true })], sessions: [], settings });
    expect(next.color).toBe('yellow');
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

  it('a heavy day yesterday keeps today lighter', () => {
    const r = assessReadiness({ day: DAY, checkIn: fine, logs: [log({ day: addDays(DAY, -1), sport: 'basketball', duration: 'long', intensity: 'hard' })], sessions: [], settings });
    expect(r.color).toBe('yellow');
  });

  it('six active days in a row asks for a rest day and tells the parent', () => {
    const logs = Array.from({ length: 6 }, (_, i) => log({ day: addDays(DAY, -(i + 1)), duration: 'short', intensity: 'easy' }));
    const r = assessReadiness({ day: DAY, checkIn: fine, logs, sessions: [], settings });
    expect(r.color).toBe('yellow');
    expect(r.alerts.some((a) => /rest day/.test(a))).toBe(true);
  });

  it('cumulative load brake: a week far above the month average forces recovery', () => {
    const logs: SportsLog[] = [];
    for (let i = 7; i < 28; i++) if (i % 3 === 0) logs.push(log({ day: addDays(DAY, -i), duration: 'short', intensity: 'easy' }));
    for (let i = 1; i <= 6; i++) logs.push(log({ day: addDays(DAY, -i), duration: 'medium', intensity: 'medium' }));
    const r = assessReadiness({ day: DAY, checkIn: fine, logs, sessions: [], settings });
    expect(['orange', 'yellow']).toContain(r.color);
    expect(r.reasons.join(' ')).toMatch(/busier/);
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
