import React from 'react';
import { GameState } from '../types/gameState';
import { Heart, Shield, Zap, Activity, FlaskConical } from 'lucide-react';
import { StatusIcon, getStatusColor } from '../utils/statusIcons';

interface GameHUDProps {
  gameState: GameState;
  onUsePotion: () => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ gameState, onUsePotion }) => {
  const { player } = gameState;

  // HPバーの割合計算
  const hpPercent = (player.hp / player.maxHp) * 100;
  const mpPercent = (player.mp / player.maxMp) * 100;
  // CTバーの割合計算 (100が満タン)
  const ctPercent = Math.min(100, player.ct || 0);

  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
      {/* 左側: ステータスバー */}
      <div className="bg-slate-900/80 p-4 rounded-lg border-2 border-slate-700 pointer-events-auto backdrop-blur-sm flex flex-col gap-2">
        <div className="flex items-center gap-4 mb-1">
          <div>
            <div className="text-xs text-slate-400 font-bold">LV</div>
            <div className="text-xl text-yellow-400 font-bold leading-none">{player.level}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white mb-1">{player.name}</div>
            
            {/* HP Bar */}
            <div className="flex items-center gap-2 mb-1 w-48">
              <Heart size={14} className="text-red-500" />
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-xs text-white font-mono w-16 text-right">
                {player.hp}/{player.maxHp}
              </span>
            </div>

            {/* MP Bar */}
            <div className="flex items-center gap-2 mb-1 w-48">
              <Zap size={14} className="text-blue-500" />
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                  style={{ width: `${mpPercent}%` }}
                />
              </div>
              <span className="text-xs text-slate-300 font-mono w-16 text-right">
                {player.mp}/{player.maxMp}
              </span>
            </div>

             {/* CT Bar (Active Turn) */}
             <div className="flex items-center gap-2 w-48 mt-2">
              <Activity size={14} className="text-green-500" />
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                <div 
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${ctPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 状態異常表示エリア */}
        {player.statusEffects && player.statusEffects.length > 0 && (
          <div className="flex gap-2 flex-wrap max-w-[280px]">
            {player.statusEffects.map((effect, idx) => (
              <div 
                key={`${effect.id}-${idx}`} 
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(effect.type)}`}
              >
                <StatusIcon type={effect.type} size={12} />
                <span className="text-white font-bold">{effect.name}</span>
                {/* 999ターン以上は無限(∞)表示にするか、表示しない */}
                {effect.duration < 99 && (
                  <span className="text-slate-300 ml-1 font-mono">
                    {effect.duration}T
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* クイックポーションエリア */}
        <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-3">
            <button
                onClick={onUsePotion}
                className="group relative flex items-center gap-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 hover:border-red-500 rounded px-3 py-1.5 transition-all active:scale-95"
                title="クイックポーションを使用 (Q)"
            >
                <div className="relative">
                    <FlaskConical size={20} className="text-red-400 group-hover:text-red-300" />
                    <div className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-bold px-1 rounded border border-slate-600">
                        Q
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Quick Potion</span>
                    <span className="text-sm font-mono text-white">
                        {player.quickPotion?.current ?? 0} <span className="text-slate-500">/ {player.quickPotion?.max ?? 0}</span>
                    </span>
                </div>
            </button>
        </div>
      </div>

      {/* 右側: ログウィンドウ */}
      <div className="w-1/3 max-w-sm pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-slate-700 h-32 overflow-y-auto text-sm font-mono flex flex-col-reverse shadow-lg">
          {gameState.logs.map((log) => (
            <div 
              key={log.id} 
              className={`mb-1 break-words ${
                log.type === 'danger' ? 'text-red-400 font-bold' :
                log.type === 'warning' ? 'text-orange-300' :
                log.type === 'success' ? 'text-green-400' : 'text-slate-300'
              }`}
            >
              <span className="opacity-50 mr-2 text-xs">
                &gt;
              </span>
              {log.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
