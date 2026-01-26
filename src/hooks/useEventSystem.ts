import { useState, useCallback } from 'react';
import { GameEvent } from '../types/event';

interface EventState {
  currentEvent: GameEvent | null;
  currentText: string;
  currentSpeaker: string;
  isEventActive: boolean;
  logs: string[];
  modalContent: React.ReactNode | null;
}

export const useEventSystem = () => {
  const [eventState, setEventState] = useState<EventState>({
    currentEvent: null,
    currentText: '',
    currentSpeaker: '',
    isEventActive: false,
    logs: [],
    modalContent: null
  });

  // ログ追加
  const addLog = useCallback((message: string) => {
    setEventState(prev => ({
      ...prev,
      logs: [...prev.logs, message].slice(-20) // 最新20件保持
    }));
  }, []);

  // 会話/イベント開始
  const startEvent = useCallback((text: string, speaker: string = '') => {
    setEventState(prev => ({
      ...prev,
      isEventActive: true,
      currentText: text,
      currentSpeaker: speaker
    }));
  }, []);

  // 次の会話へ（簡易実装：閉じさせる）
  const nextDialogue = useCallback(() => {
    setEventState(prev => ({
      ...prev,
      isEventActive: false,
      currentText: '',
      currentSpeaker: ''
    }));
  }, []);

  // モーダル表示
  const showModal = useCallback((content: React.ReactNode) => {
    setEventState(prev => ({
      ...prev,
      modalContent: content
    }));
  }, []);

  const closeModal = useCallback(() => {
    setEventState(prev => ({
      ...prev,
      modalContent: null
    }));
  }, []);

  return {
    eventState,
    addLog,
    startEvent,
    nextDialogue,
    showModal,
    closeModal
  };
};
