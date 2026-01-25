import React from 'react';
import { GameEvent, GameEventChoice } from '../types/event';

interface EventModalProps {
  event: GameEvent;
  onChoice: (choice: GameEventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onChoice }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 border-2 border-yellow-600 rounded-lg p-6 max-w-lg w-full shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-fade-in-up">
        <h2 className="text-2xl font-bold text-yellow-500 mb-4 border-b border-gray-700 pb-2">
          {event.title}
        </h2>
        
        <div className="mb-8 text-gray-200 leading-relaxed min-h-[80px]">
          {event.description}
        </div>

        <div className="space-y-3">
          {event.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoice(choice)}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-yellow-900 border border-slate-600 hover:border-yellow-500 rounded text-left transition-colors flex justify-between items-center group"
            >
              <span className="font-bold text-gray-300 group-hover:text-white">
                {choice.text}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-yellow-400">
                ▶
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
