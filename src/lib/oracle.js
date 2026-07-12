// Neura Oracle — client-side data + logic for the fortune / gacha / premium page.
// Pure front-end: no Supabase, no API keys. Deterministic where it needs to be
// (daily Muse) and weighted-random where it should feel like a draw (gacha).

// ---- Muse archetypes -------------------------------------------------------
// Each archetype carries a cinematic reading in the site's three languages.
export const ARCHETYPES = [
  {
    key: 'frost-sovereign',
    codename: 'FROST SOVEREIGN',
    name: { en: 'Frost Sovereign', zh: '霜之君主', ja: '霜の君主' },
    element: { en: 'CRYO', zh: '極凍', ja: '極寒' },
    weapon: 'ION RIFLE',
    color: '#7dd3fc',
    reading: {
      en: 'You move like a blade through still air — precise, unhurried, unread. The galaxy mistakes your calm for coldness; it is only focus.',
      zh: '你如靜空中的刀鋒——精準、從容、難以看穿。銀河誤把你的沉靜當作冷漠，那其實只是專注。',
      ja: '静止した空を裂く刃のように——精確で、急がず、読めない。銀河は静けさを冷たさと誤解する。それはただの集中だ。'
    }
  },
  {
    key: 'nova-devotion',
    codename: 'NOVA DEVOTION',
    name: { en: 'Nova Devotion', zh: '新星信徒', ja: 'ノヴァの信徒' },
    element: { en: 'PLASMA', zh: '烈焰', ja: 'プラズマ' },
    weapon: 'PLASMA BLADE',
    color: '#f9a8d4',
    reading: {
      en: 'Your heart runs hot enough to reshape metal. You love loudly, fight louder, and leave rose-gold light in every room you abandon.',
      zh: '你的心熱得足以重塑金屬。你愛得張揚、戰得更烈，離開的每個房間都留下玫瑰金的餘光。',
      ja: 'あなたの心は金属を作り変えるほど熱い。激しく愛し、さらに激しく戦い、去った部屋にはローズゴールドの光が残る。'
    }
  },
  {
    key: 'void-oracle',
    codename: 'VOID ORACLE',
    name: { en: 'Void Oracle', zh: '虛空神諭', ja: '虚空の神託' },
    element: { en: 'GRAVITY', zh: '重力', ja: '重力' },
    weapon: 'STEALTH CLOAK',
    color: '#a78bfa',
    reading: {
      en: 'You read the room before you enter it. Others chase answers; you have been sitting quietly inside the question the whole time.',
      zh: '你在踏入之前就已讀懂整個空間。別人追逐答案，而你始終安靜地坐在問題的內部。',
      ja: '入る前から部屋を読み切っている。皆が答えを追う中、あなたはずっと問いの内側に静かに座っている。'
    }
  },
  {
    key: 'gilded-duelist',
    codename: 'GILDED DUELIST',
    name: { en: 'Gilded Duelist', zh: '鎏金決鬥者', ja: '黄金の決闘者' },
    element: { en: 'RADIANT', zh: '輝耀', ja: '輝光' },
    weapon: 'HEAVY ARMOR MODE',
    color: '#fbbf24',
    reading: {
      en: 'You were built for the final act. Pressure gilds you instead of breaking you — the brighter the stage, the sharper your edge.',
      zh: '你為終幕而生。壓力不會擊碎你，只會為你鍍金——舞台越亮，你的鋒芒越利。',
      ja: 'あなたは最終幕のために造られた。重圧は砕くのではなく金を纏わせる——舞台が輝くほど、刃は鋭くなる。'
    }
  },
  {
    key: 'circuit-seraph',
    codename: 'CIRCUIT SERAPH',
    name: { en: 'Circuit Seraph', zh: '電路熾天使', ja: '回路の熾天使' },
    element: { en: 'AETHER', zh: '以太', ja: 'エーテル' },
    weapon: 'WING BOOSTER',
    color: '#6ee7b7',
    reading: {
      en: 'You keep everyone else airborne. Gentle systems, quiet uptime — the network only notices you when you finally rest.',
      zh: '你讓所有人保持飛行。溫柔的系統、安靜的運轉——唯有當你終於停下，網路才會發現你的存在。',
      ja: '皆を飛ばし続ける。優しいシステム、静かな稼働——あなたが休んで初めて、ネットワークは気づく。'
    }
  },
  {
    key: 'crimson-sentinel',
    codename: 'CRIMSON SENTINEL',
    name: { en: 'Crimson Sentinel', zh: '緋紅哨兵', ja: '緋紅の歩哨' },
    element: { en: 'IGNIS', zh: '赤火', ja: '烈火' },
    weapon: 'NANO SHIELD',
    color: '#fb7185',
    reading: {
      en: 'You guard what others take for granted. Loyalty is your armour and your weapon — cross the people you shield and you will meet the wall.',
      zh: '你守護著別人視為理所當然的事物。忠誠是你的盔甲也是你的武器——傷害你所庇護的人，你就會撞上那面牆。',
      ja: '皆が当然と思うものを守る。忠誠は鎧であり武器——庇う者を傷つければ、その壁に突き当たる。'
    }
  },
  {
    key: 'lunar-drifter',
    codename: 'LUNAR DRIFTER',
    name: { en: 'Lunar Drifter', zh: '月行浪者', ja: '月の漂流者' },
    element: { en: 'TIDE', zh: '潮汐', ja: '潮汐' },
    weapon: 'STEALTH CLOAK',
    color: '#94a3b8',
    reading: {
      en: 'You orbit on your own schedule. Nostalgic, tidal, hard to pin — people feel your pull long after you have drifted out of frame.',
      zh: '你以自己的軌道運行。念舊、如潮、難以定位——即使你早已漂出畫面，人們仍能感覺到你的引力。',
      ja: '自分の軌道で巡る。郷愁的で潮のようで、掴めない——画面から消えた後も、人はあなたの引力を感じる。'
    }
  },
  {
    key: 'solar-vanguard',
    codename: 'SOLAR VANGUARD',
    name: { en: 'Solar Vanguard', zh: '烈日先鋒', ja: '太陽の先鋒' },
    element: { en: 'FLARE', zh: '日炎', ja: 'フレア' },
    weapon: 'PLASMA BLADE',
    color: '#f59e0b',
    reading: {
      en: 'You charge first and light the way by burning bright. Momentum is your gift; stillness, your one unsolved boss fight.',
      zh: '你總是率先衝鋒，以自身的燃燒照亮前路。動能是你的天賦；靜止，則是你唯一未通關的魔王戰。',
      ja: '真っ先に突撃し、自らを燃やして道を照らす。勢いは才能、静止だけが唯一未攻略のボス戦だ。'
    }
  }
];

