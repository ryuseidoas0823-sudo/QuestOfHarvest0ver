/**
 * キャラクターのアクションごとのSVGアセット定義
 * 仕様書に合わせ、move（移動）を追加
 */
export interface CharacterActionSet {
  idle: string;
  move: string;   // 追加
  attack: string;
  hit: string;
  die: string;
}

export const svgToUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};
