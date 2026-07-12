import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HoloCard from '../components/HoloCard.jsx';
import { NEXT_LANG_LABEL, nextLang } from '../i18n.js';
import {
  ARCHETYPES, RARITIES, RARITY_BY_KEY, BY_KEY,
  dailyMuse, drawOne, ZODIAC, QUIZ, scoreQuiz,
  PREMIUM_ITEMS, PREMIUM_CODE, PREMIUM_KEY
} from '../lib/oracle.js';

// ---- page-local copy (UI chrome) ------------------------------------------
const UI = {
  en: {
    back: 'BACK', oracle: 'NEURA ORACLE', tagline: 'DIVINATION · GACHA · VAULT',
    intro: 'Consult the archive. Draw your frame. Unlock the vault.',
    dailyEyebrow: "TODAY'S MUSE", dailyNote: 'Resets at local midnight — same reading for everyone, today only.',
    secOracle: 'ORACLE — FIND YOUR MUSE', tabZodiac: 'BY STAR SIGN', tabQuiz: 'PSYCHE TEST',
    pickSign: 'Select your constellation', appraising: 'APPRAISING SIGNATURE',
    yourMuse: 'YOUR MUSE ARCHETYPE', again: 'READ AGAIN', next: 'NEXT ▸',
    secGacha: 'PROTOTYPE GACHA', pull1: 'PULL ×1', pull10: 'PULL ×10', pulling: 'SUMMONING…',
    history: 'RECENT PULLS', urHit: 'ONE OF ONE', tapDismiss: 'tap to continue',
    secRates: 'DROP RATES', rateNote: 'Published pull rates · UR is a guaranteed one-of-one frame.',
    secVault: 'PREMIUM VAULT', vaultNote: 'Unreleased films, blueprints & galleries. Enter your access key to unlock.',
    locked: 'LOCKED', unlocked: 'UNLOCKED', enterCode: 'ACCESS KEY', unlock: 'UNLOCK', wrong: 'INVALID KEY',
    hint: 'demo key: ' + PREMIUM_CODE, relock: 'LOCK VAULT', element: 'ELEMENT', weapon: 'WEAPON', rarity: 'RARITY'
  },
  zh: {
    back: '返回', oracle: '神諭殿', tagline: '占卜 · 抽卡 · 密庫',
    intro: '叩問檔案，抽出你的畫格，解鎖密庫。',
    dailyEyebrow: '今日繆斯', dailyNote: '每日本地午夜重置——今日之內，眾人共享同一則神諭。',
    secOracle: '神諭 — 尋找你的繆斯', tabZodiac: '依星座', tabQuiz: '心理測驗',
    pickSign: '選擇你的星座', appraising: '正在鑑定訊號',
    yourMuse: '你的繆斯原型', again: '重新占卜', next: '下一題 ▸',
    secGacha: '原型抽卡', pull1: '單抽 ×1', pull10: '十連 ×10', pulling: '召喚中…',
    history: '近期抽取', urHit: '獨一無二', tapDismiss: '點擊繼續',
    secRates: '稀有度機率', rateNote: '公開抽取機率 · UR 為保證的唯一機體。',
    secVault: '付費密庫', vaultNote: '未公開影片、藍圖與畫廊。輸入通行金鑰以解鎖。',
    locked: '未解鎖', unlocked: '已解鎖', enterCode: '通行金鑰', unlock: '解鎖', wrong: '金鑰無效',
    hint: '示範金鑰：' + PREMIUM_CODE, relock: '重新上鎖', element: '元素', weapon: '武器', rarity: '稀有度'
  },
  ja: {
    back: '戻る', oracle: 'ニューラ神託', tagline: '占い · ガチャ · 秘蔵庫',
    intro: 'アーカイブに問い、フレームを引き、秘蔵庫を解放せよ。',
    dailyEyebrow: '今日のミューズ', dailyNote: 'ローカル深夜にリセット——今日だけ、皆同じ神託。',
    secOracle: '神託 — あなたのミューズ', tabZodiac: '星座で', tabQuiz: '心理テスト',
    pickSign: '星座を選択', appraising: 'シグネチャを鑑定中',
    yourMuse: 'あなたのミューズ原型', again: 'もう一度', next: '次へ ▸',
    secGacha: 'プロトタイプ・ガチャ', pull1: '単発 ×1', pull10: '10連 ×10', pulling: '召喚中…',
    history: '最近の結果', urHit: 'ワン・オブ・ワン', tapDismiss: 'タップで続行',
    secRates: '排出率', rateNote: '公開排出率 · UR は保証されたワン・オブ・ワン。',
    secVault: 'プレミアム蔵', vaultNote: '未公開の映像・設計図・ギャラリー。アクセスキーで解錠。',
    locked: 'ロック', unlocked: '解錠済', enterCode: 'アクセスキー', unlock: '解錠', wrong: 'キーが無効',
    hint: 'デモキー: ' + PREMIUM_CODE, relock: '再ロック', element: '属性', weapon: '武器', rarity: 'レア度'
  }
};

