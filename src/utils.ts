import { GAME_CONFIG, THEME, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS, ASSETS_SVG } from './constants';
import { JOB_DATA, ENEMY_TYPES, PERK_DEFINITIONS, WORLD_LOCATIONS } from './data';
import { Item, Rarity, EquipmentType, WeaponStyle, WeaponClass, Enchantment, PlayerEntity, Job, Gender, EnemyEntity, ShapeType, FloorData, Tile, TileType, Biome, LightSource, Entity, GameState, CombatEntity } from './types';

export const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());

export const generateRandomItem = (level: number, rankBonus: number = 0): Item | null => {
  let roll = Math.random() * 100 - rankBonus * 5;
  
  if (Math.random() < 0.15) {
      const typeRoll = Math.random();
      if (typeRoll < 0.5) return { id: crypto.randomUUID(), name: "松明", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🔥", color: "#ff9800", count: 1 };
      else return { id: crypto.randomUUID(), name: "ポーション", type: "Consumable", rarity: "Common", level: 1, stats: { attack:0, defense:0, speed:0, maxHp:0 }, enchantments: [], icon: "🧪", color: "#f44336", count: 1 };
  }

  let rarity: Rarity = roll < 1 ? 'Legendary' : roll < 5 ? 'Epic' : roll < 15 ? 'Rare' : roll < 40 ? 'Uncommon' : 'Common';
  const types: EquipmentType[] = ['Weapon', 'Helm', 'Armor', 'Shield', 'Boots'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let subType: WeaponStyle | undefined;
  let weaponClass: WeaponClass | undefined;
  let icon = "";
  
  if (type === 'Weapon') {
      const wRoll = Math.random();
      if (wRoll < 0.3) { weaponClass = 'Sword'; subType = 'OneHanded'; icon = ICONS.Weapon.OneHanded; }
      else if (wRoll < 0.45) { weaponClass = 'Axe'; subType = 'TwoHanded'; icon = ICONS.Weapon.TwoHanded; } 
      else if (wRoll < 0.65) { weaponClass = 'Bow'; subType = 'TwoHanded'; icon = ICONS.Weapon.Bow; }
      else if (wRoll < 0.85) { weaponClass = 'Staff'; subType = 'TwoHanded'; icon = ICONS.Weapon.Staff; }
      else { weaponClass = 'Wand'; subType = 'OneHanded'; icon = ICONS.Weapon.Wand; }
  } else {
      // @ts-ignore
      icon = ICONS[type];
  }

  const mult = RARITY_MULTIPLIERS[rarity];
  const baseVal = Math.max(1, level * 2);
  const stats = { attack: 0, defense: 0, speed: 0, maxHp: 0 };

  if (type === 'Weapon') {
    stats.attack = Math.floor(baseVal * 3 * mult);
    if (weaponClass === 'Axe' || weaponClass === 'Staff' || weaponClass === 'Bow') stats.attack = Math.floor(stats.attack * 1.3);
    if (weaponClass === 'Wand') stats.attack = Math.floor(stats.attack * 0.8);
    
    if (weaponClass === 'Axe') stats.speed = -1;
    if (weaponClass === 'Bow') stats.speed = 1;
  } else if (type === 'Armor') { 
      stats.defense = Math.floor(baseVal * 2 * mult); stats.maxHp = Math.floor(baseVal * 5 * mult);
      icon = 'svg:Item_Armor'; 
  } else if (type === 'Helm') { stats.defense = Math.floor(baseVal * 1 * mult); stats.maxHp = Math.floor(baseVal * 2 * mult);
  } else if (type === 'Shield') { stats.defense = Math.floor(baseVal * 2.5 * mult);
  } else if (type === 'Boots') { stats.defense = Math.floor(baseVal * 0.5 * mult); stats.speed = Number((0.2 * mult).toFixed(1)); }

  const enchantments: Enchantment[] = [];
  const enchantCount = Math.floor(Math.random() * (ENCHANT_SLOTS[rarity] + 1));
  const enchantTypes = ['Attack', 'Defense', 'Speed', 'MaxHp', 'Fire', 'Ice', 'Paralysis', 'Range'] as const;
  
  for (let i = 0; i < enchantCount; i++) {
    const eType = enchantTypes[Math.floor(Math.random() * enchantTypes.length)];
    const strength = (['Weak', 'Medium', 'Strong'] as const)[Math.floor(Math.random() * 3)];
    let val = 0;
    
    if (['Attack', 'Defense', 'MaxHp', 'Speed'].includes(eType)) {
        if (eType === 'Attack' || eType === 'Defense') val = Math.floor(level * (strength === 'Strong' ? 3 : strength === 'Medium' ? 2 : 1));
        else if (eType === 'MaxHp') val = Math.floor(level * 5 * (strength === 'Strong' ? 3 : strength === 'Medium' ? 2 : 1));
        else if (eType === 'Speed') val = Number((0.1 * (strength === 'Strong' ? 3 : strength === 'Medium' ? 2 : 1)).toFixed(1));
    } else {
        if (eType === 'Fire') val = strength === 'Strong' ? 8 : strength === 'Medium' ? 5 : 3; 
        if (eType === 'Ice') val = strength === 'Strong' ? 0.6 : strength === 'Medium' ? 0.4 : 0.2; 
        if (eType === 'Paralysis') val = strength === 'Strong' ? 60 : strength === 'Medium' ? 40 : 20; 
        if (eType === 'Range') val = strength === 'Strong' ? 1.0 : strength === 'Medium' ? 0.5 : 0.2; 
    }

    enchantments.push({ type: eType, value: val, strength, name: `${eType}+` });
    // @ts-ignore
    if (eType === 'Attack') stats.attack += val; else if (eType === 'Defense') stats.defense += val; else if (eType === 'MaxHp') stats.maxHp += val; else if (eType === 'Speed') stats.speed += val;
  }
  
  let namePrefix = rarity === 'Common' ? '' : `${rarity} `;
  let baseName = type === 'Weapon' ? (weaponClass === 'Axe' ? '斧' : weaponClass === 'Bow' ? '弓' : weaponClass === 'Staff' ? '杖' : weaponClass === 'Wand' ? '短杖' : '剣') : ITEM_BASE_NAMES[type];
  
  return { id: crypto.randomUUID(), name: `${namePrefix}${baseName}`, type, subType, weaponClass, rarity, level, stats, enchantments, icon, color: THEME.colors.rarity[rarity] };
};

export const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  return {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 10, defense: 0, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1, inventory: [], equipment: {}, calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4, maxStamina: 100, staminaRegen: 0.5, attackCooldown: 500 },
    perks: [],
    stamina: 100, lastStaminaUse: 0
  };
};