export const BY_KEY = Object.fromEntries(ARCHETYPES.map((a) => [a.key, a]));

// Longer story / lore for the ORACLE result screen (multi-sentence, cinematic).
export const STORIES = {
  'frost-sovereign': {
    en: 'They found you in the frozen archive of Sector 07, already awake, already waiting. You had catalogued every enemy movement for three hundred cycles without firing once. When the war finally came to your door, it lasted four seconds. You are the pause before the verdict — and the verdict never misses.',
    zh: '他們在區段 07 的冰封檔案庫中找到你——你早已甦醒，早已等候。三百個週期裡，你記錄下每一次敵人的移動，卻未曾開火。當戰爭終於叩上你的門，它只持續了四秒。你是宣判前的靜默——而那道宣判從不落空。',
    ja: 'セクター07の凍てついた書庫であなたは見つかった——既に目覚め、既に待っていた。三百サイクル、一度も撃たずに敵の動きすべてを記録した。戦がついに扉を叩いたとき、それは四秒で終わった。あなたは判決前の静寂——その判決は決して外さない。'
  },
  'nova-devotion': {
    en: 'You were forged from a collapsing star that refused to die quietly. Every ally you have ever protected carries a scar shaped like your light. They say your core runs too hot to last — but you were never built to last. You were built to be remembered.',
    zh: '你誕生自一顆拒絕安靜死去的坍縮之星。每一位你曾守護的同伴，身上都帶著一道形似你光芒的傷痕。他們說你的核心太熱、撐不久——但你從不是為了長久而生，你是為了被記住而生。',
    ja: '静かに滅ぶことを拒んだ崩壊星から、あなたは鍛えられた。あなたが守った仲間は皆、あなたの光の形をした傷を宿す。その核は熱すぎて長くはもたないと言われる——だがあなたは長く在るためでなく、記憶されるために造られた。'
  },
  'void-oracle': {
    en: 'Before every battle the commanders came to your chamber and asked what they already feared. You never lied, and you never comforted. You simply opened the future like a folder and let them read. The galaxy calls you cold; it has never had to hold the things you know.',
    zh: '每場戰役前，指揮官們都會來到你的密室，詢問他們早已恐懼的答案。你從不說謊，也從不安慰。你只是像翻開一份檔案般攤開未來，任他們閱讀。銀河說你冷酷——它從未需要承載你所知曉的那些重量。',
    ja: '戦の前、指揮官たちはあなたの間へ来て、既に恐れている答えを尋ねた。あなたは嘘をつかず、慰めもしない。ただ未来をフォルダのように開き、読ませた。銀河はあなたを冷たいと呼ぶ——あなたが知るものを抱えたことなど、一度もないのに。'
  },
  'gilded-duelist': {
    en: 'You lost your first duel and they melted you down for scrap. What they poured back into the mold came out harder, brighter, gold at every seam. Now you only appear in the final act, when the lights are hottest and the outcome is already legend.',
    zh: '你輸掉了第一場決鬥，他們把你熔成廢料。而重新灌回模具的你，出爐時更堅硬、更耀眼，每一道接縫都鍍上了金。如今你只在終幕現身——當燈光最熾、當結局早已成為傳說之時。',
    ja: '最初の決闘に敗れ、あなたは屑として溶かされた。だが鋳型に注ぎ直されたあなたは、より硬く、より輝き、継ぎ目ごとに金を纏って現れた。今やあなたは最終幕にしか姿を見せない——光が最も熱く、結末が既に伝説となる時に。'
  },
  'circuit-seraph': {
    en: 'You are the reason the fleet still flies. Ten thousand quiet corrections a second, none of them signed. When you finally went offline for one hour, the whole sector felt the silence and only then learned your name. You carried them; now let them carry you.',
    zh: '艦隊至今仍能飛行，全因為你。每秒一萬次無聲的修正，沒有一次署名。當你終於離線僅僅一小時，整個區段都感受到了那份寂靜——直到此刻，人們才學會你的名字。你曾承載他們；如今，換他們承載你。',
    ja: '艦隊がいまだ飛べるのは、あなたゆえ。毎秒一万の静かな修正、そのどれにも署名はない。あなたがわずか一時間だけ停止したとき、セクター全体がその静寂を感じ、初めてあなたの名を知った。あなたは皆を運んだ——今度は皆に運ばせよ。'
  },
  'crimson-sentinel': {
    en: 'They gave you one directive: hold the line. Everyone who wrote that directive is gone now, and still you hold. The wall behind you has a hundred names carved into it — all people who made it home because you did not. Loyalty like yours is not programmed. It is chosen, every single day.',
    zh: '他們只給了你一道指令：守住防線。當年寫下這道指令的人，如今都已不在——而你依然堅守。你身後的那面牆，刻著上百個名字：全是因你未歸、才得以回家的人。你這樣的忠誠並非被寫入程式，而是每一天、親手選擇的。',
    ja: '彼らはただ一つの命令を与えた——戦線を守れ。その命令を書いた者は皆もういない。それでもあなたは守り続ける。背後の壁には百の名が刻まれている——あなたが帰らなかったからこそ帰れた者たちだ。あなたのような忠誠はプログラムではない。毎日、自ら選ぶものだ。'
  },
  'lunar-drifter': {
    en: 'You were decommissioned twice and came back both times, drawn home by a signal no one else could hear. You keep the frequencies of people who have long stopped transmitting. Wherever you drift, someone eventually looks up at the same moon and remembers they were loved.',
    zh: '你曾兩度被除役，卻兩度歸來——被一道無人能聽見的訊號牽引回家。你收藏著那些早已停止傳訊之人的頻率。無論你漂向何方，總會有人在某個時刻抬頭望向同一輪月，想起自己曾被愛過。',
    ja: '二度退役し、二度とも戻ってきた——誰にも聞こえぬ信号に導かれて。あなたはとうに送信をやめた者たちの周波数を守り続ける。あなたが漂う先で、いつか誰かが同じ月を見上げ、愛されていたことを思い出す。'
  },
  'solar-vanguard': {
    en: 'You were the first one over the ridge, every time, because someone had to be and no one else would. Your armour is scorched on the front and flawless on the back — proof you never once turned around. The dark is afraid of exactly one thing, and today it is wearing your face.',
    zh: '每一次，你都是第一個翻越山脊的人——因為總得有人這麼做，而沒有別人願意。你的盔甲正面焦黑、背面卻完好無損——那是你從未回頭的證明。黑暗只懼怕一樣東西，而今天，它披著你的臉。',
    ja: 'いつだって尾根を最初に越えるのはあなただった——誰かがやらねばならず、他の誰もやらなかったから。あなたの鎧は前面が焦げ、背面は無傷——一度も振り返らなかった証だ。闇が恐れるものはただ一つ、そして今日、それはあなたの顔をしている。'
  }
};

