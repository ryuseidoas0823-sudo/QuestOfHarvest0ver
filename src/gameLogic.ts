import { Job, Gender, PlayerEntity, EnemyEntity, ChunkData, Tile, TileType, Item, Rarity, EquipmentType, WeaponStyle, Biome } from './types';
import { JOB_DATA, ENEMY_TYPES, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS } from './data';
import { THEME, GAME_CONFIG } from './config';

// 決定論的乱数生成クラス (Linear Congruential Generator)
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
  
  let name = '錆びた剣';
  let subType: WeaponStyle = 'OneHanded';
  let icon = '⚔️';

  switch (job) {
    case 'Swordsman':
      name = '錆びた剣';
      subType = 'OneHanded';
      icon = '⚔️';
      stats.attack = 5;
      break;
    case 'Warrior':
      name = '錆びた斧';
      subType = 'TwoHanded';
      icon = '🪓';
      stats.attack = 8;
      stats.speed = -0.5;
      break;
    case 'Archer':
      name = '練習用の弓';
      subType = 'TwoHanded';
      icon = '🏹';
      stats.attack = 4;
      stats.speed = 1;
      break;
    case 'Mage':
      name = '古びた杖';
      subType = 'OneHanded';
      icon = '🪄';
      stats.attack = 3;
      stats.maxHp = 5;
      break;
  }

  return {
    id, name, type: 'Weapon', subType, rarity, level, stats, enchantments: [], icon, color: '#b0b0b0'
  };
};

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
  const player: PlayerEntity = {
    id: 'player', type: 'player', x: 0, y: 0, width: 24, height: 24, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 5, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 400, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 5, speed: 4 }
  };
  
  // 初期武器を生成して装備
  const starterWeapon = getStarterItem(job);
  player.inventory.push(starterWeapon);
  player.equipment.mainHand = starterWeapon;
  updatePlayerStats(player);
  
  return player;
};

export const generateEnemy = (x: number, y: number, level: number, allowedTypes?: string[]): EnemyEntity => {
  const candidates = allowedTypes 
    ? ENEMY_TYPES.filter(e => allowedTypes.includes(e.name))
    : ENEMY_TYPES;
    
  const type = candidates[Math.floor(Math.random() * candidates.length)] || ENEMY_TYPES[0];
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let scale = 1 + (level * 0.1);
  let color = type.color;
  if (rankRoll < 0.05) { rank = 'Boss'; scale *= 3; color = '#ff0000'; } else if (rankRoll < 0.2) { rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; }
  
  return {
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name, rank, x, y, 
    width: (type.w || 24) * (rank === 'Boss' ? 1.5 : 1), 
    height: (type.h || 24) * (rank === 'Boss' ? 1.5 : 1),
    visualWidth: (type.vw || 32) * (rank === 'Boss' ? 1.5 : 1), 
    visualHeight: (type.vh || 32) * (rank === 'Boss' ? 1.5 : 1), 
    color, 
    shape: (type.shape || 'slime') as any,
    hp: Math.max(10, Math.floor((type.hp || 20) * scale)), 
    maxHp: Math.max(10, Math.floor((type.hp || 20) * scale)), 
    attack: Math.max(1, Math.floor((type.atk || 5) * scale)), 
    defense: Math.floor(level * 1.5), 
    speed: type.spd || 2,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 350, xpValue: Math.floor((type.xp || 10) * scale * (rank === 'Boss' ? 5 : rank === 'Elite' ? 2 : 1))
  };
};

// --- Map Generators ---

/**
 * 固定シードを使用した決定論的なワールドマップ生成
 * サイズを4倍 (320x200) に拡大し、各大陸をスケールアップ
 */
