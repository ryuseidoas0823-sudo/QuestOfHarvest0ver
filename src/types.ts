export type TileType = 'grass' | 'dirt' | 'wall' | 'water' | 'floor' | 'portal_out' | 'town_entrance' | 'sand' | 'snow' | 'rock' | 'stairs_down' | 'dungeon_entrance' | 'return_portal' | 'town_floor' | 'world_grass' | 'world_forest' | 'world_mountain' | 'world_water' | 'world_town' | 'world_dungeon';
export type EntityType = 'player' | 'enemy' | 'npc' | 'projectile' | 'particle' | 'text' | 'drop' | 'resource';
export type Job = 'Swordsman' | 'Warrior' | 'Archer' | 'Mage';
export type Gender = 'Male' | 'Female';
export type ShapeType = 'humanoid' | 'beast' | 'slime' | 'large' | 'insect' | 'ghost' | 'demon' | 'dragon' | 'flying';
export type Biome = 'Plains' | 'Forest' | 'Desert' | 'Snow' | 'Wasteland' | 'Town' | 'Dungeon';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EquipmentType = 'Weapon' | 'Helm' | 'Armor' | 'Shield' | 'Boots' | 'Consumable' | 'Material';
export type WeaponStyle = 'OneHanded' | 'TwoHanded' | 'DualWield';
export type WeaponClass = 'Sword' | 'Axe' | 'Bow' | 'Staff' | 'Wand';
export type MenuType = 'none' | 'status' | 'inventory' | 'stats' | 'level_up' | 'crafting' | 'shop'; 
export type ResolutionMode = 'auto' | '800x600' | '1024x768' | '1280x720';
export type EnchantType = 'Attack' | 'Defense' | 'Speed' | 'MaxHp' | 'Fire' | 'Ice' | 'Paralysis' | 'Range';

export interface Enchantment { type: EnchantType; value: number; strength: 'Weak' | 'Medium' | 'Strong'; name: string; }
export interface Tile { x: number; y: number; type: TileType; solid: boolean; }
export interface Item { id: string; name: string; type: EquipmentType; subType?: WeaponStyle; weaponClass?: WeaponClass; rarity: Rarity; level: number; stats: { attack: number; defense: number; speed: number; maxHp: number; }; enchantments: Enchantment[]; icon: string; color: string; count?: number; }
export interface Entity { id: string; x: number; y: number; width: number; height: number; visualWidth?: number; visualHeight?: number; color: string; type: EntityType; dead: boolean; vx?: number; vy?: number; }
export interface DroppedItem extends Entity { type: 'drop'; item: Item; life: number; bounceOffset: number; }
export interface CombatEntity extends Entity { hp: number; maxHp: number; level: number; attack: number; defense: number; speed: number; lastAttackTime: number; attackCooldown: number; isAttacking?: boolean; direction: number; shape?: ShapeType; }
export interface Attributes { vitality: number; strength: number; dexterity: number; intelligence: number; endurance: number; }
export interface ResourceEntity extends Entity { type: 'resource'; resourceType: 'tree' | 'rock' | 'ore'; hp: number; maxHp: number; }
export interface LightSource { x: number; y: number; radius: number; flicker: boolean; color: string; }
export interface StatusEffect { type: 'burn' | 'freeze' | 'paralysis'; duration: number; power: number; }

export interface EnemyEntity extends CombatEntity { 
  targetId?: string; detectionRange: number; race: string; xpValue: number; rank: 'Normal' | 'Elite' | 'Boss'; statusEffects: StatusEffect[]; 
}

export interface Particle extends Entity { life: number; maxLife: number; size: number; }
export interface FloatingText extends Entity { text: string; life: number; color: string; }
export interface Projectile extends Entity { damage: number; ownerId: string; life: number; color: string; }

export interface FloorData { 
  map: Tile[][]; enemies: EnemyEntity[]; resources: ResourceEntity[]; droppedItems: DroppedItem[]; biome: Biome; level: number; lights: LightSource[]; 
  shopZones?: {x:number, y:number, w:number, h:number, type:'blacksmith'|'general'}[]; bossId?: string | null; entryPos?: {x:number, y:number}; 
}

export interface WorldLocation { id: string; name: string; type: 'Town' | 'Dungeon'; x: number; y: number; icon: string; color: string; biome: Biome; difficulty: number; }

export interface PerkData { id: string; name: string; desc: string; rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'; icon: any; color: string; }

export interface PlayerEntity extends CombatEntity { 
  job: Job; gender: Gender; xp: number; nextLevelXp: number; gold: number; maxMp: number; mp: number; statPoints: number; 
  attributes: Attributes; 
  inventory: Item[]; 
  equipment: { mainHand?: Item; offHand?: Item; helm?: Item; armor?: Item; boots?: Item; }; 
  calculatedStats: { maxHp: number; maxMp: number; attack: number; defense: number; speed: number; maxStamina: number; staminaRegen: number; attackCooldown: number; };
  perks: { id: string; level: number }[]; 
  stamina: number; lastStaminaUse: number;
}

export interface GameState { 
  dungeonLevel: number; currentBiome: Biome; map: Tile[][]; player: PlayerEntity; 
  enemies: EnemyEntity[]; resources: ResourceEntity[]; droppedItems: DroppedItem[]; projectiles: Projectile[]; particles: Particle[]; floatingTexts: FloatingText[]; 
  camera: { x: number; y: number }; gameTime: number; isPaused: boolean; 
  levelUpOptions: PerkData[] | null; lights: LightSource[]; 
  shopZones?: {x:number, y:number, w:number, h:number, type:'blacksmith'|'general'}[]; 
  activeShop: 'blacksmith' | 'general' | null; activeBossId: string | null;
  inWorldMap: boolean; worldPlayerPos: { x: number, y: number }; currentLocationId: string;
}
