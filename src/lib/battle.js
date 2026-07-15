// Neura Arena — battle engine.
//
// Pure logic, no React, no DOM. Every exported action MUTATES the state object
// it is handed and appends to `s.events`; the page clones state before each
// action, so state must stay structuredClone-safe (data only, no functions).
//
// Cards are built from the oracle archetypes + rarity system, so a UR pull in
// /gacha and a UR unit in /battle are literally the same shape.

import { ARCHETYPES, RARITIES, RARITY_BY_KEY } from './oracle.js';
import { ARTS, artForCard, beats, ELEMENT_ADVANTAGE } from './arts.js';

export const HERO_HP = 30;
export const BOARD_MAX = 5;
export const HAND_MAX = 8;
export const DECK_SIZE = 20;
export const MANA_MAX = 10;
// Compensation for the seat that moves second (the rival). Moving first is a
// compounding edge here: the opener picks every trade first, so survivors pile
// up and the board snowballs. Tuned by mirror simulation — identical AI in both
// seats, 600 games per setting (±3pp run-to-run, so treat these as approximate):
//   surge off      → opener wins ~80%   (degenerate)
//   1 turn  x +1   → ~73%
//   2 turns x +1   → ~57%   ← chosen: close to a real card game's opener edge
//   3 turns x +1   → ~50%
//   3 turns x +2   → ~23%   (over-corrected)
// The player always takes the first seat, so a slight opener edge is intended.
export const SURGE_TURNS = 2;
export const SURGE_AMOUNT = 1;

export const SIDES = ['you', 'foe'];
export const other = (side) => (side === 'you' ? 'foe' : 'you');

// ---- keywords --------------------------------------------------------------
export const KEYWORDS = {
  GUARD: { en: 'GUARD',  zh: '守衛', ja: '守護',
    desc: { en: 'Enemies must attack this unit first.', zh: '敵方必須優先攻擊此機體。', ja: '敵はこのユニットを優先して攻撃。' } },
  RUSH:  { en: 'RUSH',   zh: '突襲', ja: '突撃',
    desc: { en: 'Can attack the turn it is deployed.', zh: '部署當回合即可攻擊。', ja: '配置したターンから攻撃可能。' } },
  VEIL:  { en: 'VEIL',   zh: '匿蹤', ja: '隠密',
    desc: { en: 'Cannot be targeted until it attacks.', zh: '在攻擊前無法被指定為目標。', ja: '攻撃するまで対象にされない。' } }
};

// ---- base stat line per archetype -----------------------------------------
// Tuned so each archetype plays to its lore: the sentinel walls, the vanguard
// races, the drifter slips through. Rarity then scales the same silhouette up.
const BASE = {
  'frost-sovereign':  { cost: 4, atk: 3, hp: 5, keywords: [] },
  'nova-devotion':    { cost: 5, atk: 5, hp: 4, keywords: [] },
  'void-oracle':      { cost: 3, atk: 2, hp: 4, keywords: [] },
  'gilded-duelist':   { cost: 6, atk: 5, hp: 6, keywords: [] },
  'circuit-seraph':   { cost: 2, atk: 1, hp: 4, keywords: ['GUARD'] },
  'crimson-sentinel': { cost: 3, atk: 2, hp: 6, keywords: ['GUARD'] },
  'lunar-drifter':    { cost: 2, atk: 2, hp: 2, keywords: ['VEIL'] },
  'solar-vanguard':   { cost: 4, atk: 4, hp: 2, keywords: ['RUSH'] }
};
const FALLBACK_BASE = { cost: 3, atk: 3, hp: 3, keywords: [] };

// Rarity is the power dial: better body, sometimes a steeper cost.
const RARITY_MOD = {
  R:   { cost: 0, atk: 0, hp: 0 },
  SR:  { cost: 0, atk: 1, hp: 1 },
  SSR: { cost: 1, atk: 1, hp: 2 },
  UR:  { cost: 1, atk: 2, hp: 3 }
};

let _uid = 0;
const uid = (p) => `${p}-${++_uid}`;

function elementOf(archetype) {
  // Built-ins carry a localized element object; DB characters carry a raw string.
  const raw = archetype.element && typeof archetype.element === 'object'
    ? archetype.element.en
    : archetype.element;
  return (raw || '').toString().trim().toUpperCase();
}