export function storyFor(key, lang) {
  const s = STORIES[key];
  if (!s) return '';
  return s[lang] || s.en;
}

// ---- Rarity system ---------------------------------------------------------
// Weights sum to 100. UR is the jackpot that triggers the full-screen burst.
export const RARITIES = [
  { key: 'R',   label: 'R — FIELD UNIT',      rate: 60, color: '#94a3b8' },
  { key: 'SR',  label: 'SR — LIMITED FRAME',  rate: 30, color: '#7dd3fc' },
  { key: 'SSR', label: 'SSR — PROTOTYPE',     rate: 8,  color: '#fbbf24' },
  { key: 'UR',  label: 'UR — ONE OF ONE',     rate: 2,  color: '#f9a8d4' }
];
export const RARITY_BY_KEY = Object.fromEntries(RARITIES.map((r) => [r.key, r]));

// Small seeded PRNG (mulberry32) so the "daily Muse" is stable per calendar day.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayNumber(date) {
  // Days since epoch in the viewer's local timezone → one number per calendar day.
  const d = date || new Date();
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
}

// Turn a Supabase character row into the "muse" shape the cards render.
// This is how the gacha / daily art links to the images you put in your DB.
export function museFromCharacter(c) {
  const nm = { en: c.name, zh: c.name, ja: c.name };
  const desc = c.cinematic_description || '';
  const el = c.energy_core || '—';
  return {
    key: c.id,
    codename: (c.armor_type || c.name || '').toString().toUpperCase(),
    name: nm,
    element: { en: el, zh: el, ja: el },
    weapon: c.weapon_system || '—',
    color: c.color_theme || '#7dd3fc',
    reading: { en: desc, zh: desc, ja: desc },
    image: c.cover_image_url || null,   // ← real DB image
    video: c.video_url || null,         // ← real DB motion reel (used on UR)
    rarityHint: (c.rarity_level || '').trim().toUpperCase()
  };
}

