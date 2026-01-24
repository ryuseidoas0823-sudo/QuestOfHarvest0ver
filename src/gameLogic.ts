import { GameState, Position, Entity, Direction, Stats, Projectile } from './types';
import { JOBS } from './data/jobs';
import { GODS } from './data/gods';
import { SKILLS } from './data/skills';
import { JobId } from './types/job';

const GRID_SIZE = 40;

// ... createInitialPlayer (前回のコードと同じため省略、ただしskillCooldownsの初期化を追加推奨) ...
export const createInitialPlayer = (jobId: JobId, godId: string, startPos: Position): Entity => {
  const jobDef = JOBS[jobId];
  const godDef = GODS[godId];
  
  if (!jobDef) throw new Error(`Job definition not found: ${jobId}`);
  if (!godDef) throw new Error(`God definition not found: ${godId}`);

  let baseMaxHp = jobDef.baseStats.maxHp;
  let baseAttack = jobDef.baseStats.attack;
  let baseDefense = jobDef.baseStats.defense;

  if (godDef.passiveBonus.maxHp) baseMaxHp += godDef.passiveBonus.maxHp;
  if (godDef.passiveBonus.attack) baseAttack += godDef.passiveBonus.attack;
  if (godDef.passiveBonus.defense) baseDefense += godDef.passiveBonus.defense;

  const stats: Stats = {
    maxHp: baseMaxHp,
    hp: baseMaxHp,
    attack: baseAttack,
    defense: baseDefense,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    speed: 1,
    critRate: godDef.passiveBonus.critRate || 0,
    dropRate: godDef.passiveBonus.dropRate || 1.0,
  };

  return {
    id: 'player',
    type: 'player',
    x: startPos.x * GRID_SIZE,
    y: startPos.y * GRID_SIZE,
    width: GRID_SIZE,
    height: GRID_SIZE,
    color: godDef.color,
    direction: 'down',
    isMoving: false,
    stats: stats,
    jobId: jobId, 
    godId: godId,
    skills: [...jobDef.learnableSkills],
    skillCooldowns: {}, // 初期化
  } as Entity;
};


// 方向に基づいたベクトルを取得
const getDirectionVector = (dir: Direction): { x: number, y: number } => {
  switch (dir) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
  }
};

/**
 * スキル発動処理
 */
