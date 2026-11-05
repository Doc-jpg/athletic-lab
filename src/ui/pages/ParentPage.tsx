import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAthlete, useCheckIns, useExercises, useFlags, useMeta, useSessions, useSettings, useSportsLogs, useStatuses, useSupplements, useToday, fmtDate, timeAgo } from '../hooks';
import { useMode } from '../mode';
import { db, saveSettings, setExerciseStatus, setParentPin, updateAthlete, clearAll } from '../../db/db';
import { loadDemo, removeDemo } from '../../data/demo';
import { addDays, newId, nowIso, type Load, type SupplementRecord } from '../../engine/types';
import { LOAD_WORDS, AREA_WORDS } from '../../data/exercises';
import { Sheet, Confirm, useToast } from '../components/Sheet';
import { BackupPanel } from '../components/BackupPanel';
import { SyncCard } from '../components/SyncCard';
import { COLOR_WORDS, dayLoad } from '../../engine/readiness';
import { SportRow } from './TodayPage';

/**
 * Parent dashboard. Everything here is on the "What a parent can see" card Eli can read. Private
 * journal entries are not loaded on this screen at all.
 */
export function ParentPage() {
  const { mode } = useMode();
  const day = useToday();
  const athlete = useAthlete();
  const settings = useSettings();
  const sessions = useSessions();
  const logs = useSportsLogs();
  const checkIns = useCheckIns();
  const flags = useFlags();
  const exercises = useExercises();
  const statuses = useStatuses();
  const supplements = useSupplements();
  const toast = useToast();
  const [tab, setTab] = useState<'week' | 'exercises' | 'settings'>('week');
  const [pinNew, setPinNew] = useState('');
  const [supp, setSupp] = useState<Partial<SupplementRecord> | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const demoLoaded = useMeta('demoLoaded') === true;
  const deviceRole = useMeta('deviceRole');
  if (mode !== 'parent') return <Navigate to="/settings" replace />;
  const name = athlete?.firstName ?? 'the athlete';
  if (!athlete) return <div className="col"><div className="row between"><h1>Parent view</h1><Link className="btn sm" to="/settings">Back</Link></div><div className="card"><p className="small">Waiting for the athlete's phone to sync its first records.</p></div><SyncCard full /></div>;

  const weekStart = addDays(day, -6);
  const weekSessions = sessions.filter((s) => s.day >= weekStart && s.status !== 'planned');
  const weekLogs = logs.filter((l) => l.day >= weekStart);
  const weekCheckIns = checkIns.filter((c) => c.day >= weekStart);
  const open = flags.filter((f) => !f.acknowledgedAt);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const ack = async (id: string) => { await db.flags.update(id, { acknowledgedAt: nowIso(), acknowledgedBy: settings.parentName ?? 'parent' }); };
  const toggleLoad = async (exerciseId: string, load: Load) => {
    const cur = statuses.get(exerciseId);
    const has = cur?.approvedLoads.includes(load);
    const next = has ? (cur?.approvedLoads ?? []).filter((l) => l !== load) : [...(cur?.approvedLoads ?? []), load];
    await setExerciseStatus(exerciseId, { approvedLoads: next });
    toast.show(has ? `${LOAD_WORDS[load]} removed` : `${LOAD_WORDS[load]} approved`);
  };
  const formCheck = async (exerciseId: string, done: boolean) => {
    await setExerciseStatus(exerciseId, done ? { formCheckedAt: nowIso(), formCheckedBy: settings.parentName ?? 'parent' } : { formCheckedAt: undefined, formCheckedBy: undefined, approvedLoads: [] });
  };
  const saveSupp = async () => {
    if (!supp?.name || !supp.dose || !supp.schedule || !supp.recommendedBy) { toast.show('Name, dose, schedule and who recommended it are all needed.'); return; }
    const ts = nowIso();
    const rec: SupplementRecord = { id: supp.id ?? newId(), name: supp.name, dose: supp.dose, schedule: supp.schedule, recommendedBy: supp.recommendedBy, startedAt: supp.startedAt ?? day, active: supp.active ?? true, reminder: supp.reminder ?? true, createdBy: 'parent', createdAt: supp.createdAt ?? ts, updatedAt: ts };
    await db.supplements.put(rec);
    setSupp(null);
  };

  return (
    <div className="col">
      <div className="row between"><h1>Parent view</h1><Link className="btn sm" to="/settings">Back</Link></div>
      {deviceRole === 'parent' && <div className="banner info small">This is the parent copy. {name} checks in and trains on his own phone; {settings.sync?.enabled ? 'his records arrive here on their own.' : 'his records arrive here as a parent pack (Settings tab, Backup, Restore or merge).'}</div>}
      <div className="btn-grid cols-3">
        <button className={`btn ${tab === 'week' ? 'primary' : ''}`} onClick={() => setTab('week')}>This week</button>
        <button className={`btn ${tab === 'exercises' ? 'primary' : ''}`} onClick={() => setTab('exercises')}>Exercises</button>
        <button className={`btn ${tab === 'settings' ? 'primary' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'week' && (
        <>
          {open.length > 0 ? (
            <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
              <h3>Alerts</h3>
              <div className="list mt">{open.map((f) => <div key={f.id} className="item"><div className="grow"><div className="title">{f.text}</div><div className="sub">{fmtDate(f.day)} · {f.kind}</div></div><button className="btn sm" onClick={() => ack(f.id)}>Seen</button></div>)}</div>
              <p className="small muted mt">Pain, illness or dizziness: the app stopped the workout and told {name} to tell you. What happens next is your call and, if needed, a doctor's.</p>
            </div>
          ) : <div className="banner green small">No open alerts.</div>}
          <div className="card">
            <h3>Last 7 days</h3>
            <div className="list mt">
              {days.map((d) => {
                const ss = weekSessions.filter((s) => s.day === d);
                const ls = weekLogs.filter((l) => l.day === d);
                const c = weekCheckIns.find((x) => x.day === d);
                const load = dayLoad(logs, d);
                return (
                  <div key={d} className="item" style={{ alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 64 }}><strong>{fmtDate(d).replace(/,.*/, '')}</strong><div className="tiny muted">{d.slice(5)}</div></div>
                    <div className="grow small">
                      {c ? <div><span className={`pill ${c.color}`}>{COLOR_WORDS[c.color]}</span> energy {c.energy}/5, sleep {c.sleep}/5{c.pain ? `, pain${c.painWhere ? ` (${c.painWhere})` : ''}` : ''}{c.sick ? ', sick' : ''}{c.dizzy ? ', dizzy' : ''}</div> : <div className="muted">No check-in</div>}
                      {ls.map((l) => <div key={l.id}>{l.sport}{l.tournament ? ' (tournament)' : ''}{l.pitched ? ` pitched${l.pitchCount ? ` ${l.pitchCount}` : ''}` : l.heavyThrowing ? ', lots of throwing' : ''}{l.heavyRunning ? ', lots of running' : ''} · {l.duration}, {l.intensity}</div>)}
                      {ss.map((s) => <div key={s.id}><Link to={`/sessions/${s.id}`}>{s.templateName}</Link> · {s.status}{s.overallDifficulty ? `, felt ${['', 'easy', 'pretty easy', 'okay', 'hard', 'very hard'][s.overallDifficulty]}` : ''}{s.note ? ` · "${s.note}"` : ''}</div>)}
                      {load > 0 && <div className="tiny muted">sport load {load}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="small muted mt">Strength and movement sessions this week: {weekSessions.filter((s) => (s.kind === 'strength' || s.kind === 'movement') && s.status === 'done').length} of {settings.strengthDaysPerWeek} planned. Recovery or red days: {weekCheckIns.filter((c) => c.color === 'orange' || c.color === 'red').length}.</p>
          </div>
          <div className="card">
            <h3>Progress</h3>
            <p className="small">{sessions.filter((s) => s.status === 'done' && s.kind !== 'foundations').length} sessions total, {sessions.filter((s) => s.status === 'done' && s.kind === 'foundations').length} Foundations. <Link to="/progress">Full progress page</Link> (same one {name} sees).</p>
          </div>
        </>
      )}

      {tab === 'exercises' && (
        <>
          <div className="banner info small">Form check: you watched the first reps and the movement looked right. A weighted exercise stays out of sessions until it is checked. Approving 5 lb or 10 lb only lets {name} pick that weight; the app never raises it on its own.</div>
          {(Object.keys(AREA_WORDS) as Array<keyof typeof AREA_WORDS>).map((area) => {
            const list = exercises.filter((e) => e.area === area && !e.archived && (e.needsFormCheck || e.loads.length > 1 || e.level !== 'beginner'));
            if (!list.length) return null;
            return (
              <div key={area} className="card">
                <h3>{AREA_WORDS[area]}</h3>
                <div className="list mt">
                  {list.map((e) => {
                    const st = statuses.get(e.id);
                    return (
                      <div key={e.id} className="item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                        <div className="row between"><Link to={`/exercises/${e.id}`}><strong>{e.name}</strong></Link><span className="pill">{e.level}</span></div>
                        <div className="chips">
                          {(e.needsFormCheck || e.loads.length > 1) && <button className={`chip sm ${st?.formCheckedAt ? 'on' : ''}`} onClick={() => formCheck(e.id, !st?.formCheckedAt)}>{st?.formCheckedAt ? `Form checked ${timeAgo(st.formCheckedAt)}` : 'Mark form checked'}</button>}
                          {e.loads.filter((l) => l !== 'body').map((l) => <button key={l} className={`chip sm ${st?.approvedLoads.includes(l) ? 'on' : ''}`} disabled={!st?.formCheckedAt} onClick={() => toggleLoad(e.id, l)}>{LOAD_WORDS[l]}</button>)}
                          <button className={`chip sm ${st?.disabled ? 'red on' : ''}`} onClick={() => setExerciseStatus(e.id, { disabled: !st?.disabled })}>{st?.disabled ? 'Turned off' : 'Turn off'}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="small muted">Beginner bodyweight exercises are always on and are not listed here.</p>
        </>
      )}

      {tab === 'settings' && (
        <>
          <SyncCard full />
          <div className="card">
            <h3>Training</h3>
            <div className="switch"><div><strong>Strength and movement days per week</strong><div className="small muted">Two or three, never on consecutive days. Strength A, Strength B and Shortstop Movement all count; the app keeps 48 hours between any two.</div></div><div className="row"><button className={`btn sm ${settings.strengthDaysPerWeek === 2 ? 'primary' : ''}`} onClick={() => saveSettings({ strengthDaysPerWeek: 2 })}>2</button><button className={`btn sm ${settings.strengthDaysPerWeek === 3 ? 'primary' : ''}`} onClick={() => saveSettings({ strengthDaysPerWeek: 3 })}>3</button></div></div>
            <div className="switch"><div><strong>Growth-spurt mode</strong><div className="small muted">Holds every progression and leans on balance and mobility while coordination catches up. Turn on when he shoots up; off a few weeks later.</div></div><input type="checkbox" checked={!!athlete.growthSpurtMode} onChange={(e) => updateAthlete({ growthSpurtMode: e.target.checked })} /></div>
            <div className="switch"><div><strong>Program start</strong><div className="small muted">{fmtDate(athlete.programStart)}. Phases count from here.</div></div><button className="btn sm" onClick={() => updateAthlete({ programStart: day })}>Restart today</button></div>
          </div>

          <div className="card">
            <h3>Reminders</h3>
            <div className="switch"><div><strong>Daily message</strong><div className="small muted">One fresh message a day on Today.</div></div><input type="checkbox" checked={settings.reminders.enabled} onChange={(e) => saveSettings({ reminders: { ...settings.reminders, enabled: e.target.checked } })} /></div>
            <div className="inline-fields">
              <div className="field"><label>Quiet from</label><input className="input" type="time" defaultValue={settings.reminders.quietStart} onBlur={(e) => saveSettings({ reminders: { ...settings.reminders, quietStart: e.target.value || '21:00' } })} /></div>
              <div className="field"><label>Quiet until</label><input className="input" type="time" defaultValue={settings.reminders.quietEnd} onBlur={(e) => saveSettings({ reminders: { ...settings.reminders, quietEnd: e.target.value || '07:00' } })} /></div>
            </div>
            <div className="field"><label>Do not repeat a message within (days)</label><input className="input" inputMode="numeric" defaultValue={settings.reminders.rotationDays} onBlur={(e) => saveSettings({ reminders: { ...settings.reminders, rotationDays: Math.max(1, parseInt(e.target.value, 10) || 7) } })} /></div>
            <div className="switch"><div><strong>Device notification while the app is open</strong><div className="small muted">Optional. iPhone only allows this for an installed app and only with permission. Nothing fires in the background.</div></div><input type="checkbox" checked={settings.reminders.deviceNotifications} onChange={async (e) => { const on = e.target.checked; if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') { const p = await Notification.requestPermission().catch(() => 'denied'); if (p !== 'granted') { toast.show('Permission was not given.'); return; } } saveSettings({ reminders: { ...settings.reminders, deviceNotifications: on } }); }} /></div>
          </div>

          <div className="card">
            <h3>From a doctor (off by default)</h3>
            <p className="small muted">The app never suggests creatine, protein powder or any supplement. If a clinician recommended a specific product, dose and schedule, record it here; {name} sees it on Habits and cannot change it.</p>
            <div className="list mt">{supplements.map((s) => <div key={s.id} className="item"><div className="grow"><div className="title">{s.name}{s.active ? '' : ' (off)'}</div><div className="sub">{s.dose} · {s.schedule} · {s.recommendedBy}</div></div><button className="btn sm" onClick={() => setSupp(s)}>Edit</button></div>)}</div>
            <button className="btn block mt" onClick={() => setSupp({})}>Add a clinician-recommended record</button>
          </div>

          <div className="card">
            <h3>Parent PIN and name</h3>
            <div className="field"><label>Parent name</label><input className="input" defaultValue={settings.parentName ?? ''} onBlur={(e) => saveSettings({ parentName: e.target.value.trim() || undefined })} /></div>
            <div className="row"><input className="input grow" type="password" inputMode="numeric" placeholder="New 4 to 8 digit PIN" value={pinNew} onChange={(e) => setPinNew(e.target.value.replace(/\D/g, '').slice(0, 8))} /><button className="btn primary" disabled={pinNew.length < 4} onClick={async () => { await setParentPin(pinNew); setPinNew(''); toast.show('PIN changed'); }}>Change PIN</button></div>
            <p className="small muted mt">Forgot it later? There is no reset without erasing the app; keep a backup.</p>
          </div>

          <BackupPanel />

          <div className="card">
            <h3>Sample data and starting over</h3>
            <p className="small muted">Three weeks of made-up history, marked as sample, to see what Progress and the parent view look like before {name} has any. Remove it before his first real session.</p>
            <div className="col mt">
              {demoLoaded ? <button className="btn block" onClick={async () => { const n = await removeDemo(db); toast.show(`Removed ${n} sample records`); }}>Remove the sample data</button> : <button className="btn block" onClick={async () => { await loadDemo(db); toast.show('Three weeks of sample data added'); }}>Add three weeks of sample data</button>}
              <button className="btn ghost sm" style={{ color: 'var(--danger)' }} onClick={() => setResetOpen(true)}>Erase everything on this phone</button>
            </div>
          </div>
          {resetOpen && <Confirm title="Erase everything?" text="Every workout, note and setting on this phone will be deleted, including the PIN. Make a backup first. This cannot be undone." yesLabel="Erase" danger onNo={() => setResetOpen(false)} onYes={async () => { await clearAll(); window.location.hash = '#/setup'; window.location.reload(); }} />}
        </>
      )}

      {supp && (
        <Sheet title={supp.id ? 'Edit record' : 'Clinician-recommended record'} onClose={() => setSupp(null)} footer={<><button className="btn" onClick={() => setSupp(null)}>Cancel</button><button className="btn primary" onClick={saveSupp}>Save</button></>}>
          <div className="field"><label>Product (as the clinician named it)</label><input className="input" value={supp.name ?? ''} onChange={(e) => setSupp({ ...supp, name: e.target.value })} /></div>
          <div className="field"><label>Dose</label><input className="input" value={supp.dose ?? ''} onChange={(e) => setSupp({ ...supp, dose: e.target.value })} /></div>
          <div className="field"><label>Schedule</label><input className="input" value={supp.schedule ?? ''} onChange={(e) => setSupp({ ...supp, schedule: e.target.value })} placeholder="with breakfast" /></div>
          <div className="field"><label>Recommended by</label><input className="input" value={supp.recommendedBy ?? ''} onChange={(e) => setSupp({ ...supp, recommendedBy: e.target.value })} placeholder="Dr. …" /></div>
          <div className="switch"><strong>Active</strong><input type="checkbox" checked={supp.active ?? true} onChange={(e) => setSupp({ ...supp, active: e.target.checked })} /></div>
          <div className="switch"><strong>Show on {name}'s Habits page</strong><input type="checkbox" checked={supp.reminder ?? true} onChange={(e) => setSupp({ ...supp, reminder: e.target.checked })} /></div>
        </Sheet>
      )}
      {toast.el}
    </div>
  );
}
