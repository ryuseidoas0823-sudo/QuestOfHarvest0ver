import { Job, Gender, PlayerEntity, EnemyEntity, ChunkData, Tile, TileType, Item, Rarity, EquipmentType, WeaponStyle, Biome } from './types';
import { JOB_DATA, ENEMY_TYPES, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS } from './data';
import { THEME, GAME_CONFIG } from './config';

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

export const generateOverworld = (): ChunkData => {
  const width = 80;
  const height = 80;
  const tileSize = GAME_CONFIG.TILE_SIZE;
  
  // 1. 全体を海で初期化 (solid: true)
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    return { x: x * tileSize, y: y * tileSize, type: 'water', solid: true, teleportTo: undefined };
  }));

  const isValid = (x: number, y: number) => x >= 1 && x < width - 1 && y >= 1 && y < height - 1;

  // 2. 大陸形成 (セルオートマトン + ランダムウォーク)
  // 核となる陸地を複数配置
  let landCells: {x: number, y: number}[] = [];
  const seeds = 12; // 大陸・島の核の数
  for(let i=0; i<seeds; i++) {
      let cx = Math.floor(Math.random() * (width - 10)) + 5;
      let cy = Math.floor(Math.random() * (height - 10)) + 5;
      // ランダムウォークで広げる
      const size = Math.floor(Math.random() * 200) + 100;
      for(let j=0; j<size; j++) {
          if(isValid(cx, cy)) {
              map[cy][cx].type = 'grass';
              map[cy][cx].solid = false;
              landCells.push({x: cx, y: cy});
          }
          const dir = Math.floor(Math.random() * 4);
          if(dir===0) cx++; else if(dir===1) cx--; else if(dir===2) cy++; else cy--;
          cx = Math.max(2, Math.min(width-3, cx));
          cy = Math.max(2, Math.min(height-3, cy));
      }
  }

  // スムージング (陸地を自然な形に整える)
  for(let iter=0; iter<4; iter++) {
      const nextMap = map.map(row => row.map(t => t.type));
      for(let y=1; y<height-1; y++) {
          for(let x=1; x<width-1; x++) {
              let landCount = 0;
              for(let dy=-1; dy<=1; dy++) {
                  for(let dx=-1; dx<=1; dx++) {
                      if(map[y+dy][x+dx].type !== 'water') landCount++;
                  }
              }
              if(map[y][x].type === 'water' && landCount >= 5) nextMap[y][x] = 'grass';
              if(map[y][x].type !== 'water' && landCount <= 3) nextMap[y][x] = 'water';
          }
      }
      for(let y=0; y<height; y++) {
          for(let x=0; x<width; x++) {
              map[y][x].type = nextMap[y][x] as TileType;
              map[y][x].solid = map[y][x].type === 'water';
          }
      }
  }

  // 3. 山・山脈 (Perlinノイズ的なシミュレーションは重いので、帯状に配置)
  // 陸地の上にランダムに山脈ラインを引く
  const mountains = 6;
  for(let i=0; i<mountains; i++) {
      let mx = Math.floor(Math.random() * width);
      let my = Math.floor(Math.random() * height);
      // 陸地スタートのみ
      if(map[my][mx].type === 'water') continue;
      
      let length = Math.floor(Math.random() * 20) + 10;
      let dx = Math.random() > 0.5 ? 1 : -1;
      let dy = Math.random() > 0.5 ? 1 : -1;
      if(Math.random() > 0.5) dx = 0; else dy = 0; // 縦か横、あるいは斜めに伸びる

      for(let j=0; j<length; j++) {
          if(isValid(mx, my) && map[my][mx].type !== 'water') {
              // 中心は高山(rock, solid)
              map[my][mx].type = 'rock';
              map[my][mx].solid = true;
              
              // 周囲は低山(dirt, non-solid) または丘
              for(let ny=my-1; ny<=my+1; ny++) {
                  for(let nx=mx-1; nx<=mx+1; nx++) {
                      if(isValid(nx, ny) && map[ny][nx].type === 'grass' && Math.random() > 0.3) {
                          map[ny][nx].type = 'dirt'; // 低山/丘扱い
                      }
                  }
              }
          }
          mx += dx + (Math.random() > 0.8 ? (Math.random()>0.5?1:-1) : 0); // たまにふらつく
          my += dy + (Math.random() > 0.8 ? (Math.random()>0.5?1:-1) : 0);
      }
  }

  // 4. 川・湖
  // 湖
  for(let i=0; i<3; i++) {
      let lx = Math.floor(Math.random() * width);
      let ly = Math.floor(Math.random() * height);
      if(map[ly][lx].type === 'grass') {
          map[ly][lx].type = 'water';
          map[ly][lx].solid = true;
          // 少し広げる
          for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) {
              if(isValid(lx+dx, ly+dy) && map[ly+dy][lx+dx].type !== 'rock') {
                  map[ly+dy][lx+dx].type = 'water';
                  map[ly+dy][lx+dx].solid = true;
              }
          }
      }
  }

  // 5. バイオーム (緯度による変化)
  for(let y=0; y<height; y++) {
      for(let x=0; x<width; x++) {
          if(map[y][x].type === 'water' || map[y][x].type === 'rock') continue;
          
          // 北部: 雪原
          if(y < 15) {
              map[y][x].type = 'snow';
          }
          // 南部: 砂漠
          else if(y > height - 15) {
              map[y][x].type = 'sand';
          }
          // ランダムに森 (tree)
          else if(map[y][x].type === 'grass' && Math.random() < 0.2) {
              map[y][x].type = 'tree';
              map[y][x].solid = false; // 森は通行可
          }
          // 荒野 (西部など特定のエリア)
          else if(x < 15 && map[y][x].type === 'grass') {
              if(Math.random() < 0.7) map[y][x].type = 'dirt'; // 荒野
          }
      }
  }

  // 6. ポータルとPOI配置
  // 陸地リストを再取得 (確実に歩ける場所だけ)
  const landTiles: {x: number, y: number}[] = [];
  for(let y=0; y<height; y++) for(let x=0; x<width; x++) {
      if(!map[y][x].solid && map[y][x].type !== 'water' && map[y][x].type !== 'rock') {
          landTiles.push({x, y});
      }
  }

  // 万が一陸地がない場合のフォールバック
  if (landTiles.length === 0) {
      const centerX = Math.floor(width/2);
      const centerY = Math.floor(height/2);
      map[centerY][centerX].type = 'grass'; 
      map[centerY][centerX].solid = false;
      landTiles.push({x:centerX, y:centerY});
      // 周囲も安全地帯にする
      for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) {
          map[centerY+dy][centerX+dx].type = 'grass';
          map[centerY+dy][centerX+dx].solid = false;
      }
  }

  const getRandomLand = () => landTiles[Math.floor(Math.random() * landTiles.length)];

  // 街 (中央に最も近い陸地を探す)
  let townPos = landTiles[0];
  let minDist = Infinity;
  const centerX = width/2;
  const centerY = height/2;
  
  for(const t of landTiles) {
      const d = (t.x - centerX)**2 + (t.y - centerY)**2;
      if(d < minDist) {
          minDist = d;
          townPos = t;
      }
  }
  
  // ポータル設置ヘルパー
  const setPortal = (x: number, y: number, to: string, icon: TileType) => {
      map[y][x].type = icon;
      map[y][x].solid = false;
      map[y][x].teleportTo = to;
      // 周囲をクリアに (プレイヤーがスタックしないように)
      for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++) {
          if(isValid(x+dx, y+dy)) {
              const target = map[y+dy][x+dx];
              if(target.solid) {
                  target.solid = false;
                  if(target.type === 'water' || target.type === 'rock') target.type = 'grass';
              }
          }
      }
  };

  setPortal(townPos.x, townPos.y, 'town_start', 'town_entrance');

  // ダンジョン (ランダムな陸地に配置)
  const dForest = getRandomLand(); setPortal(dForest.x, dForest.y, 'dungeon_forest', 'dungeon_entrance');
  const dSnow = getRandomLand(); setPortal(dSnow.x, dSnow.y, 'dungeon_snow', 'dungeon_entrance');
  const dDesert = getRandomLand(); setPortal(dDesert.x, dDesert.y, 'dungeon_desert', 'dungeon_entrance');
  const dWasteland = getRandomLand(); setPortal(dWasteland.x, dWasteland.y, 'dungeon_wasteland', 'dungeon_entrance');

  // 敵の配置
  const enemies: EnemyEntity[] = [];
  const enemyCount = 60;
  for(let i=0; i<enemyCount; i++) {
      const pos = getRandomLand();
      // 街の近くは除外
      if(Math.abs(pos.x - townPos.x) < 10 && Math.abs(pos.y - townPos.y) < 10) continue;
      
      let biome: any = 'Plains';
      const t = map[pos.y][pos.x].type;
      if(t === 'snow') biome = 'Snow';
      else if(t === 'sand') biome = 'Desert';
      else if(t === 'tree') biome = 'Forest';
      else if(t === 'dirt') biome = 'Wasteland';

      // 敵生成 (既存ロジック利用)
      let allowedTypes: string[] = ['Slime', 'Bandit'];
      if (biome === 'Snow') allowedTypes = ['Wolf', 'Ghost', 'White Bear'];
      if (biome === 'Desert') allowedTypes = ['Scorpion', 'Bandit', 'Giant Ant'];
      if (biome === 'Forest') allowedTypes = ['Spider', 'Wolf', 'Boar', 'Grizzly'];
      if (biome === 'Wasteland') allowedTypes = ['Zombie', 'Ghoul', 'Dragonewt'];

      enemies.push(generateEnemy(pos.x * tileSize, pos.y * tileSize, 1, allowedTypes));
  }

  // プレイヤーの初期スポーン位置として街の位置を返すため、locationId 以外の情報も返せるように拡張するか、
  // あるいは固定位置 (例: マップ中央) を街にする戦略をとるのが一般的だが、
  // 今回は App.tsx 側で「街のポータル」を探してそこにスポーンさせるロジックに変更するか、
  // generateOverworld が特別なプロパティを持つようにする。
  // ここではシンプルに、生成されたマップデータ内に「スタート地点」情報を含めるハックを使うか、
  // App.tsx で「town_entrance」タイプのタイルを探すようにする。
  
  return { map, enemies, droppedItems: [], biome: 'WorldMap', locationId: 'world' };
};

