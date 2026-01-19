import { CharacterActionSet } from "./types";

/**
 * 戦士 (Warrior) アセット定義
 * 仕様書に基づき、男性は筋肉質な上半身と赤髪、
 * 女性は金髪ロング、赤いマフラー、ビキニアーマーを表現。
 */
export const HERO_ASSETS: { male: CharacterActionSet; female: CharacterActionSet } = {
  male: {
    idle: `
      <g>
        <!-- 赤髪（ワイルド） -->
        <path d="M22,25 L32,5 L42,25 L45,15 L50,30 L15,30 Z" fill="#b91c1c" />
        <!-- 頭部（日焼け） -->
        <circle cx="32" cy="25" r="9" fill="#fca5a5" />
        <path d="M28,26 L36,26" stroke="#450a0a" stroke-width="1" /> <!-- 鋭い眼光 -->
        <!-- 筋肉質な上半身（露出） -->
        <path d="M22,35 Q32,32 42,35 L44,60 L20,60 Z" fill="#fca5a5" />
        <path d="M28,40 Q32,45 36,40" stroke="#ef4444" stroke-width="1" fill="none" /> <!-- 胸筋 -->
        <!-- レザー＆メタルアーマー（肩・腰） -->
        <rect x="18" y="35" width="8" height="6" rx="1" fill="#451a03" /> <!-- 肩あて -->
        <rect x="38" y="35" width="8" height="6" rx="1" fill="#451a03" />
        <rect x="20" y="55" width="24" height="10" fill="#451a03" /> <!-- 腰だれ -->
        <!-- 足 -->
        <rect x="23" y="65" width="8" height="25" rx="1" fill="#1e293b" />
        <rect x="33" y="65" width="8" height="25" rx="1" fill="#1e293b" />
        <!-- 巨大な戦斧（背負い） -->
        <path d="M45,20 L60,10 L64,35 L50,45 Z" fill="#475569" />
        <rect x="42" y="40" width="4" height="40" transform="rotate(-15, 42, 40)" fill="#78350f" />
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  },
  female: {
    idle: `
      <g>
        <!-- 金髪ロング -->
        <path d="M20,20 Q15,50 20,85 L44,85 Q49,50 44,20 Z" fill="#fde047" />
        <!-- 頭部 -->
        <circle cx="32" cy="22" r="10" fill="#fecaca" />
        <path d="M24,18 Q32,12 40,18 L42,25 L22,25 Z" fill="#fde047" />
        <!-- 赤いマフラー（風になびく） -->
        <path d="M25,32 L40,32 L55,25 L50,38 L32,38 Z" fill="#dc2626" />
        <!-- ビキニアーマー（メタル） -->
        <circle cx="27" cy="45" r="4" fill="#94a3b8" stroke="#cbd5e1" />
        <circle cx="37" cy="45" r="4" fill="#94a3b8" stroke="#cbd5e1" />
        <!-- 腹部（露出） -->
        <rect x="25" y="48" width="14" height="12" fill="#fecaca" />
        <!-- 腰・脚（ビキニボトムと露出） -->
        <path d="M24,60 L40,60 L38,68 L26,68 Z" fill="#94a3b8" />
        <rect x="24" y="68" width="7" height="15" fill="#fecaca" />
        <rect x="33" y="68" width="7" height="15" fill="#fecaca" />
        <!-- メタルブーツ -->
        <rect x="24" y="83" width="7" height="8" fill="#94a3b8" />
        <rect x="33" y="83" width="7" height="8" fill="#94a3b8" />
        <!-- 巨大な戦斧 -->
        <path d="M15,20 L5,10 L0,35 L10,45 Z" fill="#64748b" />
        <rect x="12" y="40" width="3" height="40" transform="rotate(15, 12, 40)" fill="#451a03" />
      </g>
    `,
    attack: "",
    hit: "",
    die: ""
  }
};
