import { Stats } from '../types';

/**
 * 職業（クラス）のID
 * 拡張する場合はここに追加してください
 */
export type JobId = 'swordsman' | 'warrior' | 'mage' | 'archer' | 'rogue' | 'cleric';

/**
 * 装備可能な武器種
 */
export type WeaponType = 'sword' | 'axe' | 'bow' | 'staff' | 'dagger' | 'mace';

/**
 * 職業の定義データ
 */
export interface JobDefinition {
  id: JobId;
  name: string;         // 職業名（表示用）
  description: string;  // 説明文
  
  // 基本ステータス（レベル1時点）
  baseStats: Pick<Stats, 'maxHp' | 'attack' | 'defense'>;
  
  // レベルアップ時の成長率（1レベルあたりの上昇量）
  growthRates: {
    maxHp: number;
    attack: number;
    defense: number;
  };

  // 習得可能なスキルIDのリスト
  learnableSkills: string[];

  // アセットキー（src/assets内のSVGとの紐付け用文字列）
  assetKey: string;

  // 装備可能な武器カテゴリ
  allowedWeapons: WeaponType[];
}
