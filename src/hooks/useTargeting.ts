import { useState, useCallback } from 'react';
import { Position, GameState } from '../types';
import { Skill } from '../types/skill';
import { SKILLS } from '../data/skills';

interface TargetingState {
  isActive: boolean;
  skillId: string | null;
  cursorPos: Position;
  validTargets: Position[]; // 射程内で選択可能な座標リスト
}

export const useTargeting = (gameState: GameState) => {
  const [targetingState, setTargetingState] = useState<TargetingState>({
    isActive: false,
    skillId: null,
    cursorPos: { x: 0, y: 0 },
    validTargets: []
  });

  // 射程内の有効なタイルを計算する
  const calculateValidTargets = useCallback((startPos: Position, range: number): Position[] => {
    const valid: Position[] = [];
    // マンハッタン距離あるいはチェビシェフ距離(斜め移動ありならこちら)
    // 今回はシンプルなグリッド距離(マンハッタン距離)で計算
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= range) {
          // マップ範囲内チェックなどはUI側または実行時に行うが、ここは座標のリストアップ
          valid.push({ x: startPos.x + dx, y: startPos.y + dy });
        }
      }
    }
    return valid;
  }, []);

  // ターゲットモード開始
  const startTargeting = useCallback((skillId: string) => {
    const skill = SKILLS[skillId];
    if (!skill) return;

    // 自分自身がターゲットの場合は即時発動させるため、ターゲットモードに入らない（UI側でハンドリングする）
    // ここでは「選択が必要なもの」だけを扱う
    if (skill.targetType === 'self' || skill.targetType === 'none') {
      return;
    }

    const playerPos = gameState.player.position;
    const range = skill.range || 0;

    // 初期カーソル位置: 
    // 敵がいれば一番近い敵、いなければプレイヤー位置
    let initialCursor = { ...playerPos };
    
    // 簡易オートターゲット: 射程内の最も近い敵を探す
    let minDist = 999;
    gameState.enemies.forEach(enemy => {
        const dist = Math.abs(enemy.position.x - playerPos.x) + Math.abs(enemy.position.y - playerPos.y);
        if (dist <= range && dist < minDist) {
            minDist = dist;
            initialCursor = { x: enemy.position.x, y: enemy.position.y };
        }
    });

    setTargetingState({
      isActive: true,
      skillId,
      cursorPos: initialCursor,
      validTargets: calculateValidTargets(playerPos, range)
    });
  }, [gameState.player.position, gameState.enemies, calculateValidTargets]);

  // カーソル移動
  const moveCursor = useCallback((dx: number, dy: number) => {
    if (!targetingState.isActive) return;

    setTargetingState(prev => {
        const skill = SKILLS[prev.skillId!];
        const range = skill?.range || 0;
        const playerPos = gameState.player.position;
        
        const newPos = { x: prev.cursorPos.x + dx, y: prev.cursorPos.y + dy };
        
        // 射程外へのカーソル移動を制限するかどうか
        // 制限したほうが使いやすい
        const dist = Math.abs(newPos.x - playerPos.x) + Math.abs(newPos.y - playerPos.y);
        if (dist > range) {
            return prev; // 移動キャンセル
        }

        return {
            ...prev,
            cursorPos: newPos
        };
    });
  }, [gameState.player.position, targetingState.isActive]);

  // キャンセル
  const cancelTargeting = useCallback(() => {
    setTargetingState({
      isActive: false,
      skillId: null,
      cursorPos: { x: 0, y: 0 },
      validTargets: []
    });
  }, []);

  return {
    targetingState,
    startTargeting,
    moveCursor,
    cancelTargeting
  };
};
