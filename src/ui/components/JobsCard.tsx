import React, { useEffect } from 'react';
import { useHabits, useToday, fmtDate } from '../hooks';
import { setHabit, addFlag } from '../../db/db';
import { scoopStatus } from '../../engine/jobs';
import type { CheckIn } from '../../engine/types';

/**
 * My jobs: the things that are his no matter what the workout is. Creatine and multivitamin (from the
 * daily questions), the dog poop on its schedule, and shots on the goal now that it has a light.
 * A missed scoop day raises a parent alert once; nothing here scolds.
 */
export function JobsCard({ checkIn, onAnswer }: { checkIn?: CheckIn | null; onAnswer: () => void }) {
  const day = useToday();
  const habits = useHabits();
  const scoop = scoopStatus(habits, day);
  const shots = habits.some((h) => h.day === day && h.habit === 'shots' && h.done);
  useEffect(() => {
    if (scoop.state === 'missed' && scoop.missedDay) addFlag({ day: scoop.missedDay, kind: 'job-missed', text: `Dog poop not scooped by ${fmtDate(scoop.missedDay)} evening.` }).catch(() => undefined);
  }, [scoop.state, scoop.missedDay]);
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
