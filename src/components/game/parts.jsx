import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { NEXT_LANG_LABEL, nextLang } from '../../i18n.js';
import { posterStyle } from '../oracle/parts.jsx';
import { KEYWORDS, artOf } from '../../lib/battle.js';
import { ELEMENT_LABEL, ELEMENT_RING } from '../../lib/arts.js';

// ---- page-local copy -------------------------------------------------------
export const GUI = {
  en: {
    back: 'HOME', brand: 'NEURA ARENA', tagline: 'DEPLOY · CLASH · OVERRIDE',
    navBattle: 'BATTLE', navArts: 'ARTS', navRules: 'RULES',
    titleBattle: 'PROTOTYPE ARENA', noteBattle: 'Deploy your frames, spend energy, break the enemy core from 30 to 0.',
    titleArts: 'ARTS CODEX — 招數特輯', noteArts: 'Every signature art below fires for real in the arena. Tap a card to run the effect.',
    you: 'YOU', foe: 'RIVAL', core: 'CORE', energy: 'ENERGY', deck: 'DECK', hand: 'HAND',
    endTurn: 'END TURN', enemyTurn: 'RIVAL THINKING…', yourTurn: 'YOUR TURN', turn: 'TURN',
    newRun: 'NEW RUN', concede: 'CONCEDE', victory: 'CORE OVERRIDE — VICTORY', defeat: 'CORE BREACHED — DEFEAT', draw: 'MUTUAL COLLAPSE',
    playAgain: 'RUN IT AGAIN', backHome: 'LEAVE ARENA',
    art: 'ART', useArt: 'FIRE ART', artSpent: 'ART SPENT', cost: 'COST',
    selectTarget: 'SELECT A TARGET', cancel: 'CANCEL', sick: 'CHARGING', frozen: 'FROZEN',
    noMana: 'NOT ENOUGH ENERGY', boardFull: 'BATTLEFIELD FULL', guarded: 'GUARD BLOCKS THAT LINE',
    element: 'ELEMENT', beats: 'STRONG VS', preview: 'PREVIEW FX', ring: 'ELEMENT RING',
    ringNote: 'Attacking into your prey multiplies damage ×1.5.',
    logTitle: 'COMBAT LOG', empty: 'NO SIGNAL YET',
    rulesTitle: 'HOW IT WORKS',
    tapDeploy: 'Tap a card in hand to deploy it', tapAttack: 'Tap your unit, then a target',
    kw: 'KEYWORDS', effect: 'EFFECT'
  },
  zh: {
    back: '首頁', brand: '神經競技場', tagline: '部署 · 交鋒 · 覆寫',
    navBattle: '對戰', navArts: '招數特輯', navRules: '規則',
    titleBattle: '原型競技場', noteBattle: '部署你的機體、消耗能量，將敵方本體從 30 打到 0。',
    titleArts: '招數特輯 — ARTS CODEX', noteArts: '以下每一招都會真的在競技場中發動。點擊卡片即可預覽特效。',
    you: '我方', foe: '對手', core: '本體', energy: '能量', deck: '牌庫', hand: '手牌',
    endTurn: '結束回合', enemyTurn: '對手思考中…', yourTurn: '你的回合', turn: '回合',
    newRun: '重新開始', concede: '投降', victory: '本體覆寫 — 勝利', defeat: '本體被擊穿 — 敗北', draw: '同歸於盡',
    playAgain: '再來一場', backHome: '離開競技場',
    art: '招數', useArt: '發動招數', artSpent: '招數已用', cost: '費用',
    selectTarget: '選擇攻擊目標', cancel: '取消', sick: '充能中', frozen: '凍結',
    noMana: '能量不足', boardFull: '場地已滿', guarded: '守衛擋住了這條線',
    element: '元素', beats: '克制', preview: '預覽特效', ring: '元素相剋環',
    ringNote: '攻擊你所剋制的元素時，傷害 ×1.5。',
    logTitle: '戰鬥紀錄', empty: '尚無訊號',
    rulesTitle: '玩法說明',
    tapDeploy: '點擊手牌以部署', tapAttack: '先點你的機體，再點目標',
    kw: '關鍵字', effect: '效果'
  },
  ja: {
    back: 'ホーム', brand: 'ニューラ・アリーナ', tagline: '配置 · 交戦 · 上書き',
    navBattle: 'バトル', navArts: '必殺技', navRules: 'ルール',
    titleBattle: 'プロトタイプ・アリーナ', noteBattle: '機体を配置し、エネルギーを使い、敵コアを30から0へ。',
    titleArts: '必殺技コデックス — ARTS CODEX', noteArts: '以下の必殺技はアリーナで実際に発動する。カードをタップでエフェクトを再生。',
    you: '自軍', foe: '相手', core: 'コア', energy: 'エネルギー', deck: 'デッキ', hand: '手札',
    endTurn: 'ターン終了', enemyTurn: '相手が思考中…', yourTurn: 'あなたのターン', turn: 'ターン',
    newRun: 'リスタート', concede: '投了', victory: 'コア上書き — 勝利', defeat: 'コア破壊 — 敗北', draw: '相打ち',
    playAgain: 'もう一戦', backHome: 'アリーナを出る',
    art: '必殺技', useArt: '必殺技発動', artSpent: '使用済', cost: 'コスト',
    selectTarget: '対象を選択', cancel: 'キャンセル', sick: 'チャージ中', frozen: '凍結',
    noMana: 'エネルギー不足', boardFull: 'フィールドが満杯', guarded: '守護に阻まれている',
    element: '属性', beats: '有利', preview: 'エフェクト再生', ring: '属性相性環',
    ringNote: '有利属性へ攻撃するとダメージ ×1.5。',
    logTitle: '戦闘ログ', empty: 'シグナルなし',
    rulesTitle: '遊び方',
    tapDeploy: '手札をタップして配置', tapAttack: '自機を選び、次に対象を選ぶ',
    kw: 'キーワード', effect: '効果'
  }
};

