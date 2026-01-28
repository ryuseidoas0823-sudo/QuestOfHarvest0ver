import { PlayerState, PlayerStats } from '../types/gameState';
import { ItemStats } from '../types/item';
import { getCalculatedItemStats } from './lootGenerator';
import { getSetById } from '../data/sets';

// ベースステータスの計算
const getBaseStats = (player: PlayerState): PlayerStats => {
  const base = {
    str: player.str,
    vit: player.vit,
    dex: player.dex,
    agi: player.agi,
    int: player.int,
    wis: player.wis,
    hp: player.maxHp,
    mp: player.maxMp,
    maxHp: player.maxHp,
    maxMp: player.maxMp,
    attack: 0,
    defense: 0,
    magicAttack: 0,
    magicDefense: 0,
    speed: 0
  };
  return base;
};

// 最終ステータス計算
export const calculatePlayerStats = (player: PlayerState): PlayerStats & ItemStats => {
  const baseStats = getBaseStats(player);
  
  // 集計用オブジェクト
  const totalStats: PlayerStats & ItemStats = {
    ...baseStats,
    // デフォルト値
    critRate: 5,
    critDamage: 150,
    hitRate: 95,
    evasion: 5,
    blockRate: 0,
    fireDamage: 0,
    iceDamage: 0,
    lightningDamage: 0,
    lightDamage: 0,
    darkDamage: 0,
    poisonChance: 0,
    bleedChance: 0,
    stunChance: 0,
    poisonResist: 0,
    burnResist: 0,
    stunResist: 0,
    fireResist: 0,
    iceResist: 0,
    lightningResist: 0,
    damageReflection: 0,
    expRate: 100,
    goldRate: 100,
    dropRate: 100,
    moveSpeed: 100,
    mpCostReduction: 0,
    cooldownReduction: 0,
    
    // Percent集計用
    hpMaxPercent: 0,
    mpMaxPercent: 0,
    attackPercent: 0,
    defensePercent: 0,
    magicAttackPercent: 0,
    magicDefensePercent: 0,
  };

  // 1. 装備品のステータスを集計
  const equipmentList = [
    player.equipment.mainHand,
    player.equipment.offHand,
    player.equipment.armor,
    player.equipment.accessory
  ];

  // セットアイテムのカウント用
  const setCounts: { [setId: string]: number } = {};
  
  // ユニーク装備チェック用フラグ
  let hasBerserkerAxe = false;

  equipmentList.forEach(item => {
    if (!item) return;

    // ユニーク判定
    if (item.id === 'unique_berserker_axe') hasBerserkerAxe = true;

    // セットカウント
    if (item.setId) {
      setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
    }

    // アイテム単体のステータス（エンチャント込み）を加算
    const itemStats = getCalculatedItemStats(item);
    Object.keys(itemStats).forEach(key => {
      const k = key as keyof ItemStats;
      const val = itemStats[k];
      if (typeof val === 'number') {
        (totalStats as any)[k] = ((totalStats as any)[k] || 0) + val;
      }
    });
  });

  // 2. セットボーナスの適用
  Object.entries(setCounts).forEach(([setId, count]) => {
    const setDef = getSetById(setId);
    if (!setDef) return;

    // 達成しているボーナスを全て適用
    setDef.bonuses.forEach(bonus => {
      if (count >= bonus.requiredCount) {
        Object.keys(bonus.stats).forEach(key => {
          const k = key as keyof ItemStats;
          const val = bonus.stats[k];
          if (typeof val === 'number') {
            (totalStats as any)[k] = ((totalStats as any)[k] || 0) + val;
          }
        });
      }
    });
  });

  // 3. 能力値の分配 (allStatsなど)
  if (totalStats.allStats) {
    totalStats.str = (totalStats.str || 0) + totalStats.allStats;
    totalStats.vit = (totalStats.vit || 0) + totalStats.allStats;
    totalStats.dex = (totalStats.dex || 0) + totalStats.allStats;
    totalStats.agi = (totalStats.agi || 0) + totalStats.allStats;
    totalStats.int = (totalStats.int || 0) + totalStats.allStats;
    totalStats.wis = (totalStats.wis || 0) + totalStats.allStats;
  }

  // 4. 能力値から派生ステータス算出
  const statsFromAttributes = {
    attack: (totalStats.str || 0) * 2,
    defense: (totalStats.vit || 0) * 1.5,
    magicAttack: (totalStats.int || 0) * 2,
    magicDefense: (totalStats.wis || 0) * 1.5,
    maxHp: (totalStats.vit || 0) * 10,
    maxMp: (totalStats.wis || 0) * 5,
    speed: (totalStats.agi || 0) * 0.5,
    evasion: (totalStats.agi || 0) * 0.1,
    critRate: (totalStats.dex || 0) * 0.1,
    hitRate: (totalStats.dex || 0) * 0.1,
  };

  // 5. 最終計算: (能力値派生 + 装備固定値 + セット固定値) * (1 + 割合補正)
  
  totalStats.maxHp = Math.floor(
    (baseStats.maxHp + statsFromAttributes.maxHp + (totalStats.hp || 0)) * (1 + (totalStats.hpMaxPercent || 0) / 100)
  );
  
  totalStats.maxMp = Math.floor(
    (baseStats.maxMp + statsFromAttributes.maxMp + (totalStats.mp || 0)) * (1 + (totalStats.mpMaxPercent || 0) / 100)
  );

  totalStats.attack = Math.floor(
    (statsFromAttributes.attack + (totalStats.attack || 0)) * (1 + (totalStats.attackPercent || 0) / 100)
  );

  totalStats.defense = Math.floor(
    (statsFromAttributes.defense + (totalStats.defense || 0)) * (1 + (totalStats.defensePercent || 0) / 100)
  );

  totalStats.magicAttack = Math.floor(
    (statsFromAttributes.magicAttack + (totalStats.magicAttack || 0)) * (1 + (totalStats.magicAttackPercent || 0) / 100)
  );

  totalStats.magicDefense = Math.floor(
    (statsFromAttributes.magicDefense + (totalStats.magicDefense || 0)) * (1 + (totalStats.magicDefensePercent || 0) / 100)
  );

  totalStats.speed = (totalStats.speed || 0) + statsFromAttributes.speed;
  totalStats.evasion = (totalStats.evasion || 0) + statsFromAttributes.evasion;
  totalStats.critRate = (totalStats.critRate || 0) + statsFromAttributes.critRate;
  totalStats.hitRate = (totalStats.hitRate || 0) + statsFromAttributes.hitRate;

  // --- Unique Effects Implementation ---
  
  // 狂戦士の斧: HPが低下するほど攻撃速度(Speed)が上昇（最大+50%）
  // プレイヤーの現在HP(player.hp)を参照して補正をかける
  if (hasBerserkerAxe && player.maxHp > 0) {
    const hpRatio = player.hp / player.maxHp; // 1.0 (満タン) ～ 0.0 (死)
    const lostRatio = 1.0 - hpRatio;
    const berserkBonus = Math.floor(totalStats.speed * (lostRatio * 0.5)); // 最大50%上昇
    totalStats.speed += berserkBonus;
  }

  return totalStats;
};
