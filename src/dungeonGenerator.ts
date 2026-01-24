// ... existing code ...
import { DungeonMap, TileType } from './types';

// ... existing code ...

/**
 * ダンジョン生成ロジック
 * strategy pattern で拡張可能にしている想定
 */
export const generateDungeon = (floor: number): DungeonMap => {
  const width = 40;
  const height = 40;
  const tiles: TileType[][] = Array(height).fill(null).map(() => Array(width).fill('wall'));
  const rooms: { x: number; y: number; w: number; h: number }[] = [];

  // 簡易的な実装（実際にはStrategy Patternで分岐）
  // 5階ごとにボス階層とする
  const isBossFloor = floor % 5 === 0;

  if (isBossFloor) {
    // --- Type F: ボス階層 ---
    // 中央に大部屋を作成
    const roomW = 20;
    const roomH = 20;
    const roomX = Math.floor((width - roomW) / 2);
    const roomY = Math.floor((height - roomH) / 2);

    // 部屋を掘る
    for (let y = roomY; y < roomY + roomH; y++) {
      for (let x = roomX; x < roomX + roomW; x++) {
        tiles[y][x] = 'floor';
      }
    }
    rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });

    // プレイヤーの初期位置（部屋の下側）
    const playerStart = { x: Math.floor(width / 2), y: roomY + roomH - 2 };
    
    // 階段の位置（部屋の上側、ボス撃破後に開放イメージだが今回は固定配置）
    const stairs = { x: Math.floor(width / 2), y: roomY + 1 };
    tiles[stairs.y][stairs.x] = 'stairs';

    return {
      tiles,
      rooms,
      playerStart,
      stairs,
      width,
      height
    };

  } else {
    // --- Type A: スタンダード（簡易版） ---
    // 既存のロジックを使用
    // ランダムに部屋を配置
    const minRooms = 3;
    const maxRooms = 6;
    const roomCount = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;

    for (let i = 0; i < roomCount; i++) {
      const w = Math.floor(Math.random() * 6) + 4;
      const h = Math.floor(Math.random() * 6) + 4;
      const x = Math.floor(Math.random() * (width - w - 2)) + 1;
      const y = Math.floor(Math.random() * (height - h - 2)) + 1;

      // 重なりチェック省略（簡易）
      rooms.push({ x, y, w, h });

      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          tiles[ry][rx] = 'floor';
        }
      }

      // 前の部屋と通路で繋ぐ
      if (i > 0) {
        const prev = rooms[i - 1];
        const cx1 = Math.floor(prev.x + prev.w / 2);
        const cy1 = Math.floor(prev.y + prev.h / 2);
        const cx2 = Math.floor(x + w / 2);
        const cy2 = Math.floor(y + h / 2);

        // 横移動
        const startX = Math.min(cx1, cx2);
        const endX = Math.max(cx1, cx2);
        for (let tx = startX; tx <= endX; tx++) tiles[cy1][tx] = 'floor';

        // 縦移動
        const startY = Math.min(cy1, cy2);
        const endY = Math.max(cy1, cy2);
        for (let ty = startY; ty <= endY; ty++) tiles[ty][cx2] = 'floor';
      }
    }

    const playerStart = {
      x: Math.floor(rooms[0].x + rooms[0].w / 2),
      y: Math.floor(rooms[0].y + rooms[0].h / 2)
    };
    
    const lastRoom = rooms[rooms.length - 1];
    const stairs = {
        x: Math.floor(lastRoom.x + lastRoom.w / 2),
        y: Math.floor(lastRoom.y + lastRoom.h / 2)
    };
    tiles[stairs.y][stairs.x] = 'stairs';

    return { tiles, rooms, playerStart, stairs, width, height };
  }
};
