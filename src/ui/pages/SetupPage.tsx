import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAthlete, saveSettings, setParentPin, seedLibrary, db } from '../../db/db';
import { useAthlete } from '../hooks';
import { useTour } from '../components/Tour';
import type { ThemeChoice } from '../../engine/types';
import { nowIso } from '../../engine/types';
import { APP_NAME } from '../version';

/**
 * First run. Two people use this app and setup is the parent's part: whose phone this is, the
 * athlete's name and birth year, the parent's name, and a PIN typed twice and never shown again.
 * On the athlete's phone a hand-off screen then speaks to the kid (pick a look, take the tour).
 * On the parent's phone it lands in the parent dashboard with the "merge a pack" instructions.
 */
type Role = 'athlete' | 'parent';

export function SetupPage() {
  const nav = useNavigate();
  const athlete = useAthlete();
  const tour = useTour();
  const [step, setStep] = useState<'who' | 'parent' | 'handoff' | 'parentdone'>('who');
  const [role, setRole] = useState<Role>('athlete');
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [sports, setSports] = useState<string[]>(['baseball', 'basketball']);
  const [parentName, setParentName] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [theme, setTheme] = useState<ThemeChoice>('play');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const toggleSport = (s: string) => setSports((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  const year = parseInt(birthYear, 10);
  const yearOk = year >= 2005 && year <= new Date().getFullYear() - 5;
  const pinOk = pin.length >= 4 && pin === pin2;

  const finishParentPart = async () => {
    if (!name.trim()) { setErr("The athlete's first name is needed."); return; }
    if (!yearOk) { setErr('Birth year looks off.'); return; }
    if (!parentName.trim()) { setErr('What should the app call you?'); return; }
    if (!pinOk) { setErr(pin.length < 4 ? 'The PIN needs at least 4 digits.' : 'The two PINs do not match.'); return; }
    setErr('');
    setBusy(true);
    await seedLibrary();
    await createAthlete({ firstName: name.trim(), birthYear: year, sports, theme: 'play' });
    await saveSettings({ parentName: parentName.trim(), createdAt: nowIso() });
    await setParentPin(pin);
    await db.meta.put({ key: 'deviceRole', value: role });
    setPin('');
    setPin2('');
    setBusy(false);
    setStep(role === 'athlete' ? 'handoff' : 'parentdone');
  };

  if (athlete && (step === 'who' || step === 'parent')) {
    return (
      <div className="col">
        <div className="hero"><h1>{APP_NAME}</h1><div className="sub">Already set up on this phone.</div></div>
        <button className="btn primary lg block" onClick={() => nav('/today')}>Open the app</button>
      </div>
    );
  }

  return (
    <div className="col">
      <div className="hero">
        <h1>{APP_NAME}</h1>
        <div className="sub">Strength, mobility, athletic movement and good habits for one young athlete, adjusted to every day.</div>
      </div>

      {step === 'who' && (
        <div className="card">
          <h3>For the parent · whose phone is this?</h3>
          <p className="small muted">Setup takes two minutes and is the parent's part. After it, the app talks to your athlete.</p>
          <div className="col mt">
            <button className={`btn lg block ${role === 'athlete' ? 'primary' : ''}`} onClick={() => setRole('athlete')}>My athlete's phone (the main one)</button>
            <button className={`btn lg block ${role === 'parent' ? 'primary' : ''}`} onClick={() => setRole('parent')}>My own phone (a parent copy)</button>
          </div>
          <p className="small muted mt">{role === 'athlete' ? 'He checks in and trains on this phone. You get a PIN-protected parent view on it too.' : 'A parent copy shows the parent dashboard and receives his records as a file he sends you. Set up his phone first.'}</p>
          <button className="btn primary lg block mt" onClick={() => setStep('parent')}>Next</button>
        </div>
      )}

      {step === 'parent' && (
        <div className="card">
          <h3>For the parent · the athlete and you</h3>
          <div className="field"><label>Athlete's first name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" autoFocus /></div>
          <div className="field"><label>Athlete's birth year</label><input className="input" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2014" /></div>
          <div className="field"><label>Sports this year</label>
            <div className="chips">
              {['baseball', 'basketball', 'football', 'soccer', 'swimming', 'running', 'other'].map((s) => <button key={s} className={`chip ${sports.includes(s) ? 'on' : ''}`} onClick={() => toggleSport(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
            </div>
          </div>
          <div className="field"><label>What the app should call you</label><input className="input" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Dad" /></div>
          <div className="inline-fields">
            <div className="field"><label>Parent PIN (4 to 8 digits)</label><input className="input" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))} aria-label="Parent PIN" /></div>
            <div className="field"><label>Type it again</label><input className="input" type="password" inputMode="numeric" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, '').slice(0, 8))} aria-label="Parent PIN again" /></div>
          </div>
          <p className="small muted">The PIN opens the parent view. It is never shown on screen again, so pick one you will remember. Change it any time in the parent view.</p>
          <div className="banner warn small">
            This app is a guide for a healthy kid, not medical advice. Be nearby for every session with a weight and the first run of any new movement. Anything that hurts: stop, and he tells you.
          </div>
          {err && <div className="banner danger small">{err}</div>}
          <div className="row mt"><button className="btn" onClick={() => setStep('who')}>Back</button><button className="btn primary grow" disabled={busy} onClick={finishParentPart}>{role === 'athlete' ? "Done. Hand the phone over" : 'Finish'}</button></div>
        </div>
      )}

      {step === 'handoff' && (
        <div className="card">
          <h2>Hey {name}, this is yours</h2>
          <p className="small muted">Pick a look. You can change it later in Settings.</p>
          <div className="btn-grid cols-3">
            {([['play', 'Playful'], ['minimal', 'Minimal'], ['pro', 'Pro sports']] as Array<[ThemeChoice, string]>).map(([k, label]) => (
              <button key={k} className={`theme-swatch ${theme === k ? 'on' : ''}`} onClick={async () => { setTheme(k); document.documentElement.setAttribute('data-theme', k); const a = await db.athlete.get('athlete'); if (a) await db.athlete.put({ ...a, theme: k }); }}>{label}</button>
            ))}
          </div>
          <p className="small mt">Every day starts with a quick check-in: what sports you did and how you feel. Then the app picks the right kind of day and shows you the workout one move at a time. Skipping is always allowed.</p>
          <p className="small">{parentName || 'Your parent'} has a PIN-protected view of your workouts, sports days and progress. Settings shows exactly what that includes; notes you mark private stay private.</p>
          <div className="col mt">
            <button className="btn primary lg block" onClick={() => { nav('/today'); setTimeout(tour.start, 200); }}>Take the one-minute tour</button>
            <button className="btn block" onClick={() => nav('/today')}>Skip the tour</button>
          </div>
        </div>
      )}

      {step === 'parentdone' && (
        <div className="card">
          <h2>Parent copy ready</h2>
          <p className="small">This phone shows the parent dashboard. {name}'s check-ins and workouts happen on his phone; they reach this one as a file:</p>
          <ol className="step-list small">
            <li>On {name}'s phone: Settings, open the parent view with your PIN, Backup, <strong>Make a parent pack</strong>, AirDrop or Message it to yourself.</li>
            <li>On this phone: Settings, parent view, Backup, <strong>Restore or merge</strong>, pick the file, <strong>Merge</strong>.</li>
          </ol>
          <p className="small muted">Approvals you make here (a form check, a 5 lb weight) travel back the same way: Back up everything here, Merge on his phone. Merging never overwrites newer records.</p>
          <button className="btn primary lg block mt" onClick={() => nav('/settings')}>Open Settings</button>
        </div>
      )}
    </div>
  );
}
