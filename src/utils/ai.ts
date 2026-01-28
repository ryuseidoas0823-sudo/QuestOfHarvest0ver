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
    return getChaseMove(enemy, gameState);
};

// --- メインAI関数 ---
export const processEnemyTurn = (gameState: GameState): GameState => {
  let { enemies, player, messages } = gameState;
  let playerHp = player.stats.hp; // 現在HP
  let playerGold = player.gold;   // ゴールド（愚者の黄金鎧用）
  const newMessages = [...messages];

  // ユニーク効果チェック: 愚者の黄金鎧
  const hasFoolsGold = player.equipment.armor?.id === 'unique_fools_gold';

  const newEnemies = enemies.map(enemy => {
    // 状態異常チェック
    const isStunned = enemy.statusEffects?.some((e: any) => e.type === 'stun');
    if (isStunned) return enemy;

    const dist = getDistance(enemy.position, player.position);

    // --- スキル使用判定 ---
    let skillUsed = false;
    let currentCooldowns = { ...(enemy.cooldowns || {}) };

    if (enemy.skills && enemy.skills.length > 0) {
        for (const skill of enemy.skills) {
            const cd = currentCooldowns[skill.id] || 0;
            if (cd > 0) continue;
            if (dist > skill.range) continue;
            if (Math.random() > skill.prob) continue;

            skillUsed = true;
            newMessages.push({ text: `${enemy.name}${skill.message}`, type: 'danger' });
            currentCooldowns[skill.id] = skill.cooldown;

            let damage = 0;
            if (skill.type === 'attack') {
                damage = Math.floor(enemy.attack * (skill.damageMult || 1.0));
                if (skill.areaRadius) {
                    newMessages.push({ text: `範囲攻撃！`, type: 'warning' });
                }
            } else if (skill.type === 'heal') {
                damage = 0;
                newMessages.push({ text: `${enemy.name}のHPが回復した！(AIロジック未実装)`, type: 'info' });
            } else if (skill.type === 'debuff') {
                if (skill.statusEffect === 'stun') {
                    newMessages.push({ text: `あなたはスタンした！(未実装)`, type: 'danger' });
                }
            }

            // ダメージ適用ロジック (共通化)
            if (damage > 0) {
                const playerDef = player.stats.defense || 0;
                let finalDmg = Math.max(1, damage - playerDef);

                // --- 愚者の黄金鎧 (Fool's Gold Armor) Effect ---
                if (hasFoolsGold) {
                    const goldLoss = finalDmg * 2; // 被ダメの200%を失う
                    if (playerGold >= goldLoss) {
                        playerGold -= goldLoss;
                        newMessages.push({ text: `黄金の輝きがダメージを吸収した！ (-${goldLoss} G)`, type: 'warning' });
                        finalDmg = 0; // ダメージ無効化
                    } else {
                        // ゴールドが尽きたら即死
                        playerGold = 0;
                        finalDmg = 9999;
                        newMessages.push({ text: `金貨が尽きた... 黄金の呪いが発動！`, type: 'danger' });
                    }
                }
                // ---------------------------------------------

                playerHp -= finalDmg;
                if (finalDmg > 0) {
                    newMessages.push({ text: `${finalDmg}のダメージを受けた！`, type: 'warning' });
                }
                
                if (skill.statusEffect && Math.random() < 0.7 && finalDmg > 0) {
                    newMessages.push({ text: `${skill.statusEffect.toUpperCase()}状態になった！`, type: 'danger' });
                }
            }

            break; // 1ターンに1スキル
        }
    }
    
    Object.keys(currentCooldowns).forEach(k => {
        if (currentCooldowns[k] > 0) currentCooldowns[k]--;
    });

    if (skillUsed) {
        return { ...enemy, cooldowns: currentCooldowns };
    }

    // --- 通常攻撃判定 ---
    let attackRange = 1;
    if (enemy.aiType === 'ranged' || enemy.race === 'plant') attackRange = 4;
    if (enemy.aiType === 'boss_goliath') attackRange = 6;

    if (dist <= attackRange) {
        let damage = Math.max(1, enemy.attack);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        // 防御計算（簡易）
        const playerDef = player.stats.defense || 0;
        let finalDmg = Math.max(1, damage - playerDef);

        // --- 愚者の黄金鎧 (Fool's Gold Armor) Effect (通常攻撃版) ---
        if (hasFoolsGold) {
            const goldLoss = finalDmg * 2;
            if (playerGold >= goldLoss) {
                playerGold -= goldLoss;
                newMessages.push({ text: `黄金の鎧が守ってくれた！ (-${goldLoss} G)`, type: 'warning' });
                finalDmg = 0;
            } else {
                playerGold = 0;
                finalDmg = 9999;
                newMessages.push({ text: `金貨が尽き、呪いが身を蝕む！`, type: 'danger' });
            }
        }
        // -----------------------------------------------------

        playerHp -= finalDmg;
        if (finalDmg > 0) {
            newMessages.push({ text: `${enemy.name}の攻撃！ ${finalDmg}のダメージ！`, type: 'warning' });
        }

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
          gold: playerGold, // 更新されたゴールド
          hp: Math.max(0, playerHp), // ここはState表示用の一時反映（useTurnSystemでstats.hpも更新される必要があるが簡易同期）
          stats: { ...player.stats, hp: Math.max(0, playerHp) }
      },
      messages: newMessages
  };
};
