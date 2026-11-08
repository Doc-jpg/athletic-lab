/**
 * Program and progression.
 *
 * Turns a template into today's workout: honors the readiness blocks, the parent's form checks and
 * load approvals, the phase of the program, and what the last two sessions of that exercise felt
 * like. One change at a time (reps, then sets), never past an exercise's cap, never an automatic
 * weight increase, and nothing added in the learn phase or in growth-spurt mode.
 */
import type { Athlete, Day, Dose, Exercise, ExerciseStatus, Load, LoadTag, Session, SessionItem, SessionKind, WorkoutTemplate, Who } from './types';
import { daysBetween, newId, nowIso, DEMANDING_KINDS } from './types';
import type { Readiness } from './readiness';

export type Phase = 'learn' | 'build' | 'refine' | 'develop' | 'review';

export interface PhaseInfo {
  phase: Phase;
  week: number; // 1-based week of the program
  label: string;
  text: string;
}

/** Weeks 1 to 2 learn, 3 to 4 build, 5 to 6 refine, then four-week blocks of three build weeks and a review week. */
export function programPhase(programStart: Day, day: Day): PhaseInfo {
  const week = Math.max(1, Math.floor(daysBetween(programStart, day) / 7) + 1);
  if (week <= 2) return { phase: 'learn', week, label: 'Learning the moves', text: 'For the first two weeks you just learn each move and do it the right way. The app will not add more yet, on purpose.' };
  if (week <= 4) return { phase: 'build', week, label: 'Building', text: 'Weeks 3 and 4: a little more where the last two times felt easy.' };
  if (week <= 6) return { phase: 'refine', week, label: 'Getting good at it', text: 'Weeks 5 and 6: doing each move really well. A harder version shows up when the easy one looks solid.' };
  const inBlock = (week - 7) % 4; // 0..3
  if (inBlock === 3) return { phase: 'review', week, label: 'Easy week', text: 'A lighter week to rest and do the moves well. Nothing gets added this week.' };
  return { phase: 'develop', week, label: `Getting stronger, week ${inBlock + 1} of 4`, text: 'A little more, only where it felt easy and you did it well.' };
}

/**
 * The rotation of demanding sessions: Strength A, Shortstop Movement, Strength B, Shortstop Movement, ...
 * so movement comes once or twice a week inside the weekly cap. After a strength session the next
 * is movement; after movement the next is whichever strength session was not the last one done.
 */
export function nextStrengthTemplate(sessions: Session[], templates: WorkoutTemplate[]): WorkoutTemplate {
  const a = templates.find((t) => t.sequence === 'A' && !t.archived) ?? templates[0];
  const b = templates.find((t) => t.sequence === 'B' && !t.archived) ?? a;
  const m = templates.find((t) => t.sequence === 'M' && !t.archived);
  const done = sessions.filter((s) => s.status === 'done' && DEMANDING_KINDS.includes(s.kind)).sort((x, y) => (y.day + y.createdAt).localeCompare(x.day + x.createdAt));
  const last = done[0];
  if (!last) return a;
  if (last.kind === 'strength' && m) return m;
  const lastStrength = done.find((s) => s.kind === 'strength');
  if (!lastStrength) return a;
  return lastStrength.templateId === a.id ? b : a;
}

export interface BuildContext {
  day: Day;
  athlete: Athlete;
  exercises: Map<string, Exercise>;
  statuses: Map<string, ExerciseStatus>;
  sessions: Session[];
  by: Who;
}

interface ItemHistory {
  session: Session;
  item: SessionItem;
}

function historyFor(exerciseId: string, sessions: Session[], before: Day): ItemHistory[] {
  const out: ItemHistory[] = [];
  for (const s of sessions) {
    if (s.status !== 'done' || s.day > before) continue;
    for (const it of s.items) if (it.exerciseId === exerciseId && !it.skipped && it.sets.some((x) => x.done)) out.push({ session: s, item: it });
  }
  return out.sort((x, y) => (y.session.day + y.session.createdAt).localeCompare(x.session.day + x.session.createdAt));
}

