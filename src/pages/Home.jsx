import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPublicCharacters, fetchPublicVideos, fetchPublicSoundtrack, fetchIntroVideos } from '../lib/supabase.js';
import CharacterCard from '../components/CharacterCard.jsx';
import UploadLab from '../components/UploadLab.jsx';
import { T, NEXT_LANG_LABEL, nextLang } from '../i18n.js';

// Top-nav links to the five stand-alone oracle areas.
const NAV_AREAS = [
  { path: '/daily',      label: { en: 'DAILY',  zh: '今日繆斯', ja: '今日' } },
  { path: '/divination', label: { en: 'ORACLE', zh: '神諭占卜', ja: '神託' } },
  { path: '/gacha',      label: { en: 'GACHA',  zh: '抽卡',    ja: 'ガチャ' } },
  { path: '/rates',      label: { en: 'RATES',  zh: '機率',    ja: '排出率' } },
  { path: '/vault',      label: { en: 'VAULT',  zh: '密庫',    ja: '蔵' } }
];

export default function Home() {
  const [lang, setLang] = React.useState(localStorage.getItem('nm_lang') || 'en');
  const t = T[lang];
  const [characters, setCharacters] = React.useState([]);
  const [videos, setVideos] = React.useState([]);
  const [active, setActive] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [heroIdx, setHeroIdx] = React.useState(0);
  // ---- intro animations (two clips) played before the hero image rotation ----
  const [introVideos, setIntroVideos] = React.useState(null); // null = still loading
  const [introDone, setIntroDone] = React.useState(false);
  const [introIdx, setIntroIdx] = React.useState(0);
  // ---- reel picker: click a small reel to play it large ----
  const [reelPlayer, setReelPlayer] = React.useState(null);

  // ---- background soundtrack ----
  const [soundtrack, setSoundtrack] = React.useState(null);
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef(null);
  const seqRef = React.useRef(null); // incrementing number for uploaded "CUSTOM MUSE" cards

  // Add an uploaded specimen to the on-screen archive (client-side; public visitors can't write to the DB).
  const addMuse = (analysis, imageUrl) => {
    if (seqRef.current === null) seqRef.current = characters.length;
    seqRef.current += 1;
    const n = seqRef.current;
    const nc = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: 'CUSTOM MUSE ' + (n < 10 ? '0' + n : n),
      cover_image_url: imageUrl,
      video_url: null,
      armor_type: analysis.palette,
      weapon_system: analysis.weapon,
      energy_core: 'Unclassified Core',
      rarity_level: analysis.rarity,
      color_theme: '#7dd3fc',
      cinematic_description: analysis.mood + ' · ' + analysis.role + ' · ' + analysis.rarity
    };
    setCharacters((prev) => [...prev, nc]);
    setActive(nc);
  };

  // ---- video playlist: only 2 slots on screen; when both finish, advance to the next pair ----
  const [pairStart, setPairStart] = React.useState(0);
  const endedRef = React.useRef([false, false]);

  React.useEffect(() => { setPairStart(0); endedRef.current = [false, false]; }, [videos.length]);

  const onSlotEnded = (slot) => {
    endedRef.current[slot] = true;
    if (endedRef.current[0] && endedRef.current[1]) {
      endedRef.current = [false, false];
      setPairStart((p) => (p + 2) % videos.length);
    }
  };

  const rotateVideos = videos.length > 2;
  const videoSlots = rotateVideos
    ? [videos[pairStart % videos.length], videos[(pairStart + 1) % videos.length]]
    : videos;

  React.useEffect(() => {
    fetchPublicCharacters()
      .then((rows) => { setCharacters(rows); }) // detail opens on click, not on load
      .catch((e) => setError(e.message));
    fetchPublicVideos()
      .then(setVideos)
      .catch(() => {}); // videos are optional; ignore if the table isn't provisioned yet
    fetchPublicSoundtrack()
      .then(setSoundtrack)
      .catch(() => {}); // soundtrack is optional
    fetchIntroVideos()
      .then((rows) => setIntroVideos(rows))
      .catch(() => setIntroVideos([])); // intro clips are optional
  }, []);

  const toggleMusic = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { el.play().then(() => setPlaying(true)).catch(() => {}); }
    else { el.pause(); setPlaying(false); }
  };

  // Boot fallback — only when there are no intro clips (otherwise the hero-background clips drive it).
  React.useEffect(() => {
    if (introVideos === null) return;        // wait for the fetch to resolve
    if (introVideos.length > 0) return;      // the two clips will call onDone
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = setTimeout(() => setIntroDone(true), reduce ? 0 : 2600);
    return () => clearTimeout(id);
  }, [introVideos]);

  // Auto-rotate the hero background — starts only AFTER the intro animations finish.
  React.useEffect(() => {
    if (!introDone || characters.length < 2) return;
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % characters.length), 5500);
    return () => clearInterval(id);
  }, [characters.length, introDone]);

  const heroItem = characters.length ? characters[heroIdx % characters.length] : null;

  // Intro clips play as the hero BACKGROUND (behind the title), then hand off to the image rotation.
  const playingIntro = !introDone && !!introVideos && introVideos.length > 0;
  const introClip = playingIntro ? introVideos[Math.min(introIdx, introVideos.length - 1)] : null;
  const advanceIntro = () => setIntroIdx((i) => {
    if (i + 1 < introVideos.length) return i + 1;
    setIntroDone(true);
    return i;
  });
  // Boot loader only shows while intro clips are absent (loading, or none uploaded).
  const showBoot = !introDone && (introVideos === null || introVideos.length === 0);

  const marqueeBase = characters.length ? characters.map((c) => c.name).join('   ·   ') : t.tagline;
  const marqueeText = `   ${marqueeBase}   ·   NEURA MUSE   ·   SECTOR 07   `.repeat(3);

  const toggleLang = () => {
    const next = nextLang(lang);
    localStorage.setItem('nm_lang', next);
    setLang(next);
  };

  return (
    <div className="min-h-screen bg-ink text-chrome overflow-x-hidden">
      {/* ===== BOOT LOADER — only while intro clips are loading / absent ===== */}
      {showBoot && (
        <div className="fixed inset-0 z-[100] bg-ink">
          <div className="nm-intro absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 pointer-events-none">
            <div className="font-mono text-[10px] tracking-[0.5em] text-ice/80">{t.introEyebrow}</div>
            <div className="font-display text-3xl sm:text-5xl tracking-[0.3em] text-center">NEURA MUSE</div>
            <div className="w-[280px] h-px bg-white/12 relative overflow-hidden">
              <div className="nm-introbar absolute left-0 top-0 h-full bg-gradient-to-r from-ice to-nova" />
            </div>
            <div className="font-mono text-[9px] tracking-[0.4em] text-chrome/40">{t.introFooter}</div>

            {/* 跑馬燈 marquee */}
            <div className="absolute bottom-10 inset-x-0 overflow-hidden border-y border-white/[0.08] py-2">
              <div className="nm-marquee whitespace-nowrap font-mono text-[10px] tracking-[0.4em] text-chrome/35">
                <span>{marqueeText}</span><span aria-hidden="true">{marqueeText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-ink/60 backdrop-blur-xl border-b border-white/10">
        <div className="font-display tracking-[0.3em] text-sm">NEURA MUSE</div>

        {/* Center section nav */}
        <nav className="hidden md:flex items-center gap-7 font-mono text-[11px] tracking-[0.25em] text-chrome/60">
          <a href="#videos" className="hover:text-ice transition">{t.navVideos}</a>
          <a href="#archive" className="hover:text-ice transition">{t.navArchive}</a>
          <a href="#lab" className="hover:text-ice transition">{t.navUpload}</a>
          <span className="w-px h-3 bg-white/15" />
          {NAV_AREAS.map((a) => (
            <a key={a.path} href={a.path} className="text-nova/80 hover:text-nova transition">{a.label[lang] || a.label.en}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleLang} className="text-xs font-mono tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-ice hover:text-ice transition">
            {NEXT_LANG_LABEL[lang]}
          </button>
          <a href="#lab" className="hidden sm:inline text-xs font-mono tracking-widest text-ink bg-gradient-to-r from-ice to-nova rounded-full px-4 py-2">{t.navUpload}</a>
          <a href="/admin/login" className="text-xs font-mono tracking-widest text-nova/80 hover:text-nova">ADMIN</a>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full-bleed background — the two intro clips play FIRST (behind the title), then the
            character reel auto-rotates through every character with a crossfade. */}
        {(playingIntro || heroItem) && (
          <div className="absolute inset-0 z-0">
            <AnimatePresence>
              {playingIntro ? (
                <motion.div key={'intro-' + introClip.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="absolute inset-0">
                  <div className="absolute inset-0 nm-ken">
                    <video key={introClip.id} src={introClip.video_url} autoPlay muted playsInline
                      poster={introClip.poster_url || undefined}
                      onEnded={advanceIntro} onError={advanceIntro}
                      className="absolute inset-0 w-full h-full object-cover object-top" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key={heroItem.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                  className="absolute inset-0">
                  <div className="absolute inset-0 nm-ken">
                    {heroItem.video_url ? (
                      <video src={heroItem.video_url} autoPlay muted loop playsInline
                        poster={heroItem.cover_image_url} className="absolute inset-0 w-full h-full object-cover object-top" />
                    ) : (
                      <img src={heroItem.cover_image_url} alt={heroItem.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RGB-split glitch flash (chromatic aberration duplicate of the cover) */}
            {!playingIntro && heroItem && heroItem.cover_image_url && (
              <img src={heroItem.cover_image_url} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-top nm-glitch"
                style={{ filter: 'hue-rotate(150deg) saturate(4)' }} />
            )}

            {/* Soft fade — keeps centered text readable and blends into the page below */}
            <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />

            {/* intro progress + skip (over the background, under the title) */}
            {playingIntro && (
              <>
                <div className="absolute bottom-6 left-6 z-[5] font-mono text-[10px] tracking-[0.35em] text-chrome/60">
                  {introIdx + 1} / {introVideos.length}
                </div>
                <button onClick={() => setIntroDone(true)}
                  className="absolute bottom-6 right-6 z-[5] font-mono text-[10px] tracking-[0.3em] border border-white/25 rounded-full px-5 py-2.5 text-chrome/70 hover:border-ice hover:text-ice transition">
                  {lang === 'zh' ? '跳過' : lang === 'ja' ? 'スキップ' : 'SKIP'} ▸
                </button>
              </>
            )}
          </div>
        )}

        {/* Breathing glow orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 w-[38rem] h-[38rem] rounded-full z-0 nm-orb-a"
          style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.16), transparent 65%)' }} />
        <div className="pointer-events-none absolute bottom-4 right-1/4 w-[30rem] h-[30rem] rounded-full z-0 nm-orb-b"
          style={{ background: 'radial-gradient(circle, rgba(249,168,212,0.12), transparent 65%)' }} />

        {/* Centered content */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
          style={{ textShadow: '0 2px 34px rgba(4,5,13,0.9)' }}
          className="relative z-10 text-center px-8 lg:px-20 pt-32 pb-16 max-w-3xl mx-auto">
          <div className="text-ice font-mono text-xs tracking-[0.4em] mb-6">{t.heroEyebrow}</div>
          <h1 className="font-display text-5xl lg:text-7xl tracking-widest mb-8">NEURA MUSE</h1>
          <p className="text-chrome/70 font-light leading-relaxed max-w-md mx-auto mb-10">{t.heroDesc}</p>
          {heroItem && !playingIntro && (
            <div className="mb-10">
              <div className="font-mono text-[10px] tracking-[0.3em] text-ice mb-1">FASHION MOTION REEL</div>
              <motion.div key={heroItem.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="font-display tracking-[0.2em] text-lg">{heroItem.name}</motion.div>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/daily" className="font-display text-xs tracking-[0.25em] px-7 py-4 rounded-lg bg-gradient-to-r from-ice to-nova text-ink">{t.ctaDaily}</a>
            <a href="/divination" className="font-display text-xs tracking-[0.25em] px-7 py-4 rounded-lg border border-ice/50 text-ice hover:bg-ice/10 transition">{t.ctaOracle}</a>
            <a href="#videos" className="font-display text-xs tracking-[0.25em] px-7 py-4 rounded-lg border border-nova/50 text-nova hover:bg-nova/10 transition">{t.ctaVideo}</a>
          </div>
        </motion.div>
      </section>

      {/* ===== MOTION VIDEO REELS — frameless, titleless, blends into the background ===== */}
      {videos.length > 0 && (
        <section id="videos" className="w-full px-4 sm:px-6 lg:px-10 py-20">
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
            {videoSlots.map((v, slot) => (
              <motion.div key={slot + '-' + v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 1 }} className="relative aspect-[2/3]">
                <video key={v.id} src={v.video_url} autoPlay muted playsInline
                  loop={!rotateVideos}
                  onEnded={rotateVideos ? () => onSlotEnded(slot) : undefined}
                  poster={v.poster_url || undefined}
                  className="w-full h-full object-cover object-top" />
                {/* vignette that melts the video edges into the ink background */}
                <div className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 90px 26px rgba(4,5,13,0.95)' }} />
              </motion.div>
            ))}
          </div>

          {/* ---- horizontally-scrollable reel picker: 5 per row, swipe right, click to play large ---- */}
          <div className="mt-12">
            <div className="font-mono text-[10px] tracking-[0.3em] text-chrome/40 mb-4">{t.pickReel}</div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory">
              {videos.map((v) => (
                <button key={v.id} onClick={() => setReelPlayer(v)}
                  className="group relative flex-shrink-0 snap-start w-[46%] sm:w-[30%] lg:w-[calc((100%-4rem)/5)] aspect-[2/3] rounded-xl overflow-hidden border border-white/12 hover:border-ice transition">
                  {v.poster_url ? (
                    <img src={v.poster_url} alt={v.title} className="absolute inset-0 w-full h-full object-cover object-top" />
                  ) : (
                    <video src={v.video_url} muted playsInline preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover object-top" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="w-11 h-11 rounded-full bg-ink/70 border border-ice/50 flex items-center justify-center text-ice">▶</span>
                  </div>
                  {v.title && <div className="absolute bottom-2 left-2 right-2 font-mono text-[9px] tracking-[0.2em] text-chrome/80 truncate">{v.title}</div>}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- reel player modal ---- */}
      <AnimatePresence>
        {reelPlayer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReelPlayer(null)}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/90 backdrop-blur-md px-4 py-10">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
              <video src={reelPlayer.video_url} controls autoPlay playsInline
                poster={reelPlayer.poster_url || undefined}
                className="w-full max-h-[78vh] rounded-2xl border border-white/15 bg-ink object-contain" />
              {reelPlayer.title && <div className="mt-3 text-center font-display tracking-[0.2em] text-sm">{reelPlayer.title}</div>}
              <button onClick={() => setReelPlayer(null)}
                className="mt-3 mx-auto block font-mono text-[10px] tracking-[0.3em] text-chrome/50 hover:text-ice transition">✕ CLOSE</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="archive" className="max-w-7xl mx-auto px-8 lg:px-20 py-24">
        <h2 className="font-display tracking-[0.25em] text-2xl mb-10">{t.secArchive}</h2>
        {error && <div className="font-mono text-xs text-red-400 mb-6">SUPABASE ERROR: {error}</div>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} active={active && active.id === c.id} onSelect={() => setActive(c)} lang={lang} />
          ))}
        </div>
      </section>

      {/* ---- character detail modal — opens in place on click, not pinned to the bottom ---- */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/85 backdrop-blur-md px-4 py-10 overflow-y-auto">
            <motion.div key={active.id} initial={{ scale: 0.94, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl grid lg:grid-cols-2 rounded-2xl border border-white/15 overflow-hidden bg-ink/95 backdrop-blur-xl">
              <button onClick={() => setActive(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-ink/70 border border-white/20 text-chrome/70 hover:border-ice hover:text-ice transition">✕</button>
              {active.video_url ? (
                <div className="relative min-h-[320px] bg-ink">
                  <video src={active.video_url} controls autoPlay muted loop playsInline
                    poster={active.cover_image_url} className="w-full h-full object-cover min-h-[320px]" />
                  <div className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.3em] px-2.5 py-1 rounded-full bg-ink/70 border border-ice/40 text-ice">▶ {t.motionReel}</div>
                </div>
              ) : (
                <img src={active.cover_image_url} alt={active.name} className="w-full h-full object-cover min-h-[320px]" />
              )}
              <div className="p-8 lg:p-10">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== UPLOAD LAB — moved to the bottom; supports many images at once ===== */}
      <section id="lab" className="max-w-5xl mx-auto px-8 lg:px-20 py-24">
        <h2 className="font-display tracking-[0.25em] text-2xl mb-3">{t.secLab}</h2>
        <p className="font-light text-chrome/60 mb-10 max-w-xl">{t.heroDesc}</p>
        <UploadLab lang={lang} onAdd={addMuse} />
      </section>

      {/* ===== BACKGROUND SOUNDTRACK — floating play / pause toggle ===== */}
      {soundtrack && (
        <>
          <audio ref={audioRef} src={soundtrack.audio_url} loop preload="auto"
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          <button onClick={toggleMusic}
            aria-label={playing ? t.musicPause : t.musicPlay}
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 rounded-full border border-ice/40 bg-ink/70 backdrop-blur-xl pl-3 pr-4 py-3 hover:border-ice hover:bg-ink/90 transition group">
            <span className={'flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-ice to-nova text-ink text-[11px] ' + (playing ? 'nm-music-spin' : '')}>
              {playing ? '❚❚' : '▶'}
            </span>
            <span className="font-mono text-[9px] tracking-[0.3em] text-chrome/70 group-hover:text-ice max-w-[120px] truncate">
              {playing ? t.musicPause : (soundtrack.title || t.musicPlay)}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
