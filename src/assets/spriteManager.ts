import { CHAR_SVG, TILE_PATTERNS } from './pixelData';

/**
 * Sprite Manager (Legacy Support / Wrapper)
 * * ビジュアルデータは `src/assets/pixelData.ts` と `src/components/PixelSprite.tsx` 
 * に移行されました。このファイルは互換性のために残されており、
 * pixelData.ts の内容を返却するヘルパー関数を提供します。
 */

export const getCharacterSVG = (type: string, color?: string): string => {
  if (type === 'swordsman') return CHAR_SVG.swordsman(color);
  if (type === 'warrior') return CHAR_SVG.warrior(color);
  if (type === 'archer') return CHAR_SVG.swordsman('#15803d'); // Placeholder
  if (type === 'mage') return CHAR_SVG.swordsman('#7e22ce'); // Placeholder
  
  if (type === 'slime') return CHAR_SVG.slime;
  if (type === 'goblin') return CHAR_SVG.goblin;
  if (type === 'skeleton') return CHAR_SVG.skeleton;
  
  return CHAR_SVG.unknown;
};

export const getTilePattern = (type: string): string => {
  if (type === 'floor') return TILE_PATTERNS.floor;
  if (type === 'wall') return TILE_PATTERNS.wall;
  if (type === 'corridor') return TILE_PATTERNS.corridor;
  if (type === 'stairs') return TILE_PATTERNS.stairs;
  return '';
};
