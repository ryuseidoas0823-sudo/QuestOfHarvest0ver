import { PlayerState } from '../types/gameState';

/**
 * クイックポーションの最大所持数を計算する
 * 将来的にスキルや装備、神の恩恵による補正をここに追加
 */
export const calculateMaxPotions = (player: PlayerState): number => {
  let max = 3; // 初期値

  // 例: 拡張案
  // if (player.skills.has('PotionMastery')) max += 1;
  // if (player.equipment.accessory === 'AlchemistBag') max += 2;
  
  return max;
};

/**
 * クイックポーションの回復量を計算する
 * 基本: 最大HPの30% (ブラッドボーン風)
 */
export const calculateHealAmount = (player: PlayerState): number => {
  const baseHeal = Math.floor(player.maxHp * 0.3);
  
  // 最低でも20は回復
  return Math.max(20, baseHeal);
};
