import React, { useState } from 'react';
import { Sheet } from './Sheet';
import type { Day, Feel, Sport, Duration, Intensity, SportsLog, Who } from '../../engine/types';
import { FEEL_WORDS, SLEEP_WORDS, SPORT_WORDS, DURATION_WORDS, INTENSITY_WORDS, INTENSITY_HELP } from '../../engine/types';

/**
 * The readiness check-in. One sheet, two parts: what you did today (sports) and how you feel.
 * Defaults are "a normal day", so a kid with nothing to report taps Save in two seconds.
 * The one thing with no default is how hard a sport was: the first version defaulted to "Medium", a driveway
 * shoot-around got saved as a medium hour, and a lifting day turned into a stretch (2026-11-08). Now the effort
 * question comes first, describes what each level looks like, and must be answered before Save works.
 */
export interface SportDraft {
  sport: Sport;
  duration: Duration;
  /** Undefined until he picks one; Save stays off until every sport has an answer. */
  intensity?: Intensity;
  heavyThrowing: boolean;
  pitched: boolean;
  pitchCount?: number;
  heavyRunning: boolean;
  tournament: boolean;
}

export interface CheckInDraft {
  energy: Feel;
  sleep: Feel;
  soreness: 'none' | 'some' | 'alot';
  pain: boolean;
  painWhere?: string;
  sick: boolean;
  dizzy: boolean;
  creatine: boolean;
  multivitamin: boolean;
  note?: string;
}

const SPORTS: Sport[] = ['baseball', 'basketball', 'pe', 'running', 'play', 'other'];

export function SportCard({ draft, onChange, onRemove }: { draft: SportDraft; onChange: (d: SportDraft) => void; onRemove: () => void }) {
  const set = (p: Partial<SportDraft>) => onChange({ ...draft, ...p });
  return (
    <div className="card">
      <div className="row between"><strong>{SPORT_WORDS[draft.sport]}</strong><button className="btn ghost sm" onClick={onRemove}>Remove</button></div>
      <div className="small muted mt">How hard were you going? Pick the one that looks most like what you did.</div>
      <div className="list mt" data-testid="effort">
        {(['messing', 'easy', 'medium', 'hard'] as Intensity[]).map((d) => (
          <button key={d} className={`btn effort ${draft.intensity === d ? 'primary' : ''}`} onClick={() => set({ intensity: d })} aria-pressed={draft.intensity === d}>
            <span className="effort-name">{draft.intensity === d ? '✓ ' : ''}{INTENSITY_WORDS[d]}</span>
            <span className="effort-help">{INTENSITY_HELP[d]}</span>
          </button>
        ))}
      </div>
      {!draft.intensity && <div className="small mt" style={{ color: 'var(--orange)' }}>Pick one of the four before you save. It decides whether today changes.</div>}
      <div className="small muted mt">How long was it?</div>
      <div className="chips">{(['short', 'medium', 'long'] as Duration[]).map((d) => <button key={d} className={`chip sm ${draft.duration === d ? 'on' : ''}`} onClick={() => set({ duration: d })}>{DURATION_WORDS[d]}</button>)}</div>
      {draft.intensity === 'messing' && <p className="small muted mt">Messing around does not change your workout, even for a long time. Only hard playing for an hour or more does.</p>}
      <div className="small muted mt">Was it a big one? (tap if yes)</div>
      <div className="chips">
        {draft.sport === 'baseball' && <button className={`chip sm ${draft.heavyThrowing ? 'on' : ''}`} onClick={() => set({ heavyThrowing: !draft.heavyThrowing })}>Lots of throwing</button>}
        {draft.sport === 'baseball' && <button className={`chip sm ${draft.pitched ? 'on' : ''}`} onClick={() => set({ pitched: !draft.pitched, heavyThrowing: !draft.pitched ? true : draft.heavyThrowing })}>Pitched</button>}
        <button className={`chip sm ${draft.heavyRunning ? 'on' : ''}`} onClick={() => set({ heavyRunning: !draft.heavyRunning })}>Lots of running or jumping</button>
        <button className={`chip sm ${draft.tournament ? 'on' : ''}`} onClick={() => set({ tournament: !draft.tournament })}>Tournament or all-day games</button>
      </div>
      {draft.pitched && (
        <div className="field mt"><label>Pitch count (if you know it)</label><input className="input" inputMode="numeric" placeholder="for example 42" value={draft.pitchCount ?? ''} onChange={(e) => set({ pitchCount: e.target.value ? parseInt(e.target.value.replace(/\D/g, ''), 10) || undefined : undefined })} /></div>
      )}
    </div>
  );
}

export function newSportDraft(sport: Sport): SportDraft {
  return { sport, duration: 'medium', heavyThrowing: false, pitched: false, heavyRunning: false, tournament: false };
}

/** True when every sport on the sheet has its effort answered; Save waits for this. */
export function sportsComplete(sports: SportDraft[]): boolean {
  return sports.every((d) => !!d.intensity);
}

