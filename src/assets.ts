/**
 * 高解像度版(32x48) キャラクターSVGアセット
 * 男性はクール・逞しく、女性はキュート・セクシーなシルエットを追求
 */
export const ASSETS_SVG = {
  // --- Swordsman (剣士) ---
  Swordsman_Male: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <!-- 影 -->
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- マント(裏) -->
    <path d="M8 18h16v20L20 42l-4-2-4 2-4-4z" fill="#1a237e" />
    <!-- 鎧(足) -->
    <path d="M10 32h5v12h-5zm7 0h5v12h-5z" fill="#90a4ae" />
    <path d="M10 32h5v2h-5zm7 0h5v2h-5z" fill="#cfd8dc" />
    <!-- 鎧(胴) -->
    <path d="M9 16h14v18H9z" fill="#455a64" />
    <path d="M11 18h10v14H11z" fill="#90a4ae" />
    <path d="M11 18h10v2H11z" fill="#ffd700" /> <!-- 金の縁取り -->
    <!-- 腕 -->
    <path d="M6 18h3v12H6zm23 18h3v12h-3z" fill="#90a4ae" />
    <!-- 頭部 (銀髪) -->
    <path d="M10 4h12v12H10z" fill="#ffccaa" /> <!-- 肌 -->
    <path d="M9 2h14v8H9z" fill="#cfd8dc" /> <!-- 髪 -->
    <path d="M12 10h2v2h-2zm6 0h2v2h-2z" fill="#1565c0" /> <!-- 瞳 -->
    <!-- 剣 (背負い) -->
    <path d="M24 10h2v24h-2z" fill="#bdbdbd" />
    <path d="M23 30h4v2h-4z" fill="#5d4037" />
  </svg>`,

  Swordsman_Female: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- 髪 (イエローポニーテール) -->
    <path d="M10 4h14v12H10z" fill="#fdd835" />
    <path d="M22 10h6v18l-4-4h-2z" fill="#fbc02d" />
    <path d="M14 2h4v4h-4z" fill="#d32f2f" /> <!-- リボン -->
    <!-- 肌 -->
    <path d="M12 8h10v10H12z" fill="#ffdbbd" />
    <path d="M14 12h2v2h-2zm4 0h2v2h-2z" fill="#333" />
    <!-- 衣装 (ミニスカ風アーマー) -->
    <path d="M10 18h12v8H10z" fill="#1e88e5" />
    <path d="M9 26h14v6H9z" fill="#cfd8dc" /> <!-- スカート部 -->
    <!-- 脚 (ニーソックス) -->
    <path d="M11 32h4v12h-4zm6 0h4v12h-4z" fill="#fff" />
    <path d="M11 38h4v6h-4zm6 38h4v6h-4z" fill="#ffdbbd" /> <!-- 絶対領域 -->
    <path d="M10 42h6v2h-6zm6 0h6v2h-6z" fill="#424242" />
  </svg>`,

  // --- Warrior (戦士) ---
  Warrior_Male: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="12" ry="4" fill="rgba(0,0,0,0.2)" />
    <!-- 髪 (赤髪) -->
    <path d="M8 2h16v10H8z" fill="#c62828" />
    <path d="M10 1h12v1H10z" fill="#ef5350" />
    <!-- 肌 (逞しい) -->
    <path d="M10 8h12v8H10z" fill="#ffccaa" />
    <path d="M7 16h18v10H7z" fill="#ffccaa" /> <!-- 裸の上半身部分 -->
    <!-- レザーアーマー -->
    <path d="M9 18h14v8H9z" fill="#5d4037" opacity="0.7" />
    <path d="M12 26h8v12h-8z" fill="#3e2723" />
    <!-- 脚 -->
    <path d="M10 38h5v6h-5zm7 0h5v6h-5z" fill="#212121" />
    <!-- 巨大な斧 -->
    <path d="M22 10h8v12h-8z" fill="#757575" />
    <path d="M25 10v30" stroke="#5d4037" stroke-width="2" />
  </svg>`,

  Warrior_Female: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- ロング髪 (金髪) -->
    <path d="M8 4h16v30H8z" fill="#fdd835" />
    <path d="M10 2h12v4H10z" fill="#fff176" />
    <!-- 肌 (セクシービキニアーマー) -->
    <path d="M12 8h8v8H12z" fill="#ffdbbd" />
    <path d="M10 16h12v4H10z" fill="#ffdbbd" />
    <path d="M10 18h3v2h-3zm9 0h3v2h-3z" fill="#90a4ae" /> <!-- ブラ部分 -->
    <path d="M14 20h4v6H14z" fill="#ffdbbd" /> <!-- 腹筋 -->
    <path d="M11 26h10v4H11z" fill="#90a4ae" /> <!-- パンツ部分 -->
    <!-- 脚 (高レッグ) -->
    <path d="M11 30h4v14h-4zm6 0h4v14h-4z" fill="#ffdbbd" />
    <path d="M10 40h6v4h-6zm6 0h6v4h-6z" fill="#90a4ae" />
    <!-- マフラー -->
    <path d="M10 14h12v3H10z" fill="#d32f2f" />
    <path d="M21 15h2v15h-2z" fill="#b71c1c" />
  </svg>`,

  // --- Archer (狩人) ---
  Archer_Male: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- フードとスカーフ -->
    <path d="M10 4h12v12H10z" fill="#2e7d32" />
    <path d="M12 14h8v4h-8z" fill="#558b2f" /> <!-- 顔を隠すスカーフ -->
    <path d="M13 10h2v2h-2zm4 0h2v2h-2z" fill="#000" /> <!-- 目 -->
    <!-- コート -->
    <path d="M9 18h14v20H9z" fill="#1b5e20" />
    <path d="M15 18h2v20h-2z" fill="#388e3c" />
    <!-- 脚 -->
    <path d="M10 38h5v6h-5zm7 0h5v6h-5z" fill="#3e2723" />
    <!-- 弓 -->
    <path d="M24 12c4 4 4 16 0 20" fill="none" stroke="#8d6e63" stroke-width="2" />
  </svg>`,

  Archer_Female: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- 髪 (サイドポニテ) -->
    <path d="M10 4h12v10H10z" fill="#8d6e63" />
    <path d="M6 10h4v10h-2l-2-2z" fill="#6d4c41" />
    <!-- 肌 -->
    <path d="M12 8h8v8H12z" fill="#ffdbbd" />
    <!-- 衣装 (アクティブ) -->
    <path d="M10 16h12v8H10z" fill="#4caf50" />
    <path d="M11 24h10v4H11z" fill="#2e7d32" /> <!-- ショーパン -->
    <!-- 脚 -->
    <path d="M11 28h4v16h-4zm6 0h4v16h-4z" fill="#ffdbbd" />
    <path d="M10 38h6v6h-6zm6 0h6v6h-6z" fill="#4e342e" /> <!-- ブーツ -->
  </svg>`,

  // --- Mage (魔術師) ---
  Mage_Male: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- 大きな帽子 -->
    <path d="M12 2h8v4h-8z" fill="#311b92" />
    <path d="M6 6h20v2H6z" fill="#512da8" />
    <!-- 肌 -->
    <path d="M12 8h8v8H12z" fill="#ffdbbd" />
    <path d="M14 11h4v1H14z" fill="#000" opacity="0.3" /> <!-- 眼鏡風 -->
    <!-- ローブ -->
    <path d="M8 16h16v24H8z" fill="#311b92" />
    <path d="M10 16h12v24H10z" fill="#4527a0" />
    <path d="M15 16h2v24h-2z" fill="#ffd700" opacity="0.5" /> <!-- 装飾 -->
    <!-- 杖 -->
    <path d="M26 10h2v30h-2z" fill="#5d4037" />
    <path d="M25 6h4v4h-4z" fill="#00e5ff" />
  </svg>`,

  Mage_Female: `
  <svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="44" rx="10" ry="3" fill="rgba(0,0,0,0.2)" />
    <!-- 帽子 -->
    <path d="M14 1h4v6h-4z" fill="#880e4f" />
    <path d="M6 7h20v2H6z" fill="#ad1457" />
    <!-- 長い髪 (ピンク) -->
    <path d="M8 9h16v24H8z" fill="#f48fb1" />
    <!-- 肌 (セクシー・オフショル) -->
    <path d="M12 10h8v8H12z" fill="#ffdbbd" />
    <path d="M10 18h12v3H10z" fill="#ffdbbd" /> <!-- 肩 -->
    <!-- ドレス・ローブ (スリット) -->
    <path d="M10 21h12v20H10z" fill="#880e4f" />
    <path d="M17 28h5v12h-5z" fill="#ffdbbd" /> <!-- 脚のスリット見せ -->
    <path d="M11 41h10v2H11z" fill="#4a148c" />
    <!-- 杖 -->
    <path d="M26 10h2v30h-2z" fill="#5d4037" />
    <circle cx="27" cy="8" r="3" fill="#ea80fc" />
  </svg>`
};

export const svgToUrl = (s: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.trim());
