export type DamageType = 'physical' | 'magical' | 'true';

export interface CombatResult {
  hit: boolean;
  critical: boolean;
  damage: number;
  damageType: DamageType;
  message: string; // ログ表示用のメッセージ
}

export interface CombatEntity {
  name: string;
  stats: {
    hp: number;
    maxHp: number;
    str: number; // Strength - 物理攻撃力
    vit: number; // Vitality - 物理防御力
    dex: number; // Dexterity - 命中・クリティカル率
    agi: number; // Agility - 回避・行動順
    mag: number; // Magic - 魔法攻撃・防御
    luc: number; // Luck - クリティカル回避・ドロップ率
  };
  level: number;
}
