import { ITEMS } from '../data/items';
import { PlayerState } from '../types/gameState';

/**
 * 宝箱の中身を決定する
 * @param floor 現在の階層
 * @param luck プレイヤーの運ステータス
 */
export const connectChestLoot = (floor: number, luck: number): { itemId: string; amount: number } | null => {
  // アイテムIDのリスト (重み付けは簡易的に配列の数で調整、または確率テーブルを持つのが一般的)
  // ここでは簡易的に実装
  const commonPool = ['potion_low', 'ether_low'];
  const rarePool = ['potion_high', 'power_drug'];
  
  // 運によるレア確率補正 (luck 0~100想定)
  const rareChance = 0.1 + (luck * 0.005); // 基礎10% + 運補正
  const isRare = Math.random() < rareChance;

  let selectedId: string;

  if (isRare) {
    const idx = Math.floor(Math.random() * rarePool.length);
    selectedId = rarePool[idx];
  } else {
    const idx = Math.floor(Math.random() * commonPool.length);
    selectedId = commonPool[idx];
  }

  // アイテムデータが存在するか確認
  if (!ITEMS[selectedId]) return null;

  // 数量決定（基本1個、たまに2個）
  const amount = Math.random() < 0.1 ? 2 : 1;

  return { itemId: selectedId, amount };
};
