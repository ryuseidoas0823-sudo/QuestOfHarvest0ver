// gameLogic.ts
// Legacy logic file. 
// Phase 1でロジックは Hooks (useDungeon, usePlayer etc.) に移行済みです。
// コンパイルエラーを防ぐため、ここには純粋な計算関数のみを残します。

import { Stats } from './types';

// ダメージ計算（例）
export const calculateDamage = (attacker: Stats, defender: Stats): number => {
  // 簡易計算: 攻撃力 - 防御力/2
  const atk = attacker.attack || attacker.str;
  const def = defender.defense || defender.vit;
  
  return Math.max(1, atk - Math.floor(def / 2));
};

// 経験値テーブル計算（例）
export const getNextLevelExp = (currentLevel: number): number => {
  return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
};

// 他のレガシーコードは削除またはコメントアウト