// Build a playable card from an archetype/muse + a rarity.
export function makeCard(archetype, rarity) {
  const base = BASE[archetype.key] || FALLBACK_BASE;
  const mod = RARITY_MOD[rarity.key] || RARITY_MOD.R;
  const art = artForCard(archetype.key, elementOf(archetype));
  return {
    id: uid('c'),
    archetype,                       // full muse shape: name/color/image/video
    rarity: { key: rarity.key, color: rarity.color },
    cost: Math.max(1, base.cost + mod.cost),
    atk: Math.max(0, base.atk + mod.atk),
    hp: Math.max(1, base.hp + mod.hp),
    keywords: [...base.keywords],
    element: elementOf(archetype) || art.element,
    artKey: art.archetype ? art.archetype : archetypeKeyOfArt(art)
  };
}

// ARTS is keyed by archetype; artForCard may return an ART_LIST entry (which
// carries `.archetype`) or a raw ARTS value (which does not). Normalize.
function archetypeKeyOfArt(art) {
  const hit = Object.keys(ARTS).find((k) => ARTS[k].key === art.key);
  return hit || 'frost-sovereign';
}

export function artOf(card) {
  return ARTS[card.artKey] || ARTS['frost-sovereign'];
}

function rollRarity() {
  let roll = Math.random() * 100;
  for (const r of RARITIES) { if (roll < r.rate) return r; roll -= r.rate; }
  return RARITIES[0];
}

// A deck is DECK_SIZE cards drawn from the pool, each with its own rarity roll.
// `pool` = mapped Supabase characters; falls back to the built-in archetypes.
export function buildDeck(pool) {
  const list = pool && pool.length ? pool : ARCHETYPES;
  const deck = [];
  for (let i = 0; i < DECK_SIZE; i++) {
    const archetype = list[Math.floor(Math.random() * list.length)];
    deck.push(makeCard(archetype, rollRarity()));
  }
  return shuffle(deck);
}

