// Checks every demonstration video in src/data/videos.ts still exists and is public, via YouTube's
// oEmbed endpoint (no API key). Run by .github/workflows/keepalive.yml every three days and by hand:
//   node scripts/check-videos.cjs
// Exit code 1 when any link is gone, with the exercise ids to fix.
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '..', 'src', 'data', 'videos.ts'), 'utf8');
const entries = [];
for (const m of src.matchAll(/'([a-z0-9-]+)': \[\{ url: '([^']+)'/g)) entries.push({ id: m[1], url: m[2] });
(async () => {
  const bad = [];
  for (const e of entries) {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(e.url)}&format=json`).catch(() => null);
    if (!r || !r.ok) { bad.push(`${e.id} ${e.url} (${r ? r.status : 'no response'})`); continue; }
    const j = await r.json();
    if (!j.title) bad.push(`${e.id} ${e.url} (no title)`);
  }
  console.log(`${entries.length - bad.length} of ${entries.length} videos OK`);
  if (bad.length) { console.log('Gone or private:\n' + bad.join('\n')); process.exit(1); }
})();
