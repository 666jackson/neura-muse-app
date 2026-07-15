import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMusePool } from '../../components/oracle/parts.jsx';
import {
  ArenaShell, HandCard, BoardUnit, FxLayer, Floaters
} from '../../components/game/parts.jsx';
import {
  newGame, clone, playCard, attack, useArt, endTurn, aiTurn,
  legalTargets, canAttack, canUseArt,
  HERO_HP, BOARD_MAX
} from '../../lib/battle.js';

let fid = 0;

export default function Battle() {
  return (
    <ArenaShell area="/battle" hero={false}>
      {({ lang, t }) => <Arena lang={lang} t={t} />}
    </ArenaShell>
  );
}

function Arena({ lang, t }) {
  const pool = useMusePool();
  const [state, setState] = React.useState(null);
  const [selected, setSelected] = React.useState(null);   // uid of your chosen attacker
  const [bursts, setBursts] = React.useState([]);         // queued art cinematics
  const [floats, setFloats] = React.useState([]);         // damage / heal numbers
  const [shake, setShake] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [busy, setBusy] = React.useState(false);          // AI is acting

  const nodes = React.useRef({});   // uid | 'hero-you' | 'hero-foe' → DOM node
  const timers = React.useRef([]);

  // Start a run once the character pool has settled (empty pool → built-ins).
  React.useEffect(() => {
    setState(newGame(pool));
    setSelected(null);
    setBusy(false);
  }, [pool]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };

  const flash = (msg) => {
    setToast(msg);
    later(() => setToast(null), 1400);
  };

  const rectOf = (key) => {
    const el = nodes.current[key];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // Turn engine events into things you can see. Positions are read BEFORE the
  // state update lands, so units that are about to die still have a rect.
  const playEvents = (events) => {
    let delay = 0;
    events.forEach((e) => {
      if (e.type === 'art') {
        const art = e;
        later(() => setBursts((b) => [...b, {
          id: 'b' + ++fid, fx: art.fx, color: art.color,
          title: art.codename, subtitle: e.side === 'you' ? t.you : t.foe, long: true
        }]), delay);
        delay += 260;
        return;
      }
      if (e.type === 'damage' || e.type === 'heal' || e.type === 'shield') {
        const key = e.hero ? 'hero-' + e.side : e.uid;
        const at = rectOf(key);
        if (at) {
          const kind = e.type === 'damage' ? 'dmg' : e.type;
          const f = { id: 'f' + ++fid, ...at, amount: e.amount, kind, crit: !!e.adv };
          later(() => {
            setFloats((x) => [...x, f]);
            later(() => setFloats((x) => x.filter((y) => y.id !== f.id)), 950);
          }, delay);
          delay += 90;
        }
        if (e.hero && e.side === 'you' && e.type === 'damage') {
          later(() => { setShake(true); later(() => setShake(false), 380); }, delay);
        }
      }
    });
  };

  // Every mutation funnels through here: clone → mutate → render → animate.
  const act = (fn) => {
    if (!state) return;
    const s = clone(state);
    s.events = [];
    fn(s);
    playEvents(s.events);
    setState(s);
    return s;
  };

  if (!state) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.4em] text-chrome/40 animate-pulse">CALIBRATING ARENA…</div>
      </div>
    );
  }

  const yourTurn = state.active === 'you' && !state.winner && !busy;
  const targets = legalTargets(state, 'you');
  const canHitHero = !!selected && targets.hero;
  const targetableUids = selected ? targets.units.map((u) => u.uid) : [];

  // ---- interactions --------------------------------------------------------
  const onPlay = (card) => {
    if (!yourTurn) return;
    if (state.board.you.length >= BOARD_MAX) return flash(t.boardFull);
    if (card.cost > state.mana.you.cur) return flash(t.noMana);
    act((s) => playCard(s, 'you', card.id));
    setSelected(null);
  };

  const onUnitClick = (u, side) => {
    if (!yourTurn) return;
    if (side === 'you') {
      if (!canAttack(state, 'you', u)) return;
      setSelected(selected === u.uid ? null : u.uid);
      return;
    }
    // clicking an enemy = attack with the selected unit
    if (!selected) return;
    if (!targetableUids.includes(u.uid)) return flash(t.guarded);
    act((s) => attack(s, 'you', selected, u.uid));
    setSelected(null);
  };

  const onHeroClick = () => {
    if (!yourTurn || !selected) return;
    if (!canHitHero) return flash(t.guarded);
    act((s) => attack(s, 'you', selected, 'hero'));
    setSelected(null);
  };

  const onArt = (u) => {
    if (!yourTurn) return;
    if (!canUseArt(state, 'you', u)) return flash(t.noMana);
    act((s) => useArt(s, 'you', u.uid));
    setSelected(null);
  };

  const onEndTurn = () => {
    if (!yourTurn) return;
    setSelected(null);
    setBusy(true);
    const s1 = act((s) => endTurn(s));
    if (!s1 || s1.winner) { setBusy(false); return; }
    // Let the rival "think" so its play reads as a turn, not a state jump.
    later(() => {
      const s = clone(s1);
      s.events = [];
      aiTurn(s);
      playEvents(s.events);
      setState(s);
      setBusy(false);
    }, 900);
  };

  const restart = () => {
    setBursts([]); setFloats([]); setSelected(null); setBusy(false);
    setState(newGame(pool));
  };

  return (
    <motion.div animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.38 }}
      className="relative max-w-5xl mx-auto">

      {/* ---- rival core ---- */}
      <HeroBar
        side="foe" hero={state.hero.foe} mana={state.mana.foe} lang={lang} t={t}
        deck={state.deck.foe.length} hand={state.hand.foe.length}
        nodeRef={(el) => (nodes.current['hero-foe'] = el)}
        targetable={canHitHero}
        onClick={onHeroClick}
        active={state.active === 'foe'}
      />

      {/* ---- rival board ---- */}
      <Row>
        <AnimatePresence mode="popLayout">
          {state.board.foe.map((u) => (
            <BoardUnit
              key={u.uid} u={u} side="foe" lang={lang} t={t}
              targetable={targetableUids.includes(u.uid)}
              selectable={false}
              onClick={() => onUnitClick(u, 'foe')}
              artReady={false}
            />
          ))}
        </AnimatePresence>
        {!state.board.foe.length && <Empty t={t} />}
      </Row>

      {/* ---- the line ---- */}
      <div className="relative my-3 sm:my-5">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={'font-mono text-[8px] tracking-[0.4em] px-3 py-1 rounded-full border bg-ink ' +
            (yourTurn ? 'border-ice/60 text-ice' : 'border-nova/50 text-nova animate-pulse')}>
            {state.winner ? '— — —' : yourTurn ? t.yourTurn : t.enemyTurn} · {t.turn} {state.turn}
          </div>
        </div>
      </div>

      {/* ---- your board ---- */}
      <Row>
        <AnimatePresence mode="popLayout">
          {state.board.you.map((u) => (
            <BoardUnit
              key={u.uid} u={u} side="you" lang={lang} t={t}
              selected={selected === u.uid}
              selectable={canAttack(state, 'you', u)}
              targetable={false}
              onClick={() => onUnitClick(u, 'you')}
              onArt={(e) => { e.stopPropagation(); onArt(u); }}
              artReady={canUseArt(state, 'you', u)}
            />
          ))}
        </AnimatePresence>
        {!state.board.you.length && <Empty t={t} />}
      </Row>

      {/* ---- your core ---- */}
      <HeroBar
        side="you" hero={state.hero.you} mana={state.mana.you} lang={lang} t={t}
        deck={state.deck.you.length} hand={state.hand.you.length}
        nodeRef={(el) => (nodes.current['hero-you'] = el)}
        active={yourTurn}
      />

      {/* ---- hand ---- */}
      <div className="mt-3 flex items-end justify-center gap-1.5 sm:gap-2 min-h-[164px] px-1 pt-8 overflow-visible">
        <AnimatePresence mode="popLayout">
          {state.hand.you.map((c, i) => (
            <HandCard
              key={c.id} card={c} lang={lang} t={t} index={i} total={state.hand.you.length}
              playable={yourTurn && c.cost <= state.mana.you.cur && state.board.you.length < BOARD_MAX}
              onPlay={onPlay}
            />
          ))}
        </AnimatePresence>
        {!state.hand.you.length && (
          <div className="font-mono text-[9px] tracking-[0.3em] text-chrome/25 pb-10">{t.empty}</div>
        )}
      </div>

      {/* ---- controls ---- */}
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
        <button onClick={onEndTurn} disabled={!yourTurn}
          className={'font-mono text-[10px] tracking-[0.3em] px-6 py-3 rounded-full border transition ' +
            (yourTurn
              ? 'border-ice text-ink bg-gradient-to-r from-ice to-nova hover:scale-105'
              : 'border-white/15 text-chrome/30 cursor-not-allowed')}>
          {yourTurn ? t.endTurn : t.enemyTurn}
        </button>
        <button onClick={restart}
          className="font-mono text-[10px] tracking-[0.3em] px-5 py-3 rounded-full border border-white/20 text-chrome/60 hover:border-nova hover:text-nova transition">
          {t.newRun}
        </button>
        <Link to="/arts"
          className="font-mono text-[10px] tracking-[0.3em] px-5 py-3 rounded-full border border-white/20 text-chrome/60 hover:border-ice hover:text-ice transition">
          {t.navArts} ▸
        </Link>
      </div>

      {/* hint line */}
      <div className="mt-3 text-center font-mono text-[8px] tracking-[0.25em] text-chrome/25">
        {selected ? t.selectTarget : yourTurn ? `${t.tapDeploy} · ${t.tapAttack}` : ''}
      </div>

      {/* ---- combat log ---- */}
      <CombatLog log={state.log} lang={lang} t={t} />

      {/* ---- overlays ---- */}
      <Floaters items={floats} />
      <FxLayer burst={bursts[0]} onDone={() => setBursts((b) => b.slice(1))} />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[125] font-mono text-[10px] tracking-[0.3em] px-4 py-2 rounded-full border border-nova/60 bg-ink/95 text-nova">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <GameOver state={state} t={t} onRestart={restart} />
    </motion.div>
  );
}

