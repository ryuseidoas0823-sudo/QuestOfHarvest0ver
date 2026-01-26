import React, { useState } from 'react';

interface NameInputScreenProps {
  onNameDecided: (name: string) => void;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ onNameDecided }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onNameDecided(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-sans z-50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-80" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
        <h2 className="text-3xl text-yellow-500 font-bold tracking-widest drop-shadow-md">
          冒険者の名前を教えてください
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center w-full max-w-md">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
            placeholder="名前を入力"
            className="w-full px-6 py-3 bg-neutral-900 text-white rounded border-2 border-neutral-700 focus:border-yellow-500 outline-none text-center text-xl transition-colors placeholder-neutral-600"
            autoFocus
          />
          
          <button
            type="submit"
            disabled={name.trim().length === 0}
            className={`
              w-full py-3 rounded font-bold tracking-wider text-lg transition-all duration-300
              ${name.trim().length > 0 
                ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] hover:scale-105' 
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700'}
            `}
          >
            決 定
          </button>
        </form>

        <div className="text-neutral-500 text-sm">
          ※ 最大10文字まで
        </div>
      </div>
    </div>
  );
};

export default NameInputScreen;
