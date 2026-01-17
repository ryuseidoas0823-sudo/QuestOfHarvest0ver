import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-900 to-black text-white">
      <h1 className="text-6xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
        QUEST OF HARVEST
      </h1>
      <p className="mb-12 text-gray-400">Enter the darkness, harvest the souls.</p>
      
      <button 
        onClick={onStart}
        className="px-8 py-4 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg text-xl transition-transform hover:scale-105"
      >
        GAME START
      </button>
    </div>
  );
};

interface JobSelectScreenProps {
  onSelect: (job: string, gender: string) => void;
  loadedAssets?: any; 
}

export const JobSelectScreen: React.FC<JobSelectScreenProps> = ({ onSelect }) => {
  const jobs = [
    { id: 'Warrior', desc: 'Melee fighter with high defense.', icon: '⚔️', color: 'bg-red-900' },
    { id: 'Mage', desc: 'Spellcaster with explosive damage.', icon: '🪄', color: 'bg-blue-900' },
    { id: 'Rogue', desc: 'Fast attacker with high criticals.', icon: '🗡️', color: 'bg-green-900' },
    { id: 'Cleric', desc: 'Survivor with healing abilities.', icon: '✨', color: 'bg-yellow-900' }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-8">Choose Your Path</h2>
      <div className="flex gap-4">
        {jobs.map(job => (
          <button 
            key={job.id}
            onClick={() => onSelect(job.id, 'Male')}
            className={`w-64 p-6 rounded-xl border-2 border-gray-700 hover:border-white transition-all ${job.color} flex flex-col items-center gap-4`}
          >
            <div className="text-6xl">{job.icon}</div>
            <div className="text-2xl font-bold">{job.id}</div>
            <p className="text-center text-sm text-gray-300">{job.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export const LevelUpMenu: React.FC = () => <div>Level Up!</div>;
