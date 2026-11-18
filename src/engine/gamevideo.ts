/**
 * The game video question. Deren (2026-11-18): "after his first basketball game, coach shared the YouTube of the
 * recording... I asked Eli to watch it and he said he didn't need to... during basketball season, part of his check-in
 * needs to be if he's watched the most recent game tape." Basketball only; baseball video is not part of this.
 *
 * Same day, after seeing the first version: "coach uploaded the YouTube by 7:30 AM the next morning... I also would
 * like for it to be more than a checkbox. It should be like, what were your takeaways. Not necessarily good things or
 * bad things... What did you observe. Rotate the questions so it's not just the same thing every time. Like, what could
 * you have done better, what did you do great. What teammates stood out to you and why."
 *
 * So: three full sentences to pick from (every real case has a true answer), and "I watched all of it" opens three
 * written questions that change from one video to the next. Once he has written about a game, the sentences ask about
 * a NEWER video, so he is not asked to write about the same game twice.
 * No game dates are stored in the app (this repository is public). He names the game himself when he writes about it.
 */
import type { CheckIn, Day, GameVideo, GameVideoNotes, Settings } from './types';
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

export interface LastVideo { day: Day; game: string }

/** The last game video he wrote about before this day, if any. */
export function lastVideoNotes(checkIns: Array<Pick<CheckIn, 'day' | 'gameVideo' | 'gameVideoNotes'>>, beforeDay: Day): LastVideo | undefined {
  const c = checkIns.filter((x) => x.day < beforeDay && x.gameVideo === 'watched' && x.gameVideoNotes?.game).sort((a, b) => (a.day < b.day ? 1 : -1))[0];
  return c ? { day: c.day, game: c.gameVideoNotes!.game } : undefined;
}

/** How many game videos he has written about before this day. Picks which questions come next. */
export function videosWritten(checkIns: Array<Pick<CheckIn, 'day' | 'gameVideo' | 'gameVideoNotes'>>, beforeDay: Day): number {
  return checkIns.filter((x) => x.day < beforeDay && x.gameVideo === 'watched' && x.gameVideoNotes?.game).length;
}

/**
 * The three sentences. Before he has written about any game they are about "the game video"; after that they are
 * about a NEWER one, and the sheet names the game he last wrote about so "newer" has a plain meaning.
 */
export function videoChoices(last?: LastVideo): Array<{ value: GameVideo; label: string }> {
  return last
    ? [
        { value: 'notyet', label: 'There is a newer game video and I have not watched all of it.' },
        { value: 'watched', label: 'I watched all of a newer game video.' },
        { value: 'none', label: 'There is no newer game video.' }
      ]
    : [
        { value: 'notyet', label: 'There is a game video and I have not watched all of it.' },
        { value: 'watched', label: 'I watched all of the game video.' },
        { value: 'none', label: 'There is no game video yet.' }
      ];
}

export const GAME_VIDEO = {
  question: 'Basketball game video: which one of these is true?',
  /** Deren: Coach had the first one up by 7:30 the morning after the game. */
  hint: 'Coach puts the video on YouTube by the morning after a game. So the day after a game, there is a video. If you are not sure, look, or ask Mom or Dad, before you answer.',
  newer: 'Newer means a game you played after that one.',
  /** What he sees on My jobs after answering. */
  said: { notyet: 'not watched yet', watched: 'watched, and you wrote your takeaways', none: 'there is no new video' } as Record<GameVideo, string>,
  /** What a parent sees. */
  parent: { notyet: 'NOT watched', watched: 'watched', none: 'said there is no new video' } as Record<GameVideo, string>,
  go: 'Watch all of it today. It has been up since the morning after the game. When you are done, change your answer and write your takeaways.',
  why: 'Watching your own game is how you see what Coach sees. It is part of playing, the same as practice.',
  gameLabel: 'Which game was it? Write who you played.',
  writeIntro: 'Now write what you saw. There are no right or wrong answers. Write at least a few words for each one.'
};

/** One of these opens every write-up: his takeaways in his own words, not graded good or bad. */
export const OPEN_PROMPTS = [
  'What were your takeaways from this game?',
  'What did you see in the video that you did not notice while you were playing?',
  'If Coach asked you what happened in this game, what would you tell him?'
];
/** Two of these follow, a different pair each time, so it is not the same thing every game. */
export const ROTATING_PROMPTS = [
  'What is one thing you did great? When in the game was it?',
  'What is one thing you could have done better?',
  'Which teammate stood out to you, and why?',
  'What did the other team do that gave your team trouble?',
  'What were you doing when you did not have the ball?',
  'How was your defense? What did you see?',
  'Pick one play you would like to do over. What would you change?',
  'What did your team do well together?',
  'What did Coach tell the team to do, and did the team do it?',
  'What is one thing you want to work on before the next game?'
];

/** The three questions for his next write-up. `written` is how many videos he has already written about. */
export function promptsFor(written: number): string[] {
  const n = Math.max(0, Math.floor(written));
  const r = ROTATING_PROMPTS.length;
  return [OPEN_PROMPTS[n % OPEN_PROMPTS.length], ROTATING_PROMPTS[(2 * n) % r], ROTATING_PROMPTS[(2 * n + 1) % r]];
}

const words = (s: string | undefined) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;
/** A real answer is at least three words. The app cannot judge what he wrote; a parent reads it. */
export const MIN_WORDS = 3;

/** Is the write-up finished: the game named, and every question answered with at least a few words? */
export function notesComplete(notes: GameVideoNotes | undefined, prompts: string[]): boolean {
  if (!notes || notes.game.trim().length < 2) return false;
  return prompts.every((q) => words(notes.answers.find((a) => a.q === q)?.a) >= MIN_WORDS);
}

/** Every write-up, newest first, for Dad's page. */
export function videoWriteUps(checkIns: Array<Pick<CheckIn, 'day' | 'gameVideo' | 'gameVideoNotes'>>): Array<{ day: Day; notes: GameVideoNotes }> {
  return checkIns.filter((c) => c.gameVideo === 'watched' && c.gameVideoNotes?.game).sort((a, b) => (a.day < b.day ? 1 : -1)).map((c) => ({ day: c.day, notes: c.gameVideoNotes! }));
}

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
