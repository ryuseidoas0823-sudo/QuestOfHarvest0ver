import React from 'react';
import { CHAR_SVG } from '../assets/pixelData';
// spriteManagerへの依存を削除

interface PixelSpriteProps {
  type: 'player' | 'enemy' | 'item' | 'npc';
  jobId?: string; 
  data?: any;     
  state?: 'idle' | 'move' | 'attack' | 'damage';
  direction?: 'left' | 'right' | 'up' | 'down'; 
  scale?: number;
}

const PixelSprite: React.FC<PixelSpriteProps> = ({ 
  type, 
  jobId = 'swordsman', 
  data, 
  state = 'idle',
  direction = 'down',
  scale = 1
}) => {
  let svgContent = '';
  
  if (type === 'player') {
    switch (jobId) {
      case 'warrior': svgContent = CHAR_SVG.warrior(); break;
      case 'archer': svgContent = CHAR_SVG.swordsman('#15803d'); break;
      case 'mage': svgContent = CHAR_SVG.swordsman('#7e22ce'); break;
      case 'swordsman': default: svgContent = CHAR_SVG.swordsman(); break;
    }
  } else if (type === 'enemy') {
    const name = data?.name || '';
    if (name.includes('スライム')) svgContent = CHAR_SVG.slime;
    else if (name.includes('ゴブリン')) svgContent = CHAR_SVG.goblin;
    else if (name.includes('スケルトン') || name.includes('ガイコツ')) svgContent = CHAR_SVG.skeleton;
    else svgContent = CHAR_SVG.unknown;
  }

  const getAnimationClass = () => {
    switch (state) {
      case 'attack': return 'animate-bounce'; 
      case 'damage': return 'animate-pulse opacity-50';
      case 'move': return 'animate-pulse';
      case 'idle': default: return 'animate-[bounce_3s_infinite]';
    }
  };

  const getTransform = () => {
    const baseScale = `scale(${scale})`;
    if (direction === 'left') {
      return `${baseScale} scaleX(-1)`;
    }
    return baseScale;
  };

  return (
    <div 
      className={`relative w-8 h-8 flex items-center justify-center transition-transform duration-200 ${getAnimationClass()}`}
      style={{ transform: getTransform() }}
    >
      <div className="absolute bottom-0 w-6 h-1.5 bg-black/40 rounded-[50%] blur-[1px]" />
      <div 
        className="relative z-10 w-full h-full drop-shadow-md"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
};

export default PixelSprite;