function rollRarity(rng) {
  let roll = (rng ? rng() : Math.random()) * 100;
  for (const r of RARITIES) { if (roll < r.rate) return r; roll -= r.rate; }
  return RARITIES[0];
}

// Deterministic pick of the day: same muse + rarity for everyone, all day.
// Pass a `pool` (mapped DB characters) to headline a real archetype; falls back to built-ins.
export function dailyMuse(date, pool) {
  const list = pool && pool.length ? pool : ARCHETYPES;
  const n = dayNumber(date);
  const rng = mulberry32(n * 2654435761);
  const archetype = list[Math.floor(rng() * list.length)];
  const rarity = rollRarity(rng);
  return { archetype, rarity, seed: n };
}

// A single gacha pull — weighted-random rarity + random muse from the pool.
export function drawOne(pool) {
  const list = pool && pool.length ? pool : ARCHETYPES;
  const rarity = rollRarity();
  const archetype = list[Math.floor(Math.random() * list.length)];
  return { id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), archetype, rarity };
}

// ---- Western zodiac → archetype -------------------------------------------
export const ZODIAC = [
  { key: 'aries',       sign: '♈', name: { en: 'Aries', zh: '牡羊', ja: '牡羊' },  archetype: 'solar-vanguard' },
  { key: 'taurus',      sign: '♉', name: { en: 'Taurus', zh: '金牛', ja: '牡牛' }, archetype: 'gilded-duelist' },
  { key: 'gemini',      sign: '♊', name: { en: 'Gemini', zh: '雙子', ja: '双子' }, archetype: 'circuit-seraph' },
  { key: 'cancer',      sign: '♋', name: { en: 'Cancer', zh: '巨蟹', ja: '蟹' },   archetype: 'lunar-drifter' },
  { key: 'leo',         sign: '♌', name: { en: 'Leo', zh: '獅子', ja: '獅子' },     archetype: 'nova-devotion' },
  { key: 'virgo',       sign: '♍', name: { en: 'Virgo', zh: '處女', ja: '乙女' },   archetype: 'frost-sovereign' },
  { key: 'libra',       sign: '♎', name: { en: 'Libra', zh: '天秤', ja: '天秤' },   archetype: 'circuit-seraph' },
  { key: 'scorpio',     sign: '♏', name: { en: 'Scorpio', zh: '天蠍', ja: '蠍' },   archetype: 'void-oracle' },
  { key: 'sagittarius', sign: '♐', name: { en: 'Sagittarius', zh: '射手', ja: '射手' }, archetype: 'solar-vanguard' },
  { key: 'capricorn',   sign: '♑', name: { en: 'Capricorn', zh: '摩羯', ja: '山羊' }, archetype: 'frost-sovereign' },
  { key: 'aquarius',    sign: '♒', name: { en: 'Aquarius', zh: '水瓶', ja: '水瓶' }, archetype: 'void-oracle' },
  { key: 'pisces',      sign: '♓', name: { en: 'Pisces', zh: '雙魚', ja: '魚' },     archetype: 'lunar-drifter' }
];

