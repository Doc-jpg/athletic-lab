/**
 * Smart daily messages. One fresh, relevant message a day, chosen from a pool by what today looks
 * like, never repeated inside the rotation window, never shown in quiet hours. No guilt, no shame,
 * no body talk, no streak threats.
 */
import type { Day, MessageShown, Reminders, ReadinessColor, Session, SportsLog } from './types';
import { addDays } from './types';

export type MessageCategory = 'hydration' | 'nutrition' | 'sleep' | 'recovery' | 'consistency' | 'confidence' | 'mobility' | 'fun';

export interface MessageContext {
  day: Day;
  color?: ReadinessColor;
  todayLogs: SportsLog[];
  yesterdayLogs: SportsLog[];
  /** Days since the last done session (not counting foundations). Undefined if never. */
  daysSinceSession?: number;
  sleepLow?: boolean;
  shown: MessageShown[];
  rotationDays: number;
  seed?: number;
}

interface Msg {
  key: string;
  category: MessageCategory;
  text: string;
  /** Higher when the context matches; 0 means not today. */
  fit: (c: MessageContext) => number;
}

const any = () => 1;
const hasSport = (c: MessageContext, s: string) => c.todayLogs.some((l) => l.sport === s);

export const MESSAGES: Msg[] = [
  { key: 'job-scoop-ahead', category: 'consistency', text: 'Tomorrow is a scoop day. If practice, a game, rain or snow is coming tomorrow evening, scoop tonight. Thinking ahead is the whole job.', fit: (c) => ([0, 3].includes(new Date(c.day + 'T12:00:00').getDay()) ? 2.5 : 0) },
  { key: 'job-scoop-today', category: 'consistency', text: 'Scoop day. Poop in the trash before it goes out, or before the mower comes. Five minutes, done, nobody has to ask.', fit: (c) => ([1, 4].includes(new Date(c.day + 'T12:00:00').getDay()) ? 2.5 : 0) },
  { key: 'fun-hoop-light', category: 'fun', text: 'The goal has a light now. Twenty free throws after dinner is a workout nobody has to plan.', fit: any },
  { key: 'hyd-bball', category: 'hydration', text: 'Basketball day? Water bottle in the bag, and drink at every break, not just when you are thirsty.', fit: (c) => (hasSport(c, 'basketball') ? 3 : 0) },
  { key: 'hyd-baseball', category: 'hydration', text: 'Long time on the field today. Drink water between innings. If you feel thirsty, you already needed it a while ago.', fit: (c) => (hasSport(c, 'baseball') ? 3 : 0) },
  { key: 'hyd-plain', category: 'hydration', text: 'Water first. A glass when you wake up and one with every meal is most of the job.', fit: any },
  { key: 'hyd-heat', category: 'hydration', text: 'Hot day rule: drink before, during and after. A sports drink only matters after more than an hour of hard work.', fit: (c) => (c.todayLogs.some((l) => l.duration === 'long') ? 2 : 1) },
  { key: 'nut-upgrade', category: 'nutrition', text: 'A real meal has something that builds muscle (eggs, chicken, beans, yogurt), something colorful (fruit or vegetables), and something that fills you up.', fit: any },
  { key: 'nut-after', category: 'nutrition', text: 'After a hard practice, the best way to help your body is dinner. Eat a good one.', fit: (c) => (c.todayLogs.length ? 3 : 0) },
  { key: 'nut-breakfast', category: 'nutrition', text: 'Breakfast is the first thing that gets you ready for the day. Eggs, oatmeal, a banana, peanut butter toast: anything is better than nothing.', fit: any },
  { key: 'nut-fruit', category: 'nutrition', text: 'Fruit and vegetables give you energy. One at lunch, one at dinner, done.', fit: any },
  { key: 'slp-tomorrow', category: 'sleep', text: "Tomorrow's energy starts tonight. A growing athlete needs nine to eleven hours of sleep.", fit: (c) => (c.sleepLow ? 4 : 1) },
  { key: 'slp-screens', category: 'sleep', text: 'Screens off a little earlier tonight. Sleep is when muscles actually get stronger.', fit: (c) => (c.sleepLow ? 3 : 1) },
  { key: 'slp-game', category: 'sleep', text: 'Big day tomorrow? The best way to get ready is boring: a good dinner and an early bedtime.', fit: any },
  { key: 'rec-worked', category: 'recovery', text: 'You worked hard today. The five-minute stretch is part of getting stronger, not a day off from it.', fit: (c) => (c.color === 'orange' ? 4 : c.todayLogs.length ? 2 : 0) },
  { key: 'rec-goodcall', category: 'recovery', text: 'Taking a rest day when you have no energy is a smart choice. Pro athletes do it on purpose.', fit: (c) => (c.color === 'orange' || c.color === 'red' ? 3 : 0) },
  { key: 'rec-arm', category: 'recovery', text: 'A day off for your arm after lots of throwing keeps it healthy for years. Easy stretching is plenty.', fit: (c) => (c.todayLogs.some((l) => l.heavyThrowing || l.pitched) || c.yesterdayLogs.some((l) => l.pitched) ? 4 : 0) },
  { key: 'con-ten', category: 'consistency', text: 'Ten minutes done carefully is better than rushing through a workout and doing it sloppily.', fit: any },
  { key: 'con-back', category: 'consistency', text: 'It has been a few days. That is okay. Start again today, even if it is just the Five-minute mini workout.', fit: (c) => (c.daysSinceSession !== undefined && c.daysSinceSession >= 3 ? 4 : 0) },
  { key: 'con-small', category: 'consistency', text: 'A little bit every day is the whole plan. One workout at a time.', fit: any },
  { key: 'cnf-learn', category: 'confidence', text: "You do not have to beat yesterday every time. You just have to keep learning.", fit: any },
  { key: 'cnf-form', category: 'confidence', text: 'Doing an easy version perfectly looks better than doing a hard version sloppily. Coaches notice.', fit: any },
  { key: 'cnf-listen', category: 'confidence', text: 'Knowing when to go hard and when to take it easy is a skill. You are practicing it right now.', fit: (c) => (c.color === 'yellow' ? 3 : 1) },
  { key: 'mob-ankles', category: 'mobility', text: 'Your ankles, hips and shoulders help you move well. Give them a few minutes today.', fit: any },
  { key: 'mob-sitting', category: 'mobility', text: 'Lots of sitting at school makes hips tight. The kneeling hip stretch takes three minutes and fixes that.', fit: any },
  { key: 'mob-ankle-chal', category: 'mobility', text: 'Try this: brush your teeth standing on one leg tonight. Switch legs halfway. Free balance practice.', fit: any },
  { key: 'fun-cat', category: 'fun', text: 'Land softly and quietly, the way a cat lands. Quiet feet are strong feet.', fit: any },
  { key: 'fun-playground', category: 'fun', text: 'Playing outside counts. Tag, bikes, climbing: that is training, no app needed.', fit: any },
  { key: 'fun-balance', category: 'fun', text: 'Try this: stand on one foot whenever you are waiting for something today. The bus, the microwave, anything.', fit: any }
];

