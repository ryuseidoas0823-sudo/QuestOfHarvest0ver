/**
 * キャラクターのアクションごとのSVGアセット定義
 */
export interface CharacterActionSet {
  /** 待機状態 */
  idle: string;
  /** 攻撃時 */
  attack: string;
  /** 被弾時（ヒット）のアクションを追加 */
  hit: string;
  /** 死亡時のアクションを追加 */
  die: string;
}
