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
  }A

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  // 配列からランダムに1つ選ぶ
  pick<T>(array: T[]): T {
    return array[this.range(0, array.length - 1)];
  }
  
  // 確率判定 (0.0 - 1.0)
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
  return {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 0, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4 }
  };
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
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name, rank, x, y, width: type.w * (rank === 'Boss' ? 1.5 : 1), height: type.h * (rank === 'Boss' ? 1.5 : 1),
    visualWidth: type.vw! * (rank === 'Boss' ? 1.5 : 1), visualHeight: type.vh! * (rank === 'Boss' ? 1.5 : 1), 
    color, 
    shape: type.shape as any,
    hp: Math.floor(type.hp * scale), maxHp: Math.floor(type.hp * scale), attack: Math.floor(type.atk * scale), defense: Math.floor(level * 2), speed: type.spd,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 350, xpValue: Math.floor(type.xp * scale * (rank === 'Boss' ? 5 : rank === 'Elite' ? 2 : 1))
  };
};

// --- Map Generators ---

/**
 * 固定シードを使用した決定論的なワールドマップ生成
 * 毎回同じ地形が生成される
 */
export const generateOverworld = (): ChunkData => {
  // ワールド生成用の固定シード
  const rng = new SeededRandom(20240923); 
  
  const width = 160;
  const height = 100;
  const tileSize = GAME_CONFIG.TILE_SIZE;
  
  // 1. 全体を海で初期化
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    return { x: x * tileSize, y: y * tileSize, type: 'water', solid: true, teleportTo: undefined };
  }));

  const isValid = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;

  // 描画ヘルパー: 円形で陸地を描く
  const drawLand = (cx: number, cy: number, rx: number, ry: number, type: TileType = 'grass') => {
      for (let y = cy - ry; y <= cy + ry; y++) {
          for (let x = cx - rx; x <= cx + rx; x++) {
              if (!isValid(x, y)) continue;
              if (Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2) <= 1) {
                  // ランダムにノイズを加えて海岸線を自然に
                  if (rng.chance(0.9)) { // 90%の確率で陸地
                    map[y][x].type = type;
                    map[y][x].solid = false;
                  }
              }
          }
      }
  };

  // --- 大陸配置 (固定座標) ---

  // 1. ユーラシア大陸 (右側上部)
  drawLand(100, 30, 35, 20, 'grass');
  drawLand(75, 25, 15, 15, 'grass'); 
  drawLand(120, 25, 20, 15, 'snow'); // シベリア
  
  // 2. アフリカ大陸 (ユーラシアの下)
  drawLand(85, 65, 18, 20, 'sand'); // サハラ
  drawLand(90, 80, 15, 15, 'grass'); // サバンナ

  // 3. 北アメリカ (左側上部)
  drawLand(35, 25, 25, 15, 'grass');
  drawLand(25, 20, 15, 12, 'snow'); // アラスカ
  drawLand(30, 35, 15, 10, 'dirt'); // 西部

  // 4. 南アメリカ (北米の下)
  drawLand(40, 70, 15, 20, 'tree'); // アマゾン
  drawLand(38, 85, 10, 10, 'rock'); // アンデス

  // 5. オーストラリア (右下)
  drawLand(135, 80, 12, 10, 'dirt');

  // 6. 日本列島 (ユーラシアの東) - スタート地点
  const drawIsland = (x: number, y: number, w: number, h: number) => {
      for(let dy=0; dy<h; dy++) for(let dx=0; dx<w; dx++) {
          if(isValid(x+dx, y+dy)) {
              map[y+dy][x+dx].type = 'grass';
              map[y+dy][x+dx].solid = false;
          }
      }
  };
  drawIsland(145, 30, 2, 4); // 北海道風
  drawIsland(143, 35, 3, 6); // 本州風
  drawIsland(141, 40, 2, 3); // 九州風

  // --- 地形調整 & 自然生成 ---

  // 山脈配置
  const addMountains = (cx: number, cy: number, length: number) => {
      for(let i=0; i<length; i++) {
          if(isValid(cx+i, cy)) { map[cy][cx+i].type = 'rock'; map[cy][cx+i].solid = true; }
          if(isValid(cx+i, cy+1)) { map[cy+1][cx+i].type = 'rock'; map[cy+1][cx+i].solid = true; }
      }
  };
  addMountains(100, 40, 20); // ヒマラヤ風
  addMountains(25, 25, 5);   // ロッキー風
  addMountains(35, 70, 5);   // アンデス風

  // 森や砂漠のランダム配置（固定シードで再現性あり）
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          if (map[y][x].solid) continue; // 海や山はスキップ

          const t = map[y][x].type;
          
          // 緯度によるバイオーム補正
          if (y < 15) { map[y][x].type = 'snow'; } // 北極圏
          
          // ランダム生成要素（rng使用）
          if (t === 'grass' && rng.chance(0.15)) { map[y][x].type = 'tree'; map[y][x].solid = false; }
          if (t === 'sand' && rng.chance(0.1)) { map[y][x].type = 'dirt'; }
      }
  }

  // --- ポータル & 重要な場所の配置 (固定座標) ---

  const setPortal = (x: number, y: number, to: string, icon: TileType) => {
      if (!isValid(x, y)) return;
      map[y][x].type = icon;
      map[y][x].solid = false;
      map[y][x].teleportTo = to;
      
      // 周囲を整地（安全地帯確保）
      for(let dy=-2; dy<=2; dy++) for(let dx=-2; dx<=2; dx++) {
          if(isValid(x+dx, y+dy)) {
              const target = map[y+dy][x+dx];
              target.solid = false;
              if (target.type === 'water' || target.type === 'rock' || target.type === 'wall' || target.type === 'tree') {
                  target.type = 'grass';
              }
          }
      }
      // プレイヤーがスポーンする可能性のある場所（下側）を確実に空ける
      if(isValid(x, y+1)) { map[y+1][x].solid = false; map[y+1][x].type = 'grass'; }
      if(isValid(x, y+2)) { map[y+2][x].solid = false; map[y+2][x].type = 'grass'; } // 前回 +64px に変更したので2マス下も空ける
  };

  // 1. はじまりの街
  const townPos = { x: 144, y: 38 };
  setPortal(townPos.x, townPos.y, 'town_start', 'town_entrance');

  // 2. 各地ダンジョン
  setPortal(125, 20, 'dungeon_snow', 'dungeon_entrance');
  setPortal(85, 65, 'dungeon_desert', 'dungeon_entrance');
  setPortal(40, 75, 'dungeon_forest', 'dungeon_entrance');
  setPortal(135, 80, 'dungeon_wasteland', 'dungeon_entrance');

  // --- 敵の配置 (固定シードで配置) ---
  const enemies: EnemyEntity[] = [];
  const enemyCount = 80;
  
  const landTiles: {x: number, y: number, type: TileType}[] = [];
  for(let y=0; y<height; y++) for(let x=0; x<width; x++) {
      if(!map[y][x].solid) landTiles.push({x, y, type: map[y][x].type});
  }

  for(let i=0; i<enemyCount; i++) {
      if (landTiles.length === 0) break;
      const tile = rng.pick(landTiles); // 固定乱数で選択
      
      // 街周辺は安全に
      if(Math.abs(tile.x - townPos.x) < 10 && Math.abs(tile.y - townPos.y) < 10) continue;

      let allowedTypes: string[] = ['Slime'];
      const t = tile.type;
      
      if (t === 'snow') allowedTypes = ['Wolf', 'Ghost', 'Bat'];
      else if (t === 'sand') allowedTypes = ['Scorpion', 'Bandit', 'Giant Ant'];
      else if (t === 'tree') allowedTypes = ['Spider', 'Wolf', 'Boar', 'Grizzly'];
      else if (t === 'dirt') allowedTypes = ['Zombie', 'Ghoul', 'Dragonewt'];
      else allowedTypes = ['Slime', 'Bandit', 'Goblin'];

      // 敵の強さなどは多少ランダム性を持たせつつ、シード依存にはしない（戦闘の都度生成でも良いが、ここでは初期配置）
      // 初期配置も固定化したい場合は rng を使うべきだが、敵のパラメータ生成関数(generateEnemy)がMath.randomを使っている
      // 今回は配置場所だけ固定化
      enemies.push(generateEnemy(tile.x * tileSize, tile.y * tileSize, 1, allowedTypes));
  }

  return { map, enemies, droppedItems: [], biome: 'WorldMap', locationId: 'world' };
};

