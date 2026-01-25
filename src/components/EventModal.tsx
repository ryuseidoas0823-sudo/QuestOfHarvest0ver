import React, { ReactNode } from 'react';

interface EventModalProps {
  content: ReactNode;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ content, onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white text-black p-6 rounded-lg max-w-lg w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black font-bold text-xl"
        >
          ×
        </button>
        <div className="mt-2">
          {content}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
