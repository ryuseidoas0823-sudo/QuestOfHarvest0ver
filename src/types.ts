export type TileType = 'grass' | 'dirt' | 'wall' | 'water' | 'floor' | 'portal_out' | 'town_entrance' | 'dungeon_entrance' | 'sand' | 'snow' | 'rock';
export type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'particle' | 'text' | 'drop';
export type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
export type Gender = 'Male' | 'Female';
export type ShapeType = 'humanoid' | 'beast' | 'slime' | 'large' | 'insect' | 'ghost' | 'demon' | 'dragon' | 'flying';
export type Biome = 'WorldMap' | 'Town' | 'Dungeon' | 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots';
export type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield';
export type MenuType = 'none' | 'status' | 'inventory' | 'stats'; 
export type ResolutionMode = 'auto' | '800x600' | '1024x768' | '1280x720';

export interface Tile { x: number; y: number; type: TileType; solid: boolean; teleportTo?: string; }
export interface Enchantment { type: 'Attack' | 'Defense' | 'Speed' | 'MaxHp'; value: number; strength: 'Weak' | 'Medium' | 'Strong'; name: string; }
export interface Item { id: string; name: string; type: EquipmentType; subType?: WeaponStyle; rarity: Rarity; level: number; stats: { attack: number; defense: number; speed: number; maxHp: number; }; enchantments: Enchantment[]; icon: string; color: string; }
export interface Entity { id: string; x: number; y: number; width: number; height: number; visualWidth?: number; visualHeight?: number; color: string; type: EntityType; dead: boolean; vx?: number; vy?: number; }
export interface DroppedItem extends Entity { type: 'drop'; item: Item; life: number; bounceOffset: number; }
export interface CombatEntity extends Entity { hp: number; maxHp: number; level: number; attack: number; defense: number; speed: number; lastAttackTime: number; attackCooldown: number; isAttacking?: boolean; direction: number; shape?: ShapeType; }
export interface Attributes { vitality: number; strength: number; dexterity: number; intelligence: number; endurance: number; }
export interface PlayerEntity extends CombatEntity { job: Job; gender: Gender; xp: number; nextLevelXp: number; gold: number; maxMp: number; mp: number; statPoints: number; attributes: Attributes; inventory: Item[]; equipment: { mainHand?: Item; offHand?: Item; helm?: Item; armor?: Item; boots?: Item; }; calculatedStats: { maxHp: number; maxMp: number; attack: number; defense: number; speed: number; }; }
export interface EnemyEntity extends CombatEntity { targetId?: string; detectionRange: number; race: string; xpValue: number; rank: 'Normal' | 'Elite' | 'Boss'; }
export interface Particle extends Entity { life: number; maxLife: number; size: number; }
export interface FloatingText extends Entity { text: string; life: number; color: string; }
export interface Projectile extends Entity { damage: number; ownerId: string; life: number; }
export interface ChunkData { map: Tile[][]; enemies: EnemyEntity[]; droppedItems: DroppedItem[]; biome: Biome; locationId: string; }

export interface GameState { 
  worldX: number;
  worldY: number;
  currentBiome: Biome;
  locationId: string;
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
  lastWorldPos?: { x: number, y: number };
}
