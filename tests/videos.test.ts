import { describe, it, expect } from 'vitest';
import { VIDEOS, VIDEO_ALIAS, videosFor } from '../src/data/videos';
import { LIBRARY_EXERCISES as EXERCISES } from '../src/data/exercises';
import { AthleticLabDB, createAthlete } from '../src/db/db';
import { startFamily, joinFamily, syncNow } from '../src/io/sync';
import { formatCode } from '../src/io/sync';
import { buildBackup, readBackup, restoreBackup } from '../src/io/backup';
import { sha256Hex } from '../src/io/hash';
import type { Clip } from '../src/engine/types';
import { nowIso } from '../src/engine/types';

let n = 0;
const fresh = () => new AthleticLabDB('vid-' + Date.now() + '-' + n++);
const ids = new Set(EXERCISES.map((e) => e.id));

describe('demonstration videos', () => {
  it('every video belongs to a real exercise, is a YouTube watch link, and has a title and channel', () => {
    for (const [id, list] of Object.entries(VIDEOS)) {
      expect(ids.has(id), id).toBe(true);
      expect(list.length).toBeGreaterThan(0);
      expect(list.length).toBeLessThanOrEqual(3);
      for (const v of list) {
        expect(v.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/);
        expect(v.title.length).toBeGreaterThan(3);
        expect(v.channel.length).toBeGreaterThan(1);
      }
    }
    for (const [a, b] of Object.entries(VIDEO_ALIAS)) { expect(ids.has(a)).toBe(true); expect(VIDEOS[b]).toBeDefined(); }
  });
  it('the whole Shortstop Movement workout and every non-obvious move has a demo; progressions reuse the base one', () => {
    for (const e of EXERCISES.filter((x) => x.area === 'infield')) expect(videosFor(e.id).length, e.id).toBeGreaterThan(0);
    expect(videosFor('lo-splitsquat')).toEqual(videosFor('lo-splitsquat-assist'));
    expect(videosFor('wu-march')).toEqual([]);
    const covered = EXERCISES.filter((e) => videosFor(e.id).length > 0).length;
    expect(covered).toBeGreaterThanOrEqual(38);
  });
});

function fakeServer() {
  const rows = new Map<string, any>();
  let clock = 1;
  const fetchImpl = async (url: string, init: any = {}) => {
    const fid = await sha256Hex(init.headers?.['x-family-key'] ?? '');
    if (init.method === 'POST') {
      for (const r of JSON.parse(init.body)) {
        const key = `${r.family_id}|${r.tbl}|${r.id}`;
        const cur = rows.get(key);
        if (cur && r.stamp < cur.stamp) continue;
        rows.set(key, { ...r, server_ts: new Date(Date.UTC(2026, 10, 2, 0, 0, clock++)).toISOString() });
      }
      return { ok: true, status: 201, json: async () => [], text: async () => '' };
    }
    const u = new URL(url, 'https://x');
    const gt = decodeURIComponent((u.searchParams.get('server_ts') ?? 'gt.1970').slice(3));
    const out = [...rows.values()].filter((r) => r.family_id === fid && r.server_ts > gt).sort((a, b) => a.server_ts.localeCompare(b.server_ts));
    return { ok: true, status: 200, json: async () => out, text: async () => '' };
  };
  return { fetchImpl };
}

describe("the family's own clips", () => {
  it('a clip added on the parent phone appears on the athlete phone, survives a backup, and a removal reaches the other phone', async () => {
    const { fetchImpl } = fakeServer();
    const cfg = { url: 'https://fake', anonKey: 'k' };
    const eli = fresh();
    const dad = fresh();
    await createAthlete({ firstName: 'Eli', birthYear: 2014, sports: [] }, eli);
    const fam = await startFamily('eli-phone', eli);
    await joinFamily(formatCode(fam.secret), 'dad-phone', dad);
    await syncNow(eli, fetchImpl, cfg);
    await syncNow(dad, fetchImpl, cfg);
    const ts = nowIso();
    const clip: Clip = { id: 'clip-1', exerciseId: 'ss-crossover', path: `${fam.familyId}/ss-crossover/clip-1.mp4`, mime: 'video/mp4', bytes: 1234, note: 'first try', by: 'parent', createdAt: ts, updatedAt: ts };
    await dad.clips.put(clip);
    await syncNow(dad, fetchImpl, cfg);
    await syncNow(eli, fetchImpl, cfg);
    expect((await eli.clips.get('clip-1'))?.note).toBe('first try');
    // Backups carry the metadata too.
    const c = await readBackup((await buildBackup('t', 'full', eli)).bytes);
    const copy = fresh();
    await restoreBackup(c, 'replace', copy);
    expect(await copy.clips.count()).toBe(1);
    // Removing it on the parent phone (row + tombstone) drops it on the athlete phone.
    await dad.transaction('rw', dad.clips, dad.tombstones, async () => {
      await dad.clips.delete('clip-1');
      await dad.tombstones.put({ key: 'clips:clip-1', tbl: 'clips', id: 'clip-1', ts: nowIso() });
    });
    await syncNow(dad, fetchImpl, cfg);
    await syncNow(eli, fetchImpl, cfg);
    expect(await eli.clips.get('clip-1')).toBeUndefined();
  });
});
