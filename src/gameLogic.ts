import { Job, Gender, PlayerEntity, EnemyEntity, ChunkData, Tile, TileType, Item, Rarity, EquipmentType, WeaponStyle } from './types';
import { JOB_DATA, ENEMY_TYPES, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS } from './data';
import { THEME, GAME_CONFIG } from './config';

// Utils を再エクスポートする代わりに、App.tsx で直接 utils からインポートするように変更します。
// ここでは gameLogic 固有の処理のみをエクスポートします。

export const generateRandomItem = (level: number, rankBonus: number = 0): Item | null => {
  let roll = Math.random() * 100 - rankBonus * 5;
  let rarity: Rarity = roll < 1 ? 'Legendary' : roll < 5 ? 'Epic' : roll < 15 ? 'Rare' : roll < 40 ? 'Uncommon' : 'Common';
  const types: EquipmentType[] = ['Weapon', 'Helm', 'Armor', 'Shield', 'Boots'];
  const type = types[Math.floor(Math.random() * types.length)];
  let subType: WeaponStyle | undefined;
  if (type === 'Weapon') subType = (['OneHanded', 'TwoHanded', 'DualWield'] as WeaponStyle[])[Math.floor(Math.random() * 3)];

  const mult = RARITY_MULTIPLIERS[rarity];
  const baseVal = level * 2;
  const stats = { attack: 0, defense: 0, speed: 0, maxHp: 0 };

  if (type === 'Weapon') {
    stats.attack = Math.floor(baseVal * 3 * mult);
    if (subType === 'TwoHanded') stats.attack = Math.floor(stats.attack * 1.5);
    if (subType === 'DualWield') { stats.attack = Math.floor(stats.attack * 0.8); stats.speed = 1; }
  } else if (type === 'Armor') { stats.defense = Math.floor(baseVal * 2 * mult); stats.maxHp = Math.floor(baseVal * 5 * mult);
  } else if (type === 'Helm') { stats.defense = Math.floor(baseVal * 1 * mult); stats.maxHp = Math.floor(baseVal * 2 * mult);
  } else if (type === 'Shield') { stats.defense = Math.floor(baseVal * 2.5 * mult);
  } else if (type === 'Boots') { stats.defense = Math.floor(baseVal * 0.5 * mult); stats.speed = Number((0.2 * mult).toFixed(1)); }

  const enchantments: any[] = [];
  const enchantCount = Math.floor(Math.random() * (ENCHANT_SLOTS[rarity] + 1));
  for (let i = 0; i < enchantCount; i++) {
    const eType = (['Attack', 'Defense', 'Speed', 'MaxHp'] as const)[Math.floor(Math.random() * 4)];
    const strIdx = Math.floor(Math.random() * 3);
    const strength = (['Weak', 'Medium', 'Strong'] as const)[strIdx];
    let val = 0;
    if (eType === 'Attack' || eType === 'Defense') val = Math.floor(level * (strIdx + 1));
    else if (eType === 'MaxHp') val = Math.floor(level * 5 * (strIdx + 1));
    else if (eType === 'Speed') val = Number((0.1 * (strIdx + 1)).toFixed(1));
    const name = `${{Weak:'微かな',Medium:'普通の',Strong:'強力な'}[strength]}${{Attack:'攻撃',Defense:'防御',Speed:'敏捷',MaxHp:'体力'}[eType]}`;
    enchantments.push({ type: eType, value: val, strength, name });
    if (eType === 'Attack') stats.attack += val; else if (eType === 'Defense') stats.defense += val; else if (eType === 'MaxHp') stats.maxHp += val; else if (eType === 'Speed') stats.speed += val;
  }
  let name = rarity === 'Common' ? '' : `${rarity} `;
  // @ts-ignore
  if (type === 'Weapon') name += ITEM_BASE_NAMES[type][subType!]; else name += ITEM_BASE_NAMES[type];
  // @ts-ignore
  const icon = type === 'Weapon' ? ICONS.Weapon[subType!] : ICONS[type];
  
  return { id: crypto.randomUUID(), name, type, subType, rarity, level, stats, enchantments, icon, color: THEME.colors.rarity[rarity] };
};

export const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  return {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 0, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4 }
  };
};

export const generateEnemy = (x: number, y: number, level: number): EnemyEntity => {
  const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let scale = 1 + (level * 0.1);
  let color = type.color;
  if (rankRoll < 0.05) { rank = 'Boss'; scale *= 3; color = '#ff0000'; } else if (rankRoll < 0.2) { rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; }
  return {
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name, rank, x, y, width: type.w * (rank === 'Boss' ? 1.5 : 1), height: type.h * (rank === 'Boss' ? 1.5 : 1),
    visualWidth: type.vw! * (rank === 'Boss' ? 1.5 : 1), visualHeight: type.vh! * (rank === 'Boss' ? 1.5 : 1), color, shape: type.shape as any,
    hp: Math.floor(type.hp * scale), maxHp: Math.floor(type.hp * scale), attack: Math.floor(type.atk * scale), defense: Math.floor(level * 2), speed: type.spd,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 350, xpValue: Math.floor(type.xp * scale * (rank === 'Boss' ? 5 : rank === 'Elite' ? 2 : 1))
  };
};

