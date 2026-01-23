import { Stats } from '../types';

/**
 * 神（ファミリア）の恩恵定義
 */
export interface GodDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  
  // パッシブボーナス（ステータス補正）
  passiveBonus: Partial<Stats> & {
    critRate?: number;    // クリティカル率 (%)
    dropRate?: number;    // ドロップ率倍率
    expRate?: number;     // 経験値倍率
  };

  // テーマカラー（UI用）
  color: string;
}

export const GODS: Record<string, GodDefinition> = {
  war_god: {
    id: 'war_god',
    name: 'アレス', // 仮名
    title: '戦いの神',
    description: '物理攻撃力とクリティカル率が上昇する。戦闘狂向け。',
    passiveBonus: {
      attack: 5,
      critRate: 5.0
    },
    color: '#ff4444'
  },
  smith_god: {
    id: 'smith_god',
    name: 'ヘパイストス', // 仮名
    title: '鍛冶の神',
    description: '装備のドロップ率が上がり、耐久度が減りにくくなる。',
    passiveBonus: {
      defense: 3,
      dropRate: 1.2
    },
    color: '#ffaa00'
  },
  wine_god: {
    id: 'wine_god',
    name: 'ディオニュソス', // 仮名
    title: '酒の神',
    description: 'ポーションの効果が上がり、状態異常に強くなる。',
    passiveBonus: {
      maxHp: 20
      // TODO: 状態異常耐性やポーション回復量アップの実装
    },
    color: '#aa44ff'
  }
};
