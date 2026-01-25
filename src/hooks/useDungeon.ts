import { useState, useCallback } from 'react';
import { PlayerState, DungeonMap, Direction, Tile } from '../types';
import { generateDungeon } from '../dungeonGenerator'; // 仮定：generatorが存在する
import { EnemyInstance } from '../types/enemy';

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

  // フロア生成
  const generateFloor = useCallback((floorNum: number) => {
    // dungeonGeneratorの実装に依存するが、ここでは擬似的に生成してセット
    const width = 20;
    const height = 15;
    const newMap: Tile[][] = Array(height).fill(null).map((_, y) => 
      Array(width).fill(null).map((_, x) => ({
        type: (x === 0 || x === width - 1 || y === 0 || y === height - 1) ? 'wall' : 'floor',
        visible: true, // デバッグ用に全可視化
        x,
        y
      }))
    );
    
    // 階段配置
    newMap[5][5].type = 'stairs_down';

    setDungeonState({
      dungeon: { floor: floorNum, width, height, map: newMap, rooms: [] },
      floor: floorNum,
      map: newMap,
      enemies: [] // 敵生成ロジックは別途必要
    });

    // プレイヤー初期位置
    updatePlayer({ x: 2, y: 2 });
  }, [updatePlayer]);

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

    // 移動確定
    updatePlayer({ x: nextX, y: nextY });
    return true;
  }, [playerState, dungeonState, updatePlayer]);

  // 目の前の敵を取得
  const getFrontEnemy = useCallback((): EnemyInstance | null => {
    // 簡易実装：常にnullを返す（敵ロジック未実装のため）
    return null;
  }, []);

  // エンティティ位置更新（敵など）
  const updateEntityPosition = useCallback((entityId: string, x: number, y: number) => {
    setDungeonState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => e.id === entityId ? { ...e, x, y } : e)
    }));
  }, []);

  return {
    dungeonState,
    generateFloor,
    movePlayer,
    getFrontEnemy,
    updateEntityPosition
  };
};
