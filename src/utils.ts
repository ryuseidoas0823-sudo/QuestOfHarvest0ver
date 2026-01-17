import { GAME_CONFIG, THEME, RARITY_MULTIPLIERS, ITEM_BASE_NAMES, ICONS, ENCHANT_SLOTS } from './constants';
import { JOB_DATA, ENEMY_TYPES } from './data';
import { Item, Rarity, EquipmentType, WeaponStyle, PlayerEntity, Job, Gender, EnemyEntity, ChunkData, Tile, Biome, Entity, ShapeType, Enchantment } from './types';

// Collision Helpers
export const checkCollision = (rect1: Entity, rect2: Entity) => 
  rect1.x < rect2.x + rect2.width && 
  rect1.x + rect1.width > rect2.x && 
  rect1.y < rect2.y + rect2.height && 
  rect1.y + rect1.height > rect2.y;

export const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx;
  const nextY = entity.y + dy;
  const startX = Math.floor(nextX / T);
  const endX = Math.floor((nextX + entity.width - 0.1) / T);
  const startY = Math.floor(nextY / T);
  const endY = Math.floor((nextY + entity.height - 0.1) / T);
  
  if (startX < 0 || endX >= GAME_CONFIG.MAP_WIDTH || startY < 0 || endY >= GAME_CONFIG.MAP_HEIGHT) {
      return { x: nextX, y: nextY };
  }

  for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
          const tile = map[y]?.[x];
          if (tile && tile.solid) {
             // 軸ごとの衝突判定（簡易版）
             if (dx !== 0 && dy === 0) return { x: entity.x, y: entity.y };
             if (dy !== 0 && dx === 0) return { x: entity.x, y: entity.y };
             // 斜め移動時の引っかかり防止
             return { x: entity.x, y: entity.y };
          }
      }
  }
  return { x: nextX, y: nextY };
};

// Item Generators
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

  const enchantments: Enchantment[] = [];
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
  return { id: crypto.randomUUID(), name, type, subType, rarity, level, stats, enchantments, icon: type === 'Weapon' ? ICONS.Weapon[subType!] : ICONS[type], color: THEME.colors.rarity[rarity] };
};

// Player Logic
export const updatePlayerStats = (player: PlayerEntity) => {
  const attr = player.attributes;
  let maxHp = attr.vitality * 10, maxMp = attr.intelligence * 5, baseAtk = Math.floor(attr.strength * 1.5 + attr.dexterity * 0.5), baseDef = Math.floor(attr.endurance * 1.2), baseSpd = 3 + (attr.dexterity * 0.05);
  let equipAtk = 0, equipDef = 0, equipSpd = 0, equipHp = 0;
  Object.values(player.equipment).forEach(item => { if (item) { equipAtk += item.stats.attack; equipDef += item.stats.defense; equipSpd += item.stats.speed; equipHp += item.stats.maxHp; } });
  player.calculatedStats = { 
      maxHp: maxHp + equipHp, 
      maxMp: maxMp, 
      attack: baseAtk + equipAtk, 
      defense: baseDef + equipDef, 
      speed: baseSpd + equipSpd,
      maxStamina: 100 + attr.endurance * 2,
      staminaRegen: GAME_CONFIG.STAMINA_REGEN + (attr.endurance * 0.05),
      attackCooldown: Math.max(10, 60 - (attr.dexterity + player.level))
  };
  Object.assign(player, player.calculatedStats);
  if (player.hp > player.maxHp) player.hp = player.maxHp; 
  if (player.mp > player.maxMp) player.mp = player.maxMp;
};

export const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const baseAttrs = JOB_DATA[job].attributes;
  const p: PlayerEntity = {
    id: 'player', type: 'player', x: 0, y: 0, width: 20, height: 20, visualWidth: 32, visualHeight: 56, color: THEME.colors.player, job, gender, shape: 'humanoid',
    hp: 100, maxHp: 100, mp: 50, maxMp: 50, stamina: 100, lastStaminaUse: 0,
    attack: 10, defense: 0, speed: 4, level: 1, xp: 0, nextLevelXp: 100, gold: 0, statPoints: 0, attributes: { ...baseAttrs },
    dead: false, lastAttackTime: 0, attackCooldown: 500, direction: 1, inventory: [], equipment: {}, perks: [],
    calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 0, speed: 4, maxStamina: 100, staminaRegen: 0.5, attackCooldown: 30 }
  };
  updatePlayerStats(p);
  return p;
};

