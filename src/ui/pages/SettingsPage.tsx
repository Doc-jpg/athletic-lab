import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAthlete, useMeta, useSettings } from '../hooks';
import { useMode } from '../mode';
import { addGoal, setGoalStatus, updateAthlete, saveSettings, db } from '../../db/db';
import { loadDemo, removeDemo } from '../../data/demo';
import { BackupPanel } from '../components/BackupPanel';
import { Sheet, Confirm, useToast } from '../components/Sheet';
import { useTour } from '../components/Tour';
import type { ThemeChoice } from '../../engine/types';
import { nowIso } from '../../engine/types';
import { APP_NAME, APP_VERSION } from '../version';

export function VisibilityCard() {
  const settings = useSettings();
  const athlete = useAthlete();
  return (
    <div className="card" data-tour="parent" style={{ borderLeft: '4px solid var(--accent-2)' }}>
      <h3>What a parent can see</h3>
      <p className="small">{settings.parentName ?? 'A parent'} can open Parent mode with a PIN. In Parent mode the app shows:</p>
      <ul className="small step-list">
        <li>Finished and skipped workouts, with sets, how they felt, and workout notes</li>
        <li>Sports you logged, check-ins, and recovery days</li>
        <li>Progress charts and badges</li>
        <li>Journal notes that are not marked private</li>
        <li>Safety alerts: pain, feeling sick, dizziness, a stopped workout, a tournament day, or a week with no rest day</li>
      </ul>
      <p className="small"><strong>Not shown:</strong> journal notes marked private. There is no hidden tracking; this list is the whole list. A parent can also approve weights, turn exercises on or off, set how many strength days a week, and manage reminders.</p>
      {!settings.visibilityNoticeSeenAt && athlete && <button className="btn sm" onClick={() => saveSettings({ visibilityNoticeSeenAt: nowIso() })}>Got it</button>}
    </div>
  );
}

export function SettingsPage() {
  const nav = useNavigate();
  const athlete = useAthlete();
  const settings = useSettings();
  const { mode, enterParent } = useMode();
  const tour = useTour();
  const toast = useToast();
  const demoLoaded = useMeta('demoLoaded') === true;
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);
  const [goal, setGoal] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  if (!athlete) return null;
  const tryPin = async () => {
    const ok = await enterParent(pin);
    setPin('');
    if (ok) { setPinOpen(false); setWrong(false); nav('/parent'); } else setWrong(true);
  };
  return (
    <div className="col">
      <div className="row between"><h1>Settings</h1><Link className="btn sm" to="/help">Help</Link></div>

      <div className="card">
        <h3>Look</h3>
        <div className="btn-grid cols-3 mt">
          {([['play', 'Playful'], ['minimal', 'Minimal'], ['pro', 'Pro sports']] as Array<[ThemeChoice, string]>).map(([k, label]) => <button key={k} className={`theme-swatch ${athlete.theme === k ? 'on' : ''}`} onClick={() => updateAthlete({ theme: k })}>{label}</button>)}
        </div>
      </div>

      <div className="card">
        <h3>My goals</h3>
        <p className="small muted">Your own words. "Hold a plank for 45 seconds." "Feel quicker on defense."</p>
        <div className="list mt">
          {athlete.goals.filter((g) => g.status === 'active').map((g) => <div key={g.id} className="item"><div className="grow">{g.text}</div><button className="btn sm" onClick={() => setGoalStatus(g.id, 'done')}>Done</button></div>)}
          {athlete.goals.filter((g) => g.status === 'done').slice(0, 3).map((g) => <div key={g.id} className="item" style={{ opacity: .6 }}><div className="grow"><s>{g.text}</s></div><span className="pill green">Done</span></div>)}
        </div>
        <div className="row mt"><input className="input grow" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="New goal" /><button className="btn primary" disabled={!goal.trim()} onClick={async () => { await addGoal(goal.trim(), mode); setGoal(''); }}>Add</button></div>
      </div>

      <VisibilityCard />

      <div className="card">
        <h3>Parent mode</h3>
        <p className="small muted">For {settings.parentName ?? 'a parent'}. Needs the PIN.</p>
        {mode === 'parent' ? <Link className="btn primary block" to="/parent">Open the parent dashboard</Link> : <button className="btn block" onClick={() => setPinOpen(true)}>Enter parent mode</button>}
      </div>

      <BackupPanel parentMode={mode === 'parent'} />

      <div className="card">
        <h3>Learn the app</h3>
        <div className="col mt">
          <button className="btn block" onClick={() => { nav('/today'); setTimeout(tour.start, 150); }}>Take the one-minute tour</button>
          <Link className="btn block" to="/help">Questions and answers</Link>
          {demoLoaded ? <button className="btn block" onClick={async () => { const n = await removeDemo(db); toast.show(`Removed ${n} sample records`); }}>Remove the sample data</button> : <button className="btn block" onClick={async () => { await loadDemo(db); toast.show('Three weeks of sample data added'); }}>Add three weeks of sample data to explore</button>}
        </div>
      </div>

      <div className="card">
        <div className="small muted">{APP_NAME} {APP_VERSION}. Built for {athlete.firstName}, born {athlete.birthYear}. Works offline; everything is stored on this phone. Not medical advice.</div>
        {mode === 'parent' && <button className="btn ghost sm mt" style={{ color: 'var(--danger)' }} onClick={() => setResetOpen(true)}>Erase everything on this phone</button>}
      </div>

      {pinOpen && (
        <Sheet title="Parent PIN" onClose={() => { setPinOpen(false); setWrong(false); }} footer={<><button className="btn" onClick={() => setPinOpen(false)}>Cancel</button><button className="btn primary" disabled={pin.length < 4} onClick={tryPin}>Unlock</button></>}>
          <input className="input" type="password" inputMode="numeric" autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))} onKeyDown={(e) => { if (e.key === 'Enter') tryPin(); }} style={{ fontSize: 28, textAlign: 'center', letterSpacing: 8 }} aria-label="PIN" />
          {wrong && <div className="small mt" style={{ color: 'var(--danger)' }}>That is not it.</div>}
          <p className="small muted mt">Parent mode locks itself again after ten minutes in the background.</p>
        </Sheet>
      )}
      {resetOpen && <Confirm title="Erase everything?" text="Every workout, note and setting on this phone will be deleted. Make a backup first. This cannot be undone." yesLabel="Erase" danger onNo={() => setResetOpen(false)} onYes={async () => { const { clearAll } = await import('../../db/db'); await clearAll(); window.location.hash = '#/setup'; window.location.reload(); }} />}
      {toast.el}
    </div>
  );
}
