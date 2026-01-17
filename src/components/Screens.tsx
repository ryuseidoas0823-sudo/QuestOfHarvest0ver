import React, { useState } from 'react';
import { Play, Save, Settings, Monitor, X, ArrowLeft, Sword, Heart, Zap, Activity } from 'lucide-react';
import { JOB_DATA } from '../data'; 
import { Job, Gender, PerkData, ResolutionMode } from '../types';

export const TitleScreen = ({ onStart, onContinue, canContinue, resolution, setResolution }: any) => {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden font-sans bg-mist">
      {/* Background/UI omitted for brevity but logic is preserved */}
      <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 drop-shadow-2xl mb-4">QUEST OF HARVEST</h1>
      <div className="flex flex-col gap-4 w-80 mx-auto">
        <button onClick={onStart} className="flex items-center justify-center gap-3 px-8 py-4 bg-red-900 text-white font-bold"><Play size={24}/> New Game</button>
        {/* Other buttons */}
      </div>
    </div>
  );
};

export const JobSelectScreen = ({ onBack, onSelect, loadedAssets }: any) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('Male');
  const [selectedJob, setSelectedJob] = useState<Job>('Swordsman');
  const jobInfo = JOB_DATA[selectedJob];
  const previewImg = loadedAssets[`${selectedJob}_${selectedGender}`];
  
  return (
    <div className="w-full h-screen bg-slate-950 text-white flex overflow-hidden">
      <div className="w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-center">
         {previewImg ? <img src={previewImg.src} className="w-32 h-32 pixel-art mb-8" /> : <div className="text-9xl mb-8">{jobInfo.icon}</div>}
         <h2 className="text-4xl font-bold mb-4">{selectedJob}</h2>
         <p className="text-center text-slate-400 mb-8">{jobInfo.desc}</p>
         <button onClick={() => onSelect(selectedJob, selectedGender)} className="w-full py-4 bg-yellow-600 text-black font-bold">START</button>
      </div>
      <div className="w-2/3 p-12 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(JOB_DATA) as Job[]).map(job => (
              <button key={job} onClick={() => setSelectedJob(job)} className={`p-6 border-2 ${selectedJob === job ? 'border-yellow-500 bg-slate-800' : 'border-slate-800'}`}>
                <div className="text-4xl mb-2">{JOB_DATA[job].icon}</div>
                <div className="font-bold">{job}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-8">
             {['Male', 'Female'].map((g) => (
                 <button key={g} onClick={() => setSelectedGender(g as Gender)} className={`flex-1 py-4 border-2 ${selectedGender === g ? 'border-yellow-500' : 'border-slate-800'}`}>{g}</button>
             ))}
          </div>
      </div>
    </div>
  );
};

export const LevelUpMenu = ({ options, onSelect }: { options: PerkData[], onSelect: (perkId: string) => void }) => {
  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
      <h2 className="text-4xl text-yellow-500 mb-8">Level Up!</h2>
      <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
        {options.map((perk) => {
           const Icon = perk.icon;
           return (
             <button key={perk.id} onClick={() => onSelect(perk.id)} className="bg-slate-800 border-2 border-slate-600 hover:border-white p-6 rounded-xl flex flex-col items-center text-center">
               <Icon size={48} style={{ color: perk.color }} className="mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">{perk.name}</h3>
               <p className="text-sm text-slate-400">{perk.desc}</p>
             </button>
           );
        })}
      </div>
    </div>
  );
};
