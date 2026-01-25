import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onRetire: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onRetire }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-500 p-6 rounded shadow-xl w-64 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-center text-white mb-2">PAUSE</h3>
        <button onClick={onResume} className="py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">
          Resume
        </button>
        <button onClick={onRetire} className="py-2 bg-red-700 hover:bg-red-600 text-white rounded">
          Retire (Town)
        </button>
      </div>
    </div>
  );
};

export default PauseMenu;
