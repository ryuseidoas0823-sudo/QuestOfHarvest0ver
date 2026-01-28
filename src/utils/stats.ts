import { PlayerState, PlayerStats } from '../types/gameState';
import { ItemStats } from '../types/item';
import { getCalculatedItemStats } from './lootGenerator';

// ベースステータスの計算（レベルやジョブ補正）
// ※ 実際はJob定義から成長率を取得するが、ここでは簡易的に計算
const getBaseStats = (player: PlayerState): PlayerStats => {
  // 初期値 + レベル成長
  // 本来はJobごとに成長テーブルを持つべき
  const base = {
    str: player.str,
    vit: player.vit,
    dex: player.dex,
    agi: player.agi,
    int: player.int,
    wis: player.wis,
    hp: player.maxHp, // 現在のmaxHpをベースとする（レベルアップ時に更新されている前提）
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
    // 追加パラメータの初期化
    critRate: 5, // 基礎5%
    critDamage: 150, // 基礎150%
    hitRate: 95, // 基礎95%
    evasion: 5, // 基礎5%
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
    
    // 能力値加算用
    str: baseStats.str,
    vit: baseStats.vit,
    dex: baseStats.dex,
    agi: baseStats.agi,
    int: baseStats.int,
    wis: baseStats.wis,
  };

  // 1. 装備品のステータスを集計 (Flat値とPercent値をそれぞれ加算)
  const equipmentList = [
    player.equipment.mainHand,
    player.equipment.offHand,
    player.equipment.armor,
    player.equipment.accessory
  ];

  equipmentList.forEach(item => {
    if (!item) return;

    // エンチャント込みのステータスを取得
    const itemStats = getCalculatedItemStats(item);

    // 全プロパティを走査して加算
    Object.keys(itemStats).forEach(key => {
      const k = key as keyof ItemStats;
      const val = itemStats[k];
      if (typeof val === 'number') {
        // anyキャストで代入（型安全性を保ちつつ動的に加算）
        (totalStats as any)[k] = ((totalStats as any)[k] || 0) + val;
      }
    });
  });

  // allStats (全能力値) の分配
  if (totalStats.allStats) {
    totalStats.str = (totalStats.str || 0) + totalStats.allStats;
    totalStats.vit = (totalStats.vit || 0) + totalStats.allStats;
    totalStats.dex = (totalStats.dex || 0) + totalStats.allStats;
    totalStats.agi = (totalStats.agi || 0) + totalStats.allStats;
    totalStats.int = (totalStats.int || 0) + totalStats.allStats;
    totalStats.wis = (totalStats.wis || 0) + totalStats.allStats;
  }

  // 2. 能力値(STR/INTなど)から派生ステータス(Attack/MagicAttack)を算出
  // (ここでの係数はゲームバランス調整の要)
  const statsFromAttributes = {
    attack: (totalStats.str || 0) * 2,           // STR 1 = ATK 2
    defense: (totalStats.vit || 0) * 1.5,        // VIT 1 = DEF 1.5
    magicAttack: (totalStats.int || 0) * 2,      // INT 1 = MAT 2
    magicDefense: (totalStats.wis || 0) * 1.5,   // WIS 1 = MDEF 1.5
    maxHp: (totalStats.vit || 0) * 10,           // VIT 1 = HP 10
    maxMp: (totalStats.wis || 0) * 5,            // WIS 1 = MP 5
    speed: (totalStats.agi || 0) * 0.5,          // AGI 1 = SPD 0.5
    evasion: (totalStats.agi || 0) * 0.1,        // AGI 10 = EVA 1%
    critRate: (totalStats.dex || 0) * 0.1,       // DEX 10 = CRT 1%
    hitRate: (totalStats.dex || 0) * 0.1,        // DEX 10 = HIT +
  };

  // 3. 最終計算: (能力値派生 + 装備固定値) * (1 + 装備割合補正)
  
  // HP
  totalStats.maxHp = Math.floor(
    (baseStats.maxHp + statsFromAttributes.maxHp + (totalStats.hp || 0)) * (1 + (totalStats.hpMaxPercent || 0) / 100)
  );
  
  // MP
  totalStats.maxMp = Math.floor(
    (baseStats.maxMp + statsFromAttributes.maxMp + (totalStats.mp || 0)) * (1 + (totalStats.mpMaxPercent || 0) / 100)
  );

  // Attack
  totalStats.attack = Math.floor(
    (statsFromAttributes.attack + (totalStats.attack || 0)) * (1 + (totalStats.attackPercent || 0) / 100)
  );

  // Defense
  totalStats.defense = Math.floor(
    (statsFromAttributes.defense + (totalStats.defense || 0)) * (1 + (totalStats.defensePercent || 0) / 100)
  );

  // Magic Attack
  totalStats.magicAttack = Math.floor(
    (statsFromAttributes.magicAttack + (totalStats.magicAttack || 0)) * (1 + (totalStats.magicAttackPercent || 0) / 100)
  );

  // Magic Defense
  totalStats.magicDefense = Math.floor(
    (statsFromAttributes.magicDefense + (totalStats.magicDefense || 0)) * (1 + (totalStats.magicDefensePercent || 0) / 100)
  );

  // その他加算 (Rate系は単純加算)
  totalStats.speed = (totalStats.speed || 0) + statsFromAttributes.speed;
  totalStats.evasion = (totalStats.evasion || 0) + statsFromAttributes.evasion;
  totalStats.critRate = (totalStats.critRate || 0) + statsFromAttributes.critRate;
  totalStats.hitRate = (totalStats.hitRate || 0) + statsFromAttributes.hitRate;

  return totalStats;
};
