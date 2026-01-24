import { pixelArtData } from './pixelData';

// キャッシュ用のストレージ
const spriteCache: Record<string, HTMLCanvasElement> = {};

/**
 * ドット絵データから画像（Canvas）を生成する
 * @param key アセットキー (例: 'player', 'goblin')
 * @param scale 拡大率 (デフォルトは描画時に調整するため1)
 */
export const getSprite = (key: string): HTMLCanvasElement | null => {
  // キャッシュにあればそれを返す
  if (spriteCache[key]) {
    return spriteCache[key];
  }

  // データ定義を取得
  // 定義がない場合はフォールバック（'boss'などカテゴリで代用するロジックを入れても良い）
  let data = pixelArtData[key];
  
  // マッピング: データがない場合の代替アセット
  if (!data) {
    if (key.includes('orc')) data = pixelArtData['orc'];
    else if (key.includes('boss') || key.includes('general') || key.includes('commander')) data = pixelArtData['boss'];
    else if (key.includes('ally') || key.includes('npc')) data = pixelArtData['ally'];
    else if (key.includes('skeleton')) data = pixelArtData['orc']; // 仮
    else return null;
  }

  const { palette, grid } = data;
  const height = grid.length;
  const width = grid[0].length; // カンマ削除済み前提

  // オフスクリーンキャンバスを作成
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;

  // ドットを描画
  for (let y = 0; y < height; y++) {
    const row = grid[y];
    for (let x = 0; x < width; x++) {
      const char = row[x];
      const color = palette[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // キャッシュに保存
  spriteCache[key] = canvas;
  return canvas;
};
