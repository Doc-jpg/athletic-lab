# Who sets it up, and how Eli gets it

Two people use this app. **Setup is the parent's job, done once on Eli's phone.** After it, the app talks only to Eli. Everything he does shows up on the parent's phone on its own; nothing is ever sent by hand.

## 1. Eli's phone (the parent does this, two minutes)
1. On Eli's iPhone, open Safari and go to **https://doc-jpg.github.io/athletic-lab/**
2. Tap **Share** (the square with the arrow), then **Add to Home Screen**, then **Add**. The icon is a navy square with an orange bolt, named "Athletic Lab".
3. Open it from the home screen (online).
4. The first screen says it is for the parent. Choose **My athlete's phone**, enter his first name and birth year, tick his sports, type what the app should call you ("Dad"), and type a PIN twice. The PIN is never shown on screen again.
5. The next screen makes the family link. Tap **Send myself the parent link** and Message or AirDrop it to yourself (or note the 20-character code). Then **Done. Hand the phone over.**
6. Eli's screen: he picks a look and takes the one-minute tour (or skips it).

From then on Eli opens the app, checks in, and trains. The only parent thing on his screens is the "What Dad can see" card and a line saying his records go to Dad's phone.

## 2. Your phone (one minute)
1. Install the same address the same way (Share, Add to Home Screen).
2. Open the link you sent yourself. It lands on "Parent link": type what the app should call you and a PIN, tap **Connect this phone**. Done. (Or open the app, choose **My own phone**, and type the code.)
3. Settings on your phone has the parent door at the top; the parent view shows his week, alerts, approvals and settings.

## How the sync works
- Each phone sends what changed and fetches what the other sent whenever the app is opened with a signal, two seconds after any change, when it comes back online, and every two minutes while open. iPhone web apps cannot run in the background, so his evening workout reaches your phone the next time you open the app (it syncs on open).
- Merging is per record and never overwrites a newer copy; both phones adding a goal keeps both goals.
- Never synced: journal notes marked private, PINs, settings. The server holds only the hash of the family code and only answers requests that carry the code.
- The parent view, Settings tab, "Linked phones" shows the status, a Sync now button, the link and code to connect another phone, and Disconnect.
- The cloud side is a free Supabase project (organization "Flesher Family", project "athletic-lab"), separate from anything AiroDental. Free projects pause after a week with no traffic; a GitHub Actions job in the repo pings it every three days so that does not happen. If it ever does pause, the Supabase dashboard restores it with one click and the phones catch up.

## The parent view on Eli's phone
Settings (gear on Today) → **Open the parent view** → PIN. It locks again after ten minutes in the background. Tabs: This week (alerts, last seven days, totals), Exercises (form checks, 5 lb and 10 lb approvals, turn off), Settings (linked phones, strength days, growth-spurt mode, reminders, clinician-only supplement record, PIN and name, backup, sample data, erase).

## Backups (every few weeks)
Sync is not a backup. Eli's Settings has **Back up everything** (share the file to Files or iCloud Drive); the parent view has the same plus restore and parent packs. Restoring on a new phone: install, parent setup (new PIN), parent view → Restore → **Replace everything**, then reconnect with the family code from the other phone.

## Notifications
In-app messages always work (one a day on Today, not in quiet hours). Device notifications are optional, need iOS permission, and only fire while the app is open.

## If something goes wrong
- "Last try failed" under Linked phones: usually no signal; it retries on its own. If it says the project is paused, open the Supabase dashboard and restore it.
- A screen shows "Something went wrong": tap Go to Today; data is untouched.
- Forgot the PIN: there is no reset without erasing the app (the parent view's Erase, or delete and reinstall). Reconnect with the family code from the other phone and everything comes back from the cloud copy.
- The app says "Running in a browser tab": it is not on the home screen; do step 2 so the browser cannot clear its storage.