function doneAllPlanned(h: ItemHistory): boolean {
  const planned = h.item.planned.sets;
  const done = h.item.sets.filter((s) => s.done);
  if (done.length < planned) return false;
  if (h.item.planned.reps) return done.every((s) => (s.reps ?? 0) >= (h.item.planned.reps ?? 0));
  if (h.item.planned.seconds) return done.every((s) => (s.seconds ?? 0) >= (h.item.planned.seconds ?? 0));
  return true;
}

function feltEasy(h: ItemHistory): boolean {
  const d = h.item.difficulty ?? h.session.overallDifficulty;
  const good = h.item.feltGood ?? h.session.feltGood;
  if (d === undefined) return false;
  return d <= 2 || (d === 3 && good === true);
}

function feltHard(h: ItemHistory): boolean {
  const d = h.item.difficulty ?? h.session.overallDifficulty;
  const good = h.item.feltGood ?? h.session.feltGood;
  return (d !== undefined && d >= 4) || good === false;
}

export interface DoseDecision {
  dose: Dose;
  reason?: string;
  /** In the refine phase: a harder version worth trying, offered, never forced. */
  tryHarder?: string;
}

/**
 * The dose for one exercise today. Starts from the template dose, moves to what was last done,
 * then adds a little only when the last two sessions were completed and felt easy, in a phase that
 * allows it. One change at a time; reps first, then a set; never past the cap; never on a reduced day.
 */
export function decideDose(exercise: Exercise, templateDose: Dose, ctx: BuildContext, phase: PhaseInfo, reduced: boolean): DoseDecision {
  const hist = historyFor(exercise.id, ctx.sessions, ctx.day);
  const last = hist[0];
  let dose: Dose = { ...templateDose };
  if (reduced) return { dose: { ...dose, sets: 1 }, reason: 'Gentle today: each move just once, nice and slow.' };
  if (last) dose = { ...dose, sets: last.item.planned.sets, reps: last.item.planned.reps ?? dose.reps, seconds: last.item.planned.seconds ?? dose.seconds };
  const cap = exercise.maxDose ?? { sets: 3, reps: 15, seconds: 60 };
  // Safety first: never above the cap, never below the template.
  dose.sets = Math.min(Math.max(dose.sets, templateDose.sets), cap.sets);
  if (dose.reps !== undefined) dose.reps = Math.min(Math.max(dose.reps, templateDose.reps ?? dose.reps), cap.reps ?? 15);
  if (dose.seconds !== undefined) dose.seconds = Math.min(Math.max(dose.seconds, templateDose.seconds ?? dose.seconds), cap.seconds ?? 60);

  if (ctx.athlete.growthSpurtMode) return { dose, reason: 'Growing fast right now, so staying the same for a bit.' };
  if (phase.phase === 'learn') return { dose, reason: 'Learning weeks: same amount, just do it well.' };
  if (phase.phase === 'review') return { dose, reason: 'Easy week: nothing added.' };
  if (hist.length < 2) return { dose };
  const [h1, h2] = hist;
  if (feltHard(h1)) {
    // Ease back toward the template, never below it.
    const eased: Dose = { ...dose };
    if (eased.reps !== undefined && templateDose.reps !== undefined && eased.reps > templateDose.reps) eased.reps = Math.max(templateDose.reps, eased.reps - 2);
    else if (eased.seconds !== undefined && templateDose.seconds !== undefined && eased.seconds > templateDose.seconds) eased.seconds = Math.max(templateDose.seconds, eased.seconds - 5);
    const changed = JSON.stringify(eased) !== JSON.stringify(dose);
    return { dose: eased, reason: changed ? 'Last time felt hard, so a little less today.' : 'Last time felt hard, so staying here.' };
  }
  if (!(doneAllPlanned(h1) && doneAllPlanned(h2) && feltEasy(h1) && feltEasy(h2))) return { dose, reason: 'Staying the same until it feels easy two times in a row.' };

  const out: DoseDecision = { dose: { ...dose } };
  if (phase.phase === 'refine' && exercise.harder) out.tryHarder = exercise.harder;
  if (dose.reps !== undefined) {
    const maxReps = cap.reps ?? 15;
    if (dose.reps < maxReps) { out.dose.reps = Math.min(maxReps, dose.reps + 2); out.reason = 'Easy two times in a row: two more.'; return out; }
    if (dose.sets < cap.sets) { out.dose.sets = dose.sets + 1; out.reason = 'You can do the most of these now, so one more round.'; return out; }
  } else if (dose.seconds !== undefined) {
    const maxSec = cap.seconds ?? 60;
    if (dose.seconds < maxSec) { out.dose.seconds = Math.min(maxSec, dose.seconds + 5); out.reason = 'Easy two times in a row: five more seconds.'; return out; }
    if (dose.sets < cap.sets) { out.dose.sets = dose.sets + 1; out.reason = 'You can hold the longest time now, so one more round.'; return out; }
  }
  out.reason = exercise.harder ? 'This is the most of this move. A harder one is there when you want it.' : 'This is the most of this move. Keep doing it well.';
  if (exercise.harder) out.tryHarder = exercise.harder;
  return out;
}

