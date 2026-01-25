import { DungeonMap, TileType } from './types';
import { EnemyInstance } from './types/enemy';
import { enemies as enemyData } from './data/enemies';

// 簡易ダンジョン生成
export const generateDungeon = (floor: number): { map: DungeonMap, startPos: {x: number, y: number}, enemies: EnemyInstance[] } => {
  const width = 40;
  const height = 30;
  const tiles: TileType[][] = Array(height).fill(null).map(() => Array(width).fill('wall'));
  // visited プロパティを追加して DungeonMap 型と一致させる
  const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

  // 部屋生成など（簡易実装: 全て床にして壁で囲む）
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      tiles[y][x] = 'floor';
    }
  }

  // スタート地点
  const startPos = { x: 2, y: 2 };

  // 階段
  const stairsPos = { x: width - 3, y: height - 3 };
  tiles[stairsPos.y][stairsPos.x] = 'stairs_down';

  // 敵配置
  const enemies: EnemyInstance[] = [];
  const enemyCount = 5 + floor;
  for (let i = 0; i < enemyCount; i++) {
      const ex = Math.floor(Math.random() * (width - 4)) + 2;
      const ey = Math.floor(Math.random() * (height - 4)) + 2;
      
      const template = enemyData[0]; // 仮: 最初の敵データを使用
      if (template) {
          enemies.push({
              ...template,
              uniqueId: `${template.id}_${i}`,
              x: ex,
              y: ey,
              hp: template.maxHp, // EnemyInstance用に追加
              stats: { // Stats型に合わせて補完
                  maxHp: template.maxHp,
                  hp: template.maxHp,
                  mp: 0,
                  maxMp: 0,
                  attack: template.attack,
                  defense: template.defense,
                  str: 0, vit: 0, dex: 0, agi: 0, int: 0, luc: 0,
                  level: 1,
                  exp: template.exp
              }
          } as EnemyInstance);
      }
  }

  // DungeonMap型に適合するオブジェクトを返す
  return { 
      map: {
          width,
          height,
          tiles,
          rooms: [{x: 1, y: 1, w: width-2, h: height-2}], // 簡易ルーム定義
          playerStart: startPos,
          stairs: stairsPos,
          visited
      }, 
      startPos, 
      enemies 
  };
};
