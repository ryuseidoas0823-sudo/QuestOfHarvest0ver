/**
 * すべてのアセットを統合してエクスポートするエントリポイント
 */
import { JobAssets } from './types';
import { swordsman } from './swordsman';
import { warrior } from './warrior';
import { archer } from './archer';
import { mage } from './mage';
import { MONSTER_ASSETS } from './monsters';

export * from './types';

export const HERO_ASSETS: Record<string, JobAssets> = {
  Swordsman: swordsman,
  Warrior: warrior,
  Archer: archer,
  Mage: mage,
};

export { MONSTER_ASSETS };