export const generateOverworld = (): ChunkData => {
  const rng = new SeededRandom(20240923); 
  const width = 320;
  const height = 200;
  const tileSize = GAME_CONFIG.TILE_SIZE;
  
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    return { x: x * tileSize, y: y * tileSize, type: 'water', solid: true, teleportTo: undefined };
  }));

  const isValid = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;

  const drawLand = (cx: number, cy: number, rx: number, ry: number, type: TileType = 'grass') => {
      for (let y = cy - ry; y <= cy + ry; y++) {
          for (let x = cx - rx; x <= cx + rx; x++) {
              if (!isValid(x, y)) continue;
              if (Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) <= 1) {
                  if (rng.chance(0.92)) {
                    map[y][x].type = type;
                    map[y][x].solid = false;
                  }
              }
          }
      }
  };

  drawLand(200, 60, 80, 50, 'grass'); // ユーラシア
  drawLand(150, 50, 30, 30, 'grass'); 
  drawLand(240, 50, 45, 35, 'snow');  
  drawLand(170, 130, 40, 45, 'sand');  
  drawLand(180, 160, 35, 30, 'grass'); 
  drawLand(70, 50, 50, 35, 'grass');  
  drawLand(50, 40, 35, 25, 'snow');   
  drawLand(60, 75, 30, 20, 'dirt');   
  drawLand(80, 145, 35, 45, 'tree');  
  drawLand(75, 175, 25, 20, 'rock');  
  drawLand(270, 165, 30, 25, 'dirt');  

  const drawIsland = (x: number, y: number, w: number, h: number) => {
      for(let dy=0; dy<h; dy++) for(let dx=0; dx<w; dx++) {
          if(isValid(x+dx, y+dy)) {
              map[y+dy][x+dx].type = 'grass';
              map[y+dy][x+dx].solid = false;
          }
      }
  };
  drawIsland(290, 60, 4, 8);   
  drawIsland(286, 75, 6, 24);  
  drawIsland(282, 90, 4, 6);   

  const addMountains = (cx: number, cy: number, length: number) => {
      for(let i=0; i<length; i++) {
          if(isValid(cx+i, cy)) { map[cy][cx+i].type = 'rock'; map[cy][cx+i].solid = true; }
          if(isValid(cx+i, cy+1)) { map[cy+1][cx+i].type = 'rock'; map[cy+1][cx+i].solid = true; }
          if(isValid(cx+i, cy-1)) { map[cy-1][cx+i].type = 'rock'; map[cy-1][cx+i].solid = true; }
      }
  };
  addMountains(180, 80, 40); 
  addMountains(50, 50, 15);  
  addMountains(75, 140, 15); 

  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          if (map[y][x].solid) continue;
          const t = map[y][x].type;
          if (y < 25) { map[y][x].type = 'snow'; } 
          if (t === 'grass' && rng.chance(0.18)) { map[y][x].type = 'tree'; map[y][x].solid = false; }
          if (t === 'sand' && rng.chance(0.12)) { map[y][x].type = 'dirt'; }
      }
  }

  const setPortal = (x: number, y: number, to: string, icon: TileType) => {
      if (!isValid(x, y)) return;
      map[y][x].type = icon;
      map[y][x].solid = false;
      map[y][x].teleportTo = to;
      for(let dy=-4; dy<=4; dy++) for(let dx=-4; dx<=4; dx++) {
          if(isValid(x+dx, y+dy)) {
              const target = map[y+dy][x+dx];
              target.solid = false;
              if (target.type === 'water' || target.type === 'rock' || target.type === 'wall' || target.type === 'tree' || target.type === 'dirt') {
                  target.type = 'grass';
              }
              if (dy !== 0 || dx !== 0) target.teleportTo = undefined;
          }
      }
  };

  const townPos = { x: 210, y: 60 };
  setPortal(townPos.x, townPos.y, 'town_start', 'town_entrance');

  setPortal(250, 45, 'dungeon_snow', 'dungeon_entrance');
  setPortal(170, 130, 'dungeon_desert', 'dungeon_entrance');
  setPortal(80, 150, 'dungeon_forest', 'dungeon_entrance');
  setPortal(270, 160, 'dungeon_wasteland', 'dungeon_entrance');

  const enemies: EnemyEntity[] = [];
  const enemyCount = 300; 
  const landTiles: {x: number, y: number, type: TileType}[] = [];
  for(let y=0; y<height; y++) for(let x=0; x<width; x++) {
      if(!map[y][x].solid) landTiles.push({x, y, type: map[y][x].type});
  }

  for(let i=0; i<enemyCount; i++) {
      if (landTiles.length === 0) break;
      const tile = rng.pick(landTiles); 
      if(Math.abs(tile.x - townPos.x) < 25 && Math.abs(tile.y - townPos.y) < 25) continue; 
      let allowedTypes: string[] = ['Slime'];
      const t = tile.type;
      if (t === 'snow') allowedTypes = ['Wolf', 'Ghost', 'Bat'];
      else if (t === 'sand') allowedTypes = ['Scorpion', 'Bandit', 'Giant Ant'];
      else if (t === 'tree') allowedTypes = ['Spider', 'Wolf', 'Boar', 'Grizzly'];
      else if (t === 'dirt') allowedTypes = ['Zombie', 'Ghoul', 'Dragonewt'];
      else allowedTypes = ['Slime', 'Bandit', 'Goblin'];
      enemies.push(generateEnemy(tile.x * tileSize, tile.y * tileSize, 1, allowedTypes));
  }

  return { map, enemies, droppedItems: [], biome: 'WorldMap', locationId: 'world' };
};

