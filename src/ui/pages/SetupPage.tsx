import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAthlete, saveSettings, setParentPin, seedLibrary, db } from '../../db/db';
import { loadDemo } from '../../data/demo';
import { useAthlete } from '../hooks';
import { useTour } from '../components/Tour';
import type { ThemeChoice } from '../../engine/types';
import { nowIso } from '../../engine/types';
import { APP_NAME } from '../version';

/**
 * First run: three short steps. Nothing else is required to start. The parent PIN defaults to the
 * one Deren chose and can be changed in Parent mode.
 */
const DEFAULT_PARENT_PIN = '7101';

export function SetupPage() {
  const nav = useNavigate();
  const athlete = useAthlete();
  const tour = useTour();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Eli');
  const [birthYear, setBirthYear] = useState('2014');
  const [sports, setSports] = useState<string[]>(['baseball', 'basketball']);
  const [theme, setTheme] = useState<ThemeChoice>('play');
  const [parentName, setParentName] = useState('Dad');
  const [busy, setBusy] = useState(false);

  const toggleSport = (s: string) => setSports((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));

  const finish = async (withDemo: boolean) => {
    setBusy(true);
    await seedLibrary();
    await createAthlete({ firstName: name.trim() || 'Eli', birthYear: parseInt(birthYear, 10) || 2014, sports, theme });
    await saveSettings({ parentName: parentName.trim() || 'Parent', createdAt: nowIso() });
    const s = await db.settings.get('settings');
    if (!s?.parentPinHash) await setParentPin(DEFAULT_PARENT_PIN);
    if (withDemo) await loadDemo(db);
    setBusy(false);
    setStep(3);
  };

  if (athlete && step < 3) {
    return (
      <div className="col">
        <div className="hero"><h1>{APP_NAME}</h1><div className="sub">Already set up on this phone.</div></div>
        <button className="btn primary lg block" onClick={() => nav('/today')}>Go to Today</button>
      </div>
    );
  }

  return (
    <div className="col">
      <div className="hero">
        <h1>{APP_NAME}</h1>
        <div className="sub">Strength, mobility, athleticism and good habits. Built for one athlete, adjusted to every day.</div>
      </div>
      {step === 0 && (
        <div className="card">
          <h3>Step 1 of 3 · Who is training</h3>
          <div className="field"><label>First name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Eli" /></div>
          <div className="field"><label>Birth year</label><input className="input" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))} /></div>
          <div className="field"><label>Sports this year</label>
            <div className="chips">
              {['baseball', 'basketball', 'football', 'soccer', 'swimming', 'running', 'other'].map((s) => <button key={s} className={`chip ${sports.includes(s) ? 'on' : ''}`} onClick={() => toggleSport(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
            </div>
          </div>
          <button className="btn primary lg block" onClick={() => setStep(1)}>Next: the look</button>
        </div>
      )}
      {step === 1 && (
        <div className="card">
          <h3>Step 2 of 3 · Pick a look</h3>
          <p className="small muted">You can change this any time in Settings.</p>
          <div className="btn-grid cols-3">
            {([['play', 'Playful'], ['minimal', 'Minimal'], ['pro', 'Pro sports']] as Array<[ThemeChoice, string]>).map(([k, label]) => (
              <button key={k} className={`theme-swatch ${theme === k ? 'on' : ''}`} onClick={() => { setTheme(k); document.documentElement.setAttribute('data-theme', k); }}>{label}</button>
            ))}
          </div>
          <div className="row mt"><button className="btn" onClick={() => setStep(0)}>Back</button><button className="btn primary grow" onClick={() => setStep(2)}>Next: the parent</button></div>
        </div>
      )}
      {step === 2 && (
        <div className="card">
          <h3>Step 3 of 3 · The parent</h3>
          <div className="field"><label>What to call the parent</label><input className="input" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Dad" /></div>
          <div className="banner info small">
            Parent mode is behind a 4-digit PIN (starts as {DEFAULT_PARENT_PIN}; change it in Parent mode). It can see completed workouts, sports days, recovery days, progress and safety alerts. It cannot see notes marked private. {name || 'Eli'} can read that same list any time under Settings, "What a parent can see".
          </div>
          <div className="banner warn small">
            This app is a guide for a healthy kid, not medical advice. A parent is nearby for every session with a weight and the first run of any new movement. Anything that hurts: stop, tell a parent.
          </div>
          <div className="col">
            <button className="btn primary lg block" disabled={busy} onClick={() => finish(false)}>Finish setup</button>
            <button className="btn block" disabled={busy} onClick={() => finish(true)}>Finish with three weeks of sample data to explore</button>
            <div className="small muted center">Sample data is marked and can be removed in one tap from Settings.</div>
            <button className="btn ghost sm" onClick={() => setStep(1)}>Back</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="card">
          <h2>You are set</h2>
          <p className="small muted">Today starts with a check-in. The tour takes a minute and shows the five screens.</p>
          <div className="col">
            <button className="btn primary lg block" onClick={() => { nav('/today'); setTimeout(tour.start, 200); }}>Take the one-minute tour</button>
            <button className="btn block" onClick={() => nav('/today')}>Go to Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
