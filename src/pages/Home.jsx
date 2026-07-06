import React from 'react';
import { motion } from 'framer-motion';
import { fetchPublicCharacters, fetchPublicVideos } from '../lib/supabase.js';
import CharacterCard from '../components/CharacterCard.jsx';
import UploadLab from '../components/UploadLab.jsx';
import Showroom3D from '../components/Showroom3D.jsx';
import { T } from '../i18n.js';

export default function Home() {
  const [lang, setLang] = React.useState(localStorage.getItem('nm_lang') || 'en');
  const t = T[lang];
  const [characters, setCharacters] = React.useState([]);
  const [videos, setVideos] = React.useState([]);
  const [active, setActive] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchPublicCharacters()
      .then((rows) => { setCharacters(rows); setActive(rows[0] || null); })
      .catch((e) => setError(e.message));
    fetchPublicVideos()
      .then(setVideos)
      .catch(() => {}); // videos are optional; ignore if the table isn't provisioned yet
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'zh' : 'en';
    localStorage.setItem('nm_lang', next);
    setLang(next);
  };

  return (
    <div className="min-h-screen bg-ink text-chrome overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-ink/60 backdrop-blur-xl border-b border-white/10">
        <div className="font-display tracking-[0.3em] text-sm">NEURA MUSE</div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="text-xs font-mono tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-ice hover:text-ice transition">
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <a href="/admin/login" className="text-xs font-mono tracking-widest text-nova/80 hover:text-nova">ADMIN</a>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background cover image */}
        {active && (
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 z-0"
          >
            {active.video_url ? (
              <video src={active.video_url} autoPlay muted loop playsInline
                poster={active.cover_image_url} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <img src={active.cover_image_url} alt={active.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            {/* Soft fade only — no frame; the reel fills the screen and blends into the page below */}
            <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink" />
          </motion.div>
        )}

        {/* Foreground content */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
          style={{ textShadow: '0 2px 34px rgba(4,5,13,0.9)' }}
          className="relative z-10 text-center px-8 lg:px-20 pt-32 pb-16 max-w-3xl mx-auto">
          <div className="text-ice font-mono text-xs tracking-[0.4em] mb-6">{t.heroEyebrow}</div>
          <h1 className="font-display text-5xl lg:text-7xl tracking-widest mb-8">NEURA MUSE</h1>
          <p className="text-chrome/70 font-light leading-relaxed max-w-md mx-auto mb-10">{t.heroDesc}</p>
          {active && (
            <div className="mb-10">
              <div className="font-mono text-[10px] tracking-[0.3em] text-ice mb-1">FASHION MOTION REEL</div>
              <div className="font-display tracking-[0.2em] text-lg">{active.name}</div>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#archive" className="font-display text-xs tracking-[0.25em] px-7 py-4 rounded-lg bg-gradient-to-r from-ice to-nova text-ink">{t.ctaEnter}</a>
            <a href="#showroom" className="font-display text-xs tracking-[0.25em] px-7 py-4 rounded-lg border border-ice/50 text-ice hover:bg-ice/10 transition">{t.cta3d}</a>
            <a href="#lab" className="font-display text-xs tracking-[0.25em] px-7 py-4 rounded-lg border border-nova/50 text-nova hover:bg-nova/10 transition">{t.ctaUpload}</a>
          </div>
        </motion.div>
      </section>

      <section id="archive" className="max-w-7xl mx-auto px-8 lg:px-20 py-24">
        <h2 className="font-display tracking-[0.25em] text-2xl mb-10">{t.secArchive}</h2>
        {error && <div className="font-mono text-xs text-red-400 mb-6">SUPABASE ERROR: {error}</div>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} active={active && active.id === c.id} onSelect={() => setActive(c)} lang={lang} />
          ))}
        </div>
        {active && (
          <motion.div key={active.id} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }}
            className="grid lg:grid-cols-2 rounded-2xl border border-white/15 overflow-hidden bg-white/[0.03] backdrop-blur-xl">
            {active.video_url ? (
              <div className="relative min-h-[320px] bg-ink">
                <video src={active.video_url} controls autoPlay muted loop playsInline
                  poster={active.cover_image_url} className="w-full h-full object-cover min-h-[320px]" />
                <div className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.3em] px-2.5 py-1 rounded-full bg-ink/70 border border-ice/40 text-ice">▶ {t.motionReel}</div>
              </div>
            ) : (
              <img src={active.cover_image_url} alt={active.name} className="w-full h-full object-cover min-h-[320px]" />
            )}
            <div className="p-10">
              <div className="font-display text-2xl tracking-[0.2em] mb-6">{active.name}</div>
              <dl className="grid grid-cols-2 gap-x-8 text-sm">
                {[['ARMOR TYPE', active.armor_type], ['WEAPON SYSTEM', active.weapon_system], ['ENERGY CORE', active.energy_core], ['RARITY', active.rarity_level]].map(([k, v]) => (
                  <div key={k} className="py-3 border-b border-white/10">
                    <dt className="font-mono text-[10px] tracking-[0.3em] text-chrome/40 mb-1">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 font-light leading-relaxed text-chrome/70">{active.cinematic_description}</p>
            </div>
          </motion.div>
        )}
      </section>

      <section id="showroom" className="max-w-7xl mx-auto px-8 lg:px-20 py-24">
        <h2 className="font-display tracking-[0.25em] text-2xl mb-10">{t.secShowroom}</h2>
        <Showroom3D modelUrl={active ? active.model_url : null} fallbackImage={active ? active.cover_image_url : null} />
      </section>

      {videos.length > 0 && (
        <section id="videos" className="max-w-7xl mx-auto px-8 lg:px-20 py-24">
          <h2 className="font-display tracking-[0.25em] text-2xl mb-10">{t.secVideos}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="rounded-2xl border border-white/12 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                <div className="relative bg-ink aspect-video">
                  <video src={v.video_url} controls playsInline muted loop poster={v.poster_url || undefined}
                    className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="font-display text-sm tracking-[0.2em] mb-2">{v.title}</div>
                  {v.description && <p className="font-light text-sm leading-relaxed text-chrome/60">{v.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section id="lab" className="max-w-5xl mx-auto px-8 lg:px-20 py-24">
        <h2 className="font-display tracking-[0.25em] text-2xl mb-10">{t.secLab}</h2>
        <UploadLab lang={lang} />
      </section>
    </div>
  );
}