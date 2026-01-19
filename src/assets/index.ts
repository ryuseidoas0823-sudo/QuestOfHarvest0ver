import { HERO_ASSETS as swordsmanAssets } from './swordsman';
import { HERO_ASSETS as warriorAssets } from './warrior';
import { HERO_ASSETS as archerAssets } from './archer';
import { HERO_ASSETS as mageAssets } from './mage';

/**
 * 職業ごとのアセット定義をエクスポート
 * App.tsx で `Assets[job.toLowerCase()]` のようにアクセスすることを想定しています。
 */
export const swordsman = { HERO_ASSETS: swordsmanAssets };
export const warrior = { HERO_ASSETS: warriorAssets };
export const archer = { HERO_ASSETS: archerAssets };
export const mage = { HERO_ASSETS: mageAssets };

// 既存の JobAssets 型不一致エラーを回避するための再エクスポート
export const JOB_ASSETS = {
  Swordsman: swordsmanAssets,
  Warrior: warriorAssets,
  Archer: archerAssets,
  Mage: mageAssets
};
