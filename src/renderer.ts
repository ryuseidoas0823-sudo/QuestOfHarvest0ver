// renderer.ts (Legacy Support / Deprecated)
// 基本的に React Components (PixelSprite等) に移行済みのため
// このファイルは最小限のスタブとして残すか、削除が推奨されるが
// ビルドエラーを防ぐために修正する

import { DungeonMap, Tile, JobId, Stats } from './types';
import { CHAR_SVG } from './assets/pixelData';

export const renderDungeon = (ctx: CanvasRenderingContext2D, dungeon: DungeonMap) => {
  if (!dungeon || !dungeon.map) return; // 'tiles' -> 'map'

  dungeon.map.forEach(row => {
    row.forEach(tile => {
      // Canvas rendering logic (if needed)
    });
  });
};

// getSprite エラー対策: pixelData のデータを利用
export const getSprite = (type: string, color?: string) => {
    // 簡易マッピング
    if (type === 'swordsman') return CHAR_SVG.swordsman(color);
    return CHAR_SVG.unknown;
};
