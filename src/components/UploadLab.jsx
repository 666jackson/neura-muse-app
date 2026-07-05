import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAsset, recordUpload } from '../lib/supabase.js';
import { T } from '../i18n.js';

const MOODS = ['Cold Precision', 'Soft Rebellion', 'Lunar Melancholy', 'Neon Devotion', 'Chrome Serenity'];
const ROLES = ['Opening Frame Heroine', 'Blueprint Oracle', 'Final Act Duelist', 'Cover Muse', 'Silent Sentinel'];
const PALETTES = ['Silver Ice — chrome / cyan', 'Pink Nova — gloss / rose', 'Black Galaxy — void / violet', 'White Chrome — pearl / steel'];
const WEAPONS = ['PLASMA BLADE', 'ION RIFLE', 'NANO SHIELD', 'WING BOOSTER', 'STEALTH CLOAK', 'HEAVY ARMOR MODE'];
const RARITIES = ['SR — LIMITED FRAME', 'SSR — PROTOTYPE', 'UR — ONE OF ONE'];

export default function UploadLab({ lang = 'en' }) {
  const t = T[lang];
  const inputRef = React.useRef(null);
  const [preview, setPreview] = React.useState(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState(null);

  const handle = async (file) => {
    if (!file || !file.type.startsWith('image')) return;
    setPreview(URL.createObjectURL(file));
    setAnalyzing(true); setAnalysis(null);
    const h = (file.name + file.size).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const result = {
      palette: PALETTES[h % PALETTES.length],
      mood: MOODS[h % MOODS.length],
      weapon: WEAPONS[h % WEAPONS.length],
      role: ROLES[h % ROLES.length],
      rarity: RARITIES[h % RARITIES.length]
    };
    try {
      const url = await uploadAsset('uploads', file);
      await recordUpload(url, result);
    } catch (e) {
      console.warn('Upload persisted locally only:', e.message);
    }
    setTimeout(() => { setAnalyzing(false); setAnalysis(result); }, 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-7">
      <div onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files[0]); }}
        className="border border-dashed border-ice/45 rounded-2xl min-h-[380px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-ice/5 transition">
        <div className="w-12 h-12 border border-ice/60 rotate-45 flex items-center justify-center"><span className="-rotate-45 text-ice text-xl">↥</span></div>
        <div className="font-display text-xs tracking-[0.25em]">DROP CHARACTER IMAGE</div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files[0])} />
      </div>
      <div className="rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 min-h-[380px]">
        {preview && (
          <div className="relative h-56 rounded-xl overflow-hidden border border-ice/35 mb-5">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                  className="font-mono text-[11px] tracking-[0.35em] text-ice">{t.analyzing}</motion.div>
              </div>
            )}
          </div>
        )}
        <AnimatePresence>
          {analysis && (
            <motion.dl initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 font-mono text-[11px] tracking-wider">
              {[['ARMOR COLOR PALETTE', analysis.palette], ['CHARACTER MOOD', analysis.mood], ['SUGGESTED WEAPON', analysis.weapon], ['CINEMATIC ROLE', analysis.role]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-2.5">
                  <dt className="text-chrome/40">{k}</dt><dd className="text-right">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-1">
                <dt className="text-chrome/40">RARITY LEVEL</dt>
                <dd className="text-nova drop-shadow-[0_0_12px_rgba(249,168,212,0.7)]">{analysis.rarity}</dd>
              </div>
            </motion.dl>
          )}
        </AnimatePresence>
        {!preview && <div className="h-full flex items-center justify-center font-mono text-[10px] tracking-[0.4em] text-chrome/35">AWAITING SPECIMEN</div>}
      </div>
    </div>
  );
}