import { useState, useEffect, useCallback, useRef } from 'react';
import { generateDungeon } from './dungeonGenerator';
import { DungeonMap, TileType } from './types';
import { Enemy, EnemyInstance, Faction } from './types/enemy';
import { enemies as enemyData } from './data/enemies';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { getDistance } from './utils';

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
  initialJob: Job,
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

  // ターン処理内で最新のプレイヤー座標を参照するためのRef
  const playerPosRef = useRef({ x: 0, y: 0 });
  
  // プレイヤー座標更新時にRefも同期
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

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
    
    // --- ボス階層の特別処理 ---
    const isBossFloor = floorNum % 5 === 0;
    const isRescueQuestActive = activeQuests.some(q => q.id === 'mq_1_5');

    if (isBossFloor) {
        const bossData = enemyData.find(e => e.type === 'boss') || enemyData[0];
        const room = newDungeon.rooms[0];
        
        newEnemies.push({
            ...bossData,
            uniqueId: `boss_${floorNum}`,
            hp: bossData.maxHp,
            x: Math.floor(room.x + room.w / 2),
            y: Math.floor(room.y + room.h / 2),
            faction: 'monster'
        });

        if (isRescueQuestActive && floorNum === 5) {
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
                addLog('奥に誰かが倒れている！ ボスから守らなければ！');
            }
        }

    } else {
        newDungeon.rooms.forEach(room => {
             const count = Math.floor(Math.random() * 2);
             for(let i=0; i<count; i++) {
                 const data = enemyData.filter(e => e.type !== 'boss' && e.faction !== 'player_ally')[
                     Math.floor(Math.random() * (enemyData.length - 2))
                 ] || enemyData[0];
                 
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
  }, [activeQuests, addLog]);

  useEffect(() => {
    initFloor(1);
  }, []);

  const movePlayer = (dx: number, dy: number) => {
    if (gameOver || !dungeon) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (dungeon.tiles[newY][newX] === 'wall') return;

    const targetEnemy = enemies.find(e => e.x === newX && e.y === newY);
    if (targetEnemy) {
        if (targetEnemy.faction === 'monster') {
            const damage = Math.max(1, playerAttack - targetEnemy.defense);
            addLog(`${targetEnemy.name}に${damage}のダメージ！`);
            
            // プレイヤーの攻撃処理
            setEnemies(prev => {
                const next = prev.map(e => {
                    if (e.uniqueId === targetEnemy.uniqueId) {
                        return { ...e, hp: e.hp - damage };
                    }
                    return e;
                }).filter(e => e.hp > 0);
                
                // 撃破判定
                if (next.length < prev.length) {
                    addLog(`${targetEnemy.name}を倒した！`);
                    if (targetEnemy.type === 'boss') {
                        // 救助成功判定
                        const npc = next.find(e => e.faction === 'player_ally');
                        if (npc) { // NPCが生きていれば
                            addLog('救助成功！ 安全を確保した。');
                            onQuestUpdate('mq_1_5', 1);
                        } else if (!activeQuests.some(q => q.id === 'mq_1_5')) {
                            addLog('ボス撃破！');
                        } else {
                            addLog('ボスを倒したが、救助対象は既に...');
                        }
                    }
                }
                return next;
            });

        } else if (targetEnemy.faction === 'player_ally') {
            addLog(`${targetEnemy.name}: 「うう……頼む、助けてくれ……」`);
        }
        
        // 攻撃したターンも敵は動く
        processEnemyTurn();
        return;
    }

    setPlayerPos({ x: newX, y: newY });
    
    if (newX === dungeon.stairs.x && newY === dungeon.stairs.y) {
        addLog('階段を降りた。');
        initFloor(floor + 1);
    }

    processEnemyTurn();
  };

  // --- 敵のターン処理 (NPCダメージ対応版) ---
  const processEnemyTurn = () => {
    if (!dungeon) return;

    setEnemies(prevEnemies => {
        // 状態をコピーして操作可能にする
        let nextEnemies = prevEnemies.map(e => ({ ...e }));
        const currentPlayerPos = playerPosRef.current;

        // モンスターのみ行動
        const monsters = prevEnemies.filter(e => e.faction === 'monster');
        
        monsters.forEach(monster => {
            // 既に倒されている場合はスキップ（念のため）
            if (monster.hp <= 0) return;

            // 自身(monster)の最新状態を取得 (nextEnemies内でのインデックス)
            const myIndex = nextEnemies.findIndex(e => e.uniqueId === monster.uniqueId);
            if (myIndex === -1) return;
            const myState = nextEnemies[myIndex];

            // ターゲット選定
            const targets = [
                { 
                    type: 'player', 
                    id: 'player', 
                    x: currentPlayerPos.x, 
                    y: currentPlayerPos.y, 
                    dist: getDistance(myState.x, myState.y, currentPlayerPos.x, currentPlayerPos.y) 
                },
                ...nextEnemies
                   .filter(e => e.faction === 'player_ally' && e.hp > 0)
                   .map(e => ({ 
                       type: 'npc',
                       id: e.uniqueId, 
                       x: e.x, 
                       y: e.y, 
                       dist: getDistance(myState.x, myState.y, e.x, e.y) 
                   }))
            ];
            
            targets.sort((a, b) => a.dist - b.dist);
            const target = targets[0];

            if (!target) return;

            // 攻撃
            if (target.dist <= 1.5) {
                if (target.type === 'player') {
                    const dmg = Math.max(1, monster.attack - 5);
                    setPlayerHp(prev => {
                        const next = prev - dmg;
                        if (next <= 0) {
                            setGameOver(true);
                            onPlayerDeath();
                        }
                        return next;
                    });
                    addLog(`${monster.name}の攻撃！ ${dmg}のダメージ！`);
                } else {
                    // NPCへの攻撃
                    const npcIndex = nextEnemies.findIndex(e => e.uniqueId === target.id);
                    if (npcIndex !== -1) {
                        const dmg = Math.max(1, monster.attack); // NPC防御0計算
                        nextEnemies[npcIndex].hp -= dmg;
                        addLog(`${monster.name}は負傷者を攻撃している！`);
                        
                        if (nextEnemies[npcIndex].hp <= 0) {
                            addLog('救助対象が力尽きてしまった...');
                            // ここでクエスト失敗処理などを呼ぶことも可能
                        }
                    }
                }
                return; // 攻撃したら移動しない
            }

            // 移動処理
            let newX = myState.x;
            let newY = myState.y;

            if (target.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
            else if (target.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
            else if (target.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
            else if (target.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;

            // 衝突判定 (自分以外の敵、プレイヤー)
            const isBlocked = nextEnemies.some(e => e.uniqueId !== monster.uniqueId && e.hp > 0 && e.x === newX && e.y === newY) ||
                              (currentPlayerPos.x === newX && currentPlayerPos.y === newY);

            if (!isBlocked) {
                nextEnemies[myIndex].x = newX;
                nextEnemies[myIndex].y = newY;
            }
        });

        // HPが0になったNPCを除外（死亡）
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
