// Shared "cinematic analysis" used by the homepage Upload Lab and the admin quick-add.
// Deterministic (hash of filename+size) so the same image always yields the same reading —
// identical behaviour to the prototype's handleFiles().

export const MOODS = ['Cold Precision', 'Soft Rebellion', 'Lunar Melancholy', 'Neon Devotion', 'Chrome Serenity'];
export const ROLES = ['Opening Frame Heroine', 'Blueprint Oracle', 'Final Act Duelist', 'Cover Muse', 'Silent Sentinel'];
export const PALETTES = ['Silver Ice — chrome / cyan', 'Pink Nova — gloss / rose', 'Black Galaxy — void / violet', 'White Chrome — pearl / steel'];
export const WEAPONS = ['PLASMA BLADE', 'ION RIFLE', 'NANO SHIELD', 'WING BOOSTER', 'STEALTH CLOAK', 'HEAVY ARMOR MODE'];
export const RARITIES = ['SR — LIMITED FRAME', 'SSR — PROTOTYPE', 'UR — ONE OF ONE'];

export function analyzeFile(file) {
  const h = (file.name + file.size).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    palette: PALETTES[h % PALETTES.length],
    mood: MOODS[h % MOODS.length],
    weapon: WEAPONS[h % WEAPONS.length],
    role: ROLES[h % ROLES.length],
    rarity: RARITIES[h % RARITIES.length]
  };
}

// Build a full character DB row from an analysis + cover image, auto-naming it "CUSTOM MUSE 0N".
export function characterFromAnalysis(analysis, coverUrl, n) {
  const num = n < 10 ? '0' + n : String(n);
  const name = 'CUSTOM MUSE ' + num;
  return {
    name,
    slug: 'custom-muse-' + num + '-' + Math.random().toString(36).slice(2, 6),
    cover_image_url: coverUrl,
    armor_type: analysis.palette,
    weapon_system: analysis.weapon,
    energy_core: 'Unclassified Core',
    rarity_level: analysis.rarity,
    color_theme: '#7dd3fc',
    cinematic_description: analysis.mood + ' · ' + analysis.role + ' · ' + analysis.rarity,
    is_public: true
  };
}
