// カラーパレット定義 (旧ドット絵用互換)
const C = {
  _: null, K: '#000000', W: '#FFFFFF', R: '#E74C3C', G: '#2ECC71', B: '#3498DB', Y: '#F1C40F', O: '#E67E22',
  P: '#9B59B6', BR: '#8D6E63', GR: '#95A5A6', DR: '#34495E', SK: '#FFCC80', BL: '#3498DB', ST: '#7F8C8D',
  SL: '#BDC3C7', CY: '#00FFFF', MG: '#FF00FF', RC: '#C0392B', RD: '#922B21',
};

// データ型の拡張: grid(ドット絵) または svg(ベクター画像)
export const pixelArtData: Record<string, { palette?: any, grid?: string[], svg?: string }> = {
  
  // ==========================================
  // プレイヤーキャラクター (SVG)
  // ==========================================
  
  // 剣士 (Swordsman): 青いマントと銀の鎧
  'hero_warrior': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs><filter id="s"><feDropShadow dx="1" dy="2" stdDeviation="1" flood-opacity="0.3"/></filter></defs>
        <g filter="url(#s)">
          <!-- マント -->
          <path d="M12 20 Q32 60 52 20 L42 55 Q32 64 22 55 Z" fill="#3498db" />
          <!-- 体/鎧 -->
          <rect x="22" y="25" width="20" height="25" rx="4" fill="#95a5a6" stroke="#2c3e50" stroke-width="2"/>
          <path d="M22 25 L42 40 M42 25 L22 40" stroke="#2c3e50" stroke-width="2" opacity="0.3"/>
          <!-- 頭 -->
          <circle cx="32" cy="18" r="10" fill="#f1c40f" stroke="#e67e22" stroke-width="2"/>
          <path d="M26 16 L38 16" stroke="#2c3e50" stroke-width="2"/>
          <!-- 剣 -->
          <path d="M50 15 L50 45 L54 45 L54 15 L58 15 L52 2 L46 15 Z" fill="#ecf0f1" stroke="#7f8c8d" stroke-width="1"/>
          <rect x="48" y="40" width="8" height="4" fill="#e67e22"/>
        </g>
      </svg>`
  },

  // 魔導士 (Mage): 紫のローブと杖
  'hero_mage': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#s)">
          <!-- ローブ -->
          <path d="M15 60 L20 20 L44 20 L49 60 Z" fill="#8e44ad" stroke="#2c3e50" stroke-width="2"/>
          <path d="M20 20 L32 60 L44 20" fill="#9b59b6"/>
          <!-- 頭/帽子 -->
          <path d="M12 20 L52 20 L32 2 Z" fill="#8e44ad" stroke="#2c3e50" stroke-width="2"/>
          <circle cx="32" cy="25" r="7" fill="#ffcc80"/>
          <!-- 杖 -->
          <line x1="54" y1="15" x2="54" y2="60" stroke="#8d6e63" stroke-width="3"/>
          <circle cx="54" cy="12" r="6" fill="#e74c3c" stroke="#c0392b" stroke-width="1">
            <animate attributeName="fill" values="#e74c3c;#f1c40f;#e74c3c" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>`
  },

  // 狩人 (Archer): 緑のフードと弓
  'hero_archer': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#s)">
          <!-- 服 -->
          <path d="M18 22 L22 55 L42 55 L46 22 Z" fill="#27ae60" stroke="#145a32" stroke-width="2"/>
          <!-- 頭/フード -->
          <path d="M20 25 Q32 5 44 25" fill="#2ecc71" stroke="#145a32" stroke-width="2"/>
          <circle cx="32" cy="22" r="8" fill="#ffcc80"/>
          <rect x="24" y="20" width="16" height="4" fill="#145a32" opacity="0.5"/> <!-- マスク -->
          <!-- 弓 -->
          <path d="M10 15 Q0 32 10 50" fill="none" stroke="#d35400" stroke-width="3"/>
          <line x1="10" y1="15" x2="10" y2="50" stroke="#ecf0f1" stroke-width="1" opacity="0.5"/>
        </g>
      </svg>`
  },

  // 聖職者/その他 (Cleric): 白と金のローブ
  'hero_cleric': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#s)">
          <!-- ローブ -->
          <rect x="20" y="20" width="24" height="40" rx="5" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2"/>
          <line x1="32" y1="20" x2="32" y2="60" stroke="#f1c40f" stroke-width="4"/>
          <line x1="20" y1="35" x2="44" y2="35" stroke="#f1c40f" stroke-width="4"/>
          <!-- 頭 -->
          <circle cx="32" cy="18" r="9" fill="#ffcc80"/>
          <path d="M22 18 Q32 10 42 18" fill="none" stroke="#f1c40f" stroke-width="2"/>
        </g>
      </svg>`
  },

  // デフォルトプレイヤー (旧ドット絵のフォールバック)
  'player': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="20" fill="#3498db" stroke="#2980b9" stroke-width="3"/>
        <text x="32" y="38" font-size="20" text-anchor="middle" fill="white">?</text>
      </svg>`
  },

  // ==========================================
  // モンスター (SVG)
  // ==========================================

  'goblin': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g>
          <!-- 耳 -->
          <path d="M10 20 L20 30 L15 10 Z" fill="#2ecc71"/>
          <path d="M54 20 L44 30 L49 10 Z" fill="#2ecc71"/>
          <!-- 顔 -->
          <circle cx="32" cy="32" r="18" fill="#2ecc71" stroke="#27ae60" stroke-width="2"/>
          <!-- 目 -->
          <circle cx="25" cy="28" r="3" fill="#f1c40f"/>
          <circle cx="39" cy="28" r="3" fill="#f1c40f"/>
          <!-- 口 -->
          <path d="M25 40 Q32 45 39 40" stroke="#2c3e50" stroke-width="2" fill="none"/>
          <path d="M28 40 L28 44 M36 40 L36 44" stroke="white" stroke-width="2"/>
          <!-- 体 -->
          <path d="M20 45 L44 45 L44 60 L20 60 Z" fill="#8d6e63"/>
        </g>
      </svg>`
  },

  'slime': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="slimeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3498db" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#2980b9" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <g>
          <path d="M10 55 Q5 60 15 60 L49 60 Q59 60 54 55 Q60 30 32 20 Q4 30 10 55" fill="url(#slimeGrad)" stroke="#2980b9" stroke-width="2">
            <animate attributeName="d" values="M10 55 Q5 60 15 60 L49 60 Q59 60 54 55 Q60 30 32 20 Q4 30 10 55; M8 58 Q5 60 15 60 L49 60 Q59 60 56 58 Q64 35 32 25 Q0 35 8 58; M10 55 Q5 60 15 60 L49 60 Q59 60 54 55 Q60 30 32 20 Q4 30 10 55" dur="2s" repeatCount="indefinite"/>
          </path>
          <circle cx="25" cy="35" r="4" fill="white" opacity="0.8"/>
          <circle cx="25" cy="35" r="2" fill="black"/>
          <circle cx="40" cy="35" r="4" fill="white" opacity="0.8"/>
          <circle cx="40" cy="35" r="2" fill="black"/>
        </g>
      </svg>`
  },

  'orc': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g>
          <!-- 体 -->
          <rect x="15" y="25" width="34" height="35" rx="5" fill="#2e7d32" stroke="#1b5e20" stroke-width="2"/>
          <rect x="15" y="45" width="34" height="15" fill="#5d4037"/>
          <!-- 顔 -->
          <rect x="20" y="10" width="24" height="20" rx="3" fill="#388e3c" stroke="#1b5e20" stroke-width="2"/>
          <rect x="22" y="18" width="6" height="2" fill="black"/>
          <rect x="36" y="18" width="6" height="2" fill="black"/>
          <path d="M28 26 L36 26" stroke="black" stroke-width="2"/>
          <path d="M22 26 L22 22 L24 22 L24 26 Z" fill="white"/> <!-- 牙 -->
          <path d="M40 26 L40 22 L42 22 L42 26 Z" fill="white"/>
          <!-- 武器 -->
          <path d="M50 20 L58 12 L62 16 L54 24 Z" fill="#7f8c8d"/>
          <line x1="50" y1="20" x2="35" y2="40" stroke="#5d4037" stroke-width="4"/>
        </g>
      </svg>`
  },

  'boss': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g>
          <!-- マント -->
          <path d="M10 20 Q32 0 54 20 L50 60 L14 60 Z" fill="#2c3e50"/>
          <!-- 鎧 -->
          <path d="M15 20 L49 20 L45 55 L19 55 Z" fill="#34495e" stroke="#ecf0f1" stroke-width="2"/>
          <!-- 頭（髑髏っぽい） -->
          <circle cx="32" cy="20" r="12" fill="#ecf0f1"/>
          <circle cx="28" cy="18" r="3" fill="red" filter="url(#glow)"/>
          <circle cx="36" cy="18" r="3" fill="red" filter="url(#glow)"/>
          <!-- 剣 -->
          <path d="M55 10 L55 50" stroke="#c0392b" stroke-width="4"/>
          <path d="M50 40 L60 40" stroke="#c0392b" stroke-width="4"/>
        </g>
      </svg>`
  },

  'ally': {
    svg: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle cx="32" cy="20" r="10" fill="#f1c40f"/>
          <rect x="20" y="30" width="24" height="30" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2"/>
          <circle cx="32" cy="15" r="8" fill="#ffcc80"/>
          <text x="32" y="50" font-size="20" text-anchor="middle">Friend</text>
        </g>
      </svg>`
  },

  // ==========================================
  // マップチップ (旧ドット絵データ互換 + 一部SVG化)
  // ==========================================
  
  // 壁 (Wall): レンガ調
  'wall': {
    palette: C,
    grid: [
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR",
      "BR,DR,BR,BR,DR,BR,DR,BR,BR,DR,BR,DR,BR,BR,DR,BR",
      "BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR",
      "DR,BR,DR,BR,BR,DR,BR,DR,BR,BR,DR,BR,DR,BR,BR,DR",
      "DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR",
      "BR,DR,BR,BR,DR,BR,DR,BR,BR,DR,BR,DR,BR,BR,DR,BR",
      "BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR",
      "DR,BR,DR,BR,BR,DR,BR,DR,BR,BR,DR,BR,DR,BR,BR,DR",
      "DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR,DR"
    ].map(s => s.replace(/,/g, ''))
  },

  // ... (他のマップチップは旧データを維持しつつ、必要ならSVG化) ...
  'floor': {
    palette: C,
    grid: [
      "GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,ST,ST,GR,GR",
      "GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,ST,ST,GR,GR",
      "GR,GR,GR,GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,ST,ST,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,ST,ST,GR,GR,GR,GR,GR,GR",
      "GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,ST,ST,GR,GR,GR,GR,ST,ST,GR,GR,GR",
      "GR,GR,GR,GR,GR,ST,ST,GR,GR,GR,GR,ST,ST,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,ST,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,ST,ST,GR,GR,ST,ST,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,ST,ST,GR,GR,ST,ST,GR,GR"
    ].map(s => s.replace(/,/g, ''))
  },
  'stairs': { palette: C, grid: ["________________", "______KKKKKKKKKK", "_____KYYYYYYYYYY", "_____KYYYYYYYYYY", "____KYYYYYYYYYYY", "____KYYYYYYYYYYY", "___KYYYYYYYYYYYY", "___KYYYYYYYYYYYY", "__KYYYYYYYYYYYYY", "__KYYYYYYYYYYYYY", "_KYYYYYYYYYYYYYY", "_KYYYYYYYYYYYYYY", "KYYYYYYYYYYYYYYY", "KYYYYYYYYYYYYYYY", "KKKKKKKKKKKKKKKK", "KKKKKKKKKKKKKKKK"] },
  'carpet_red': { palette: C, grid: ["RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD", "RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC", "RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC", "RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC", "RC,RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC,RC", "RC,RC,RC,RC,RC,RD,RC,RC,RC,RC,RD,RC,RC,RC,RC,RC", "RC,RC,RC,RC,RC,RC,RD,RC,RC,RD,RC,RC,RC,RC,RC,RC", "RC,RC,RC,RC,RC,RC,RC,RD,RD,RC,RC,RC,RC,RC,RC,RC", "RC,RC,RC,RC,RC,RC,RC,RD,RD,RC,RC,RC,RC,RC,RC,RC", "RC,RC,RC,RC,RC,RC,RD,RC,RC,RD,RC,RC,RC,RC,RC,RC", "RC,RC,RC,RC,RC,RD,RC,RC,RC,RC,RD,RC,RC,RC,RC,RC", "RC,RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC,RC", "RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC", "RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC", "RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC", "RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD"].map(s => s.replace(/,/g, '')) },
  
  // スキルアイコン (維持)
  'skill_sword': { palette: C, grid: ["________SL______", "_______SLSL_____", "______SLSL______", "_____SLSL_______", "____SLSL________", "___SLSL__WW_____", "__SLSL__WWWW____", "_BR____WWWWWW___", "__BR____WWWW____", "___BR____WW_____", "____BR__________", "_____BR_________", "________________", "________________", "________________", "________________"] },
  'skill_round': { palette: C, grid: ["________________", "________________", "____WWWW____", "__WW____WW__", "_W________W_", "_W___SL___W_", "W___SLSL___W", "W____SL____W", "W____BR____W", "_W________W_", "_W________W_", "__WW____WW__", "____WWWW____", "____________", "________________", "________________"] },
  'skill_fire': { palette: C, grid: ["________________", "________________", "_____R______", "____ROR_____", "___ROROR____", "__ROROROR___", "__OROYORO___", "__ROYOYOR___", "___ROROR____", "____ROR_____", "_____R______", "____________", "____________", "____________", "________________", "________________"] },
  'skill_heal': { palette: C, grid: ["________________", "________________", "____________", "_____G______", "____GGG_____", "___GGGGG____", "__GG_G_GG___", "__G_GGG_G___", "____GGG_____", "____GGG_____", "____GGG_____", "____GGG_____", "____________", "____________", "________________", "________________"] },
  'skill_bow': { palette: C, grid: ["________________", "________________", "__BR____BR__", "_BR______BR_", "BR___SL___BR", "BR___SL___BR", "BR___SL___BR", "BR___SL___BR", "_BR__SL__BR_", "__BR_SL_BR__", "___BRSLBR___", "____BRBR____", "_____BR_____", "____________", "________________", "________________"] },
  'effect_slash': { palette: C, grid: ["W_______________", "_W______________", "__W____W________", "___W__W_________", "____WW__________", "____WW__________", "___W__W_________", "__W____W________", "_W______________", "W_______________", "________________", "________________", "________________", "________________", "________________", "________________"] },
  'effect_fire': { palette: C, grid: ["____R_R_________", "___ROROR________", "__RORRROR_______", "__OROYORO_______", "__ROROROR_______", "___ROROR________", "____R_R_________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________"] },
  'effect_heal': { palette: C, grid: ["____GG__________", "___GWWG_________", "___GW G_________", "__G WW G________", "__G    G________", "___G  G_________", "____GG__________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________"] }
};