export const generateTownMap = (id: string): ChunkData => {
  // IDからハッシュを生成してシードにする -> 常に同じ街には同じマップ
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  const rng = new SeededRandom(Math.abs(hash));

  const width = 40; const height = 30;
  const tileSize = 32;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    let type: TileType = 'floor';
    let solid = false;
    // 外壁
    if (x===0 || x===width-1 || y===0 || y===height-1) { type='wall'; solid=true; }
    
    // 出口 (下中央)
    if (y===height-1 && Math.abs(x - width/2) < 2) { type='portal_out'; solid=false; }
    
    return { x: x * tileSize, y: y * tileSize, type, solid, teleportTo: type === 'portal_out' ? 'world' : undefined };
  }));

  // 固定の内装生成（乱数ではなくシード依存）
  // 建物
  const buildings = rng.range(3, 6);
  for(let i=0; i<buildings; i++) {
      const bx = rng.range(4, width - 8);
      const by = rng.range(4, height - 8);
      const bw = rng.range(4, 8);
      const bh = rng.range(3, 6);
      
      // 出口付近は避ける
      if (Math.abs(bx - width/2) < 5 && by > height - 10) continue;

      for(let y=by; y<by+bh; y++) for(let x=bx; x<bx+bw; x++) {
          map[y][x].type = 'wall';
          map[y][x].solid = true;
      }
      // ドア
      map[by+bh-1][Math.floor(bx+bw/2)].type = 'floor';
      map[by+bh-1][Math.floor(bx+bw/2)].solid = false;
  }

  return { map, enemies: [], droppedItems: [], biome: 'Town', locationId: id };
};