export const activateSkill = (state: GameState, skillId: string): GameState => {
  const { player, gameTime } = state;
  const skill = SKILLS[skillId];

  if (!skill) return state;

  // クールダウンチェック
  const nextAvailableTime = player.skillCooldowns?.[skillId] || 0;
  if (gameTime < nextAvailableTime) {
    // まだ使えない
    return state;
  }

  // コストチェック（今回は簡易実装のためMPなどは省略）

  // 新しい状態の準備
  let newState = { ...state };
  let newPlayer = { ...player };
  let newMessages = [`${skill.name}を発動！`, ...state.messages].slice(0, 10);
  
  // クールダウン設定
  newPlayer.skillCooldowns = {
    ...player.skillCooldowns,
    [skillId]: gameTime + skill.cooldown
  };

  // 効果の発動
  switch (skill.effectType) {
    case 'dash':
      // 向いている方向に一定距離瞬時に移動
      const vec = getDirectionVector(player.direction);
      const dashDist = skill.range * GRID_SIZE;
      // 壁判定などは簡易的に省略（本来は当たり判定が必要）
      newPlayer.x += vec.x * dashDist;
      newPlayer.y += vec.y * dashDist;
      break;

    case 'projectile':
      // 飛び道具の生成
      const projVec = getDirectionVector(player.direction);
      const newProjectile: Projectile = {
        id: `proj_${gameTime}_${Math.random()}`,
        x: player.x + (player.width / 2) - 10,
        y: player.y + (player.height / 2) - 10,
        width: 20,
        height: 20,
        direction: player.direction,
        speed: 8, // プロジェクタルの速度
        damage: player.stats.attack * skill.value,
        ownerId: player.id,
        lifeTime: 1000, // 1秒で消滅
        assetKey: skill.animationKey
      };
      newState.projectiles = [...(state.projectiles || []), newProjectile];
      break;

    case 'heal':
      // 回復
      const healAmount = skill.value; // 固定値または割合
      newPlayer.stats = {
        ...player.stats,
        hp: Math.min(player.stats.maxHp, player.stats.hp + healAmount)
      };
      newMessages = [`HPが ${healAmount} 回復した！`, ...newMessages].slice(0, 10);
      break;

    case 'buff_atk':
      // TODO: バフ管理システムの実装が必要
      // 今回はメッセージのみ
      newMessages = [`攻撃力が上がった！（未実装）`, ...newMessages].slice(0, 10);
      break;
      
    case 'damage':
      // 近接攻撃（範囲判定）
      // プレイヤーの前方範囲にいる敵を抽出してダメージ
      const range = skill.range * GRID_SIZE;
      const attackVec = getDirectionVector(player.direction);
      const centerX = player.x + player.width/2 + attackVec.x * (range/2);
      const centerY = player.y + player.height/2 + attackVec.y * (range/2);
      
      const hitEnemies = newState.enemies.map(enemy => {
        // 簡易距離判定
        const dx = (enemy.x + enemy.width/2) - centerX;
        const dy = (enemy.y + enemy.height/2) - centerY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < range) {
          // ヒット
          const damage = Math.floor(player.stats.attack * skill.value);
          const newHp = enemy.stats.hp - damage;
          return { ...enemy, stats: { ...enemy.stats, hp: newHp } };
        }
        return enemy;
      });
      
      newState.enemies = hitEnemies.filter(e => e.stats.hp > 0);
      break;
  }

  newState.player = newPlayer;
  newState.messages = newMessages;

  return newState;
};


/**
 * メインループ更新処理
 */
export const updateGameLogic = (state: GameState, input: { keys: Record<string, boolean> }): GameState => {
  let newState = { ...state };
  
  // 1. プレイヤー移動処理 (既存のコードを想定、ここでは簡略化して記述)
  // ... existing movement logic ...
  
  // 2. 飛び道具の更新
  if (newState.projectiles && newState.projectiles.length > 0) {
    const updatedProjectiles: Projectile[] = [];
    
    newState.projectiles.forEach(p => {
      // 移動
      const moveVec = getDirectionVector(p.direction);
      p.x += moveVec.x * p.speed;
      p.y += moveVec.y * p.speed;
      p.lifeTime -= 16; // 1フレーム約16msと仮定

      // 寿命チェック
      if (p.lifeTime <= 0) return;

      // 衝突判定（敵との）
      let hit = false;
      const hitEnemies = newState.enemies.map(enemy => {
        if (hit) return enemy; // 貫通しない場合
        
        if (
          p.x < enemy.x + enemy.width &&
          p.x + p.width > enemy.x &&
          p.y < enemy.y + enemy.height &&
          p.y + p.height > enemy.y
        ) {
          // ヒット！
          hit = true;
          const newHp = enemy.stats.hp - p.damage;
          return { ...enemy, stats: { ...enemy.stats, hp: newHp } };
        }
        return enemy;
      });

      if (hit) {
        newState.enemies = hitEnemies.filter(e => e.stats.hp > 0);
        return; // プロジェクタイル消滅
      }

      // 壁との衝突判定（簡易）
      // if (isWall(p.x, p.y)) return; 

      updatedProjectiles.push(p);
    });

    newState.projectiles = updatedProjectiles;
  }
  
  // 3. 敵AI処理など...

  newState.gameTime += 16;
  return newState;
};

// 既存のmoveEntity等のヘルパーはそのまま維持
export const moveEntity = (entity: Entity, dx: number, dy: number, map: any): Entity => {
    // 簡易実装: 壁判定なしで移動
    return {
        ...entity,
        x: entity.x + dx,
        y: entity.y + dy,
        isMoving: dx !== 0 || dy !== 0
    };
};
