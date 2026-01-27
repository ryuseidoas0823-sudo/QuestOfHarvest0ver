import { PlayerState, PlayerStats } from '../types/gameState';
import { ITEMS } from '../data/items';

/**
 * 装備品を含めたプレイヤーの最終ステータスを計算する
 */
export const calculateTotalStats = (player: PlayerState): PlayerStats => {
  // 基礎ステータスのコピー
  const totalStats: PlayerStats = { ...player.stats }; // ここでのstatsは成長分込みの裸ステータスを想定
  
  // 装備スロットを巡回して加算
  const equipmentSlots = ['mainHand', 'offHand', 'body', 'accessory'] as const;

  for (const slot of equipmentSlots) {
    const itemId = player.equipment[slot];
    if (itemId) {
      const item = ITEMS[itemId];
      if (item && item.equipmentStats) {
        const stats = item.equipmentStats;
        
        // 各パラメータを加算
        if (stats.str) totalStats.str += stats.str;
        if (stats.vit) totalStats.vit += stats.vit;
        if (stats.dex) totalStats.dex += stats.dex;
        if (stats.agi) totalStats.agi += stats.agi;
        if (stats.mag) totalStats.mag += stats.mag;
        if (stats.luc) totalStats.luc += stats.luc;
        
        if (stats.maxHp) totalStats.maxHp += stats.maxHp;
        if (stats.maxMp) totalStats.maxMp += stats.maxMp;
        
        // HP/MPの現在値が最大値を超えないようにキャップ（あるいは回復処理だが、ここではキャップのみ）
        // ※現在HPはここではなくState更新時に制御するが、念のため
      }
    }
  }

  // 補正後の現在HP/MP上限チェックは呼び出し元で行うのが一般的だが
  // 表示用としてはこれでOK
  return totalStats;
};

/**
 * 装備品の合計攻撃力などを取得するヘルパー
 */
export const getCombatStats = (player: PlayerState) => {
  let attack = 0;
  let defense = 0;
  let magicAttack = 0;
  let magicDefense = 0;

  const equipmentSlots = ['mainHand', 'offHand', 'body', 'accessory'] as const;
  for (const slot of equipmentSlots) {
    const itemId = player.equipment[slot];
    if (itemId) {
      const item = ITEMS[itemId];
      if (item && item.equipmentStats) {
        attack += item.equipmentStats.attackPower || 0;
        defense += item.equipmentStats.defense || 0;
        magicAttack += item.equipmentStats.magicPower || 0;
        magicDefense += item.equipmentStats.magicDefense || 0;
      }
    }
  }

  // ステータス補正を加える（STRによる攻撃力上昇など）
  // 実際の戦闘計算式と合わせる必要がある
  // ここでは「表示用」の概算値を返す
  
  return {
    attack: attack + (player.stats.str * 2), // 仮計算
    defense: defense + player.stats.vit,
    magicAttack: magicAttack + (player.stats.mag * 2),
    magicDefense: magicDefense + (player.stats.mag + player.stats.vit) / 2
  };
};
