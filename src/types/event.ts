export type EventType = 'treasure' | 'trap' | 'encounter' | 'fountain' | 'rest';

export interface GameEventChoice {
  text: string;
  effect: 'heal' | 'damage' | 'item' | 'battle' | 'leave';
  value?: number; // 回復量やダメージ量
  itemId?: string; // 入手アイテムID
  enemyId?: string; // 戦闘になる敵ID
  successRate?: number; // 成功率 (0.0 - 1.0)
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  image?: string; // イベント用画像のキー
  choices: GameEventChoice[];
}
