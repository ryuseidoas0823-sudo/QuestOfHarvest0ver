import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Job, Gender } from '../types';
import { JOB_DATA } from '../data';

interface JobSelectScreenProps {
  onBack: () => void;
  onSelect: (job: Job, gender: Gender) => void;
  loadedAssets: Record<string, HTMLImageElement>;
}

export const JobSelectScreen = ({ onBack, onSelect, loadedAssets }: JobSelectScreenProps) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('Male');
  const [selectedJob, setSelectedJob] = useState<Job>('Swordsman');
  const jobInfo = JOB_DATA[selectedJob];
  const previewImg = loadedAssets[`${selectedJob}_${selectedGender}`];

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex overflow-hidden">
      <div className="w-1/3 bg-slate-900 border-r border-slate-800 relative flex flex-col p-8 shadow-2xl z-10">
        <button onClick={onBack} className="absolute top-6 left-6 text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft size={20} /> <span className="text-sm font-bold uppercase">Back</span></button>
        <div className="mt-12 flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"><div className="text-[200px]">{jobInfo.icon}</div></div>
          <div className="relative mb-8 transform scale-150 animate-float">
             <div className="absolute -inset-4 bg-gradient-to-t from-black/50 to-transparent blur-lg rounded-full"></div>
             {previewImg ? <img src={previewImg.src} className="w-32 h-32 pixel-art drop-shadow-2xl" /> : <div className="text-9xl">{jobInfo.icon}</div>}
          </div>
          <h2 className="text-4xl font-black uppercase tracking-wider mb-2" style={{ color: jobInfo.color }}>{selectedJob}</h2>
          <div className="flex items-center gap-2 mb-6"><span className={`px-3 py-1 rounded text-xs font-bold bg-slate-800 border ${selectedGender === 'Male' ? 'border-blue-500 text-blue-400' : 'border-pink-500 text-pink-400'}`}>{selectedGender === 'Male' ? 'MALE' : 'FEMALE'}</span></div>
          <p className="text-center text-slate-400 text-sm leading-relaxed max-w-xs mb-8">{jobInfo.desc}</p>
          <div className="w-full space-y-3 max-w-xs">
            {[{ label: 'STR', val: jobInfo.attributes.strength, max: 20, col: 'bg-red-500' }, { label: 'VIT', val: jobInfo.attributes.vitality, max: 20, col: 'bg-green-500' }, { label: 'INT', val: jobInfo.attributes.intelligence, max: 20, col: 'bg-purple-500' }, { label: 'DEX', val: jobInfo.attributes.dexterity, max: 20, col: 'bg-yellow-500' }].map(s => (
              <div key={s.label} className="flex items-center gap-3 text-xs font-bold"><div className="w-8 text-slate-500 flex justify-end">{s.label}</div><div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${s.col}`} style={{ width: `${(s.val / s.max) * 100}%` }}></div></div><div className="w-4 text-right text-slate-300">{s.val}</div></div>
            ))}
          </div>
        </div>
        <button onClick={() => onSelect(selectedJob, selectedGender)} className="w-full py-4 mt-8 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all transform hover:-translate-y-1 rounded">Start Adventure</button>
      </div>
      <div className="w-2/3 bg-slate-950 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-slate-500 mb-6 uppercase tracking-widest">Select Gender</h3>
          <div className="flex gap-4 mb-12">
             {['Male', 'Female'].map((g) => (<button key={g} onClick={() => setSelectedGender(g as Gender)} className={`flex-1 py-4 border-2 rounded-lg transition-all flex items-center justify-center gap-3 ${selectedGender === g ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}><span className="text-lg font-bold uppercase">{g}</span></button>))}
          </div>
          <h3 className="text-xl font-bold text-slate-500 mb-6 uppercase tracking-widest">Select Class</h3>
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(JOB_DATA) as Job[]).map(job => (
              <button key={job} onClick={() => setSelectedJob(job)} className={`relative p-6 rounded-lg border-2 text-left transition-all group overflow-hidden ${selectedJob === job ? 'border-white bg-slate-800 shadow-xl scale-[1.02]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900'}`}>
                <div className={`absolute top-0 right-0 p-4 opacity-20 text-6xl transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500 ${selectedJob === job ? 'opacity-40' : ''}`}>{JOB_DATA[job].icon}</div>
                <div className="relative z-10">
                  <h4 className={`text-xl font-black uppercase mb-1 ${selectedJob === job ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{job}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mt-4">
                    <div className="flex justify-between"><span>ATK</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.strength / 4)))}</span></div>
                    <div className="flex justify-between"><span>DEF</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.endurance / 4)))}</span></div>
                    <div className="flex justify-between"><span>SPD</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.dexterity / 4)))}</span></div>
                    <div className="flex justify-between"><span>MAG</span> <span className={selectedJob===job ? 'text-white' : ''}>{'★'.repeat(Math.min(5, Math.ceil(JOB_DATA[job].attributes.intelligence / 4)))}</span></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
