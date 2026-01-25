import { DungeonMap, Tile } from './types';

// コンパイルエラー回避のためのスタブ
// 本来はここにダンジョン生成アルゴリズム（Strategy Pattern）が入る

export const generateDungeon = (floor: number): DungeonMap => {
  const width = 20;
  const height = 15;
  const map: Tile[][] = [];

  // シンプルな壁と床の生成
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const isWall = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      row.push({
        type: isWall ? 'wall' : 'floor',
        visible: true,
        x,
        y,
      });
    }
    map.push(row);
  }

  // 階段
  map[5][5].type = 'stairs_down';

  return {
    floor,
    width,
    height,
    map,
    rooms: [],
  };
};