export const generateEnemy = (x: number, y: number, level: number): EnemyEntity => {
  const poolSize = Math.min(ENEMY_TYPES.length - 1, 3 + Math.floor(level / 1.5)); 
  const minIndex = Math.max(0, poolSize - 6);
  const typeIndex = minIndex + Math.floor(Math.random() * (poolSize - minIndex));
  
  const type = ENEMY_TYPES[typeIndex];
  
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let scale = 1 + (level * 0.1);
  let color = type.color;
  
  if (level > 2 && rankRoll < 0.05 + (level * 0.01)) { 
      rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; 
  }
  
  return {
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name, rank, x, y,
    width: type.w, 
    height: type.h,
    visualWidth: type.vw!, 
    visualHeight: type.vh!, 
    color, shape: type.shape as ShapeType,
    hp: Math.floor(type.hp * scale), maxHp: Math.floor(type.hp * scale), attack: Math.floor(type.atk * scale), defense: Math.floor(level * 2), speed: type.spd,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 350, 
    xpValue: Math.floor(type.xp * scale * (rank === 'Elite' ? 2 : 1)),
    statusEffects: []
  };
};

export const generateFloor = (level: number, locationId?: string): FloorData => {
  let mapWidth = GAME_CONFIG.MAP_WIDTH;
  let mapHeight = GAME_CONFIG.MAP_HEIGHT;

  let biome: Biome = 'Dungeon';
  const location = WORLD_LOCATIONS.find(l => l.id === locationId);
  if (location) biome = location.biome;
  else if (level === 0) biome = 'Town';
  else biome = (['Dungeon', 'Plains', 'Forest', 'Wasteland', 'Snow', 'Desert'] as Biome[])[(level % 5) + 1] || 'Dungeon';

  if (biome === 'Town') {
      mapWidth = GAME_CONFIG.TOWN_WIDTH;
      mapHeight = GAME_CONFIG.TOWN_HEIGHT;
  }

  const map: Tile[][] = Array(mapHeight).fill(null).map((_, y) => Array(mapWidth).fill(null).map((_, x) => {
      return { x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE, type: 'grass', solid: false };
    })
  );

  const enemies: EnemyEntity[] = [];
  const resources: ResourceEntity[] = [];
  const lights: LightSource[] = [];
  const shopZones: {x:number, y:number, w:number, h:number, type:'blacksmith'|'general'}[] = [];
  let bossId: string | null = null;
  let entryPos = { x: (mapWidth/2) * GAME_CONFIG.TILE_SIZE, y: (mapHeight/2) * GAME_CONFIG.TILE_SIZE };

  if (biome === 'Town') {
    for(let y=0; y<mapHeight; y++) {
      for(let x=0; x<mapWidth; x++) {
        map[y][x].type = 'town_floor';
        if (x===0 || x===mapWidth-1 || y===0 || y===mapHeight-1) {
           map[y][x].type = 'wall'; map[y][x].solid = true;
        }
      }
    }
    const cx = Math.floor(mapWidth/2), cy = Math.floor(mapHeight/2);
    map[mapHeight-2][cx].type = 'portal_out';
    
    if (locationId === 'town_start' || level === 0) {
        map[cy][cx].type = 'dungeon_entrance';
        lights.push({ x: cx * 32 + 16, y: cy * 32 + 16, radius: 150, flicker: true, color: '#f59e0b' });
        
        const shopY = cy - 4;
        const shopX1 = cx - 6;
        for(let y=shopY; y<shopY+4; y++) for(let x=shopX1; x<shopX1+5; x++) { map[y][x].type = 'wall'; map[y][x].solid = true; } 
        shopZones.push({x: shopX1*32, y: (shopY+4)*32, w: 5*32, h: 2*32, type:'general'}); 

        const shopX2 = cx + 2;
        for(let y=shopY; y<shopY+4; y++) for(let x=shopX2; x<shopX2+5; x++) { map[y][x].type = 'wall'; map[y][x].solid = true; } 
        shopZones.push({x: shopX2*32, y: (shopY+4)*32, w: 5*32, h: 2*32, type:'blacksmith'}); 
    }
    
    entryPos = { x: cx * 32, y: (cy + 3) * 32 }; 

    return { map, enemies: [], resources: [], droppedItems: [], biome: 'Town', level: 0, lights, shopZones, entryPos };
  }

  if (level > 0 && level % 5 === 0) {
      for(let y=0; y<mapHeight; y++) {
          for(let x=0; x<mapWidth; x++) {
            if (x===0 || x===mapWidth-1 || y===0 || y===mapHeight-1) {
                map[y][x].type = 'wall'; map[y][x].solid = true;
            } else {
                map[y][x].type = 'floor'; map[y][x].solid = false;
            }
          }
      }
      
      const cx = Math.floor(mapWidth/2) * GAME_CONFIG.TILE_SIZE;
      const cy = Math.floor(mapHeight/2) * GAME_CONFIG.TILE_SIZE;
      
      const bossType = ENEMY_TYPES.find(e => e.name === 'Dragon') || ENEMY_TYPES[ENEMY_TYPES.length - 1];
      const boss = {
        id: `boss_${crypto.randomUUID()}`, type: 'enemy', race: bossType.name, rank: 'Boss', x: cx, y: cy, width: bossType.w * 2, height: bossType.h * 2,
        visualWidth: bossType.vw! * 2, visualHeight: bossType.vh! * 2, color: '#ff0000', shape: bossType.shape as ShapeType,
        hp: bossType.hp * 5 + (level * 20), maxHp: bossType.hp * 5 + (level * 20), attack: bossType.atk * 1.5, defense: level * 3, speed: bossType.spd * 1.2,
        level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 800, detectionRange: 800, xpValue: bossType.xp * 10,
        statusEffects: []
      } as EnemyEntity;
      enemies.push(boss);
      bossId = boss.id;

      lights.push({ x: cx, y: cy, radius: 300, flicker: true, color: '#ff5252' });
      map[Math.floor(mapHeight/2) - 4][Math.floor(mapWidth/2)].type = 'stairs_down';
      entryPos = { x: (mapWidth/2) * 32, y: (mapHeight - 5) * 32 };

      return { map, enemies, resources: [], droppedItems: [], biome: 'Dungeon', level, lights, bossId, entryPos, shopZones: [] };
  }

  for(let y=0; y<mapHeight; y++) {
    for(let x=0; x<mapWidth; x++) {
      map[y][x].type = 'wall'; 
      map[y][x].solid = true;
    }
  }

  const rooms: {x: number, y: number, w: number, h: number}[] = [];
  const minRoomSize = 6;
  const maxRoomSize = 12;
  const maxRooms = 15;

  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const x = Math.floor(Math.random() * (mapWidth - w - 2)) + 1;
    const y = Math.floor(Math.random() * (mapHeight - h - 2)) + 1;

    const newRoom = { x, y, w, h };
    rooms.push(newRoom);

    for (let ry = y; ry < y + h; ry++) {
      for (let rx = x; rx < x + w; rx++) {
        if (ry > 0 && ry < mapHeight -1 && rx > 0 && rx < mapWidth -1) {
            let floorType: TileType = 'floor';
            if (biome === 'Snow') floorType = 'snow';
            else if (biome === 'Desert') floorType = 'sand';
            else if (biome === 'Wasteland') floorType = 'dirt';
            
            map[ry][rx].type = floorType;
            map[ry][rx].solid = false;
        }
      }
    }
    
    if (Math.random() < 0.7) {
        const resType = biome === 'Forest' || biome === 'Plains' ? 'tree' : (Math.random() < 0.3 ? 'ore' : 'rock');
        const count = Math.floor(Math.random() * 3) + 1;
        for(let k=0; k<count; k++) {
            const rx = x + Math.floor(Math.random() * w);
            const ry = y + Math.floor(Math.random() * h);
            if (!map[ry][rx].solid) {
                resources.push({
                    id: crypto.randomUUID(), x: rx*32, y: ry*32, width: 32, height: 32, type: 'resource', resourceType: resType,
                    hp: 30, maxHp: 30, color: resType === 'tree' ? '#4caf50' : (resType === 'ore' ? '#ffeb3b' : '#9e9e9e'), dead: false
                });
            }
        }
    }
  }

  for (let i = 1; i < rooms.length; i++) {
      const prev = rooms[i-1];
      const curr = rooms[i];
      const prevCx = Math.floor(prev.x + prev.w / 2);
      const prevCy = Math.floor(prev.y + prev.h / 2);
      const currCx = Math.floor(curr.x + curr.w / 2);
      const currCy = Math.floor(curr.y + curr.h / 2);

      const carveH = (y: number, x1: number, x2: number) => {
          for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
              if (y > 0 && y < mapHeight-1 && x > 0 && x < mapWidth-1) {
                let floorType: TileType = 'floor';
                if (biome === 'Snow') floorType = 'snow';
                else if (biome === 'Desert') floorType = 'sand';
                else if (biome === 'Wasteland') floorType = 'dirt';
                map[y][x].type = floorType; map[y][x].solid = false;
                map[y+1][x].type = floorType; map[y+1][x].solid = false; 
              }
          }
      };
      const carveV = (x: number, y1: number, y2: number) => {
          for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
              if (y > 0 && y < mapHeight-1 && x > 0 && x < mapWidth-1) {
                let floorType: TileType = 'floor';
                if (biome === 'Snow') floorType = 'snow';
                else if (biome === 'Desert') floorType = 'sand';
                else if (biome === 'Wasteland') floorType = 'dirt';
                map[y][x].type = floorType; map[y][x].solid = false;
                map[y][x+1].type = floorType; map[y][x+1].solid = false; 
              }
          }
      };

      if (Math.random() < 0.5) { carveH(prevCy, prevCx, currCx); carveV(currCx, prevCy, currCy); } 
      else { carveV(prevCx, prevCy, currCy); carveH(currCy, prevCx, currCx); }
  }

  const getRandomFloorTile = () => {
      let limit = 1000;
      while(limit-- > 0) {
          const rx = Math.floor(Math.random() * (mapWidth - 2)) + 1;
          const ry = Math.floor(Math.random() * (mapHeight - 2)) + 1;
          if (!map[ry][rx].solid) return {x: rx, y: ry};
      }
      return {x: Math.floor(mapWidth/2), y: Math.floor(mapHeight/2)};
  };

  const entryTile = getRandomFloorTile();
  entryPos = { x: entryTile.x * GAME_CONFIG.TILE_SIZE, y: entryTile.y * GAME_CONFIG.TILE_SIZE };

  let stairsPos = getRandomFloorTile();
  while (Math.abs(stairsPos.x - entryTile.x) + Math.abs(stairsPos.y - entryTile.y) < 15) {
      stairsPos = getRandomFloorTile();
  }
  map[stairsPos.y][stairsPos.x].type = 'stairs_down';
  lights.push({ x: stairsPos.x * 32 + 16, y: stairsPos.y * 32 + 16, radius: 100, flicker: false, color: '#ffffff' });

  if (level % 5 === 0) {
      let portalPos = getRandomFloorTile();
      map[portalPos.y][portalPos.x].type = 'return_portal';
      lights.push({ x: portalPos.x * 32 + 16, y: portalPos.y * 32 + 16, radius: 120, flicker: true, color: '#00e676' });
  }

  const enemyCount = 5 + Math.floor(level * 0.5);
  let spawnedCount = 0;
  let attempts = 0;
  while (spawnedCount < enemyCount && attempts < 100) {
    attempts++;
    const pos = getRandomFloorTile();
    if (Math.abs(pos.x - entryTile.x) + Math.abs(pos.y - entryTile.y) < 8) continue;
    enemies.push(generateEnemy(pos.x * GAME_CONFIG.TILE_SIZE, pos.y * GAME_CONFIG.TILE_SIZE, level));
    spawnedCount++;
  }

  return { map, enemies, resources, droppedItems: [], biome, level, lights, entryPos, shopZones: [] };
};

