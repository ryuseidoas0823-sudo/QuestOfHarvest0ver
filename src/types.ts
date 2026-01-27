export interface Position {
  x: number;
  y: number;
}

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Chest {
  id: string;
  position: Position;
  isOpened: boolean;
  type: 'wood' | 'silver' | 'gold'; // 宝箱の種類（レア度示唆）
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: number[][]; // 0:壁, 1:床, 2:通路
  rooms: Room[];
  startPos: Position;
  chests: Chest[]; // 追加: 宝箱リスト
}
