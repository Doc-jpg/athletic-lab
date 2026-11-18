import { describe, it, expect } from 'vitest';
import { GAME_VIDEO, MIN_WORDS, OPEN_PROMPTS, ROTATING_PROMPTS, asksGameVideo, basketballSeason, lastVideoNotes, notWatchedRun, notesComplete, promptsFor, videoChoices, videoWriteUps, videosWritten } from '../src/engine/gamevideo';
import type { GameVideo, GameVideoNotes } from '../src/engine/types';

const wrote = (day: string, game: string) => ({ day, gameVideo: 'watched' as GameVideo, gameVideoNotes: { game, answers: [{ q: 'q', a: 'a b c' }] } });

describe('the basketball game video question', () => {
  it('is asked from November 1 through February 15 and not in baseball season', () => {
    for (const d of ['2026-11-01', '2026-11-18', '2026-12-25', '2027-01-28', '2027-02-06', '2027-02-15', '2027-11-01']) expect(basketballSeason(d), d).toBe(true);
    for (const d of ['2026-10-31', '2027-02-16', '2027-03-15', '2027-06-01', '2027-08-20']) expect(basketballSeason(d), d).toBe(false);
  });

  it('a parent can switch it off, and off season it is never asked', () => {
    expect(asksGameVideo('2026-11-18', {})).toBe(true);
    expect(asksGameVideo('2026-11-18', { askGameVideo: false })).toBe(false);
    expect(asksGameVideo('2027-04-10', {})).toBe(false);
  });

  it('offers every real answer as a full sentence, before and after he has written about a game', () => {
    for (const set of [videoChoices(), videoChoices({ day: '2026-11-17', game: 'Heartland' })]) {
      expect(set.map((c) => c.value)).toEqual(['notyet', 'watched', 'none']);
      const labels = set.map((c) => c.label);
      expect(new Set(labels).size).toBe(3);
      for (const l of labels) expect(l.endsWith('.')).toBe(true);
      expect(labels[0]).toMatch(/I have not watched all of it\.$/);
      expect(labels[1]).toMatch(/^I watched all of /);
      expect(labels[2]).toMatch(/^There is no /);
    }
    // After a write-up the sentences are about a NEWER video, so the same game is never asked for twice.
    for (const c of videoChoices({ day: '2026-11-17', game: 'Heartland' })) expect(c.label).toMatch(/newer game video/);
    for (const c of videoChoices()) expect(c.label).not.toMatch(/newer/);
    expect(GAME_VIDEO.newer).toBe('Newer means a game you played after that one.');
  });

  it('tells him the video is up by the morning after a game (Deren: uploaded by 7:30 the next morning)', () => {
    expect(GAME_VIDEO.hint).toMatch(/by the morning after a game/);
    expect(GAME_VIDEO.hint).toMatch(/the day after a game, there is a video/);
    expect(GAME_VIDEO.go).toMatch(/Watch all of it today/);
    expect(GAME_VIDEO.go + GAME_VIDEO.why + GAME_VIDEO.writeIntro).not.toMatch(/lazy|should have|bad/i);
  });

  it('counts "not watched" days in a row ending today; any other answer or a missed day breaks the run', () => {
    const c = (day: string, gameVideo?: GameVideo) => ({ day, gameVideo });
    expect(notWatchedRun([c('2026-11-17', 'notyet'), c('2026-11-18', 'notyet')], '2026-11-18')).toBe(2);
    expect(notWatchedRun([c('2026-11-16', 'notyet'), c('2026-11-17', 'watched'), c('2026-11-18', 'notyet')], '2026-11-18')).toBe(1);
    expect(notWatchedRun([c('2026-11-16', 'notyet'), c('2026-11-18', 'notyet')], '2026-11-18')).toBe(1);
    expect(notWatchedRun([c('2026-11-17', 'notyet'), c('2026-11-18', 'none')], '2026-11-18')).toBe(0);
    expect(notWatchedRun([], '2026-11-18')).toBe(0);
  });
});