export const checkCollision = (rect1: Entity, rect2: Entity) => rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;

export const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx, nextY = entity.y + dy;
  const startX = Math.floor(nextX / T), endX = Math.floor((nextX + entity.width) / T), startY = Math.floor(nextY / T), endY = Math.floor((nextY + entity.height) / T);
  if (startX < 0 || endX >= map[0].length || startY < 0 || endY >= map.length) return { x: entity.x, y: entity.y };
  for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) if (map[y]?.[x]?.solid) return { x: entity.x, y: entity.y };
  return { x: nextX, y: nextY };
};

export const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = attr.vitality * 10, maxMp = attr.intelligence * 5, baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5), baseDef = Math.floor(attr.endurance * 1.2), baseSpd = 3 + (attr.dexterity * 0.05);
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { if (item) { equipAtk += item.stats.attack; equipDef += item.stats.defense; equipSpd += item.stats.speed; equipHp += item.stats.maxHp; } });
  
  player.perks.forEach(p => {
      const level = p.level;
      if (p.id === 'stone_skin') baseDef += 5 * level;
      if (p.id === 'berserker') baseAtk += 5 * level;
      if (p.id === 'vitality_boost') maxHp += 20 * level;
      if (p.id === 'swift_step') baseSpd *= (1 + 0.1 * level);
      if (p.id === 'glass_cannon') { baseAtk += (10 + 5 * level); baseDef = Math.max(0, baseDef - 5); }
      if (p.id === 'heavy_armor') { baseDef += (5 + 5 * level); baseSpd *= 0.9; }
      if (p.id === 'endurance') { }
      if (p.id === 'mana_well') { maxMp += 50 * level; }
  });

  let maxStamina = 100 + (attr.endurance * 2);
  const endPerk = player.perks.find(p => p.id === 'endurance');
  if (endPerk) maxStamina += 50 * endPerk.level;

  let staminaRegen = GAME_CONFIG.STAMINA_REGEN + (attr.endurance * 0.05);
  
  let attackCooldown = 500;
  const hastePerk = player.perks.find(p => p.id === 'haste');
  if (hastePerk) attackCooldown = Math.max(200, 500 * (1 - 0.1 * hastePerk.level));

  player.calculatedStats = { maxHp: maxHp + equipHp, maxMp: maxMp, attack: baseAtk + equipAtk, defense: baseDef + equipDef, speed: baseSpd + equipSpd, maxStamina, staminaRegen, attackCooldown };
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; if (player.mp > player.maxMp) player.mp = player.maxMp;
};

