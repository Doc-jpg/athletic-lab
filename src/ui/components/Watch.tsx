import React, { useRef, useState } from 'react';
import { videosFor } from '../../data/videos';
import type { Clip, Who } from '../../engine/types';
import { useClips, useOnline, useSettings } from '../hooks';
import { clipObjectUrl, deleteClip, uploadClip } from '../../io/clips';
import { useToast, Confirm } from './Sheet';

/**
 * "Watch it": the family's own clips first (the athlete doing the move, shot by a parent), then one
 * to three verified YouTube demonstrations played inside the app with the official embed. Nothing is
 * copied or rehosted; a YouTube link that dies is caught by the repo's three-day check.
 */
function ytId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YouTubeCard({ url, title, channel, note }: { url: string; title: string; channel: string; note?: string }) {
  const [open, setOpen] = useState(false);
  const online = useOnline();
  const id = ytId(url);
  if (!id) return null;
  return (
    <div className="card" style={{ padding: 10 }}>
      {open ? (
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
          <iframe title={title} src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      ) : (
        <button className="btn block" style={{ minHeight: 64, justifyContent: 'flex-start', textAlign: 'left', gap: 12 }} disabled={!online} onClick={() => setOpen(true)}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent-2)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontSize: 18 }}>▶</span>
          <span className="grow"><span style={{ display: 'block' }}>{title}</span><span className="small muted" style={{ display: 'block', fontWeight: 500 }}>{channel}{note ? ` · ${note}` : ''}{online ? '' : ' · needs a signal'}</span></span>
        </button>
      )}
    </div>
  );
}

function ClipCard({ clip, canDelete }: { clip: Clip; canDelete: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [del, setDel] = useState(false);
  const online = useOnline();
  const load = async () => { try { setSrc(await clipObjectUrl(clip)); } catch (e: any) { setErr(e?.message ?? 'Could not load'); } };
  return (
    <div className="card" style={{ padding: 10 }}>
      {src ? <video src={src} controls playsInline style={{ width: '100%', borderRadius: 10, background: '#000' }} /> : (
        <button className="btn block" style={{ minHeight: 64, justifyContent: 'flex-start', textAlign: 'left', gap: 12 }} disabled={!online} onClick={load}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--green)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', fontSize: 18 }}>▶</span>
          <span className="grow"><span style={{ display: 'block' }}>{clip.note || 'Your clip'}</span><span className="small muted" style={{ display: 'block', fontWeight: 500 }}>Shot {new Date(clip.createdAt).toLocaleDateString()}{online ? '' : ' · needs a signal'}</span></span>
        </button>
      )}
      {err && <div className="small" style={{ color: 'var(--danger)' }}>{err}</div>}
      {canDelete && <button className="btn ghost sm mt" style={{ color: 'var(--danger)' }} onClick={() => setDel(true)}>Remove this clip</button>}
      {del && <Confirm title="Remove this clip?" text="It is deleted from the family's cloud space and from both phones." yesLabel="Remove" danger onNo={() => setDel(false)} onYes={async () => { await deleteClip(clip); setDel(false); }} />}
    </div>
  );
}

export function Watch({ exerciseId, who, compact = false, asCard = false }: { exerciseId: string; who: Who; compact?: boolean; asCard?: boolean }) {
  const clips = useClips(exerciseId);
  const settings = useSettings();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const videos = videosFor(exerciseId);
  const canUpload = who === 'parent' && !!settings.sync?.enabled;
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try { await uploadClip(exerciseId, f, 'parent'); toast.show('Clip saved to the family cloud'); } catch (e: any) { toast.show(e?.message ?? 'Upload failed'); }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };
  if (!videos.length && !clips.length && !canUpload) return null;
  return (
    <div className={asCard ? 'card' : 'section'}>
      <div className="row between"><h3>Watch it</h3>{canUpload && <button className="btn sm" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? 'Uploading…' : '+ Add a clip of him'}</button>}</div>
      <input ref={fileRef} type="file" accept="video/*" capture="environment" className="hide" onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="list mt">
        {clips.map((c) => <ClipCard key={c.id} clip={c} canDelete={who === 'parent'} />)}
        {videos.slice(0, compact ? 1 : 3).map((v) => <YouTubeCard key={v.url} {...v} />)}
      </div>
      {!compact && <p className="small muted mt">{clips.length ? 'Your own clips first. ' : ''}{videos.length ? 'Demonstrations play right here (YouTube, needs a signal). ' : ''}{canUpload ? 'A ten-second clip of him doing it right is the best demo there is.' : ''}</p>}
      {toast.el}
    </div>
  );
}
