// Neura Arena — 招數特輯 (signature arts).
// One signature art per archetype. This module is DATA ONLY: every art is
// described by a serializable spec (no functions), so battle state can be
// structuredClone()'d between React renders. lib/battle.js reads `effect`
// and executes it; the /arts codex page reads the copy + `fx` to preview it.

// FX ids map 1:1 to the .nm-fx-* CSS in index.css and the <FxLayer /> switch.
export const ARTS = {
  'frost-sovereign': {
    key: 'absolute-zero',
    codename: 'ABSOLUTE ZERO',
    name: { en: 'Absolute Zero', zh: '絕對零度', ja: '絶対零度' },
    element: 'CRYO',
    color: '#7dd3fc',
    cost: 3,
    fx: 'frost',
    effect: { kind: 'freezeAll', damage: 2 },
    desc: {
      en: 'Freeze every enemy unit — they cannot attack next turn — and deal 2 damage to each.',
      zh: '凍結敵方所有機體——下回合無法攻擊——並對每個目標造成 2 點傷害。',
      ja: '敵ユニットをすべて凍結——次のターン攻撃不可——さらに各2ダメージ。'
    },
    flavor: {
      en: 'The verdict never misses. It simply waits for the room to stop moving.',
      zh: '宣判從不落空。它只是等待整個房間停止移動。',
      ja: '判決は決して外さない。ただ、部屋が静止するのを待つだけだ。'
    }
  },
  'nova-devotion': {
    key: 'supernova-heart',
    codename: 'SUPERNOVA HEART',
    name: { en: 'Supernova Heart', zh: '超新星之心', ja: '超新星の心臓' },
    element: 'PLASMA',
    color: '#f9a8d4',
    cost: 4,
    fx: 'nova',
    effect: { kind: 'aoe', damage: 4, selfDamage: 2 },
    desc: {
      en: 'Detonate the core: 4 damage to all enemy units, 2 damage to itself.',
      zh: '引爆核心：對敵方所有機體造成 4 點傷害，自身承受 2 點。',
      ja: 'コアを起爆：敵ユニット全体に4ダメージ、自身に2ダメージ。'
    },
    flavor: {
      en: 'Never built to last. Built to be remembered.',
      zh: '從不是為了長久而生，是為了被記住而生。',
      ja: '長く在るためでなく、記憶されるために造られた。'
    }
  },
  'void-oracle': {
    key: 'event-horizon',
    codename: 'EVENT HORIZON',
    name: { en: 'Event Horizon', zh: '事件視界', ja: '事象の地平線' },
    element: 'GRAVITY',
    color: '#a78bfa',
    cost: 3,
    fx: 'void',
    effect: { kind: 'collapseStrongest' },
    desc: {
      en: "Collapse the strongest enemy unit: its attack becomes 0 and it takes damage equal to what it lost.",
      zh: '塌縮敵方最強機體：其攻擊歸零，並承受等同於失去攻擊力的傷害。',
      ja: '敵最強ユニットを崩壊：攻撃力を0にし、失った分のダメージを与える。'
    },
    flavor: {
      en: 'You have been sitting quietly inside the question the whole time.',
      zh: '你始終安靜地坐在問題的內部。',
      ja: 'あなたはずっと問いの内側に静かに座っている。'
    }
  },
  'gilded-duelist': {
    key: 'final-act',
    codename: 'FINAL ACT',
    name: { en: 'Final Act', zh: '終幕', ja: '最終幕' },
    element: 'RADIANT',
    color: '#fbbf24',
    cost: 3,
    fx: 'gild',
    effect: { kind: 'buffSelf', atk: 3, hp: 3, refreshAttack: true },
    desc: {
      en: 'Gain +3/+3 and ready an immediate extra attack this turn.',
      zh: '獲得 +3/+3，並立刻重置一次本回合的攻擊機會。',
      ja: '+3/+3 を得て、このターン追加の攻撃を即座に構える。'
    },
    flavor: {
      en: 'The brighter the stage, the sharper your edge.',
      zh: '舞台越亮，你的鋒芒越利。',
      ja: '舞台が輝くほど、刃は鋭くなる。'
    }
  },
  'circuit-seraph': {
    key: 'uptime-choir',
    codename: 'UPTIME CHOIR',
    name: { en: 'Uptime Choir', zh: '常駐聖歌', ja: '常駐の聖歌' },
    element: 'AETHER',
    color: '#6ee7b7',
    cost: 2,
    fx: 'aether',
    effect: { kind: 'support', heroHeal: 6, allyHp: 2 },
    desc: {
      en: 'Restore 6 HP to your core and grant every friendly unit +0/+2.',
      zh: '為己方本體恢復 6 點生命，並給予所有友方機體 +0/+2。',
      ja: '自軍コアを6回復し、味方ユニット全体に +0/+2。'
    },
    flavor: {
      en: 'Ten thousand quiet corrections a second, none of them signed.',
      zh: '每秒一萬次無聲的修正，沒有一次署名。',
      ja: '毎秒一万の静かな修正、そのどれにも署名はない。'
    }
  },
  'crimson-sentinel': {
    key: 'hold-the-line',
    codename: 'HOLD THE LINE',
    name: { en: 'Hold the Line', zh: '死守防線', ja: '戦線死守' },
    element: 'IGNIS',
    color: '#fb7185',
    cost: 2,
    fx: 'ignis',
    effect: { kind: 'fortify', shield: 6, grantGuard: true },
    desc: {
      en: 'Raise a 6-point nano shield and give GUARD to every friendly unit.',
      zh: '展開 6 點奈米護盾，並賦予所有友方機體「守衛」。',
      ja: '6ポイントのナノシールドを展開し、味方全体に「守護」を付与。'
    },
    flavor: {
      en: 'Loyalty like yours is not programmed. It is chosen, every single day.',
      zh: '你這樣的忠誠並非被寫入程式，而是每一天、親手選擇的。',
      ja: 'あなたのような忠誠はプログラムではない。毎日、自ら選ぶものだ。'
    }
  },
  'lunar-drifter': {
    key: 'tidal-recall',
    codename: 'TIDAL RECALL',
    name: { en: 'Tidal Recall', zh: '潮汐回響', ja: '潮汐の残響' },
    element: 'TIDE',
    color: '#94a3b8',
    cost: 3,
    fx: 'tide',
    effect: { kind: 'bounce', draw: 1 },
    desc: {
      en: "Pull the enemy's strongest unit back into their hand, then draw a card.",
      zh: '將敵方最強機體拉回其手牌，然後抽一張卡。',
      ja: '敵の最強ユニットを手札へ引き戻し、カードを1枚引く。'
    },
    flavor: {
      en: 'You keep the frequencies of people who have long stopped transmitting.',
      zh: '你收藏著那些早已停止傳訊之人的頻率。',
      ja: 'とうに送信をやめた者たちの周波数を守り続ける。'
    }
  },
  'solar-vanguard': {
    key: 'ignition-charge',
    codename: 'IGNITION CHARGE',
    name: { en: 'Ignition Charge', zh: '點火衝鋒', ja: '点火突撃' },
    element: 'FLARE',
    color: '#f59e0b',
    cost: 3,
    fx: 'flare',
    effect: { kind: 'burnFace', damage: 5, grantRush: true },
    desc: {
      en: 'Burn the enemy core for 5 damage and gain RUSH.',
      zh: '對敵方本體造成 5 點灼燒傷害，並獲得「突襲」。',
      ja: '敵コアに5ダメージを焼き付け、「突撃」を得る。'
    },
    flavor: {
      en: 'The dark is afraid of exactly one thing, and today it is wearing your face.',
      zh: '黑暗只懼怕一樣東西，而今天，它披著你的臉。',
      ja: '闇が恐れるものはただ一つ、今日それはあなたの顔をしている。'
    }
  }
};