export const generateTownMap = (id: string): ChunkData => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  const rng = new SeededRandom(Math.abs(hash));

  const width = 60; const height = 50; 
  const tileSize = 32;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    let type: TileType = 'grass';
    let solid = false;
    if (x===0 || x===width-1 || y===0 || y===height-1) { type='tree'; solid=true; }
    if (y===height-1 && Math.abs(x - width/2) < 2) { type='portal_out'; solid=false; }
    return { x: x * tileSize, y: y * tileSize, type, solid, teleportTo: type === 'portal_out' ? 'world' : undefined };
  }));

  const centerX = Math.floor(width/2);
  const centerY = Math.floor(height/2);
  
  for(let y=5; y<height-1; y++) {
      for(let dx=-2; dx<=1; dx++) map[y][centerX+dx].type = 'dirt';
  }
  for(let x=5; x<width-5; x++) {
      for(let dy=-1; dy<=1; dy++) map[centerY+dy][x].type = 'dirt';
  }
  
  for(let y=centerY-3; y<=centerY+3; y++) {
      for(let x=centerX-3; x<=centerX+3; x++) map[y][x].type = 'dirt';
  }

  const enemies: EnemyEntity[] = [];

  const addNPC = (x: number, y: number, role: string, color: string = '#3b82f6') => {
      const npc: EnemyEntity = {
          id: `npc_${role}_${crypto.randomUUID()}`,
          type: 'enemy', race: 'Human', rank: 'Normal',
          x: x * tileSize, y: y * tileSize,
          width: 24, height: 24,
          visualWidth: 32, visualHeight: 56,
          color, shape: 'humanoid',
          hp: 999, maxHp: 999, attack: 0, defense: 999, speed: 0, 
          level: 1, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 999999,
          detectionRange: 0, xpValue: 0, vx: 0, vy: 0
      };
      // @ts-ignore
      npc.isNPC = true;
      // @ts-ignore
      npc.npcRole = role;
      enemies.push(npc);
  };

  const placeBuilding = (bx: number, by: number, bw: number, bh: number, name: string) => {
      for(let y=by; y<by+bh; y++) for(let x=bx; x<bx+bw; x++) {
          map[y][x].type = 'floor';
          map[y][x].solid = false;
      }
      for(let x=bx; x<bx+bw; x++) { map[by][x].type = 'wall'; map[by][x].solid = true; map[by+bh-1][x].type = 'wall'; map[by+bh-1][x].solid = true; }
      for(let y=by; y<by+bh; y++) { map[y][bx].type = 'wall'; map[y][bx].solid = true; map[y][bx+bw-1].type = 'wall'; map[y][bx+bw-1].solid = true; }
      
      const doorX = Math.floor(bx + bw/2);
      map[by+bh-1][doorX].type = 'floor';
      map[by+bh-1][doorX].solid = false;

      if (name === 'home') {
          map[by+1][bx+1].type = 'wall'; map[by+1][bx+1].solid = true; 
          map[by+2][bx+Math.floor(bw/2)].type = 'wall'; map[by+2][bx+Math.floor(bw/2)].solid = true; 
          addNPC(bx + 2, by + 2, 'Mom', '#ec4899');
      } else if (name === 'weapon_shop') {
          const counterY = by + 2;
          for(let x=bx+1; x<bx+bw-1; x++) { map[counterY][x].type = 'wall'; map[counterY][x].solid = true; }
          addNPC(bx + Math.floor(bw/2), counterY - 1, 'WeaponMerchant', '#ef4444');
      } else if (name === 'armor_shop') {
          const counterY = by + 2;
          for(let x=bx+1; x<bx+bw-1; x++) { map[counterY][x].type = 'wall'; map[counterY][x].solid = true; }
          addNPC(bx + Math.floor(bw/2), counterY - 1, 'ArmorMerchant', '#10b981');
      } else if (name === 'inn') {
          addNPC(bx + 2, by + 2, 'Innkeeper', '#f59e0b');
      }
  };

  placeBuilding(8, 8, 10, 8, 'home');
  placeBuilding(centerX - 12, centerY - 10, 8, 6, 'weapon_shop');
  placeBuilding(centerX + 4, centerY - 10, 8, 6, 'armor_shop');
  placeBuilding(centerX - 12, centerY + 4, 10, 7, 'inn');

  const houseCoords = [{x: 8, y: centerY + 8}, {x: width - 18, y: 8}, {x: width - 18, y: centerY + 8}];
  houseCoords.forEach((coord, idx) => {
      placeBuilding(coord.x, coord.y, 7, 6, 'house');
      addNPC(coord.x + 3, coord.y + 3, `Villager_${idx}`, '#6366f1');
  });

  return { map, enemies, droppedItems: [], biome: 'Town', locationId: id };
};

