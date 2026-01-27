import { JobState } from './job';
import { PlayerStats } from './stats'; // 既存の型定義ファイルの場所に合わせて調整してください
import { Position } from './input'; // 同上
import { Item } from './item';
import { QuestState } from './quest';
import { StatusEffect, CooldownState } from './combat'; // 追加

export interface Player {
  name: string;
  jobState: JobState;
  stats: PlayerStats;
  position: Position;
  inventory: Item[];
  equipment: {
    mainHand?: Item;
    offHand?: Item;
    armor?: Item;
    accessory?: Item;
  };
  gold: number;
  exp: number;
  // --- 追加 ---
  skills: Record<string, number>; // SkillID -> Level
  cooldowns: CooldownState;       // クールダウン管理
  statusEffects: StatusEffect[];  // バフ・デバフ
  // ------------
  quests: QuestState;
}

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
  aiType: 'chase' | 'random' | 'stationary';
  // --- 追加 ---
  statusEffects: StatusEffect[];
  // ------------
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  dungeon: {
    floor: number;
    map: number[][]; // 0: wall, 1: floor
    rooms: any[];
    stairs: Position;
  };
  turn: number;
  messages: { text: string; type: 'info' | 'success' | 'warning' | 'danger' }[];
  isGameOver: boolean;
  isGameClear: boolean;
}
