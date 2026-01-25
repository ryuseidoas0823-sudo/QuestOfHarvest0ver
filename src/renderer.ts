// renderer.ts (Legacy Support / Deprecated)
// 基本的に React Components (PixelSprite等) に移行済み
// ビルドエラーを防ぐための最小限のスタブ

import { DungeonMap } from './types';
import { CHAR_SVG } from './assets/pixelData';

export const renderDungeon = (_ctx: CanvasRenderingContext2D, dungeon: DungeonMap) => {
  if (!dungeon || !dungeon.map) return;

  dungeon.map.forEach(row => {
    row.forEach(_tile => {
      // Canvas rendering logic (if needed)
    });
  });
};

// getSprite エラー対策
export const getSprite = (type: string, color?: string) => {
    if (type === 'swordsman') return CHAR_SVG.swordsman(color);
    return CHAR_SVG.unknown;
};