export const generateDungeonMap = (id: string, level: number, theme: Biome): ChunkData => {
  let hash = 0;
  const str = `${id}_${level}`;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  const rng = new SeededRandom(Math.abs(hash));

  const width = 50; const height = 50;
  const tileSize = 32;
  let floorType: TileType = 'dirt';
  let wallType: TileType = 'rock';
  if (theme === 'Snow') { floorType = 'snow'; wallType = 'rock'; }
  if (theme === 'Desert') { floorType = 'sand'; wallType = 'rock'; }
  if (theme === 'Forest') { floorType = 'grass'; wallType = 'tree'; }
  if (theme === 'Town') { floorType = 'floor'; wallType = 'wall'; }

  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
     let type: TileType = floorType;
     let solid = false;
     if (rng.chance(0.15)) { type = wallType; solid = true; }
     if (x===0 || x===width-1 || y===0 || y===height-1) { type = wallType; solid = true; }
     return { x: x*tileSize, y: y*tileSize, type, solid, teleportTo: undefined };
  }));

  const midX = Math.floor(width/2);
  map[height-2][midX].type='portal_out'; 
  map[height-2][midX].solid=false; 
  map[height-2][midX].teleportTo='world';
  map[height-2][midX-1].solid=false; map[height-2][midX-1].type=floorType;
  map[height-2][midX+1].solid=false; map[height-2][midX+1].type=floorType;
  map[height-3][midX].solid=false; map[height-3][midX].type=floorType;

  const enemies: EnemyEntity[] = [];
  const enemyCount = 25 + level * 2;
  let allowedTypes: string[] = ['Slime'];
  if (theme === 'Snow') allowedTypes = ['Wolf', 'Ghost', 'Bat'];
  if (theme === 'Desert') allowedTypes = ['Scorpion', 'Bandit', 'Giant Ant'];
  if (theme === 'Forest') allowedTypes = ['Spider', 'Wolf', 'Boar', 'Grizzly', 'Bandit'];
  if (theme === 'Wasteland') allowedTypes = ['Zombie', 'Ghoul', 'Dragonewt', 'Imp'];

  for(let i=0; i<enemyCount; i++) {
     let ex, ey;
     let attempts = 0;
     do { 
       ex = rng.range(1, width-2); 
       ey = rng.range(1, height-2); 
       attempts++;
       if (attempts > 100) break;
       if (Math.abs(ex - midX) < 5 && Math.abs(ey - (height-2)) < 5) continue;
     } while(map[ey][ex].solid);
     if (!map[ey][ex].solid) enemies.push(generateEnemy(ex*tileSize, ey*tileSize, level, allowedTypes));
  }
  return { map, enemies, droppedItems: [], biome: theme, locationId: id };
};

export const getMapData = (locationId: string): ChunkData => {
  if (locationId === 'world') return generateOverworld();
  if (locationId === 'town_start') return generateTownMap('town_start');
  if (locationId.startsWith('dungeon_')) {
      const parts = locationId.split('_'); 
      const themeName = parts[1];
      let theme: Biome = 'Plains';
      if (themeName === 'snow') theme = 'Snow';
      else if (themeName === 'desert') theme = 'Desert';
      else if (themeName === 'forest') theme = 'Forest';
      else if (themeName === 'wasteland') theme = 'Wasteland';
      return generateDungeonMap(locationId, 1, theme);
  }
  return generateOverworld();
};

export const generateWorldMap = generateOverworld;

export const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = Math.max(20, (attr.vitality || 10) * 10);
  let maxMp = Math.max(10, (attr.intelligence || 10) * 5);
  let baseAtk = Math.max(5, Math.floor((attr.strength || 10) * 1.5 + (attr.dexterity || 10) * 0.5));
  let baseDef = Math.floor((attr.endurance || 10) * 1.2);
  let baseSpd = 3 + ((attr.dexterity || 10) * 0.05);
  
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { 
    if (item && item.stats) { 
      equipAtk += (item.stats.attack || 0); 
      equipDef += (item.stats.defense || 0); 
      equipSpd += (item.stats.speed || 0); 
      equipHp += (item.stats.maxHp || 0); 
    } 
  });
  
  player.calculatedStats = { 
    maxHp: maxHp + equipHp, 
    maxMp: maxMp, 
    attack: baseAtk + equipAtk, 
    defense: baseDef + equipDef, 
    speed: baseSpd + equipSpd 
  };
  
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; 
  if (player.mp > player.maxMp) player.mp = player.maxMp;
};
