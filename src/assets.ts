/**
 * 超高解像度版(64x96) キャラクター・モンスターSVGアセット
 * 主人公：男性(Cool/精悍)、女性(Cute/Sexy/曲線美)
 * モンスター：低ランク(Kawaii/ぷにぷに)、高ランク(Epic/禍々しい)
 */
export const ASSETS_SVG = {
  // --- Swordsman (剣士) ---
  Swordsman_Male: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <!-- 影 -->
    <ellipse cx="32" cy="88" rx="20" ry="6" fill="rgba(0,0,0,0.2)" />
    <!-- マント -->
    <path d="M16 32 L8 48 L12 80 L32 84 L52 80 L56 48 L48 32 Z" fill="#1a237e" />
    <path d="M20 32 L14 50 L18 78 L32 80 L46 78 L50 50 L44 32 Z" fill="#283593" />
    <!-- 鎧(脚) -->
    <path d="M22 64h8v24h-8zm12 0h8v24h-8z" fill="#78909c" />
    <path d="M22 64h8v4h-8zm12 0h8v4h-8z" fill="#b0bec5" />
    <!-- 鎧(胴体) -->
    <path d="M18 32h28v36H18z" fill="#455a64" />
    <path d="M22 34h20v28H22z" fill="#90a4ae" />
    <path d="M22 34h20v4H22z" fill="#ffca28" /> <!-- 装飾 -->
    <path d="M28 42h8v4h-8z" fill="#cfd8dc" /> <!-- 胸当てのハイライト -->
    <!-- 腕 -->
    <path d="M14 34h4v24h-4zm46 34h4v24h-4z" fill="#90a4ae" />
    <!-- 頭部 -->
    <path d="M24 10h16v18H24z" fill="#ffe0b2" />
    <path d="M22 6h20v14H22z" fill="#cfd8dc" /> <!-- 銀髪 -->
    <path d="M22 14 L26 6 L38 6 L42 14 Z" fill="#eceff1" />
    <path d="M28 18h3v2h-3zm6 0h3v2h-3z" fill="#0d47a1" /> <!-- 鋭い瞳 -->
    <!-- 聖剣 -->
    <path d="M48 20h4v48h-4z" fill="#eceff1" />
    <path d="M46 60h8v4h-8z" fill="#5d4037" />
    <circle cx="50" cy="66" r="3" fill="#ffd700" />
  </svg>`,

  Swordsman_Female: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
    <!-- 髪(ロングポニーテール) -->
    <path d="M22 8h20v24H22z" fill="#ffb300" />
    <path d="M42 20h12v40 L48 50 L42 55 Z" fill="#ffa000" />
    <path d="M30 4h4v6h-4z" fill="#d32f2f" /> <!-- リボン -->
    <!-- 顔 -->
    <path d="M25 12h14v18H25z" fill="#fff3e0" />
    <path d="M28 20h3v3h-3zm6 0h3v3h-3z" fill="#333" />
    <path d="M30 25h4v1H30z" fill="#ff8a80" /> <!-- チーク -->
    <!-- 胴体(キュートなアーマー) -->
    <path d="M22 32h20v8H22z" fill="#1e88e5" />
    <path d="M24 40h16v10H24z" fill="#fff" /> <!-- インナー -->
    <path d="M20 50h24v12H20z" fill="#1565c0" /> <!-- スカート -->
    <path d="M20 50h24v2H20z" fill="#ffd700" />
    <!-- 脚(ニーハイ) -->
    <path d="M24 62h6v26h-6zm10 0h6v26h-6z" fill="#212121" />
    <path d="M24 62h6v6h-6zm10 0h6v6h-6z" fill="#fff3e0" /> <!-- 絶対領域 -->
    <!-- 靴 -->
    <path d="M22 84h10v4h-10zm10 0h10v4h-10z" fill="#424242" />
  </svg>`,

  // --- Warrior (戦士) ---
  Warrior_Male: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="24" ry="7" fill="rgba(0,0,0,0.25)" />
    <!-- 赤髪 -->
    <path d="M20 4h24v16H20z" fill="#b71c1c" />
    <path d="M22 2h20v4H22z" fill="#f44336" />
    <!-- 筋肉質な肉体 -->
    <path d="M22 20h20v14H22z" fill="#ffccaa" />
    <path d="M16 34h32v16H16z" fill="#ffccaa" /> <!-- 胸筋ライン -->
    <path d="M28 38h8v2h-8zm0 4h8v2h-8z" fill="#e0a080" /> <!-- 腹筋 -->
    <!-- レザーアーマー -->
    <path d="M20 44h24v12H20z" fill="#3e2723" />
    <path d="M16 34h4v10h-4zm28 0h4v10h-4z" fill="#5d4037" />
    <!-- 脚 -->
    <path d="M22 56h8v32h-8zm12 0h8v32h-8z" fill="#212121" />
    <!-- 巨大な戦斧 -->
    <path d="M48 10h12v20h-12z" fill="#757575" />
    <path d="M48 18h12v4h-12z" fill="#bdbdbd" />
    <path d="M52 30h4v50h-4z" fill="#4e342e" />
  </svg>`,

  Warrior_Female: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="20" ry="5" fill="rgba(0,0,0,0.2)" />
    <!-- 金髪ロング -->
    <path d="M18 10h28v60H18z" fill="#fdd835" />
    <path d="M22 4h20v10H22z" fill="#fff176" />
    <!-- 肌(セクシーな曲線) -->
    <path d="M26 14h12v12H26z" fill="#ffdbbd" />
    <path d="M20 26h24v10H20z" fill="#ffdbbd" />
    <path d="M22 30h8v4h-8zm12 0h8v4h-8z" fill="#90a4ae" /> <!-- ビキニトップ -->
    <path d="M28 36h8v16H28z" fill="#ffdbbd" /> <!-- くびれ -->
    <path d="M24 52h16v8H24z" fill="#90a4ae" /> <!-- ボトム -->
    <!-- 脚(美脚ライン) -->
    <path d="M24 60h7v28h-7zm9 0h7v28h-7z" fill="#ffdbbd" />
    <path d="M22 80h11v8h-11zm9 0h11v8h-11z" fill="#b71c1c" />
    <!-- マフラー -->
    <path d="M20 22h24v6H20z" fill="#d32f2f" />
    <path d="M42 28 L50 60 L44 60 L40 28 Z" fill="#b71c1c" />
  </svg>`,

  // --- Archer (狩人) ---
  Archer_Male: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="18" ry="5" fill="rgba(0,0,0,0.2)" />
    <!-- フードとマスク -->
    <path d="M20 6h24v22H20z" fill="#1b5e20" />
    <path d="M22 20h20v12H22z" fill="#388e3c" /> <!-- マスク -->
    <path d="M26 16h3v2h-3zm9 0h3v2h-3z" fill="#000" />
    <!-- ハンターコート -->
    <path d="M18 32h28v40H18z" fill="#1b5e20" />
    <path d="M31 32h2v40h-2z" fill="#ffd700" opacity="0.3" /> <!-- センターライン -->
    <!-- 脚 -->
    <path d="M24 72h7v16h-7zm9 0h7v16h-7z" fill="#3e2723" />
    <!-- 剛弓 -->
    <path d="M52 20 C60 35 60 65 52 80" fill="none" stroke="#8d6e63" stroke-width="4" />
    <path d="M52 20 L52 80" fill="none" stroke="#e0e0e0" stroke-width="1" />
  </svg>`,

  Archer_Female: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="18" ry="5" fill="rgba(0,0,0,0.15)" />
    <!-- サイドポニーテール -->
    <path d="M22 8h20v16H22z" fill="#6d4c41" />
    <path d="M12 14h10v30 L16 30 L12 14 Z" fill="#5d4037" />
    <!-- 顔 -->
    <path d="M26 14h12v16H26z" fill="#ffdbbd" />
    <path d="M29 22h2v2h-2zm4 0h2v2h-2z" fill="#000" />
    <!-- アクティブウェア -->
    <path d="M22 30h20v10H22z" fill="#4caf50" />
    <path d="M24 40h16v12H24z" fill="#ffdbbd" /> <!-- 露出した腹部 -->
    <path d="M22 52h20v8H22z" fill="#2e7d32" /> <!-- 短パン -->
    <!-- 脚 -->
    <path d="M24 60h7v28h-7zm9 0h7v28h-7z" fill="#ffdbbd" />
    <path d="M22 75h11v13h-11zm9 0h11v13h-11z" fill="#4e342e" /> <!-- ブーツ -->
  </svg>`,

  // --- Mage (魔術師) ---
  Mage_Male: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="20" ry="6" fill="rgba(0,0,0,0.2)" />
    <!-- 魔導帽 -->
    <path d="M24 2h16v8H24z" fill="#311b92" />
    <path d="M12 10h40v4H12z" fill="#512da8" />
    <!-- 顔 -->
    <path d="M26 14h12v16H26z" fill="#ffe0b2" />
    <path d="M28 22h8v2h-8z" fill="#000" opacity="0.4" /> <!-- インテリ眼鏡 -->
    <!-- 魔導衣 -->
    <path d="M16 30h32v54H16z" fill="#311b92" />
    <path d="M20 30h24v54H20z" fill="#4527a0" />
    <path d="M31 30h2v54h-2z" fill="#ffd700" />
    <!-- 賢者の杖 -->
    <path d="M52 20h4v68h-4z" fill="#5d4037" />
    <path d="M50 10h8v10h-8z" fill="#00e5ff" />
    <circle cx="54" cy="15" r="6" fill="#00e5ff" opacity="0.6">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>`,

  Mage_Female: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
    <!-- ウィッチハット -->
    <path d="M28 2h8v10H28z" fill="#880e4f" />
    <path d="M10 12h44v4H10z" fill="#ad1457" />
    <!-- 桃色ロング髪 -->
    <path d="M18 16h28v60H18z" fill="#f48fb1" />
    <!-- セクシーローブ -->
    <path d="M26 16h12v12H26z" fill="#ffdbbd" />
    <path d="M20 28h24v8H20z" fill="#ffdbbd" /> <!-- デコルテ -->
    <path d="M22 36h20v48H22z" fill="#880e4f" />
    <path d="M34 50h8v34h-8z" fill="#ffdbbd" /> <!-- 脚のスリット見せ -->
    <path d="M22 36h20v4H22z" fill="#4a148c" />
    <!-- 宝石の杖 -->
    <path d="M52 20h4v68h-4z" fill="#5d4037" />
    <circle cx="54" cy="14" r="7" fill="#ea80fc" />
  </svg>`,

  // --- Monster: Low Rank (Kawaii/Weak) ---
  Monster_Slime: `
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.1)" />
    <path d="M12 50 C12 20 52 20 52 50 C52 58 42 62 32 62 C22 62 12 58 12 50" fill="#4fc3f7" />
    <path d="M20 40 C20 25 44 25 44 40 Z" fill="#81d4fa" opacity="0.6" />
    <!-- 顔 -->
    <circle cx="26" cy="45" r="3" fill="#fff" />
    <circle cx="38" cy="45" r="3" fill="#fff" />
    <path d="M28 52 Q32 56 36 52" fill="none" stroke="#fff" stroke-width="2" />
    <circle cx="20" cy="48" r="4" fill="#ffab91" opacity="0.4" /> <!-- ほっぺ -->
    <circle cx="44" cy="48" r="4" fill="#ffab91" opacity="0.4" />
  </svg>`,

  Monster_Fungus: `
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
    <path d="M24 40h16v20h-16z" fill="#f5f5f5" />
    <!-- 毒々しくも可愛い傘 -->
    <path d="M10 40 C10 15 54 15 54 40 Z" fill="#ef5350" />
    <circle cx="20" cy="28" r="5" fill="#fff" opacity="0.5" />
    <circle cx="42" cy="30" r="4" fill="#fff" opacity="0.5" />
    <circle cx="32" cy="22" r="3" fill="#fff" opacity="0.5" />
    <!-- 顔 -->
    <circle cx="28" cy="50" r="2" fill="#333" />
    <circle cx="36" cy="50" r="2" fill="#333" />
  </svg>`,

  // --- Monster: High Rank (Epic/Strong) ---
  Monster_Dragon: `
  <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="48" cy="88" rx="32" ry="8" fill="rgba(0,0,0,0.2)" />
    <!-- 巨大な翼 -->
    <path d="M48 40 L10 10 L30 50 L10 70 L48 60 Z" fill="#4a148c" stroke="#121212" />
    <path d="M48 40 L86 10 L66 50 L86 70 L48 60 Z" fill="#4a148c" stroke="#121212" />
    <!-- 鱗の質感 -->
    <path d="M32 30h32v50H32z" fill="#311b92" />
    <path d="M36 34h24v42H36z" fill="#4527a0" />
    <path d="M40 40h4v4h-4zm8 8h4v4h-4zm-8 8h4v4h-4z" fill="#7b1fa2" />
    <!-- 頭部と角 -->
    <path d="M40 10l-4-6h4l4 6zm12 0l4-6h-4l-4 6z" fill="#212121" />
    <path d="M38 12h20v20H38z" fill="#311b92" />
    <path d="M42 20h4v4h-4zm8 0h4v4h-4z" fill="#ffeb3b" /> <!-- 黄金の瞳 -->
    <path d="M40 28h16v4h-16z" fill="#1a237e" />
  </svg>`,

  Monster_DemonKnight: `
  <svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="88" rx="24" ry="7" fill="rgba(0,0,0,0.3)" />
    <!-- ボロボロのマント -->
    <path d="M12 28h40v50 L32 90 L12 78 Z" fill="#212121" />
    <path d="M12 28h40v8H12z" fill="#b71c1c" />
    <!-- 漆黒の鎧 -->
    <path d="M18 24h28v48H18z" fill="#000" />
    <path d="M22 28h20v40H22z" fill="#263238" />
    <path d="M31 28h2v40h-2z" fill="#f44336" opacity="0.4" />
    <!-- 髑髏の兜 -->
    <path d="M22 6h20v20H22z" fill="#000" />
    <path d="M26 14h12v4H26z" fill="#f44336" /> <!-- 殺意の眼光 -->
    <!-- 魔剣エクリプス -->
    <path d="M48 20h6v64l-3 6-3-6z" fill="#424242" />
    <path d="M46 70h10v6H46z" fill="#212121" />
    <circle cx="51" cy="73" r="3" fill="#f44336" />
  </svg>`
};

export const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());
