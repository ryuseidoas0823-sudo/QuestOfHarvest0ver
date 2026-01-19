import { svgToUrl } from './types';

/**
 * モンスターアセット定義
 * 低ランク(Slime, Fungus) / 高ランク(Dragon, DemonKnight)
 */
export const MONSTER_ASSETS = {
  Slime: {
    idle: svgToUrl(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,50 C12,20 52,20 52,50 C52,58 42,62 32,62 C22,62 12,58 12,50" fill="#4fc3f7" />
      <circle cx="26" cy="45" r="3" fill="#fff" />
      <circle cx="38" cy="45" r="3" fill="#fff" />
    </svg>`),
    damage: ""
  },
  Fungus: {
    idle: svgToUrl(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,40 h16 v20 h-16 Z" fill="#f5f5f5" />
      <path d="M10,40 C10,15 54,15 54,40 Z" fill="#ef5350" />
      <circle cx="28" cy="50" r="2" fill="#333" />
      <circle cx="36" cy="50" r="2" fill="#333" />
    </svg>`),
    damage: ""
  },
  Dragon: {
    idle: svgToUrl(`<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M48,40 L10,10 L30,50 L10,70 L48,60 Z" fill="#4a148c" stroke="#121212" />
      <path d="M48,40 L86,10 L66,50 L86,70 L48,60 Z" fill="#4a148c" stroke="#121212" />
      <rect x="32" y="30" width="32" height="50" fill="#311b92" />
      <rect x="38" y="12" width="20" height="20" fill="#311b92" />
      <rect x="42" y="20" width="4" height="4" fill="#ffeb3b" />
      <rect x="50" y="20" width="4" height="4" fill="#ffeb3b" />
    </svg>`),
    attack: ""
  },
  DemonKnight: {
    idle: svgToUrl(`<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,28 h40 v50 L32,90 L12,78 Z" fill="#212121" />
      <rect x="18" y="24" width="28" height="48" fill="#000" />
      <rect x="22" y="6" width="20" height="20" fill="#000" />
      <rect x="26" y="14" width="12" height="4" fill="#f44336" />
      <path d="M48,20 h6 v64 l-3,6 -3,-6 Z" fill="#424242" />
    </svg>`),
    damage: ""
  }
};
