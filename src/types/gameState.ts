import { Position } from './input';
import { Item, Equipment, ItemInstance } from './item';
import { EnemyInstance } from './enemy';

export interface Stats {
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

  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  
  hitRate: number;
  evasion: number;
  critRate: number;
  
  // Index signature for flexible access
  [key: string]: number | undefined; 
}

export interface PlayerState {
  name: string;
  job: string;
  god: string;
  
  level: number;
  exp: number;
  
  // Current values
  hp: number;
  maxHp: number; // Shortcut to stats.maxHp
  mp: number;
  maxMp: number;
  
  stats: Stats; // Calculated final stats
  position: Position;
  
  gold: number;
  
  inventory: (Item | null)[];
  maxInventorySize: number;
  
  equipment: {
    mainHand: Equipment | null;
    offHand: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };

  skillPoints: number;
  statPoints: number;
  
  skills: Record<string, number>; // ID -> Level
  mastery: Record<string, number>; // JobID -> Level
  
  statusEffects: any[];
}

export interface DungeonState {
  floor: number;
  map: number[][]; // 0:wall, 1:floor...
  visited: boolean[][];
  items: ItemInstance[];
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: number;
}

// Event definitions
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: { text: string, actionId: string }[];
}

export interface Dialogue {
  id: string;
  speaker: string;
  text: string;
}

export interface GameState {
  player: PlayerState;
  dungeon: DungeonState;
  enemies: EnemyInstance[];
  logs: LogEntry[];
  
  currentEvent: GameEvent | null;
  activeDialogue: Dialogue | null;
  
  isGameOver: boolean;
}

export const INITIAL_GAME_STATE: GameState = {
    player: {
        name: '',
        job: 'none',
        god: 'none',
        level: 1,
        exp: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        stats: {
            hp: 100, maxHp: 100, mp: 50, maxMp: 50,
            str: 5, vit: 5, dex: 5, agi: 5, int: 5, wis: 5,
            attack: 10, defense: 5, magicAttack: 10, magicDefense: 5, speed: 10,
            hitRate: 95, evasion: 5, critRate: 5
        },
        position: { x: 1, y: 1 },
        gold: 0,
        inventory: Array(20).fill(null),
        maxInventorySize: 20,
        equipment: { mainHand: null, offHand: null, armor: null, accessory: null },
        skillPoints: 0,
        statPoints: 0,
        skills: {},
        mastery: {},
        statusEffects: []
    },
    dungeon: {
        floor: 0,
        map: [],
        visited: [],
        items: []
    },
    enemies: [],
    logs: [],
    currentEvent: null,
    activeDialogue: null,
    isGameOver: false
};
