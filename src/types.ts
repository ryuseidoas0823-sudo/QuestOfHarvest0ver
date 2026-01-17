export type TileType = 'grass' | 'dirt' | 'wall' | 'water' | 'floor' | 'portal_out' | 'town_entrance' | 'sand' | 'snow' | 'rock' | 'stairs_down' | 'town_floor';
export type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'particle' | 'text' | 'drop';
export type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage' | 'Rogue' | 'Cleric';
export type Gender = 'Male' | 'Female';
export type ShapeType = 'humanoid' | 'beast' | 'slime' | 'large' | 'insect' | 'ghost' | 'demon' | 'dragon' | 'flying' | 'circle' | 'rect';
export type Biome = 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland' | 'Town' | 'Dungeon';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots' | 'Consumable' | 'Material';
export type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield' | 'Ranged' | 'Magic';
export type MenuType = 'none' | 'status' | 'inventory' | 'stats' | 'shop'; 
export type ResolutionMode = 'auto' | '800x600' | '1024x768' | '1280x720';

export interface Tile { x: number; y: number; type: TileType; solid: boolean; }
export interface Enchantment { type: 'Attack' | 'Defense' | 'Speed' | 'MaxHp'; value: number; strength: 'Weak' | 'Medium' | 'Strong'; name: string; }
export interface ItemStats { attack: number; defense: number; speed: number; maxHp: number; }
export interface Item { 
  id: string; 
  name: string; 
  type: EquipmentType; 
  subType?: WeaponStyle; 
  rarity: Rarity; 
  level: number; 
  stats: ItemStats; 
  enchantments: Enchantment[]; 
  icon: string; 
  color: string; 
  weaponClass?: any;
}

export interface Entity { id: string; x: number; y: number; width: number; height: number; visualWidth?: number; visualHeight?: number; color: string; type: EntityType; dead: boolean; vx?: number; vy?: number; }
export interface DroppedItem extends Entity { type: 'drop'; item: Item; life: number; bounceOffset: number; }
export interface CombatEntity extends Entity { hp: number; maxHp: number; level: number; attack: number; defense: number; speed: number; lastAttackTime: number; attackCooldown: number; isAttacking?: boolean; direction: number; shape?: ShapeType; }
export interface Attributes { vitality: number; strength: number; dexterity: number; intelligence: number; endurance: number; luck?: number; }
export interface PerkData { id: string; name: string; description: string; level: number; maxLevel: number; }

export interface PlayerEntity extends CombatEntity { 
  job: Job; 
  gender: Gender; 
  xp: number; 
  nextLevelXp: number; 
  gold: number; 
  maxMp: number; 
  mp: number; 
  stamina: number;
  lastStaminaUse: number;
  statPoints: number; 
  attributes: Attributes; 
  inventory: Item[]; 
  equipment: { mainHand?: Item; offHand?: Item; helm?: Item; armor?: Item; boots?: Item; }; 
  perks: PerkData[];
  calculatedStats: { maxHp: number; maxMp: number; attack: number; defense: number; speed: number; maxStamina: number; staminaRegen: number; attackCooldown: number; }; 
}

export interface EnemyEntity extends CombatEntity { 
  targetId?: string; 
  detectionRange: number; 
  race: string; 
  xpValue: number; 
  rank: 'Normal' | 'Elite' | 'Boss'; 
  statusEffects: any[];
}

export interface Particle extends Entity { life: number; maxLife: number; size: number; }
export interface FloatingText extends Entity { text: string; life: number; color: string; }
export interface Projectile extends Entity { damage: number; ownerId: string; life: number; }

export interface ChunkData { map: Tile[][]; enemies: EnemyEntity[]; droppedItems: DroppedItem[]; biome: Biome; }
export interface GameState { 
  worldX: number; 
  worldY: number; 
  currentBiome: Biome; 
  savedChunks: Record<string, ChunkData>; 
  map: Tile[][]; 
  player: PlayerEntity; 
  enemies: EnemyEntity[]; 
  droppedItems: DroppedItem[]; 
  projectiles: Projectile[]; 
  particles: Particle[]; 
  floatingTexts: FloatingText[]; 
  camera: { x: number; y: number }; 
  gameTime: number; 
  isPaused: boolean; 
  wave: number; 
  activeShop?: any;
}
