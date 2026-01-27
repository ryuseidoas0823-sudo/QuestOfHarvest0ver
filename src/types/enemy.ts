import { Position } from './input';
import { StatusEffect } from './combat';

/**
 * 敵の種族定義
 */
export type EnemyRace = 
  | 'slime'     // 粘体: 物理耐性、魔法弱点
  | 'undead'    // 死霊: 毒無効、聖弱点、再生
  | 'humanoid'  // 亜人: バランス型、集団戦術
  | 'beast'     // 魔獣: 高速、高火力
  | 'construct' // 無機物: 状態異常無効、高防御
  | 'plant'     // 植物: 火弱点、状態異常攻撃
  | 'demon'     // 悪魔: 魔法攻撃、耐性多め
  | 'dragon'    // 竜: ブレス、高ステータス
  | 'god';      // 神性: ボス級

/**
 * 属性タイプ
 */
export type ElementType = 'physical' | 'fire' | 'ice' | 'thunder' | 'poison' | 'holy' | 'dark';

export type EnemyResistances = Partial<Record<ElementType, number>>;
export type EnemyWeaknesses = Partial<Record<ElementType, number>>;

/**
 * 敵のスキル定義
 */
export interface EnemySkill {
  id: string;
  name: string;
  type: 'attack' | 'buff' | 'debuff' | 'heal' | 'summon';
  range: number;      // 射程
  areaRadius?: number;// 効果範囲 (0=単体)
  damageMult?: number;// 攻撃倍率 (1.0 = 通常攻撃相当)
  statusEffect?: string; // 付与する状態異常ID
  cooldown: number;   // 再使用ターン数
  prob: number;       // 使用確率 (0.0 - 1.0)
  message: string;    // 使用時のログメッセージ
}

/**
 * 敵キャラクターのインターフェース
 */
export interface Enemy {
  id: string;
  name: string;
  symbol: string;
  color: string;
  position: Position;
  
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  
  aiType: 'chase' | 'random' | 'stationary' | 'ranged' | 'healer' | 'boss_minotaur' | 'boss_goliath';
  
  race: EnemyRace;
  resistances?: EnemyResistances;
  weaknesses?: EnemyWeaknesses;
  
  // スキル関連
  skills?: EnemySkill[];
  cooldowns?: Record<string, number>; // SkillId -> Remaining Turns
  
  statusEffects: StatusEffect[];
}