describe('writing his takeaways (v0.13.0): more than a checkbox', () => {
  it('asks three questions: one open one about his takeaways, then two that rotate', () => {
    const first = promptsFor(0);
    expect(first.length).toBe(3);
    expect(OPEN_PROMPTS).toContain(first[0]);
    expect(first[0]).toBe('What were your takeaways from this game?');
    expect(ROTATING_PROMPTS).toContain(first[1]);
    expect(ROTATING_PROMPTS).toContain(first[2]);
    expect(first[1]).not.toBe(first[2]);
  });

  it('covers what Deren listed: did great, could have done better, which teammate stood out and why', () => {
    const all = ROTATING_PROMPTS.join(' ');
    expect(all).toMatch(/one thing you did great/);
    expect(all).toMatch(/could have done better/);
    expect(all).toMatch(/Which teammate stood out to you, and why\?/);
    for (const q of [...OPEN_PROMPTS, ...ROTATING_PROMPTS]) expect(q.endsWith('?')).toBe(true);
    expect(new Set([...OPEN_PROMPTS, ...ROTATING_PROMPTS]).size).toBe(OPEN_PROMPTS.length + ROTATING_PROMPTS.length);
  });

  it('is not the same thing every time: two videos in a row never share a question, and every question comes up', () => {
    const seen = new Set<string>();
    for (let n = 0; n < 15; n++) {
      const a = promptsFor(n), b = promptsFor(n + 1);
      expect(a.filter((q) => b.includes(q)), `videos ${n} and ${n + 1}`).toEqual([]);
      a.forEach((q) => seen.add(q));
    }
    expect(seen.size).toBe(OPEN_PROMPTS.length + ROTATING_PROMPTS.length);
    // The same count always gives the same three, so reopening the sheet the same day shows the same questions.
    expect(promptsFor(3)).toEqual(promptsFor(3));
  });

  it('is finished only when the game is named and each question has at least a few words', () => {
    const qs = promptsFor(0);
    const full: GameVideoNotes = { game: 'Heartland', answers: qs.map((q) => ({ q, a: 'I boxed out well' })) };
    expect(MIN_WORDS).toBe(3);
    expect(notesComplete(full, qs)).toBe(true);
    expect(notesComplete(undefined, qs)).toBe(false);
    expect(notesComplete({ ...full, game: ' ' }, qs)).toBe(false);
    expect(notesComplete({ ...full, answers: full.answers.slice(0, 2) }, qs)).toBe(false);
    expect(notesComplete({ ...full, answers: full.answers.map((a, i) => (i === 1 ? { ...a, a: 'idk' } : a)) }, qs)).toBe(false);
    expect(notesComplete({ ...full, answers: full.answers.map((a, i) => (i === 2 ? { ...a, a: '   ' } : a)) }, qs)).toBe(false);
    // Answers to some other video's questions do not count for this one.
    expect(notesComplete(full, promptsFor(1))).toBe(false);
  });

  it('remembers the last game he wrote about, so the next questions are about a newer video', () => {
    const cs = [wrote('2026-11-17', 'Heartland'), { day: '2026-11-18', gameVideo: 'none' as GameVideo }, wrote('2026-11-20', 'Summit')];
    expect(lastVideoNotes(cs, '2026-11-17')).toBeUndefined();
    expect(lastVideoNotes(cs, '2026-11-18')).toEqual({ day: '2026-11-17', game: 'Heartland' });
    expect(lastVideoNotes(cs, '2026-11-20')).toEqual({ day: '2026-11-17', game: 'Heartland' }); // today's own write-up is not "last"
    expect(lastVideoNotes(cs, '2026-11-21')).toEqual({ day: '2026-11-20', game: 'Summit' });
    expect(videosWritten(cs, '2026-11-17')).toBe(0);
    expect(videosWritten(cs, '2026-11-20')).toBe(1);
    expect(videosWritten(cs, '2026-11-21')).toBe(2);
    expect(videoWriteUps(cs).map((w) => w.notes.game)).toEqual(['Summit', 'Heartland']);
    // "Watched" with nothing written (an answer saved before v0.13.0) is not a write-up.
    expect(videosWritten([{ day: '2026-11-18', gameVideo: 'watched' }], '2026-11-19')).toBe(0);
  });
});
