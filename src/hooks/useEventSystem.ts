import { useState, useCallback } from 'react';
import { GameEvent, GameEventChoice } from '../types/event';
import { randomEvents } from '../data/events';
import { audioManager } from '../utils/audioManager';

interface UseEventSystemProps {
  onLog: (msg: string) => void;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
  addItem: (itemId: string) => void;
  playerMaxHp: number;
}

export const useEventSystem = ({
  onLog,
  setPlayerHp,
  addItem,
  playerMaxHp
}: UseEventSystemProps) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // ランダムイベント発生チェック
  const checkRandomEvent = useCallback(() => {
    // 5%の確率でイベント発生
    if (Math.random() < 0.05) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      setCurrentEvent(event);
      return true; // イベント発生
    }
    return false;
  }, []);

  const handleEventChoice = useCallback((choice: GameEventChoice) => {
    // 成功判定 (successRateがあれば)
    const isSuccess = choice.successRate === undefined || Math.random() < choice.successRate;

    if (!isSuccess) {
        onLog('失敗した！');
        // 失敗時のペナルティ（簡易的にダメージ）
        const dmg = 10;
        setPlayerHp(prev => Math.max(0, prev - dmg));
        onLog(`${dmg}のダメージを受けた。`);
        setCurrentEvent(null);
        return;
    }

    switch (choice.effect) {
      case 'heal':
        if (choice.value) {
          setPlayerHp(prev => Math.min(playerMaxHp, prev + choice.value!));
          onLog(`HPが${choice.value}回復した。`);
          audioManager.playSeSelect();
        }
        break;
      case 'damage':
        if (choice.value) {
          setPlayerHp(prev => Math.max(0, prev - choice.value!));
          onLog(`${choice.value}のダメージを受けた！`);
          audioManager.playSeDamage();
        }
        break;
      case 'item':
        if (choice.itemId) {
          addItem(choice.itemId);
          onLog(`アイテムを入手した。`);
          audioManager.playSeSelect();
        }
        break;
      case 'leave':
        onLog('何もせず立ち去った。');
        break;
    }
    setCurrentEvent(null);
  }, [onLog, setPlayerHp, addItem, playerMaxHp]);

  return {
    currentEvent,
    checkRandomEvent,
    handleEventChoice
  };
};