/** Loads Eli may pick for an exercise: body weight always; a weight only when the parent approved it for this exercise. */
export function allowedLoads(exercise: Exercise, status?: ExerciseStatus): Load[] {
  const approved = new Set<Load>(['body', ...(status?.approvedLoads ?? [])]);
  return exercise.loads.filter((l) => approved.has(l));
}

/** The load the last done set of this exercise used, if it is still allowed. Never higher than last time. */
export function lastLoad(exerciseId: string, sessions: Session[], allowed: Load[]): Load {
  for (const s of [...sessions].sort((x, y) => (y.day + y.createdAt).localeCompare(x.day + x.createdAt))) {
    if (s.status !== 'done') continue;
    const it = s.items.find((i) => i.exerciseId === exerciseId);
    const set = it?.sets.filter((x) => x.done).slice(-1)[0];
    if (set) return allowed.includes(set.load) ? set.load : 'body';
  }
  return 'body';
}

function blockedBy(exercise: Exercise, blocked: LoadTag[]): LoadTag | undefined {
  return exercise.loadTags.find((t) => blocked.includes(t));
}

function pickSubstitute(exercise: Exercise, ctx: BuildContext, blocked: LoadTag[], needFormCheckOk: boolean): Exercise | undefined {
  const candidates = [...exercise.substitutes, exercise.easier].filter((x): x is string => !!x).map((id) => ctx.exercises.get(id)).filter((e): e is Exercise => !!e && !e.archived);
  for (const c of candidates) {
    if (ctx.statuses.get(c.id)?.disabled) continue;
    if (blockedBy(c, blocked)) continue;
    if (needFormCheckOk && c.needsFormCheck && !ctx.statuses.get(c.id)?.formCheckedAt) continue;
    return c;
  }
  return undefined;
}

export interface BuiltSession {
  session: Session;
  /** Items that were swapped or dropped and why, for the "Why this workout" card. */
  changes: string[];
}

