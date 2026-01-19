/**
 * キャラクター・アセットの共通型定義
 */

export interface CharacterActionSet {
  idle: string;    // 待機（基本）
  move: string;    // 移動
  attack: string;  // 攻撃
  damage: string;  // 被ダメージ
  death: string;   // 死亡
}

export interface JobAssets {
  male: CharacterActionSet;
  female: CharacterActionSet;
}

/**
 * SVGをURL形式に変換するヘルパー関数
 */
export const svgToUrl = (s: string) => 
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());
