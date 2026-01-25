import React from 'react';
import { CHAR_SVG } from '../assets/pixelData';

interface PixelSpriteProps {
  type: 'player' | 'enemy' | 'item' | 'npc';
  jobId?: string; // プレイヤーの場合
  data?: any;     // 敵データ等
  state?: 'idle' | 'move' | 'attack' | 'damage';
  scale?: number;
}

const PixelSprite: React.FC<PixelSpriteProps> = ({ 
  type, 
  jobId = 'swordsman', 
  data, 
  state = 'idle',
  scale = 1
}) => {
  // SVGコンテンツの取得
  let svgContent = '';
  
  if (type === 'player') {
    switch (jobId) {
      case 'warrior':
        svgContent = CHAR_SVG.warrior();
        break;
      case 'archer':
        // 仮：剣士の色違い
        svgContent = CHAR_SVG.swordsman('#15803d'); 
        break;
      case 'mage':
        // 仮：剣士の色違い
        svgContent = CHAR_SVG.swordsman('#7e22ce');
        break;
      case 'swordsman':
      default:
        svgContent = CHAR_SVG.swordsman();
        break;
    }
  } else if (type === 'enemy') {
    // 敵IDに応じたSVGを取得（簡易判定）
    const name = data?.name || '';
    if (name.includes('スライム')) svgContent = CHAR_SVG.slime;
    else if (name.includes('ゴブリン')) svgContent = CHAR_SVG.goblin;
    else if (name.includes('ガイコツ') || name.includes('スケルトン')) svgContent = CHAR_SVG.skeleton;
    else svgContent = CHAR_SVG.unknown;
  }

  // アニメーションクラスの決定
  const getAnimationClass = () => {
    switch (state) {
      case 'attack': return 'animate-bounce'; // 簡易的な攻撃モーション
      case 'damage': return 'animate-pulse bg-red-500/50 rounded-full';
      case 'move': return 'animate-pulse';
      case 'idle': default: return 'animate-[bounce_3s_infinite]'; // ゆっくり上下
    }
  };

  return (
    <div 
      className={`relative w-8 h-8 flex items-center justify-center transition-transform duration-200 ${getAnimationClass()}`}
      style={{ transform: `scale(${scale})` }}
    >
      {/* 影 */}
      <div className="absolute bottom-0 w-6 h-1.5 bg-black/40 rounded-[50%] blur-[1px]" />
      
      {/* キャラクター本体 (SVG文字列を注入) */}
      <div 
        className="relative z-10 w-full h-full drop-shadow-md"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
};

export default PixelSprite;
