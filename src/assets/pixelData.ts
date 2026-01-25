// キャラクター、モンスター、マップチップのSVG/CSSデータ定義

export const TILE_PATTERNS = {
  // 床：石畳風
  floor: `
    background-color: #2a2a2a;
    background-image: 
      linear-gradient(335deg, rgba(0,0,0,0.3) 23px, transparent 23px),
      linear-gradient(155deg, rgba(30,30,30,0.3) 23px, transparent 23px),
      linear-gradient(335deg, rgba(0,0,0,0.3) 23px, transparent 23px),
      linear-gradient(155deg, rgba(30,30,30,0.3) 23px, transparent 23px);
    background-size: 58px 58px;
    background-position: 0px 2px, 4px 35px, 29px 31px, 34px 6px;
  `,
  // 壁：レンガ風
  wall: `
    background-color: #3d342b;
    background-image: 
      linear-gradient(335deg, rgba(20,20,20,0.4) 23px, transparent 23px),
      linear-gradient(155deg, rgba(40,30,20,0.4) 23px, transparent 23px);
    background-size: 16px 16px;
    box-shadow: inset 0 0 10px #000;
    border-bottom: 4px solid #1a1612;
  `,
  // 通路：暗い土
  corridor: `
    background-color: #1a1a1a;
    background-image: radial-gradient(#222 15%, transparent 16%), radial-gradient(#222 15%, transparent 16%);
    background-size: 16px 16px;
    background-position: 0 0, 8px 8px;
  `,
  // 階段
  stairs: `
    background: repeating-linear-gradient(
      45deg,
      #444,
      #444 10px,
      #222 10px,
      #222 20px
    );
    border: 2px solid #666;
  `
};

// SVGパス定義（簡易版ベクタードット）
export const CHAR_SVG = {
  // プレイヤー：剣士（青い鎧、マント）
  swordsman: (color: string = '#3b82f6') => `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- マント -->
      <path d="M8 12 L24 12 L26 28 L6 28 Z" fill="#1e3a8a" />
      <!-- 体/鎧 -->
      <rect x="10" y="10" width="12" height="14" rx="2" fill="${color}" />
      <path d="M10 10 L22 24" stroke="white" stroke-width="1" opacity="0.5"/>
      <!-- 頭 -->
      <circle cx="16" cy="8" r="5" fill="#fca5a5" />
      <path d="M11 5 Q16 2 21 5 L21 9 Q16 7 11 9 Z" fill="#eab308" /> <!-- 髪 -->
      <!-- 剣 -->
      <path d="M24 14 L30 8 L32 10 L26 16 Z" fill="#9ca3af" />
      <path d="M25 15 L27 17" stroke="#4b5563" stroke-width="2" />
    </svg>
  `,
  // プレイヤー：戦士（赤い重装備）
  warrior: (color: string = '#ef4444') => `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="9" width="16" height="16" rx="4" fill="${color}" />
      <circle cx="16" cy="8" r="5" fill="#fca5a5" />
      <rect x="6" y="12" width="4" height="10" fill="#7f1d1d" /> <!-- 肩 -->
      <rect x="22" y="12" width="4" height="10" fill="#7f1d1d" />
      <!-- 斧 -->
      <path d="M26 6 L32 6 L30 14 L24 14 Z" fill="#94a3b8" />
      <rect x="27" y="14" width="2" height="10" fill="#5c4033" />
    </svg>
  `,
  // 敵：スライム
  slime: `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 24 Q6 10 16 10 Q26 10 26 24 L6 24 Z" fill="#3b82f6" opacity="0.8" />
      <circle cx="12" cy="18" r="2" fill="white" />
      <circle cx="20" cy="18" r="2" fill="white" />
      <path d="M8 24 Q16 28 24 24" stroke="#1e40af" stroke-width="1" fill="none"/>
    </svg>
  `,
  // 敵：ゴブリン
  goblin: `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="12" r="6" fill="#4ade80" /> <!-- 顔 -->
      <path d="M8 10 L6 6 L10 8 Z" fill="#4ade80" /> <!-- 耳 -->
      <path d="M24 10 L26 6 L22 8 Z" fill="#4ade80" />
      <rect x="12" y="18" width="8" height="8" fill="#78350f" /> <!-- 服 -->
      <circle cx="14" cy="11" r="1" fill="red" />
      <circle cx="18" cy="11" r="1" fill="red" />
      <path d="M20 18 L26 14 L24 22 Z" fill="#9ca3af" /> <!-- 短剣 -->
    </svg>
  `,
  // 敵：スケルトン
  skeleton: `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="10" r="5" fill="#e5e7eb" />
      <rect x="15" y="15" width="2" height="10" fill="#e5e7eb" />
      <line x1="12" y1="18" x2="20" y2="18" stroke="#e5e7eb" stroke-width="2" />
      <line x1="12" y1="22" x2="20" y2="22" stroke="#e5e7eb" stroke-width="2" />
      <circle cx="14" cy="9" r="1.5" fill="#000" />
      <circle cx="18" cy="9" r="1.5" fill="#000" />
    </svg>
  `,
  // デフォルト
  unknown: `
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="10" fill="#666" />
      <text x="16" y="20" font-size="10" text-anchor="middle" fill="white">?</text>
    </svg>
  `
};
