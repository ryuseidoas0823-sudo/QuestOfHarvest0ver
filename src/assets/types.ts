/**
 * キャラクターのアクションごとのSVGアセット定義
 */
export interface CharacterActionSet {
  /** 待機状態 */
  idle: string;
  /** 攻撃時 */
  attack: string;
  /** 被弾時 */
  hit: string;
  /** 死亡時 */
  die: string;
}

/**
 * SVG文字列をData URL形式に変換するヘルパー関数
 * アセットファイル(monsters.ts, townspeople.ts等)で使用されます
 */
export const svgToUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};
