import React from 'react';
import { motion } from 'framer-motion';

export default function CharacterCard({ character, active, onSelect }) {
  return (
    <motion.button whileHover={{ y: -8, rotateX: 3, rotateY: -4 }} onClick={onSelect}
      className={'relative aspect-[0.72] rounded-xl overflow-hidden text-left border transition-colors ' + (active ? 'border-ice' : 'border-white/12')}
      style={{ boxShadow: active ? '0 0 40px ' + (character.color_theme || '#7dd3fc') + '44' : 'none' }}>
      <img src={character.cover_image_url} alt={character.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/95" />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="font-mono text-[9px] tracking-[0.25em] mb-1.5" style={{ color: character.color_theme || '#7dd3fc' }}>{character.rarity_level}</div>
        <div className="font-display text-sm tracking-[0.15em] mb-1">{character.name}</div>
        <div className="font-mono text-[9px] text-chrome/50">{character.armor_type}</div>
      </div>
    </motion.button>
  );
}