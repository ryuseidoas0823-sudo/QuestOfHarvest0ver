import { Job, Gender, PlayerEntity, EnemyEntity, ChunkData, Tile, TileType, Item, Rarity, EquipmentType, WeaponStyle, Biome } from './types';
import { JOB_DATA, ENEMY_TYPES, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS } from './data';
import { THEME, GAME_CONFIG } from './config';

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(array: T[]): T {
    return array[this.range(0, array.length - 1)];
  }
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

export const getStarterItem = (job: Job): Item => {
  const id = crypto.randomUUID();
  const level = 1;
  const rarity: Rarity = 'Common';
  const stats = { attack: 3, defense: 0, speed: 0, maxHp: 0 };
  let name = '錆びた剣', subType: WeaponStyle = 'OneHanded', icon = '⚔️';

  switch (job) {
    case 'Swordsman': stats.attack = 5; break;
    case 'Warrior': name = '錆びた斧'; subType = 'TwoHanded'; icon = '🪓'; stats.attack = 8; stats.speed = -0.5; break;
    case 'Archer': name = '練習用の弓'; subType = 'TwoHanded'; icon = '🏹'; stats.attack = 4; stats.speed = 1; break;
    case 'Mage': name = '古びた杖'; subType = 'OneHanded'; icon = '🪄'; stats.attack = 3; stats.maxHp = 5; break;
  }

  return { id, name, type: 'Weapon', subType, rarity, level, stats, enchantments: [], icon, color: '#b0b0b0' };
};

export const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  const player: PlayerEntity = {
    id: 'player', type: 'player', x: 0, y: 0, width: 24, height: 24, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 5, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 400, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 5, speed: 4 },
    animFrame: 0, isMoving: false
  };
  const starterWeapon = getStarterItem(job);
  player.inventory.push(starterWeapon);
  player.equipment.mainHand = starterWeapon;
  updatePlayerStats(player);
  return player;
};

export const generateEnemy = (x: number, y: number, level: number, allowedTypes?: string[]): EnemyEntity => {
  const candidates = allowedTypes ? ENEMY_TYPES.filter(e => allowedTypes.includes(e.name)) : ENEMY_TYPES;
  const type = candidates[Math.floor(Math.random() * candidates.length)] || ENEMY_TYPES[0];
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal', scale = 1 + (level * 0.1), color = type.color;
  if (rankRoll < 0.05) { rank = 'Boss'; scale *= 2.5; color = '#ff0000'; } else if (rankRoll < 0.2) { rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; }
  
  return {
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name, rank, x, y, 
    width: (type.w || 24), height: (type.h || 24),
    visualWidth: (type.vw || 32) * (rank === 'Boss' ? 2 : 1), visualHeight: (type.vh || 32) * (rank === 'Boss' ? 2 : 1), 
    color, shape: (type.shape || 'slime') as any,
    hp: Math.floor((type.hp || 20) * scale), maxHp: Math.floor((type.hp || 20) * scale), 
    attack: Math.floor((type.atk || 5) * scale), defense: Math.floor(level * 1.5), speed: type.spd || 2,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 300, xpValue: Math.floor((type.xp || 10) * scale),
    animFrame: 0, isMoving: false
  };
};

