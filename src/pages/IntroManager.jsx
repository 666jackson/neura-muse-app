import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllIntroVideos, upsertIntroVideo, deleteIntroVideo, uploadIntroVideo, uploadAsset, signOut } from '../lib/supabase.js';
import { T } from '../i18n.js';

// Up to 10 clips play in order on the homepage, before the character image rotation.
const MAX = 10;

export default function IntroManager({ session }) {
  const navigate = useNavigate();
  const lang = localStorage.getItem('nm_lang') || 'en';
  const t = T[lang];
  const [rows, setRows] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const vidInputRef = React.useRef(null);

  React.useEffect(() => {
    if (session === null) return;
    if (!session) { navigate('/admin/login'); return; }
    fetchAllIntroVideos().then(setRows).catch((e) => setError(e.message));
  }, [session, navigate]);

  const refresh = async () => setRows(await fetchAllIntroVideos());

  // One at a time: pick a single clip → upload it → append it to the list.
  const addOne = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!(f.type && f.type.startsWith('video'))) { setError('Please choose a video file.'); return; }
    if (rows.length >= MAX) { setError('Maximum of ' + MAX + ' intro clips reached.'); return; }
    setBusy(true); setError(null);
    try {
      const url = await uploadIntroVideo(f);
      const title = f.name.replace(/\.[^.]+$/, '');
      await upsertIntroVideo({ title, video_url: url, order_index: rows.length, is_public: true });
      await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const uploadPoster = async (row, e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true); setError(null);
    try {
      const url = await uploadAsset('videos', f, 'intro/posters/');
      await upsertIntroVideo({ ...row, poster_url: url });
      await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const togglePublic = async (row) => {
    await upsertIntroVideo({ ...row, is_public: !row.is_public });
    await refresh();
  };

  const remove = async (row) => {
    if (!confirm('Remove this intro clip?')) return;
    await deleteIntroVideo(row.id);
    await refresh();
  };

  // ---- drag-to-reorder ----
  const dragIndex = React.useRef(null);
  const reorder = async (from, to) => {
    if (from == null || to == null || from === to) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next); // optimistic
    try {
      await Promise.all(next.map((r, idx) => upsertIntroVideo({ ...r, order_index: idx })));
    } catch (err) { setError(err.message); await refresh(); }
  };

  const full = rows.length >= MAX;

  return (
    <div className="min-h-screen bg-ink text-chrome px-8 lg:px-16 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-ice mb-2">/ADMIN/INTRO</div>
          <h1 className="font-display tracking-[0.2em] text-2xl">INTRO ANIMATIONS</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="font-mono text-[11px] tracking-widest px-5 py-3 rounded-lg border border-white/20 text-chrome/60 hover:border-ice hover:text-ice">← {t.backToChars}</button>
          <button onClick={async () => { await signOut(); navigate('/admin/login'); }} className="font-mono text-[11px] tracking-widest px-5 py-3 rounded-lg border border-white/20 text-chrome/60 hover:border-red-400 hover:text-red-400">{t.signOut}</button>
        </div>
      </div>

      <p className="font-mono text-[10px] tracking-wider text-chrome/40 mb-6 leading-relaxed">
        Up to <span className="text-ice">{MAX}</span> clips play in order on the homepage <span className="text-ice">before</span> the character image rotation. Drag the handle to reorder. ({rows.length}/{MAX})
      </p>

      {error && <div className="font-mono text-xs text-red-400 mb-6">▮ {error}</div>}

      {/* ---- ADD ONE CLIP AT A TIME — pick a single video, upload, repeat ---- */}
      <div className="mb-6">
        <button
          onClick={() => !full && !busy && vidInputRef.current && vidInputRef.current.click()}
          disabled={full || busy}
          className={'w-full rounded-2xl border border-dashed p-8 text-center transition ' +
            (full || busy ? 'border-white/10 opacity-40 cursor-not-allowed' : 'border-white/20 hover:border-ice/60 cursor-pointer')}>
          <div className="text-2xl mb-2">⤓</div>
          <div className="font-display text-xs tracking-[0.25em] mb-1">
            {full ? 'MAX ' + MAX + ' CLIPS' : busy ? 'UPLOADING…' : '+ ADD INTRO CLIP'}
          </div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-chrome/45">
            {full ? 'REMOVE ONE TO ADD MORE' : 'PICK ONE VIDEO FROM YOUR DEVICE'}
          </div>
        </button>
        <input ref={vidInputRef} type="file" accept="video/*" hidden onChange={addOne} />
      </div>

      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 p-8 text-center font-mono text-[10px] tracking-[0.3em] text-chrome/40">
            NO INTRO CLIPS YET
          </div>
        )}
        {rows.map((r, i) => (
          <div key={r.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { reorder(dragIndex.current, i); dragIndex.current = null; }}
            className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] p-3">
            <span draggable onDragStart={() => (dragIndex.current = i)}
              title="Drag to reorder"
              className="cursor-grab active:cursor-grabbing select-none px-1 text-chrome/40 hover:text-ice text-lg leading-none">⠿</span>
            <div className="font-mono text-[11px] text-ice w-6 text-center">{i + 1}</div>
            <div className="w-24 h-14 rounded-lg border border-white/10 bg-ink overflow-hidden flex-shrink-0">
              {r.poster_url ? (
                <img src={r.poster_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={r.video_url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xs tracking-widest truncate">{r.title || 'INTRO CLIP ' + (i + 1)}</div>
              <div className="font-mono text-[9px] text-chrome/40 truncate">{r.video_url}</div>
            </div>
            <button onClick={() => togglePublic(r)} className={'font-mono text-[9px] tracking-widest rounded-full px-3 py-1.5 border ' + (r.is_public ? 'border-ice/50 text-ice bg-ice/10' : 'border-white/15 text-chrome/40')}>
              {r.is_public ? '● PUBLIC' : '○ HIDDEN'}
            </button>
            <label className="font-mono text-[10px] tracking-widest text-chrome/60 border border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:border-ice hover:text-ice">
              ◺ POSTER
              <input type="file" accept="image/*" hidden onChange={(e) => uploadPoster(r, e)} />
            </label>
            <button onClick={() => remove(r)} className="font-mono text-[10px] text-red-400 border border-red-400/40 rounded-lg px-3 py-2 hover:bg-red-400/10">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
