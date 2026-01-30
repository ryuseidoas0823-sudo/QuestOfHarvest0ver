import { Position } from './input';

export type EnemyAI = 'chase' | 'ranged' | 'random' | 'boss_minotaur' | 'boss_goliath';

export interface EnemyStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  exp: number;
}

// マスタデータとしての敵定義
export interface Enemy {
  id: string;
  name: string;
  symbol: string; // アスキーアート用など
  color: string;
  stats: EnemyStats;
  aiType: EnemyAI;
  skills?: string[]; // スキルIDの配列
  dropTable?: any[]; // ドロップ定義
}

// ゲーム内に実体化した敵
export interface EnemyInstance extends Enemy {
  uniqueId: string;
  position: Position;
  // インスタンス固有の現在HPなどはstatsをコピーして持つか、別途持つ
  // ここではstats自体をコピーしてインスタンスプロパティとして扱う想定
  stats: EnemyStats; 
  statusEffects: any[]; // StatusEffect型があればそれを使う
  cooldowns: Record<string, number>;
  isAggro: boolean;
}