/** Build today's workout from a template and the readiness verdict. */
export function buildSession(template: WorkoutTemplate, readiness: Readiness, ctx: BuildContext): BuiltSession {
  const phase = programPhase(ctx.athlete.programStart, ctx.day);
  const reduced = readiness.offer.reduced;
  const changes: string[] = [];
  const items: SessionItem[] = [];
  for (const ti of template.items) {
    let ex = ctx.exercises.get(ti.exerciseId);
    if (!ex || ex.archived) continue;
    const status = ctx.statuses.get(ex.id);
    if (status?.disabled) { changes.push(`${ex.name} is out because a parent turned it off.`); continue; }
    let swappedFrom: Exercise | undefined;
    const needsCheck = (ti.requiresFormCheck || ex.needsFormCheck) && !status?.formCheckedAt;
    const tag = blockedBy(ex, readiness.blocked);
    if (needsCheck || tag) {
      const sub = pickSubstitute(ex, ctx, readiness.blocked, true);
      const why = needsCheck ? `${ex.name} waits until a parent has watched you do it` : `${ex.name} works the ${tag === 'arm' || tag === 'shoulder' ? 'arm' : 'legs'}, which rest today`;
      if (sub) { changes.push(`${why}, so you get ${sub.name} instead.`); swappedFrom = ex; ex = sub; }
      else if (ti.optional) { changes.push(`${why}, so it is out today.`); continue; }
      else { changes.push(`${why}, so it is out today.`); continue; }
    }
    if (reduced && (ex.loadTags.includes('jump') || ex.loadTags.includes('sprint'))) { changes.push(`${ex.name} is out today because today is a gentle day.`); continue; }
    const base = swappedFrom ? ex.defaultDose : ti.dose;
    const decision = decideDose(ex, base, ctx, phase, reduced);
    items.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      catalogVersion: ex.version,
      planned: decision.dose,
      sets: [],
      swappedFromId: swappedFrom?.id,
      swappedFromName: swappedFrom?.name,
      doseReason: decision.reason,
      ...(decision.tryHarder ? { note: `Ready to try: ${ctx.exercises.get(decision.tryHarder)?.name ?? ''}` } : {})
    });
  }
  const ts = nowIso();
  const session: Session = {
    id: newId(),
    day: ctx.day,
    templateId: template.id,
    templateName: template.name,
    kind: template.kind as SessionKind,
    status: 'planned',
    readiness: readiness.color,
    why: [...readiness.reasons, ...readiness.blockedWhy, ...changes, `${phase.label}: ${phase.text}`],
    items,
    by: ctx.by,
    createdAt: ts,
    updatedAt: ts
  };
  return { session, changes };
}

/** Minutes a session will take, roughly: reps at 3 seconds, holds as timed, 30 seconds rest between sets. */
export function estimateMinutes(items: SessionItem[]): number {
  let sec = 0;
  for (const it of items) {
    const sides = it.planned.perSide ? 2 : 1;
    const per = it.planned.seconds ?? (it.planned.reps ?? 8) * 3;
    sec += it.planned.sets * sides * per + it.planned.sets * 30;
  }
  return Math.max(3, Math.round(sec / 60));
}

/** Balances, planks, the wall sit and stretches are held; warm-ups, footwork, reaction games and walks are done "for" a time. */
export function isHold(exerciseId: string): boolean {
  return /^(bal|core|mob)-/.test(exerciseId) || exerciseId === 'lo-wallsit' || exerciseId === 'cd-stretch';
}

function timeWords(seconds: number): string {
  if (seconds % 60 === 0) return seconds === 60 ? '1 minute' : `${seconds / 60} minutes`;
  return `${seconds} seconds`;
}

/** How much, in words a kid reads without help: "hold 30 seconds, each side, 2 rounds". */
export function doseText(d: Dose, hold = true): string {
  const reps = d.reps !== undefined ? (d.repsMax && d.repsMax !== d.reps ? `${d.reps} to ${d.repsMax}` : `${d.reps}`) : undefined;
  const unit = d.seconds !== undefined ? (hold ? `hold ${timeWords(d.seconds)}` : `${timeWords(d.seconds)}`) : `${reps} times`;
  const side = d.perSide ? ', each side' : '';
  const rounds = d.sets > 1 ? `, ${d.sets} rounds` : '';
  return `${unit}${side}${rounds}`;
}
