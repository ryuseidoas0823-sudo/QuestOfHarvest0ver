import { CharacterActionSet } from "./types";

/**
 * 剣士 (Swordsman) アセット定義
 * 仕様書に基づき、男性は銀のフルプレートと青マント、
 * 女性は青の軽装アーマーと赤リボンのポニーテールを表現。
 */
export const HERO_ASSETS: { male: CharacterActionSet; female: CharacterActionSet } = {
  male: {
    idle: `
      <g>
        <!-- 青いなびくマント -->
        <path d="M22,35 Q10,50 15,85 L45,85 Q55,50 42,35 Z" fill="#2563eb" />
        <!-- 銀のフルプレート（体） -->
        <rect x="22" y="35" width="20" height="25" rx="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" />
        <path d="M22,45 L42,45" stroke="#94a3b8" stroke-width="1" />
        <!-- 金の装飾（胸部） -->
        <circle cx="32" cy="42" r="3" fill="#fbbf24" />
        <!-- 腕（篭手） -->
        <rect x="18" y="38" width="5" height="15" rx="1" fill="#cbd5e1" />
        <rect x="41" y="38" width="5" height="15" rx="1" fill="#cbd5e1" />
        <!-- 足（グリーヴ） -->
        <rect x="23" y="60" width="8" height="25" rx="2" fill="#94a3b8" />
        <rect x="33" y="60" width="8" height="25" rx="2" fill="#94a3b8" />
        <!-- 頭部（兜） -->
        <path d="M24,15 Q24,5 32,5 Q40,5 40,15 L40,35 L24,35 Z" fill="#cbd5e1" />
        <rect x="26" y="20" width="12" height="4" fill="#1e293b" /> <!-- バイザー -->
        <path d="M32,5 L32,12" stroke="#fbbf24" stroke-width="2" /> <!-- 兜の飾り -->
        <!-- 聖剣（背負い） -->
        <path d="M45,20 L50,15 L55,55 L50,60 Z" fill="#94a3b8" stroke="#60a5fa" />
      </g>
    `,
    attack: "", // 共通ロジックで idle を使用
    hit: "",
    die: ""
  },
  female: {
    idle: `
      <g>
        <!-- 赤いリボン -->
        <path d="M45,15 L55,10 L52,25 Z" fill="#ef4444" />
        <!-- ポニーテール -->
        <path d="M42,18 Q55,20 50,45" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" />
        <!-- 頭部（素顔） -->
        <circle cx="32" cy="22" r="10" fill="#fecaca" />
        <path d="M24,18 Q32,10 40,18" fill="#fbbf24" /> <!-- 前髪 -->
        <circle cx="29" cy="22" r="1.5" fill="#2563eb" /> <!-- 瞳 -->
        <circle cx="35" cy="22" r="1.5" fill="#2563eb" />
        <!-- 青の軽量アーマー -->
        <path d="M24,35 L40,35 L42,55 L22,55 Z" fill="#3b82f6" />
        <path d="M24,35 Q32,32 40,35" stroke="#fbbf24" stroke-width="1" fill="none" />
        <!-- ミニスカート -->
        <path d="M22,55 L42,55 L45,65 L19,65 Z" fill="#1e40af" />
        <!-- 足（ニーソックス＆ブーツ） -->
        <rect x="24" y="65" width="7" height="15" fill="#fecaca" />
        <rect x="33" y="65" width="7" height="15" fill="#fecaca" />
        <rect x="24" y="80" width="7" height="10" fill="#1e3a8a" />
        <rect x="33" y="80" width="7" height="10" fill="#1e3a8a" />
        <!-- 聖剣 -->
        <path d="M15,20 L10,15 L5,60 L10,65 Z" fill="#e2e8f0" stroke="#60a5fa" />
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  }
};
