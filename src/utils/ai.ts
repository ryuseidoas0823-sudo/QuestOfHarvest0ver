import { GameState, Enemy, Position } from '../types/gameState';
import { ENEMY_DEFINITIONS } from '../data/enemies';

// 距離計算
const getDistance = (p1: Position, p2: Position) => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};

// 移動候補の取得
const getMoveCandidates = (current: Position): Position[] => {
  return [
    { x: current.x, y: current.y - 1 },
    { x: current.x, y: current.y + 1 },
    { x: current.x - 1, y: current.y },
    { x: current.x + 1, y: current.y }
  ];
};

// 有効な移動先かチェック
const isValidMove = (pos: Position, gameState: GameState): boolean => {
  const { dungeon, enemies, player } = gameState;
  if (pos.y < 0 || pos.y >= dungeon.map.length || pos.x < 0 || pos.x >= dungeon.map[0].length) return false;
  if (dungeon.map[pos.y][pos.x] === 0) return false;
  if (enemies.some(e => e.position.x === pos.x && e.position.y === pos.y)) return false;
  if (player.position.x === pos.x && player.position.y === pos.y) return false;
  return true;
};

// AI: 追跡
const getChaseMove = (enemy: Enemy, gameState: GameState): Position => {
  const { player } = gameState;
  const candidates = getMoveCandidates(enemy.position);
  let bestMove = enemy.position;
  let minDist = getDistance(enemy.position, player.position);
  candidates.sort(() => Math.random() - 0.5); // Random shuffle

  for (const move of candidates) {
    if (isValidMove(move, gameState)) {
      const dist = getDistance(move, player.position);
      if (dist < minDist) {
        minDist = dist;
        bestMove = move;
      }
    }
  }
  return bestMove;
};

