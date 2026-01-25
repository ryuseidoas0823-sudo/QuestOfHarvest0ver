import React from 'react';

interface DialogueWindowProps {
  text: string;
  speaker: string;
  onNext: () => void;
}

const DialogueWindow: React.FC<DialogueWindowProps> = ({ text, speaker, onNext }) => {
  return (
    <div 
      className="w-full bg-gradient-to-b from-blue-900/90 to-blue-950/95 border-4 border-white rounded-lg shadow-lg p-4 text-white font-sans cursor-pointer select-none"
      onClick={onNext}
    >
      <div className="flex gap-4">
        {/* Face Graphic Placeholder */}
        <div className="w-16 h-16 bg-black/40 border border-blue-400 rounded flex-shrink-0 flex items-center justify-center">
          <span className="text-3xl">👤</span>
        </div>

        {/* Text Area */}
        <div className="flex-1 flex flex-col">
          {speaker && (
            <div className="font-bold text-yellow-300 text-sm mb-1 px-2 py-0.5 bg-blue-800/50 w-fit rounded border border-blue-600">
              {speaker}
            </div>
          )}
          <div className="text-base leading-relaxed tracking-wide min-h-[3rem]">
            {text}
          </div>
          {/* Next Cursor */}
          <div className="self-end mt-1 animate-bounce text-yellow-200 text-xs">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueWindow;
