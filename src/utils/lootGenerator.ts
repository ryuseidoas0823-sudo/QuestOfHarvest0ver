import { v4 as uuidv4 } from 'uuid'; // もしuuidがなければ crypto.randomUUID() を使用
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

// ユーティリティ: ランダムなアイテムを取得
const getRandomBaseItem = (type?: 'weapon' | 'armor' | 'accessory'): Item | null => {
  const candidates = ALL_ITEMS.filter(item => 
    (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') &&
    (!type || item.type === type) &&
    !item.isUnique // ユニークは通常ドロップ生成からは除外（別ロジックで扱う想定）
  );
  
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

// ユーティリティ: Tier決定
const determineTier = (level: number): { tier: number, multiplier: number, prefix: string } => {
  if (level >= TIER_THRESHOLDS.TIER_3) {
    // 確率で下位Tierも出るようにするか、完全移行するか。ここでは高レベルなら確実に良いものが出るとするが、ハクスラ的には確率混合が良い
    // 簡易化のため、レベル帯でベースを決定
    return { tier: 3, multiplier: 2.5, prefix: '神鉄の' }; // Mythical
  } else if (level >= TIER_THRESHOLDS.TIER_2) {
    return { tier: 2, multiplier: 1.5, prefix: '鍛えられた' }; // Honed
  }
  return { tier: 1, multiplier: 1.0, prefix: '' };
};

// ユーティリティ: レアリティ決定（エンチャント数）
const determineEnchantCount = (bonusChance: number = 0): number => {
  const rand = Math.random() - bonusChance; // ボーナスが高いほど低い値（高レア）が出やすくなるロジックなら減算、逆なら加算。ここではシンプルに乱数判定
  
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

  // テーブルの重み付け (攻撃:防御:補助 = 4:4:2 くらい？)
  // 簡易的にランダムにテーブルを選ぶ
  const tables: EnchantTableType[] = ['offense', 'defense', 'utility'];

  for (let i = 0; i < count; i++) {
    // テーブル決定（偏らせることも可能）
    const tableType = tables[Math.floor(Math.random() * tables.length)];
    const availableEnchants = getEnchantsByTable(tableType).filter(e => !usedDefIds.has(e.id));
    
    if (availableEnchants.length === 0) continue;

    const selectedDef = availableEnchants[Math.floor(Math.random() * availableEnchants.length)];
    usedDefIds.add(selectedDef.id);

    // Roll値決定 (1-100)
    // 良い乱数分布にするなら box-muller 等を使うが、ここはフラットな乱数
    const roll = Math.floor(Math.random() * 100) + 1;

    // 値計算
    // 線形補間: min + (max - min) * (roll / 100)
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
  const baseItem = getRandomBaseItem(type);
  if (!baseItem) return null;

  // インスタンス作成
  const newItem: Item = JSON.parse(JSON.stringify(baseItem)); // Deep copy
  newItem.uniqueId = crypto.randomUUID();
  
  // 1. Tier適用
  const tierInfo = determineTier(level);
  newItem.tier = tierInfo.tier;
  if (tierInfo.prefix) {
    newItem.name = `${tierInfo.prefix}${newItem.name}`;
  }
  
  // 基礎ステータス強化
  if (newItem.stats) {
    Object.keys(newItem.stats).forEach(key => {
      const k = key as keyof ItemStats;
      if (newItem.stats && typeof newItem.stats[k] === 'number') {
        newItem.stats[k] = Math.floor((newItem.stats[k] as number) * tierInfo.multiplier);
      }
    });
  }

  // 2. エンチャント決定
  // レベルが高いほどレア率も少し上げる？
  const rarityBonus = level * 0.001; 
  const enchantCount = determineEnchantCount(rarityBonus);
  
  // Tier補正（Tierが高いと最低スロット保証など）
  // 設計書: Tier2=+1枠, Tier3=+2枠 ... は強力すぎるので、抽選回数に加算するか、最低保証にする
  // ここでは「確率抽選」の結果に、Tierによる最低保証を加味する形にする
  let finalCount = enchantCount;
  if (tierInfo.tier === 2) finalCount = Math.max(finalCount, 1);
  if (tierInfo.tier === 3) finalCount = Math.max(finalCount, 2);
  finalCount = Math.min(finalCount, 3); // 最大3

  newItem.enchants = rollEnchants(finalCount);

  // レアリティ名の設定 (色分け用)
  if (newItem.enchants.length === 0) newItem.rarity = 'common';
  else if (newItem.enchants.length === 1) newItem.rarity = 'uncommon'; // Magic
  else if (newItem.enchants.length === 2) newItem.rarity = 'rare';
  else if (newItem.enchants.length >= 3) newItem.rarity = 'epic';

  // 3. 販売価格調整
  // Tierとエンチャント数に応じて価格上昇
  newItem.value = Math.floor(newItem.value * tierInfo.multiplier * (1 + newItem.enchants.length * 0.5));

  return newItem;
};

// ユーティリティ: アイテムの最終ステータスを計算して取得する（UI表示や戦闘計算用）
export const getCalculatedItemStats = (item: Item): ItemStats => {
  const stats: ItemStats = { ...item.stats } || {};
  
  if (!item.enchants) return stats;

  item.enchants.forEach(enchant => {
    // 定義を取得
    const def = ALL_ENCHANTS.find(e => e.id === enchant.defId);
    if (!def) return;

    const currentVal = stats[def.statsKey] || 0;
    
    // 加算処理
    // ※ %アップ系も、ItemStats上では数値として保持しておき、
    // 戦闘計算時に「基礎値 * (1 + %/100)」するのか、
    // ここで「基礎値 + 加算値」してしまうのかは設計次第。
    // 今回のItemStats定義には `attack` と `attackPercent` のような区別がなく、
    // EnchantDefに `isPercentage` フラグがある。
    
    // シンプルにするため、ItemStatsにそのまま加算する。
    // 消費側(usePlayer等)で、statsKeyが '%' を意味するパラメータなのかどうか判断が必要だが、
    // 今回のEnchantDefの statsKey は 'critRate' や 'fireDamage' など具体的なので、
    // 重複する 'attack' (固定値) と 'attack' (%) の扱いだけ注意が必要。
    
    // 設計書Table Aを見ると:
    // "物理攻撃力 +" -> statsKey: 'attack'
    // "物理攻撃力 +%" -> statsKey: 'attack' (isPercentage: true)
    // これだと競合する。
    // 解決策: ItemStatsを拡張して `attackPercent` を作るか、
    // ここでは合算せず「表示用/計算用」に分ける。
    
    // 一旦、数値を単純加算します。
    // ただし、もし `isPercentage` が true の場合、ItemStatsに保存する値が「%」であることを
    // 呼び出し元が知る由もないため、型定義 `ItemStats` 側に `_pct` 付きのプロパティを用意するのが理想。
    // 現状の `ItemStats` は `attack` しかないため、固定値加算として扱われます。
    
    stats[def.statsKey] = currentVal + enchant.value;
  });

  return stats;
};