// World Generation
export const getBiome = (wx: number, wy: number): Biome => {
  if (wx === 0 && wy === 0) return 'Town';
  if (wy < -1) return 'Snow';
  if (wy > 1) return 'Desert';
  if (Math.abs(wx) > 2) return 'Wasteland';
  return 'Plains';
};

export const generateEnemy = (x: number, y: number, level: number): EnemyEntity => {
  const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
  const rankRoll = Math.random();
  let rank: 'Normal' | 'Elite' | 'Boss' = 'Normal';
  let scale = 1 + (level * 0.1);
  let color = type.color || 'red';
  if (rankRoll < 0.05) { rank = 'Boss'; scale *= 3; color = '#ff0000'; } else if (rankRoll < 0.2) { rank = 'Elite'; scale *= 1.5; color = '#ffeb3b'; }
  return {
    id: `enemy_${crypto.randomUUID()}`, type: 'enemy', race: type.name!, rank, x, y, width: (type.w || 24) * (rank === 'Boss' ? 1.5 : 1), height: (type.h || 24) * (rank === 'Boss' ? 1.5 : 1),
    visualWidth: (type.w || 32) * (rank === 'Boss' ? 1.5 : 1), visualHeight: (type.h || 32) * (rank === 'Boss' ? 1.5 : 1), color, shape: (type.name!.includes('Slime') ? 'slime' : 'humanoid') as ShapeType,
    hp: Math.floor((type.hp || 20) * scale), maxHp: Math.floor((type.hp || 20) * scale), attack: Math.floor((type.atk || 5) * scale), defense: Math.floor(level * 2), speed: type.spd || 2,
    level, direction: 1, dead: false, lastAttackTime: 0, attackCooldown: 1000 + Math.random() * 500, detectionRange: 350, xpValue: Math.floor((type.xp || 10) * scale * (rank === 'Boss' ? 5 : rank === 'Elite' ? 2 : 1)), statusEffects: []
  };
};

export const generateChunk = (wx: number, wy: number): ChunkData => {
  const biome = getBiome(wx, wy);
  const width = GAME_CONFIG.MAP_WIDTH;
  const height = GAME_CONFIG.MAP_HEIGHT;
  const map: Tile[][] = Array(height).fill(null).map((_, y) => Array(width).fill(null).map((_, x) => {
      let type: any = 'grass';
      if (biome === 'Snow') type = 'snow'; else if (biome === 'Desert') type = 'sand'; else if (biome === 'Wasteland') type = 'dirt'; else if (biome === 'Town') type = 'town_floor';
      if (biome !== 'Town' && Math.random() < 0.05) type = Math.random() > 0.5 ? 'dirt' : 'rock';
      return { x: x * GAME_CONFIG.TILE_SIZE, y: y * GAME_CONFIG.TILE_SIZE, type, solid: false };
    })
  );
  
  // Wall Generation
  for(let y=0; y<height; y++) {
    for(let x=0; x<width; x++) {
      if (biome === 'Town') {
        if (x===0 || x===width-1 || y===0 || y===height-1) {
          // Leave entrances
          if (!((x === 0 || x === width-1) && Math.abs(y - height/2) < 3) && !((y === 0 || y === height-1) && Math.abs(x - width/2) < 3)) { 
              map[y][x].type = 'wall'; map[y][x].solid = true; 
          }
        }
      } else {
        // Random obstacles
        if (Math.random() < 0.08 && x > 2 && x < width-2 && y > 2 && y < height-2) { map[y][x].type = 'wall'; map[y][x].solid = true; }
        if (Math.random() < 0.05 && x > 2 && x < width-2 && y > 2 && y < height-2) { map[y][x].type = 'water'; map[y][x].solid = true; }
      }
    }
  }
  return { map, enemies: [], droppedItems: [], biome };
};
