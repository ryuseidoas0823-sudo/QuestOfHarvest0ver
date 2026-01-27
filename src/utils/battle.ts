export type DamageType = 'physical' | 'magical' | 'true';

export interface CombatResult {
  hit: boolean;
  critical: boolean;
  damage: number;
  damageType: DamageType;
  message: string;
}

export interface CombatEntity {
  name: string;
  stats: {
    hp: number;
    maxHp: number;
    str: number;
    vit: number;
    dex: number;
    agi: number;
    mag: number;
    luc: number;
    level: number;
  };
  ct?: number; // Charge Time
  level: number;
}
