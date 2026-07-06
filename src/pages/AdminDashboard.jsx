import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllCharacters, upsertCharacter, deleteCharacter, uploadAsset, uploadVideo, signOut } from '../lib/supabase.js';
import { analyzeFile, characterFromAnalysis } from '../lib/muse.js';
import { T } from '../i18n.js';

const EMPTY = {
  name: '', slug: '', armor_type: '', weapon_system: '', energy_core: '',
  cinematic_description: '', color_theme: '#7dd3fc', rarity_level: 'SR',
  cover_image_url: '', gallery_images: [], model_url: '', video_url: '', is_public: true
};

export default function AdminDashboard({ session }) {
  const navigate = useNavigate();
  const lang = localStorage.getItem('nm_lang') || 'en';
  const t = T[lang];
  const [rows, setRows] = React.useState([]);
  const [form, setForm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [progress, setProgress] = React.useState(null); // batch upload { done, total }

  React.useEffect(() => {
    if (session === null) return; // still resolving
    if (!session) { navigate('/admin/login'); return; }
    fetchAllCharacters().then(setRows).catch((e) => setError(e.message));
  }, [session, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Upload a cover AND auto-fill any empty fields from the analysis — same reading as the homepage lab.
  const uploadCover = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadAsset('characters', f, 'covers/');
      const a = analyzeFile(f);
      setForm((prev) => ({
        ...prev,
        cover_image_url: url,
        name: prev.name || 'CUSTOM MUSE',
        armor_type: prev.armor_type || a.palette,
        weapon_system: prev.weapon_system || a.weapon,
        energy_core: prev.energy_core || 'Unclassified Core',
        rarity_level: prev.rarity_level || a.rarity,
        cinematic_description: prev.cinematic_description || (a.mood + ' · ' + a.role + ' · ' + a.rarity)
      }));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  // Batch quick-add: drop many images → each is uploaded, auto-named, auto-analyzed and saved as a character.
  const quickUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type && f.type.startsWith('image'));
    e.target.value = '';
    if (!files.length) return;
    setBusy(true); setError(null); setProgress({ done: 0, total: files.length });
    try {
      let n = rows.length;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const url = await uploadAsset('characters', f, 'covers/');
        n += 1;
        await upsertCharacter(characterFromAnalysis(analyzeFile(f), url, n));
        setProgress({ done: i + 1, total: files.length });
      }
      setRows(await fetchAllCharacters());
    } catch (err) { setError(err.message); } finally { setBusy(false); setProgress(null); }
  };

  const uploadModel = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadAsset('models', f, 'glb/');
      setForm({ ...form, model_url: url });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  // ---- 導入影片 (import an existing video file) ----
  const importVideo = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true); setError(null);
    try {
      const url = await uploadVideo(f);
      setForm((prev) => ({ ...prev, video_url: url }));
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true); setError(null);
    try {
      const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      await upsertCharacter(payload);
      setRows(await fetchAllCharacters());
      setForm(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this character?')) return;
    await deleteCharacter(id);
    setRows(await fetchAllCharacters());
  };

  const togglePublic = async (row) => {
    await upsertCharacter({ ...row, is_public: !row.is_public });
    setRows(await fetchAllCharacters());
  };

  return (
    <div className="min-h-screen bg-ink text-chrome px-8 lg:px-16 py-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-ice mb-2">/ADMIN/DASHBOARD</div>
          <h1 className="font-display tracking-[0.2em] text-2xl">CHARACTER MANAGEMENT</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setForm({ ...EMPTY })} className="font-display text-[11px] tracking-widest px-5 py-3 rounded-lg border border-ice/50 text-ice hover:bg-ice/10">+ {t.newChar}</button>
          <label className={'font-display text-[11px] tracking-widest px-5 py-3 rounded-lg border border-nova/50 text-nova hover:bg-nova/10 cursor-pointer ' + (busy ? 'opacity-50 pointer-events-none' : '')}>
            ⚡ {t.quickAdd}
            <input type="file" accept="image/*" multiple hidden onChange={quickUpload} />
          </label>
          <button onClick={() => navigate('/admin/videos')} className="font-display text-[11px] tracking-widest px-5 py-3 rounded-lg border border-nova/50 text-nova hover:bg-nova/10">▶ {t.videoLibrary}</button>
          <button onClick={() => navigate('/admin/audio')} className="font-display text-[11px] tracking-widest px-5 py-3 rounded-lg border border-ice/50 text-ice hover:bg-ice/10">♪ {t.audioLibrary}</button>
          <button onClick={async () => { await signOut(); navigate('/admin/login'); }} className="font-mono text-[11px] tracking-widest px-5 py-3 rounded-lg border border-white/20 text-chrome/60 hover:border-red-400 hover:text-red-400">{t.signOut}</button>
        </div>
      </div>

      {error && <div className="font-mono text-xs text-red-400 mb-6">▮ {error}</div>}
      <div className="font-mono text-[10px] tracking-wider text-chrome/40 mb-4">⚡ {t.quickAddHint}</div>
      {progress && (
        <div className="font-mono text-xs text-ice mb-6">▮ {t.adding} {progress.done}/{progress.total}…</div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-4 rounded-xl border border-white/12 bg-white/[0.03] p-3">
              {r.cover_image_url && <img src={r.cover_image_url} alt="" className="w-12 h-16 object-cover rounded-lg border border-white/10" />}
              <div className="flex-1 min-w-0">
                <div className="font-display text-xs tracking-widest mb-1">{r.name}</div>
                <div className="font-mono text-[10px] text-chrome/45 truncate">{r.armor_type}</div>
              </div>
              <button onClick={() => togglePublic(r)} className={'font-mono text-[9px] tracking-widest rounded-full px-3 py-1.5 border ' + (r.is_public ? 'border-ice/50 text-ice bg-ice/10' : 'border-white/15 text-chrome/40')}>
                {r.is_public ? '● PUBLIC' : '○ HIDDEN'}
              </button>
              <button onClick={() => setForm(r)} className="font-mono text-[10px] tracking-widest text-ice border border-ice/40 rounded-lg px-3 py-2 hover:bg-ice/10">EDIT</button>
              <button onClick={() => remove(r.id)} className="font-mono text-[10px] text-red-400 border border-red-400/40 rounded-lg px-3 py-2 hover:bg-red-400/10">✕</button>
            </div>
          ))}
        </div>

        {form && (
          <div className="rounded-2xl border border-nova/35 bg-white/[0.03] backdrop-blur-xl p-7">
            <div className="font-mono text-[10px] tracking-[0.3em] text-nova mb-5">{form.id ? 'EDITING — ' + form.name : 'NEW CHARACTER'}</div>
            {[['name', 'NAME'], ['armor_type', 'ARMOR TYPE'], ['weapon_system', 'WEAPON SYSTEM'], ['energy_core', 'ENERGY CORE'], ['rarity_level', 'RARITY LEVEL'], ['color_theme', 'COLOR THEME']].map(([k, label]) => (
              <div key={k} className="mb-4">
                <label className="block font-mono text-[9px] tracking-[0.3em] text-chrome/50 mb-1.5">{label}</label>
                <input value={form[k] || ''} onChange={set(k)} className="w-full rounded-lg bg-ink/70 border border-white/15 px-3 py-2.5 text-sm focus:border-nova outline-none" />
              </div>
            ))}
            <div className="mb-4">
              <label className="block font-mono text-[9px] tracking-[0.3em] text-chrome/50 mb-1.5">CINEMATIC DESCRIPTION</label>
              <textarea rows={4} value={form.cinematic_description || ''} onChange={set('cinematic_description')} className="w-full rounded-lg bg-ink/70 border border-white/15 px-3 py-2.5 text-sm focus:border-nova outline-none resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block font-mono text-[9px] tracking-[0.3em] text-chrome/50 mb-1.5">COVER IMAGE</label>
                <input type="file" accept="image/*" onChange={uploadCover} className="text-xs" />
                {form.cover_image_url && <img src={form.cover_image_url} alt="" className="mt-2 w-20 h-24 object-cover rounded-lg" />}
              </div>
              <div>
                <label className="block font-mono text-[9px] tracking-[0.3em] text-chrome/50 mb-1.5">3D MODEL (.glb/.gltf)</label>
                <input type="file" accept=".glb,.gltf" onChange={uploadModel} className="text-xs" />
                {form.model_url && <div className="mt-2 font-mono text-[9px] text-ice truncate">{form.model_url}</div>}
              </div>
            </div>
            {/* ---- MOTION REEL: import + AI generate ---- */}
            <div className="mb-6 rounded-xl border border-ice/25 bg-ice/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-[9px] tracking-[0.3em] text-ice">{t.motionReel}</label>
                {form.video_url && (
                  <button type="button" onClick={() => setForm({ ...form, video_url: '' })}
                    className="font-mono text-[9px] tracking-widest text-red-400 hover:underline">{t.removeVideo}</button>
                )}
              </div>

              {form.video_url ? (
                <video src={form.video_url} controls playsInline
                  className="w-full max-h-52 rounded-lg border border-white/10 bg-ink mb-3 object-contain" />
              ) : (
                <div className="h-24 rounded-lg border border-dashed border-white/15 flex items-center justify-center font-mono text-[9px] tracking-[0.3em] text-chrome/35 mb-3">
                  NO REEL YET
                </div>
              )}

              <label className="inline-flex font-mono text-[10px] tracking-widest text-ice border border-ice/40 rounded-lg px-3 py-2 cursor-pointer hover:bg-ice/10">
                ↥ {t.importVideo}
                <input type="file" accept="video/*" hidden onChange={importVideo} />
              </label>
            </div>

            <label className="flex items-center gap-3 mb-6 font-mono text-[10px] tracking-widest text-chrome/60">
              <input type="checkbox" checked={!!form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
              PUBLIC ON WEBSITE
            </label>
            <div className="flex gap-3">
              <button disabled={busy} onClick={save} className="flex-1 font-display text-xs tracking-[0.25em] py-3.5 rounded-lg bg-gradient-to-r from-ice to-nova text-ink disabled:opacity-50">{t.save}</button>
              <button onClick={() => setForm(null)} className="font-mono text-[10px] tracking-widest px-5 rounded-lg border border-white/20 text-chrome/60">{t.cancel}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}