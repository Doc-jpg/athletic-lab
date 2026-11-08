import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAthlete, useCheckIns, useExerciseMap, useHabits, useMissions, useSessions, useSettings, useSportsLogs, useStatuses, useSupplements, useTemplates, useToday } from '../hooks';
import { useMode } from '../mode';
import { setHabit } from '../../db/db';
import { refreshRewards, readinessFor, planSession } from '../../engine/today';
import { weekStartOf } from '../../engine/achievements';
import type { HabitKey } from '../../engine/types';
import { SCOOP_RULE } from '../../engine/jobs';

const HABITS: Array<{ key: HabitKey; title: string; text: string }> = [
  { key: 'water', title: 'Water', text: 'A glass when you wake up, one with every meal, the bottle at practice.' },
  { key: 'meal', title: 'Real meals', text: 'Breakfast, lunch and dinner with protein in each one. No skipping breakfast.' },
  { key: 'fruitveg', title: 'Fruit and vegetables', text: 'At least one of each today.' },
  { key: 'sleep', title: 'Good sleep plan', text: 'Screens off a bit early, bed at a time that gives 9 to 11 hours.' },
  { key: 'play', title: 'Normal play', text: 'Bikes, tag, climbing, shooting hoops for fun. Counts for a lot.' },
  { key: 'scoop', title: 'Scooped the dog poop', text: SCOOP_RULE },
  { key: 'shots', title: 'Shots on the goal', text: 'The goal has a light now. Any evening works.' }
];

/** The Five-minute mini workout, the everyday habits, this week's missions, and the healthy-habits notes. No calories, no weight, no supplements by default. */
export function HabitsPage() {
  const nav = useNavigate();
  const day = useToday();
  const athlete = useAthlete();
  const settings = useSettings();
  const { mode } = useMode();
  const habits = useHabits();
  const missions = useMissions();
  const sessions = useSessions();
  const logs = useSportsLogs();
  const checkIns = useCheckIns();
  const templates = useTemplates();
  const exercises = useExerciseMap();
  const statuses = useStatuses();
  const supplements = useSupplements();
  useEffect(() => { refreshRewards(day).catch(() => undefined); }, [day]);
  const today = habits.filter((h) => h.day === day);
  const isOn = (k: HabitKey) => today.some((h) => h.habit === k && h.done);
  const ws = weekStartOf(day);
  const thisWeek = missions.filter((m) => m.weekStart === ws);
  const foundationsDone = sessions.some((s) => s.day === day && s.kind === 'foundations' && s.status === 'done');
  const checkIn = checkIns.find((c) => c.day === day);
  const readiness = useMemo(() => (athlete && templates.length ? readinessFor({ day, athlete, checkIn, logs, sessions, templates, exercises, statuses, strengthDaysPerWeek: settings.strengthDaysPerWeek }) : undefined), [athlete, day, checkIn, logs, sessions, templates, exercises, statuses, settings.strengthDaysPerWeek]);
  const activeSupps = supplements.filter((s) => s.active && s.reminder);

  const toggle = async (k: HabitKey) => { await setHabit(day, k, !isOn(k)); await refreshRewards(day); };
  const doFoundations = async () => {
    if (!athlete || !readiness) return;
    if (!checkIn) { nav('/today'); return; }
    const s = await planSession('foundations', readiness, { day, athlete, checkIn, logs, sessions, templates, exercises, statuses, strengthDaysPerWeek: settings.strengthDaysPerWeek }, mode);
    nav(`/workout/${s.id}`);
  };

  return (
    <div className="col">
      <h1>Habits</h1>
      <div className="card row between">
        <div className="grow"><strong>Five-minute mini workout</strong><div className="small muted">Breathing, cat and cow, standing twists, ankles, hips, a little balance. About 5 minutes. It is small and easy, so it is fine on top of anything else. Skip it when you are sick, hurt or have no energy.</div></div>
        {foundationsDone ? <span className="pill green">Done</span> : readiness?.foundations === 'no' ? <span className="pill red">Not today</span> : <button className="btn primary" onClick={doFoundations}>Do it</button>}
      </div>

      <h3>Good things you did today (tap them)</h3>
      <div className="list">
        {HABITS.map((h) => <button key={h.key} className={`habit-row ${isOn(h.key) ? 'on' : ''}`} onClick={() => toggle(h.key)}><div className="box">{isOn(h.key) ? '✓' : ''}</div><div className="grow"><div><strong>{h.title}</strong></div><div className="small muted">{h.text}</div></div></button>)}
      </div>
      <p className="small muted">Tapping these is just for you. It is not a score. Nothing bad happens on a day you miss.</p>

      <h3>This week's missions (little challenges)</h3>
      <div className="list">
        {thisWeek.length === 0 && <div className="small muted">Missions show up after you answer the questions for the first time this week.</div>}
        {thisWeek.map((m) => <div key={m.id} className="card mission"><div className="row between"><strong>{m.title}</strong>{m.doneAt ? <span className="pill green">Done</span> : <span className="small muted">{m.progress} of {m.target}</span>}</div><div className="small muted">{m.text}</div><div className="bar"><div style={{ width: `${Math.round((100 * m.progress) / m.target)}%` }} /></div></div>)}
      </div>
      <p className="small muted">You get three new ones every Sunday. Missions you did not finish just go away. Nothing is lost.</p>

      {activeSupps.length > 0 && (
        <div className="card">
          <h3>From the doctor</h3>
          <div className="small muted">Set up by a parent from a clinician's instruction. Only a parent can change it.</div>
          <div className="list mt">{activeSupps.map((s) => <div key={s.id} className="item"><div className="grow"><div className="title">{s.name}</div><div className="sub">{s.dose} · {s.schedule}</div></div></div>)}</div>
        </div>
      )}

      <div className="card">
        <h3>Food, water, sleep: the short version</h3>
        <ul className="step-list small">
          <li><strong>Water first.</strong> Sports drinks only after more than an hour of hard work or in real heat. Energy drinks, never.</li>
          <li><strong>Real food beats powders.</strong> Eggs, milk, yogurt, chicken, beans, peanut butter, rice, pasta, potatoes, fruit, vegetables. The app does not suggest powders or pills; what you take in the morning is between you and your parents, and the check-in records it.</li>
          <li><strong>Carbs are fuel for sport.</strong> Bread, rice, pasta, fruit before and after practice.</li>
          <li><strong>Sleep is when you get stronger.</strong> 9 to 11 hours a night at your age. If you did not sleep much, the app gives you a yellow (easier) day.</li>
          <li><strong>No diets, no weighing.</strong> This app never asks about your weight or how you look. That is on purpose.</li>
        </ul>
      </div>
    </div>
  );
}
