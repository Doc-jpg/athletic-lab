/**
 * Starter program. Editable templates, not prescriptions: Eli or a parent can shorten, skip,
 * substitute or postpone anything without penalty.
 */
import type { WorkoutTemplate } from '../engine/types';

export const TEMPLATES_VERSION = 3;
const TS = '2026-11-02T00:00:00.000Z';

const t = (x: Omit<WorkoutTemplate, 'source' | 'version' | 'createdAt' | 'updatedAt'>): WorkoutTemplate => ({ ...x, source: 'library', version: TEMPLATES_VERSION, createdAt: TS, updatedAt: TS });

export const LIBRARY_TEMPLATES: WorkoutTemplate[] = [
  t({
    id: 'strength-a',
    name: 'Strength A',
    kind: 'strength',
    sequence: 'A',
    minutes: 20,
    summary: 'Squats, push-ups, bridges, belly moves and balance. About 20 minutes with the warm-up and cooldown.',
    items: [
      { exerciseId: 'wu-march', dose: { sets: 1, seconds: 45 } },
      { exerciseId: 'wu-kneehug', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'wu-armcircles', dose: { sets: 1, reps: 10 } },
      { exerciseId: 'lo-chairsquat', dose: { sets: 2, reps: 8 } },
      { exerciseId: 'up-inclinepush', dose: { sets: 2, reps: 6, repsMax: 10 } },
      { exerciseId: 'lo-bridge', dose: { sets: 2, reps: 10 } },
      { exerciseId: 'core-deadbug', dose: { sets: 2, reps: 6, perSide: true } },
      { exerciseId: 'bal-single', dose: { sets: 2, seconds: 20, perSide: true } },
      { exerciseId: 'cd-stretch', dose: { sets: 1, seconds: 90 } }
    ]
  }),
  t({
    id: 'strength-b',
    name: 'Strength B',
    kind: 'strength',
    sequence: 'B',
    minutes: 20,
    summary: 'Step-ups, a one-arm row (after a parent watches it), lunges, bird dogs and side planks. About 20 minutes.',
    items: [
      { exerciseId: 'wu-march', dose: { sets: 1, seconds: 45 } },
      { exerciseId: 'wu-legswing', dose: { sets: 1, reps: 10, perSide: true } },
      { exerciseId: 'up-scapslide', dose: { sets: 1, reps: 8 } },
      { exerciseId: 'lo-stepup-low', dose: { sets: 2, reps: 6, perSide: true } },
      { exerciseId: 'up-row', dose: { sets: 1, reps: 8, perSide: true }, requiresFormCheck: true, note: 'Only after a parent has checked the form. Until then the app offers wall slides instead.' },
      { exerciseId: 'lo-revlunge-assist', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'core-birddog', dose: { sets: 2, reps: 6, perSide: true } },
      { exerciseId: 'core-sideplank-knees', dose: { sets: 1, seconds: 10, perSide: true } },
      { exerciseId: 'up-curl', dose: { sets: 1, reps: 8 }, optional: true, requiresFormCheck: true, note: 'Optional, light, and only if a parent has approved it.' },
      { exerciseId: 'cd-stretch', dose: { sets: 1, seconds: 90 } }
    ]
  }),
  t({
    id: 'shortstop',
    name: 'Shortstop Movement',
    kind: 'movement',
    sequence: 'M',
    minutes: 27,
    summary: 'Move like a shortstop: footwork and your first step, side-to-side strength and power, loose hips. About 25 to 30 minutes, body weight only, on a fresh day.',
    items: [
      { exerciseId: 'wu-march', dose: { sets: 1, seconds: 45 } },
      { exerciseId: 'wu-legswing', dose: { sets: 1, reps: 10, perSide: true } },
      { exerciseId: 'wu-skip', dose: { sets: 2, seconds: 20 } },
      { exerciseId: 'ss-ready', dose: { sets: 2, seconds: 20 } },
      { exerciseId: 'ss-quickfeet', dose: { sets: 3, seconds: 15 } },
      { exerciseId: 'ss-crossover', dose: { sets: 2, reps: 4, perSide: true } },
      { exerciseId: 'ss-dropstep', dose: { sets: 2, reps: 4, perSide: true } },
      { exerciseId: 'ss-hipturn', dose: { sets: 3, reps: 4 } },
      { exerciseId: 'ss-hinge', dose: { sets: 2, reps: 8 } },
      { exerciseId: 'ss-latlunge', dose: { sets: 2, reps: 6, perSide: true } },
      { exerciseId: 'ss-skater', dose: { sets: 2, reps: 4, perSide: true }, optional: true, note: 'Only when legs feel fresh. Stick every landing for two seconds.' },
      { exerciseId: 'ss-ninety', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'ss-carioca', dose: { sets: 2, reps: 1, perSide: true } },
      { exerciseId: 'mob-hip', dose: { sets: 1, seconds: 20, perSide: true } },
      { exerciseId: 'cd-stretch', dose: { sets: 1, seconds: 90 } }
    ]
  }),
  t({
    id: 'coordination',
    name: 'Quick feet',
    kind: 'coordination',
    minutes: 12,
    summary: 'Skips, side shuffles, three-step sprint starts, a stop-and-go game and a few soft landings. 10 to 15 minutes on a fresh day. Rest fully between each one.',
    items: [
      { exerciseId: 'wu-march', dose: { sets: 1, seconds: 45 } },
      { exerciseId: 'wu-legswing', dose: { sets: 1, reps: 10, perSide: true } },
      { exerciseId: 'ath-skipmarch', dose: { sets: 3, reps: 1 } },
      { exerciseId: 'ath-shuffle', dose: { sets: 3, reps: 1 } },
      { exerciseId: 'ath-accel', dose: { sets: 3, reps: 1 } },
      { exerciseId: 'ath-dirchange', dose: { sets: 3, seconds: 20 } },
      { exerciseId: 'ath-landing', dose: { sets: 2, reps: 4 }, optional: true, note: 'Only when legs feel fresh.' },
      { exerciseId: 'cd-walk', dose: { sets: 1, seconds: 60 } }
    ]
  }),
  t({
    id: 'foundations',
    name: 'Five-minute mini workout',
    kind: 'foundations',
    minutes: 5,
    summary: 'Five easy minutes: slow breathing, cat and cow, standing twists, ankles, hips and a little balance. Fine on most days, on top of whatever else you did.',
    items: [
      { exerciseId: 'mob-breathe', dose: { sets: 1, reps: 6 } },
      { exerciseId: 'mob-catcow', dose: { sets: 1, reps: 6 } },
      { exerciseId: 'core-rotation', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'mob-ankle', dose: { sets: 1, reps: 8, perSide: true } },
      { exerciseId: 'mob-hip', dose: { sets: 1, seconds: 20, perSide: true } },
      { exerciseId: 'bal-single', dose: { sets: 1, seconds: 15, perSide: true } }
    ]
  }),
  t({
    id: 'light',
    name: 'Short gentle workout',
    kind: 'light',
    minutes: 10,
    summary: 'Stretching, easy belly and back moves, and balance. For days when you already played a fair amount of sport, or you are a little tired.',
    items: [
      { exerciseId: 'mob-breathe', dose: { sets: 1, reps: 6 } },
      { exerciseId: 'mob-catcow', dose: { sets: 1, reps: 6 } },
      { exerciseId: 'mob-thoracic', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'mob-hip', dose: { sets: 1, seconds: 20, perSide: true } },
      { exerciseId: 'core-deadbug', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'core-birddog', dose: { sets: 1, reps: 6, perSide: true } },
      { exerciseId: 'bal-heeltoe', dose: { sets: 1, reps: 10 } },
      { exerciseId: 'mob-hamstring', dose: { sets: 1, seconds: 20, perSide: true } }
    ]
  }),
  t({
    id: 'recovery',
    name: 'Five-minute stretch',
    kind: 'recovery',
    minutes: 5,
    summary: 'After a big day of sport, this is the whole workout: breathing, cat and cow, the backs of the legs, calves, shoulders. Five minutes, then you are done.',
    items: [
      { exerciseId: 'mob-breathe', dose: { sets: 1, reps: 8 } },
      { exerciseId: 'mob-catcow', dose: { sets: 1, reps: 6 } },
      { exerciseId: 'mob-hamstring', dose: { sets: 1, seconds: 20, perSide: true } },
      { exerciseId: 'mob-calf', dose: { sets: 1, seconds: 20, perSide: true } },
      { exerciseId: 'mob-shoulder', dose: { sets: 1, reps: 5, perSide: true } }
    ]
  })
];

// Appended after the first seven so existing devices get it on the next open (library refresh is by version).
LIBRARY_TEMPLATES.push(t({
  id: 'easy',
  name: 'Just breathing',
  kind: 'recovery',
  minutes: 3,
  summary: 'For a day when something hurts or you feel sick: two minutes of slow breathing and, if it feels fine, an easy walk around the house. That counts as your day. Tell a parent how you feel.',
  items: [
    { exerciseId: 'mob-breathe', dose: { sets: 1, reps: 10 } },
    { exerciseId: 'cd-walk', dose: { sets: 1, seconds: 60 }, optional: true }
  ]
}));

export const TEMPLATE_BY_ID: Record<string, WorkoutTemplate> = Object.fromEntries(LIBRARY_TEMPLATES.map((x) => [x.id, x]));