export const ART_LIST = Object.keys(ARTS).map((k) => ({ archetype: k, ...ARTS[k] }));

// ---- element counter ring --------------------------------------------------
// Eight elements, each strong against exactly one other. Clean, learnable,
// and every archetype has exactly one hunter and one prey.
export const ELEMENT_RING = {
  CRYO: 'IGNIS',
  IGNIS: 'AETHER',
  AETHER: 'TIDE',
  TIDE: 'FLARE',
  FLARE: 'GRAVITY',
  GRAVITY: 'PLASMA',
  PLASMA: 'RADIANT',
  RADIANT: 'CRYO'
};

export const ELEMENT_ADVANTAGE = 1.5;

// Localized element names for the codex / battle HUD.
export const ELEMENT_LABEL = {
  CRYO:    { en: 'CRYO',    zh: '極凍', ja: '極寒' },
  PLASMA:  { en: 'PLASMA',  zh: '烈焰', ja: 'プラズマ' },
  GRAVITY: { en: 'GRAVITY', zh: '重力', ja: '重力' },
  RADIANT: { en: 'RADIANT', zh: '輝耀', ja: '輝光' },
  AETHER:  { en: 'AETHER',  zh: '以太', ja: 'エーテル' },
  IGNIS:   { en: 'IGNIS',   zh: '赤火', ja: '烈火' },
  TIDE:    { en: 'TIDE',    zh: '潮汐', ja: '潮汐' },
  FLARE:   { en: 'FLARE',   zh: '日炎', ja: 'フレア' }
};

export function beats(attackerEl, defenderEl) {
  return !!attackerEl && ELEMENT_RING[attackerEl] === defenderEl;
}

// Resolve which art a card uses. Built-in archetypes map by key; Supabase
// characters map by matching their energy_core to an element, else by a stable
// hash of their id so the same character always carries the same art.
export function artForCard(archetypeKey, elementRaw) {
  if (ARTS[archetypeKey]) return ARTS[archetypeKey];
  const el = (elementRaw || '').toString().trim().toUpperCase();
  const byElement = ART_LIST.find((a) => a.element === el);
  if (byElement) return byElement;
  let h = 0;
  const s = String(archetypeKey || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ART_LIST[h % ART_LIST.length];
}
