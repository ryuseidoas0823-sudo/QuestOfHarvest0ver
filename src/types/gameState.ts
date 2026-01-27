import { JobId } from '../types';
import { Item } from './item';
import { QuestState } from './quest';
import { EventState } from './event';
import { StatusEffect, CooldownState } from './combat';

export interface Position {
  x: number;
  y: number;
  floor: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  
  // Basic Stats
  str: number; // Strength - Physical Damage
  vit: number; // Vitality - HP, Defense
  dex: number; // Dexterity - Hit Rate, Critical
  agi: number; // Agility - Evasion, Turn Order
  int: number; // Intelligence - Magic Damage
  wis: number; // Wisdom - MP, Magic Defense

  // Secondary Stats (calculated)
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
}

export interface PlayerState extends PlayerStats {
  name: string;
  job: JobId;
  level: number;
  exp: number;
  nextExp: number;
  gold: number;
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  
  // Equipment
  equipment: {
    mainHand: Item | null;
    offHand: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  
  // Inventory
  inventory: Item[];
  maxInventorySize: number;

  // Combat States
  ct: number; // Charge Time for turn order
  statusEffects: StatusEffect[]; // 更新: 新しい型定義を使用
  cooldowns: CooldownState;
  
  // God System
  godId: string | null;
  piety: number;

  // Progression
  mastery: {
    [key in JobId]?: number; // Mastery Level for each job
  };
  
  quickPotion: {
    itemId: string | null;
    current: number;
    max: number;
  } | null;
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
}

export interface GameState {
  player: PlayerState;
  dungeon: any; // DungeonState type would be imported if needed, keeping simple to avoid cycles
  enemies: any[]; // EnemyInstance[]
  quests: QuestState;
  events: EventState;
  logs: LogEntry[];
  turn: number;
  state: 'title' | 'town' | 'dungeon' | 'battle' | 'event' | 'gameover' | 'god_select' | 'job_select' | 'name_input' | 'result';
  isPlayerTurn: boolean;
  selectedTarget: string | null; // ID of selected target
}
