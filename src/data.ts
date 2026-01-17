export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Boots' | 'Consumable' | 'Material';
export type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'Ranged' | 'Magic';

export interface WeaponClass {
  style: WeaponStyle;
  damageType: 'Physical' | 'Magical';
}

export interface Enchantment {
  name: string;
  description: string;
}

export interface ItemStats {
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
}

export interface Item {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: Rarity;
  level: number;
  stats: ItemStats;
  enchantments: Enchantment[];
  icon: string;
  color: string;
  weaponClass?: WeaponClass;
}

export interface Attributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  endurance: number;
  luck: number;
}

export interface CalculatedStats {
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  maxStamina: number;
  staminaRegen: number;
  attackCooldown: number;
}

export type Job = 'Warrior' | 'Mage' | 'Rogue' | 'Cleric';
export type Gender = 'Male' | 'Female';

export interface PerkData {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: string;
  dead: boolean;
}

export interface CombatEntity extends Entity {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  lastAttackTime: number;
  attackCooldown: number;
  direction: number; // 1: right, -1: left
}

export interface PlayerEntity extends CombatEntity {
  type: 'player';
  job: Job;
  gender: Gender;
  xp: number;
  nextLevelXp: number;
  gold: number;
  mp: number;
  maxMp: number;
  stamina: number;
  lastStaminaUse: number;
  statPoints: number;
  attributes: Attributes;
  inventory: Item[];
  equipment: {
    mainHand?: Item;
    offHand?: Item;
    helm?: Item;
    armor?: Item;
    boots?: Item;
  };
  perks: PerkData[];
  calculatedStats: CalculatedStats;
  isAttacking?: boolean;
}

export interface EnemyEntity extends CombatEntity {
  type: 'enemy';
  detectionRange: number;
  race: string;
  xpValue: number;
  rank: 'Normal' | 'Elite' | 'Boss';
  statusEffects: any[];
}

export interface DroppedItem extends Entity {
  type: 'drop';
  item: Item;
  life: number;
  bounceOffset: number;
}

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  solid: boolean;
}

export type TileType = 'wall' | 'floor' | 'grass' | 'water' | 'stairs_down' | 'town_floor';
export type Biome = 'Forest' | 'Dungeon' | 'Town';
export type ShapeType = 'circle' | 'rect';
export type LightSource = any;

export interface FloorData {
  map: Tile[][];
  enemies: EnemyEntity[];
  resources: any[];
  droppedItems: DroppedItem[];
  biome: Biome;
  level: number;
  lights: LightSource[];
  entryPos?: {x: number, y: number};
}

export interface GameState extends FloorData {
  dungeonLevel: number;
  currentBiome: Biome;
  player: PlayerEntity;
  projectiles: any[];
  particles: any[];
  floatingTexts: any[];
  camera: { x: number, y: number };
  gameTime: number;
  isPaused: boolean;
  levelUpOptions: any;
  activeShop: any;
  activeBossId: any;
  inWorldMap: boolean;
  worldPlayerPos: {x: number, y: number};
  currentLocationId: string;
}