export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>, width: number, height: number) => {
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, width, height);

  if (state.inWorldMap) {
      const T = GAME_CONFIG.WORLD_TILE_SIZE;
      ctx.save();
      const camX = Math.floor(state.worldPlayerPos.x * T - width/2 + T/2);
      const camY = Math.floor(state.worldPlayerPos.y * T - height/2 + T/2);
      ctx.translate(-camX, -camY);

      for(let y=0; y<GAME_CONFIG.WORLD_HEIGHT; y++) {
          for(let x=0; x<GAME_CONFIG.WORLD_WIDTH; x++) {
              ctx.fillStyle = (x+y)%2 === 0 ? '#1e293b' : '#334155'; 
              ctx.fillRect(x*T, y*T, T, T);
          }
      }

      WORLD_LOCATIONS.forEach(loc => {
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(loc.icon, loc.x * T + T/2, loc.y * T + T/2);
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.fillText(loc.name, loc.x * T + T/2, loc.y * T + T + 10);
      });

      ctx.fillStyle = state.player.color;
      ctx.beginPath();
      ctx.arc(state.worldPlayerPos.x * T + T/2, state.worldPlayerPos.y * T + T/2, T/3, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
      
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, width, 40);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText("WORLD MAP - Use Arrow Keys to Move, ENTER to Enter Location", width/2, 25);
      return;
  }

  const T = GAME_CONFIG.TILE_SIZE;
  ctx.save();
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  ctx.translate(-camX, -camY);
  state.camera = { x: camX, y: camY };

  const mapWidth = state.map[0]?.length || GAME_CONFIG.MAP_WIDTH;
  const mapHeight = state.map.length || GAME_CONFIG.MAP_HEIGHT;

  const startCol = Math.max(0, Math.floor(camX / T));
  const endCol = Math.min(mapWidth - 1, startCol + (width / T) + 1);
  const startRow = Math.max(0, Math.floor(camY / T));
  const endRow = Math.min(mapHeight - 1, startRow + (height / T) + 1);

  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      const tile = state.map[y]?.[x];
      if (!tile) continue;
      let color = '#000';
      if (tile.type === 'grass') color = '#1b2e1b';
      else if (tile.type === 'dirt') color = '#3e2723';
      else if (tile.type === 'sand') color = '#fbc02d';
      else if (tile.type === 'snow') color = '#e3f2fd';
      else if (tile.type === 'rock') color = '#616161';
      else if (tile.type === 'wall') color = '#424242';
      else if (tile.type === 'water') color = '#1a237e';
      else if (tile.type === 'floor') color = '#37474f';
      else if (tile.type === 'town_floor') color = '#5d4037';
      else if (tile.type === 'dungeon_entrance') color = '#000';
      else if (tile.type === 'stairs_down') color = '#000';
      else if (tile.type === 'return_portal') color = '#000';
      else if (tile.type === 'portal_out') color = '#a855f7'; 

      ctx.fillStyle = color; ctx.fillRect(tile.x, tile.y, T, T);
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.strokeRect(tile.x, tile.y, T, T);

      if (tile.type === 'wall') { ctx.fillStyle = '#555'; ctx.fillRect(tile.x, tile.y, T, T-4); ctx.fillStyle = '#333'; ctx.fillRect(tile.x, tile.y+T-4, T, 4); }
      if (tile.type === 'stairs_down') { ctx.fillStyle = '#000'; ctx.fillRect(tile.x + 8, tile.y + 8, 16, 16); ctx.strokeStyle = '#fff'; ctx.strokeRect(tile.x + 8, tile.y + 8, 16, 16); ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign='center'; ctx.fillText('DOWN', tile.x+16, tile.y+20); }
      if (tile.type === 'dungeon_entrance') { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(tile.x+16, tile.y+16, 12, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#f00'; ctx.font = '10px Arial'; ctx.textAlign='center'; ctx.fillText('IN', tile.x+16, tile.y+20); }
      if (tile.type === 'return_portal') { ctx.fillStyle = '#00e676'; ctx.beginPath(); ctx.arc(tile.x+16, tile.y+16, 10 + Math.sin(state.gameTime/5)*2, 0, Math.PI*2); ctx.fill(); }
      if (tile.type === 'portal_out') { ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(tile.x+16, tile.y+16, 12, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.textAlign='center'; ctx.fillText('EXIT', tile.x+16, tile.y+20); }
    }
  }

  if (state.dungeonLevel === 0 && state.shopZones) {
      state.shopZones.forEach(z => {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.2)'; 
          ctx.fillRect(z.x, z.y, z.w, z.h);
          ctx.font = 'bold 14px Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(z.type === 'general' ? 'General Store' : 'Blacksmith', z.x + z.w/2, z.y + z.h/2);
          ctx.font = '24px Arial'; ctx.fillText(z.type === 'general' ? '🎒' : '🔨', z.x + z.w/2, z.y + z.h/2 - 20);
      });
  }

  state.droppedItems.forEach(drop => {
    const bob = Math.sin(state.gameTime / 10) * 5 + drop.bounceOffset;
    ctx.shadowColor = drop.item.color; ctx.shadowBlur = 10;
    if (drop.item.icon.startsWith('svg:')) {
        const key = drop.item.icon.split(':')[1];
        if (images[key]) {
            ctx.drawImage(images[key], drop.x + 8, drop.y + 8 + bob, 16, 16);
            ctx.fillStyle = drop.item.color; ctx.fillRect(drop.x + 8, drop.y + 24 + bob, 16, 4);
        }
    } else {
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(drop.x + 8, drop.y + 8 + bob, 16, 16);
        ctx.fillStyle = drop.item.color; ctx.fillRect(drop.x + 8, drop.y + 12 + bob, 16, 4);
        ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 4 + bob); 
    }
    ctx.shadowBlur = 0;
  });

  state.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color; ctx.beginPath(); ctx.arc(proj.x + proj.width/2, proj.y + proj.height/2, 4, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = proj.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(proj.x + proj.width/2, proj.y + proj.height/2); ctx.lineTo(proj.x + proj.width/2 - proj.vx! * 2, proj.y + proj.height/2 - proj.vy! * 2); ctx.stroke();
  });

  state.resources.forEach(r => {
      let imgKey = r.resourceType === 'tree' ? 'Tree' : (r.resourceType === 'ore' ? 'Ore' : 'Rock');
      if (images[imgKey]) {
          const wobble = Math.sin(state.gameTime / 5) * (r.hp < r.maxHp ? 2 : 0);
          ctx.save(); ctx.translate(r.x + 16 + wobble, r.y + 16); ctx.drawImage(images[imgKey], -16, -16, 32, 32); ctx.restore();
      } else {
          ctx.fillStyle = r.color; ctx.fillRect(r.x, r.y, r.width, r.height);
      }
  });

  state.lights.forEach(l => {
      if (l.color === '#ff9800') { 
          const flick = l.flicker ? Math.random() * 2 : 0;
          ctx.fillStyle = '#5d4037'; ctx.fillRect(l.x - 2, l.y, 4, 10);
          ctx.fillStyle = '#ffeb3b'; ctx.beginPath(); ctx.arc(l.x, l.y, 4 + flick, 0, Math.PI*2); ctx.fill();
      }
  });

  const renderCharacter = (e: CombatEntity, icon?: string) => {
    const vw = e.visualWidth || e.width, vh = e.visualHeight || e.height;
    const centerX = e.x + e.width / 2, bottomY = e.y + e.height;
    let imgKey: string | null = null;
    if (e.type === 'player') imgKey = `${(e as PlayerEntity).job}_${(e as PlayerEntity).gender}`;
    else if (e.type === 'enemy') {
       const race = (e as EnemyEntity).race;
       if (race.includes('Slime') || race.includes('Jelly')) imgKey = 'Slime';
       else if (race.includes('Bandit')) imgKey = 'Bandit';
       else if (race.includes('Zombie') || race.includes('Ghoul')) imgKey = 'Zombie';
       else if (race.includes('Ant') || race.includes('Spider')) imgKey = 'Insect';
       else if (race.includes('Imp') || race.includes('Demon')) imgKey = 'Demon';
       else if (race.includes('Bat')) imgKey = 'Bat';
       else if (race.includes('Dragon')) imgKey = 'Dragon';
       else if (race.includes('Boar') || race.includes('Grizzly') || race.includes('Wolf')) imgKey = race.includes('Wolf') ? 'Wolf' : 'Beast';
       else if (race.includes('Ghost')) imgKey = 'Ghost';
    }

    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath();
    ctx.ellipse(centerX, bottomY - 2, e.width/2 * (['flying','ghost'].includes(e.shape || '') ? 0.8 : 1.2), 4, 0, 0, Math.PI*2); ctx.fill();

    if (imgKey && images[imgKey]) {
      const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
      const bounce = isMoving ? Math.sin(state.gameTime / 2) : 0;
      const scaleX = (isMoving ? 1 + bounce * 0.1 : 1) * (e.isAttacking ? 1.2 : 1) * (e.direction === 2 ? -1 : 1);
      const scaleY = (isMoving ? 1 - bounce * 0.1 : 1) * (e.isAttacking ? 0.8 : 1);
      ctx.save(); ctx.translate(centerX, bottomY + (bounce > 0 ? -bounce * 5 : 0));
      ctx.scale(scaleX, scaleY); ctx.drawImage(images[imgKey], -vw / 2, -vh, vw, vh); ctx.restore();
    } else {
      const bob = Math.sin(state.gameTime / 3) * ((Math.abs(e.vx||0)>0.1 || Math.abs(e.vy||0)>0.1) ? 2 : 0);
      ctx.fillStyle = e.color; if (e.shape === 'ghost') ctx.globalAlpha = 0.6;
      ctx.fillRect(e.x + (e.width-vw)/2, e.y + e.height - vh + bob, vw, vh); ctx.globalAlpha = 1.0;
      if (icon) { ctx.font = `${Math.min(vw, vh) * 0.6}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(icon, e.x+e.width/2, e.y+e.height-vh/2+bob); }
    }
    if (e.type === 'enemy' && e.hp < e.maxHp) {
      const barX = centerX - vw/2, barY = bottomY - vh - 12;
      ctx.fillStyle='#000'; ctx.fillRect(barX, barY, vw, 4); ctx.fillStyle='#f44336'; ctx.fillRect(barX, barY, vw * (e.hp/e.maxHp), 4);
      const enemy = e as EnemyEntity;
      if (enemy.statusEffects) {
          enemy.statusEffects.forEach((eff, i) => {
              const icon = eff.type === 'burn' ? '🔥' : (eff.type === 'freeze' ? '❄️' : '⚡');
              ctx.fillText(icon, centerX - 10 + (i * 10), barY - 10);
          });
      }
    }
  };

  [...state.enemies, state.player].sort((a,b)=>(a.y+a.height)-(b.y+b.height)).forEach(e => {
    if (e.dead) return;
    const icon = e.type==='player' ? JOB_DATA[(e as PlayerEntity).job]?.icon : ENEMY_TYPES.find(t=>t.name===(e as EnemyEntity).race)?.icon;
    renderCharacter(e as CombatEntity, icon);
  });

  if (state.player.isAttacking) {
    const weapon = state.player.equipment.mainHand;
    if (!weapon || (weapon.weaponClass !== 'Bow' && weapon.weaponClass !== 'Staff' && weapon.weaponClass !== 'Wand')) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
        let rangeMult = 1.0;
        weapon?.enchantments.forEach(e => { if(e.type === 'Range') rangeMult += e.value; });
        const radius = Math.max(0, 60 * rangeMult * Math.min(Math.max((Date.now() - state.player.lastAttackTime) / 200, 0), 1));
        ctx.arc(state.player.x + state.player.width/2, state.player.y + state.player.height/2, radius, 0, Math.PI*2); ctx.stroke();
    }
  }

  state.floatingTexts.forEach(t => {
    ctx.font = 'bold 16px monospace'; ctx.fillStyle = 'black'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
  });

  if (state.currentBiome === 'Dungeon') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#000000'; ctx.fillRect(camX, camY, width, height); 
      ctx.globalCompositeOperation = 'destination-out';
      const drawLight = (x: number, y: number, r: number, flicker: boolean) => {
          const flickVal = flicker ? Math.random() * 5 : 0;
          const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r + flickVal);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, r + flickVal, 0, Math.PI * 2); ctx.fill();
      };
      drawLight(state.player.x + state.player.width/2, state.player.y + state.player.height/2, 180, false);
      state.lights.forEach(l => { drawLight(l.x, l.y, l.radius, l.flicker); });
      state.projectiles.forEach(p => { drawLight(p.x + 4, p.y + 4, 30, true); });
      ctx.globalCompositeOperation = 'source-over'; 
  }

  ctx.restore();
};
