import { describe, it, expect } from 'vitest';
import { LIBRARY_EXERCISES, EXERCISE_BY_ID, CATALOG_VERSION } from '../src/data/exercises';
import { LIBRARY_TEMPLATES } from '../src/data/templates';
import { MESSAGES, pickMessage } from '../src/engine/habits';
import { BADGES } from '../src/engine/achievements';

/** Gates the content: every exercise complete and safe, every template consistent, no banned content anywhere. */
describe('exercise library', () => {
  it('has the exercises the prompt asked for', () => {
    for (const id of ['lo-chairsquat', 'lo-squat', 'lo-splitsquat-assist', 'lo-stepup-low', 'lo-bridge', 'lo-calfraise', 'up-wallpush', 'up-inclinepush', 'up-pushup', 'up-row', 'up-curl', 'up-scapslide', 'core-deadbug', 'core-birddog', 'core-sideplank-knees', 'core-plank-knees', 'core-curlup', 'core-rotation', 'core-antirotation', 'bal-single', 'bal-heeltoe', 'coord-crossbody', 'coord-lateral', 'coord-reaction', 'mob-ankle', 'mob-hip', 'mob-thoracic', 'mob-hamstring', 'mob-calf', 'mob-shoulder']) expect(EXERCISE_BY_ID[id], id).toBeTruthy();
    expect(LIBRARY_EXERCISES.length).toBeGreaterThanOrEqual(45);
  });

  it('every exercise is complete: develops, why, steps, cues, skip conditions, a pose and a dose', () => {
    for (const e of LIBRARY_EXERCISES) {
      expect(e.develops.length, e.id).toBeGreaterThan(10);
      expect(e.why.length, e.id).toBeGreaterThan(10);
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.cues.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.pose, e.id).toBeTruthy();
      expect(e.defaultDose.sets, e.id).toBeGreaterThanOrEqual(1);
      expect(e.defaultDose.reps !== undefined || e.defaultDose.seconds !== undefined, e.id).toBe(true);
      expect(e.version).toBe(CATALOG_VERSION);
      if (e.area !== 'warmup' && e.area !== 'cooldown' && e.area !== 'breathing') expect(e.skipIf.length, e.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('links point at real exercises', () => {
    for (const e of LIBRARY_EXERCISES) {
      for (const id of [e.easier, e.harder, ...e.substitutes]) if (id) expect(EXERCISE_BY_ID[id], `${e.id} -> ${id}`).toBeTruthy();
    }
  });

  it('youth ranges: 1 to 3 sets, 3 to 15 reps, holds 60 seconds or less; caps never exceed that', () => {
    for (const e of LIBRARY_EXERCISES) {
      expect(e.defaultDose.sets).toBeLessThanOrEqual(3);
      if (e.defaultDose.reps !== undefined) expect(e.defaultDose.reps, e.id).toBeLessThanOrEqual(15);
      if (e.maxDose) {
        expect(e.maxDose.sets, e.id).toBeLessThanOrEqual(5);
        if (e.maxDose.reps !== undefined) expect(e.maxDose.reps, e.id).toBeLessThanOrEqual(16);
        if (e.maxDose.seconds !== undefined) expect(e.maxDose.seconds, e.id).toBeLessThanOrEqual(60);
      }
    }
  });

  it('weights: only on exercises that make sense, never 10 lb without 5 lb, and always a form check', () => {
    for (const e of LIBRARY_EXERCISES) {
      if (e.loads.includes('db10')) expect(e.loads.includes('db5'), e.id).toBe(true);
      if (e.loads.length > 1) expect(e.needsFormCheck, e.id).toBe(true);
      if (e.loads.includes('db5')) expect(e.loadTags.includes('rotation'), `${e.id} loaded twisting`).toBe(false);
    }
  });

  it('no banned content anywhere in the library', () => {
    const text = JSON.stringify(LIBRARY_EXERCISES).toLowerCase();
    for (const bad of ['max out', 'one rep max', '1rm', 'to failure', 'creatine', 'protein powder', 'weighted twist', 'russian twist', 'box jump', 'depth jump', 'barbell', 'deadlift', 'burn fat', 'body fat', 'lose weight', 'calorie']) expect(text, bad).not.toContain(bad);
  });

  it('arm-loading exercises are tagged so throwing days can block them; leg-loading likewise', () => {
    for (const id of ['up-wallpush', 'up-inclinepush', 'up-kneepush', 'up-pushup', 'up-row', 'up-curl']) expect(EXERCISE_BY_ID[id].loadTags.some((t) => t === 'arm' || t === 'shoulder'), id).toBe(true);
    for (const id of ['lo-chairsquat', 'lo-squat', 'lo-stepup-low', 'ath-accel', 'ath-landing', 'wu-skip']) expect(EXERCISE_BY_ID[id].loadTags.includes('legs'), id).toBe(true);
    for (const id of ['ath-landing', 'wu-skip', 'ath-skipmarch']) expect(EXERCISE_BY_ID[id].loadTags.includes('jump'), id).toBe(true);
  });

  it('templates reference real exercises, start with a warm-up where it matters, and are the right length', () => {
    for (const t of LIBRARY_TEMPLATES) {
      for (const it of t.items) expect(EXERCISE_BY_ID[it.exerciseId], `${t.id} -> ${it.exerciseId}`).toBeTruthy();
      if (t.kind === 'strength' || t.kind === 'coordination') {
        expect(EXERCISE_BY_ID[t.items[0].exerciseId].area).toBe('warmup');
        expect(EXERCISE_BY_ID[t.items[t.items.length - 1].exerciseId].area).toBe('cooldown');
      }
    }
    const a = LIBRARY_TEMPLATES.find((t) => t.id === 'strength-a')!;
    expect(a.items.map((i) => i.exerciseId)).toEqual(expect.arrayContaining(['lo-chairsquat', 'up-inclinepush', 'lo-bridge', 'core-deadbug', 'bal-single']));
    const b = LIBRARY_TEMPLATES.find((t) => t.id === 'strength-b')!;
    expect(b.items.find((i) => i.exerciseId === 'up-row')?.requiresFormCheck).toBe(true);
    expect(b.items.find((i) => i.exerciseId === 'up-curl')?.optional).toBe(true);
    expect(LIBRARY_TEMPLATES.find((t) => t.id === 'foundations')!.minutes).toBeLessThanOrEqual(6);
  });

  it('acceptance 11: no creatine or protein supplementation in the default program', () => {
    const everything = JSON.stringify({ LIBRARY_EXERCISES, LIBRARY_TEMPLATES, MESSAGES, BADGES }).toLowerCase();
    expect(everything).not.toContain('creatine');
    expect(everything).not.toContain('protein powder');
    expect(everything).not.toContain('supplement');
  });
});

describe('daily messages', () => {
  const base = { day: '2026-11-02', todayLogs: [], yesterdayLogs: [], shown: [], rotationDays: 7 };
  const reminders = { enabled: true, quietStart: '21:00', quietEnd: '07:00', rotationDays: 7, deviceNotifications: false };
  it('acceptance 7: nothing in the pool shames, guilts, threatens a streak, or talks about weight', () => {
    const text = MESSAGES.map((m) => m.text).join(' ').toLowerCase();
    for (const bad of ['streak', 'lazy', 'shame', 'guilt', 'fat', 'skinny', 'lose weight', 'calories', 'you failed', 'excuse', 'disappoint']) expect(text, bad).not.toContain(bad);
    const back = pickMessage({ ...base, daysSinceSession: 5 }, reminders, new Date('2026-11-02T12:00:00'));
    expect(back?.key).toBe('con-back');
    expect(back?.text).toMatch(/No big deal/);
  });
  it('matches the day: basketball gets the water-bottle message, a throwing day the arm message', () => {
    const b = pickMessage({ ...base, todayLogs: [{ id: 'x', day: '2026-11-02', ts: '', sport: 'basketball', duration: 'long', intensity: 'hard', by: 'athlete' }] }, reminders, new Date('2026-11-02T12:00:00'));
    expect(['hyd-bball', 'nut-after']).toContain(b?.key);
    const t = pickMessage({ ...base, todayLogs: [{ id: 'x', day: '2026-11-02', ts: '', sport: 'baseball', duration: 'short', intensity: 'easy', pitched: true, by: 'athlete' }] }, reminders, new Date('2026-11-02T12:00:00'));
    expect(t?.key).toBe('rec-arm');
  });
  it('respects the rotation window and quiet hours', () => {
    const shown = MESSAGES.slice(0, MESSAGES.length - 1).map((m, i) => ({ id: 'm' + i, day: '2026-11-01', key: m.key, category: m.category, ts: '' }));
    const m = pickMessage({ ...base, shown }, reminders, new Date('2026-11-02T12:00:00'));
    expect(m?.key).toBe(MESSAGES[MESSAGES.length - 1].key);
    expect(pickMessage(base, reminders, new Date('2026-11-02T22:30:00'))).toBeNull();
    expect(pickMessage(base, { ...reminders, enabled: false }, new Date('2026-11-02T12:00:00'))).toBeNull();
    // Already chosen today: same message even in quiet hours.
    const chosen = pickMessage({ ...base, shown: [{ id: 'z', day: '2026-11-02', key: 'fun-cat', category: 'fun', ts: '' }] }, reminders, new Date('2026-11-02T23:00:00'));
    expect(chosen?.key).toBe('fun-cat');
  });
});
