import React, { useState, useEffect } from 'react';
import { DialogueTree, DialogueNode, DialogueChoice } from '../types/dialogue';
import { SPEAKERS } from '../data/dialogues';

interface DialogueWindowProps {
  dialogueTree: DialogueTree;
  onFinish: () => void;
  onAction?: (action: string) => void;
}

export const DialogueWindow: React.FC<DialogueWindowProps> = ({ dialogueTree, onFinish, onAction }) => {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(dialogueTree.rootNodeId);
  
  // 現在のノードを取得
  const currentNode: DialogueNode | undefined = currentNodeId ? dialogueTree.nodes[currentNodeId] : undefined;
  const speaker = currentNode ? SPEAKERS[currentNode.speakerId] : undefined;

  // 会話終了判定
  useEffect(() => {
    if (!currentNodeId) {
      onFinish();
    }
  }, [currentNodeId, onFinish]);

  if (!currentNode || !speaker) return null;

  const handleNext = () => {
    if (currentNode.nextId) {
      setCurrentNodeId(currentNode.nextId);
    } else if (!currentNode.choices || currentNode.choices.length === 0) {
      // 次がなく、選択肢もない場合は終了
      onFinish();
    }
  };

  const handleChoice = (choice: DialogueChoice) => {
    if (choice.action && onAction) {
      onAction(choice.action);
    }
    // nextIdがnullなら終了、あれば遷移
    if (choice.nextId) {
      setCurrentNodeId(choice.nextId);
    } else {
      onFinish();
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 z-50 flex justify-center items-end pointer-events-none">
      <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-slate-500 rounded-lg p-6 shadow-2xl pointer-events-auto animate-fade-in-up flex flex-col min-h-[160px]">
        {/* 名前欄 */}
        <div className="flex items-baseline mb-2 border-b border-slate-700 pb-1">
          <span className={`text-xl font-bold mr-4 ${speaker.color || 'text-white'}`}>
            {speaker.name}
          </span>
          {speaker.title && (
            <span className="text-sm text-slate-400">
              {speaker.title}
            </span>
          )}
        </div>

        {/* 本文 */}
        <div className="text-lg text-slate-100 whitespace-pre-wrap leading-relaxed flex-grow">
          {currentNode.text}
        </div>

        {/* 次へボタン または 選択肢 */}
        <div className="mt-4 flex justify-end">
          {currentNode.choices && currentNode.choices.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-end">
              {currentNode.choices.map((choice, index) => (
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
