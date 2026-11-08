import { describe, it, expect } from 'vitest';
import { scoopStatus } from '../src/engine/jobs';
import type { HabitLog } from '../src/engine/types';

const scoop = (day: string): HabitLog => ({ id: 's' + day, day, habit: 'scoop', done: true, ts: day + 'T18:00:00Z' });
// 2026-11-09 is a Monday.
describe('the poop job', () => {
  it('Monday and Thursday are scoop days, with the reason', () => {
    const mon = scoopStatus([], '2026-11-09');
    expect(mon.state).toBe('due-today');
    expect(mon.text).toMatch(/trash goes out tonight/);
    const thu = scoopStatus([scoop('2026-11-09')], '2026-11-12');
    expect(thu.state).toBe('due-today');
    expect(thu.text).toMatch(/mowed tomorrow/);
  });
  it('the day before asks him to think ahead', () => {
    const sun = scoopStatus([scoop('2026-11-05')], '2026-11-08');
    expect(sun.state).toBe('due-tomorrow');
    expect(sun.text).toMatch(/practice or a game tomorrow evening, or is rain or snow coming/);
    expect(scoopStatus([scoop('2026-11-09')], '2026-11-11').state).toBe('due-tomorrow');
  });
  it('scooping the day before covers the scoop day', () => {
    const mon = scoopStatus([scoop('2026-11-08')], '2026-11-09');
    expect(mon.state).toBe('clear');
    expect(mon.headline).toMatch(/scooped yesterday/);
  });
  it('a missed scoop day follows him until he does it, then clears', () => {
    const tue = scoopStatus([], '2026-11-10');
    expect(tue.state).toBe('missed');
    expect(tue.missedDay).toBe('2026-11-09');
    expect(tue.headline).toMatch(/missed Monday/);
    expect(scoopStatus([scoop('2026-11-10')], '2026-11-10').state).toBe('done-today');
    expect(scoopStatus([scoop('2026-11-10')], '2026-11-11').state).toBe('due-tomorrow');
  });
  it('a quiet day says when the next one is', () => {
    const sat = scoopStatus([scoop('2026-11-12')], '2026-11-14');
    expect(sat.state).toBe('clear');
    expect(sat.text).toMatch(/Next scoop day: Monday \(trash night\)/);
    expect(sat.lastDone).toBe('2026-11-12');
  });
  it('never scolds', () => {
    for (const d of ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-12', '2026-11-14']) expect(JSON.stringify(scoopStatus([], d))).not.toMatch(/lazy|shame|disappoint|gross/i);
  });
});
