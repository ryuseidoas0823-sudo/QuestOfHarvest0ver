import { useState, useCallback } from 'react';
import { PlayerState, DungeonMap, Direction, Tile } from '../types';
import { generateDungeon } from '../dungeonGenerator'; 
import { EnemyInstance } from '../types/enemy';
import { enemies as enemyData } from '../data/enemies';
import { items as itemData } from '../data/items';

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

  const spawnEnemies = (spawnPoints: {x: number, y: number}[], floor: number): EnemyInstance[] => {
    const enemies: EnemyInstance[] = [];
    const availableEnemies = Object.values(enemyData);
    
    spawnPoints.forEach((point, index) => {
      if (Math.random() < 0.5 && availableEnemies.length > 0) {
        const template = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        enemies.push({
          id: `enemy-${floor}-${index}`,
          defId: template.id,
          name: template.name,
          type: template.type,
          dropItems: template.dropItems,
          exp: template.exp,
          attack: template.attack,
          defense: template.defense,
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

  const generateFloor = useCallback((floorNum: number) => {
    const newDungeon = generateDungeon(floorNum);
    const newEnemies = spawnEnemies(newDungeon.spawnPoints || [], floorNum);

    setDungeonState({
      dungeon: newDungeon,
      floor: floorNum,
      map: newDungeon.map,
      enemies: newEnemies
    });

    if (newDungeon.startPosition) {
      updatePlayer({ x: newDungeon.startPosition.x, y: newDungeon.startPosition.y });
    } else {
      updatePlayer({ x: 2, y: 2 });
    }
  }, [updatePlayer]);

  const getFrontEnemy = useCallback((): EnemyInstance | null => {
    if (!dungeonState.enemies) return null;
    const { x, y } = playerState;
    return dungeonState.enemies.find(e => 
      (Math.abs(e.x - x) === 1 && e.y === y) || 
      (Math.abs(e.y - y) === 1 && e.x === x)
    ) || null;
  }, [dungeonState.enemies, playerState]);

  // 目の前のタイル情報を取得（宝箱など）
  const getFrontTile = useCallback((): Tile | null => {
      const { x, y } = playerState;
      // プレイヤーの向きを保存していないので、一旦「移動先」ではなく「現在地」を見るか、
      // 簡易的に「攻撃ボタン」＝「アクションボタン」として、周囲のインタラクト可能なものを探す
      // ここでは、隣接する宝箱を優先して探すロジックにする
      
      const neighbors = [
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
      ];

      for (const {dx, dy} of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (dungeonState.map[ny] && dungeonState.map[ny][nx]) {
              const tile = dungeonState.map[ny][nx];
              if (tile.type === 'chest' && !tile.meta?.opened) {
                  return tile;
              }
          }
      }
      return null;
  }, [dungeonState.map, playerState]);

  // 宝箱を開ける
  const openChest = useCallback((x: number, y: number): string | null => {
      let resultMessage = null;
      setDungeonState(prev => {
          const newMap = [...prev.map];
          const tile = { ...newMap[y][x], meta: { ...newMap[y][x].meta, opened: true } };
          newMap[y] = [...newMap[y]];
          newMap[y][x] = tile as Tile;
          
          const itemId = tile.meta?.itemId;
          if (itemId) {
              const item = itemData[itemId];
              resultMessage = item ? `${item.name}を手に入れた！` : '何も入っていなかった...';
          }

          return { ...prev, map: newMap };
      });
      return resultMessage;
  }, []);

  const movePlayer = useCallback((direction: Direction): boolean => {
    const { x, y } = playerState;
    let nextX = x;
    let nextY = y;

    if (direction === 'up') nextY--;
    if (direction === 'down') nextY++;
    if (direction === 'left') nextX--;
    if (direction === 'right') nextX++;

    const map = dungeonState.map;
    if (!map || nextY < 0 || nextY >= map.length || nextX < 0 || nextX >= map[0].length) {
      return false;
    }

    const targetTile = map[nextY][nextX];
    if (targetTile.type === 'wall') {
      return false;
    }
    // 宝箱は踏めるようにするか、障害物にするか。
    // 今回は「障害物」として、アクションボタンで開ける方式にする
    if (targetTile.type === 'chest') {
        return false; 
    }

    const enemyAtTarget = dungeonState.enemies.find(e => e.x === nextX && e.y === nextY);
    if (enemyAtTarget) {
      return false;
    }

    updatePlayer({ x: nextX, y: nextY });
    return true;
  }, [playerState, dungeonState, updatePlayer]);

  const updateEntityPosition = useCallback((entityId: string, x: number, y: number) => {
    setDungeonState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => e.id === entityId ? { ...e, x, y } : e)
    }));
  }, []);

  const damageEnemy = useCallback((enemyId: string, damage: number) => {
    setDungeonState(prev => {
      const updatedEnemies = prev.enemies.map(e => {
        if (e.id === enemyId) {
          return { ...e, hp: Math.max(0, e.hp - damage), status: 'damage' as const };
        }
        return e;
      }).filter(e => e.hp > 0); 

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
    getFrontTile, // 追加
    openChest,    // 追加
    updateEntityPosition,
    damageEnemy
  };
};