export const generateTownMap = (id: string): ChunkData => {
  const width = 60; const height = 50; 
  const tileSize = 32;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    let type: TileType = 'grass', solid = false;
    if (x===0 || x===width-1 || y===0 || y===height-1) { type='tree'; solid=true; }
    if (y===height-1 && Math.abs(x - width/2) < 2) { type='portal_out'; solid=false; }
    return { x: x * tileSize, y: y * tileSize, type, solid, teleportTo: type === 'portal_out' ? 'world' : undefined };
  }));

  const centerX = Math.floor(width/2);
  const centerY = Math.floor(height/2);

  const enemies: EnemyEntity[] = [];
  const addNPC = (x: number, y: number, role: string, color: string = '#3b82f6') => {
      const npc: EnemyEntity = {
          id: `npc_${role}_${crypto.randomUUID()}`, type: 'enemy', race: 'Human', rank: 'Normal',
          x: x * tileSize, y: y * tileSize, width: 24, height: 24, visualWidth: 32, visualHeight: 56, color, shape: 'humanoid',
          hp: 999, maxHp: 999, attack: 0, defense: 999, speed: 0, level: 1, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 999999,
          detectionRange: 0, xpValue: 0, animFrame: 0, isMoving: false
      };
      // @ts-ignore
      npc.isNPC = true; npc.npcRole = role;
      enemies.push(npc);
  };

  const placeBuilding = (bx: number, by: number, bw: number, bh: number, name: string) => {
      for(let y=by; y<by+bh; y++) for(let x=bx; x<bx+bw; x++) { map[y][x].type = 'floor'; map[y][x].solid = false; }
      for(let x=bx; x<bx+bw; x++) { map[by][x].type = 'wall'; map[by][x].solid = true; map[by+bh-1][x].type = 'wall'; map[by+bh-1][x].solid = true; }
      for(let y=by; y<by+bh; y++) { map[y][bx].type = 'wall'; map[y][bx].solid = true; map[y][bx+bw-1].type = 'wall'; map[y][bx+bw-1].solid = true; }
      const doorX = Math.floor(bx + bw/2);
      map[by+bh-1][doorX].type = 'floor'; map[by+bh-1][doorX].solid = false;

      if (name === 'home') addNPC(bx + 2, by + 2, 'Mom', '#ec4899');
      else if (name === 'weapon_shop') addNPC(bx + Math.floor(bw/2), by + 1, 'WeaponMerchant', '#ef4444');
  };

  // 建物を配置
  placeBuilding(5, 5, 8, 7, 'home'); // 修正: スポーン地点（15, 15）から離した
  placeBuilding(centerX - 10, centerY - 10, 8, 6, 'weapon_shop');
  
  // 道の作成
  for(let y=5; y<height-1; y++) for(let dx=-1; dx<=1; dx++) map[y][centerX+dx].type = 'dirt';
  for(let x=5; x<width-5; x++) for(let dy=-1; dy<=1; dy++) map[centerY+dy][x].type = 'dirt';

  // 修正: 最後にスポーン地点周辺を確実にクリアにする
  for (let sy = 13; sy <= 17; sy++) {
    for (let sx = 13; sx <= 17; sx++) {
        map[sy][sx].type = 'floor';
        map[sy][sx].solid = false;
    }
  }

  return { map, enemies, droppedItems: [], biome: 'Town', locationId: id };
};

export const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = (attr.vitality || 10) * 10;
  let maxMp = (attr.intelligence || 10) * 5;
  let baseAtk = Math.floor((attr.strength || 10) * 1.5 + (attr.dexterity || 10) * 0.5);
  let baseDef = Math.floor((attr.endurance || 10) * 1.2);
  let baseSpd = 3.5 + ((attr.dexterity || 10) * 0.05);
  
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { 
    if (item && item.stats) { 
      equipAtk += (item.stats.attack || 0); equipDef += (item.stats.defense || 0); equipSpd += (item.stats.speed || 0); equipHp += (item.stats.maxHp || 0); 
    } 
  });
  
  player.calculatedStats = { maxHp: maxHp + equipHp, maxMp: maxMp, attack: baseAtk + equipAtk, defense: baseDef + equipDef, speed: baseSpd + equipSpd };
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; 
};

export const generateWorldMap = (): ChunkData => {
  const width = 320, height = 200, tileSize = GAME_CONFIG.TILE_SIZE;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => ({ x: x * tileSize, y: y * tileSize, type: 'water', solid: true })));
  // 地形生成の簡略版（本来はSeedベースの複雑なもの）
  for(let y=20; y<height-20; y++) for(let x=20; x<width-20; x++) { map[y][x].type = 'grass'; map[y][x].solid = false; }
  map[60][210].type = 'town_entrance'; map[60][210].teleportTo = 'town_start';
  return { map, enemies: [], droppedItems: [], biome: 'WorldMap', locationId: 'world' };
};

export const getMapData = (id: string) => id === 'world' ? generateWorldMap() : generateTownMap(id);