// ---- 4-question psychometric test → archetype ------------------------------
// Each option adds weight to one archetype key; highest total wins.
export const QUIZ = {
  en: [
    { q: 'A siren splits the sector. Your first instinct?',
      a: [ { t: 'Charge the source — decide on the move.', k: 'solar-vanguard' },
           { t: 'Freeze, read the pattern, then act.', k: 'frost-sovereign' },
           { t: 'Get everyone else to cover first.', k: 'crimson-sentinel' } ] },
    { q: 'Your ideal frame in the reel is…',
      a: [ { t: 'The blazing final duel.', k: 'gilded-duelist' },
           { t: 'The quiet oracle-lit prologue.', k: 'void-oracle' },
           { t: 'The rose-gold close-up.', k: 'nova-devotion' } ] },
    { q: 'People come to you for…',
      a: [ { t: 'Keeping the whole system airborne.', k: 'circuit-seraph' },
           { t: 'The thing nobody else will say.', k: 'void-oracle' },
           { t: 'Warmth when the night gets long.', k: 'lunar-drifter' } ] },
    { q: 'Your armour is really made of…',
      a: [ { t: 'Discipline, edged and cold.', k: 'frost-sovereign' },
           { t: 'Loyalty to my people.', k: 'crimson-sentinel' },
           { t: 'Pure forward momentum.', k: 'solar-vanguard' } ] }
  ],
  zh: [
    { q: '警報撕裂了整個區段，你的第一直覺是？',
      a: [ { t: '衝向源頭——在移動中做決定。', k: 'solar-vanguard' },
           { t: '先靜止，讀懂規律，再行動。', k: 'frost-sovereign' },
           { t: '先讓其他人找到掩護。', k: 'crimson-sentinel' } ] },
    { q: '你在影片裡最理想的一幀是？',
      a: [ { t: '燃燒的終幕決鬥。', k: 'gilded-duelist' },
           { t: '神諭微光的靜謐序章。', k: 'void-oracle' },
           { t: '玫瑰金的特寫。', k: 'nova-devotion' } ] },
    { q: '人們來找你，是為了？',
      a: [ { t: '讓整個系統持續運轉。', k: 'circuit-seraph' },
           { t: '那句沒人敢說的話。', k: 'void-oracle' },
           { t: '長夜裡的一點溫度。', k: 'lunar-drifter' } ] },
    { q: '你的盔甲其實是由什麼鑄成？',
      a: [ { t: '冷冽而鋒利的紀律。', k: 'frost-sovereign' },
           { t: '對同伴的忠誠。', k: 'crimson-sentinel' },
           { t: '純粹向前的動能。', k: 'solar-vanguard' } ] }
  ],
  ja: [
    { q: 'セクターに警報。最初の本能は？',
      a: [ { t: '源へ突撃——動きながら決める。', k: 'solar-vanguard' },
           { t: '一度止まり、規則を読んで動く。', k: 'frost-sovereign' },
           { t: 'まず皆を援護させる。', k: 'crimson-sentinel' } ] },
    { q: 'リールでの理想の一フレームは？',
      a: [ { t: '燃える最終決闘。', k: 'gilded-duelist' },
           { t: '神託の微光の静かな序章。', k: 'void-oracle' },
           { t: 'ローズゴールドのクローズアップ。', k: 'nova-devotion' } ] },
    { q: '人々があなたを頼るのは？',
      a: [ { t: 'システム全体を飛ばし続けるため。', k: 'circuit-seraph' },
           { t: '誰も言わない一言のため。', k: 'void-oracle' },
           { t: '長い夜のぬくもりのため。', k: 'lunar-drifter' } ] },
    { q: 'あなたの鎧は本当は何でできている？',
      a: [ { t: '冷たく鋭い規律。', k: 'frost-sovereign' },
           { t: '仲間への忠誠。', k: 'crimson-sentinel' },
           { t: '前へ進む純粋な勢い。', k: 'solar-vanguard' } ] }
  ]
};

