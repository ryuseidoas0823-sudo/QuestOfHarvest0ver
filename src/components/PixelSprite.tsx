import React from 'react';

interface PixelSpriteProps {
  type: string; // 'player', 'enemy', 'wall', 'floor', etc.
  variant?: string; // Specific sprite ID
  size?: number;
  className?: string; // アニメーションなどの追加クラス用
  scale?: number;
}

const PixelSprite: React.FC<PixelSpriteProps> = ({ 
  type, 
  variant = 'default', 
  size = 32, 
  className = '',
  scale = 1
}) => {
  // 簡易的な色分けによるスプライト表現
  // 本来は画像アセットを使用するが、ここではCSSで代用
  
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

  if (type === 'player') {
    content = (
      <div 
        className={`bg-blue-500 rounded-full border-2 border-white shadow-lg ${className}`}
        style={{ width: size * 0.8, height: size * 0.8 }}
      >
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
          P
        </div>
      </div>
    );
  } else if (type === 'enemy') {
    const isBoss = variant.includes('boss');
    content = (
      <div 
        className={`${isBoss ? 'bg-red-700' : 'bg-red-500'} rounded-sm border border-red-900 shadow-md ${className}`}
        style={{ width: size * 0.8, height: size * 0.8 }}
      >
         <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
          {variant === 'boss' ? 'B' : 'E'}
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
  } else if (type === 'stairs') {
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
