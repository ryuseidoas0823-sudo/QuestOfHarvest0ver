import { GameState, Enemy, Position } from '../types/gameState';
import { ENEMY_DEFINITIONS } from '../data/enemies';

// 距離計算（マンハッタン距離）
const getDistance = (p1: Position, p2: Position) => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};

// 視線チェック（簡易版: 壁がなければOKとする）
// ※ 本来はBresenham's line algorithmなどで厳密に判定すべき
const hasLineOfSight = (p1: Position, p2: Position, map: number[][]) => {
    // 簡易実装: 単純に距離が近いかどうかだけ見る（壁貫通のリスクはあるが、一旦は距離制限でカバー）
    // 厳密な視線判定は重くなるため、今回は「部屋内なら見える」などの簡易判定を想定
    return true; 
};

// 移動候補の取得
const getMoveCandidates = (current: Position): Position[] => {
  return [
    { x: current.x, y: current.y - 1 }, // 上
    { x: current.x, y: current.y + 1 }, // 下
    { x: current.x - 1, y: current.y }, // 左
    { x: current.x + 1, y: current.y }  // 右
  ];
};

// 有効な移動先かチェック
const isValidMove = (pos: Position, gameState: GameState): boolean => {
  const { dungeon, enemies, player } = gameState;
  
  // マップ範囲外
  if (pos.y < 0 || pos.y >= dungeon.map.length || pos.x < 0 || pos.x >= dungeon.map[0].length) {
    return false;
  }
  
  // 壁判定 (0: 壁, 1: 床)
  if (dungeon.map[pos.y][pos.x] === 0) {
    return false;
  }
  
  // 他の敵がいるか
  if (enemies.some(e => e.position.x === pos.x && e.position.y === pos.y)) {
    return false;
  }
  
  // プレイヤーがいるか
  if (player.position.x === pos.x && player.position.y === pos.y) {
    return false; // 移動先としては不可（攻撃対象）
  }
  
  return true;
};

// --- AIパターンごとの行動ロジック ---

// 1. 追跡型 (Chase): 最短距離で近づく
const getChaseMove = (enemy: Enemy, gameState: GameState): Position => {
  const { player } = gameState;
  const candidates = getMoveCandidates(enemy.position);
  let bestMove = enemy.position;
  let minDist = getDistance(enemy.position, player.position);

  // ランダム性を少し入れる（毎回最適解だと重なりやすい）
  candidates.sort(() => Math.random() - 0.5);

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

// 2. 遠距離型 (Ranged): 一定距離(3-4)を保つ
const getRangedMove = (enemy: Enemy, gameState: GameState): Position => {
  const { player } = gameState;
  const currentDist = getDistance(enemy.position, player.position);
  const idealDist = 4; // 理想的な距離

  const candidates = getMoveCandidates(enemy.position);
  let bestMove = enemy.position;
  let bestScore = 999;

  // 移動評価スコア: |現在の距離 - 理想距離| が小さいほど良い
  for (const move of candidates) {
    if (isValidMove(move, gameState)) {
      const dist = getDistance(move, player.position);
      const score = Math.abs(dist - idealDist);
      
      // 距離が近すぎる場合は離れる動きを優先
      if (currentDist < idealDist && dist > currentDist) {
          return move; // 離れる動き即採用
      }

      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }
  return bestMove;
};

// 3. ランダム型 (Random): 気まぐれに動く
const getRandomMove = (enemy: Enemy, gameState: GameState): Position => {
  const candidates = getMoveCandidates(enemy.position);
  const validMoves = candidates.filter(pos => isValidMove(pos, gameState));
  
  if (validMoves.length > 0) {
      // 20%の確率で動かない
      if (Math.random() < 0.2) return enemy.position;
      return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  return enemy.position;
};

// 4. 固定型 (Stationary): 動かない
const getStationaryMove = (enemy: Enemy, gameState: GameState): Position => {
  return enemy.position;
};

// 5. ボスAI (Minotaur): 突進などを考慮（今回はChase強化版）
const getBossMinotaurMove = (enemy: Enemy, gameState: GameState): Position => {
    // 基本は追跡だが、HPが減ると行動パターンが変わるなどの拡張余地あり
    return getChaseMove(enemy, gameState);
};


/**
 * メインAI関数
 * 敵の行動（移動または攻撃）を決定し、GameStateを更新して返す
 */
export const processEnemyTurn = (gameState: GameState): GameState => {
  let { enemies, player, messages } = gameState;
  let playerHp = player.stats.hp;
  const newMessages = [...messages];

  const newEnemies = enemies.map(enemy => {
    // 状態異常チェック (Stunなど)
    const isStunned = enemy.statusEffects?.some(e => e.type === 'stun');
    if (isStunned) {
        // newMessages.push({ text: `${enemy.name}は動けない！`, type: 'info' });
        return enemy;
    }

    const dist = getDistance(enemy.position, player.position);
    
    // --- 攻撃判定 ---
    // AIタイプに応じた攻撃射程
    let attackRange = 1;
    if (enemy.aiType === 'ranged' || enemy.race === 'plant') attackRange = 4;
    if (enemy.aiType === 'boss_goliath') attackRange = 5;

    // 射程内なら攻撃
    if (dist <= attackRange) {
        // 遠距離攻撃の場合は視線チェックも必要だが今回は省略
        
        // ダメージ計算
        // プレイヤー防御力 (簡易)
        const playerDef = 0; // 将来的には player.stats.defense
        let damage = Math.max(1, enemy.attack - playerDef);
        
        // クリティカルや乱数
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        playerHp -= damage;
        newMessages.push({ text: `${enemy.name}の攻撃！ ${damage}のダメージ！`, type: 'warning' });
        
        // 状態異常攻撃の判定
        // 定義データに specialEffect があれば確率で付与
        // (データ定義がまだないので、種族判定で仮実装)
        if (enemy.race === 'plant' && Math.random() < 0.3) {
            // 毒付与ロジック (player.statusEffectsに追加)
             newMessages.push({ text: `毒を受けた！`, type: 'danger' });
             // 実際にはここで player.statusEffects を更新する必要がある
             // 今回はメッセージのみ
        }

        return enemy; // 攻撃したら移動しない
    }

    // --- 移動処理 ---
    let nextPos = enemy.position;

    switch (enemy.aiType) {
        case 'chase':
            nextPos = getChaseMove(enemy, gameState);
            break;
        case 'ranged':
            nextPos = getRangedMove(enemy, gameState);
            break;
        case 'random':
            nextPos = getRandomMove(enemy, gameState);
            break;
        case 'stationary':
            nextPos = getStationaryMove(enemy, gameState);
            break;
        case 'boss_minotaur':
            nextPos = getBossMinotaurMove(enemy, gameState);
            break;
        case 'boss_goliath':
            // ゴライアスは基本動かないか、非常に遅い
            if (Math.random() < 0.3) nextPos = getChaseMove(enemy, gameState);
            else nextPos = enemy.position;
            break;
        default:
            nextPos = getChaseMove(enemy, gameState);
            break;
    }

    return {
        ...enemy,
        position: nextPos
    };
  });

  return {
      ...gameState,
      enemies: newEnemies,
      player: {
          ...player,
          stats: {
              ...player.stats,
              hp: Math.max(0, playerHp)
          }
      },
      messages: newMessages
  };
};
