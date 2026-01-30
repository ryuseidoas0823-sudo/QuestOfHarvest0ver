import { Position } from './input';

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'potion' | 'material';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type Tier = 1 | 2 | 3;

export interface ItemStats {
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;
  hp?: number;
  mp?: number;
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  int?: number;
  wis?: number;
  critRate?: number;
  evasion?: number;
  // ...other stats as needed
}

export interface Enchant {
  id: string;
  name: string;
  description: string;
  stats: ItemStats;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  rarity: Rarity;
  tier: Tier;
  price: number;
  stackable: boolean;
  quantity: number;
  icon?: string;
  
  // Equipment specific
  baseStats?: ItemStats;
  stats?: ItemStats; // Total including enchants
  enchants?: Enchant[];
  setId?: string;
  
  // Consumable specific
  effectValue?: number; // Heal amount etc.
}

export interface Equipment extends Item {
  type: 'weapon' | 'armor' | 'accessory';
}

// Item dropped in dungeon
export interface ItemInstance extends Item {
  position: Position;
}
