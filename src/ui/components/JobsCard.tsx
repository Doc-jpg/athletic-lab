import React, { useEffect } from 'react';
import { useHabits, useToday, useCheckIns, fmtDate } from '../hooks';
import { GAME_VIDEO, lastVideoNotes, notWatchedRun } from '../../engine/gamevideo';
import { setHabit, addFlag } from '../../db/db';
import { scoopStatus } from '../../engine/jobs';
import type { CheckIn } from '../../engine/types';

/**
 * My jobs: the things that are his no matter what the workout is. Creatine and multivitamin (from the
 * daily questions), the dog poop on its schedule, and shots on the goal now that it has a light.
 * A missed scoop day raises a parent alert once; nothing here scolds.
 */
export function JobsCard({ checkIn, askGameVideo, onAnswer }: { checkIn?: CheckIn | null; askGameVideo?: boolean; onAnswer: () => void }) {
  const day = useToday();
  const habits = useHabits();
  const scoop = scoopStatus(habits, day);
  const shots = habits.some((h) => h.day === day && h.habit === 'shots' && h.done);
  useEffect(() => {
    if (scoop.state === 'missed' && scoop.missedDay) addFlag({ day: scoop.missedDay, kind: 'job-missed', text: `Dog poop not scooped by ${fmtDate(scoop.missedDay)} evening.` }).catch(() => undefined);
  }, [scoop.state, scoop.missedDay]);
  const checkIns = useCheckIns();
  const video = askGameVideo ? checkIn?.gameVideo : undefined;
  const run = askGameVideo ? notWatchedRun(checkIns, day) : 0;
  const lastVideo = lastVideoNotes(checkIns, day);
  // Two days in a row of "not watched" tells a parent once. Nothing here scolds.
  useEffect(() => {
    if (run === 2) addFlag({ day, kind: 'job-missed', text: 'Said the basketball game video is not watched, two days in a row.' }).catch(() => undefined);
  }, [run, day]);
  const urgent = scoop.state === 'due-today' || scoop.state === 'missed';
  return (
    <div className="card" data-tour="jobs" style={{ borderColor: urgent ? 'var(--accent-2)' : undefined }}>
      <h3>My jobs</h3>
      <div className="list mt">
        <div className="item" style={{ display: 'block' }}>
          <div className="title">Creatine and multivitamin</div>
          {checkIn ? (
            <div className="small muted">Creatine: <strong>{checkIn.creatine ? 'yes' : 'no'}</strong> · Multivitamin: <strong>{checkIn.multivitamin ? 'yes' : 'no'}</strong>{!checkIn.creatine || !checkIn.multivitamin ? <> · <button className="link" onClick={onAnswer}>Took them now? Change my answers</button></> : ''}</div>
          ) : (
            <div className="small muted">You say yes or no when you answer the questions.</div>
          )}
        </div>
        {askGameVideo && (
          <div className={`item ${video === 'watched' ? 'on' : ''}`} style={{ display: 'block', borderColor: video === 'notyet' ? 'var(--accent-2)' : undefined }} data-job="game-video">
            <div className="title">{video === 'watched' ? '✓ ' : ''}Watch your basketball game video and write your takeaways</div>
            {!checkIn || !video ? (
              <div className="small muted">You answer this when you answer the questions. {GAME_VIDEO.why}</div>
            ) : video === 'notyet' ? (
              <>
                <div className="small"><strong>Your answer: {GAME_VIDEO.said.notyet}.</strong> {GAME_VIDEO.go}</div>
                <button className="btn primary block mt" onClick={onAnswer}>I watched all of it. Write my takeaways</button>
              </>
            ) : video === 'watched' ? (
              <div className="small muted">You watched <strong>{checkIn.gameVideoNotes?.game ?? 'the game'}</strong> and wrote your takeaways. <button className="link" onClick={onAnswer}>Read or change what I wrote</button></div>
            ) : (
              <div className="small muted">Your answer: <strong>{GAME_VIDEO.said.none}</strong>.{lastVideo ? ` The last one you wrote about: ${lastVideo.game} (${fmtDate(lastVideo.day)}).` : ''} Coach has the video up by the morning after a game. <button className="link" onClick={onAnswer}>Change my answer</button></div>
            )}
          </div>
        )}
        <div className={`item ${scoop.state === 'done-today' ? 'on' : ''}`} style={{ display: 'block' }}>
          <div className="title">{scoop.state === 'done-today' ? '✓ ' : ''}Scoop the dog poop</div>
          <div className="small"><strong>{scoop.headline}</strong> {scoop.text}</div>
          {scoop.lastDone && scoop.state !== 'done-today' && <div className="tiny muted mt">Last scooped: {fmtDate(scoop.lastDone)}.</div>}
          {scoop.state === 'done-today'
            ? <button className="btn sm mt" onClick={() => setHabit(day, 'scoop', false)}>Oops, undo</button>
            : <button className={`btn ${urgent ? 'primary' : ''} block mt`} onClick={() => setHabit(day, 'scoop', true)}>✓ Scooped it</button>}
        </div>
        <div className={`item ${shots ? 'on' : ''}`} style={{ display: 'block' }}>
          <div className="title">{shots ? '✓ ' : ''}Shots on the goal</div>
          <div className="small muted">The new goal has a light, so any evening works. Not a job, just a good idea.</div>
          <button className="btn sm mt" onClick={() => setHabit(day, 'shots', !shots)}>{shots ? 'Undo' : 'Got shots up today'}</button>
        </div>
      </div>
    </div>
  );
}
