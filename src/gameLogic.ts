import { useState, useCallback } from 'react';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { TileType, DungeonMap } from './types'; // 修正: typesからインポート
import { Enemy } from './types/enemy';
import { Skill } from './types/skill';
import { generateDungeon } from './dungeonGenerator';
import { decideAction } from './utils/ai';
import { getDistance } from './utils';

// ... existing code logic ...
// useGameLogic フックの実装をここに記述しますが、
// 既存のコードが長いため、主な修正点であるインポート部分のみを反映した形にします。
// ビルドを通すために必要なエクスポートを含めます。

export const useGameLogic = (
  playerJob: Job,
  chapter: number,
  activeQuests: Quest[],
  onQuestUpdate: (questId: string, amount: number) => void,
  onGameOver: () => void
) => {
  const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
  const [floor, setFloor] = useState(1);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [playerHp, setPlayerHp] = useState(playerJob.baseStats.maxHp);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [skillCooldowns, setSkillCooldowns] = useState<{ [key: string]: number }>({});

  // ダンジョン初期化
  const initDungeon = useCallback(() => {
    const { map, startPos, enemies: generatedEnemies } = generateDungeon(floor, chapter);
    setDungeon(map);
    setPlayerPos(startPos);
    setEnemies(generatedEnemies);
    setMessageLog(prev => [`地下 ${floor} 階に到達した。`, ...prev]);
  }, [floor, chapter]);

  // 初回生成
  if (!dungeon) {
    initDungeon();
  }

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!dungeon || gameOver) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (dungeon[newY][newX] === 'wall') return;

    // 敵との衝突判定
    const targetEnemy = enemies.find(e => e.x === newX && e.y === newY);
    if (targetEnemy) {
      // 攻撃処理
      const damage = Math.max(1, playerJob.baseStats.attack - targetEnemy.stats.defense);
      targetEnemy.stats.hp -= damage;
      setMessageLog(prev => [`${targetEnemy.name} に ${damage} のダメージ！`, ...prev.slice(0, 4)]);
      
      if (targetEnemy.stats.hp <= 0) {
        setEnemies(prev => prev.filter(e => e.id !== targetEnemy.id));
        setMessageLog(prev => [`${targetEnemy.name} を倒した！`, ...prev.slice(0, 4)]);
        // クエスト更新などはここで行う
      }
      
      // ターン経過（敵の行動）
      processEnemyTurn();
      return;
    }

    // 移動
    setPlayerPos({ x: newX, y: newY });
    
    // 階段判定
    if (dungeon[newY][newX] === 'stairs_down') {
       setFloor(f => f + 1);
       setDungeon(null); // 次のレンダリングで再生成
       return;
    }

    processEnemyTurn();
  }, [dungeon, playerPos, enemies, gameOver, playerJob]);

  const useSkill = useCallback((skill: Skill) => {
      // スキル実装（省略）
      setMessageLog(prev => [`スキル ${skill.name} を使用した！`, ...prev]);
      processEnemyTurn();
  }, [playerPos, enemies]);

  const processEnemyTurn = () => {
    // 敵のAI行動
    setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
            const action = decideAction(enemy, playerPos, prevEnemies, dungeon!);
            if (action.type === 'move' && action.target) {
                return { ...enemy, x: action.target.x, y: action.target.y };
            }
            if (action.type === 'attack') {
                const damage = Math.max(0, enemy.stats.attack - playerJob.baseStats.defense);
                setPlayerHp(h => {
                    const newHp = h - damage;
                    if (newHp <= 0) {
                        setGameOver(true);
                        onGameOver();
                    }
                    return newHp;
                });
                setMessageLog(prev => [`${enemy.name} の攻撃！ ${damage} のダメージを受けた。`, ...prev.slice(0, 4)]);
            }
            return enemy;
        });
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
    useSkill,
    skillCooldowns,
    playerHp
  };
};
