// ... existing code ...

export type EnemyType = 'melee' | 'ranged' | 'magic' | 'boss';

// 追加: 勢力の定義
export type Faction = 'monster' | 'player_ally' | 'neutral';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  dropItems: { itemId: string; rate: number }[]; // itemId, drop rate (0-1)
  
  // 追加: 勢力（指定がない場合は 'monster'）
  faction?: Faction;
  
  // 追加: 見た目のアセットID（enemy_orc, npc_injured_adventurer など）
  assetId?: string;
  
  // 追加: AIの挙動タイプ
  aiType?: 'aggressive' | 'defensive' | 'stationary'; // stationary = 動かない（救助対象など）
}

// 動的な敵インスタンス（ゲーム中で使用）
export interface EnemyInstance extends Enemy {
  uniqueId: string;
  hp: number;
  x: number;
  y: number;
  
  // 状態異常などが必要ならここに追加
  lastAttackTime?: number;
}
