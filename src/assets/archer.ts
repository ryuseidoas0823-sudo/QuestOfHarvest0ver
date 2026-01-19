import { CharacterActionSet } from "./types";

/**
 * 狩人 (Archer) アセット定義
 * 仕様書に基づき、男性はダークグリーンのフードとマスク、
 * 女性はサイドポニーテールとアクティブな軽装を表現。
 */
export const HERO_ASSETS: { male: CharacterActionSet; female: CharacterActionSet } = {
  male: {
    idle: `
      <g>
        <!-- ダークグリーンのロングコート -->
        <path d="M20,35 L44,35 L48,85 L16,85 Z" fill="#064e3b" />
        <!-- フード -->
        <path d="M22,12 Q32,2 42,12 L45,35 L19,35 Z" fill="#065f46" />
        <!-- マスク（顔の一部） -->
        <rect x="24" y="24" width="16" height="8" fill="#1e293b" />
        <circle cx="28" cy="20" r="1.5" fill="#fbbf24" /> <!-- 鋭い瞳 -->
        <circle cx="36" cy="20" r="1.5" fill="#fbbf24" />
        <!-- 腕（レザーグローブ） -->
        <rect x="18" y="40" width="5" height="18" rx="1" fill="#451a03" />
        <rect x="41" y="40" width="5" height="18" rx="1" fill="#451a03" />
        <!-- 剛弓（背負い） -->
        <path d="M50,20 Q65,45 50,70" fill="none" stroke="#78350f" stroke-width="3" />
        <line x1="50" y1="20" x2="50" y2="70" stroke="#e2e8f0" stroke-width="0.5" />
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  },
  female: {
    idle: `
      <g>
        <!-- サイドポニーテール（右側） -->
        <path d="M42,15 Q58,15 52,40" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
        <!-- 頭部 -->
        <circle cx="32" cy="22" r="10" fill="#fecaca" />
        <path d="M24,18 Q32,10 40,18" fill="#78350f" />
        <circle cx="29" cy="22" r="1.5" fill="#166534" /> <!-- 翠の瞳 -->
        <circle cx="35" cy="22" r="1.5" fill="#166534" />
        <!-- アクティブな軽装（緑と白） -->
        <rect x="24" y="35" width="16" height="20" fill="#f8fafc" />
        <path d="M24,35 L40,35 L42,45 L22,45 Z" fill="#15803d" />
        <!-- ショートパンツ -->
        <rect x="22" y="55" width="20" height="10" fill="#1e293b" />
        <!-- 健康的な足 -->
        <rect x="24" y="65" width="7" height="20" fill="#fecaca" />
        <rect x="33" y="65" width="7" height="20" fill="#fecaca" />
        <!-- ブーツ（茶） -->
        <rect x="24" y="85" width="7" height="8" fill="#78350f" />
        <rect x="33" y="85" width="7" height="8" fill="#78350f" />
        <!-- 剛弓 -->
        <path d="M15,20 Q0,45 15,70" fill="none" stroke="#78350f" stroke-width="2" />
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  }
};
