import { pixelArtData } from './pixelData';

// キャッシュ用のストレージ
const spriteCache: Record<string, HTMLCanvasElement> = {};

/**
 * ドット絵データまたはSVGから画像（Canvas）を生成する
 * @param key アセットキー (例: 'player', 'goblin')
 */
export const getSprite = (key: string): HTMLCanvasElement | null => {
  // キャッシュにあればそれを返す
  if (spriteCache[key]) {
    return spriteCache[key];
  }

  // データ定義を取得
  let data = pixelArtData[key];
  
  // フォールバックロジック
  if (!data) {
    if (key.includes('orc')) data = pixelArtData['orc'];
    else if (key.includes('boss') || key.includes('general') || key.includes('commander')) data = pixelArtData['boss'];
    else if (key.includes('ally') || key.includes('npc')) data = pixelArtData['ally'];
    // ジョブ関連のフォールバック (SVGデータがあればそちらを優先したいので、キー名を合わせるのがベストだが念のため)
    else if (['warrior', 'mage', 'rogue', 'cleric', 'swordsman', 'archer'].some(job => key.includes(job))) {
        // ここに来るということは個別SVGが見つかっていない
        data = pixelArtData['hero_warrior']; // デフォルト
    }
    else {
        return null;
    }
  }

  // Canvas作成
  const canvas = document.createElement('canvas');
  // デフォルトサイズは32x32 (高解像度化)
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // --- SVG描画処理 ---
  if (data.svg) {
    const img = new Image();
    const svgBlob = new Blob([data.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
    };
    img.src = url;
    
    // 非同期ロードだが、初回は空のCanvasを返し、ロード完了後に描画される
    // Reactの再描画サイクルで更新されることを期待するか、
    // ゲームループが毎フレーム描画しているので、次フレームから表示される
    spriteCache[key] = canvas;
    return canvas;
  }

  // --- ドット絵描画処理 (Legacy) ---
  if (data.grid && data.palette) {
    const { palette, grid } = data;
    const height = grid.length;
    const width = grid[0].split(',').length > 1 ? grid[0].split(',').length : grid[0].length; // カンマ区切り対応
    
    // グリッドサイズに合わせてCanvasサイズ調整（拡大描画用）
    // 元データが16x16なら2倍して32x32にするなど
    const scale = canvas.width / width;

    // ドットを描画
    for (let y = 0; y < height; y++) {
      // カンマ区切りの場合は配列化、そうでなければ文字列そのまま
      const row = grid[y].includes(',') ? grid[y].split(',') : grid[y];
      
      for (let x = 0; x < width; x++) {
        const char = row[x];
        const color = palette[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    spriteCache[key] = canvas;
    return canvas;
  }

  return null;
};