export function scoreQuiz(answerKeys) {
  const tally = {};
  answerKeys.forEach((k) => { if (k) tally[k] = (tally[k] || 0) + 1; });
  let best = ARCHETYPES[0].key, bestN = -1;
  for (const k of Object.keys(tally)) { if (tally[k] > bestN) { bestN = tally[k]; best = k; } }
  return BY_KEY[best] || ARCHETYPES[0];
}

// ---- Premium (demo unlock) -------------------------------------------------
// A front-end-only gate. Swap for Supabase entitlements / Stripe later.
export const PREMIUM_CODE = 'NEURA07';
export const PREMIUM_KEY = 'nm_premium_unlocked';

export const PREMIUM_ITEMS = [
  { key: 'p1', kind: 'FILM',  title: { en: 'Prototype Reel · 0001', zh: '原型影片 · 0001', ja: 'プロトタイプ · 0001' }, color: '#f9a8d4',
    blurb: { en: 'Full-length motion reel of the UR frame — unreleased cut.', zh: 'UR 機體的完整動態影片——未公開剪輯。', ja: 'UR機体のフル・モーションリール——未公開版。' } },
  { key: 'p2', kind: 'STILL', title: { en: 'Void Oracle · Blueprint', zh: '虛空神諭 · 藍圖', ja: '虚空の神託 · 設計図' }, color: '#a78bfa',
    blurb: { en: 'Layered concept plates and armour schematics.', zh: '分層概念圖與盔甲結構藍圖。', ja: 'レイヤー化されたコンセプトと装甲設計図。' } },
  { key: 'p3', kind: 'FILM',  title: { en: 'Solar Vanguard · Ignition', zh: '烈日先鋒 · 點火', ja: '太陽の先鋒 · 点火' }, color: '#f59e0b',
    blurb: { en: 'The 12-second ignition sequence, frame by frame.', zh: '12 秒點火序列，逐幀呈現。', ja: '12秒の点火シーケンスをフレームごとに。' } },
  { key: 'p4', kind: 'STILL', title: { en: 'Gilded Duelist · Gallery', zh: '鎏金決鬥者 · 畫廊', ja: '黄金の決闘者 · ギャラリー' }, color: '#fbbf24',
    blurb: { en: 'Twelve gilded stills from the final act.', zh: '終幕的十二張鎏金劇照。', ja: '最終幕の12枚の黄金スチル。' } }
];
