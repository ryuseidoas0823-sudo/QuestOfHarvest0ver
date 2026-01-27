// 戦闘に関連する型定義
// 循環参照を避けるため、他の型定義ファイル（gameStateなど）への依存を極力減らします。

export type StatusType = 
  | 'poison' 
  | 'burn' 
  | 'stun' 
  | 'regen' 
  | 'buff' 
  | 'debuff'
  | 'berserk'
  | 'guardian'
  | 'killing_zone'
  | 'barrier';

export interface StatusEffect {
  id: string;          // スキルIDや効果ID
  type: StatusType;    // 効果タイプ
  name: string;        // 表示名
  duration: number;    // 残りターン数 (999は永続/トグル扱い)
  value?: number;      // 効果量 (ダメージ量、回復量、上昇量など)
  sourceId?: string;   // 発生源
}

export interface CooldownState {
  [skillId: string]: number; // 残りターン数
}

export interface CombatEntity {
  id: string;
  name: string;
  level: number;
  // PlayerStatsへの直接依存を避けて循環参照を回避
  stats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    str: number;
    vit: number;
    dex: number;
    agi: number;
    int: number;
    wis: number;
    [key: string]: any;
  }; 
}

export interface CombatResult {
  hit: boolean;
  critical: boolean;
  damage: number;
  damageType: 'physical' | 'magical';
  message: string;
}
