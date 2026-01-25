import { Stats } from '../types';

export type Faction = 'player' | 'enemy' | 'neutral';

export interface Enemy {
  id: string;
  name: string;
  // AIロジックで直接参照される座標プロパティを追加
  x: number;
  y: number;
  
  stats: Stats;
  faction?: Faction;
  visionRange?: number; // AI用
  
  // ドロップアイテムなど
  dropExp: number;
  dropGold: number;
  dropItems?: string[]; // Item ID
}
