import { useState, useCallback } from 'react';
import { PlayerState, DungeonMap, Direction, Tile } from '../types';
import { generateDungeon } from '../dungeonGenerator'; 
import { EnemyInstance, EnemyDef } from '../types/enemy';
import { enemies as enemyData } from '../data/enemies';

interface DungeonState {
  dungeon: DungeonMap | null;
  floor: number;
  map: Tile[][];
  enemies: EnemyInstance[];
}

export const useDungeon = (
  playerState: PlayerState, 
  updatePlayer: (updates: Partial<PlayerState>) => void
) => {
  const [dungeonState, setDungeonState] = useState<DungeonState>({
    dungeon: null,
    floor: 0,
    map: [],
    enemies: []
  });

  // 敵の生成ヘルパー
  const spawnEnemies = (spawnPoints: {x: number, y: number}[], floor: number): EnemyInstance[] => {
    const enemies: EnemyInstance[] = [];
    // 階層に応じた敵を選出（簡易ロジック：全敵データからランダム）
    // 本来はfloorLevelに基づいてフィルタリングする
    const availableEnemies = Object.values(enemyData);
    
    // スポーン地点の数だけ、確率で敵を配置 (例: 50%)
    spawnPoints.forEach((point, index) => {
      if (Math.random() < 0.5 && availableEnemies.length > 0) {
        const template = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        enemies.push({
          id: `enemy-${floor}-${index}`,
          defId: template.id,
          name: template.name,
          x: point.x,
          y: point.y,
          hp: template.maxHp,
          maxHp: template.maxHp,
          status: 'idle'
        });
      }
    });
    return enemies;
  };

  // フロア生成
  const generateFloor = useCallback((floorNum: number) => {
    const newDungeon = generateDungeon(floorNum);
    
    // 敵の生成
    const newEnemies = spawnEnemies(newDungeon.spawnPoints || [], floorNum);

    setDungeonState({
      dungeon: newDungeon,
      floor: floorNum,
      map: newDungeon.map,
      enemies: newEnemies
    });

    // プレイヤー初期位置
    if (newDungeon.startPosition) {
      updatePlayer({ x: newDungeon.startPosition.x, y: newDungeon.startPosition.y });
    } else {
      updatePlayer({ x: 2, y: 2 });
    }
  }, [updatePlayer]);

  // 目の前の敵を取得
  const getFrontEnemy = useCallback((): EnemyInstance | null => {
    if (!dungeonState.enemies) return null;
    
    // プレイヤーの向きはPlayerStateに含まれていないため、
    // 簡易的に「周囲1マス」あるいは「移動しようとした先」で判定する必要があるが、
    // ここでは戦闘ロジック側で「攻撃対象」を渡す形にするか、
    // movePlayerで「衝突した敵」を返す設計にするのが良い。
    
    // 今回は「接触している敵」を返す（上下左右）
    const { x, y } = playerState;
    return dungeonState.enemies.find(e => 
      (Math.abs(e.x - x) === 1 && e.y === y) || 
      (Math.abs(e.y - y) === 1 && e.x === x)
    ) || null;
  }, [dungeonState.enemies, playerState]);

  // プレイヤー移動処理
  const movePlayer = useCallback((direction: Direction): boolean => {
    const { x, y } = playerState;
    let nextX = x;
    let nextY = y;

    if (direction === 'up') nextY--;
    if (direction === 'down') nextY++;
    if (direction === 'left') nextX--;
    if (direction === 'right') nextX++;

    // 壁判定
    const map = dungeonState.map;
    if (!map || nextY < 0 || nextY >= map.length || nextX < 0 || nextX >= map[0].length) {
      return false;
    }

    const targetTile = map[nextY][nextX];
    if (targetTile.type === 'wall') {
      return false;
    }

    // 敵との衝突判定
    const enemyAtTarget = dungeonState.enemies.find(e => e.x === nextX && e.y === nextY);
    if (enemyAtTarget) {
      // 敵がいる場合は移動せず、衝突（攻撃の予兆など）として扱う
      // ここではfalseを返すが、上位コンポーネントで「攻撃」アクションにつなげる
      return false;
    }

    // 移動確定
    updatePlayer({ x: nextX, y: nextY });
    return true;
  }, [playerState, dungeonState, updatePlayer]);

  // エンティティ位置更新（敵など）
  const updateEntityPosition = useCallback((entityId: string, x: number, y: number) => {
    setDungeonState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => e.id === entityId ? { ...e, x, y } : e)
    }));
  }, []);

  // 敵のダメージ反映・死亡処理
  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    setDungeonState(prev => {
      const updatedEnemies = prev.enemies.map(e => {
        if (e.id === enemyId) {
          return { ...e, hp: Math.max(0, e.hp - damage), status: 'damage' as const };
        }
        return e;
      }).filter(e => e.hp > 0); // HP0以下は削除（死亡）

      return {
        ...prev,
        enemies: updatedEnemies
      };
    });
  }, []);

  return {
    dungeonState,
    generateFloor,
    movePlayer,
    getFrontEnemy,
    updateEntityPosition,
    damageEnemy
  };
};