export const GAME_AREAS = [
  { path: '/battle', nav: { en: 'BATTLE', zh: '對戰', ja: 'バトル' }, titleKey: 'titleBattle', noteKey: 'noteBattle' },
  { path: '/arts',   nav: { en: 'ARTS',   zh: '招數特輯', ja: '必殺技' }, titleKey: 'titleArts', noteKey: 'noteArts' }
];

export function useGameLang() {
  const [lang, setLang] = React.useState(() => localStorage.getItem('nm_lang') || 'en');
  const toggle = () => {
    const next = nextLang(lang);
    localStorage.setItem('nm_lang', next);
    setLang(next);
  };
  return { lang, t: GUI[lang] || GUI.en, toggle };
}

// ---- shell -----------------------------------------------------------------
// Full-bleed variant of the oracle PageShell: the battlefield needs the whole
// viewport, so the hero block is optional.
export function ArenaShell({ area, hero = true, children }) {
  const { lang, t, toggle } = useGameLang();
  const location = useLocation();
  const meta = GAME_AREAS.find((a) => a.path === area) || GAME_AREAS[0];

  return (
    <div className="min-h-screen bg-ink text-chrome overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 bg-ink/70 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3">
          <Link to="/" className="font-mono text-[10px] tracking-[0.3em] text-chrome/60 hover:text-ice transition">← {t.back}</Link>
          <div className="font-display tracking-[0.3em] text-xs sm:text-sm">{t.brand}</div>
          <button onClick={toggle} className="text-[10px] font-mono tracking-widest border border-white/20 rounded-full px-3 py-1.5 hover:border-ice hover:text-ice transition">
            {NEXT_LANG_LABEL[lang]}
          </button>
        </div>
        <nav className="flex items-center gap-1 px-4 lg:px-8 pb-2">
          {GAME_AREAS.map((a) => {
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

      {hero && (
        <section className="relative pt-28 pb-6 overflow-hidden">
          <div className="pointer-events-none absolute top-0 left-1/3 w-[30rem] h-[30rem] rounded-full z-0 nm-orb-a"
            style={{ background: 'radial-gradient(circle, rgba(249,168,212,0.13), transparent 65%)' }} />
          <div className="absolute inset-0 nm-grid pointer-events-none opacity-60" />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-nova font-mono text-[10px] tracking-[0.4em] mb-3">{t.tagline}</div>
            <h1 className="font-display text-2xl lg:text-4xl tracking-[0.14em] mb-3">{t[meta.titleKey]}</h1>
            {meta.noteKey && <p className="text-chrome/60 font-light max-w-2xl text-sm">{t[meta.noteKey]}</p>}
          </motion.div>
        </section>
      )}

      <main className={hero ? 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pb-24' : 'pt-24 pb-6 px-3 sm:px-6'}>
        {children({ lang, t })}
      </main>
    </div>
  );
}

// ---- shared bits -----------------------------------------------------------
export function elLabel(el, lang) {
  const e = ELEMENT_LABEL[el];
  return e ? (e[lang] || e.en) : el || '—';
}

export function ElementChip({ el, lang, color }) {
  if (!el) return null;
  return (
    <span className="font-mono text-[8px] tracking-[0.2em] px-1.5 py-0.5 rounded-full border"
      style={{ color, borderColor: color + '55', background: color + '14' }}>
      {elLabel(el, lang)}
    </span>
  );
}

export function KeywordChip({ k, lang }) {
  const kw = KEYWORDS[k];
  if (!kw) return null;
  return (
    <span title={kw.desc[lang] || kw.desc.en}
      className="font-mono text-[8px] tracking-[0.18em] px-1.5 py-0.5 rounded-full border border-white/25 text-chrome/70 bg-white/5">
      {kw[lang] || kw.en}
    </span>
  );
}

// The card face art: DB image when the character has one, else the poster
// gradient the archetypes use everywhere else in the app.
export function Face({ archetype, className = '' }) {
  if (archetype.image) {
    return (
      <>
        <img src={archetype.image} alt="" className={'absolute inset-0 w-full h-full object-cover object-top ' + className} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent pointer-events-none" />
      </>
    );
  }
  return <div className={'absolute inset-0 ' + className} style={posterStyle(archetype.color || '#7dd3fc')} />;
}

// ---- hand card -------------------------------------------------------------
// forwardRef is required: <AnimatePresence mode="popLayout"> measures its
// children through a ref, and silently degrades on a plain function component.
export const HandCard = React.forwardRef(function HandCard(
  { card, lang, t, playable, onPlay, index, total }, ref
) {
  const a = card.archetype;
  const art = artOf(card);
  const gold = card.rarity.key === 'SSR' || card.rarity.key === 'UR';
  // Fan the hand out like a real one: slight arc + rotation from the centre.
  const mid = (total - 1) / 2;
  const off = index - mid;
  return (
    <motion.button
      ref={ref}
      layout
      initial={{ y: 80, opacity: 0, scale: 0.8 }}
      animate={{ y: Math.abs(off) * 5, opacity: 1, scale: 1, rotate: off * 3 }}
      exit={{ y: -140, opacity: 0, scale: 0.6, transition: { duration: 0.35 } }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={playable ? { y: -26, scale: 1.09, rotate: 0, zIndex: 30 } : { y: -8, rotate: 0 }}
      onClick={() => playable && onPlay(card)}
      disabled={!playable}
      title={playable ? '' : t.noMana}
      className={'relative shrink-0 w-[104px] sm:w-[124px] aspect-[0.66] rounded-xl overflow-hidden border text-left transition-shadow ' +
        (playable ? 'cursor-pointer border-white/30' : 'cursor-not-allowed border-white/10 opacity-45 saturate-[0.35]') +
        (gold ? ' nm-gold-frame' : '')}
      style={{ boxShadow: playable ? `0 12px 34px -14px ${a.color}aa` : 'none' }}
    >
      <Face archetype={a} />
      <div className="absolute inset-0 nm-scanlines opacity-25 pointer-events-none" />
      {gold && <div className="absolute inset-0 nm-holo-sweep pointer-events-none" />}

      {/* energy cost */}
      <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold border"
        style={{ background: '#04050dee', borderColor: '#7dd3fc88', color: '#7dd3fc' }}>
        {card.cost}
      </div>
      <div className="absolute top-1.5 right-1.5 font-mono text-[7px] tracking-[0.2em] px-1 py-0.5 rounded border"
        style={{ color: card.rarity.color, borderColor: card.rarity.color + '66', background: '#04050dcc' }}>
        {card.rarity.key}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-1.5">
        <div className="font-mono text-[6.5px] tracking-[0.15em] truncate" style={{ color: art.color }}>◆ {art.codename}</div>
        <div className="font-display text-[8.5px] tracking-[0.06em] truncate mb-1">{a.name[lang] || a.name.en}</div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-nova">{card.atk}</span>
          <div className="flex gap-0.5">
            {card.keywords.map((k) => (
              <span key={k} className="w-1 h-1 rounded-full bg-ice/80" />
            ))}
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-300">{card.hp}</span>
        </div>
      </div>
    </motion.button>
  );
});

// ---- board unit ------------------------------------------------------------
export const BoardUnit = React.forwardRef(function BoardUnit(
  { u, lang, t, side, selected, selectable, targetable, onClick, onArt, artReady }, ref
) {
  const a = u.card.archetype;
  const art = artOf(u.card);
  const gold = u.card.rarity.key === 'SSR' || u.card.rarity.key === 'UR';
  const hurt = u.hp < u.maxHp;
  const ribbon = u.frozen || u.sick;

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={u.uid}
      initial={{ scale: 0.4, opacity: 0, y: side === 'you' ? 40 : -40 }}
      animate={{ scale: selected ? 1.06 : 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.3, opacity: 0, rotate: 25, transition: { duration: 0.4 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative shrink-0"
    >
      <button
        onClick={onClick}
        disabled={!selectable && !targetable}
        className={'relative w-[86px] sm:w-[104px] aspect-[0.72] rounded-lg overflow-hidden border transition-all ' +
          (selected ? 'border-ice ring-2 ring-ice/70 ' : '') +
          (targetable ? 'border-rose-400 ring-2 ring-rose-400/60 animate-pulse cursor-crosshair ' : '') +
          (!selected && !targetable ? 'border-white/15 ' : '') +
          (selectable ? 'cursor-pointer hover:-translate-y-1.5 ' : '') +
          (u.frozen ? 'saturate-0 ' : '') +
          (u.sick && !u.frozen ? 'opacity-80 ' : '') +
          (gold ? 'nm-gold-frame ' : '')}
        style={{ boxShadow: `0 10px 26px -14px ${a.color}cc` }}
      >
        <Face archetype={a} />
        <div className="absolute inset-0 nm-scanlines opacity-25 pointer-events-none" />
        {gold && <div className="absolute inset-0 nm-holo-sweep pointer-events-none" />}
        {u.frozen && <div className="absolute inset-0 nm-fx-frozen pointer-events-none" />}
        {u.shield > 0 && <div className="absolute inset-0 rounded-lg nm-fx-shield pointer-events-none" />}

        {/* status ribbon — keyword pips shift down when this is showing */}
        {ribbon && (
          <div className="absolute top-1 inset-x-1 text-center font-mono text-[6px] tracking-[0.2em] py-0.5 rounded bg-ink/85 border border-white/20 text-chrome/70">
            {u.frozen ? t.frozen : t.sick}
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-1">
          <div className="font-display text-[7.5px] tracking-[0.05em] truncate mb-0.5">{a.name[lang] || a.name.en}</div>
          <div className="flex items-center justify-between px-0.5">
            <span className="font-mono text-[12px] font-bold text-nova drop-shadow">{u.atk}</span>
            {u.shield > 0 && <span className="font-mono text-[9px] text-ice">◈{u.shield}</span>}
            <span className={'font-mono text-[12px] font-bold drop-shadow ' + (hurt ? 'text-rose-300' : 'text-emerald-300')}>{u.hp}</span>
          </div>
        </div>

        {/* keyword pips */}
        <div className={'absolute left-1 flex flex-col gap-0.5 ' + (ribbon ? 'top-[18px]' : 'top-1')}>
          {u.keywords.map((k) => (
            <span key={k} title={KEYWORDS[k] ? (KEYWORDS[k].desc[lang] || KEYWORDS[k].desc.en) : k}
              className="font-mono text-[6px] tracking-[0.1em] px-1 rounded bg-ink/85 border border-white/25 text-chrome/75">
              {KEYWORDS[k] ? (KEYWORDS[k][lang] || KEYWORDS[k].en) : k}
            </span>
          ))}
        </div>
      </button>

      {/* art trigger — only ever shown on your own units */}
      {side === 'you' && !u.artUsed && (
        <button
          onClick={onArt}
          disabled={!artReady}
          title={art.name[lang] || art.name.en}
          className={'absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border-2 transition ' +
            (artReady ? 'cursor-pointer hover:scale-125 nm-fx-artready' : 'opacity-35 cursor-not-allowed')}
          style={{
            background: '#04050df2',
            borderColor: artReady ? art.color : '#ffffff33',
            color: artReady ? art.color : '#ffffff55'
          }}
        >
          {art.cost}
        </button>
      )}
    </motion.div>
  );
});

// ---- damage / heal floaters ------------------------------------------------
export function Floaters({ items }) {
  return (
    <AnimatePresence>
      {items.map((f) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -46, scale: f.crit ? 1.5 : 1.15 }}
          exit={{ opacity: 0, y: -70, scale: 0.8 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="pointer-events-none fixed z-[120] font-display font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          style={{
            left: f.x, top: f.y,
            fontSize: f.crit ? 30 : 22,
            color: f.kind === 'heal' ? '#6ee7b7' : f.kind === 'shield' ? '#7dd3fc' : f.crit ? '#fbbf24' : '#fb7185',
            transform: 'translate(-50%,-50%)'
          }}
        >
          {f.kind === 'heal' ? '+' : f.kind === 'shield' ? '◈' : '−'}{f.amount}
          {f.crit && <span className="block text-[9px] font-mono tracking-[0.25em] text-center mt-0.5">×1.5</span>}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// ---- the cinematic art overlay --------------------------------------------
// One full-screen takeover per signature art, keyed off art.fx. This is the
// same component the /arts codex uses to preview, so a move can never look
// different in the gallery than it does in a real fight.
export function FxLayer({ burst, onDone }) {
  React.useEffect(() => {
    if (!burst) return;
    const id = setTimeout(onDone, burst.long ? 1900 : 1500);
    return () => clearTimeout(id);
  }, [burst, onDone]);

  return (
    <AnimatePresence>
      {burst && (
        <motion.div
          key={burst.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed inset-0 z-[140] overflow-hidden"
        >
          {/* darkened stage */}
          <motion.div className="absolute inset-0 bg-ink"
            initial={{ opacity: 0 }} animate={{ opacity: 0.72 }} exit={{ opacity: 0 }} />

          {/* rotating rays, tinted to the art */}
          <div className="absolute inset-[-50%] nm-ur-rays"
            style={{ background: `repeating-conic-gradient(from 0deg, ${burst.color}22 0deg 7deg, transparent 7deg 15deg)` }} />

          <FxBody fx={burst.fx} color={burst.color} />

          {/* the name card */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-[70vw] mb-5"
              style={{ background: `linear-gradient(90deg, transparent, ${burst.color}, transparent)` }} />
            <motion.div
              initial={{ opacity: 0, y: 18, letterSpacing: '0.9em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.34em' }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="font-display text-2xl sm:text-4xl text-center px-6 nm-fx-textglow"
              style={{ color: burst.color }}>
              {burst.title}
            </motion.div>
            {burst.subtitle && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ delay: 0.22 }}
                className="mt-3 font-mono text-[10px] tracking-[0.4em] text-chrome/70">
                {burst.subtitle}
              </motion.div>
            )}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-[70vw] mt-5"
              style={{ background: `linear-gradient(90deg, transparent, ${burst.color}, transparent)` }} />
          </div>

          {/* impact flash */}
          <motion.div className="absolute inset-0"
            style={{ background: burst.color, mixBlendMode: 'screen' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0, 0.22, 0] }}
            transition={{ duration: 0.8, times: [0, 0.08, 0.2, 0.3, 0.5] }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Per-element signature visual. Each one is built from cheap transforms so it
// stays smooth on a phone.
function FxBody({ fx, color }) {
  switch (fx) {
    case 'frost':
      return (
        <>
          {/* freezing sheet climbing the screen */}
          <motion.div className="absolute inset-x-0 bottom-0 nm-fx-frostwall"
            initial={{ height: '0%' }} animate={{ height: '100%' }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }} />
          {[...Array(14)].map((_, i) => (
            <motion.div key={i} className="absolute nm-fx-shard"
              style={{ left: `${(i * 7 + 6) % 96}%`, top: `${(i * 31) % 80 + 8}%`, borderColor: color }}
              initial={{ opacity: 0, scale: 0, rotate: i * 25 }}
              animate={{ opacity: [0, 1, 0.9, 0], scale: [0, 1.3, 1, 0.6], rotate: i * 25 + 90 }}
              transition={{ duration: 1.2, delay: i * 0.035 }} />
          ))}
        </>
      );
    case 'nova':
      return (
        <>
          <motion.div className="absolute left-1/2 top-1/2 rounded-full"
            style={{ background: `radial-gradient(circle, #fff 0%, ${color} 35%, transparent 70%)`, x: '-50%', y: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: '190vmax', height: '190vmax', opacity: [1, 0.85, 0] }}
            transition={{ duration: 1.3, ease: 'easeOut' }} />
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} className="absolute left-1/2 top-1/2 rounded-full border-2"
              style={{ borderColor: color, x: '-50%', y: '-50%' }}
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: '140vmax', height: '140vmax', opacity: 0 }}
              transition={{ duration: 1.1, delay: 0.12 * i, ease: 'easeOut' }} />
          ))}
        </>
      );
    case 'void':
      return (
        <>
          {/* singularity that swallows the frame */}
          <motion.div className="absolute left-1/2 top-1/2 rounded-full"
            style={{ background: '#04050d', boxShadow: `0 0 120px 40px ${color}`, x: '-50%', y: '-50%' }}
            initial={{ width: 0, height: 0 }}
            animate={{ width: ['0vmax', '34vmax', '6vmax'], height: ['0vmax', '34vmax', '6vmax'] }}
            transition={{ duration: 1.5, times: [0, 0.55, 1], ease: 'easeInOut' }} />
          {[...Array(16)].map((_, i) => (
            <motion.div key={i} className="absolute left-1/2 top-1/2 w-1 rounded-full"
              style={{ background: color, height: 60, originY: 1, rotate: i * 22.5 }}
              initial={{ scaleY: 1, opacity: 0.8, y: -260 }}
              animate={{ scaleY: 0, opacity: 0, y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.02, ease: 'easeIn' }} />
          ))}
        </>
      );
    case 'gild':
      return (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="absolute inset-y-0 w-[3px]"
              style={{ left: `${18 + i * 16}%`, background: `linear-gradient(180deg, transparent, ${color}, transparent)` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, delay: i * 0.07 }} />
          ))}
          {/* sword-slash sweep */}
          <motion.div className="absolute inset-0 nm-fx-slash"
            style={{ background: `linear-gradient(105deg, transparent 42%, #fff 49%, ${color} 51%, transparent 58%)` }}
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.65, delay: 0.25, ease: 'easeIn' }} />
        </>
      );
    case 'aether':
      return (
        <>
          {[...Array(22)].map((_, i) => (
            <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
              style={{ left: `${(i * 13 + 5) % 95}%`, background: color, boxShadow: `0 0 12px ${color}` }}
              initial={{ bottom: '-5%', opacity: 0 }}
              animate={{ bottom: '105%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, delay: (i % 7) * 0.09, ease: 'easeOut' }} />
          ))}
          <motion.div className="absolute left-1/2 top-1/2 rounded-full border"
            style={{ borderColor: color, x: '-50%', y: '-50%' }}
            initial={{ width: '10vmax', height: '10vmax', opacity: 0 }}
            animate={{ width: '80vmax', height: '80vmax', opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.4 }} />
        </>
      );
    case 'ignis':
      return (
        <>
          {/* hex shield lattice snapping shut */}
          <motion.div className="absolute inset-0 nm-fx-hex"
            style={{ color }}
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: [0, 0.9, 0.55], scale: 1 }}
            transition={{ duration: 0.8 }} />
          <motion.div className="absolute left-1/2 top-1/2 rounded-full border-4"
            style={{ borderColor: color, x: '-50%', y: '-50%', boxShadow: `0 0 80px ${color}` }}
            initial={{ width: '90vmax', height: '90vmax', opacity: 0 }}
            animate={{ width: '30vmax', height: '30vmax', opacity: [0, 1, 0.6] }}
            transition={{ duration: 0.7, ease: 'easeOut' }} />
        </>
      );
    case 'tide':
      return (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="absolute inset-x-0 h-[38vh] nm-fx-wave"
              style={{ background: `linear-gradient(180deg, transparent, ${color}55, ${color}22, transparent)`, top: `${i * 18}%` }}
              initial={{ x: '-110%', opacity: 0 }}
              animate={{ x: '110%', opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.4, delay: i * 0.12, ease: 'easeInOut' }} />
          ))}
          <motion.div className="absolute left-1/2 top-1/2 rounded-full border-2"
            style={{ borderColor: color, x: '-50%', y: '-50%' }}
            initial={{ width: '70vmax', height: '70vmax', opacity: 0.8 }}
            animate={{ width: '0vmax', height: '0vmax', opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeIn' }} />
        </>
      );
    case 'flare':
    default:
      return (
        <>
          {/* charge-up then lance */}
          <motion.div className="absolute top-1/2 left-0 right-0 h-[6px] origin-left"
            style={{ background: `linear-gradient(90deg, ${color}, #fff, ${color})`, boxShadow: `0 0 60px 12px ${color}`, y: '-50%' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.85, delay: 0.15, ease: 'easeIn' }} />
          {[...Array(18)].map((_, i) => (
            <motion.div key={i} className="absolute h-[2px] rounded-full"
              style={{ top: `${(i * 11 + 4) % 92}%`, background: color, width: 40 + (i % 5) * 30 }}
              initial={{ x: '-30vw', opacity: 0 }}
              animate={{ x: '120vw', opacity: [0, 1, 0] }}
              transition={{ duration: 0.7, delay: 0.1 + (i % 6) * 0.05, ease: 'easeIn' }} />
          ))}
        </>
      );
  }
}

// ---- element ring diagram (used by the codex) ------------------------------
export function ElementRing({ lang, t }) {
  const els = Object.keys(ELEMENT_RING);
  const R = 108;
  return (
    <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-[8px] tracking-[0.3em] text-chrome/40">{t.ring}</div>
          <div className="font-mono text-[9px] text-ice mt-1">×1.5</div>
        </div>
      </div>
      {els.map((el, i) => {
        const ang = (i / els.length) * Math.PI * 2 - Math.PI / 2;
        const x = 140 + Math.cos(ang) * R - 26;
        const y = 140 + Math.sin(ang) * R - 10;
        const color = COLOR_OF[el] || '#7dd3fc';
        return (
          <div key={el} className="absolute font-mono text-[8px] tracking-[0.15em] px-1.5 py-0.5 rounded-full border text-center"
            style={{ left: x, top: y, width: 52, color, borderColor: color + '55', background: color + '12' }}>
            {elLabel(el, lang)}
          </div>
        );
      })}
    </div>
  );
}

export const COLOR_OF = {
  CRYO: '#7dd3fc', PLASMA: '#f9a8d4', GRAVITY: '#a78bfa', RADIANT: '#fbbf24',
  AETHER: '#6ee7b7', IGNIS: '#fb7185', TIDE: '#94a3b8', FLARE: '#f59e0b'
};
