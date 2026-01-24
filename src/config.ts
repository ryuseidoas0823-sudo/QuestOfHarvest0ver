// ゲーム全体で共有する設定値・定数

export const GRID_SIZE = 40;
export const MAP_WIDTH = 50;
export const MAP_HEIGHT = 50;

// タイル定義
export const TILE_FLOOR = 0;
export const TILE_WALL = 1;
export const TILE_LAVA = 2;        // ダメージ床
export const TILE_LOCKED_DOOR = 3; // 鍵付き扉
export const TILE_SECRET_WALL = 4; // 隠し壁
export const TILE_STAIRS = 5;      // 階段
export const TILE_BOSS_DOOR = 6;   // ボス部屋の封印扉