export const generateTownMap = (id: string): ChunkData => {
  const width = 40; const height = 30;
  const tileSize = 32;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
    let type: TileType = 'floor';
    let solid = false;
    if (x===0 || x===width-1 || y===0 || y===height-1) { type='wall'; solid=true; }
    if (y===height-1 && Math.abs(x - width/2) < 2) { type='portal_out'; solid=false; }
    return { x: x * tileSize, y: y * tileSize, type, solid, teleportTo: type === 'portal_out' ? 'world' : undefined };
  }));

  for(let y=5; y<10; y++) for(let x=5; x<12; x++) { map[y][x].type='wall'; map[y][x].solid=true; }
  map[9][8].type='floor'; map[9][8].solid=false;

  for(let y=5; y<10; y++) for(let x=28; x<35; x++) { map[y][x].type='wall'; map[y][x].solid=true; }
  map[9][31].type='floor'; map[9][31].solid=false;

  return { map, enemies: [], droppedItems: [], biome: 'Town', locationId: id };
};

export const generateDungeonMap = (id: string, level: number, theme: Biome): ChunkData => {
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
     if (Math.random() < 0.15) { type = wallType; solid = true; }
     if (x===0 || x===width-1 || y===0 || y===height-1) { type = wallType; solid = true; }
     return { x: x*tileSize, y: y*tileSize, type, solid, teleportTo: undefined };
  }));

  const midX = Math.floor(width/2);
  map[height-2][midX].type='portal_out'; 
  map[height-2][midX].solid=false; 
  map[height-2][midX].teleportTo='world';
  map[height-3][midX].solid=false; map[height-3][midX].type=floorType;

  const enemies: EnemyEntity[] = [];
  const enemyCount = 20 + level * 2;
  
  let allowedTypes: string[] = ['Slime'];
  if (theme === 'Snow') allowedTypes = ['Wolf', 'Ghost', 'Bat'];
  if (theme === 'Desert') allowedTypes = ['Scorpion', 'Bandit', 'Giant Ant'];
  if (theme === 'Forest') allowedTypes = ['Spider', 'Wolf', 'Boar', 'Grizzly', 'Bandit'];
  if (theme === 'Wasteland') allowedTypes = ['Zombie', 'Ghoul', 'Dragonewt', 'Imp'];

  for(let i=0; i<enemyCount; i++) {
     let ex, ey;
     do { 
       ex = Math.floor(Math.random()*width); 
       ey = Math.floor(Math.random()*height); 
       if (Math.abs(ex - midX) < 5 && Math.abs(ey - (height-2)) < 5) continue;
     } while(map[ey][ex].solid);
     enemies.push(generateEnemy(ex*tileSize, ey*tileSize, level, allowedTypes));
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