// AI: 遠距離 (Kiting)
const getRangedMove = (enemy: Enemy, gameState: GameState): Position => {
  const { player } = gameState;
  const currentDist = getDistance(enemy.position, player.position);
  const idealDist = 4;
  const candidates = getMoveCandidates(enemy.position);
  let bestMove = enemy.position;
  let bestScore = 999;

  for (const move of candidates) {
    if (isValidMove(move, gameState)) {
      const dist = getDistance(move, player.position);
      const score = Math.abs(dist - idealDist);
      if (currentDist < idealDist && dist > currentDist) return move; // Flee
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }
  return bestMove;
};

// AI: ランダム
const getRandomMove = (enemy: Enemy, gameState: GameState): Position => {
  const candidates = getMoveCandidates(enemy.position);
  const validMoves = candidates.filter(pos => isValidMove(pos, gameState));
  if (validMoves.length > 0) {
      if (Math.random() < 0.2) return enemy.position;
      return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  return enemy.position;
};

// AI: ボス (Minotaur - Aggressive)
const getBossMinotaurMove = (enemy: Enemy, gameState: GameState): Position => {
    // HPが減ると発狂モードで倍速移動...などの拡張が可能
    // 基本は接近戦思考
    return getChaseMove(enemy, gameState);
};

// --- メインAI関数 ---
export const processEnemyTurn = (gameState: GameState): GameState => {
  let { enemies, player, messages } = gameState;
  let playerHp = player.stats.hp;
  const newMessages = [...messages];

  const newEnemies = enemies.map(enemy => {
    // 状態異常チェック
    const isStunned = enemy.statusEffects?.some(e => e.type === 'stun');
    if (isStunned) return enemy;

    const dist = getDistance(enemy.position, player.position);

    // --- スキル使用判定 ---
    // 行動可能な場合、一定確率でスキルを使用する
    // クールダウン管理が必要
    let skillUsed = false;
    let currentCooldowns = { ...(enemy.cooldowns || {}) };

    if (enemy.skills && enemy.skills.length > 0) {
        for (const skill of enemy.skills) {
            // CDチェック
            const cd = currentCooldowns[skill.id] || 0;
            if (cd > 0) continue;

            // 射程チェック
            if (dist > skill.range) continue;

            // 確率チェック
            if (Math.random() > skill.prob) continue;

            // スキル発動！
            skillUsed = true;
            newMessages.push({ text: `${enemy.name}${skill.message}`, type: 'danger' });
            
            // クールダウン設定
            currentCooldowns[skill.id] = skill.cooldown;

            // 効果処理
            let damage = 0;
            if (skill.type === 'attack') {
                damage = Math.floor(enemy.attack * (skill.damageMult || 1.0));
                // 範囲攻撃ならプレイヤー周囲も...（今回は簡易的にプレイヤー単体 or 全体）
                if (skill.areaRadius) {
                    newMessages.push({ text: `範囲攻撃！(プレイヤー以外への被害は未実装)`, type: 'warning' });
                }
            } else if (skill.type === 'heal') {
                // 自己回復 (enemy.hpを更新する必要があるが、map内なのでreturnで返す)
                // ここでは簡易的に回復メッセージのみで、実際の回復は後述のreturn objectで処理したいが
                // map関数内での処理フローが複雑になるため、damageを負の値にしてハックする
                damage = -50; // 仮の回復量
                newMessages.push({ text: `HPが回復した！`, type: 'info' });
            } else if (skill.type === 'debuff') {
                // スタンなど
                if (skill.statusEffect === 'stun') {
                    // プレイヤーをスタンさせる処理が必要（GameState更新）
                    // ここではメッセージのみ
                    newMessages.push({ text: `あなたはスタンした！(未実装)`, type: 'danger' });
                }
            }

            // ダメージ適用
            // 回復スキルの場合はHP回復処理を入れるべきだが、
            // ここではプレイヤーへのダメージのみを扱う
            if (damage > 0) {
                // 防御計算
                const playerDef = 0;
                const finalDmg = Math.max(1, damage - playerDef);
                playerHp -= finalDmg;
                newMessages.push({ text: `${finalDmg}のダメージを受けた！`, type: 'warning' });
                
                // 状態異常付与 (Burn/Poison)
                if (skill.statusEffect && Math.random() < 0.7) { // 70%付与
                    newMessages.push({ text: `${skill.statusEffect.toUpperCase()}状態になった！`, type: 'danger' });
                    // TODO: player.statusEffects に push
                }
            }

            break; // 1ターンに1スキルのみ
        }
    }
    
    // スキルのCD減少処理
    Object.keys(currentCooldowns).forEach(k => {
        if (currentCooldowns[k] > 0) currentCooldowns[k]--;
    });

    if (skillUsed) {
        return {
            ...enemy,
            cooldowns: currentCooldowns
        };
    }

    // --- 通常攻撃判定 ---
    // スキルを使わなかった、または使えなかった場合
    let attackRange = 1;
    if (enemy.aiType === 'ranged' || enemy.race === 'plant') attackRange = 4;
    if (enemy.aiType === 'boss_goliath') attackRange = 6;

    if (dist <= attackRange) {
        // 通常攻撃
        let damage = Math.max(1, enemy.attack);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        playerHp -= damage;
        newMessages.push({ text: `${enemy.name}の攻撃！ ${damage}のダメージ！`, type: 'warning' });

        return { ...enemy, cooldowns: currentCooldowns };
    }

    // --- 移動処理 ---
    let nextPos = enemy.position;
    switch (enemy.aiType) {
        case 'chase': nextPos = getChaseMove(enemy, gameState); break;
        case 'ranged': nextPos = getRangedMove(enemy, gameState); break;
        case 'random': nextPos = getRandomMove(enemy, gameState); break;
        case 'boss_minotaur': nextPos = getBossMinotaurMove(enemy, gameState); break;
        case 'boss_goliath': 
            // 30%の確率で動く
            if (Math.random() < 0.3) nextPos = getChaseMove(enemy, gameState);
            break;
        default: nextPos = getChaseMove(enemy, gameState); break;
    }

    return {
        ...enemy,
        position: nextPos,
        cooldowns: currentCooldowns
    };
  });

  return {
      ...gameState,
      enemies: newEnemies,
      player: {
          ...player,
          stats: { ...player.stats, hp: Math.max(0, playerHp) }
      },
      messages: newMessages
  };
};
