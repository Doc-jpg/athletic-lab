/**
 * Eli's Athletic Lab data model.
 *
 * Every record has createdAt/updatedAt (or ts for append-only logs) so backup merge can keep the
 * newer copy and never silently overwrite. Sessions snapshot the exercise name and catalog version
 * at the time, so history still reads right after the exercise library changes.
 */

export type Iso = string; // ISO timestamp
export type Day = string; // YYYY-MM-DD, local

export function nowIso(): Iso {
  return new Date().toISOString();
}

export function todayDay(d: Date = new Date()): Day {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function addDays(day: Day, n: number): Day {
  const d = new Date(day + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return todayDay(d);
}

export function daysBetween(a: Day, b: Day): number {
  return Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000);
}

export function newId(): string {
  const c: any = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Who did a thing on this phone. Eli is the default; parent mode is PIN-protected. */
export type Who = 'athlete' | 'parent';

// ---------------------------------------------------------------------------
// Athlete and settings
// ---------------------------------------------------------------------------

export type ThemeChoice = 'play' | 'minimal' | 'pro';

export interface Goal {
  id: string;
  text: string;
  status: 'active' | 'done';
  createdAt: Iso;
  doneAt?: Iso;
  by: Who;
}

export interface Athlete {
  id: 'athlete';
  firstName: string;
  birthYear: number;
  sports: string[];
  theme: ThemeChoice;
  goals: Goal[];
  /** Day the program started; progression phases count from here. */
  programStart: Day;
  /** Parent-set: hold progression and lean on balance and mobility while coordination settles. */
  growthSpurtMode?: boolean;
  createdAt: Iso;
  updatedAt: Iso;
}

export interface Reminders {
  enabled: boolean;
  /** 24h "HH:MM". Messages are not shown between quietStart and quietEnd. */
  quietStart: string;
  quietEnd: string;
  /** A message key is not repeated inside this many days. */
  rotationDays: number;
  /** Optional device notifications (only while the app is open; no background promise). */
  deviceNotifications: boolean;
}

export interface Settings {
  id: 'settings';
  parentName?: string;
  parentPinHash?: string;
  parentPinSalt?: string;
  /** Eli chooses his own 4-digit code so his private reflections stay private; optional. */
  athletePinHash?: string;
  athletePinSalt?: string;
  reminders: Reminders;
  /** Strength sessions per week the parent allows (2 or 3). */
  strengthDaysPerWeek: 2 | 3;
  tourSeenAt?: Iso;
  visibilityNoticeSeenAt?: Iso;
  demoLoaded?: boolean;
  lastBackupAt?: Iso;
  /** Automatic sync with the other phone through the family key. Per phone; never backed up into a pack. */
  sync?: SyncState;
  createdAt?: Iso;
  updatedAt?: Iso;
}

export interface SyncState {
  /** The family secret (a 20-character code). Both phones hold it; the server only ever sees its hash. */
  secret: string;
  /** sha256(secret), the row key on the server. */
  familyId: string;
  enabled: boolean;
  device: string;
  /** Highest local stamp pushed so far. */
  lastPush?: string;
  /** Highest server timestamp pulled so far. */
  lastPullTs?: string;
  lastSyncAt?: Iso;
  lastError?: string;
}

/** A deleted record, kept so the deletion reaches the other phone. */
export interface Tombstone {
  key: string; // `${tbl}:${id}`
  tbl: string;
  id: string;
  ts: Iso;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  reminders: { enabled: true, quietStart: '21:00', quietEnd: '07:00', rotationDays: 7, deviceNotifications: false },
  strengthDaysPerWeek: 3
};

// ---------------------------------------------------------------------------
// Exercise catalog
// ---------------------------------------------------------------------------

export type Area = 'lower' | 'upper' | 'core' | 'balance' | 'mobility' | 'coordination' | 'infield' | 'warmup' | 'cooldown' | 'breathing';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Load = 'body' | 'db5' | 'db10';
/** Which part of the body an exercise loads; the readiness engine blocks tags by the day's sport. */
export type LoadTag = 'arm' | 'shoulder' | 'legs' | 'jump' | 'sprint' | 'rotation' | 'core' | 'spine';
export type Equipment = 'none' | 'chair' | 'step' | 'wall' | 'dumbbell' | 'floor' | 'ball' | 'cone';
export type Pose = 'squat' | 'chairsquat' | 'splitsquat' | 'stepup' | 'bridge' | 'calfraise' | 'wallpush' | 'inclinepush' | 'pushup' | 'row' | 'curl' | 'scap' | 'deadbug' | 'birddog' | 'sideplank' | 'plank' | 'curlup' | 'rotation' | 'antirotation' | 'balance' | 'heeltoe' | 'crossbody' | 'lateral' | 'reaction' | 'ankle' | 'hip' | 'thoracic' | 'hamstring' | 'shoulder' | 'breathe' | 'catcow' | 'march' | 'skip' | 'shuffle' | 'accel' | 'landing' | 'jog' | 'walk' | 'ready' | 'crossover' | 'dropstep' | 'hipturn' | 'latlunge' | 'hinge' | 'skater' | 'quickfeet' | 'ninety' | 'carioca';

export interface Dose {
  sets: number;
  reps?: number;
  /** Shown as a range when both are set, for example 6 to 10. */
  repsMax?: number;
  seconds?: number;
  perSide?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  area: Area;
  level: Level;
  /** What it builds, in one line. */
  develops: string;
  /** Why it matters beyond sports. */
  why: string;
  steps: string[];
  cues: string[];
  commonErrors: Array<{ error: string; fix: string }>;
  /** Plain-words situations in which to skip it. */
  skipIf: string[];
  /** Exercise ids that can stand in for it. */
  substitutes: string[];
  easier?: string;
  harder?: string;
  /** Loads this exercise may be done with. Weighted options still need the parent's approval. */
  loads: Load[];
  loadTags: LoadTag[];
  equipment: Equipment[];
  defaultDose: Dose;
  /** Caps the progression engine never passes for this exercise. */
  maxDose?: { sets: number; reps?: number; seconds?: number };
  pose: Pose;
  /** A new weighted movement needs an adult's form check first. */
  needsFormCheck?: boolean;
  source: 'library' | 'custom';
  version: number;
  createdAt: Iso;
  updatedAt: Iso;
  archived?: boolean;
}

/** Parent-managed status for an exercise: form checked, which loads are approved, unlocks. */
export interface ExerciseStatus {
  exerciseId: string;
  formCheckedAt?: Iso;
  formCheckedBy?: string;
  /** Loads the parent has approved. Body weight is always approved. */
  approvedLoads: Load[];
  /** Parent can take an exercise out of the program. */
  disabled?: boolean;
  note?: string;
  updatedAt: Iso;
}

// ---------------------------------------------------------------------------
// Workout templates and sessions
// ---------------------------------------------------------------------------

export type SessionKind = 'strength' | 'movement' | 'coordination' | 'foundations' | 'light' | 'recovery';
/** Sessions that load the legs enough to need 48 hours between them and to count against the weekly cap. */
export const DEMANDING_KINDS: SessionKind[] = ['strength', 'movement'];

export interface TemplateItem {
  exerciseId: string;
  dose: Dose;
  optional?: boolean;
  /** Only offered when the exercise has a form check on file. */
  requiresFormCheck?: boolean;
  note?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  kind: SessionKind;
  minutes: number;
  summary: string;
  items: TemplateItem[];
  /** Strength A and B alternate; 'M' is the movement session that sits between them. */
  sequence?: 'A' | 'B' | 'M';
  source: 'library' | 'custom';
  version: number;
  createdAt: Iso;
  updatedAt: Iso;
  archived?: boolean;
}

export interface SetLog {
  reps?: number;
  seconds?: number;
  load: Load;
  done: boolean;
  ts: Iso;
}

export interface SessionItem {
  exerciseId: string;
  /** Snapshot so history stays readable if the catalog changes. */
  exerciseName: string;
  catalogVersion: number;
  planned: Dose;
  sets: SetLog[];
  swappedFromId?: string;
  swappedFromName?: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  feltGood?: boolean;
  note?: string;
  skipped?: boolean;
  /** Progression wrote this item's dose; the reason is shown on the card. */
  doseReason?: string;
}

export type ReadinessColor = 'green' | 'yellow' | 'orange' | 'red';

export interface Session {
  id: string;
  day: Day;
  templateId?: string;
  templateName: string;
  kind: SessionKind;
  status: 'planned' | 'in_progress' | 'done' | 'skipped' | 'stopped';
  readiness?: ReadinessColor;
  /** Why this session looked like this (from the readiness engine and progression). */
  why: string[];
  items: SessionItem[];
  startedAt?: Iso;
  finishedAt?: Iso;
  /** Live state so a reopened app picks up where it was. */
  live?: { index: number; paused: boolean; elapsedSec: number; runningSince?: Iso };
  overallDifficulty?: 1 | 2 | 3 | 4 | 5;
  feltGood?: boolean;
  note?: string;
  stoppedReason?: 'pain' | 'sick' | 'dizzy' | 'tired' | 'time' | 'other';
  achievements?: string[];
  by: Who;
  createdAt: Iso;
  updatedAt: Iso;
}

// ---------------------------------------------------------------------------
// Sports log and readiness check-in
// ---------------------------------------------------------------------------

export type Sport = 'baseball' | 'basketball' | 'pe' | 'running' | 'swimming' | 'football' | 'soccer' | 'play' | 'other';
export type Duration = 'short' | 'medium' | 'long'; // under 45, 45 to 90, over 90 minutes
/** How hard he was going, in pictures a kid can match: messing around (driveway shoot-around, playing catch) counts as almost nothing. */
export type Intensity = 'messing' | 'easy' | 'medium' | 'hard';

export interface SportsLog {
  id: string;
  day: Day;
  ts: Iso;
  sport: Sport;
  label?: string;
  duration: Duration;
  intensity: Intensity;
  heavyThrowing?: boolean;
  pitched?: boolean;
  pitchCount?: number;
  heavyRunning?: boolean;
  tournament?: boolean;
  by: Who;
}

export type Feel = 1 | 2 | 3 | 4 | 5;

export interface CheckIn {
  id: string;
  day: Day;
  ts: Iso;
  energy: Feel;
  sleep: Feel;
  soreness: 'none' | 'some' | 'alot';
  soreWhere?: string[];
  pain: boolean;
  painWhere?: string;
  sick: boolean;
  dizzy: boolean;
  /** The daily attestation Dad asked for (2026-11-07): did he take what he was given this morning. Undefined on check-ins made before this existed. */
  creatine?: boolean;
  multivitamin?: boolean;
  note?: string;
  /** The verdict this check-in produced, kept for history. */
  color: ReadinessColor;
  by: Who;
}

export interface SafetyFlag {
  id: string;
  ts: Iso;
  day: Day;
  kind: 'pain' | 'sick' | 'dizzy' | 'stopped' | 'tournament' | 'heavy-week' | 'no-rest-day' | 'job-missed';
  text: string;
  acknowledgedAt?: Iso;
  acknowledgedBy?: string;
}

// ---------------------------------------------------------------------------
// Journal, habits, achievements, supplements
// ---------------------------------------------------------------------------

export interface JournalEntry {
  id: string;
  day: Day;
  ts: Iso;
  text: string;
  /** Private entries are Eli's alone: not in parent mode, not in a parent pack. Full backups still carry them. */
  isPrivate: boolean;
  sessionId?: string;
  by: Who;
  updatedAt: Iso;
}

/** 'scoop' and 'shots' were added 2026-11-08 for the jobs card: the dog poop schedule and the lit basketball goal. */
export type HabitKey = 'water' | 'meal' | 'fruitveg' | 'sleep' | 'play' | 'foundations' | 'scoop' | 'shots';

export interface HabitLog {
  id: string;
  day: Day;
  habit: HabitKey;
  done: boolean;
  ts: Iso;
}

export interface MessageShown {
  id: string;
  day: Day;
  key: string;
  category: string;
  ts: Iso;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  text: string;
  earnedAt: Iso;
}

export interface Mission {
  id: string;
  weekStart: Day;
  key: string;
  title: string;
  text: string;
  target: number;
  progress: number;
  doneAt?: Iso;
}

/** Parent-only, off by default. Exists only when a clinician recommended a specific product and schedule. */
/** A short clip of the athlete doing an exercise, shot by a parent and stored in the family's own cloud space. */
export interface Clip {
  id: string;
  exerciseId: string;
  /** Storage path inside the clips bucket: `${familyId}/${exerciseId}/${id}.${ext}` */
  path: string;
  mime: string;
  bytes: number;
  note?: string;
  by: Who;
  createdAt: Iso;
  updatedAt: Iso;
}

export interface SupplementRecord {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  recommendedBy: string;
  startedAt: Day;
  active: boolean;
  reminder: boolean;
  createdBy: 'parent';
  createdAt: Iso;
  updatedAt: Iso;
}

export const FEEL_WORDS: Record<Feel, string> = { 1: 'None', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Lots' };
export const SLEEP_WORDS: Record<Feel, string> = { 1: 'Bad', 2: 'Not much', 3: 'Okay', 4: 'Good', 5: 'Great' };
export const SPORT_WORDS: Record<Sport, string> = { baseball: 'Baseball', basketball: 'Basketball', pe: 'PE class', running: 'Running', swimming: 'Swimming', football: 'Football', soccer: 'Soccer', play: 'Playing outside', other: 'Something else' };
export const DURATION_WORDS: Record<Duration, string> = { short: 'Short (less than 45 minutes)', medium: 'Normal (about an hour)', long: 'Long (more than an hour and a half)' };
export const INTENSITY_WORDS: Record<Intensity, string> = { messing: 'Messing around', easy: 'Moving some', medium: 'Really playing', hard: 'All out' };
/** One line under each effort choice, so the pick is about what it looked like, not a guess at a word. */
export const INTENSITY_HELP: Record<Intensity, string> = {
  messing: 'Shooting around in the driveway, playing catch, tossing a ball around. Not out of breath.',
  easy: 'Practice drills, PE, a relaxed game. Out of breath a little, now and then.',
  medium: 'A real game or scrimmage. Running up and down, sweating, breathing hard.',
  hard: 'As hard as you could go, most of the time. Worn out after.'
};
/** The three looks, named by what they look like, because "Pro sports" is not a color. */
export const THEME_WORDS: Record<ThemeChoice, { name: string; sub: string; colors: [string, string] }> = {
  play: { name: 'Blue and orange', sub: 'Light, with blue buttons', colors: ['#1f6feb', '#ff7a1a'] },
  minimal: { name: 'Plain and simple', sub: 'Light, not much color', colors: ['#f4f4f6', '#111'] },
  pro: { name: 'Dark with lime', sub: 'Dark screen, lime buttons', colors: ['#0a0d14', '#e8ff47'] }
};
export const LEVEL_WORDS: Record<Level, string> = { beginner: 'start here', intermediate: 'a bit harder', advanced: 'hardest' };
