import React from 'react';
import { jobs } from '../data/jobs';
import { Job } from '../types/job';
import { PixelSprite } from './PixelSprite';

interface JobSelectScreenProps {
  onSelectJob: (job: Job) => void;
}

export const JobSelectScreen: React.FC<JobSelectScreenProps> = ({ onSelectJob }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4"
         style={{
             backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(https://images.unsplash.com/photo-1542256810-5449255255d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
             backgroundSize: 'cover',
             backgroundPosition: 'center'
         }}>
      <h2 className="text-4xl font-bold mb-8 text-yellow-500" style={{ fontFamily: 'monospace' }}>職業選択</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {jobs.map((job) => (
          <div 
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="bg-gray-800 border-2 border-gray-600 rounded-lg p-6 hover:border-yellow-500 hover:bg-gray-700 cursor-pointer transition-all transform hover:scale-105 flex flex-col items-center"
          >
            {/* ドット絵アイコンの表示 */}
            <div className="mb-4 p-2 bg-gray-900 rounded-full border border-gray-600">
                {/* job.id や job.assetKey をキーとして渡す */}
                <PixelSprite spriteKey={job.id} size={64} />
            </div>

            <h3 className="text-2xl font-bold mb-2">{job.name}</h3>
            <p className="text-gray-400 text-sm mb-4 text-center h-10">{job.description}</p>
            
            <div className="w-full space-y-2 text-sm bg-gray-900 p-3 rounded">
              <div className="flex justify-between">
                <span className="text-red-400">STR (筋力):</span>
                <span>{job.baseStats.str}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">VIT (体力):</span>
                <span>{job.baseStats.vit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">DEX (器用):</span>
                <span>{job.baseStats.dex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">INT (知力):</span>
                <span>{job.baseStats.int}</span>
              </div>
            </div>

            <button className="mt-6 w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-white font-bold">
              決定
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
