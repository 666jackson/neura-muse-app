import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAsset, recordUpload } from '../lib/supabase.js';
import { analyzeFile } from '../lib/muse.js';
import { T } from '../i18n.js';

let SEQ = 0;

export default function UploadLab({ lang = 'en', onAdd }) {
  const t = T[lang];
  const inputRef = React.useRef(null);
  // Each specimen: { id, preview, url, analyzing, analysis, added }
  const [specimens, setSpecimens] = React.useState([]);

  const patch = (id, next) => setSpecimens((prev) => prev.map((s) => (s.id === id ? { ...s, ...next } : s)));

  const processOne = (file, i) => {
    const id = 'sp-' + Date.now() + '-' + (SEQ++) + '-' + i;
    const preview = URL.createObjectURL(file);
    const analysis = analyzeFile(file);
    setSpecimens((prev) => [...prev, { id, preview, url: null, analyzing: true, analysis: null, added: false }]);
    // Persist to storage in the background (optional — falls back to the local preview).
    uploadAsset('uploads', file)
      .then((url) => { patch(id, { url }); return recordUpload(url, analysis); })
      .catch((e) => console.warn('Upload persisted locally only:', e.message));
    // Reveal the analysis (staggered so a batch feels like it's scanning one by one).
    setTimeout(() => patch(id, { analyzing: false, analysis }), 1600 + i * 350);
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image'));
    files.forEach((f, i) => processOne(f, i));
  };

  const addOne = (id) => {
    const s = specimens.find((x) => x.id === id);
    if (!s || !s.analysis || s.added) return;
    onAdd && onAdd(s.analysis, s.url || s.preview);
    patch(id, { added: true });
  };

  const addAll = () => {
    const pending = specimens.filter((s) => s.analysis && !s.added);
    pending.forEach((s) => onAdd && onAdd(s.analysis, s.url || s.preview));
    setSpecimens((prev) => prev.map((s) => (s.analysis && !s.added ? { ...s, added: true } : s)));
  };

  const pendingCount = specimens.filter((s) => s.analysis && !s.added).length;

  return (
    <div className="grid md:grid-cols-2 gap-7">
      {/* ---- DROPZONE (accepts many images at once) ---- */}
      <div onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="border border-dashed border-ice/45 rounded-2xl min-h-[380px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-ice/5 transition">
        <div className="w-12 h-12 border border-ice/60 rotate-45 flex items-center justify-center"><span className="-rotate-45 text-ice text-xl">↥</span></div>
        <div className="font-display text-xs tracking-[0.25em]">DROP CHARACTER IMAGES</div>
        <div className="font-mono text-[9px] tracking-[0.3em] text-chrome/45">SELECT ONE OR MANY</div>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {/* ---- RESULTS (one card per uploaded image) ---- */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 min-h-[380px] flex flex-col">
        {specimens.length === 0 && (
          <div className="flex-1 flex items-center justify-center font-mono text-[10px] tracking-[0.4em] text-chrome/35">AWAITING SPECIMEN</div>
        )}

        {pendingCount > 1 && (
          <button onClick={addAll}
            className="mb-4 font-display text-[11px] tracking-[0.25em] py-3 rounded-lg bg-gradient-to-r from-ice to-nova text-ink">
            {t.addArchive} — ALL ({pendingCount}) ▸
          </button>
        )}

        <div className="flex flex-col gap-5 overflow-y-auto max-h-[560px] pr-1">
          <AnimatePresence>
            {specimens.map((s) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border border-white/10 bg-ink/40 overflow-hidden">
                <div className="relative h-40 border-b border-white/10">
                  <img src={s.preview} alt="preview" className="w-full h-full object-cover" />
                  {s.analyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                        className="font-mono text-[11px] tracking-[0.35em] text-ice">{t.analyzing}</motion.div>
                    </div>
                  )}
                </div>
                {s.analysis && (
                  <div className="p-4">
                    <dl className="space-y-2 font-mono text-[10px] tracking-wider">
                      {[['ARMOR COLOR PALETTE', s.analysis.palette], ['CHARACTER MOOD', s.analysis.mood], ['SUGGESTED WEAPON', s.analysis.weapon], ['CINEMATIC ROLE', s.analysis.role]].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-1.5">
                          <dt className="text-chrome/40">{k}</dt><dd className="text-right">{v}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 pt-0.5">
                        <dt className="text-chrome/40">RARITY LEVEL</dt>
                        <dd className="text-nova drop-shadow-[0_0_12px_rgba(249,168,212,0.7)]">{s.analysis.rarity}</dd>
                      </div>
                    </dl>
                    {s.added ? (
                      <div className="mt-4 text-center font-mono text-[9px] tracking-[0.3em] text-ice">▮ {t.registered}</div>
                    ) : (
                      <button onClick={() => addOne(s.id)}
                        className="mt-4 w-full font-display text-[10px] tracking-[0.25em] py-3 rounded-lg border border-ice/60 text-ice hover:bg-ice/10 transition">
                        {t.addArchive} ▸
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
