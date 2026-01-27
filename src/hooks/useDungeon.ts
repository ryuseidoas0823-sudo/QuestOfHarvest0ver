import { useState, useCallback } from 'react';
import { DungeonData, GameState, Enemy } from '../types/gameState';
import { Position } from '../types/input';
import { generateDungeon } from '../dungeonGenerator';
import { ENEMY_DEFINITIONS, EnemyDefinition } from '../data/enemies';

// 敵IDの生成用
const generateId = () => Math.random().toString(36).substr(2, 9);

// 階層ごとの出現敵テーブル (ボス以外)
const FLOOR_ENEMIES: Record<string, string[]> = {
  '1-4': ['slime', 'goblin', 'wolf'],
  '6-9': ['skeleton', 'zombie', 'ghost'],
  '11-14': ['poison_flower', 'lizardman', 'harpy'],
  '16-19': ['minotaur', 'dark_knight', 'arch_demon'],
  // Default
  'default': ['slime']
};

// 階層ごとのボス定義
const BOSS_ENEMIES: Record<number, string> = {
  5: 'baby_dragon',
  10: 'goliath',
  15: 'amphisbaena',
  20: 'asterios' // ラスボス想定
};

export const useDungeon = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: any) => void
) => {

  // 敵のスポーンロジック
  const spawnEnemies = useCallback((floor: number, rooms: any[], playerPos: Position): Enemy[] => {
    const enemies: Enemy[] = [];

    // --- ボスフロアの処理 ---
    if (BOSS_ENEMIES[floor]) {
      const bossId = BOSS_ENEMIES[floor];
      const bossDef = ENEMY_DEFINITIONS[bossId];
      
      if (bossDef) {
        // ボスは部屋（アリーナ）の中央に配置
        // generateBossArenaでは rooms[0] がアリーナ
        const arena = rooms[0];
        const bossPos = {
          x: Math.floor(arena.x + arena.w / 2),
          y: Math.floor(arena.y + arena.h / 2)
        };

        enemies.push({
          id: generateId(),
          ...bossDef,
          position: bossPos,
          statusEffects: []
        });
        
        // 取り巻き（Minions）を少し出す場合
        // const minionCount = 2;
        // ...
      }
      return enemies;
    }

    // --- 通常フロアの処理 ---
    
    // 現在の階層に適した敵リストを取得
    let availableEnemies = FLOOR_ENEMIES['default'];
    if (floor <= 4) availableEnemies = FLOOR_ENEMIES['1-4'];
    else if (floor <= 9) availableEnemies = FLOOR_ENEMIES['6-9'];
    else if (floor <= 14) availableEnemies = FLOOR_ENEMIES['11-14'];
    else availableEnemies = FLOOR_ENEMIES['16-19'];

    // 各部屋に敵を配置
    rooms.forEach((room, index) => {
      // 最初の部屋（プレイヤーがいる）は敵を少なくするか無しにする
      if (index === 0) return;

      // 部屋の大きさに応じて敵の数を決定 (1〜3体)
      const enemyCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < enemyCount; i++) {
        const enemyKey = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        const enemyDef = ENEMY_DEFINITIONS[enemyKey];

        if (enemyDef) {
          // 部屋内のランダムな位置
          const ex = Math.floor(Math.random() * (room.w - 2)) + room.x + 1;
          const ey = Math.floor(Math.random() * (room.h - 2)) + room.y + 1;

          enemies.push({
            id: generateId(),
            ...enemyDef,
            position: { x: ex, y: ey },
            statusEffects: []
          });
        }
      }
    });

    return enemies;
  }, []);

  // ダンジョン生成と初期化
  const initializeDungeon = useCallback((floor: number) => {
    // マップ生成
    const dungeonData = generateDungeon(floor);
    
    // 敵スポーン
    const enemies = spawnEnemies(floor, dungeonData.rooms, dungeonData.playerStart);

    // GameState更新
    setGameState(prev => ({
      ...prev,
      dungeon: {
        floor: floor,
        map: dungeonData.map,
        rooms: dungeonData.rooms,
        stairs: dungeonData.stairs
      },
      player: {
        ...prev.player,
        position: dungeonData.playerStart
      },
      enemies: enemies,
      messages: [
        ...prev.messages, 
        { text: `${floor}階層に到達した。`, type: 'info' },
        ...(BOSS_ENEMIES[floor] ? [{ text: '強力な気配を感じる...', type: 'danger' }] : [])
      ]
    }));
  }, [setGameState, spawnEnemies]);

  return {
    initializeDungeon
  };
};
