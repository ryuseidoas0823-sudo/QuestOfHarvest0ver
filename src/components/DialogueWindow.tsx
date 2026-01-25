import React, { useState, useEffect } from 'react';
import { DialogueTree, DialogueChoice } from '../types/dialogue';
import { SPEAKERS } from '../data/dialogues';

// Props定義を拡張: Tree形式とSimple形式の両方に対応
export interface DialogueWindowProps {
  // Tree形式の場合
  dialogueTree?: DialogueTree;
  
  // Simple形式の場合 (TownScreenからの呼び出し用)
  text?: string;
  speakerName?: string;
  
  // 共通
  onFinish?: () => void; // 終了時
  onNext?: () => void;   // Simple形式での「次へ」
  onAction?: (action: string) => void;
}

export const DialogueWindow: React.FC<DialogueWindowProps> = ({ 
  dialogueTree, 
  text, 
  speakerName, 
  onFinish, 
  onNext, 
  onAction 
}) => {
  // Treeモードかどうか
  const isTreeMode = !!dialogueTree;
  
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(
    dialogueTree ? dialogueTree.rootNodeId : null
  );

  // 終了判定 (Treeモード時)
  useEffect(() => {
    if (isTreeMode && !currentNodeId && onFinish) {
      onFinish();
    }
  }, [currentNodeId, onFinish, isTreeMode]);

  // 表示内容の決定
  let displayText = '';
  let displaySpeakerName = '';
  let displaySpeakerTitle = '';
  let displaySpeakerColor = 'text-white';
  let choices: DialogueChoice[] = [];

  if (isTreeMode && dialogueTree && currentNodeId) {
    const node = dialogueTree.nodes[currentNodeId];
    if (node) {
      displayText = node.text;
      choices = node.choices || [];
      const speakerData = SPEAKERS[node.speakerId];
      if (speakerData) {
        displaySpeakerName = speakerData.name;
        displaySpeakerTitle = speakerData.title || '';
        displaySpeakerColor = speakerData.color || 'text-white';
      }
    }
  } else if (!isTreeMode && text) {
    // Simpleモード
    displayText = text;
    displaySpeakerName = speakerName || '？？？';
  } else {
    return null; // 表示するものがない
  }

  const handleNext = () => {
    if (isTreeMode && dialogueTree && currentNodeId) {
      const node = dialogueTree.nodes[currentNodeId];
      if (node) {
         if (node.nextId) {
            setCurrentNodeId(node.nextId);
         } else if (!node.choices || node.choices.length === 0) {
            if (onFinish) onFinish();
         }
      }
    } else {
      // Simpleモード
      if (onNext) onNext();
      else if (onFinish) onFinish();
    }
  };

  const handleChoice = (choice: DialogueChoice) => {
    if (choice.action && onAction) {
      onAction(choice.action);
    }
    if (choice.nextId) {
      setCurrentNodeId(choice.nextId);
    } else {
      if (onFinish) onFinish();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 z-50 flex justify-center items-end pointer-events-none">
      <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-slate-500 rounded-lg p-6 shadow-2xl pointer-events-auto animate-fade-in-up flex flex-col min-h-[160px]">
        {/* 名前欄 */}
        <div className="flex items-baseline mb-2 border-b border-slate-700 pb-1">
          <span className={`text-xl font-bold mr-4 ${displaySpeakerColor}`}>
            {displaySpeakerName}
          </span>
          {displaySpeakerTitle && (
            <span className="text-sm text-slate-400">
              {displaySpeakerTitle}
            </span>
          )}
        </div>

        {/* 本文 */}
        <div className="text-lg text-slate-100 whitespace-pre-wrap leading-relaxed flex-grow">
          {displayText}
        </div>

        {/* 次へボタン または 選択肢 */}
        <div className="mt-4 flex justify-end">
          {choices.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-end">
              {choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(choice)}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white px-6 py-2 rounded border border-indigo-400 transition-colors"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="animate-bounce text-slate-400 hover:text-white"
            >
              ▼ 次へ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
