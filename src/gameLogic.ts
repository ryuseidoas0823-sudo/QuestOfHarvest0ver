import { useState, useEffect, useCallback, useRef } from 'react';
import { generateDungeon } from './dungeonGenerator';
import { DungeonMap, TileType } from './types';
import { EnemyInstance } from './types/enemy';
import { enemies as enemyData } from './data/enemies';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { getDistance } from './utils';

// ... existing interfaces ...
interface GameState {
  dungeon: DungeonMap | null;
  playerPos: { x: number; y: number };
  enemies: EnemyInstance[];
  floor: number;
  gameOver: boolean;
  gameClear: boolean;
  messageLog: string[];
}

export const useGameLogic = (
  playerJob: Job,
  chapter: number, // 追加: 進行度によって仲間を出す判定に使用
  activeQuests: Quest[],
  onQuestUpdate: (questId: string, progress: number) => void,
  onPlayerDeath: () => void
) => {
  const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [enemies, setEnemies] = useState<EnemyInstance[]>([]);
  const [floor, setFloor] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  
  const [playerHp, setPlayerHp] = useState(100);
  const playerMaxHp = 100; // 仮の実装。本来はstatsから計算
  const playerAttack = 10;

  // ターン処理参照用
  const playerPosRef = useRef({ x: 0, y: 0 });
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);

  const addLog = useCallback((msg: string) => {
    setMessageLog(prev => [msg, ...prev].slice(0, 5));
  }, []);

  // ダンジョン初期化
  const initFloor = useCallback((floorNum: number) => {
    const newDungeon = generateDungeon(floorNum);
    setDungeon(newDungeon);
    setPlayerPos(newDungeon.playerStart);
    setFloor(floorNum);

    const newEnemies: EnemyInstance[] = [];
    
    // --- ボス階層の判定 ---
    const isBossFloor = floorNum % 5 === 0;
    const isRescueQuestActive = activeQuests.some(q => q.id === 'mq_1_5');

    // --- 仲間のスポーン (第2章以降) ---
    // ボス階層でも通常階層でも、プレイヤーの近くに配置
    if (chapter >= 2) {
        const allyData = enemyData.find(e => e.id === 'elias_ally');
        if (allyData) {
            newEnemies.push({
                ...allyData,
                uniqueId: 'ally_elias',
                hp: allyData.maxHp,
                x: newDungeon.playerStart.x + 1, // プレイヤーの隣
                y: newDungeon.playerStart.y,
                faction: 'player_ally',
                aiType: 'aggressive'
            });
            // 初回のみログを出すなどの制御も可
            // addLog(`${allyData.name}が同行している。`);
        }
    }

    if (isBossFloor) {
        // ボス配置
        const bossData = enemyData.find(e => e.type === 'boss') || enemyData[0];
        // 階層に応じてボスを変える簡易ロジック
        let currentBoss = bossData;
        if (floorNum === 5) currentBoss = enemyData.find(e => e.id === 'orc_general') || bossData;
        if (floorNum === 10) currentBoss = enemyData.find(e => e.id === 'cerberus') || bossData;

        const room = newDungeon.rooms[0];
        newEnemies.push({
            ...currentBoss,
            uniqueId: `boss_${floorNum}`,
            hp: currentBoss.maxHp,
            x: Math.floor(room.x + room.w / 2),
            y: Math.floor(room.y + room.h / 2),
            faction: 'monster'
        });

        // 第1章ボス戦の救助対象配置
        if (floorNum === 5 && isRescueQuestActive) {
            const npcData = enemyData.find(e => e.id === 'injured_adventurer');
            if (npcData) {
                newEnemies.push({
                    ...npcData,
                    uniqueId: 'npc_rescue_target',
                    hp: npcData.maxHp,
                    x: room.x + 2,
                    y: room.y + 2,
                    faction: 'player_ally',
                    aiType: 'stationary'
                });
            }
        }
    } else {
        // 通常敵の配置
        newDungeon.rooms.forEach(room => {
             const count = Math.floor(Math.random() * 2) + 1;
             for(let i=0; i<count; i++) {
                 // NPC/Boss/Ally以外から抽選
                 const validEnemies = enemyData.filter(e => e.faction === 'monster' && e.type !== 'boss');
                 const data = validEnemies[Math.floor(Math.random() * validEnemies.length)];
                 
                 newEnemies.push({
                     ...data,
                     uniqueId: `e_${room.x}_${room.y}_${i}`,
                     hp: data.maxHp,
                     x: Math.floor(room.x + Math.random() * room.w),
                     y: Math.floor(room.y + Math.random() * room.h),
                     faction: 'monster'
                 });
             }
        });
    }

    setEnemies(newEnemies);
  }, [activeQuests, addLog, chapter]);

  useEffect(() => {
    initFloor(1);
  }, []);

  // --- プレイヤー移動 ---
  const movePlayer = (dx: number, dy: number) => {
    if (gameOver || !dungeon) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (dungeon.tiles[newY][newX] === 'wall') return;

    // 攻撃判定
    const targetEnemy = enemies.find(e => e.x === newX && e.y === newY);
    if (targetEnemy) {
        if (targetEnemy.faction === 'monster') {
            const damage = Math.max(1, playerAttack - targetEnemy.defense);
            addLog(`あなた の攻撃！ ${targetEnemy.name}に${damage}ダメージ`);
            
            applyDamageToEnemy(targetEnemy.uniqueId, damage);
        } else if (targetEnemy.faction === 'player_ally') {
            // 味方と位置を入れ替える（便利機能）
            setPlayerPos({ x: newX, y: newY });
            setEnemies(prev => prev.map(e => 
                e.uniqueId === targetEnemy.uniqueId ? { ...e, x: playerPos.x, y: playerPos.y } : e
            ));
            addLog(`${targetEnemy.name}と位置を入れ替わった。`);
            return; // ターン経過させない、あるいはさせる
        }
        
        processTurn();
        return;
    }

    setPlayerPos({ x: newX, y: newY });
    
    if (newX === dungeon.stairs.x && newY === dungeon.stairs.y) {
        addLog('階段を降りた。');
        initFloor(floor + 1);
    }

    processTurn();
  };

  // ダメージ適用ヘルパー
  const applyDamageToEnemy = (targetId: string, damage: number) => {
      setEnemies(prev => {
          const next = prev.map(e => {
              if (e.uniqueId === targetId) return { ...e, hp: e.hp - damage };
              return e;
          }).filter(e => e.hp > 0);

          // 撃破ログ
          if (next.length < prev.length) {
              const dead = prev.find(p => !next.find(n => n.uniqueId === p.uniqueId));
              if (dead) {
                  addLog(`${dead.name}を倒した！`);
                  // クエスト更新判定
                  if (dead.id === 'orc_general') onQuestUpdate('mq_1_5', 1);
                  if (dead.id === 'cerberus') onQuestUpdate('mq_2_5', 1);
                  // 汎用討伐クエスト
                  activeQuests.forEach(q => {
                      if (q.type === 'hunt' && q.targetId === dead.id) {
                          onQuestUpdate(q.id, 1);
                      }
                  });
              }
          }
          return next;
      });
  };

  // --- ターン処理 (敵＆味方AI) ---
  const processTurn = () => {
    if (!dungeon) return;

    setEnemies(prevEnemies => {
        let nextEnemies = prevEnemies.map(e => ({ ...e }));
        const currentPlayerPos = playerPosRef.current;

        // 全キャラ行動処理
        // 本来は素早さ順などでソートすべきだが、ここでは配列順（生成順）
        
        nextEnemies.forEach((actor, actorIdx) => {
            if (actor.hp <= 0) return; // 死亡済
            if (actor.aiType === 'stationary') return; // 動かない

            // 自身の最新ステータス
            const myState = nextEnemies[actorIdx];
            let newX = myState.x;
            let newY = myState.y;

            // --- 味方AI (Faction: player_ally) ---
            if (actor.faction === 'player_ally') {
                // 1. 近くの敵を探す
                const targets = nextEnemies
                    .filter(e => e.faction === 'monster' && e.hp > 0)
                    .map(e => ({ 
                        id: e.uniqueId, 
                        x: e.x, 
                        y: e.y, 
                        dist: getDistance(myState.x, myState.y, e.x, e.y) 
                    }))
                    .sort((a, b) => a.dist - b.dist);
                
                const nearestEnemy = targets[0];

                if (nearestEnemy && nearestEnemy.dist <= 5) {
                    // 索敵範囲内なら戦闘モード
                    if (nearestEnemy.dist <= 1.5) {
                        // 攻撃
                        const targetEntity = prevEnemies.find(e => e.uniqueId === nearestEnemy.id);
                        const dmg = Math.max(1, actor.attack - (targetEntity?.defense || 0));
                        // ダメージ適用（nextEnemiesを直接操作）
                        const targetIdx = nextEnemies.findIndex(e => e.uniqueId === nearestEnemy.id);
                        if (targetIdx !== -1) {
                            nextEnemies[targetIdx].hp -= dmg;
                            addLog(`${actor.name}の攻撃！ ${nextEnemies[targetIdx].name}に${dmg}ダメージ`);
                        }
                    } else {
                        // 敵に近づく
                        if (nearestEnemy.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
                        else if (nearestEnemy.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
                        else if (nearestEnemy.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
                        else if (nearestEnemy.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
                    }
                } else {
                    // 敵がいない場合: プレイヤーに追従
                    const distToPlayer = getDistance(myState.x, myState.y, currentPlayerPos.x, currentPlayerPos.y);
                    if (distToPlayer > 2) {
                        // プレイヤーに近づく
                        if (currentPlayerPos.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
                        else if (currentPlayerPos.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
                        else if (currentPlayerPos.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
                        else if (currentPlayerPos.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
                    }
                }
            }
            
            // --- モンスターAI (Faction: monster) ---
            else if (actor.faction === 'monster') {
                // ターゲット選定（プレイヤー or 味方NPC）
                const targets = [
                    { type: 'player', x: currentPlayerPos.x, y: currentPlayerPos.y, dist: getDistance(myState.x, myState.y, currentPlayerPos.x, currentPlayerPos.y) },
                    ...nextEnemies
                       .filter(e => e.faction === 'player_ally' && e.hp > 0)
                       .map(e => ({ type: 'npc', id: e.uniqueId, x: e.x, y: e.y, dist: getDistance(myState.x, myState.y, e.x, e.y) }))
                ].sort((a, b) => a.dist - b.dist);

                const target = targets[0];
                if (target) {
                    if (target.dist <= 1.5) {
                        // 攻撃
                        if (target.type === 'player') {
                            const dmg = Math.max(1, actor.attack - 5); // Player def temp
                            setPlayerHp(prev => {
                                const next = prev - dmg;
                                if (next <= 0) {
                                    setGameOver(true);
                                    onPlayerDeath();
                                }
                                return next;
                            });
                            addLog(`${actor.name}の攻撃！ あなたに${dmg}ダメージ`);
                        } else {
                            // NPC攻撃
                            const npcIdx = nextEnemies.findIndex(e => e.uniqueId === target.id);
                            if (npcIdx !== -1) {
                                const dmg = Math.max(1, actor.attack - nextEnemies[npcIdx].defense);
                                nextEnemies[npcIdx].hp -= dmg;
                                addLog(`${actor.name}の攻撃！ ${nextEnemies[npcIdx].name}に${dmg}ダメージ`);
                            }
                        }
                    } else {
                        // 移動
                        if (target.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
                        else if (target.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
                        else if (target.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
                        else if (target.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
                    }
                }
            }

            // 移動更新 (衝突判定)
            // 自分以外、かつ生きてる奴、かつプレイヤー
            const isBlocked = nextEnemies.some((e, idx) => idx !== actorIdx && e.hp > 0 && e.x === newX && e.y === newY) ||
                              (currentPlayerPos.x === newX && currentPlayerPos.y === newY);
            
            if (!isBlocked) {
                nextEnemies[actorIdx].x = newX;
                nextEnemies[actorIdx].y = newY;
            }
        });

        // 死亡した敵・NPCを除外
        return nextEnemies.filter(e => e.hp > 0);
    });
  };

  return {
    dungeon,
    playerPos,
    enemies,
    floor,
    gameOver,
    messageLog,
    movePlayer,
    playerHp,
    playerMaxHp
  };
};
