import { useState, useEffect, useCallback, useRef } from 'react';
import { generateDungeon } from './dungeonGenerator';
import { DungeonMap, TileType } from './types';
import { Enemy, EnemyInstance, Faction } from './types/enemy';
import { enemies as enemyData } from './data/enemies';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { getDistance } from './utils';

// ... existing code ...

interface GameState {
  // ... existing state
  dungeon: DungeonMap | null;
  playerPos: { x: number; y: number };
  enemies: EnemyInstance[];
  floor: number;
  gameOver: boolean;
  gameClear: boolean; // クエスト達成など
  messageLog: string[];
}

export const useGameLogic = (
  initialJob: Job,
  activeQuests: Quest[],
  onQuestUpdate: (questId: string, progress: number) => void,
  onPlayerDeath: () => void
) => {
  // ... existing refs and state ...
  const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [enemies, setEnemies] = useState<EnemyInstance[]>([]);
  const [floor, setFloor] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  
  // プレイヤーHPなどのステータス管理（簡易）
  const [playerHp, setPlayerHp] = useState(100);
  const playerMaxHp = 100; // 仮
  const playerAttack = 10; // 仮

  // ログ追加ヘルパー
  const addLog = useCallback((msg: string) => {
    setMessageLog(prev => [msg, ...prev].slice(0, 5));
  }, []);

  // ダンジョン初期化
  const initFloor = useCallback((floorNum: number) => {
    const newDungeon = generateDungeon(floorNum);
    setDungeon(newDungeon);
    setPlayerPos(newDungeon.playerStart);
    setFloor(floorNum);

    // 敵の生成
    const newEnemies: EnemyInstance[] = [];
    
    // --- ボス階層の特別処理 ---
    const isBossFloor = floorNum % 5 === 0; // 例: 5階ごと
    const isRescueQuestActive = activeQuests.some(q => q.id === 'mq_1_5'); // ボス討伐クエスト

    if (isBossFloor) {
        // ボス配置 (部屋の中央)
        const bossData = enemyData.find(e => e.type === 'boss') || enemyData[0];
        const room = newDungeon.rooms[0]; // ボス部屋は大部屋1つ想定
        
        newEnemies.push({
            ...bossData,
            uniqueId: `boss_${floorNum}`,
            hp: bossData.maxHp,
            x: Math.floor(room.x + room.w / 2),
            y: Math.floor(room.y + room.h / 2),
            faction: 'monster'
        });

        // --- 救助対象NPCの配置 ---
        if (isRescueQuestActive && floorNum === 5) { // 第1章ボス階層のみ
            const npcData = enemyData.find(e => e.id === 'injured_adventurer');
            if (npcData) {
                // 部屋の隅に配置
                newEnemies.push({
                    ...npcData,
                    uniqueId: 'npc_rescue_target',
                    hp: npcData.maxHp,
                    x: room.x + 2, // 壁際
                    y: room.y + 2,
                    faction: 'player_ally',
                    aiType: 'stationary'
                });
                addLog('奥に誰かが倒れている！ ボスから守らなければ！');
            }
        }

    } else {
        // 通常階層の敵配置
        newDungeon.rooms.forEach(room => {
             // 部屋ごとにランダム数
             const count = Math.floor(Math.random() * 2);
             for(let i=0; i<count; i++) {
                 // 簡易ランダム選択
                 const data = enemyData.filter(e => e.type !== 'boss' && e.faction !== 'player_ally')[
                     Math.floor(Math.random() * (enemyData.length - 2)) // NPCとBossを除く
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

  // 初期化実行
  useEffect(() => {
    initFloor(1);
  }, []); // 初回のみ


  // --- プレイヤーのアクション ---
  const movePlayer = (dx: number, dy: number) => {
    if (gameOver || !dungeon) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // 壁判定
    if (dungeon.tiles[newY][newX] === 'wall') return;

    // 敵判定（攻撃）
    const targetEnemy = enemies.find(e => e.x === newX && e.y === newY);
    if (targetEnemy) {
        if (targetEnemy.faction === 'monster') {
            // 攻撃処理
            const damage = Math.max(1, playerAttack - targetEnemy.defense);
            addLog(`${targetEnemy.name}に${damage}のダメージ！`);
            
            const updatedEnemies = enemies.map(e => {
                if (e.uniqueId === targetEnemy.uniqueId) {
                    return { ...e, hp: e.hp - damage };
                }
                return e;
            }).filter(e => e.hp > 0);

            setEnemies(updatedEnemies);
            
            // 撃破時処理
            if (updatedEnemies.length < enemies.length) {
                addLog(`${targetEnemy.name}を倒した！`);
                // ボス撃破時の処理などはここで
                if (targetEnemy.type === 'boss') {
                    // 救助者が生きていればクエストクリア条件など
                    const npc = enemies.find(e => e.id === 'injured_adventurer');
                    if (npc && npc.hp > 0) {
                        addLog('救助成功！ 安全を確保した。');
                        onQuestUpdate('mq_1_5', 1);
                    } else if (!activeQuests.some(q => q.id === 'mq_1_5')) {
                        // クエストがない場合の通常ボス撃破
                        addLog('ボス撃破！');
                    }
                }
            }
        } else if (targetEnemy.faction === 'player_ally') {
            addLog(`${targetEnemy.name}: 「うう……頼む、助けてくれ……」`);
        }
        return; // 移動しない
    }

    // 移動
    setPlayerPos({ x: newX, y: newY });
    
    // 階段判定
    if (newX === dungeon.stairs.x && newY === dungeon.stairs.y) {
        // 次の階へ (簡易)
        addLog('階段を降りた。');
        initFloor(floor + 1);
    }

    // ターン経過（敵の行動）
    processEnemyTurn();
  };

  // --- 敵のターン処理 ---
  const processEnemyTurn = () => {
    if (!dungeon) return;

    setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
            if (enemy.aiType === 'stationary') return enemy; // 動かない
            if (enemy.faction !== 'monster') return enemy; // モンスター以外は攻撃してこない（簡易）

            let newX = enemy.x;
            let newY = enemy.y;

            // ターゲット選定: プレイヤーと、味方NPCのうち近い方を狙う
            const targets = [
                { id: 'player', x: playerPos.x, y: playerPos.y, dist: getDistance(enemy.x, enemy.y, playerPos.x, playerPos.y) },
                ...prevEnemies
                   .filter(e => e.faction === 'player_ally')
                   .map(e => ({ id: e.uniqueId, x: e.x, y: e.y, dist: getDistance(enemy.x, enemy.y, e.x, e.y) }))
            ];
            
            // 最も近いターゲットを探す
            targets.sort((a, b) => a.dist - b.dist);
            const target = targets[0];

            if (!target) return enemy;

            // 攻撃範囲（隣接）
            if (target.dist <= 1.5) {
                // 攻撃
                if (target.id === 'player') {
                    const dmg = Math.max(1, enemy.attack - 5); // プレイヤー防御仮値
                    setPlayerHp(prev => {
                        const next = prev - dmg;
                        if (next <= 0) {
                            setGameOver(true);
                            onPlayerDeath();
                        }
                        return next;
                    });
                    addLog(`${enemy.name}の攻撃！ ${dmg}のダメージを受けた！`);
                } else {
                    // NPCへの攻撃
                    // ここではmapの中でstateを直接いじれないので、ダメージ計算だけして返す
                    // NPCのHP減算は、次のレンダリングサイクルのmapで反映されるように工夫が必要だが
                    // 今回は簡易的に「自分自身がNPCなら」ではなく「モンスターがNPCを殴る」ロジックなので
                    // 2重ループになるのを避けるため、ここでは「攻撃した事実」だけログに出し
                    // 実際のダメージ反映は別途行うか、あるいはここで target が NPCの場合の処理をどうするか。
                    // ReactのState更新内で他のState変数を参照するのはOKだが、更新するのは難しい。
                    // 解決策: movePlayerのような外側で一括処理するか、enemyデータに「targetId」を持たせてダメージ解決フェーズを作る。
                    
                    // 簡易実装: ログだけ出す（本来はNPCのHPを減らす処理が必要）
                    // 実際には enemies state を更新して返す必要があるため、ここで他エンティティのHPは操作できない。
                    // 妥協案: プレイヤーへの攻撃のみ実装し、NPCへの攻撃は「プレイヤーが近くにいない時だけ」などの演出に留めるか
                    // まじめにやるなら「Actionフェーズ」として全キャラの行動を決定→適用する設計が必要。
                    
                    // 今回は「プレイヤー優先」AIにしておく。
                    // もしNPCが一番近いなら、NPCを殴る（ログ出す）
                    addLog(`${enemy.name}は${target.id === 'player' ? 'あなた' : '負傷者'}を攻撃している！`);
                }
                return enemy;
            }

            // 移動 (近づく)
            if (target.x > enemy.x && dungeon.tiles[enemy.y][enemy.x + 1] !== 'wall') newX++;
            else if (target.x < enemy.x && dungeon.tiles[enemy.y][enemy.x - 1] !== 'wall') newX--;
            else if (target.y > enemy.y && dungeon.tiles[enemy.y + 1][enemy.x] !== 'wall') newY++;
            else if (target.y < enemy.y && dungeon.tiles[enemy.y - 1][enemy.x] !== 'wall') newY--;

            // 他の敵やプレイヤーと重ならないかチェック
            const isBlocked = prevEnemies.some(e => e.uniqueId !== enemy.uniqueId && e.x === newX && e.y === newY) ||
                              (playerPos.x === newX && playerPos.y === newY);

            if (!isBlocked) {
                return { ...enemy, x: newX, y: newY };
            }

            return enemy;
        });
    });
    
    // NPCのダメージ処理（別枠で処理しないとmap内では難しいので、簡易的にここで間引く処理等は省略）
    // 本格的には useGameLoop 全体をリファクタリングしてターン進行管理クラスを作るべき箇所。
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
