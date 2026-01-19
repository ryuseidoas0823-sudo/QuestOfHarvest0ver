import { CharacterActionSet } from "./types";

/**
 * 魔術師 (Mage) アセット定義
 * 仕様書に基づき、男性は賢者の風格（白髭と帽子）、
 * 女性は神秘的なドレスと長い銀髪を表現。
 */
export const HERO_ASSETS: { male: CharacterActionSet; female: CharacterActionSet } = {
  male: {
    idle: `
      <g>
        <!-- 青と金のローブ -->
        <path d="M20,35 L44,35 L48,85 L16,85 Z" fill="#1e3a8a" />
        <path d="M32,35 L32,85" stroke="#fbbf24" stroke-width="1" />
        <!-- 白髭 -->
        <path d="M24,28 Q32,55 40,28 Z" fill="#f1f5f9" />
        <!-- 頭部（老人） -->
        <circle cx="32" cy="22" r="9" fill="#fecaca" />
        <!-- 魔術師の帽子 -->
        <path d="M15,20 L49,20 L32,0 Z" fill="#1e3a8a" />
        <rect x="12" y="18" width="40" height="3" rx="1" fill="#1e40af" />
        <!-- 水晶の杖 -->
        <rect x="45" y="30" width="3" height="55" fill="#451a03" />
        <circle cx="46.5" cy="28" r="5" fill="#60a5fa" opacity="0.8">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  },
  female: {
    idle: `
      <g>
        <!-- 長い銀髪 -->
        <path d="M18,20 Q10,50 18,85 L46,85 Q54,50 46,20 Z" fill="#cbd5e1" />
        <!-- 紫と黒のドレス -->
        <path d="M22,35 L42,35 L46,85 L18,85 Z" fill="#581c87" />
        <path d="M22,50 L42,50 L44,85 L20,85 Z" fill="#1e1b4b" />
        <!-- 頭部（美女） -->
        <circle cx="32" cy="22" r="10" fill="#fecaca" />
        <path d="M24,18 Q32,12 40,18" fill="#cbd5e1" />
        <circle cx="29" cy="22" r="1.5" fill="#d946ef" /> <!-- 紫の瞳 -->
        <circle cx="35" cy="22" r="1.5" fill="#d946ef" />
        <!-- 大きな魔女の帽子 -->
        <path d="M10,25 L54,25 L32,5 Z" fill="#3b0764" />
        <!-- 水晶の杖 -->
        <rect x="15" y="30" width="3" height="55" fill="#451a03" />
        <circle cx="16.5" cy="28" r="5" fill="#d946ef" opacity="0.8">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  }
};
