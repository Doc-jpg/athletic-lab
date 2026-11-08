/* Eli's Athletic Lab acceptance walkthrough on an iPhone-sized browser, from an empty phone.
   Run: node server.cjs  (in another terminal)  then  URL=http://localhost:4175/ node scripts/acceptance.cjs
   DEVICE="Pixel 5" runs the same walk as an Android phone. */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');
const URL = process.env.URL || 'http://localhost:4175/';
const fails = [];
function expect(label, got, want) { if (JSON.stringify(got) !== JSON.stringify(want)) { fails.push(`${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); console.log('  !! MISMATCH', label, JSON.stringify(got), 'want', JSON.stringify(want)); } else console.log('  ok', label); }
const shotsDir = path.join(__dirname, 'shots');
fs.mkdirSync(shotsDir, { recursive: true });
const shot = (page, name) => page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: false });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices[process.env.DEVICE || 'iPhone 13'], acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.log('PAGEERROR', e.message); fails.push('pageerror ' + e.message); });
  const settle = (ms = 350) => page.waitForTimeout(ms);
  const body = () => page.locator('body').innerText();

  // --- Setup (three steps) ---
  console.log('Setup');
  await page.goto(URL);
  await page.waitForSelector('text=whose device is this?');
  expect('setup speaks to the parent first', /for the parent/i.test(await body()), true);
  await page.click('text=My athlete\'s device');
  await page.waitForSelector('text=the athlete and you');
  await page.fill('input[placeholder="First name"]', 'Eli');
  await page.fill('input[placeholder="2014"]', '2014');
  await page.fill('input[placeholder="Dad"]', 'Dad');
  await page.fill('input[aria-label="Parent PIN"]', '7101');
  await page.fill('input[aria-label="Parent PIN again"]', '7101');
  await page.click('role=button[name="Done. Hand it over"]');
  await page.waitForSelector('text=your own phone');
  const codeText = await page.locator('strong.mono').innerText();
  expect('family code shown to the parent', /^[A-Z2-9]{5}-[A-Z2-9]{5}-[A-Z2-9]{5}-[A-Z2-9]{5}$/.test(codeText), true);
  const FAMILY_CODE = codeText;
  await page.click('role=button[name="Done. Hand it over"]');
  await page.waitForSelector('text=Hey Eli, this is yours');
  expect('PIN is never shown on screen', /7101/.test(await body()), false);
  await page.click('text=Dark with lime');
  await page.click('role=button[name="Skip the tour"]');
  await page.waitForSelector('text=Hey Eli');
  await page.waitForSelector('text=Take the tour');
  expect('tour offered once', /Take the tour/.test(await body()), true);
  await page.click('role=button[name="Not now"]');
  await shot(page, '01_today_fresh');
  expect('theme applied', await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'pro');
  expect('start needs the questions first', /Answer the questions, then start/.test(await body()), true);
  // --- My jobs: the poop schedule ---
  console.log('My jobs');
  let t = await body();
  expect('jobs card is on Today', /My jobs/i.test(t) && /Scoop the dog poop/.test(t), true);
  expect('jobs card knows the schedule', /(Scoop day|Tomorrow is a scoop day|Next scoop day|missed)/.test(t), true);
  await page.click('role=button[name="✓ Scooped it"]');
  await settle();
  expect('scooped it is recorded', /Scooped today\. Done\./.test(await body()), true);
  expect('the goal with the light is on the card', /The new goal has a light/.test(await body()), true);

  // --- 2026-11-08: a driveway shoot-around must not change the day ---
  console.log('Check-in with a shoot-around');
  await page.click('role=button[name="Answer the questions"]');
  await page.waitForSelector('text=How are you today, Eli?');
  await page.click('text=+ Basketball');
  expect('effort question comes first and in pictures', /How hard were you going\?/.test(await body()) && /Shooting around in the driveway/.test(await body()), true);
  expect('save waits for the effort answer', await page.locator('role=button[name="Save my answers"]').isDisabled(), true);
  await page.click('[data-testid="effort"] >> text=Messing around');
  expect('messing around explains itself', /does not change your workout/.test(await body()), true);
  await shot(page, '01b_checkin_effort');
  await page.click('role=button[name="Save my answers"]');
  await page.waitForSelector('text=You answered today');
  await settle();
  t = await body();
  expect('shoot-around: still a fresh, normal day', /Fresh and ready/.test(t), true);
  expect('shoot-around: the planned strength workout is offered', /Strength A/.test(t), true);

  // --- Acceptance 4: heavy throwing day check-in ---
  console.log('Check-in with pitching');
  await page.click('role=button[name="Change my answers"]');
  await page.waitForSelector('text=How are you today, Eli?');
  await page.click('text=+ Baseball');
  await page.click('[data-testid="effort"] >> text=All out');
  await page.click('text=Pitched');
  await page.fill('input[placeholder="for example 42"]', '40');
  await page.click('role=button[name="Creatine"]');
  await page.click('role=button[name="Multivitamin"]');
  await page.click('role=button[name="Save my answers"]');
  await page.waitForSelector('text=You answered today');
  await settle();
  t = await body();
  expect('yellow day after an hour of all-out practice (the shoot-around did not count toward it)', /A short gentle workout today/.test(t), true);
  expect('arm blocked after pitching', /no extra arm or shoulder work/.test(t), true);
  expect('creatine and multivitamin attested on the check-in', /Creatine yes · Multivitamin yes/.test(t), true);
  expect('daily message shown', /Recovery|Hydration|Food|Sleep|Consistency|Confidence|Mobility|Challenge/.test(t), true);
  await shot(page, '02_today_checked_in');

  // --- Acceptance 1: complete a full workout ---
  console.log('Workout player');
  await page.click('role=button[name="Start"]');
  await page.waitForURL(/\/workout\//);
  await settle();
  t = await body();
  expect('light day session opened', /Short gentle workout · 1 of/.test(t), true);
  await shot(page, '03_player');
  const total = await page.locator('.progress-dots i').count();
  for (let i = 0; i < total; i++) {
    const sets = page.locator('.set-btn');
    const n = await sets.count();
    for (let k = 0; k < n; k++) {
      const label = await sets.nth(k).innerText();
      await sets.nth(k).click();
      if (/s$/.test(label.split('\n')[1] || '')) await page.click('role=button[name="Done early"]');
      await settle(120);
      const restSkip = page.locator('role=button[name="I am ready"]');
      if (await restSkip.count()) await restSkip.click();
    }
    if (i < total - 1) {
      // After the last set the player flashes Done and moves on by itself; wait for that, else skip.
      const moved = await page.waitForFunction((n) => /·\s*(\d+) of /.test(document.body.innerText) && Number(document.body.innerText.match(/·\s*(\d+) of /)[1]) === n, i + 2, { timeout: 3000 }).then(() => true).catch(() => false);
      if (!moved) await page.click('text=/Next ›|Skip this one ›/');
      await settle(150);
    }
    await settle(150);
  }
  expect('all exercises visited', await page.locator('.progress-dots i.on').count(), total);
  await page.click('role=button[name="Finish workout"]');
  await page.waitForSelector('text=How was it?');
  await page.click('role=button[name="Easy"]');
  await page.click('role=button[name="Yes"]');
  await page.fill('input[placeholder="Push-ups were easier today."]', 'Felt good, gentle day.');
  await page.click('role=button[name="Save my workout"]');
  await page.waitForURL(/\/sessions\//);
  await settle();
  t = await body();
  expect('session finished', /Finished/.test(t), true);
  expect('badges earned on the first workout', /Badge.*earned/.test(t), true);
  expect('note saved on the session', /Felt good, gentle day/.test(t), true);
  await shot(page, '04_session_summary');

  // --- Acceptance 1 (offline) and 2 (reopen, see yesterday / today) ---
  console.log('Offline');
  await page.goto(URL + '#/today');
  await page.waitForSelector('text=Hey Eli');
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, { timeout: 15000 }).catch(() => fails.push('service worker never took control'));
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector('text=Hey Eli', { timeout: 15000 });
  t = await body();
  expect('offline: app opens and shows the finished session', /Short gentle workout done/.test(t), true);
  await page.click('a[href="#/journal"]');
  await page.waitForSelector('text=Journal');
  await page.fill('textarea', 'My legs were really tired after basketball.');
  await page.click('role=button[name="Save"]');
  await settle();
  expect('offline: journal note saved', /legs were really tired/.test(await body()), true);
  await page.click('a[href="#/workouts"]');
  await page.waitForSelector('text=Every exercise');
  await page.click('text=Chair squat');
  await page.waitForSelector('text=How to do it');
  expect('offline: exercise page with illustration', await page.locator('.figure svg').count(), 1);
  await shot(page, '05_exercise_offline');
  await ctx.setOffline(false);

  // --- Shortstop Movement on a yellow day: offered the gate, one set each, no bound or hop ---
  console.log('Shortstop Movement');
  await page.goto(URL + '#/workouts');
  await page.waitForSelector('text=Every exercise');
  expect('Shortstop Movement is listed with the other sessions', /Shortstop Movement/.test(await body()), true);
  await page.click('text=Shortstop Movement');
  await page.waitForSelector('text=The app picked something else today');
  await page.click('role=button[name="Do it anyway"]');
  await page.waitForURL(/\/workout\//);
  await settle();
  t = await body();
  expect('shortstop session opened on a yellow day', /Shortstop Movement · 1 of/.test(t), true);
  const ssCount = await page.locator('.progress-dots i').count();
  expect('yellow day drops the bound, the hop and the sprint starts (15 items become 9)', ssCount, 9);
  expect('one set each on a yellow day', /Gentle today: each move just once/.test(t), true);
  // The workout player offers a Watch button on moves that have a demo (warm-ups do not); the sheet loads the embed only on tap.
  for (let k = 0; k < 6 && (await page.locator('role=button[name="▶ Watch it"]').count()) === 0; k++) { await page.click('text=/Next ›|Skip this one ›/'); await settle(); }
  expect('player has a Watch it button on a move with a demo', await page.locator('role=button[name="▶ Watch it"]').count(), 1);
  await page.click('role=button[name="▶ Watch it"]');
  await page.waitForSelector('text=Demonstrations play right here');
  expect('no YouTube iframe until a demo is tapped', await page.locator('iframe').count(), 0);
  await page.locator('.sheet button.btn.block').first().click();
  await page.waitForSelector('iframe');
  expect('tapping a demo loads the official embed', /youtube-nocookie\.com\/embed\//.test(await page.locator('iframe').first().getAttribute('src')), true);
  await shot(page, '05a_watch_sheet');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.sheet', { state: 'detached' });
  await page.click('role=button[name="Stop"]');
  await page.click('role=button[name="Out of time"]');
  await page.waitForURL(/\/sessions\//);
  await page.goto(URL + '#/exercises/ss-crossover');
  await page.waitForSelector('text=How to do it');
  expect('crossover page says why, for a shortstop', /ball in the hole/.test(await body()), true);
  expect('crossover page has its drawing', await page.locator('.figure svg').count(), 1);
  expect('crossover page has a Watch it card with the Ripken demo', /Watch it/i.test(await body()) && /Pivot Crossover/.test(await body()), true);
  expect('athlete view has no clip upload button', await page.locator('text=Add a clip of him').count(), 0);
  await shot(page, '05b_shortstop_crossover');
  await page.goto(URL + '#/progress');
  await page.waitForSelector('text=Progress');
  t = await body();
  expect('progress counts the workout', /workouts each week/i.test(t) && /\b1\s+WORKOUTS/i.test(t.replace(/\s+/g, ' ')), true);
  await shot(page, '06_progress');

  // --- Acceptance 6: pain stops recommendations ---
  console.log('Pain');
  await page.goto(URL + '#/today');
  await page.waitForSelector('text=You answered today');
  await page.click('role=button[name="Change my answers"]');
  await page.click('role=button[name="Something hurts"]');
  await page.fill('input[placeholder="for example right elbow"]', 'right elbow');
  await page.click('role=button[name="Save my answers"]');
  await settle();
  t = await body();
  expect('red day: the headline says just breathing, not nothing', /No workout today: just breathing, and tell a parent/.test(t), true);
  expect('red day: tell a parent', /Tell a parent/.test(t), true);
  await shot(page, '07_red_day');
  await page.click('a[href="#/workouts"]');
  await page.waitForSelector('text=Every exercise');
  await page.click('text=Just breathing');
  await page.waitForURL(/\/workout\//);
  await settle();
  t = await body();
  expect('gentle day is breathing plus an optional walk', /Just breathing · 1 of 2/.test(t) && /Slow belly breathing/.test(t), true);
  await page.click('role=button[name="Stop"]');
  await page.click('role=button[name="Out of time"]');
  await page.waitForURL(/\/sessions\//);
  await page.goto(URL + '#/today');
  await page.waitForSelector('text=You answered today');
  await page.click('a[href="#/workouts"]');
  await page.waitForSelector('text=Every exercise');
  await page.click('text=Strength A');
  await page.waitForSelector('text=Not today');
  expect('workouts list refuses a workout on a red day', /So no workout today/.test(await body()), true);
  await page.keyboard.press('Escape');

  // --- Acceptance 9: parent access, disclosed and authenticated ---
  console.log('Parent mode');
  await page.goto(URL + '#/settings');
  await page.waitForSelector('text=What Dad can see');
  t = await body();
  expect('visibility card lists what is shown and what is not', /Not shown:.*private/.test(t), true);
  await page.click('role=button[name="Open Dad\'s page"]');
  await page.fill('input[aria-label="PIN"]', '0000');
  await page.click('role=button[name="Unlock"]');
  await settle();
  expect('wrong PIN refused', /That is not it/.test(await body()), true);
  await page.fill('input[aria-label="PIN"]', '7101');
  await page.click('role=button[name="Unlock"]');
  await page.waitForURL(/\/parent/);
  await settle();
  t = await body();
  expect('parent sees the pain alert', /Reported pain/.test(t), true);
  expect('parent sees the week', /last 7 days/i.test(t), true);
  expect('parent sees the creatine and vitamin answer', /creatine yes, vitamin yes/.test(t), true);
  await shot(page, '08_parent');
  await page.click('role=button[name="Exercises"]');
  await page.waitForSelector('text=One-arm row, hand on a chair');
  const rowCard = page.locator('.item', { hasText: 'One-arm row, hand on a chair' });
  expect('5 lb cannot be approved before a form check', await rowCard.getByRole('button', { name: '5 lb dumbbells' }).isDisabled(), true);
  await rowCard.getByRole('button', { name: 'Mark form checked' }).click();
  await settle();
  await rowCard.getByRole('button', { name: '5 lb dumbbells' }).click();
  await settle();
  expect('5 lb approved after the form check', /5 lb dumbbells approved/.test(await body()), true);
  await page.click('role=button[name="Settings"]');
  await page.waitForSelector('text=From a doctor (off by default)');
  expect('acceptance 11: no supplement records by default', await page.locator('.item', { hasText: 'Edit' }).count(), 0);

  // --- Acceptance 14: backup and restore ---
  console.log('Backup');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    (async () => { await page.click('role=button[name="Back up everything"]'); await page.waitForSelector('text=Backup ready'); await page.click('role=button[name="Share or save"]'); })()
  ]);
  const file = path.join(os.tmpdir(), `athletic-lab-acceptance-${Date.now()}.zip`);
  await download.saveAs(file);
  expect('backup file written', fs.statSync(file).size > 500, true);
  await page.locator('input[type="file"]').last().setInputFiles(file);
  await page.waitForSelector('text=Restore a backup');
  expect('restore preview reads the manifest', /Full backup for Eli/.test(await body()), true);
  await page.click('role=button[name="Merge (safe)"]');
  await page.waitForSelector('text=Merged.');
  t = await body();
  expect('merging the same file changes nothing', /Added 0, updated 0/.test(t), true);
  await page.keyboard.press('Escape');
  await page.click('role=button[name="Back to Eli mode"]');
  await settle();
  expect('left parent mode', await page.locator('role=button[name="Back to Eli mode"]').count(), 0);

  // --- Acceptance 12: its own app ---
  console.log('Identity');
  const manifest = await page.evaluate(async () => { const r = await fetch('manifest.webmanifest'); return r.json(); });
  expect('manifest name', manifest.name, 'Athletic Lab');
  expect('manifest id is its own scope', typeof manifest.id === 'string' && manifest.id === manifest.scope, true);
  const dbs = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
  expect('own IndexedDB database', dbs.includes('athletic-lab'), true);
  expect('no Dugout databases touched', dbs.some((n) => /dugout/.test(n)), false);

  // --- Skip costs nothing; tour and FAQ ---
  console.log('Skip, tour, FAQ');
  await page.goto(URL + '#/today');
  await page.waitForSelector('text=You answered today');
  await page.click('role=button[name="Change my answers"]');
  await page.click('role=button[name="Something hurts"]'); // toggles it off
  await page.click('role=button[name="Save my answers"]');
  await settle();
  expect('pain cleared: the finished session is back on Today', /Short gentle workout done/.test(await body()), true);
  await page.goto(URL + '#/help');
  await page.waitForSelector('input[placeholder="Search the questions"]');
  await page.fill('input[placeholder="Search the questions"]', 'creatine');
  expect('FAQ search', /What about food, protein powder, creatine\?/.test(await body()) && (await page.locator('details.faq').count()) === 1, true);
  await page.click('role=button[name="Take the one-minute tour"]');
  await page.waitForSelector('text=Tour · 1 of 10');
  for (let i = 0; i < 9; i++) { await page.click('role=button[name="Next ›"]'); await settle(250); }
  expect('tour reaches the last stop', /Tour · 10 of 10/.test(await body()), true);
  await shot(page, '09_tour_last');
  await page.click("role=button[name=\"Done, let's go\"]");
  await settle();

  // --- Parent copy on the parent's own phone (fresh context = another phone) ---
  console.log('Parent copy');
  const ctx2 = await browser.newContext({ ...devices[process.env.DEVICE || 'iPhone 13'] });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', (e) => { fails.push('pageerror ' + e.message); });
  await p2.goto(URL);
  await p2.waitForSelector('text=whose device is this?');
  await p2.click('text=My own phone (a parent copy)');
  await p2.waitForSelector('text=Family code');
  await p2.fill('input[placeholder="XXXXX-XXXXX-XXXXX-XXXXX"]', FAMILY_CODE);
  await p2.fill('input[placeholder="Dad"]', 'Dad');
  await p2.fill('input[aria-label="Parent PIN"]', '7101');
  await p2.fill('input[aria-label="Parent PIN again"]', '7101');
  await p2.click('role=button[name="Connect"]');
  await p2.waitForURL(/\/settings/, { timeout: 30000 });
  await p2.waitForSelector('text=For Dad', { timeout: 30000 });
  await p2.waitForTimeout(1500);
  let t2 = await p2.locator('body').innerText();
  expect('parent copy received the athlete through sync', /Set up for Eli/.test(t2), true);
  const firstCard = await p2.locator('.app-main .card').first().innerText();
  expect('parent door sits at the top on the parent copy', /For Dad/i.test(firstCard), true);
  await shot(p2, '10_parent_copy_synced');
  // Eli's phone also pushed the finished session; the parent view on dad's phone shows it.
  await p2.click('role=button[name="Open Dad\'s page"]');
  await p2.fill('input[aria-label="PIN"]', '7101');
  await p2.click('role=button[name="Unlock"]');
  await p2.waitForURL(/\/parent/);
  await p2.waitForTimeout(800);
  t2 = await p2.locator('body').innerText();
  expect('dad sees the light day session synced from eli', /Short gentle workout/.test(t2), true);
  // Dad approves 10 lb on the row; Eli's phone picks it up on its next sync.
  await p2.click('role=button[name="Exercises"]');
  const rowCard2 = p2.locator('.item', { hasText: 'One-arm row, hand on a chair' });
  await rowCard2.getByRole('button', { name: '10 lb dumbbells' }).click();
  await p2.waitForTimeout(3500);
  await page.goto(URL + '#/workouts');
  await page.reload(); // a hash change alone is not "opening the app"; a reload is, and it syncs on open
  await page.waitForSelector('text=Every exercise');
  await page.waitForTimeout(3500);
  await page.click('text=One-arm row, hand on a chair');
  await page.waitForSelector('text=Times you have done it');
  expect('eli sees the approval made on dad\'s phone', /Your parent said these are okay: 5 lb dumbbells, 10 lb dumbbells/.test(await body()), true);
  await ctx2.close();

  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED\n` + fails.join('\n') : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
