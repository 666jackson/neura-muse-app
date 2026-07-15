import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HoloCard from '../../components/HoloCard.jsx';
import { ArenaShell, FxLayer, ElementRing, elLabel, COLOR_OF } from '../../components/game/parts.jsx';
import { ART_LIST, ELEMENT_RING } from '../../lib/arts.js';
import { KEYWORDS, HERO_HP, BOARD_MAX, DECK_SIZE, MANA_MAX } from '../../lib/battle.js';
import { BY_KEY } from '../../lib/oracle.js';

let bid = 0;

export default function Arts() {
  return (
    <ArenaShell area="/arts">
      {({ lang, t }) => <Codex lang={lang} t={t} />}
    </ArenaShell>
  );
}

function Codex({ lang, t }) {
  const [burst, setBurst] = React.useState(null);

  // Playing the preview runs the exact same <FxLayer /> the arena fires, so the
  // codex can never drift from what a real cast looks like.
  const preview = (art) => {
    // Subtitle the caster, not the art's own name — in English that would just
    // repeat the codename already blazing above it.
    const muse = BY_KEY[art.archetype];
    setBurst({
      id: 'p' + ++bid, fx: art.fx, color: art.color,
      title: art.codename,
      subtitle: muse ? (muse.name[lang] || muse.name.en) : (art.name[lang] || art.name.en),
      long: true
    });
  };

  return (
    <>
      {/* ---- the eight signature arts ---- */}
      <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
        {ART_LIST.map((art, i) => (
          <motion.div key={art.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}>
            <ArtCard art={art} lang={lang} t={t} onPreview={() => preview(art)} />
          </motion.div>
        ))}
      </div>

      {/* ---- element ring ---- */}
      <section className="mt-16">
        <div className="font-mono text-[9px] tracking-[0.4em] text-nova mb-2">◆ {t.ring}</div>
        <p className="text-chrome/55 font-light text-sm mb-6 max-w-lg">{t.ringNote}</p>
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <ElementRing lang={lang} t={t} />
          <div className="grid sm:grid-cols-2 gap-2">
            {Object.keys(ELEMENT_RING).map((el) => (
              <div key={el} className="flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] rounded-lg border border-white/8 px-3 py-2">
                <span style={{ color: COLOR_OF[el] }}>{elLabel(el, lang)}</span>
                <span className="text-chrome/25">▸</span>
                <span style={{ color: COLOR_OF[ELEMENT_RING[el]] }}>{elLabel(ELEMENT_RING[el], lang)}</span>
                <span className="ml-auto text-ice/70">×1.5</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- keywords + rules ---- */}
      <section className="mt-12 grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="font-mono text-[9px] tracking-[0.4em] text-ice mb-4">◆ {t.kw}</div>
          <div className="space-y-3">
            {Object.keys(KEYWORDS).map((k) => (
              <div key={k} className="flex gap-3 items-start">
                <span className="shrink-0 font-mono text-[9px] tracking-[0.2em] px-2 py-1 rounded-full border border-white/25 bg-white/5">
                  {KEYWORDS[k][lang] || KEYWORDS[k].en}
                </span>
                <p className="text-chrome/60 font-light text-xs leading-relaxed pt-1">
                  {KEYWORDS[k].desc[lang] || KEYWORDS[k].desc.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="font-mono text-[9px] tracking-[0.4em] text-nova mb-4">◆ {t.rulesTitle}</div>
          <ul className="space-y-2.5">
            {RULES[lang].map((r, i) => (
              <li key={i} className="flex gap-3 font-light text-xs text-chrome/65 leading-relaxed">
                <span className="font-mono text-[9px] text-ice/50 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link to="/battle"
          className="inline-block font-mono text-[10px] tracking-[0.35em] px-8 py-4 rounded-full bg-gradient-to-r from-ice to-nova text-ink hover:scale-105 transition">
          {t.navBattle} ▸
        </Link>
      </div>

      <FxLayer burst={burst} onDone={() => setBurst(null)} />
    </>
  );
}

function ArtCard({ art, lang, t, onPreview }) {
  const muse = BY_KEY[art.archetype];
  return (
    <HoloCard color={art.color} className="h-full overflow-hidden border border-white/12"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="font-mono text-[8px] tracking-[0.35em] mb-1.5" style={{ color: art.color }}>
              ◆ {art.codename}
            </div>
            <h3 className="font-display text-lg sm:text-xl tracking-[0.08em] truncate">
              {art.name[lang] || art.name.en}
            </h3>
            {muse && (
              <div className="font-mono text-[8px] tracking-[0.2em] text-chrome/35 mt-1.5 truncate">
                {muse.name[lang] || muse.name.en} · {muse.weapon}
              </div>
            )}
          </div>
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2"
            style={{ borderColor: art.color, color: art.color, background: '#04050d' }}>
            {art.cost}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[8px] tracking-[0.2em] px-2 py-0.5 rounded-full border"
            style={{ color: art.color, borderColor: art.color + '55', background: art.color + '14' }}>
            {elLabel(art.element, lang)}
          </span>
          <span className="font-mono text-[8px] tracking-[0.15em] text-chrome/30">
            {t.beats} {elLabel(ELEMENT_RING[art.element], lang)}
          </span>
        </div>

        <div className="rounded-xl border border-white/8 bg-ink/50 p-3.5 mb-4">
          <div className="font-mono text-[7px] tracking-[0.3em] text-chrome/35 mb-1.5">{t.effect}</div>
          <p className="font-light text-xs leading-relaxed text-chrome/80">
            {art.desc[lang] || art.desc.en}
          </p>
        </div>

        <p className="font-light text-[11px] italic leading-relaxed text-chrome/40 mb-5 min-h-[32px]">
          “{art.flavor[lang] || art.flavor.en}”
        </p>

        <button onClick={onPreview}
          className="w-full font-mono text-[9px] tracking-[0.3em] py-2.5 rounded-full border transition hover:scale-[1.03]"
          style={{ borderColor: art.color + '77', color: art.color, background: art.color + '10' }}>
          ▶ {t.preview}
        </button>
      </div>
    </HoloCard>
  );
}

const RULES = {
  en: [
    `Both cores start at ${HERO_HP}. Drop the rival core to 0 to win.`,
    `Energy ramps 1 → ${MANA_MAX}, one pip per turn, and refills every turn.`,
    `Decks hold ${DECK_SIZE} cards rolled from the live character archive; rarity sets the stat line (UR is +2/+3).`,
    `You may field up to ${BOARD_MAX} units. Fresh units charge for a turn unless they have RUSH.`,
    'Attacking your prey element deals ×1.5. The ring is the whole tactical layer — read it before you trade.',
    'Every unit carries one signature art, usable once per run for the energy shown on its badge.',
    'An empty deck means fatigue: each draw past the last card bites harder than the one before.'
  ],
  zh: [
    `雙方本體皆為 ${HERO_HP} 點。將對方本體打到 0 即獲勝。`,
    `能量從 1 逐回合遞增至 ${MANA_MAX}，且每回合完全回滿。`,
    `牌庫為 ${DECK_SIZE} 張，從線上角色檔案庫隨機抽取；稀有度決定數值（UR 為 +2/+3）。`,
    `場上最多 ${BOARD_MAX} 個機體。新部署的機體需充能一回合，除非擁有「突襲」。`,
    '攻擊你所剋制的元素造成 ×1.5 傷害。相剋環就是整個戰術核心——交換前先讀懂它。',
    '每個機體都帶有一招專屬招數，每場限用一次，消耗徽章上顯示的能量。',
    '牌庫耗盡即進入疲勞：此後每次抽牌，傷害都比前一次更重。'
  ],
  ja: [
    `両コアとも ${HERO_HP} から開始。相手コアを0にすれば勝利。`,
    `エネルギーは毎ターン1ずつ ${MANA_MAX} まで増え、毎ターン全回復する。`,
    `デッキは ${DECK_SIZE} 枚、キャラクターアーカイブから抽選。レア度がステータスを決める（URは +2/+3）。`,
    `フィールドは最大 ${BOARD_MAX} 体。新規ユニットは「突撃」がなければ1ターン充電する。`,
    '有利属性へ攻撃すると ×1.5。この相性環こそが戦術の核心——交換前に必ず読むこと。',
    '各ユニットは固有の必殺技を1回だけ、バッジに表示されたエネルギーで発動できる。',
    'デッキが尽きると疲労：以降、引くたびにダメージが増していく。'
  ]
};
