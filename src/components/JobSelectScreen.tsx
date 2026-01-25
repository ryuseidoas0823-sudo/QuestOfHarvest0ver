import React from 'react';
import { JobId } from '../types';
import { JOBS } from '../data/jobs';

interface JobSelectScreenProps {
  onSelect: (jobId: JobId) => void;
}

const JobSelectScreen: React.FC<JobSelectScreenProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white p-4">
      <h2 className="text-3xl font-bold mb-8 text-amber-400">職業を選択してください</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {(Object.keys(JOBS) as JobId[]).map((jobId) => {
          const job = JOBS[jobId];
          return (
            <button
              key={jobId}
              onClick={() => onSelect(jobId)}
              className="flex flex-col items-center p-6 bg-slate-800 border-2 border-slate-600 rounded-lg hover:bg-slate-700 hover:border-amber-400 transition-all group"
            >
              <div className="w-16 h-16 bg-black mb-4 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                {/* 簡易アイコン */}
                <span className="text-2xl">
                  {jobId === 'swordsman' ? '⚔️' : 
                   jobId === 'warrior' ? '🪓' : 
                   jobId === 'archer' ? '🏹' : '🪄'}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{job.name}</h3>
              <p className="text-sm text-gray-400 text-center">{job.description}</p>
              
              <div className="mt-4 w-full text-xs text-left space-y-1 bg-slate-900/50 p-2 rounded">
                <div className="flex justify-between"><span>STR:</span><span>{job.baseStats.str}</span></div>
                <div className="flex justify-between"><span>VIT:</span><span>{job.baseStats.vit}</span></div>
                <div className="flex justify-between"><span>DEX:</span><span>{job.baseStats.dex}</span></div>
                <div className="flex justify-between"><span>AGI:</span><span>{job.baseStats.agi}</span></div>
                <div className="flex justify-between"><span>INT:</span><span>{job.baseStats.int}</span></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JobSelectScreen;
