import React, { useState } from 'react';
import { JobType, Gender } from '../types';
import { INITIAL_PLAYER_STATS } from '../data';

interface JobSelectScreenProps {
  onSelect: (job: JobType, gender: Gender) => void;
  onBack: () => void;
  loadedAssets?: any; 
}

export const JobSelectScreen: React.FC<JobSelectScreenProps> = ({ onSelect, onBack }) => {
  const [selectedJob, setSelectedJob] = useState<JobType>('Swordsman');
  const [selectedGender, setSelectedGender] = useState<Gender>('male');

  const jobs: JobType[] = ['Swordsman', 'Warrior', 'Archer', 'Mage'];
  const stats = INITIAL_PLAYER_STATS[selectedJob];

  const StatRow = ({ label, value }: { label: string, value: number }) => (
    <div className="flex justify-between items-center py-1 border-b border-white/10">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold text-white mb-8">SELECT YOUR CLASS</h2>
      
      <div className="flex gap-8 max-w-4xl w-full">
        <div className="flex-1 space-y-4">
          {jobs.map(job => (
            <button
              key={job}
              onClick={() => setSelectedJob(job)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedJob === job ? 'bg-blue-600 border-white text-white' : 'bg-slate-800 border-transparent text-gray-400 hover:bg-slate-700'
              }`}
            >
              <div className="text-xl font-black">{job.toUpperCase()}</div>
            </button>
          ))}
        </div>

        <div className="w-80 bg-slate-800 p-6 rounded-xl border border-white/20">
          <h3 className="text-xl font-bold text-blue-400 mb-4">{selectedJob} Stats</h3>
          <div className="space-y-1 mb-6">
            <StatRow label="Strength" value={stats.str} />
            <StatRow label="Dexterity" value={stats.dex} />
            <StatRow label="Intelligence" value={stats.int} />
            <StatRow label="Vitality" value={stats.vit} />
            <StatRow label="Agility" value={stats.agi} />
            <StatRow label="Luck" value={stats.luk} />
          </div>

          <h3 className="text-lg font-bold text-white mb-3">GENDER</h3>
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setSelectedGender('male')}
              className={`flex-1 py-2 rounded font-bold ${selectedGender === 'male' ? 'bg-white text-slate-900' : 'bg-slate-700 text-gray-400'}`}
            >
              MALE
            </button>
            <button
              onClick={() => setSelectedGender('female')}
              className={`flex-1 py-2 rounded font-bold ${selectedGender === 'female' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-gray-400'}`}
            >
              FEMALE
            </button>
          </div>

          <button
            onClick={() => onSelect(selectedJob, selectedGender)}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-lg shadow-lg transform active:scale-95 transition-all"
          >
            START ADVENTURE
          </button>
        </div>
      </div>

      <button onClick={onBack} className="mt-8 text-gray-500 hover:text-white underline">
        BACK TO TITLE
      </button>
    </div>
  );
};
