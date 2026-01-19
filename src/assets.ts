/**
 * キャラクターのSVGアセット定義
 * 男性はカッコよく、女性は可愛らしさ・セクシーさを強調したドット構成
 */
export const ASSETS_SVG = {
  // --- Swordsman (剣士) ---
  Swordsman_Male: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <!-- 影 -->
    <path d="M4 22h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <!-- 髪・兜 -->
    <path d="M5 2h6v4H5z" fill="#90a4ae" />
    <path d="M6 1h4v1H6z" fill="#cfd8dc" />
    <!-- 肌 -->
    <path d="M6 5h4v3H6z" fill="#ffccaa" />
    <path d="M6 6h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <!-- 鎧(胴) -->
    <path d="M4 8h8v6H4z" fill="#1565c0" />
    <path d="M6 8h4v6H6z" fill="#1e88e5" />
    <!-- マント -->
    <path d="M3 8h1v8h1v-7h-1v-1z" fill="#b71c1c" />
    <!-- 脚 -->
    <path d="M5 14h2v6H5zm4 0h2v6H9z" fill="#37474f" />
    <!-- 足先 -->
    <path d="M5 20h2v1H5zm4 0h2v1H9z" fill="#212121" />
    <!-- 剣 -->
    <path d="M12 8h1v8h-1z" fill="#bdbdbd" />
    <path d="M11 8h3v1h-3z" fill="#5d4037" />
  </svg>`,

  Swordsman_Female: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <!-- 髪 (ポニーテール) -->
    <path d="M5 2h7v6H5z" fill="#ffab00" />
    <path d="M11 6h3v4h-1V7h-2z" fill="#ffab00" />
    <!-- 肌 -->
    <path d="M6 5h5v3H6z" fill="#ffccaa" />
    <path d="M7 6h1v1H7zm2 0h1v1H9z" fill="#000" />
    <!-- 鎧 (ミニスカート風) -->
    <path d="M5 8h6v3H5z" fill="#1565c0" />
    <path d="M4 11h8v3H4z" fill="#1e88e5" />
    <!-- 脚 (生足・ニーハイ) -->
    <path d="M5 14h2v2H5zm4 14h2v2H9z" fill="#ffccaa" />
    <path d="M5 16h2v4H5zm4 0h2v4H9z" fill="#0d47a1" />
    <!-- 靴 -->
    <path d="M5 20h2v1H5zm4 0h2v1H9z" fill="#424242" />
  </svg>`,

  // --- Warrior (戦士) ---
  Warrior_Male: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 22h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <!-- 髪・バンダナ -->
    <path d="M5 2h6v2H5z" fill="#b71c1c" />
    <path d="M5 4h6v2H5z" fill="#5d4037" />
    <!-- 肌 -->
    <path d="M5 6h6v3H5z" fill="#ffccaa" />
    <path d="M6 7h1v1H6zm4 0h1v1h-1z" fill="#000" />
    <!-- 胴体 (筋肉質) -->
    <path d="M3 9h10v5H3z" fill="#5d4037" />
    <path d="M5 10h6v3H5z" fill="#d7ccc8" />
    <!-- 脚 -->
    <path d="M4 14h3v6H4zm5 0h3v6H9z" fill="#212121" />
    <!-- 巨大な斧 -->
    <path d="M13 4h2v6h-2z" fill="#757575" />
    <path d="M14 10h1v10h-1z" fill="#5d4037" />
  </svg>`,

  Warrior_Female: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 22h10v1H3z" fill="rgba(0,0,0,0.3)" />
    <!-- 長い髪 -->
    <path d="M4 2h8v10H4z" fill="#fdd835" />
    <!-- 肌 (セクシーなビキニアーマー) -->
    <path d="M6 5h5v3H6z" fill="#ffccaa" />
    <path d="M5 9h6v1H5z" fill="#ffccaa" />
    <path d="M5 10h2v1H5zm4 0h2v1H9z" fill="#cfd8dc" /> <!-- アーマーの一部 -->
    <path d="M7 10h2v2H7z" fill="#ffccaa" />
    <!-- 脚 -->
    <path d="M5 14h2v2H5zm4 0h2v2H9z" fill="#ffccaa" />
    <path d="M5 16h2v4H5zm4 0h2v4H9z" fill="#b71c1c" />
    <!-- 斧 -->
    <path d="M12 4h3v4h-3z" fill="#90a4ae" />
    <path d="M13 8h1v10h-1z" fill="#5d4037" />
  </svg>`,

  // --- Archer (狩人) ---
  Archer_Male: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <!-- フード -->
    <path d="M5 2h6v5H5z" fill="#33691e" />
    <!-- 肌 -->
    <path d="M6 5h4v3H6z" fill="#ffccaa" />
    <path d="M6 6h4v1H6z" fill="#000" opacity="0.6" /> <!-- 影 -->
    <!-- 服 -->
    <path d="M5 8h6v6H5z" fill="#558b2f" />
    <!-- 脚 -->
    <path d="M5 14h2v6H5zm4 0h2v6H9z" fill="#3e2723" />
    <!-- 弓 -->
    <path d="M12 6h1v10h-1z" fill="#8d6e63" />
    <path d="M11 6h1v1H11zm0 9h1v1H11z" fill="#8d6e63" />
  </svg>`,

  Archer_Female: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <!-- 髪 (ショート) -->
    <path d="M5 2h6v4H5z" fill="#a1887f" />
    <!-- 肌 -->
    <path d="M6 5h5v3H6z" fill="#ffccaa" />
    <path d="M7 6h1v1H7zm2 0h1v1H9z" fill="#000" />
    <!-- 服 (アクティブな軽装) -->
    <path d="M5 8h6v3H5z" fill="#33691e" />
    <path d="M4 11h8v1H4z" fill="#558b2f" />
    <!-- 脚 (ニーハイ) -->
    <path d="M5 12h2v4H5zm4 12h2v4H9z" fill="#ffccaa" />
    <path d="M5 16h2v4H5zm4 16h2v4H9z" fill="#1b5e20" />
    <!-- 弓 -->
    <path d="M12 6h1v10h-1z" fill="#8d6e63" />
  </svg>`,

  // --- Mage (魔術師) ---
  Mage_Male: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <!-- 魔法使いの帽子 -->
    <path d="M7 1h2v2H7z" fill="#311b92" />
    <path d="M5 3h6v2H5z" fill="#311b92" />
    <path d="M4 5h8v1H4z" fill="#512da8" />
    <!-- 肌 -->
    <path d="M6 6h4v3H6z" fill="#ffccaa" />
    <!-- ローブ -->
    <path d="M4 9h8v11H4z" fill="#4527a0" />
    <path d="M6 9h4v11H6z" fill="#673ab7" />
    <!-- 杖 -->
    <path d="M13 5h1v14h-1z" fill="#8d6e63" />
    <path d="M12 4h3v2h-3z" fill="#ffeb3b" /> <!-- 宝石 -->
  </svg>`,

  Mage_Female: `
  <svg viewBox="0 0 16 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22h8v1H4z" fill="rgba(0,0,0,0.3)" />
    <!-- 帽子 -->
    <path d="M7 1h2v3H7z" fill="#ad1457" />
    <path d="M3 4h10v2H3z" fill="#ad1457" />
    <!-- 長い髪 -->
    <path d="M4 6h8v8H4z" fill="#f48fb1" />
    <!-- 肌 (セクシーなオフショル) -->
    <path d="M6 6h5v3H6z" fill="#ffccaa" />
    <path d="M5 9h6v1H5z" fill="#ffccaa" />
    <!-- ローブ (スリット入り) -->
    <path d="M5 10h6v10H5z" fill="#880e4f" />
    <path d="M9 14h2v6H9z" fill="#ffccaa" /> <!-- 脚のスリット -->
    <!-- 杖 -->
    <path d="M13 5h1v14h-1z" fill="#8d6e63" />
    <path d="M12 4h3v2h-3z" fill="#00e676" /> <!-- 魔法の珠 -->
  </svg>`
};

/**
 * SVG文字列をURL形式に変換
 */
export const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());
