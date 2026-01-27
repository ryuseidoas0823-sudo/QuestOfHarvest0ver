import React from 'react';
import { EnemyInstance } from '../types/enemy';
import { JobId, Tile } from '../types';
import { StatusIcon } from '../utils/statusIcons';

interface PixelSpriteProps {
  type: string; // 'player', 'enemy', 'wall', 'floor', etc.
  variant?: string; // Specific sprite ID
  size?: number;
  className?: string; // アニメーションなどの追加クラス用
  scale?: number;
  
  data?: EnemyInstance;
  tileData?: Tile;
  state?: string;
  jobId?: JobId;
  direction?: string;
}

const PixelSprite: React.FC<PixelSpriteProps> = ({ 
  type, 
  variant = 'default', 
  size = 32, 
  className = '',
  scale = 1,
  data,
  tileData,
  state,
}) => {
  let content = null;
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.6,
    position: 'relative',
    transform: `scale(${scale})`,
    transition: 'transform 0.1s'
  };

  let statusClass = className;
  if (state === 'attack') statusClass += ' animate-attack';
  if (data?.status === 'damage') statusClass += ' animate-damage';

  // 状態異常表示用のオーバーレイ
  const renderStatusEffects = () => {
    if (!data?.statusEffects || data.statusEffects.length === 0) return null;

    // 最大3つまで表示
    const effectsToShow = data.statusEffects.slice(0, 3);

    return (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-0.5 z-10 pointer-events-none">
        {effectsToShow.map((effect, idx) => (
          <div key={`${effect.id}-${idx}`} className="bg-black/70 rounded-full p-0.5 border border-white/20 shadow-sm">
            <StatusIcon type={effect.type} size={8} />
          </div>
        ))}
        {data.statusEffects.length > 3 && (
          <div className="bg-black/70 rounded-full w-2.5 h-2.5 flex items-center justify-center border border-white/20">
            <span className="text-[6px] text-white leading-none">+</span>
          </div>
        )}
      </div>
    );
  };

  if (type === 'player') {
    content = (
      <div 
        className={`bg-blue-500 rounded-full border-2 border-white shadow-lg ${statusClass}`}
        style={{ width: size * 0.8, height: size * 0.8 }}
      >
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
          P
        </div>
      </div>
    );
  } else if (type === 'enemy') {
    const isBoss = variant.includes('boss') || data?.type === 'boss';
    content = (
      <div 
        className={`${isBoss ? 'bg-red-700' : 'bg-red-500'} rounded-sm border border-red-900 shadow-md ${statusClass} relative`}
        style={{ width: size * 0.8, height: size * 0.8 }}
      >
         {renderStatusEffects()}
         <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
          {isBoss ? 'B' : 'E'}
        </div>
      </div>
    );
  } else if (type === 'wall') {
    content = (
      <div 
        className="bg-neutral-800 border border-neutral-700"
        style={{ width: size, height: size }}
      />
    );
  } else if (type === 'floor') {
    content = (
      <div 
        className="bg-neutral-900 border border-neutral-800/50"
        style={{ width: size, height: size }}
      />
    );
  } else if (type === 'chest') {
    const isOpened = tileData?.meta?.opened;
    content = (
      <div 
        className={`border-2 shadow-sm ${isOpened ? 'bg-amber-900 border-amber-800' : 'bg-amber-600 border-amber-400'}`}
        style={{ width: size * 0.7, height: size * 0.6, borderRadius: '4px' }}
      >
        {!isOpened && (
          <div className="w-full h-1 bg-amber-800 mt-1" />
        )}
      </div>
    );
  } else if (type === 'stairs_down' || type === 'stairs') {
    content = (
      <div 
        className="bg-yellow-600/50 border-2 border-yellow-500"
        style={{ width: size * 0.8, height: size * 0.8 }}
      >
        <span className="text-yellow-200 font-bold text-[10px] flex justify-center items-center h-full">
          GO
        </span>
      </div>
    );
  }

  return (
    <div style={baseStyle} className="select-none">
      {content}
    </div>
  );
};

export default PixelSprite;
