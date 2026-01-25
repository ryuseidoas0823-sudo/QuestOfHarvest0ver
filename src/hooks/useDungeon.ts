import { useState, useCallback } from 'react';
import { DungeonMap } from '../types';
import { EnemyInstance } from '../types/enemy';
import { generateDungeon } from '../dungeonGenerator';
import { getDistance } from '../utils';
import { visualManager } from '../utils/visualManager';

export const useDungeon = (chapter: number) => {
  const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
  const [floor, setFloor] = useState(1);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  
  // フロア移動時に生成される初期敵リストを保持するための一時的なState
  // （useTurnSystemに渡すため）
  const [initialEnemies, setInitialEnemies] = useState<EnemyInstance[]>([]);

  const updateVisibility = useCallback((map: DungeonMap, pos: { x: number; y: number }) => {
    const range = 5;
    const newVisited = [...map.visited];
    let changed = false;
    
    for (let y = pos.y - range; y <= pos.y + range; y++) {
      for (let x = pos.x - range; x <= pos.x + range; x++) {
        if (y >= 0 && y < map.height && x >= 0 && x < map.width) {
          if (getDistance(pos.x, pos.y, x, y) <= range) {
            if (!newVisited[y][x]) {
              newVisited[y][x] = true;
              changed = true;
            }
          }
        }
      }
    }
    
    if (changed) {
      setDungeon({ ...map, visited: newVisited });
    }
  }, []);

  const initFloor = useCallback((floorNum: number, activeQuests: any[], playerJob: any) => {
    visualManager.clear();
    const { map: newMap, startPos, enemies: generatedEnemies } = generateDungeon(floorNum);
    
    // 視界の初期化
    const range = 5;
    const px = startPos.x;
    const py = startPos.y;
    for (let y = py - range; y <= py + range; y++) {
        for (let x = px - range; x <= px + range; x++) {
            if (y >= 0 && y < newMap.height && x >= 0 && x < newMap.width) {
                if (getDistance(px, py, x, y) <= range) {
                    newMap.visited[y][x] = true;
                }
            }
        }
    }

    setDungeon(newMap);
    setPlayerPos(startPos);
    setFloor(floorNum);
    
    // 敵の生成ロジック（ボスやNPCなど、dungeonGenerator以外で追加するもの）
    // ※本来はdungeonGenerator内で完結させるべきだが、既存ロジックを維持してここで結合
    const finalEnemies: EnemyInstance[] = [...generatedEnemies];
    const isBossFloor = floorNum % 5 === 0;

    // TODO: ここで activeQuests や chapter を参照して特殊敵を追加するロジックを
    // gameLogicから移植するが、依存関係を減らすため、
    // 特殊な敵の追加は useTurnSystem 側で「フロア初期化直後」に行うか、
    // あるいはここで簡易的に行う。今回は簡易的に行う。
    
    // activeQuestsなどを引数で受け取る形に修正が必要だが、
    // リファクタリングの第一段階として、dungeonGeneratorが返したものを正とする。
    // ボス追加ロジックは gameLogic からこちらへ移動すべきだが、
    // 依存性（enemyDataなど）が多いので、一旦 gameLogic に残し、
    // ここでは「マップ生成と基本敵生成」に留める設計もアリだが、
    // initFloor が敵を返さないと同期が取れない。
    
    setInitialEnemies(generatedEnemies); 

    return { newMap, startPos, generatedEnemies };
  }, []);

  return {
    dungeon,
    setDungeon, // 視界更新以外で更新が必要な場合のため
    floor,
    playerPos,
    setPlayerPos,
    initFloor,
    updateVisibility
  };
};
