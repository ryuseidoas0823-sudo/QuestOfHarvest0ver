import { Item, ItemStats, EnchantInstance, EnchantDef, EnchantTableType } from '../types/item';
import { ALL_ITEMS } from '../data/items';
import { ALL_ENCHANTS, getEnchantsByTable } from '../data/enchants';

// 設定値
const TIER_THRESHOLDS = {
  TIER_2: 20, // Lv 20以上でTier 2解放
  TIER_3: 50, // Lv 50以上でTier 3解放
};

const RARITY_CHANCE = {
  MAGIC: 0.30, // 30%
  RARE: 0.15,  // 15%
  EPIC: 0.05,  // 5%
};

const SPECIAL_DROP_CHANCE = {
  UNIQUE: 0.01, // 1% (非常に稀)
  SET: 0.04,    // 4% (稀)
};

// ユーティリティ: ランダムなアイテムを取得
const getRandomBaseItem = (level: number, type?: 'weapon' | 'armor' | 'accessory'): Item | null => {
  // 1. ユニーク抽選
  if (Math.random() < SPECIAL_DROP_CHANCE.UNIQUE) {
    const uniques = ALL_ITEMS.filter(i => 
      i.isUnique && 
      (!type || i.type === type) &&
      (!i.requirements?.level || i.requirements.level <= level + 5) // レベル帯が近いもの
    );
    if (uniques.length > 0) {
      return uniques[Math.floor(Math.random() * uniques.length)];
    }
  }

  // 2. セットアイテム抽選
  if (Math.random() < SPECIAL_DROP_CHANCE.SET) {
    const sets = ALL_ITEMS.filter(i => 
      i.setId && 
      (!type || i.type === type)
    );
    if (sets.length > 0) {
      return sets[Math.floor(Math.random() * sets.length)];
    }
  }

  // 3. 通常アイテム抽選
  const candidates = ALL_ITEMS.filter(item => 
    (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') &&
    (!type || item.type === type) &&
    !item.isUnique && // ユニークは除外
    !item.setId       // セットアイテムも除外（個別抽選済みのため）
  );
  
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

// ユーティリティ: Tier決定
const determineTier = (level: number): { tier: number, multiplier: number, prefix: string } => {
  if (level >= TIER_THRESHOLDS.TIER_3) {
    return { tier: 3, multiplier: 2.5, prefix: '神鉄の' };
  } else if (level >= TIER_THRESHOLDS.TIER_2) {
    return { tier: 2, multiplier: 1.5, prefix: '鍛えられた' };
  }
  return { tier: 1, multiplier: 1.0, prefix: '' };
};

// ユーティリティ: レアリティ決定（エンチャント数）
const determineEnchantCount = (bonusChance: number = 0): number => {
  const rand = Math.random() - bonusChance;
  
  if (Math.random() < RARITY_CHANCE.EPIC + bonusChance) return 3;
  if (Math.random() < RARITY_CHANCE.RARE + bonusChance) return 2;
  if (Math.random() < RARITY_CHANCE.MAGIC + bonusChance) return 1;
  return 0;
};

// ユーティリティ: エンチャント抽選
const rollEnchants = (count: number): EnchantInstance[] => {
  if (count <= 0) return [];

  const enchants: EnchantInstance[] = [];
  const usedDefIds = new Set<string>();
  const tables: EnchantTableType[] = ['offense', 'defense', 'utility'];

  for (let i = 0; i < count; i++) {
    const tableType = tables[Math.floor(Math.random() * tables.length)];
    const availableEnchants = getEnchantsByTable(tableType).filter(e => !usedDefIds.has(e.id));
    
    if (availableEnchants.length === 0) continue;

    const selectedDef = availableEnchants[Math.floor(Math.random() * availableEnchants.length)];
    usedDefIds.add(selectedDef.id);

    const roll = Math.floor(Math.random() * 100) + 1;
    const valRange = selectedDef.maxVal - selectedDef.minVal;
    const calculatedValue = Math.floor(selectedDef.minVal + (valRange * (roll / 100)));

    enchants.push({
      defId: selectedDef.id,
      roll: roll,
      value: calculatedValue
    });
  }

  return enchants;
};

// メイン関数: 装備生成
export const generateEquipment = (level: number, type?: 'weapon' | 'armor' | 'accessory'): Item | null => {
  const baseItem = getRandomBaseItem(level, type);
  if (!baseItem) return null;

  // インスタンス作成
  const newItem: Item = JSON.parse(JSON.stringify(baseItem));
  newItem.uniqueId = crypto.randomUUID();
  
  // ユニークアイテムは性能固定（または専用のランダム幅を持つべきだが、ここでは固定）
  if (newItem.isUnique) {
    return newItem;
  }

  // 1. Tier適用 (セットアイテムもTier強化される仕様とする)
  const tierInfo = determineTier(level);
  newItem.tier = tierInfo.tier;
  if (tierInfo.prefix && !newItem.setId) { // セットアイテムは名前を変えない方がいいかも？あるいは「鍛えられた 紅蓮の剣」とするか。一旦通常のみ変更。
    newItem.name = `${tierInfo.prefix}${newItem.name}`;
  }
  
  // 基礎ステータス強化
  if (newItem.stats) {
    Object.keys(newItem.stats).forEach(key => {
      const k = key as keyof ItemStats;
      // Percent系以外の数値を強化
      if (newItem.stats && typeof newItem.stats[k] === 'number' && !key.includes('Percent')) {
        newItem.stats[k] = Math.floor((newItem.stats[k] as number) * tierInfo.multiplier);
      }
    });
  }

  // 2. エンチャント決定
  // セットアイテムはエンチャント枠を少なめにするなどの調整も可能だが、ハクスラならフルエンチャントもあり。
  const rarityBonus = level * 0.001; 
  let enchantCount = determineEnchantCount(rarityBonus);
  
  // Tierによる最低保証
  let finalCount = enchantCount;
  if (tierInfo.tier === 2) finalCount = Math.max(finalCount, 1);
  if (tierInfo.tier === 3) finalCount = Math.max(finalCount, 2);
  finalCount = Math.min(finalCount, 3);

  // セットアイテムは元々Epic/Rareなので、エンチャント数を上乗せする、または固定レアリティに従う
  // ここではランダム付与する
  newItem.enchants = rollEnchants(finalCount);

  // レアリティ名の設定 (セットアイテムは固定なので変更しない)
  if (!newItem.setId) {
    if (newItem.enchants.length === 0) newItem.rarity = 'common';
    else if (newItem.enchants.length === 1) newItem.rarity = 'uncommon';
    else if (newItem.enchants.length === 2) newItem.rarity = 'rare';
    else if (newItem.enchants.length >= 3) newItem.rarity = 'epic';
  }

  // 3. 販売価格調整
  newItem.value = Math.floor(newItem.value * tierInfo.multiplier * (1 + (newItem.enchants?.length || 0) * 0.5));

  return newItem;
};

// ユーティリティ: アイテムの最終ステータスを計算
export const getCalculatedItemStats = (item: Item): ItemStats => {
  const stats: ItemStats = { ...item.stats } || {};
  
  if (!item.enchants) return stats;

  item.enchants.forEach(enchant => {
    const def = ALL_ENCHANTS.find(e => e.id === enchant.defId);
    if (!def) return;
    
    // エンチャント定義の statsKey に従って加算
    // Flat値もPercent値も、ItemStatsの対応するプロパティに加算する
    // 例: statsKeyが 'attack' なら固定値、 'attackPercent' なら割合値として加算される
    const currentVal = stats[def.statsKey] || 0;
    stats[def.statsKey] = currentVal + enchant.value;
  });

  return stats;
};
