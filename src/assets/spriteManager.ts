import { pixelArtData } from './pixelData';

// キャッシュ用のストレージ
const spriteCache: Record<string, HTMLCanvasElement> = {};

/**
 * ドット絵データから画像（Canvas）を生成する
 * @param key アセットキー (例: 'player', 'goblin')
 */
export const getSprite = (key: string): HTMLCanvasElement | null => {
  // キャッシュにあればそれを返す
  if (spriteCache[key]) {
    return spriteCache[key];
  }

  // データ定義を取得
  let data = pixelArtData[key];
  
  // マッピング: データがない場合の代替アセット (フォールバック)
  if (!data) {
    if (key.includes('orc')) data = pixelArtData['orc'];
    else if (key.includes('boss') || key.includes('general') || key.includes('commander')) data = pixelArtData['boss'];
    else if (key.includes('ally') || key.includes('npc')) data = pixelArtData['ally'];
    // ジョブ関連のフォールバック
    else if (['warrior', 'mage', 'rogue', 'cleric', 'swordsman', 'archer'].some(job => key.includes(job))) {
        data = pixelArtData['player'];
    }
    // デフォルトフォールバック（キーが見つからない場合）
    else {
        // 何も返さないと非表示になるので、開発中は'slime'などを返しても良いが、null安全にする
        return null;
    }
  }

  const { palette, grid } = data;
  const height = grid.length;
  const width = grid[0].length; 

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
