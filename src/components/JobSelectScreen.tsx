import React from 'react';
import { JOBS } from '../data/jobs';
import { JobId } from '../types/job';
import { getAsset } from '../assets/assetRegistry';

interface JobSelectScreenProps {
  onSelectJob: (jobId: JobId) => void;
}

const JobSelectScreen: React.FC<JobSelectScreenProps> = ({ onSelectJob }) => {
  // JOBSオブジェクトを配列に変換してマップ処理
  const jobList = Object.values(JOBS);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h2 className="text-4xl font-bold mb-8 text-yellow-400">職業を選択してください</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {jobList.map((job) => {
          // アセットの取得（ここでは単純化していますが、実際のアセット形式に合わせて描画してください）
          // 例: アセットファイルがReactコンポーネントをdefault exportしている場合など
          const AssetModule = getAsset(job.assetKey);
          
          return (
            <div 
              key={job.id}
              className="bg-gray-800 border-2 border-gray-700 rounded-xl p-6 flex flex-col items-center hover:border-yellow-500 hover:bg-gray-750 transition-all cursor-pointer shadow-lg transform hover:-translate-y-1"
              onClick={() => onSelectJob(job.id)}
            >
              {/* キャラクタープレビュー領域 */}
              <div className="w-32 h-32 mb-4 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden border border-gray-600">
                {/* アセットの描画: 
                  実際の実装に合わせて <AssetModule.Default /> や <img src={...} /> 等に書き換えてください。
                  ここではプレビュー用に職業名の頭文字を表示します。
                */}
                <span className="text-4xl font-bold text-gray-500">
                  {AssetModule ? 'SVG' : job.name[0]}
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2">{job.name}</h3>
              
              <div className="text-sm text-gray-400 text-center mb-4 min-h-[3rem]">
                {job.description}
              </div>

              {/* ステータスバー（簡易表示） */}
              <div className="w-full space-y-2 text-xs">
                <div className="flex items-center">
                  <span className="w-8 text-red-400">HP</span>
                  <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${(job.baseStats.maxHp / 150) * 100}%` }}></div>
                  </div>
                  <span className="ml-2 w-6 text-right">{job.baseStats.maxHp}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-yellow-400">ATK</span>
                  <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full" style={{ width: `${(job.baseStats.attack / 20) * 100}%` }}></div>
                  </div>
                  <span className="ml-2 w-6 text-right">{job.baseStats.attack}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-blue-400">DEF</span>
                  <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(job.baseStats.defense / 10) * 100}%` }}></div>
                  </div>
                  <span className="ml-2 w-6 text-right">{job.baseStats.defense}</span>
                </div>
              </div>

              {/* 習得スキル（バッジ表示） */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {job.learnableSkills.slice(0, 2).map(skillId => (
                  <span key={skillId} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    {/* 本来は SKILLS[skillId].name を参照すべきですが、ここではIDを表示 */}
                    {skillId}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-gray-500 text-sm">
        ※ 職業によって成長率と習得スキルが異なります
      </div>
    </div>
  );
};

export default JobSelectScreen;
