import React from 'react';
import { Job } from '../types/job';
import { PixelSprite } from './PixelSprite';
import { skills as skillData } from '../data/skills';
import { calculateExpForLevel } from '../utils'; // 追加

interface GameHUDProps {
  playerJob: Job;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  nextExp: number; // 次のレベルに必要な【累積】経験値
  floor: number;
  gold: number;
  skillCooldowns?: { [key: string]: number };
}

export const GameHUD: React.FC<GameHUDProps> = ({ 
  playerJob, 
  level, 
  hp, 
  maxHp, 
  exp, 
  nextExp,
  floor,
  gold,
  skillCooldowns = {}
}) => {
  const hpPercentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  // 経験値バーの計算 (現在のレベル帯における進捗率)
  const currentLevelBaseExp = calculateExpForLevel(level);
  const nextLevelReqExp = nextExp - currentLevelBaseExp; // 次のレベルまでに必要な量
  const currentProgressExp = exp - currentLevelBaseExp;  // 現在稼いだ量
  
  // ゼロ除算対策
  const expPercentage = nextLevelReqExp > 0 
    ? Math.max(0, Math.min(100, (currentProgressExp / nextLevelReqExp) * 100))
    : 100;

  return (
    <div className="bg-gray-900 border-b-2 border-gray-700 p-2 text-white shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* 左側: キャラクター情報 */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
             <PixelSprite spriteKey={playerJob.id} size={40} />
          </div>
          
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-bold text-yellow-500">{playerJob.name}</span>
              <span className="text-sm text-gray-400">Lv.{level}</span>
            </div>
            
            <div className="w-32 h-3 bg-gray-700 rounded-full mt-1 relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              ></div>
              <span className="absolute w-full text-center text-[10px] leading-3 text-white drop-shadow-md">
                {hp} / {maxHp}
              </span>
            </div>
          </div>
        </div>

        {/* スキルバー (中央寄り) */}
        <div className="flex space-x-2 mx-4">
          {playerJob.skills.map((skillId, index) => {
            const skill = skillData.find(s => s.id === skillId);
            if (!skill) return null;
            const cooldown = skillCooldowns[skillId] || 0;
            const isReady = cooldown === 0;

            return (
              <div key={skillId} className="relative group">
                <div className={`w-10 h-10 border-2 rounded flex items-center justify-center bg-gray-800 ${isReady ? 'border-yellow-500 cursor-pointer' : 'border-gray-600 opacity-50'}`}>
                  <PixelSprite spriteKey={skill.assetKey || 'skill_sword'} size={32} />
                  <div className="absolute -top-2 -left-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-gray-500">
                    {index + 1}
                  </div>
                  {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white font-bold">
                      {cooldown}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-40 bg-black bg-opacity-90 p-2 rounded text-xs hidden group-hover:block z-50 pointer-events-none">
                  <div className="font-bold text-yellow-300">{skill.name}</div>
                  <div className="text-gray-300">{skill.description}</div>
                  <div className="text-blue-300 mt-1">CD: {skill.cooldown}ターン</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 右側: 経験値 & ゴールド */}
        <div className="flex flex-col items-end min-w-[100px]">
           {floor > 0 && (
             <div className="text-xl font-bold text-blue-400 mb-1">B{floor}F</div>
           )}
           <div className="flex items-center text-yellow-400 font-mono mb-1">
             <span className="text-sm mr-1">G</span>
             <span>{gold.toLocaleString()}</span>
           </div>
           
           <div className="w-24 h-2 bg-gray-700 rounded-full relative overflow-hidden" title={`Next Lv: ${nextExp - exp}`}>
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500"
                style={{ width: `${expPercentage}%` }}
              ></div>
           </div>
           {/* 進捗%を表示 */}
           <span className="text-[10px] text-gray-500">{Math.floor(expPercentage)}%</span>
        </div>

      </div>
    </div>
  );
};