function inQuietHours(now: Date, r: Reminders): boolean {
  const [qs, qe] = [r.quietStart, r.quietEnd].map((t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; });
  const cur = now.getHours() * 60 + now.getMinutes();
  return qs > qe ? cur >= qs || cur < qe : cur >= qs && cur < qe;
}

/** The message for today, or null in quiet hours or when reminders are off. Stable for a day once chosen (via `shown`). */
export function pickMessage(ctx: MessageContext, reminders: Reminders, now: Date = new Date()): Msg | null {
  if (!reminders.enabled) return null;
  const already = ctx.shown.find((m) => m.day === ctx.day);
  if (already) return MESSAGES.find((m) => m.key === already.key) ?? null;
  if (inQuietHours(now, reminders)) return null;
  const since = addDays(ctx.day, -ctx.rotationDays);
  const recent = new Set(ctx.shown.filter((m) => m.day > since).map((m) => m.key));
  const recentCats = ctx.shown.filter((m) => m.day > addDays(ctx.day, -2)).map((m) => m.category);
  const scored = MESSAGES.filter((m) => !recent.has(m.key)).map((m) => ({ m, s: m.fit(ctx) - (recentCats.includes(m.category) ? 0.5 : 0) })).filter((x) => x.s > 0);
  if (!scored.length) return MESSAGES.find((m) => !recent.has(m.key)) ?? MESSAGES[0];
  scored.sort((a, b) => b.s - a.s);
  const top = scored.filter((x) => x.s === scored[0].s);
  const seed = ctx.seed ?? ctx.day.split('-').reduce((a, b) => a + Number(b), 0);
  return top[seed % top.length].m;
}

export const CATEGORY_WORDS: Record<MessageCategory, string> = { hydration: 'Water', nutrition: 'Food', sleep: 'Sleep', recovery: 'Rest', consistency: 'Keep going', confidence: 'You can do it', mobility: 'Loosen up', fun: 'Try this' };

export function daysSinceLastSession(sessions: Session[], day: Day): number | undefined {
  const last = sessions.filter((s) => s.status === 'done' && s.kind !== 'foundations' && s.kind !== 'recovery' && s.day <= day).sort((a, b) => b.day.localeCompare(a.day))[0];
  if (!last) return undefined;
  return Math.round((new Date(day + 'T12:00:00').getTime() - new Date(last.day + 'T12:00:00').getTime()) / 86400000);
}
