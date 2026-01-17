// src/utils.ts
import { GAME_CONFIG, THEME, RARITY_MULTIPLIERS, ENCHANT_SLOTS, ITEM_BASE_NAMES, ICONS, ASSETS_SVG } from './constants';
import { JOB_DATA, ENEMY_TYPES, WORLD_LOCATIONS } from './data';
import { Item, Rarity, EquipmentType, WeaponStyle, WeaponClass, Enchantment, PlayerEntity, Job, Gender, EnemyEntity, ShapeType, FloorData, Tile, TileType, Biome, LightSource, Entity, GameState, CombatEntity, PerkData } from './types';

// SVG変換
export const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());

// 矩形衝突判定
export const checkCollision = (rect1: Entity, rect2: Entity) => 
  rect1.x < rect2.x + rect2.width && 
  rect1.x + rect1.width > rect2.x && 
  rect1.y < rect2.y + rect2.height && 
  rect1.y + rect1.height > rect2.y;

// マップ衝突解決
export const resolveMapCollision = (entity: Entity, dx: number, dy: number, map: Tile[][]): {x: number, y: number} => {
  const T = GAME_CONFIG.TILE_SIZE;
  const nextX = entity.x + dx;
  const nextY = entity.y + dy;
  
  // マップ範囲外チェック
  if (nextX < 0 || nextX + entity.width > map[0].length * T || nextY < 0 || nextY + entity.height > map.length * T) {
      return { x: entity.x, y: entity.y };
  }

  const startX = Math.floor(nextX / T);
  const endX = Math.floor((nextX + entity.width - 0.1) / T);
  const startY = Math.floor(nextY / T);
  const endY = Math.floor((nextY + entity.height - 0.1) / T);
  
  for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
          const tile = map[y]?.[x];
          if (tile && tile.solid) {
            // X軸移動のキャンセルを試みる
            if (dx !== 0) {
               const testY = entity.y; // Yは元のまま
               // Y軸のみでの衝突チェックは省略（簡易実装のため）
               return { x: entity.x, y: nextY }; // スライド移動（壁沿い移動）を許可するか、完全に止めるか
            }
            return { x: entity.x, y: entity.y }; // 完全停止
          }
      }
  }
  return { x: nextX, y: nextY };
};