// A little poster gradient stands in for real art (real media wires in later).
function posterStyle(color) {
  return {
    background: `radial-gradient(120% 90% at 30% 20%, ${color}55, transparent 60%),
                 radial-gradient(120% 90% at 80% 90%, ${color}33, transparent 55%),
                 linear-gradient(160deg, #0a0c1a, #04050d)`
  };
}

// Typewriter reveal for cinematic readings.
function useTypewriter(text, speed = 22, run = true) {
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
function MusePlate({ archetype, rarity, lang, t, typed = false }) {
  const reading = archetype.reading[lang] || archetype.reading.en;
  const shown = useTypewriter(reading, 20, typed);
  const rar = rarity || RARITY_BY_KEY.SR;
  return (
    <HoloCard color={archetype.color} className="w-full overflow-hidden border border-white/12"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="grid sm:grid-cols-[minmax(0,220px)_1fr]">
        {/* poster */}
        <div className="relative min-h-[240px]" style={posterStyle(archetype.color)}>
          <div className="absolute inset-0 nm-grid opacity-40" />
          <div className="absolute inset-0 nm-scanlines opacity-40" />
          <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.3em] px-2 py-1 rounded-full border"
            style={{ color: rar.color, borderColor: rar.color + '66', background: '#04050dcc' }}>{rar.key}</div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="font-mono text-[9px] tracking-[0.3em]" style={{ color: archetype.color }}>{archetype.codename}</div>
            <div className="font-display text-lg tracking-[0.12em]">{archetype.name[lang] || archetype.name.en}</div>
          </div>
        </div>
        {/* readout */}
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

// ---- oracle (zodiac + quiz) -----------------------------------------------
function OracleBlock({ lang, t }) {
  const [tab, setTab] = React.useState('zodiac');
  const [phase, setPhase] = React.useState('idle'); // idle | scanning | result
  const [result, setResult] = React.useState(null);
  const [qi, setQi] = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  const quiz = QUIZ[lang] || QUIZ.en;

  const reveal = (archetype) => {
    setPhase('scanning'); setResult(archetype);
    setTimeout(() => setPhase('result'), 1900);
  };
  const restart = () => { setPhase('idle'); setResult(null); setQi(0); setAnswers([]); };

  const pickSign = (z) => reveal(BY_KEY[z.archetype]);
  const pickAnswer = (k) => {
    const next = [...answers, k];
    if (qi + 1 < quiz.length) { setAnswers(next); setQi(qi + 1); }
    else { setAnswers(next); reveal(scoreQuiz(next)); }
  };

  return (
    <div>
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
        {/* SCANNING — radar appraisal */}
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

        {/* RESULT */}
        {phase === 'result' && result && (
          <motion.div key="res" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="font-mono text-[10px] tracking-[0.35em] text-ice mb-3">{t.yourMuse}</div>
            <MusePlate archetype={result} lang={lang} t={t} typed />
            <button onClick={restart}
              className="mt-6 font-display text-[11px] tracking-[0.25em] px-6 py-3 rounded-lg border border-ice/50 text-ice hover:bg-ice/10 transition">
              {t.again} ↺
            </button>
          </motion.div>
        )}

        {/* IDLE — zodiac grid */}
        {phase === 'idle' && tab === 'zodiac' && (
          <motion.div key="zod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="font-mono text-[10px] tracking-[0.3em] text-chrome/50 mb-5">{t.pickSign}</div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {ZODIAC.map((z) => {
                const a = BY_KEY[z.archetype];
                return (
                  <button key={z.key} onClick={() => pickSign(z)}
                    className="group aspect-square rounded-xl border border-white/12 hover:border-ice flex flex-col items-center justify-center gap-1 transition hover:bg-white/[0.04]"
                    style={{ boxShadow: 'none' }}>
                    <span className="text-2xl transition group-hover:scale-110" style={{ color: a.color }}>{z.sign}</span>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-chrome/60">{z.name[lang] || z.name.en}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* IDLE — quiz */}
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

// ---- gacha -----------------------------------------------------------------
function GachaBlock({ lang, t }) {
  const [reveal, setReveal] = React.useState([]);     // current pull results
  const [busy, setBusy] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [urHit, setUrHit] = React.useState(null);     // fullscreen UR takeover

  const doPull = (n) => {
    if (busy) return;
    setBusy(true); setReveal([]);
    setTimeout(() => {
      const results = Array.from({ length: n }, () => drawOne());
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

      {/* reveal grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[120px]">
        <AnimatePresence>
          {reveal.map((r, i) => {
            const gold = r.rarity.key === 'SSR' || r.rarity.key === 'UR';
            return (
              <motion.div key={r.id} initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}>
                <div className={'relative aspect-[0.72] rounded-xl overflow-hidden border-2 ' + (gold ? 'nm-gold-frame' : '')}
                  style={{ borderColor: r.rarity.color + (gold ? 'ff' : '55'), boxShadow: `0 0 ${gold ? 34 : 14}px ${r.rarity.color}${gold ? '99' : '44'}` }}>
                  <div className="absolute inset-0" style={posterStyle(r.archetype.color)} />
                  <div className="absolute inset-0 nm-scanlines opacity-40" />
                  {gold && <div className="absolute inset-0 nm-holo-sweep pointer-events-none" />}
                  <div className="absolute top-2 left-2 font-mono text-[9px] tracking-[0.2em] px-1.5 py-0.5 rounded-full"
                    style={{ color: r.rarity.color, background: '#04050dcc', border: '1px solid ' + r.rarity.color + '66' }}>{r.rarity.key}</div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="font-display text-[11px] tracking-[0.1em]">{r.archetype.name[lang] || r.archetype.name.en}</div>
                    <div className="font-mono text-[8px] tracking-[0.2em]" style={{ color: r.archetype.color }}>{r.archetype.codename}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* history strip */}
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

      {/* UR fullscreen takeover */}
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
                <div className="absolute inset-0" style={posterStyle(urHit.archetype.color)} />
                <div className="absolute inset-0 nm-holo-sweep" />
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
    </div>
  );
}

// ---- rarity wall -----------------------------------------------------------
function RateWall({ t }) {
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

// ---- premium vault ---------------------------------------------------------
function VaultBlock({ lang, t }) {
  const [unlocked, setUnlocked] = React.useState(() => localStorage.getItem(PREMIUM_KEY) === '1');
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState(false);

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
          <div className="flex items-center gap-2">
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
        {PREMIUM_ITEMS.map((item) => (
          <HoloCard key={item.key} color={item.color} glare={unlocked}
            className="overflow-hidden border border-white/12" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="relative aspect-[0.8]" style={posterStyle(item.color)}>
              <div className="absolute inset-0 nm-scanlines opacity-40" />
              <div className="absolute top-3 left-3 font-mono text-[8px] tracking-[0.25em] px-2 py-1 rounded-full border"
                style={{ color: item.color, borderColor: item.color + '66', background: '#04050dcc' }}>{item.kind}</div>
              {/* locked overlay */}
              {!unlocked && (
                <div className="absolute inset-0 backdrop-blur-lg bg-ink/50 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <span className="font-mono text-[9px] tracking-[0.3em] text-chrome/60">{t.locked}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="font-display text-[12px] tracking-[0.08em]">{item.title[lang] || item.title.en}</div>
                {unlocked && <div className="font-light text-[10px] text-chrome/60 mt-1 leading-snug">{item.blurb[lang] || item.blurb.en}</div>}
              </div>
            </div>
          </HoloCard>
        ))}
      </div>
    </div>
  );
}

// ---- page ------------------------------------------------------------------
export default function Oracle() {
  const [lang, setLang] = React.useState(localStorage.getItem('nm_lang') || 'en');
  const t = UI[lang] || UI.en;
  const daily = React.useMemo(() => dailyMuse(new Date()), []);

  const toggleLang = () => {
    const next = nextLang(lang);
    localStorage.setItem('nm_lang', next); setLang(next);
  };

  const Section = ({ id, title, note, children }) => (
    <section id={id} className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
      <h2 className="font-display tracking-[0.22em] text-2xl mb-2">{title}</h2>
      {note && <p className="font-light text-chrome/50 text-sm mb-9 max-w-xl">{note}</p>}
      {!note && <div className="mb-9" />}
      {children}
    </section>
  );

  return (
    <div className="min-h-screen bg-ink text-chrome overflow-x-hidden">
      {/* header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-8 py-4 bg-ink/60 backdrop-blur-xl border-b border-white/10">
        <Link to="/" className="font-mono text-[11px] tracking-[0.3em] text-chrome/60 hover:text-ice transition">← {t.back}</Link>
        <div className="font-display tracking-[0.3em] text-sm">{t.oracle}</div>
        <button onClick={toggleLang} className="text-xs font-mono tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-ice hover:text-ice transition">
          {NEXT_LANG_LABEL[lang]}
        </button>
      </header>

      {/* hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden pt-24 pb-10">
        <div className="pointer-events-none absolute top-1/4 left-1/3 w-[34rem] h-[34rem] rounded-full z-0 nm-orb-a"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.16), transparent 65%)' }} />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full z-0 nm-orb-b"
          style={{ background: 'radial-gradient(circle, rgba(249,168,212,0.12), transparent 65%)' }} />
        <div className="absolute inset-0 nm-grid pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
          className="relative z-10 text-center px-6">
          <div className="text-nova font-mono text-[11px] tracking-[0.4em] mb-5">{t.tagline}</div>
          <h1 className="font-display text-4xl lg:text-6xl tracking-[0.18em] mb-6">{t.oracle}</h1>
          <p className="text-chrome/70 font-light max-w-md mx-auto">{t.intro}</p>
        </motion.div>
      </section>

      {/* daily muse */}
      <Section id="daily" title={t.dailyEyebrow} note={t.dailyNote}>
        <MusePlate archetype={daily.archetype} rarity={daily.rarity} lang={lang} t={t} />
      </Section>

      {/* oracle */}
      <Section id="oracle" title={t.secOracle}>
        <OracleBlock lang={lang} t={t} />
      </Section>

      {/* gacha */}
      <Section id="gacha" title={t.secGacha}>
        <GachaBlock lang={lang} t={t} />
      </Section>

      {/* rate wall */}
      <Section id="rates" title={t.secRates} note={t.rateNote}>
        <RateWall t={t} />
      </Section>

      {/* vault */}
      <Section id="vault" title={t.secVault} note={t.vaultNote}>
        <VaultBlock lang={lang} t={t} />
      </Section>

      <footer className="text-center py-12 font-mono text-[9px] tracking-[0.35em] text-chrome/30">NEURA MUSE · ORACLE · SECTOR 07</footer>
    </div>
  );
}
