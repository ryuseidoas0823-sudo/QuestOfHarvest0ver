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
  chapter: number,
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
  const playerMaxHp = 100;
  const playerAttack = 10;

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
    // --- 第3章 モンスターハウス判定 ---
    // クエスト MQ3-2 受注中、かつ 12階
    const isMonsterHouseEvent = activeQuests.some(q => q.id === 'mq_3_2') && floorNum === 12;

    // --- 仲間のスポーン (第2章以降) ---
    if (chapter >= 2) {
        const allyData = enemyData.find(e => e.id === 'elias_ally');
        if (allyData) {
            newEnemies.push({
                ...allyData,
                uniqueId: 'ally_elias',
                hp: allyData.maxHp,
                x: newDungeon.playerStart.x + 1,
                y: newDungeon.playerStart.y,
                faction: 'player_ally',
                aiType: 'aggressive'
            });
        }
    }

    if (isBossFloor) {
        // ... Boss placement logic (unchanged) ...
        const bossData = enemyData.find(e => e.type === 'boss') || enemyData[0];
        let currentBoss = bossData;
        if (floorNum === 5) currentBoss = enemyData.find(e => e.id === 'orc_general') || bossData;
        if (floorNum === 10) currentBoss = enemyData.find(e => e.id === 'cerberus') || bossData;
        // 第3章ボス
        if (floorNum === 15) currentBoss = { ...bossData, name: 'キメラ・ゴーレム', id: 'chimera_golem', maxHp: 500, attack: 35 };

        const room = newDungeon.rooms[0];
        newEnemies.push({
            ...currentBoss,
            uniqueId: `boss_${floorNum}`,
            hp: currentBoss.maxHp,
            x: Math.floor(room.x + room.w / 2),
            y: Math.floor(room.y + room.h / 2),
            faction: 'monster'
        });

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
             let count = Math.floor(Math.random() * 2) + 1;
             
             // モンスターハウス発生時の処理
             // 最後の部屋（階段がある部屋など）に大量発生させる
             if (isMonsterHouseEvent && room === newDungeon.rooms[newDungeon.rooms.length - 1]) {
                 count = 10; // 大量発生
                 addLog("部屋に入った瞬間、大量の殺気を感じた！(モンスターハウス)");
             }

             for(let i=0; i<count; i++) {
                 const validEnemies = enemyData.filter(e => e.faction === 'monster' && e.type !== 'boss');
                 // 第3章用モンスター（例：オーク強化版など）を混ぜる拡張もここで可能
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

  // ... rest of the file (movePlayer, processTurn, etc.) ...
  
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
            setPlayerPos({ x: newX, y: newY });
            setEnemies(prev => prev.map(e => 
                e.uniqueId === targetEnemy.uniqueId ? { ...e, x: playerPos.x, y: playerPos.y } : e
            ));
            addLog(`${targetEnemy.name}と位置を入れ替わった。`);
            return;
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

          if (next.length < prev.length) {
              const dead = prev.find(p => !next.find(n => n.uniqueId === p.uniqueId));
              if (dead) {
                  addLog(`${dead.name}を倒した！`);
                  // クエスト更新判定
                  if (dead.id === 'orc_general') onQuestUpdate('mq_1_5', 1);
                  if (dead.id === 'cerberus') onQuestUpdate('mq_2_5', 1);
                  if (dead.id === 'chimera_golem') onQuestUpdate('mq_3_5', 1); // 第3章ボス
                  
                  // 第3章モンスターハウス討伐数など
                  activeQuests.forEach(q => {
                      if (q.type === 'hunt' && q.targetId === dead.id) {
                          onQuestUpdate(q.id, 1);
                      }
                      // 黒い魔石ドロップ処理（簡易）
                      if (q.id === 'mq_3_3' && Math.random() < 0.3) {
                          onQuestUpdate('mq_3_3', 1);
                          addLog('黒い魔石を手に入れた！');
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

        nextEnemies.forEach((actor, actorIdx) => {
            if (actor.hp <= 0) return; 
            if (actor.aiType === 'stationary') return;

            const myState = nextEnemies[actorIdx];
            let newX = myState.x;
            let newY = myState.y;

            if (actor.faction === 'player_ally') {
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
                    if (nearestEnemy.dist <= 1.5) {
                        const targetEntity = prevEnemies.find(e => e.uniqueId === nearestEnemy.id);
                        const dmg = Math.max(1, actor.attack - (targetEntity?.defense || 0));
                        const targetIdx = nextEnemies.findIndex(e => e.uniqueId === nearestEnemy.id);
                        if (targetIdx !== -1) {
                            nextEnemies[targetIdx].hp -= dmg;
                            addLog(`${actor.name}の攻撃！ ${nextEnemies[targetIdx].name}に${dmg}ダメージ`);
                        }
                    } else {
                        if (nearestEnemy.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
                        else if (nearestEnemy.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
                        else if (nearestEnemy.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
                        else if (nearestEnemy.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
                    }
                } else {
                    const distToPlayer = getDistance(myState.x, myState.y, currentPlayerPos.x, currentPlayerPos.y);
                    if (distToPlayer > 2) {
                        if (currentPlayerPos.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
                        else if (currentPlayerPos.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
                        else if (currentPlayerPos.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
                        else if (currentPlayerPos.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
                    }
                }
            }
            else if (actor.faction === 'monster') {
                const targets = [
                    { type: 'player', x: currentPlayerPos.x, y: currentPlayerPos.y, dist: getDistance(myState.x, myState.y, currentPlayerPos.x, currentPlayerPos.y) },
                    ...nextEnemies
                       .filter(e => e.faction === 'player_ally' && e.hp > 0)
                       .map(e => ({ type: 'npc', id: e.uniqueId, x: e.x, y: e.y, dist: getDistance(myState.x, myState.y, e.x, e.y) }))
                ].sort((a, b) => a.dist - b.dist);

                const target = targets[0];
                if (target) {
                    if (target.dist <= 1.5) {
                        if (target.type === 'player') {
                            const dmg = Math.max(1, actor.attack - 5); 
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
                            const npcIdx = nextEnemies.findIndex(e => e.uniqueId === target.id);
                            if (npcIdx !== -1) {
                                const dmg = Math.max(1, actor.attack - nextEnemies[npcIdx].defense);
                                nextEnemies[npcIdx].hp -= dmg;
                                addLog(`${actor.name}の攻撃！ ${nextEnemies[npcIdx].name}に${dmg}ダメージ`);
                            }
                        }
                    } else {
                        if (target.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
                        else if (target.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
                        else if (target.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
                        else if (target.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
                    }
                }
            }

            const isBlocked = nextEnemies.some((e, idx) => idx !== actorIdx && e.hp > 0 && e.x === newX && e.y === newY) ||
                              (currentPlayerPos.x === newX && currentPlayerPos.y === newY);
            
            if (!isBlocked) {
                nextEnemies[actorIdx].x = newX;
                nextEnemies[actorIdx].y = newY;
            }
        });

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