function shuffle(a) {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---- state -----------------------------------------------------------------
export function newGame(pool) {
  const s = {
    turn: 1,
    active: 'you',
    winner: null,
    events: [],
    hero: { you: { hp: HERO_HP, shield: 0 }, foe: { hp: HERO_HP, shield: 0 } },
    // You open on 1 energy. The rival sits at 0 because endTurn() ramps it to 1
    // before its first turn — otherwise it would play turn one on 2 and stay a
    // full step ahead all game.
    mana: { you: { cur: 1, max: 1 }, foe: { cur: 0, max: 0 } },
    deck: { you: buildDeck(pool), foe: buildDeck(pool) },
    hand: { you: [], foe: [] },
    board: { you: [], foe: [] },
    fatigue: { you: 0, foe: 0 },
    // Going second is a whole tempo step down and one extra card does not pay
    // for it. The rival banks POWER SURGE: +1 energy on each of its first
    // SURGE_TURNS turns. Mirror-tested — see the balance note in newGame's docs.
    surge: 'foe',
    surgeLeft: SURGE_TURNS,
    log: []
  };
  for (let i = 0; i < 3; i++) draw(s, 'you');
  for (let i = 0; i < 4; i++) draw(s, 'foe');
  s.events = [];
  return s;
}

function ev(s, e) { s.events.push(e); }

function logLine(s, side, key, data) {
  s.log.unshift({ id: uid('l'), side, key, data });
  s.log = s.log.slice(0, 40);
}

export function draw(s, side) {
  const deck = s.deck[side];
  if (!deck.length) {
    // Fatigue: an empty deck bites, and bites harder every time.
    s.fatigue[side] += 1;
    damageHero(s, side, s.fatigue[side], { fatigue: true });
    ev(s, { type: 'fatigue', side, amount: s.fatigue[side] });
    logLine(s, side, 'fatigue', { n: s.fatigue[side] });
    return null;
  }
  const card = deck.shift();
  if (s.hand[side].length >= HAND_MAX) {
    ev(s, { type: 'burn', side, card });   // hand full → card burns
    logLine(s, side, 'burn', { name: card.archetype.codename });
    return null;
  }
  s.hand[side].push(card);
  ev(s, { type: 'draw', side, card });
  return card;
}

// ---- unit helpers ----------------------------------------------------------
function toUnit(card) {
  return {
    uid: uid('u'),
    card,
    atk: card.atk,
    hp: card.hp,
    maxHp: card.hp,
    keywords: [...card.keywords],
    element: card.element,
    sick: !card.keywords.includes('RUSH'),  // summoning sickness unless RUSH
    attacksLeft: card.keywords.includes('RUSH') ? 1 : 0,
    artUsed: false,
    frozen: false,
    shield: 0
  };
}

function findUnit(s, uidStr) {
  for (const side of SIDES) {
    const u = s.board[side].find((x) => x.uid === uidStr);
    if (u) return { unit: u, side };
  }
  return { unit: null, side: null };
}

export function hasGuard(s, side) {
  return s.board[side].some((u) => u.keywords.includes('GUARD') && !u.keywords.includes('VEIL'));
}

// Legal targets for an attacker: GUARD units wall off everything else, and
// VEIL units cannot be picked at all.
export function legalTargets(s, side) {
  const foe = other(side);
  const visible = s.board[foe].filter((u) => !u.keywords.includes('VEIL'));
  const guards = visible.filter((u) => u.keywords.includes('GUARD'));
  if (guards.length) return { units: guards, hero: false };
  return { units: visible, hero: true };
}

export function canAttack(s, side, u) {
  return s.active === side && !s.winner && !u.frozen && !u.sick && u.attacksLeft > 0 && u.atk > 0;
}

// ---- damage ----------------------------------------------------------------
function damageUnit(s, side, u, amount, meta) {
  if (amount <= 0) return;
  let left = amount;
  if (u.shield > 0) {
    const absorbed = Math.min(u.shield, left);
    u.shield -= absorbed;
    left -= absorbed;
    ev(s, { type: 'shield', side, uid: u.uid, amount: absorbed });
  }
  u.hp -= left;
  ev(s, { type: 'damage', side, uid: u.uid, amount, ...(meta || {}) });
}

function damageHero(s, side, amount, meta) {
  if (amount <= 0) return;
  const h = s.hero[side];
  let left = amount;
  if (h.shield > 0) {
    const absorbed = Math.min(h.shield, left);
    h.shield -= absorbed;
    left -= absorbed;
    ev(s, { type: 'shield', side, hero: true, amount: absorbed });
  }
  h.hp -= left;
  ev(s, { type: 'damage', side, hero: true, amount, ...(meta || {}) });
}

function reap(s) {
  for (const side of SIDES) {
    const dead = s.board[side].filter((u) => u.hp <= 0);
    dead.forEach((u) => {
      ev(s, { type: 'death', side, uid: u.uid, card: u.card });
      logLine(s, side, 'death', { name: u.card.archetype.codename });
    });
    s.board[side] = s.board[side].filter((u) => u.hp > 0);
  }
  checkWin(s);
}

function checkWin(s) {
  const youDead = s.hero.you.hp <= 0;
  const foeDead = s.hero.foe.hp <= 0;
  if (youDead || foeDead) {
    s.winner = youDead && foeDead ? 'draw' : youDead ? 'foe' : 'you';
    ev(s, { type: 'gameover', winner: s.winner });
  }
}

// ---- actions ---------------------------------------------------------------
export function playCard(s, side, cardId) {
  if (s.winner || s.active !== side) return false;
  const hand = s.hand[side];
  const i = hand.findIndex((c) => c.id === cardId);
  if (i < 0) return false;
  const card = hand[i];
  if (card.cost > s.mana[side].cur) return false;
  if (s.board[side].length >= BOARD_MAX) return false;

  s.mana[side].cur -= card.cost;
  hand.splice(i, 1);
  const unit = toUnit(card);
  s.board[side].push(unit);
  ev(s, { type: 'deploy', side, uid: unit.uid, card });
  logLine(s, side, 'deploy', { name: card.archetype.codename, rarity: card.rarity.key });
  return true;
}

export function attack(s, side, attackerUid, targetUid) {
  if (s.winner || s.active !== side) return false;
  const attacker = s.board[side].find((u) => u.uid === attackerUid);
  if (!attacker || !canAttack(s, side, attacker)) return false;

  const targets = legalTargets(s, side);
  const foe = other(side);

  // Attacking breaks VEIL — you cannot hide and swing in the same breath.
  const unveil = () => {
    if (attacker.keywords.includes('VEIL')) {
      attacker.keywords = attacker.keywords.filter((k) => k !== 'VEIL');
      ev(s, { type: 'unveil', side, uid: attacker.uid });
    }
  };

  if (targetUid === 'hero') {
    if (!targets.hero) return false;
    attacker.attacksLeft -= 1;
    unveil();
    const dmg = attacker.atk;
    ev(s, { type: 'attack', side, uid: attacker.uid, target: 'hero' });
    damageHero(s, foe, dmg);
    logLine(s, side, 'faceHit', { name: attacker.card.archetype.codename, dmg });
    reap(s);
    return true;
  }

  const target = targets.units.find((u) => u.uid === targetUid);
  if (!target) return false;

  attacker.attacksLeft -= 1;
  unveil();
  ev(s, { type: 'attack', side, uid: attacker.uid, target: target.uid });

  // Element ring: attacking into your prey multiplies the blow.
  const adv = beats(attacker.element, target.element);
  const dealt = Math.round(attacker.atk * (adv ? ELEMENT_ADVANTAGE : 1));
  const back = Math.round(target.atk * (beats(target.element, attacker.element) ? ELEMENT_ADVANTAGE : 1));
  if (adv) ev(s, { type: 'advantage', side, uid: attacker.uid, target: target.uid });

  damageUnit(s, foe, target, dealt, { adv });
  damageUnit(s, side, attacker, back);
  logLine(s, side, 'clash', {
    a: attacker.card.archetype.codename,
    b: target.card.archetype.codename,
    dmg: dealt, adv
  });
  reap(s);
  return true;
}

// ---- signature arts --------------------------------------------------------
export function canUseArt(s, side, u) {
  if (s.winner || s.active !== side) return false;
  if (u.artUsed || u.frozen) return false;
  return s.mana[side].cur >= artOf(u.card).cost;
}

export function useArt(s, side, unitUid) {
  const u = s.board[side].find((x) => x.uid === unitUid);
  if (!u || !canUseArt(s, side, u)) return false;
  const art = artOf(u.card);
  const foe = other(side);

  s.mana[side].cur -= art.cost;
  u.artUsed = true;
  ev(s, { type: 'art', side, uid: u.uid, art: art.key, fx: art.fx, color: art.color, codename: art.codename });
  logLine(s, side, 'art', { name: art.codename, unit: u.card.archetype.codename });

  const e = art.effect;
  switch (e.kind) {
    case 'freezeAll': {
      s.board[foe].forEach((t) => {
        t.frozen = true;
        damageUnit(s, foe, t, e.damage);
      });
      break;
    }
    case 'aoe': {
      s.board[foe].forEach((t) => damageUnit(s, foe, t, e.damage));
      damageUnit(s, side, u, e.selfDamage);
      break;
    }
    case 'collapseStrongest': {
      const t = strongest(s.board[foe]);
      if (t) {
        const lost = t.atk;
        t.atk = 0;
        damageUnit(s, foe, t, lost);
        ev(s, { type: 'collapse', side: foe, uid: t.uid });
      }
      break;
    }
    case 'buffSelf': {
      u.atk += e.atk;
      u.maxHp += e.hp;
      u.hp += e.hp;
      if (e.refreshAttack) { u.attacksLeft = Math.max(u.attacksLeft, 1); u.sick = false; }
      break;
    }
    case 'support': {
      s.hero[side].hp = Math.min(HERO_HP, s.hero[side].hp + e.heroHeal);
      ev(s, { type: 'heal', side, hero: true, amount: e.heroHeal });
      s.board[side].forEach((t) => { t.maxHp += e.allyHp; t.hp += e.allyHp; });
      break;
    }
    case 'fortify': {
      u.shield += e.shield;
      if (e.grantGuard) {
        s.board[side].forEach((t) => {
          if (!t.keywords.includes('GUARD')) t.keywords.push('GUARD');
        });
      }
      break;
    }
    case 'bounce': {
      const t = strongest(s.board[foe]);
      if (t) {
        s.board[foe] = s.board[foe].filter((x) => x.uid !== t.uid);
        if (s.hand[foe].length < HAND_MAX) s.hand[foe].push(t.card);
        ev(s, { type: 'bounce', side: foe, uid: t.uid });
      }
      for (let i = 0; i < e.draw; i++) draw(s, side);
      break;
    }
    case 'burnFace': {
      damageHero(s, foe, e.damage);
      if (e.grantRush && !u.keywords.includes('RUSH')) {
        u.keywords.push('RUSH');
        u.sick = false;
        u.attacksLeft = Math.max(u.attacksLeft, 1);
      }
      break;
    }
    default: break;
  }
  reap(s);
  return true;
}

function strongest(units) {
  const visible = units.filter((u) => !u.keywords.includes('VEIL'));
  if (!visible.length) return null;
  return visible.reduce((best, u) => (u.atk > best.atk ? u : best), visible[0]);
}

// ---- turn flow -------------------------------------------------------------
export function endTurn(s) {
  if (s.winner) return s;

  // Thaw the side that is LEAVING, not the one arriving: a unit frozen during
  // my turn has to sit through its own next turn before it melts. Thawing the
  // arriving side instead made ABSOLUTE ZERO a no-op — it would clear before
  // the victim had missed a single swing.
  s.board[s.active].forEach((u) => { u.frozen = false; });

  const next = other(s.active);
  s.active = next;
  if (next === 'you') s.turn += 1;

  // Ramp mana, refill, thaw, clear sickness, restore attacks.
  const m = s.mana[next];
  m.max = Math.min(MANA_MAX, m.max + 1);
  m.cur = m.max;
  if (next === s.surge && s.surgeLeft > 0) {
    s.surgeLeft -= 1;
    m.cur += SURGE_AMOUNT;
    ev(s, { type: 'surge', side: next });
    logLine(s, next, 'surge', {});
  }
  s.board[next].forEach((u) => {
    u.sick = false;
    u.attacksLeft = 1;   // canAttack() still gates on u.frozen
  });
  draw(s, next);
  ev(s, { type: 'turn', side: next, turn: s.turn });
  reap(s);
  return s;
}

// ---- AI --------------------------------------------------------------------
// Greedy but not stupid: it curves out, fires arts when they pay off, takes
// favourable trades using the element ring, and goes face when nothing walls it.
export function aiTurn(s, side = 'foe') {
  if (s.winner || s.active !== side) return s;
  const me = side, you = other(side);

  // 1. Deploy — biggest affordable body first.
  let guard = 0;
  while (guard++ < 12) {
    if (s.board[me].length >= BOARD_MAX) break;
    const playable = s.hand[me]
      .filter((c) => c.cost <= s.mana[me].cur)
      .sort((a, b) => b.cost - a.cost);
    if (!playable.length) break;
    // Keep a little mana back for a cheap art if one is already on board.
    if (!playCard(s, me, playable[0].id)) break;
  }

  // 2. Arts — fire anything whose effect is live right now.
  for (const u of [...s.board[me]]) {
    if (!canUseArt(s, me, u)) continue;
    const art = artOf(u.card);
    const enemies = s.board[you].filter((x) => !x.keywords.includes('VEIL'));
    const k = art.effect.kind;
    const worth =
      (k === 'freezeAll' || k === 'aoe') ? enemies.length >= 2 :
      (k === 'collapseStrongest' || k === 'bounce') ? enemies.some((x) => x.atk >= 3) :
      (k === 'support') ? s.hero[me].hp <= HERO_HP - 6 :
      (k === 'fortify') ? enemies.length >= 1 :
      true; // buffSelf / burnFace are always fine
    if (worth) useArt(s, me, u.uid);
    if (s.winner) return s;
  }

  // 3. Attacks — kill what we can trade up into, else swing face.
  for (const u of [...s.board[me]]) {
    if (s.winner) break;
    if (!canAttack(s, me, u)) continue;
    const t = legalTargets(s, me);

    // Lethal on the core beats everything else.
    if (t.hero && s.hero[you].hp <= u.atk) { attack(s, me, u.uid, 'hero'); break; }

    // Prefer a kill we survive; element advantage counts toward the kill math.
    const kills = t.units
      .map((x) => {
        const dmg = Math.round(u.atk * (beats(u.element, x.element) ? ELEMENT_ADVANTAGE : 1));
        const back = Math.round(x.atk * (beats(x.element, u.element) ? ELEMENT_ADVANTAGE : 1));
        return { x, kill: dmg >= x.hp + x.shield, survive: back < u.hp + u.shield, value: x.atk + x.hp };
      })
      .filter((o) => o.kill)
      .sort((a, b) => (b.survive - a.survive) || (b.value - a.value));

    if (kills.length) attack(s, me, u.uid, kills[0].x.uid);
    else if (t.hero) attack(s, me, u.uid, 'hero');
    else if (t.units.length) {
      // Walled in: chip the guard with the least value lost.
      const cheapest = [...t.units].sort((a, b) => (a.atk + a.hp) - (b.atk + b.hp))[0];
      attack(s, me, u.uid, cheapest.uid);
    }
  }

  if (!s.winner) endTurn(s);
  return s;
}

export function clone(s) {
  return typeof structuredClone === 'function'
    ? structuredClone(s)
    : JSON.parse(JSON.stringify(s));
}
