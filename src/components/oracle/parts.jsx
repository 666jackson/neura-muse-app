import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import HoloCard from '../HoloCard.jsx';
import { NEXT_LANG_LABEL, nextLang } from '../../i18n.js';
import { fetchPublicCharacters } from '../../lib/supabase.js';
import {
  RARITIES, RARITY_BY_KEY, BY_KEY,
  dailyMuse, drawOne, ZODIAC, QUIZ, scoreQuiz, museFromCharacter, storyFor,
  PREMIUM_ITEMS, PREMIUM_CODE, PREMIUM_KEY
} from '../../lib/oracle.js';

// Load the public characters from Supabase and map them to the card "muse" shape,
// so the gacha / daily art links to the images you put in your database.
// Falls back to the built-in archetypes when the DB is empty or unreachable.
export function useMusePool() {
  const [pool, setPool] = React.useState([]);
  React.useEffect(() => {
    let alive = true;
    fetchPublicCharacters()
      .then((rows) => { if (alive) setPool((rows || []).filter((c) => c.cover_image_url).map(museFromCharacter)); })
      .catch(() => { if (alive) setPool([]); });
    return () => { alive = false; };
  }, []);
  return pool;
}

// Renders the real DB image when present, else the gradient placeholder.
function CardArt({ muse, video = false }) {
  if (muse && muse.image) {
    return (
      <>
        <img src={muse.image} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        {video && muse.video && (
          <video src={muse.video} autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover object-top" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-ink/20 pointer-events-none" />
      </>
    );
  }
  return <div className="absolute inset-0" style={posterStyle((muse && muse.color) || '#7dd3fc')} />;
}

function pickRandom(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }

// Click-through info modal for a pulled / selected muse.
export function MuseModal({ open, muse, rarity, lang, t, onClose }) {
  return (
    <AnimatePresence>
      {open && muse && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-ink/85 backdrop-blur-md px-5 py-10 overflow-y-auto">
          <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
            <MusePlate archetype={muse} rarity={rarity} lang={lang} t={t} typed />
            <button onClick={onClose}
              className="mt-5 mx-auto block font-mono text-[10px] tracking-[0.3em] text-chrome/50 hover:text-ice transition">✕ {t.tapDismiss}</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- page-local copy (UI chrome) ------------------------------------------
export const UI = {
  en: {
    back: 'HOME', brand: 'NEURA ORACLE', tagline: 'DIVINATION · GACHA · VAULT',
    intro: 'Consult the archive. Draw your frame. Unlock the vault.',
    dailyEyebrow: "TODAY'S MUSE", dailyNote: 'Resets at local midnight — same reading for everyone, today only.',
    secOracle: 'ORACLE — FIND YOUR MUSE', tabZodiac: 'BY STAR SIGN', tabQuiz: 'PSYCHE TEST',
    pickSign: 'Select your constellation', appraising: 'APPRAISING SIGNATURE',
    yourMuse: 'YOUR MUSE ARCHETYPE', again: 'READ AGAIN', next: 'NEXT ▸', storyTitle: 'ORIGIN STORY', viewInfo: 'DETAILS',
    secGacha: 'PROTOTYPE GACHA', pull1: 'PULL ×1', pull10: 'PULL ×10', pulling: 'SUMMONING…',
    history: 'RECENT PULLS', urHit: 'ONE OF ONE', tapDismiss: 'tap to continue',
    secRates: 'DROP RATES', rateNote: 'Published pull rates · UR is a guaranteed one-of-one frame.',
    secVault: 'PREMIUM VAULT', vaultNote: 'Unreleased films, blueprints & galleries. Enter your access key to unlock.',
    locked: 'LOCKED', unlocked: 'UNLOCKED', enterCode: 'ACCESS KEY', unlock: 'UNLOCK', wrong: 'INVALID KEY',
    hint: 'demo key: ' + PREMIUM_CODE, relock: 'LOCK VAULT', element: 'ELEMENT', weapon: 'WEAPON', rarity: 'RARITY'
  },
  zh: {
    back: '首頁', brand: '神諭殿', tagline: '占卜 · 抽卡 · 密庫',
    intro: '叩問檔案，抽出你的畫格，解鎖密庫。',
    dailyEyebrow: '今日繆斯', dailyNote: '每日本地午夜重置——今日之內，眾人共享同一則神諭。',
    secOracle: '神諭 — 尋找你的繆斯', tabZodiac: '依星座', tabQuiz: '心理測驗',
    pickSign: '選擇你的星座', appraising: '正在鑑定訊號',
    yourMuse: '你的繆斯原型', again: '重新占卜', next: '下一題 ▸', storyTitle: '起源故事', viewInfo: '查看資訊',
    secGacha: '原型抽卡', pull1: '單抽 ×1', pull10: '十連 ×10', pulling: '召喚中…',
    history: '近期抽取', urHit: '獨一無二', tapDismiss: '點擊繼續',
    secRates: '稀有度機率', rateNote: '公開抽取機率 · UR 為保證的唯一機體。',
    secVault: '付費密庫', vaultNote: '未公開影片、藍圖與畫廊。輸入通行金鑰以解鎖。',
    locked: '未解鎖', unlocked: '已解鎖', enterCode: '通行金鑰', unlock: '解鎖', wrong: '金鑰無效',
    hint: '示範金鑰：' + PREMIUM_CODE, relock: '重新上鎖', element: '元素', weapon: '武器', rarity: '稀有度'
  },
  ja: {
    back: 'ホーム', brand: 'ニューラ神託', tagline: '占い · ガチャ · 秘蔵庫',
    intro: 'アーカイブに問い、フレームを引き、秘蔵庫を解放せよ。',
    dailyEyebrow: '今日のミューズ', dailyNote: 'ローカル深夜にリセット——今日だけ、皆同じ神託。',
    secOracle: '神託 — あなたのミューズ', tabZodiac: '星座で', tabQuiz: '心理テスト',
    pickSign: '星座を選択', appraising: 'シグネチャを鑑定中',
    yourMuse: 'あなたのミューズ原型', again: 'もう一度', next: '次へ ▸', storyTitle: 'オリジンストーリー', viewInfo: '詳細',
    secGacha: 'プロトタイプ・ガチャ', pull1: '単発 ×1', pull10: '10連 ×10', pulling: '召喚中…',
    history: '最近の結果', urHit: 'ワン・オブ・ワン', tapDismiss: 'タップで続行',
    secRates: '排出率', rateNote: '公開排出率 · UR は保証されたワン・オブ・ワン。',
    secVault: 'プレミアム蔵', vaultNote: '未公開の映像・設計図・ギャラリー。アクセスキーで解錠。',
    locked: 'ロック', unlocked: '解錠済', enterCode: 'アクセスキー', unlock: '解錠', wrong: 'キーが無効',
    hint: 'デモキー: ' + PREMIUM_CODE, relock: '再ロック', element: '属性', weapon: '武器', rarity: 'レア度'
  }
};

// The five stand-alone areas, in nav order. Each is its own route now.
export const AREAS = [
  { path: '/daily',      nav: { en: 'DAILY',  zh: '今日繆斯', ja: '今日' },   titleKey: 'dailyEyebrow', noteKey: 'dailyNote' },
  { path: '/divination', nav: { en: 'ORACLE', zh: '神諭占卜', ja: '神託' },   titleKey: 'secOracle',    noteKey: null },
  { path: '/gacha',      nav: { en: 'GACHA',  zh: '抽卡',    ja: 'ガチャ' },  titleKey: 'secGacha',     noteKey: null },
  { path: '/rates',      nav: { en: 'RATES',  zh: '機率',    ja: '排出率' },  titleKey: 'secRates',     noteKey: 'rateNote' },
  { path: '/vault',      nav: { en: 'VAULT',  zh: '密庫',    ja: '蔵' },      titleKey: 'secVault',     noteKey: 'vaultNote' }
];

// A little poster gradient stands in for real art (real media wires in later).
export function posterStyle(color) {
  return {
    background: `radial-gradient(120% 90% at 30% 20%, ${color}55, transparent 60%),
                 radial-gradient(120% 90% at 80% 90%, ${color}33, transparent 55%),
                 linear-gradient(160deg, #0a0c1a, #04050d)`
  };
}

// Typewriter reveal for cinematic readings.
export function useTypewriter(text, speed = 22, run = true) {
  const [out, setOut] = React.useState('');
  React.useEffect(() => {
    if (!run) { setOut(text); return; }
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i += 1; setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, run]);
  return out;
}

// ---- shared muse plate (used by daily / oracle / gacha reveal) -------------
export function MusePlate({ archetype, rarity, lang, t, typed = false }) {
  const reading = archetype.reading[lang] || archetype.reading.en;
  const shown = useTypewriter(reading, 20, typed);
  const rar = rarity || RARITY_BY_KEY.SR;
  return (
    <HoloCard color={archetype.color} className="w-full overflow-hidden border border-white/12"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="grid sm:grid-cols-[minmax(0,220px)_1fr]">
        <div className="relative min-h-[240px] overflow-hidden">
          <CardArt muse={archetype} />
          <div className="absolute inset-0 nm-scanlines opacity-30 pointer-events-none" />
          <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.3em] px-2 py-1 rounded-full border"
            style={{ color: rar.color, borderColor: rar.color + '66', background: '#04050dcc' }}>{rar.key}</div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="font-mono text-[9px] tracking-[0.3em]" style={{ color: archetype.color }}>{archetype.codename}</div>
            <div className="font-display text-lg tracking-[0.12em]">{archetype.name[lang] || archetype.name.en}</div>
          </div>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-3 gap-x-4 mb-4">
            {[[t.element, archetype.element[lang] || archetype.element.en], [t.weapon, archetype.weapon], [t.rarity, rar.key]].map(([k, v]) => (
              <div key={k} className="border-b border-white/10 pb-2">
                <dt className="font-mono text-[8px] tracking-[0.25em] text-chrome/40 mb-1">{k}</dt>
                <dd className="font-mono text-[11px]" style={{ color: archetype.color }}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="font-light leading-relaxed text-chrome/80 text-sm min-h-[72px]">{shown}</p>
        </div>
      </div>
    </HoloCard>
  );
}

// ---- DAILY block -----------------------------------------------------------
export function DailyBlock({ lang, t }) {
  const pool = useMusePool();
  const daily = React.useMemo(() => dailyMuse(new Date(), pool), [pool]);
  return (
    <div className="max-w-3xl">
      <MusePlate archetype={daily.archetype} rarity={daily.rarity} lang={lang} t={t} />
    </div>
  );
}

// ---- ORACLE block (zodiac + quiz) -----------------------------------------
export function OracleBlock({ lang, t }) {
  const pool = useMusePool();
  const [tab, setTab] = React.useState('zodiac');
  const [phase, setPhase] = React.useState('idle'); // idle | scanning | result
  const [result, setResult] = React.useState(null);
  const [portrait, setPortrait] = React.useState(null); // random DB muse for the visual
  const [qi, setQi] = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  const quiz = QUIZ[lang] || QUIZ.en;

  const reveal = (archetype) => {
    setPhase('scanning'); setResult(archetype); setPortrait(pickRandom(pool));
    setTimeout(() => setPhase('result'), 1900);
  };
  const restart = () => { setPhase('idle'); setResult(null); setPortrait(null); setQi(0); setAnswers([]); };

  const pickSign = (z) => reveal(BY_KEY[z.archetype]);
  const pickAnswer = (k) => {
    const next = [...answers, k];
    if (qi + 1 < quiz.length) { setAnswers(next); setQi(qi + 1); }
    else { setAnswers(next); reveal(scoreQuiz(next)); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex gap-2 mb-8">
        {[['zodiac', t.tabZodiac], ['quiz', t.tabQuiz]].map(([k, label]) => (
          <button key={k} onClick={() => { setTab(k); restart(); }}
            className={'font-mono text-[10px] tracking-[0.25em] px-4 py-2.5 rounded-full border transition ' +
              (tab === k ? 'border-ice text-ice bg-ice/10' : 'border-white/15 text-chrome/50 hover:text-chrome')}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'scanning' && (
          <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative h-[240px] rounded-2xl border border-ice/30 overflow-hidden flex items-center justify-center"
            style={posterStyle(result?.color || '#7dd3fc')}>
            <div className="absolute inset-0 nm-grid opacity-60" />
            <div className="nm-radar absolute w-[420px] h-[420px] rounded-full" style={{ borderColor: (result?.color || '#7dd3fc') + '55' }} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="nm-scanline" /></div>
            <motion.div animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
              className="relative font-mono text-[11px] tracking-[0.4em] text-ice">{t.appraising}…</motion.div>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div key="res" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="font-mono text-[10px] tracking-[0.35em] text-ice mb-3">{t.yourMuse}</div>
            <MusePlate archetype={{ ...result, image: (portrait && portrait.image) || result.image, video: portrait && portrait.video }}
              lang={lang} t={t} typed />
            {/* story / lore */}
            <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] p-6 lg:p-8">
              <div className="font-mono text-[9px] tracking-[0.35em] mb-3" style={{ color: result.color }}>◆ {t.storyTitle}</div>
              <p className="font-light leading-loose text-chrome/80 whitespace-pre-line">{storyFor(result.key, lang)}</p>
            </div>
            <button onClick={restart}
              className="mt-6 font-display text-[11px] tracking-[0.25em] px-6 py-3 rounded-lg border border-ice/50 text-ice hover:bg-ice/10 transition">
              {t.again} ↺
            </button>
          </motion.div>
        )}

        {phase === 'idle' && tab === 'zodiac' && (
          <motion.div key="zod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="font-mono text-[10px] tracking-[0.3em] text-chrome/50 mb-5">{t.pickSign}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {ZODIAC.map((z) => {
                const a = BY_KEY[z.archetype];
                return (
                  <button key={z.key} onClick={() => pickSign(z)}
                    className="group aspect-square rounded-xl border border-white/12 hover:border-ice flex flex-col items-center justify-center gap-1 transition hover:bg-white/[0.04]">
                    <span className="text-2xl transition group-hover:scale-110" style={{ color: a.color }}>{z.sign}</span>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-chrome/60">{z.name[lang] || z.name.en}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === 'idle' && tab === 'quiz' && (
          <motion.div key={'quiz-' + qi} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-5">
              {quiz.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/10">
                  <div className="h-full bg-gradient-to-r from-ice to-nova transition-all" style={{ width: i <= qi ? '100%' : '0%' }} />
                </div>
              ))}
            </div>
            <div className="font-display text-lg tracking-[0.08em] mb-6">{quiz[qi].q}</div>
            <div className="flex flex-col gap-3">
              {quiz[qi].a.map((opt, i) => (
                <button key={i} onClick={() => pickAnswer(opt.k)}
                  className="text-left rounded-xl border border-white/12 hover:border-ice px-5 py-4 font-light text-chrome/80 hover:bg-white/[0.04] transition">
                  {opt.t}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- GACHA block -----------------------------------------------------------
export function GachaBlock({ lang, t }) {
  const pool = useMusePool();
  const [reveal, setReveal] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [urHit, setUrHit] = React.useState(null);
  const [info, setInfo] = React.useState(null); // { muse, rarity } — click-through details

  const doPull = (n) => {
    if (busy) return;
    setBusy(true); setReveal([]);
    setTimeout(() => {
      const results = Array.from({ length: n }, () => drawOne(pool));
      setReveal(results);
      setHistory((h) => [...results, ...h].slice(0, 24));
      const ur = results.find((r) => r.rarity.key === 'UR');
      if (ur) setUrHit(ur);
      setBusy(false);
    }, 850);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => doPull(1)} disabled={busy}
          className="font-display text-xs tracking-[0.2em] px-7 py-4 rounded-lg bg-gradient-to-r from-ice to-nova text-ink disabled:opacity-50">
          {busy ? t.pulling : t.pull1}
        </button>
        <button onClick={() => doPull(10)} disabled={busy}
          className="font-display text-xs tracking-[0.2em] px-7 py-4 rounded-lg border border-nova/50 text-nova hover:bg-nova/10 transition disabled:opacity-50">
          {t.pull10}
        </button>
      </div>

      {/* charging / summon animation while the pull resolves */}
      <AnimatePresence>
        {busy && (
          <motion.div key="charge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative h-[300px] rounded-2xl border border-ice/25 overflow-hidden flex items-center justify-center mb-4"
            style={posterStyle('#a78bfa')}>
            <div className="absolute inset-0 nm-grid opacity-60" />
            <div className="nm-radar absolute w-[380px] h-[380px] rounded-full" style={{ borderColor: '#7dd3fc55' }} />
            <div className="nm-radar absolute w-[380px] h-[380px] rounded-full" style={{ borderColor: '#f9a8d455', animationDelay: '0.6s' }} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="nm-scanline" /></div>
            <motion.div animate={{ opacity: [1, 0.3, 1], scale: [1, 1.06, 1] }} transition={{ duration: 0.85, repeat: Infinity }}
              className="relative font-mono text-[12px] tracking-[0.45em] text-ice">{t.pulling}</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* reveal — big, clickable cards */}
      {!busy && reveal.length > 0 && (
        <div className={reveal.length === 1 ? 'flex justify-center' : 'grid grid-cols-2 sm:grid-cols-3 gap-5'}>
          <AnimatePresence>
            {reveal.map((r, i) => {
              const gold = r.rarity.key === 'SSR' || r.rarity.key === 'UR';
              return (
                <motion.button key={r.id} initial={{ opacity: 0, rotateY: 100, scale: 0.75 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  transition={{ delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  onClick={() => setInfo({ muse: r.archetype, rarity: r.rarity })}
                  className={'group relative ' + (reveal.length === 1 ? 'w-[min(360px,82vw)]' : 'w-full')}>
                  <div className={'relative aspect-[0.72] rounded-2xl overflow-hidden border-2 ' + (gold ? 'nm-gold-frame' : '')}
                    style={{ borderColor: r.rarity.color + (gold ? 'ff' : '55'), boxShadow: `0 0 ${gold ? 46 : 18}px ${r.rarity.color}${gold ? '99' : '44'}` }}>
                    <CardArt muse={r.archetype} />
                    <div className="absolute inset-0 nm-scanlines opacity-30 pointer-events-none" />
                    {gold && <div className="absolute inset-0 nm-holo-sweep pointer-events-none" />}
                    <div className="absolute top-2.5 left-2.5 font-mono text-[10px] tracking-[0.2em] px-2 py-1 rounded-full"
                      style={{ color: r.rarity.color, background: '#04050dcc', border: '1px solid ' + r.rarity.color + '66' }}>{r.rarity.key}</div>
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <div className="font-display text-sm tracking-[0.1em]">{r.archetype.name[lang] || r.archetype.name.en}</div>
                      <div className="font-mono text-[9px] tracking-[0.2em]" style={{ color: r.archetype.color }}>{r.archetype.codename}</div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 py-1.5 text-center font-mono text-[8px] tracking-[0.3em] bg-ink/75 text-ice opacity-0 group-hover:opacity-100 transition">▸ {t.viewInfo}</div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <div className="font-mono text-[9px] tracking-[0.3em] text-chrome/40 mb-3">{t.history}</div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((r, i) => (
              <span key={i} className="font-mono text-[9px] px-2 py-1 rounded" style={{ color: r.rarity.color, background: r.rarity.color + '18' }}>
                {r.rarity.key}
              </span>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {urHit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setUrHit(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/90 backdrop-blur-md cursor-pointer px-6">
            <div className="absolute inset-0 nm-ur-rays pointer-events-none" />
            <motion.div initial={{ scale: 0.6, opacity: 0, rotateY: 120 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="relative text-center">
              <div className="font-mono text-xs tracking-[0.5em] text-nova mb-4 nm-ur-pulse">UR · {t.urHit}</div>
              <div className="relative w-[240px] aspect-[0.72] mx-auto rounded-2xl overflow-hidden border-2 border-nova nm-gold-frame"
                style={{ boxShadow: '0 0 80px #f9a8d4aa' }}>
                <CardArt muse={urHit.archetype} video />
                <div className="absolute inset-0 nm-holo-sweep pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="font-display text-lg tracking-[0.12em]">{urHit.archetype.name[lang] || urHit.archetype.name.en}</div>
                  <div className="font-mono text-[9px] tracking-[0.3em] text-nova">{urHit.archetype.codename}</div>
                </div>
              </div>
              <div className="mt-6 font-mono text-[9px] tracking-[0.3em] text-chrome/40">{t.tapDismiss}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* click-through details for any pulled card */}
      <MuseModal open={!!info} muse={info && info.muse} rarity={info && info.rarity} lang={lang} t={t} onClose={() => setInfo(null)} />
    </div>
  );
}

// ---- RATE WALL block -------------------------------------------------------
export function RateWall({ t }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {RARITIES.map((r) => (
        <div key={r.key} className="rounded-2xl border border-white/12 p-6 relative overflow-hidden"
          style={{ boxShadow: `inset 0 0 40px ${r.color}14` }}>
          <div className="font-display text-3xl tracking-[0.1em] mb-1" style={{ color: r.color }}>{r.rate}%</div>
          <div className="font-mono text-[9px] tracking-[0.25em] text-chrome/50 mb-4">{r.label}</div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: r.rate + '%', background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- VAULT block -----------------------------------------------------------
export function VaultBlock({ lang, t }) {
  const pool = useMusePool();
  const [unlocked, setUnlocked] = React.useState(() => localStorage.getItem(PREMIUM_KEY) === '1');
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState(false);

  // Randomly assign one of your uploaded DB images to each premium slot (stable per load).
  const picks = React.useMemo(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return PREMIUM_ITEMS.map((item, i) => ({ item, muse: shuffled.length ? shuffled[i % shuffled.length] : null }));
  }, [pool]);

  const tryUnlock = () => {
    if (code.trim().toUpperCase() === PREMIUM_CODE) {
      localStorage.setItem(PREMIUM_KEY, '1'); setUnlocked(true); setErr(false);
    } else { setErr(true); }
  };
  const relock = () => { localStorage.removeItem(PREMIUM_KEY); setUnlocked(false); setCode(''); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className={'font-mono text-[10px] tracking-[0.3em] px-3 py-1.5 rounded-full border ' +
          (unlocked ? 'border-ice/50 text-ice' : 'border-nova/50 text-nova')}>
          {unlocked ? '◆ ' + t.unlocked : '◇ ' + t.locked}
        </span>
        {!unlocked ? (
          <div className="flex flex-wrap items-center gap-2">
            <input value={code} onChange={(e) => { setCode(e.target.value); setErr(false); }}
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
              placeholder={t.enterCode}
              className="bg-white/[0.04] border border-white/15 focus:border-ice outline-none rounded-lg px-4 py-2.5 font-mono text-xs tracking-[0.2em] w-44" />
            <button onClick={tryUnlock}
              className="font-display text-[11px] tracking-[0.2em] px-5 py-2.5 rounded-lg bg-gradient-to-r from-ice to-nova text-ink">{t.unlock}</button>
            <span className="font-mono text-[9px] tracking-[0.2em] text-chrome/35">{t.hint}</span>
          </div>
        ) : (
          <button onClick={relock} className="font-mono text-[9px] tracking-[0.25em] text-chrome/40 hover:text-nova transition">↺ {t.relock}</button>
        )}
      </div>
      {err && <div className="font-mono text-[10px] tracking-[0.2em] text-red-400 mb-4">✕ {t.wrong}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {picks.map(({ item, muse }) => {
          const art = muse ? { image: muse.image, video: unlocked ? muse.video : null, color: item.color } : { color: item.color };
          return (
            <HoloCard key={item.key} color={item.color} glare={unlocked}
              className="overflow-hidden border border-white/12" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="relative aspect-[0.8] overflow-hidden">
                <CardArt muse={art} video={unlocked && item.kind === 'FILM'} />
                <div className="absolute inset-0 nm-scanlines opacity-30 pointer-events-none" />
                <div className="absolute top-3 left-3 font-mono text-[8px] tracking-[0.25em] px-2 py-1 rounded-full border z-10"
                  style={{ color: item.color, borderColor: item.color + '66', background: '#04050dcc' }}>{item.kind}</div>
                {!unlocked && (
                  <div className="absolute inset-0 backdrop-blur-xl bg-ink/60 flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <span className="font-mono text-[9px] tracking-[0.3em] text-chrome/60">{t.locked}</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <div className="font-display text-[12px] tracking-[0.08em]">{item.title[lang] || item.title.en}</div>
                  {unlocked && <div className="font-light text-[10px] text-chrome/60 mt-1 leading-snug">{item.blurb[lang] || item.blurb.en}</div>}
                </div>
              </div>
            </HoloCard>
          );
        })}
      </div>
    </div>
  );
}

// ---- shared page shell (header sub-nav + hero + one section) ---------------
// `children` is a render function: ({ lang, t }) => JSX
export function PageShell({ area, children }) {
  const [lang, setLang] = React.useState(localStorage.getItem('nm_lang') || 'en');
  const t = UI[lang] || UI.en;
  const location = useLocation();
  const meta = AREAS.find((a) => a.path === area) || AREAS[0];
  const title = t[meta.titleKey];
  const note = meta.noteKey ? t[meta.noteKey] : null;

  const toggleLang = () => {
    const next = nextLang(lang);
    localStorage.setItem('nm_lang', next); setLang(next);
  };

  return (
    <div className="min-h-screen bg-ink text-chrome overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 bg-ink/60 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-6 lg:px-8 py-3.5">
          <Link to="/" className="font-mono text-[11px] tracking-[0.3em] text-chrome/60 hover:text-ice transition">← {t.back}</Link>
          <div className="font-display tracking-[0.3em] text-sm">{t.brand}</div>
          <button onClick={toggleLang} className="text-xs font-mono tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-ice hover:text-ice transition">
            {NEXT_LANG_LABEL[lang]}
          </button>
        </div>
        {/* sub-nav between the five areas */}
        <nav className="flex items-center gap-1 overflow-x-auto px-4 lg:px-8 pb-2 no-scrollbar">
          {AREAS.map((a) => {
            const on = location.pathname === a.path;
            return (
              <Link key={a.path} to={a.path}
                className={'whitespace-nowrap font-mono text-[10px] tracking-[0.2em] px-3.5 py-1.5 rounded-full border transition ' +
                  (on ? 'border-ice text-ice bg-ice/10' : 'border-transparent text-chrome/45 hover:text-chrome')}>
                {a.nav[lang] || a.nav.en}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* compact hero */}
      <section className="relative pt-32 pb-8 overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/3 w-[30rem] h-[30rem] rounded-full z-0 nm-orb-a"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.14), transparent 65%)' }} />
        <div className="absolute inset-0 nm-grid pointer-events-none opacity-60" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-nova font-mono text-[10px] tracking-[0.4em] mb-3">{t.tagline}</div>
          <h1 className="font-display text-3xl lg:text-5xl tracking-[0.14em] mb-4">{title}</h1>
          {note && <p className="text-chrome/60 font-light max-w-xl text-sm">{note}</p>}
        </motion.div>
      </section>

      <main className="max-w-6xl mx-auto px-6 lg:px-12 pb-24">
        {children({ lang, t })}
      </main>

      <footer className="text-center py-12 font-mono text-[9px] tracking-[0.35em] text-chrome/30">NEURA MUSE · ORACLE · SECTOR 07</footer>
    </div>
  );
}
