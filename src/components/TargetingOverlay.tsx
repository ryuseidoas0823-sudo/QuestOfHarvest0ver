import React from 'react';
import { Position, GameState } from '../types';
import { SKILLS } from '../data/skills';

interface TargetingOverlayProps {
  gameState: GameState;
  targetingState: {
    isActive: boolean;
    skillId: string | null;
    cursorPos: Position;
    validTargets: Position[];
  };
}

const TILE_SIZE = 32; // Rendererと合わせる必要があります

const TargetingOverlay: React.FC<TargetingOverlayProps> = ({ gameState, targetingState }) => {
  if (!targetingState.isActive || !targetingState.skillId) return null;

  const { player } = gameState;
  const { cursorPos, validTargets } = targetingState;
  const skill = SKILLS[targetingState.skillId];

  // キャンバスの中央（プレイヤー位置）を基準に座標計算
  // 画面サイズ 800x600, 中心 (400, 300)
  const SCREEN_WIDTH = 800;
  const SCREEN_HEIGHT = 600;
  const CENTER_X = SCREEN_WIDTH / 2 - TILE_SIZE / 2;
  const CENTER_Y = SCREEN_HEIGHT / 2 - TILE_SIZE / 2;

  // ワールド座標(wx, wy)を画面座標(sx, sy)に変換
  const toScreen = (wx: number, wy: number) => {
    const relX = wx - player.position.x;
    const relY = wy - player.position.y;
    return {
      left: CENTER_X + relX * TILE_SIZE,
      top: CENTER_Y + relY * TILE_SIZE
    };
  };

  // 効果範囲(AOE)の計算
  const getAreaTiles = () => {
    const tiles: Position[] = [];
    if (!skill.areaRadius) return [cursorPos]; // 単体ならカーソル位置のみ

    // 範囲の形（ここでは菱形範囲とする）
    for (let dy = -skill.areaRadius; dy <= skill.areaRadius; dy++) {
      for (let dx = -skill.areaRadius; dx <= skill.areaRadius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= skill.areaRadius) {
          tiles.push({ x: cursorPos.x + dx, y: cursorPos.y + dy });
        }
      }
    }
    return tiles;
  };

  const aoeTiles = getAreaTiles();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
      
      {/* 1. 射程範囲の表示 (Valid Targets) */}
      {validTargets.map((pos, idx) => {
        const { left, top } = toScreen(pos.x, pos.y);
        // 画面外なら描画しない簡易カリング
        if (left < -TILE_SIZE || left > SCREEN_WIDTH || top < -TILE_SIZE || top > SCREEN_HEIGHT) return null;
        
        return (
          <div
            key={`range-${idx}`}
            className="absolute border border-blue-500/30 bg-blue-500/10"
            style={{
              left,
              top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        );
      })}

      {/* 2. 効果範囲の表示 (AOE) */}
      {aoeTiles.map((pos, idx) => {
        const { left, top } = toScreen(pos.x, pos.y);
        return (
          <div
            key={`aoe-${idx}`}
            className="absolute bg-red-500/30 border border-red-500/50 animate-pulse"
            style={{
              left,
              top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        );
      })}

      {/* 3. ターゲットカーソル */}
      {(() => {
        const { left, top } = toScreen(cursorPos.x, cursorPos.y);
        return (
          <div
            className="absolute border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] z-10"
            style={{
              left: left - 2, // ボーダー分少し外側に
              top: top - 2,
              width: TILE_SIZE + 4,
              height: TILE_SIZE + 4,
            }}
          >
            {/* 四隅のデザインなどあればここに追加 */}
          </div>
        );
      })()}

      {/* スキル名などの情報表示 */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded border border-blue-500">
        <div className="text-sm text-blue-300 font-bold">TARGETING MODE</div>
        <div className="text-lg font-bold flex items-center gap-2 justify-center">
            <span>{skill.icon}</span>
            <span>{skill.name}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
            矢印キー: 移動 / Enter(A): 決定 / Esc(B): キャンセル
        </div>
      </div>

    </div>
  );
};

export default TargetingOverlay;
