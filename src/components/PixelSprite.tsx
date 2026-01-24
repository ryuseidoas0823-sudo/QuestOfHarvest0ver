import React, { useEffect, useRef } from 'react';
import { getSprite } from '../assets/spriteManager';

interface PixelSpriteProps {
  spriteKey: string; // 表示したいアセットのキー（'player', 'slime'など）
  size?: number;     // 表示サイズ（px）
  className?: string; // 追加のCSSクラス
}

export const PixelSprite: React.FC<PixelSpriteProps> = ({ spriteKey, size = 40, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // スプライトを取得
    // 取得できない場合は ? マークなどを描画しても良いが、ここでは何も描画しない
    const sprite = getSprite(spriteKey) || getSprite('player'); // 最悪playerを表示

    if (sprite) {
      // 鮮明に描画するための設定
      ctx.imageSmoothingEnabled = false;
      
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 画像を描画
      ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
    } else {
        // 画像がない場合
        ctx.fillStyle = '#666';
        ctx.fillRect(0,0, canvas.width, canvas.height);
    }
  }, [spriteKey, size]);

  // keyが変わったときに再描画するため、key属性を付与
  return (
    <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className={`inline-block ${className}`}
        style={{ imageRendering: 'pixelated' }} // CSSでもドット絵補間を無効化
    />
  );
};
