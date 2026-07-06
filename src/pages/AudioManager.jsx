import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSoundtracks, upsertSoundtrack, deleteSoundtrack, uploadAudio, signOut } from '../lib/supabase.js';
import { T } from '../i18n.js';

const EMPTY = { title: '', audio_url: '', order_index: 0, is_public: true };

export default function AudioManager({ session }) {
  const navigate = useNavigate();
  const lang = localStorage.getItem('nm_lang') || 'en';
  const t = T[lang];
  const [rows, setRows] = React.useState([]);
  const [form, setForm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (session === null) return; // still resolving
    if (!session) { navigate('/admin/login'); return; }
    fetchAllSoundtracks().then(setRows).catch((e) => setError(e.message));
  }, [session, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const importAudio = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true); setError(null);
    try {
      const url = await uploadAudio(f);
      setForm((prev) => ({ ...prev, audio_url: url, title: prev.title || f.name.replace(/\.[^.]+$/, '') }));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true); setError(null);
    try {
      if (!form.audio_url) throw new Error('Import an audio file first.');
      const payload = { ...form, order_index: Number(form.order_index) || 0 };
      await upsertSoundtrack(payload);
      setRows(await fetchAllSoundtracks());
      setForm(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this track?')) return;
    await deleteSoundtrack(id);
    setRows(await fetchAllSoundtracks());
  };

  const togglePublic = async (row) => {
    await upsertSoundtrack({ ...row, is_public: !row.is_public });
    setRows(await fetchAllSoundtracks());
  };

  return (
    <div className="min-h-screen bg-ink text-chrome px-8 lg:px-16 py-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-ice mb-2">/ADMIN/AUDIO</div>
          <h1 className="font-display tracking-[0.2em] text-2xl">{t.audioLibrary}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setForm({ ...EMPTY })} className="font-display text-[11px] tracking-widest px-5 py-3 rounded-lg border border-ice/50 text-ice hover:bg-ice/10">+ {t.newTrack}</button>
          <button onClick={() => navigate('/admin/dashboard')} className="font-mono text-[11px] tracking-widest px-5 py-3 rounded-lg border border-white/20 text-chrome/60 hover:border-ice hover:text-ice">← {t.backToChars}</button>
          <button onClick={async () => { await signOut(); navigate('/admin/login'); }} className="font-mono text-[11px] tracking-widest px-5 py-3 rounded-lg border border-white/20 text-chrome/60 hover:border-red-400 hover:text-red-400">{t.signOut}</button>
        </div>
      </div>

      {error && <div className="font-mono text-xs text-red-400 mb-6">▮ {error}</div>}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-3">
          {rows.length === 0 && !form && (
            <div className="rounded-xl border border-dashed border-white/15 p-8 text-center font-mono text-[10px] tracking-[0.3em] text-chrome/40">
              NO SOUNDTRACKS YET
            </div>
          )}
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-xl border border-white/12 bg-white/[0.03] p-3">
              <div className="w-11 h-11 rounded-lg border border-white/10 bg-ink flex items-center justify-center flex-shrink-0 text-ice text-lg">♪</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xs tracking-widest mb-1 truncate">{r.title}</div>
                <audio src={r.audio_url} controls preload="none" className="w-full h-8" />
              </div>
              <button onClick={() => togglePublic(r)} className={'font-mono text-[9px] tracking-widest rounded-full px-3 py-1.5 border ' + (r.is_public ? 'border-ice/50 text-ice bg-ice/10' : 'border-white/15 text-chrome/40')}>
                {r.is_public ? '● PUBLIC' : '○ HIDDEN'}
              </button>
              <button onClick={() => setForm(r)} className="font-mono text-[10px] tracking-widest text-ice border border-ice/40 rounded-lg px-3 py-2 hover:bg-ice/10">EDIT</button>
              <button onClick={() => remove(r.id)} className="font-mono text-[10px] text-red-400 border border-red-400/40 rounded-lg px-3 py-2 hover:bg-red-400/10">✕</button>
            </div>
          ))}
          <p className="font-mono text-[10px] leading-relaxed tracking-wider text-chrome/40 mt-2">
            The homepage plays the first PUBLIC track (lowest order index). Only one plays at a time.
          </p>
        </div>

        {form && (
          <div className="rounded-2xl border border-nova/35 bg-white/[0.03] backdrop-blur-xl p-7">
            <div className="font-mono text-[10px] tracking-[0.3em] text-nova mb-5">{form.id ? 'EDITING — ' + form.title : 'NEW TRACK'}</div>

            <div className="mb-4">
              <label className="block font-mono text-[9px] tracking-[0.3em] text-chrome/50 mb-1.5">TITLE</label>
              <input value={form.title || ''} onChange={set('title')} className="w-full rounded-lg bg-ink/70 border border-white/15 px-3 py-2.5 text-sm focus:border-nova outline-none" />
            </div>
            <div className="mb-5">
              <label className="block font-mono text-[9px] tracking-[0.3em] text-chrome/50 mb-1.5">ORDER INDEX</label>
              <input type="number" value={form.order_index ?? 0} onChange={set('order_index')} className="w-28 rounded-lg bg-ink/70 border border-white/15 px-3 py-2.5 text-sm focus:border-nova outline-none" />
            </div>

            {/* ---- AUDIO FILE ---- */}
            <div className="mb-5 rounded-xl border border-ice/25 bg-ice/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-[9px] tracking-[0.3em] text-ice">{t.audioLibrary}</label>
                {form.audio_url && (
                  <button type="button" onClick={() => setForm({ ...form, audio_url: '' })}
                    className="font-mono text-[9px] tracking-widest text-red-400 hover:underline">{t.removeAudio}</button>
                )}
              </div>
              {form.audio_url ? (
                <audio src={form.audio_url} controls className="w-full mb-3" />
              ) : (
                <div className="h-16 rounded-lg border border-dashed border-white/15 flex items-center justify-center font-mono text-[9px] tracking-[0.3em] text-chrome/35 mb-3">
                  NO AUDIO YET
                </div>
              )}
              <label className="inline-flex font-mono text-[10px] tracking-widest text-ice border border-ice/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-ice/10">
                ↥ {t.importAudio}
                <input type="file" accept="audio/*" hidden onChange={importAudio} />
              </label>
            </div>

            <label className="flex items-center gap-3 mb-6 font-mono text-[10px] tracking-widest text-chrome/60">
              <input type="checkbox" checked={!!form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
              PUBLIC ON WEBSITE
            </label>
            <div className="flex gap-3">
              <button disabled={busy} onClick={save} className="flex-1 font-display text-xs tracking-[0.25em] py-3.5 rounded-lg bg-gradient-to-r from-ice to-nova text-ink disabled:opacity-50">{t.saveTrack}</button>
              <button onClick={() => setForm(null)} className="font-mono text-[10px] tracking-widest px-5 rounded-lg border border-white/20 text-chrome/60">{t.cancel}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