// ランダムなアイテム生成
export const generateRandomItem = (level: number, forceRarity?: Rarity): Item => {
  const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  // レベルに応じてレアリティの重み付けを変える簡易ロジック
  let rarityIndex = 0;
  const rand = Math.random();
  if (forceRarity) {
      rarityIndex = rarities.indexOf(forceRarity);
  } else {
      if (rand > 0.98) rarityIndex = 4;
      else if (rand > 0.90) rarityIndex = 3;
      else if (rand > 0.75) rarityIndex = 2;
      else if (rand > 0.50) rarityIndex = 1;
  }
  
  const rarity = rarities[rarityIndex];
  const types: EquipmentType[] = ['Weapon', 'Helm', 'Armor', 'Boots', 'Consumable', 'Material'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let name = "Unknown";
  let icon = "❓";
  let stats = { attack: 0, defense: 0, speed: 0, maxHp: 0 };
  let weaponClass: WeaponClass | undefined;
  
  if (type === 'Weapon') {
      const wTypes = Object.keys(ITEM_BASE_NAMES.Weapon);
      const wType = wTypes[Math.floor(Math.random() * wTypes.length)] as WeaponStyle; // OneHanded etc.
      const names = ITEM_BASE_NAMES.Weapon[wType as any] || ['Weapon'];
      const baseName = names[Math.floor(Math.random() * names.length)]; // Sword etc.
      name = `${rarity} ${baseName}`;
      icon = ICONS.Weapon[wType as any] || '⚔️';
      stats.attack = Math.floor(5 + level * 2 * RARITY_MULTIPLIERS[rarity]);
  } else if (['Helm', 'Armor', 'Boots'].includes(type)) {
      const names = ITEM_BASE_NAMES[type] || ['Gear'];
      name = `${rarity} ${names[Math.floor(Math.random() * names.length)]}`;
      icon = ICONS[type] || '🛡️';
      stats.defense = Math.floor(2 + level * 1.5 * RARITY_MULTIPLIERS[rarity]);
      if (type === 'Armor') stats.maxHp = Math.floor(10 * level * RARITY_MULTIPLIERS[rarity]);
      if (type === 'Boots') stats.speed = parseFloat((0.1 * RARITY_MULTIPLIERS[rarity]).toFixed(1));
  } else if (type === 'Consumable') {
      name = 'Potion';
      icon = ICONS.Consumable;
  } else {
      name = 'Material';
      icon = ICONS.Material;
  }

  return {
      id: Math.random().toString(36).substr(2, 9),
      name, type, rarity, level, stats, enchantments: [],
      icon, color: THEME.colors.rarity[rarity], weaponClass
  };
};

// プレイヤーステータスの再計算
export const updatePlayerStats = (player: PlayerEntity): PlayerEntity => {
  const base = JOB_DATA[player.job].attributes;
  // 装備補正の計算
  let addAtk = 0, addDef = 0, addSpd = 0, addHp = 0;
  Object.values(player.equipment).forEach(eq => {
      if (!eq) return;
      addAtk += eq.stats.attack;
      addDef += eq.stats.defense;
      addSpd += eq.stats.speed;
      addHp += eq.stats.maxHp;
  });

  // パーク補正
  let perkAtkMul = 1.0, perkDefMul = 1.0, perkHpMul = 1.0, perkSpdMul = 1.0;
  player.perks.forEach(p => {
     if(p.id === 'berserker') perkAtkMul += 0.1 * p.level;
     if(p.id === 'stone_skin') perkDefMul += 0.1 * p.level;
     if(p.id === 'vitality_boost') perkHpMul += 0.1 * p.level;
     if(p.id === 'swift_step') perkSpdMul += 0.05 * p.level;
  });

  // 基本ステータス算出 (簡易式)
  const maxHp = Math.floor((base.vitality * 10 + player.level * 20 + addHp) * perkHpMul);
  const maxMp = base.intelligence * 10 + player.level * 5;
  const attack = Math.floor((base.strength * 2 + player.level * 3 + addAtk) * perkAtkMul);
  const defense = Math.floor((base.endurance * 1.5 + player.level * 2 + addDef) * perkDefMul);
  const speed = (GAME_CONFIG.PLAYER_SPEED + (base.dexterity * 0.05) + addSpd) * perkSpdMul;
  
  return {
      ...player,
      calculatedStats: {
          maxHp, maxMp, attack, defense, speed,
          maxStamina: 100 + base.endurance * 2,
          staminaRegen: GAME_CONFIG.STAMINA_REGEN + (base.endurance * 0.05),
          attackCooldown: Math.max(10, 60 - (base.dexterity + player.level)), // フレーム単位
      },
      maxHp // 現在HPの上限更新用（現在HP自体は維持）
  };
};

// プレイヤー作成
export const createPlayer = (job: Job, gender: Gender): PlayerEntity => {
  const p: PlayerEntity = {
      id: 'player', x: 0, y: 0, width: 24, height: 24, color: JOB_DATA[job].color,
      type: 'player', dead: false, direction: 1,
      job, gender, level: 1, xp: 0, nextLevelXp: 100, gold: 0,
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, stamina: 100, lastStaminaUse: 0,
      attack: 10, defense: 5, speed: 5, lastAttackTime: 0, attackCooldown: 30,
      statPoints: 0, attributes: { ...JOB_DATA[job].attributes },
      inventory: [], equipment: {}, perks: [],
      calculatedStats: { maxHp: 100, maxMp: 50, attack: 10, defense: 5, speed: 5, maxStamina: 100, staminaRegen: 0.5, attackCooldown: 30 }
  };
  // 初期装備
  const sword = generateRandomItem(1, 'Common');
  sword.name = "Novice Sword"; sword.type = 'Weapon'; sword.stats.attack = 5;
  p.inventory.push(sword);
  p.equipment.mainHand = sword;
  
  return updatePlayerStats(p);
};

// ダンジョン生成 (BSP法の簡易版)
export const generateFloor = (level: number, biome: Biome): FloorData => {
    const width = GAME_CONFIG.MAP_WIDTH;
    const height = GAME_CONFIG.MAP_HEIGHT;
    const map: Tile[][] = Array(height).fill(null).map((_, y) => 
        Array(width).fill(null).map((_, x) => ({ x: x*32, y: y*32, type: 'wall', solid: true }))
    );
    
    // 部屋生成
    const rooms: {x:number, y:number, w:number, h:number}[] = [];
    const minSize = 6, maxSize = 12;
    const roomCount = 10;
    
    for(let i=0; i<roomCount; i++) {
        const w = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const h = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        const x = Math.floor(Math.random() * (width - w - 2) + 1);
        const y = Math.floor(Math.random() * (height - h - 2) + 1);
        
        // 重なりチェック省略（簡易）
        rooms.push({x,y,w,h});
        
        // 部屋を掘る
        for(let ry=y; ry<y+h; ry++) {
            for(let rx=x; rx<x+w; rx++) {
                map[ry][rx] = { x: rx*32, y: ry*32, type: biome === 'Town' ? 'town_floor' : 'floor', solid: false };
            }
        }
    }
    
    // 通路生成（部屋0から順に繋ぐ）
    for(let i=0; i<rooms.length-1; i++) {
        const r1 = rooms[i];
        const r2 = rooms[i+1];
        const cx1 = Math.floor(r1.x + r1.w/2);
        const cy1 = Math.floor(r1.y + r1.h/2);
        const cx2 = Math.floor(r2.x + r2.w/2);
        const cy2 = Math.floor(r2.y + r2.h/2);
        
        // 水平通路
        const minX = Math.min(cx1, cx2), maxX = Math.max(cx1, cx2);
        for(let x=minX; x<=maxX; x++) { map[cy1][x] = { x: x*32, y: cy1*32, type: 'floor', solid: false }; }
        // 垂直通路
        const minY = Math.min(cy1, cy2), maxY = Math.max(cy1, cy2);
        for(let y=minY; y<=maxY; y++) { map[y][cx2] = { x: cx2*32, y: y*32, type: 'floor', solid: false }; }
    }

    // 敵配置
    const enemies: EnemyEntity[] = [];
    rooms.forEach((r, idx) => {
        if(idx === 0) return; // 最初の部屋は安全
        if(Math.random() > 0.3) {
            const count = Math.floor(Math.random() * 2) + 1;
            for(let j=0; j<count; j++) {
                const ex = (r.x + Math.floor(Math.random()*r.w)) * 32;
                const ey = (r.y + Math.floor(Math.random()*r.h)) * 32;
                const baseEnemy = ENEMY_TYPES[Math.min(level-1 + Math.floor(Math.random()*2), ENEMY_TYPES.length-1)] || ENEMY_TYPES[0];
                
                enemies.push({
                    id: `e_${level}_${idx}_${j}`, x: ex, y: ey, width: baseEnemy.w, height: baseEnemy.h,
                    color: baseEnemy.color, type: 'enemy', dead: false,
                    hp: baseEnemy.hp + (level*5), maxHp: baseEnemy.hp + (level*5),
                    attack: baseEnemy.atk + level, defense: level, speed: baseEnemy.spd,
                    level: level, lastAttackTime: 0, attackCooldown: 60, direction: 1,
                    detectionRange: 200, race: baseEnemy.name, xpValue: baseEnemy.xp, rank: 'Normal', statusEffects: []
                });
            }
        }
    });

    // 階段配置（最後の部屋）
    const lastRoom = rooms[rooms.length-1];
    const stairsX = Math.floor(lastRoom.x + lastRoom.w/2);
    const stairsY = Math.floor(lastRoom.y + lastRoom.h/2);
    map[stairsY][stairsX] = { x: stairsX*32, y: stairsY*32, type: 'stairs_down', solid: false };

    // プレイヤー初期位置
    const startRoom = rooms[0];
    const entryPos = { x: (startRoom.x + Math.floor(startRoom.w/2)) * 32, y: (startRoom.y + Math.floor(startRoom.h/2)) * 32 };

    return { map, enemies, resources: [], droppedItems: [], biome, level, lights: [], entryPos };
};

// 描画関数
export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>, width: number, height: number) => {
  // 背景クリア
  ctx.fillStyle = '#111'; 
  ctx.fillRect(0, 0, width, height);

  const T = GAME_CONFIG.TILE_SIZE;
  
  // カメラ位置計算（プレイヤー中心）
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  
  ctx.save();
  ctx.translate(-camX, -camY);

  // マップ描画範囲の最適化
  const mapWidth = state.map[0]?.length || 0;
  const mapHeight = state.map.length || 0;
  const startCol = Math.max(0, Math.floor(camX / T));
  const endCol = Math.min(mapWidth - 1, Math.floor((camX + width) / T) + 1);
  const startRow = Math.max(0, Math.floor(camY / T));
  const endRow = Math.min(mapHeight - 1, Math.floor((camY + height) / T) + 1);

  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      const tile = state.map[y]?.[x];
      if (!tile) continue;
      
      // タイルの描画
      if (tile.solid) {
          ctx.fillStyle = THEME.colors.wall;
      } else if (tile.type === 'stairs_down') {
          ctx.fillStyle = '#7c4dff'; // 階段
      } else {
          ctx.fillStyle = tile.type === 'grass' ? THEME.colors.grass : THEME.colors.ground;
      }
      ctx.fillRect(tile.x, tile.y, T, T);
      
      // 境界線（デバッグ用っぽく見えるなら消してもOK）
      ctx.strokeStyle = '#222';
      ctx.strokeRect(tile.x, tile.y, T, T);

      if(tile.type === 'stairs_down') {
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.fillText('GO', tile.x+8, tile.y+20);
      }
    }
  }

  // 敵の描画
  state.enemies.forEach(e => {
      if(e.dead) return;
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, e.width, e.height);
      // HPバー
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x, e.y - 6, e.width, 4);
      ctx.fillStyle = 'green';
      ctx.fillRect(e.x, e.y - 6, e.width * (e.hp / e.maxHp), 4);
  });

  // ドロップアイテム
  state.droppedItems.forEach(d => {
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(d.x + d.width/2, d.y + d.height/2 + d.bounceOffset, 6, 0, Math.PI*2);
      ctx.fill();
  });

  // プレイヤー
  const p = state.player;
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, p.width, p.height);
  
  // 攻撃エフェクト（簡易）
  if (p.isAttacking) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const cx = p.x + p.width/2;
      const cy = p.y + p.height/2;
      ctx.arc(cx, cy, 30, 0, Math.PI*2); // 全方位攻撃のようなエフェクト
      ctx.stroke();
  }

  ctx.restore();
};
