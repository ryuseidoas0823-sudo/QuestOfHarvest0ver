import { GameState, PlayerState } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { CombatResult } from '../types/combat';
import { generateEquipment } from './lootGenerator';
import { ALL_ITEMS } from '../data/items';

// ... existing code ...
// (注: 元のファイル全体がないため、ここで主要なロジックを再定義またはオーバーライドします。
// 本来は差分適用ですが、Loot生成部分は独立性が高いため、ヘルパー関数として提供します)

export const calculateDamage = (
  attacker: PlayerState | EnemyInstance,
  defender: PlayerState | EnemyInstance,
  skillMultiplier: number = 1.0,
  isMagical: boolean = false
): CombatResult => {
  // 簡易計算式 (Stat.tsのロジックが統合されたPlayerStateを持つ前提)
  // 実際には stats.ts で計算された最終ステータスを使用すべきですが、
  // ここでは簡易的に attacker.stats などを参照する想定
  
  // Note: プレイヤーの場合は stats.ts の結果が反映されているべき
  // 敵の場合は固定値

  const atk = isMagical ? attacker.magicAttack : attacker.attack;
  const def = isMagical ? defender.magicDefense : defender.defense;

  // 基本ダメージ: (攻撃力 * スキル倍率) - (防御力 / 2)
  // ランダム幅: ±10%
  let baseDamage = (atk * skillMultiplier) - (def * 0.5);
  baseDamage = Math.max(1, baseDamage);
  
  const variance = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1
  let damage = Math.floor(baseDamage * variance);

  // クリティカル判定
  // DEXベース
  const critRate = (attacker.stats?.critRate || 5) / 100;
  const isCritical = Math.random() < critRate;
  
  if (isCritical) {
    const critDmg = (attacker.stats?.critDamage || 150) / 100;
    damage = Math.floor(damage * critDmg);
  }

  return {
    hit: true, // 命中判定は別途必要だが簡易化
    critical: isCritical,
    damage: damage,
    damageType: isMagical ? 'magical' : 'physical',
    message: ''
  };
};

// 敵死亡時のドロップ処理
export const processEnemyDrop = (
  enemy: EnemyInstance, 
  playerLevel: number
): { items: any[], gold: number, exp: number } => {
  const drops = [];
  
  // 1. 固定ドロップテーブル (Materials, Consumables)
  if (enemy.dropTable) {
    enemy.dropTable.forEach(drop => {
      if (Math.random() < drop.rate) {
        // 固定アイテムは ALL_ITEMS から取得
        const itemDef = ALL_ITEMS.find(i => i.id === drop.itemId);
        if (itemDef) {
            // 素材やポーションはスタック可能なのでそのまま
            drops.push({ ...itemDef, quantity: 1 }); // 簡易コピー
        }
      }
    });
  }

  // 2. 装備品のランダム生成 (Loot System 2.0)
  // エリートやボスは高確率で装備を落とす
  let dropChance = 0.05; // 雑魚: 5%
  if (enemy.type === 'elite') dropChance = 0.30; // エリート: 30%
  if (enemy.type === 'boss') dropChance = 1.0;   // ボス: 100%

  if (Math.random() < dropChance) {
    // 装備生成
    const equip = generateEquipment(playerLevel);
    if (equip) {
      drops.push(equip);
    }
  }

  // ボスの場合、追加でレア確定ドロップなどのロジックも可

  return {
    items: drops,
    gold: enemy.stats.gold,
    exp: enemy.stats.exp
  };
};
