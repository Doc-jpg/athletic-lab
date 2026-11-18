/**
 * The game video question. Deren (2026-11-18): "after his first basketball game, coach shared the YouTube of the
 * recording... I asked Eli to watch it and he said he didn't need to... during basketball season, part of his check-in
 * needs to be if he's watched the most recent game tape." Basketball only; baseball video is not part of this.
 *
 * Asked every day of basketball season as three full sentences, so every real case has a true answer: there is a video
 * and he has not watched all of it, he watched all of it, or there is no video. No default, and Save waits for it.
 * No game dates are stored in the app (this repository is public); "most recent game" is his to know.
 */
import type { CheckIn, Day, GameVideo, Settings } from './types';
import { addDays } from './types';

/** Basketball season: November 1 through February 15, every year. School ball ends in early February; the extra days are for watching the last game. */
export function basketballSeason(day: Day): boolean {
  const md = day.slice(5);
  return md >= '11-01' || md <= '02-15';
}

/** Is the question asked today on this device? A parent can switch it off. */
export function asksGameVideo(day: Day, settings: Pick<Settings, 'askGameVideo'>): boolean {
  return settings.askGameVideo !== false && basketballSeason(day);
}

export const GAME_VIDEO = {
  question: 'The video of your most recent basketball game: which one of these is true?',
  hint: 'Coach shares a video of the game. If you do not know whether there is one, ask Mom or Dad before you answer.',
  choices: [
    { value: 'notyet', label: 'There is a video and I have not watched all of it.' },
    { value: 'watched', label: 'I watched all of the video.' },
    { value: 'none', label: 'There is no video of my most recent game.' }
  ] as Array<{ value: GameVideo; label: string }>,
  /** What he sees on My jobs after answering. */
  said: { notyet: 'not watched yet', watched: 'watched', none: 'there is no video' } as Record<GameVideo, string>,
  /** What a parent sees. */
  parent: { notyet: 'NOT watched', watched: 'watched', none: 'said there is no video' } as Record<GameVideo, string>,
  go: 'Watch all of it today. Look for one thing you did well and one thing to do better. Then change your answer.',
  why: 'Watching your own game is how you see what Coach sees. It is part of playing, the same as practice.'
};

/** How many days in a row, ending today, he has answered "not watched". A day with no answers breaks the run. */
export function notWatchedRun(checkIns: Array<Pick<CheckIn, 'day' | 'gameVideo'>>, day: Day): number {
  let n = 0;
  for (let d = day; ; d = addDays(d, -1)) {
    const c = checkIns.find((x) => x.day === d);
    if (!c || c.gameVideo !== 'notyet') break;
    n += 1;
    if (n > 30) break;
  }
  return n;
}