export const generateDungeonMap = (id: string, level: number, theme: Biome): ChunkData => {
  // IDと階層をシードにする
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
     
     // シード乱数で壁生成
     if (rng.chance(0.15)) { type = wallType; solid = true; }
     if (x===0 || x===width-1 || y===0 || y===height-1) { type = wallType; solid = true; }
     
     return { x: x*tileSize, y: y*tileSize, type, solid, teleportTo: undefined };
  }));

  const midX = Math.floor(width/2);
  map[height-2][midX].type='portal_out'; 
  map[height-2][midX].solid=false; 
  map[height-2][midX].teleportTo='world';
  // 出口周りを確実に空ける
  map[height-2][midX-1].solid=false; map[height-2][midX-1].type=floorType;
  map[height-2][midX+1].solid=false; map[height-2][midX+1].type=floorType;
  map[height-3][midX].solid=false; map[height-3][midX].type=floorType;

  // 敵の配置 (シード依存)
  const enemies: EnemyEntity[] = [];
  const enemyCount = 20 + level * 2;
  
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
       // 出口付近は避ける
       if (Math.abs(ex - midX) < 5 && Math.abs(ey - (height-2)) < 5) continue;
     } while(map[ey][ex].solid);
     
     if (!map[ey][ex].solid) {
        enemies.push(generateEnemy(ex*tileSize, ey*tileSize, level, allowedTypes));
     }
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
  let maxHp = attr.vitality * 10, maxMp = attr.intelligence * 5, baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5), baseDef = Math.floor(attr.endurance * 1.2), baseSpd = 3 + (attr.dexterity * 0.05);
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { if (item) { equipAtk += item.stats.attack; equipDef += item.stats.defense; equipSpd += item.stats.speed; equipHp += item.stats.maxHp; } });
  player.calculatedStats = { maxHp: maxHp + equipHp, maxMp: maxMp, attack: baseAtk + equipAtk, defense: baseDef + equipDef, speed: baseSpd + equipSpd };
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; if (player.mp > player.maxMp) player.mp = player.maxMp;
};
