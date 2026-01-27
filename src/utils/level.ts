import { PlayerState } from '../types/gameState';

/**
 * 次のレベルに必要な経験値を計算する
 * 曲線: レベルの2乗 * 50 + 100
 * Lv1 -> 150
 * Lv2 -> 300
 * Lv10 -> 5100
 */
export const calculateNextExp = (level: number): number => {
  return Math.floor(Math.pow(level, 2) * 50 + 100);
};

/**
 * 経験値獲得とレベルアップ処理
 * @param player 現在のプレイヤー状態
 * @param expGain 獲得経験値
 */
export const gainExperience = (player: PlayerState, expGain: number): { 
  updatedPlayer: PlayerState; 
  leveledUp: boolean;
  statGrowth?: Partial<PlayerState['stats']>;
} => {
  // プレイヤーオブジェクトのディープコピー（statsもコピー）
  const updatedPlayer = { 
    ...player, 
    stats: { ...player.stats } 
  };
  
  updatedPlayer.exp += expGain;
  let leveledUp = false;
  
  // 累計成長値の記録用（複数レベルアップ対応）
  const totalGrowth = {
    maxHp: 0, maxMp: 0, str: 0, vit: 0, dex: 0, agi: 0, mag: 0, luc: 0
  };

  // 経験値が次のレベルの必要量を超えている限りループ
  while (updatedPlayer.exp >= updatedPlayer.nextExp) {
    leveledUp = true;
    updatedPlayer.exp -= updatedPlayer.nextExp;
    updatedPlayer.level += 1;
    updatedPlayer.nextExp = calculateNextExp(updatedPlayer.level);

    // ステータス成長（ランダム幅を持たせる）
    // アビリティ（基礎能力）の上昇をシミュレート
    const growth = {
        maxHp: Math.floor(Math.random() * 15) + 10,
        maxMp: Math.floor(Math.random() * 8) + 5,
        str: Math.floor(Math.random() * 4) + 1,
        vit: Math.floor(Math.random() * 4) + 1,
        dex: Math.floor(Math.random() * 3) + 1,
        agi: Math.floor(Math.random() * 3) + 1,
        mag: Math.floor(Math.random() * 3) + 1,
        luc: Math.random() < 0.15 ? 1 : 0
    };

    // statsオブジェクトの更新
    updatedPlayer.stats.maxHp += growth.maxHp;
    updatedPlayer.stats.maxMp += growth.maxMp;
    updatedPlayer.stats.str += growth.str;
    updatedPlayer.stats.vit += growth.vit;
    updatedPlayer.stats.dex += growth.dex;
    updatedPlayer.stats.agi += growth.agi;
    updatedPlayer.stats.mag += growth.mag;
    updatedPlayer.stats.luc += growth.luc;

    // PlayerState直下のプロパティも同期（PlayerState型定義との整合性）
    updatedPlayer.maxHp = updatedPlayer.stats.maxHp;
    updatedPlayer.maxMp = updatedPlayer.stats.maxMp;
    updatedPlayer.str = updatedPlayer.stats.str;
    updatedPlayer.vit = updatedPlayer.stats.vit;
    updatedPlayer.dex = updatedPlayer.stats.dex;
    updatedPlayer.agi = updatedPlayer.stats.agi;
    updatedPlayer.mag = updatedPlayer.stats.mag;
    updatedPlayer.luc = updatedPlayer.stats.luc;

    // ログ表示用に加算
    totalGrowth.maxHp += growth.maxHp;
    totalGrowth.maxMp += growth.maxMp;
    totalGrowth.str += growth.str;
    totalGrowth.vit += growth.vit;
    totalGrowth.dex += growth.dex;
    totalGrowth.agi += growth.agi;
    totalGrowth.mag += growth.mag;
    totalGrowth.luc += growth.luc;
  }

  if (leveledUp) {
    // レベルアップ時は全回復（ステイタス更新の恩恵）
    updatedPlayer.hp = updatedPlayer.maxHp;
    updatedPlayer.mp = updatedPlayer.maxMp;
    updatedPlayer.stats.hp = updatedPlayer.maxHp;
    updatedPlayer.stats.mp = updatedPlayer.maxMp;
  }

  return { 
    updatedPlayer, 
    leveledUp, 
    statGrowth: leveledUp ? totalGrowth : undefined 
  };
};
