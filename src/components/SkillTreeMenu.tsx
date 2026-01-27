import React, { useState } from 'react';
import { GameState } from '../types/gameState';
import { JobId } from '../types/job';
import { SKILLS, JOB_SKILL_TREE } from '../data/skills';
import { JOBS } from '../data/jobs';
import { X, Plus, ChevronRight, Lock } from 'lucide-react';

interface SkillTreeMenuProps {
  gameState: GameState;
  onClose: () => void;
  onIncreaseMastery: (jobId: JobId) => void;
  onLearnSkill: (skillId: string) => void;
}

const SkillTreeMenu: React.FC<SkillTreeMenuProps> = ({ 
  gameState, onClose, onIncreaseMastery, onLearnSkill 
}) => {
  const { player } = gameState;
  const { jobState, skillPoints, skills } = player;
  
  // 表示するジョブ（現在はメインジョブのみだが、タブ切り替え可能に）
  const [activeJobId, setActiveJobId] = useState<JobId | null>(jobState.mainJob);

  if (!activeJobId) return null;

  const job = JOBS[activeJobId];
  const currentMastery = jobState.mastery[activeJobId] || 0;
  const jobSkills = JOB_SKILL_TREE[activeJobId] || [];

  // マスタリーバーのレンダリング
  const renderMasteryBar = () => {
    return (
      <div className="flex items-center gap-4 mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-slate-700 rounded-full border-2 border-amber-500">
          {job.icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="font-bold text-amber-400">{job.name} Mastery</span>
            <span className="text-white font-mono">{currentMastery} / 50</span>
          </div>
          <div className="h-6 bg-slate-900 rounded-full relative overflow-hidden border border-slate-600">
            <div 
              className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-300"
              style={{ width: `${(currentMastery / 50) * 100}%` }}
            />
            {/* 目盛り (Tier) */}
            {[1, 5, 10, 15, 20, 25, 32, 40, 50].map(tier => (
               <div 
                 key={tier} 
                 className="absolute top-0 bottom-0 w-px bg-black/50"
                 style={{ left: `${(tier / 50) * 100}%` }}
               />
            ))}
          </div>
        </div>
        <button
          onClick={() => onIncreaseMastery(activeJobId)}
          disabled={skillPoints === 0 || currentMastery >= 50}
          className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold border-2 transition-all ${
            skillPoints > 0 && currentMastery < 50
              ? 'bg-green-600 border-green-400 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]'
              : 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Plus size={20} />
        </button>
      </div>
    );
  };

  // スキルノードのレンダリング
  const renderSkillNode = (skillId: string) => {
    const skill = SKILLS[skillId];
    if (!skill) return null;

    const currentLevel = skills[skillId] || 0;
    const isUnlocked = currentMastery >= skill.tier;
    // 前提スキル条件チェック
    const isParentSatisfied = !skill.parentSkillId || (skills[skill.parentSkillId] || 0) > 0;
    const canLearn = isUnlocked && isParentSatisfied && skillPoints > 0 && currentLevel < skill.maxLevel;

    // スキルタイプによる枠色
    const borderClass = 
        skill.type === 'active' ? 'border-red-500' :
        skill.type === 'passive' ? 'border-blue-500' :
        skill.type === 'modifier' ? 'border-purple-500' :
        'border-amber-500'; // exclusive

    // 形状 (Modifierは丸く小さくつなげるなど、ここでは簡易的に四角/丸)
    const shapeClass = skill.type === 'modifier' ? 'rounded-full w-12 h-12' : 'rounded-lg w-16 h-16';

    // Tierごとの配置位置計算 (簡易)
    // 実際にはグリッドレイアウトや絶対配置が必要だが、ここではリスト表示にするか、
    // Tierごとに横並びにする
    return (
        <div key={skillId} className="relative group flex flex-col items-center">
            <button
                onClick={() => onLearnSkill(skillId)}
                disabled={!canLearn}
                className={`relative flex items-center justify-center border-2 transition-all ${shapeClass} ${borderClass} ${
                    currentLevel > 0 
                        ? 'bg-slate-700 text-white' 
                        : isUnlocked && isParentSatisfied
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                            : 'bg-slate-900 text-slate-700 border-slate-800'
                } ${canLearn ? 'ring-2 ring-white cursor-pointer' : ''}`}
            >
                <span className="text-2xl">{skill.icon}</span>
                {!isUnlocked && <Lock className="absolute w-4 h-4 text-slate-600" />}
                
                {/* レベルバッジ */}
                <div className="absolute -bottom-2 -right-2 bg-black text-xs px-1.5 py-0.5 rounded border border-slate-600 font-mono text-white">
                    {currentLevel}/{skill.maxLevel}
                </div>
            </button>

            {/* ツールチップ */}
            <div className="absolute bottom-full mb-2 w-64 hidden group-hover:block z-20">
                <div className="bg-black/95 border border-slate-500 rounded p-3 text-left shadow-xl">
                    <div className={`font-bold text-lg mb-1 ${
                        skill.type === 'active' ? 'text-red-400' :
                        skill.type === 'passive' ? 'text-blue-400' :
                        skill.type === 'modifier' ? 'text-purple-400' : 'text-amber-400'
                    }`}>
                        {skill.name}
                    </div>
                    <div className="text-xs text-slate-400 mb-2 font-mono">
                        Tier {skill.tier} / {skill.type.toUpperCase()}
                    </div>
                    <p className="text-sm text-slate-200 mb-2">{skill.description}</p>
                    
                    {skill.mpCost && <div className="text-xs text-blue-300">消費MP: {skill.mpCost}</div>}
                    
                    {currentLevel < skill.maxLevel && (
                        <div className="mt-2 text-xs text-green-400">
                            {canLearn ? 'クリックで習得/強化' : 
                             !isUnlocked ? `必要マスタリー: ${skill.tier}` :
                             !isParentSatisfied ? '前提スキルが必要' : 'ポイント不足'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  // スキルをTierごとにグループ化して表示
  const renderSkillTree = () => {
    // スキルIDリストからオブジェクトを取得し、Tierでソート
    const sortedSkills = jobSkills
        .map(id => SKILLS[id])
        .filter(s => s !== undefined)
        .sort((a, b) => a.tier - b.tier);

    // Tierごとにグルーピング
    const tiers = Array.from(new Set(sortedSkills.map(s => s.tier))).sort((a, b) => a - b);

    return (
        <div className="flex-1 overflow-y-auto pr-2 relative">
            {/* 背景のグリッド線などがあれば雰囲気が出る */}
            <div className="space-y-8 relative z-10">
                {tiers.map(tier => (
                    <div key={tier} className="flex items-center gap-4">
                        <div className="w-16 text-right text-slate-500 font-bold font-mono text-sm pt-4">
                            Tier {tier}
                        </div>
                        <div className="flex-1 border-b border-slate-700 pb-4 flex flex-wrap gap-8 items-end">
                            {sortedSkills.filter(s => s.tier === tier).map(s => renderSkillNode(s.id))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-6 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-5xl h-full max-h-[90vh] rounded-xl border border-slate-600 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 rounded-t-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-wider">SKILL TREE</h2>
            <div className="px-3 py-1 bg-black rounded text-green-400 font-mono font-bold border border-green-900">
                Points: {skillPoints}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden p-6 gap-6">
            {/* Main Area */}
            <div className="flex-1 flex flex-col">
                {renderMasteryBar()}
                <div className="bg-slate-900/50 flex-1 rounded-lg border border-slate-800 p-4 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10 bg-[url('/skill-bg.png')] pointer-events-none" />
                    {renderSkillTree()}
                </div>
            </div>

            {/* Info Panel (Optional: Current Stats Summary) */}
            <div className="w-64 bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-slate-400 font-bold mb-4 uppercase text-xs">Class Selection</h3>
                {/* ここでジョブ切り替えタブを作る */}
                <button 
                    className={`w-full text-left p-2 rounded mb-2 flex items-center gap-2 ${
                        activeJobId === jobState.mainJob ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    onClick={() => jobState.mainJob && setActiveJobId(jobState.mainJob)}
                >
                    <span className="text-xl">{JOBS[jobState.mainJob!]?.icon}</span>
                    <span className="font-bold text-sm">{JOBS[jobState.mainJob!]?.name.split('(')[0]}</span>
                </button>
                
                {jobState.subJob ? (
                    <button 
                        className={`w-full text-left p-2 rounded mb-2 flex items-center gap-2 ${
                            activeJobId === jobState.subJob ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        onClick={() => setActiveJobId(jobState.subJob)}
                    >
                        <span className="text-xl">{JOBS[jobState.subJob]?.icon}</span>
                        <span className="font-bold text-sm">{JOBS[jobState.subJob]?.name.split('(')[0]}</span>
                    </button>
                ) : (
                    <div className="p-4 border border-dashed border-slate-600 rounded text-center text-xs text-slate-500 mt-4">
                        Lv20でサブジョブ解禁
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeMenu;
