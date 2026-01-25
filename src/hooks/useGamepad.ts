import { useState, useEffect, useCallback } from 'react';

// 入力状態を管理する型
export interface InputState {
  keys: { [key: string]: boolean };
}

export const useGamepad = () => {
  const [inputState, setInputState] = useState<InputState>({ keys: {} });

  // キーダウンイベント
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setInputState(prev => ({
      keys: { ...prev.keys, [e.key]: true }
    }));
  }, []);

  // キーアップイベント
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setInputState(prev => ({
      keys: { ...prev.keys, [e.key]: false }
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 特定のボタンが押されているか判定
  const isPressed = useCallback((button: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'A' | 'B' | 'START' | 'Y') => {
    const k = inputState.keys;
    switch (button) {
      case 'UP': return k['ArrowUp'] || k['w'];
      case 'DOWN': return k['ArrowDown'] || k['s'];
      case 'LEFT': return k['ArrowLeft'] || k['a'];
      case 'RIGHT': return k['ArrowRight'] || k['d'];
      case 'A': return k['Enter'] || k['z']; // 決定/攻撃
      case 'B': return k['Escape'] || k['x']; // キャンセル/戻る
      case 'Y': return k['i']; // インベントリ
      case 'START': return k['p']; // ポーズ
      default: return false;
    }
  }, [inputState]);

  return {
    inputState,
    isPressed
  };
};