export function toLog(d: SportDraft, day: Day, by: Who): Omit<SportsLog, 'id' | 'ts'> {
  return { day, sport: d.sport, duration: d.duration, intensity: d.intensity ?? 'easy', heavyThrowing: d.heavyThrowing || d.pitched, pitched: d.pitched, pitchCount: d.pitchCount, heavyRunning: d.heavyRunning, tournament: d.tournament, by };
}

function FiveScale({ value, words, onChange }: { value: Feel; words: Record<Feel, string>; onChange: (v: Feel) => void }) {
  return (
    <div className="btn-grid cols-5">
      {([1, 2, 3, 4, 5] as Feel[]).map((v) => <button key={v} className={`btn ${value === v ? 'primary' : ''}`} onClick={() => onChange(v)}>{words[v]}</button>)}
    </div>
  );
}

export function CheckInSheet({ name, initialSports, initial, onSave, onClose }: { name: string; initialSports?: SportDraft[]; initial?: Partial<CheckInDraft>; onSave: (sports: SportDraft[], draft: CheckInDraft) => Promise<void>; onClose: () => void }) {
  const [sports, setSports] = useState<SportDraft[]>(initialSports ?? []);
  const [draft, setDraft] = useState<CheckInDraft>({ energy: 4, sleep: 4, soreness: 'none', pain: false, sick: false, dizzy: false, creatine: false, multivitamin: false, ...(initial ?? {}) });
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<CheckInDraft>) => setDraft({ ...draft, ...p });
  const red = draft.pain || draft.sick || draft.dizzy;
  const complete = sportsComplete(sports);
  return (
    <Sheet
      title={`How are you today, ${name}?`}
      onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy || !complete} title={complete ? undefined : 'Pick how hard each sport was first'} onClick={async () => { setBusy(true); await onSave(sports, draft); setBusy(false); }}>Save my answers</button></>}
    >
      <h3>What did you already do today?</h3>
      <p className="small muted">Tap one to add it. Nothing today? Skip this part. Shooting around in the driveway or playing catch counts as "Messing around", and that does not change your workout.</p>
      <div className="chips mb">
        {SPORTS.map((s) => <button key={s} className="chip sm" onClick={() => setSports([...sports, newSportDraft(s)])}>+ {SPORT_WORDS[s]}</button>)}
      </div>
      <div className="list mb">
        {sports.map((d, i) => <SportCard key={i} draft={d} onChange={(x) => setSports(sports.map((y, j) => (j === i ? x : y)))} onRemove={() => setSports(sports.filter((_, j) => j !== i))} />)}
      </div>
      <h3>How much energy do you have?</h3>
      <FiveScale value={draft.energy} words={FEEL_WORDS} onChange={(v) => set({ energy: v })} />
      <h3 className="mt">How did you sleep last night?</h3>
      <FiveScale value={draft.sleep} words={SLEEP_WORDS} onChange={(v) => set({ sleep: v })} />
      <h3 className="mt">Are your muscles sore or tired?</h3>
      <div className="btn-grid cols-3">
        {([['none', 'Not really'], ['some', 'A little'], ['alot', 'A lot']] as Array<[CheckInDraft['soreness'], string]>).map(([k, l]) => <button key={k} className={`btn ${draft.soreness === k ? 'primary' : ''}`} onClick={() => set({ soreness: k })}>{l}</button>)}
      </div>
      <h3 className="mt">Did you take your creatine and multivitamin today?</h3>
      <p className="small muted">Tap it if you took it. If you did not, that is fine. It just gets written down.</p>
      <div className="btn-grid cols-2">
        <button className={`btn ${draft.creatine ? 'primary' : ''}`} onClick={() => set({ creatine: !draft.creatine })}>{draft.creatine ? '✓ ' : ''}Creatine</button>
        <button className={`btn ${draft.multivitamin ? 'primary' : ''}`} onClick={() => set({ multivitamin: !draft.multivitamin })}>{draft.multivitamin ? '✓ ' : ''}Multivitamin</button>
      </div>
      <h3 className="mt">Is anything wrong?</h3>
      <p className="small muted">Tired muscles are normal. These three are different. Tap one only if it is true.</p>
      <div className="chips">
        <button className={`chip red ${draft.pain ? 'on' : ''}`} onClick={() => set({ pain: !draft.pain })}>Something hurts</button>
        <button className={`chip red ${draft.sick ? 'on' : ''}`} onClick={() => set({ sick: !draft.sick })}>Feeling sick</button>
        <button className={`chip red ${draft.dizzy ? 'on' : ''}`} onClick={() => set({ dizzy: !draft.dizzy })}>Dizzy</button>
      </div>
      {draft.pain && <div className="field mt"><label>Where does it hurt?</label><input className="input" value={draft.painWhere ?? ''} onChange={(e) => set({ painWhere: e.target.value })} placeholder="for example right elbow" /></div>}
      {red && <div className="banner danger mt">No workout today. You still get Just breathing (two minutes of slow breathing), and it still counts. Tell a parent how you feel; if it is more than tired muscles, a parent decides about the doctor, not the app.</div>}
      <div className="field mt"><label>Anything else you want to say? (you can leave this empty)</label><input className="input" value={draft.note ?? ''} onChange={(e) => set({ note: e.target.value })} placeholder="Legs are tired from practice" /></div>
    </Sheet>
  );
}
