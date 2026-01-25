import { DungeonMap, TileType } from './types';
import { Enemy } from './types/enemy';
import { enemies as enemyData } from './data/enemies';

// 簡易ダンジョン生成
export const generateDungeon = (floor: number, chapter: number): { map: DungeonMap, startPos: {x: number, y: number}, enemies: Enemy[] } => {
  const width = 40;
  const height = 30;
  const map: DungeonMap = Array(height).fill(null).map(() => Array(width).fill('wall'));

  // 部屋生成など（簡易実装: 全て床にして壁で囲む）
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      map[y][x] = 'floor';
    }
  }

  // スタート地点
  const startPos = { x: 2, y: 2 };

  // 階段
  map[height - 3][width - 3] = 'stairs_down';

  // 敵配置
  const enemies: Enemy[] = [];
  const enemyCount = 5 + floor;
  for (let i = 0; i < enemyCount; i++) {
      const ex = Math.floor(Math.random() * (width - 4)) + 2;
      const ey = Math.floor(Math.random() * (height - 4)) + 2;
      
      // データのディープコピーを作成して個体化
      const template = enemyData[0]; // 仮: 最初の敵データを使用
      if (template) {
          enemies.push({
              ...template,
              id: `${template.id}_${i}`,
              x: ex,
              y: ey,
              stats: { ...template.stats }
          });
      }
  }

  return { map, startPos, enemies };
};