function Row({ children }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 min-h-[124px] sm:min-h-[146px] px-1">
      {children}
    </div>
  );
}

function Empty({ t }) {
  return (
    <div className="w-full max-w-md h-[100px] rounded-lg border border-dashed border-white/8 flex items-center justify-center">
      <span className="font-mono text-[8px] tracking-[0.3em] text-chrome/20">— {t.empty} —</span>
    </div>
  );
}

// ---- hero / core bar -------------------------------------------------------
function HeroBar({ side, hero, mana, lang, t, deck, hand, nodeRef, targetable, onClick, active }) {
  const you = side === 'you';
  const pct = Math.max(0, (hero.hp / HERO_HP) * 100);
  const low = hero.hp <= 10;
  return (
    <div className={'flex items-center gap-3 sm:gap-4 rounded-2xl border px-3 sm:px-5 py-2.5 transition ' +
      (active ? 'border-white/25 bg-white/[0.05]' : 'border-white/10 bg-white/[0.02]')}>

      <button
        ref={nodeRef}
        onClick={onClick}
        disabled={!targetable}
        className={'relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center transition ' +
          (targetable ? 'border-rose-400 ring-2 ring-rose-400/60 animate-pulse cursor-crosshair scale-105' : 'border-white/20') +
          (low ? ' nm-fx-artready' : '')}
        style={{
          background: `radial-gradient(circle at 50% 40%, ${you ? '#7dd3fc' : '#f9a8d4'}28, #04050d 70%)`,
          color: low ? '#fb7185' : '#e8ecf4'
        }}
      >
        <span className="font-display text-lg sm:text-xl leading-none">{Math.max(0, hero.hp)}</span>
        <span className="font-mono text-[6px] tracking-[0.2em] text-chrome/45 mt-0.5">{t.core}</span>
        {hero.shield > 0 && (
          <span className="absolute -top-1 -right-1 font-mono text-[8px] px-1 rounded-full border border-ice/60 bg-ink text-ice">
            ◈{hero.shield}
          </span>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[9px] tracking-[0.3em]" style={{ color: you ? '#7dd3fc' : '#f9a8d4' }}>
            {you ? t.you : t.foe}
          </span>
          <span className="font-mono text-[8px] tracking-[0.2em] text-chrome/35">
            {t.hand} {hand} · {t.deck} {deck}
          </span>
        </div>

        {/* core integrity */}
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mb-2">
          <motion.div className="h-full rounded-full"
            animate={{ width: pct + '%' }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ background: low ? 'linear-gradient(90deg,#fb7185,#f9a8d4)' : 'linear-gradient(90deg,#7dd3fc,#6ee7b7)' }} />
        </div>

        {/* energy pips */}
        <div className="flex items-center gap-1">
          {[...Array(mana.max)].map((_, i) => (
            <motion.span key={i}
              initial={false}
              animate={{ scale: i < mana.cur ? 1 : 0.72, opacity: i < mana.cur ? 1 : 0.3 }}
              className="w-2.5 h-2.5 rounded-full border"
              style={{
                background: i < mana.cur ? '#7dd3fc' : 'transparent',
                borderColor: '#7dd3fc99',
                boxShadow: i < mana.cur ? '0 0 8px #7dd3fc99' : 'none'
              }} />
          ))}
          <span className="ml-1.5 font-mono text-[8px] tracking-[0.2em] text-chrome/40">
            {mana.cur}/{mana.max}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- combat log ------------------------------------------------------------
const LOG_TEXT = {
  en: {
    deploy: (d) => `DEPLOY · ${d.name} [${d.rarity}]`,
    clash: (d) => `${d.a} ▸ ${d.b} — ${d.dmg} DMG${d.adv ? ' ×1.5 ADVANTAGE' : ''}`,
    faceHit: (d) => `${d.name} ▸ CORE — ${d.dmg} DMG`,
    art: (d) => `ART · ${d.name} — ${d.unit}`,
    death: (d) => `${d.name} DESTROYED`,
    fatigue: (d) => `DECK EMPTY — ${d.n} FATIGUE`,
    burn: (d) => `${d.name} BURNED — HAND FULL`
  },
  zh: {
    deploy: (d) => `部署 · ${d.name} [${d.rarity}]`,
    clash: (d) => `${d.a} ▸ ${d.b} — ${d.dmg} 傷害${d.adv ? ' ×1.5 剋制' : ''}`,
    faceHit: (d) => `${d.name} ▸ 本體 — ${d.dmg} 傷害`,
    art: (d) => `招數 · ${d.name} — ${d.unit}`,
    death: (d) => `${d.name} 已被摧毀`,
    fatigue: (d) => `牌庫耗盡 — ${d.n} 疲勞傷害`,
    burn: (d) => `${d.name} 燒毀 — 手牌已滿`
  },
  ja: {
    deploy: (d) => `配置 · ${d.name} [${d.rarity}]`,
    clash: (d) => `${d.a} ▸ ${d.b} — ${d.dmg} ダメージ${d.adv ? ' ×1.5 有利' : ''}`,
    faceHit: (d) => `${d.name} ▸ コア — ${d.dmg} ダメージ`,
    art: (d) => `必殺技 · ${d.name} — ${d.unit}`,
    death: (d) => `${d.name} 破壊`,
    fatigue: (d) => `デッキ切れ — ${d.n} 疲労`,
    burn: (d) => `${d.name} 焼却 — 手札満杯`
  }
};

function CombatLog({ log, lang, t }) {
  const dict = LOG_TEXT[lang] || LOG_TEXT.en;
  return (
    <div className="mt-8 max-w-xl mx-auto">
      <div className="font-mono text-[8px] tracking-[0.35em] text-chrome/35 mb-2">◆ {t.logTitle}</div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 h-28 overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {log.length === 0 && (
            <div className="font-mono text-[9px] tracking-[0.25em] text-chrome/20">{t.empty}</div>
          )}
          {log.map((l) => (
            <motion.div key={l.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className={'font-mono text-[9px] leading-relaxed truncate ' +
                (l.side === 'you' ? 'text-ice/75' : 'text-nova/75')}>
              <span className="text-chrome/25">{l.side === 'you' ? '›' : '‹'} </span>
              {dict[l.key] ? dict[l.key](l.data) : l.key}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- endgame ---------------------------------------------------------------
function GameOver({ state, t, onRestart }) {
  const win = state.winner;
  return (
    <AnimatePresence>
      {win && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/92 backdrop-blur-md px-6">
          <div className="absolute inset-[-40%] nm-ur-rays opacity-40" />
          <motion.div initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
            className="relative text-center">
            <div className="font-mono text-[10px] tracking-[0.5em] text-chrome/40 mb-4">SECTOR 07 · ARENA</div>
            <h2 className="font-display text-3xl sm:text-5xl tracking-[0.14em] mb-6 nm-fx-textglow"
              style={{ color: win === 'you' ? '#6ee7b7' : win === 'draw' ? '#94a3b8' : '#fb7185' }}>
              {win === 'you' ? t.victory : win === 'draw' ? t.draw : t.defeat}
            </h2>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={onRestart}
                className="font-mono text-[10px] tracking-[0.3em] px-6 py-3 rounded-full bg-gradient-to-r from-ice to-nova text-ink hover:scale-105 transition">
                {t.playAgain}
              </button>
              <Link to="/"
                className="font-mono text-[10px] tracking-[0.3em] px-6 py-3 rounded-full border border-white/25 text-chrome/60 hover:border-ice hover:text-ice transition">
                {t.backHome}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
