import { describe, it, expect } from 'vitest';
import { GAME_VIDEO, asksGameVideo, basketballSeason, notWatchedRun } from '../src/engine/gamevideo';
import type { GameVideo } from '../src/engine/types';

describe('the basketball game video question (v0.12.0)', () => {
  it('is asked from November 1 through February 15 and not in baseball season', () => {
    for (const d of ['2026-11-01', '2026-11-18', '2026-12-25', '2027-01-28', '2027-02-06', '2027-02-15', '2027-11-01']) expect(basketballSeason(d), d).toBe(true);
    for (const d of ['2026-10-31', '2027-02-16', '2027-03-15', '2027-06-01', '2027-08-20']) expect(basketballSeason(d), d).toBe(false);
  });

  it('a parent can switch it off, and off season it is never asked', () => {
    expect(asksGameVideo('2026-11-18', {})).toBe(true);
    expect(asksGameVideo('2026-11-18', { askGameVideo: true })).toBe(true);
    expect(asksGameVideo('2026-11-18', { askGameVideo: false })).toBe(false);
    expect(asksGameVideo('2027-04-10', {})).toBe(false);
  });

  it('offers every real answer as a full sentence: a video he has not finished, a video he watched, no video', () => {
    expect(GAME_VIDEO.choices.map((c) => c.value)).toEqual(['notyet', 'watched', 'none']);
    const labels = GAME_VIDEO.choices.map((c) => c.label);
    expect(new Set(labels).size).toBe(3);
    for (const l of labels) expect(l.endsWith('.')).toBe(true);
    expect(labels[0]).toMatch(/not watched all of it/);
    expect(labels[1]).toMatch(/^I watched all of the video\.$/);
    expect(labels[2]).toMatch(/^There is no video/);
    expect(GAME_VIDEO.question).toMatch(/most recent basketball game: which one of these is true\?$/);
    expect(GAME_VIDEO.hint).toMatch(/ask Mom or Dad before you answer/);
    // Words for him and for a parent exist for all three, and nothing scolds.
    for (const v of ['notyet', 'watched', 'none'] as GameVideo[]) { expect(GAME_VIDEO.said[v]).toBeTruthy(); expect(GAME_VIDEO.parent[v]).toBeTruthy(); }
    expect(GAME_VIDEO.go + GAME_VIDEO.why + labels.join(' ')).not.toMatch(/lazy|should have|bad/i);
  });

  it('counts "not watched" days in a row ending today; any other answer or a missed day breaks the run', () => {
    const c = (day: string, gameVideo?: GameVideo) => ({ day, gameVideo });
    expect(notWatchedRun([c('2026-11-17', 'notyet'), c('2026-11-18', 'notyet')], '2026-11-18')).toBe(2);
    expect(notWatchedRun([c('2026-11-16', 'notyet'), c('2026-11-17', 'watched'), c('2026-11-18', 'notyet')], '2026-11-18')).toBe(1);
    expect(notWatchedRun([c('2026-11-16', 'notyet'), c('2026-11-18', 'notyet')], '2026-11-18')).toBe(1);
    expect(notWatchedRun([c('2026-11-17', 'notyet'), c('2026-11-18', 'none')], '2026-11-18')).toBe(0);
    expect(notWatchedRun([c('2026-11-17', 'notyet')], '2026-11-18')).toBe(0);
    expect(notWatchedRun([], '2026-11-18')).toBe(0);
  });
});