const getBiome = (wx: number, wy: number): any => {
  if (wx === 0 && wy === 0) return 'Town';
  if (wy < -1) return 'Snow';
  if (wy > 1) return 'Desert';
  if (Math.abs(wx) > 2) return 'Wasteland';
  return 'Plains';
};

export const generateChunk = (wx: number, wy: number): ChunkData => {
  const biome = getBiome(wx, wy);
  const width = GAME_CONFIG.MAP_WIDTH;
  const height = GAME_CONFIG.MAP_HEIGHT;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
      let type: TileType = 'grass';
      if (biome === 'Snow') type = 'snow'; else if (biome === 'Desert') type = 'sand'; else if (biome === 'Wasteland') type = 'dirt'; else if (biome === 'Town') type = 'floor';
      if (biome !== 'Town' && Math.random() < 0.05) type = Math.random() > 0.5 ? 'dirt' : 'rock';
      return { x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE, type, solid: false };
    })
  );
  
  if (biome === 'Town') {
     for(let y=0; y<height; y++) {
      for(let x=0; x<width; x++) {
        if (x===0 || x===width-1 || y===0 || y===height-1) {
          if (!((x === 0 || x === width-1) && Math.abs(y - height/2) < 3) && !((y === 0 || y === height-1) && Math.abs(x - width/2) < 3)) { 
            map[y][x].type = 'wall'; map[y][x].solid = true; 
          }
        }
      }
    }
  }

  if (wx === 1 && wy === 0) {
      map[10][10] = { x: 10 * GAME_CONFIG.TILE_SIZE, y: 10 * GAME_CONFIG.TILE_SIZE, type: 'dungeon_entrance', solid: false, teleportTo: 'dungeon_1' };
  }

  return { map, enemies: [], droppedItems: [], biome, locationId: `world_${wx}_${wy}` };
};

export const generateWorldMap = (): ChunkData => {
    return generateChunk(0, 0);
};

export const generateTownMap = (id: string): ChunkData => {
  const width = 30; const height = 20;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    let type: TileType = 'floor';
    let solid = false;
    if (x===0 || x===width-1 || y===0 || y===height-1) { type='wall'; solid=true; }
    if (y===height-1 && Math.abs(x - width/2) < 2) { type='portal_out'; solid=false; }
    return { x: x * 32, y: y * 32, type, solid, teleportTo: type === 'portal_out' ? 'world' : undefined };
  }));

  map[5][5].type = 'wall'; map[5][5].solid = true; 
  map[5][6].type = 'wall'; map[5][6].solid = true;

  return { map, enemies: [], droppedItems: [], biome: 'Town', locationId: id };
};

export const generateDungeonMap = (id: string, level: number): ChunkData => {
  const width = 40; const height = 30;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
     let type: TileType = 'dirt';
     if (Math.random() < 0.2) type = 'rock';
     if (x===0 || x===width-1 || y===0 || y===height-1) type='wall';
     return { x: x*32, y: y*32, type, solid: type === 'wall' || type === 'rock', teleportTo: undefined };
  }));

  const midX = Math.floor(width/2);
  map[0][midX].type='portal_out'; map[0][midX].solid=false; map[0][midX].teleportTo='world';

  const enemies: EnemyEntity[] = [];
  for(let i=0; i<10; i++) {
     let ex, ey;
     do { ex = Math.floor(Math.random()*width); ey = Math.floor(Math.random()*height); } while(map[ey][ex].solid || (ex===midX && ey<5));
     enemies.push(generateEnemy(ex*32, ey*32, level));
  }

  return { map, enemies, droppedItems: [], biome: 'Dungeon', locationId: id };
};

export const getMapData = (locationId: string): ChunkData => {
  if (locationId === 'world') return generateChunk(0, 0); 
  if (locationId === 'town_start') return generateTownMap('town_start');
  if (locationId.startsWith('dungeon_')) return generateDungeonMap(locationId, 1);
  return generateChunk(0, 0);
};

export const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = attr.vitality * 10, maxMp = attr.intelligence * 5, baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5), baseDef = Math.floor(attr.endurance * 1.2), baseSpd = 3 + (attr.dexterity * 0.05);
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { if (item) { equipAtk += item.stats.attack; equipDef += item.stats.defense; equipSpd += item.stats.speed; equipHp += item.stats.maxHp; } });
  player.calculatedStats = { maxHp: maxHp + equipHp, maxMp: maxMp, attack: baseAtk + equipAtk, defense: baseDef + equipDef, speed: baseSpd + equipSpd };
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; if (player.mp > player.maxMp) player.mp = player.maxMp;
};
