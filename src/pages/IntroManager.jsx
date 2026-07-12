import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllIntroVideos, upsertIntroVideo, deleteIntroVideo, uploadIntroVideo, uploadAsset, signOut } from '../lib/supabase.js';
import { T } from '../i18n.js';

// Manages exactly two clips (slot 0 + slot 1) played before the hero rotation.
const SLOTS = [0, 1];

export default function IntroManager({ session }) {
  const navigate = useNavigate();
  const lang = localStorage.getItem('nm_lang') || 'en';
  const t = T[lang];
  const [rows, setRows] = React.useState([]);
  const [busy, setBusy] = React.useState(null); // slot index currently uploading
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (session === null) return;
    if (!session) { navigate('/admin/login'); return; }
    fetchAllIntroVideos().then(setRows).catch((e) => setError(e.message));
  }, [session, navigate]);

  const bySlot = (slot) => rows.find((r) => r.order_index === slot) || null;

  const refresh = async () => setRows(await fetchAllIntroVideos());

  const uploadVideoForSlot = async (slot, e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    setBusy(slot); setError(null);
    try {
      const url = await uploadIntroVideo(f);
      const existing = bySlot(slot);
      await upsertIntroVideo({ ...(existing || {}), order_index: slot, video_url: url, is_public: existing ? existing.is_public : true });
      await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(null); }
  };

  const uploadPosterForSlot = async (slot, e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const existing = bySlot(slot);
    if (!existing) { setError('Upload the clip first, then the poster.'); return; }
    setBusy(slot); setError(null);
    try {
      const url = await uploadAsset('videos', f, 'intro/posters/');
      await upsertIntroVideo({ ...existing, poster_url: url });
      await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(null); }
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

      <p className="font-mono text-[10px] tracking-wider text-chrome/40 mb-8 leading-relaxed">
        These two clips play in order on the homepage <span className="text-ice">before</span> the character image rotation begins. Clip 1 → Clip 2 → then the archive reveals.
      </p>

      {error && <div className="font-mono text-xs text-red-400 mb-6">▮ {error}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {SLOTS.map((slot) => {
          const row = bySlot(slot);
          return (
            <div key={slot} className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-sm tracking-[0.2em]">CLIP {slot + 1}</div>
                {row && (
                  <button onClick={() => togglePublic(row)} className={'font-mono text-[9px] tracking-widest rounded-full px-3 py-1.5 border ' + (row.is_public ? 'border-ice/50 text-ice bg-ice/10' : 'border-white/15 text-chrome/40')}>
                    {row.is_public ? '● PUBLIC' : '○ HIDDEN'}
                  </button>
                )}
              </div>

              {row && row.video_url ? (
                <video src={row.video_url} controls playsInline poster={row.poster_url || undefined}
                  className="w-full aspect-video rounded-lg border border-white/10 bg-ink mb-4 object-cover" />
              ) : (
                <div className="w-full aspect-video rounded-lg border border-dashed border-white/15 flex items-center justify-center font-mono text-[9px] tracking-[0.3em] text-chrome/35 mb-4">
                  {busy === slot ? 'UPLOADING…' : 'NO CLIP YET'}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <label className={'inline-flex font-mono text-[10px] tracking-widest text-ice border border-ice/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-ice/10 ' + (busy === slot ? 'opacity-50 pointer-events-none' : '')}>
                  ↥ {row ? 'REPLACE' : t.importVideo}
                  <input type="file" accept="video/*" hidden onChange={(e) => uploadVideoForSlot(slot, e)} />
                </label>
                <label className={'inline-flex font-mono text-[10px] tracking-widest text-chrome/60 border border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:border-ice hover:text-ice ' + (busy === slot ? 'opacity-50 pointer-events-none' : '')}>
                  ◺ POSTER
                  <input type="file" accept="image/*" hidden onChange={(e) => uploadPosterForSlot(slot, e)} />
                </label>
                {row && (
                  <button onClick={() => remove(row)} className="font-mono text-[10px] text-red-400 border border-red-400/40 rounded-lg px-3 py-2 hover:bg-red-400/10">✕ REMOVE</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
