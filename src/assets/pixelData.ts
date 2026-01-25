// カラーパレット定義
const C = {
  _: null,      // 透明
  K: '#000000', // 黒（輪郭など）
  W: '#FFFFFF', // 白
  R: '#E74C3C', // 赤
  G: '#2ECC71', // 緑
  B: '#3498DB', // 青
  Y: '#F1C40F', // 黄
  O: '#E67E22', // オレンジ
  P: '#9B59B6', // 紫
  BR: '#8D6E63', // 茶色
  GR: '#95A5A6', // グレー
  DR: '#34495E', // ダークグレー
  SK: '#FFCC80', // 肌色
  BL: '#3498DB', // プレイヤーの服
  ST: '#7F8C8D', // 石
  SL: '#BDC3C7', // 銀（剣など）
  CY: '#00FFFF', // シアン
  MG: '#FF00FF', // マゼンタ
  RC: '#C0392B', // カーペット赤
  RD: '#922B21', // カーペット濃赤
};

// 16x16 High Resolution Pixel Art
// 12x12 -> 16x16 に拡張し、ディテールアップ
export const pixelArtData: Record<string, { palette: any, grid: string[] }> = {
  
  // --- プレイヤー (勇者風) ---
  'player': {
    palette: C,
    grid: [
      "_____KKKKK______",
      "____KYYYYYK_____",
      "____KYYYYYK_____",
      "____KSKKSKK_____",
      "____KSKKSKK_____",
      "_____KSKSK______",
      "___KKBLBLKK_____",
      "__K_KBLBLK_K____",
      "__K_KBLBLK_K____",
      "_SL_KBLBLK_SL___",
      "_SL_KKKKKK_SL___",
      "_SL_K_KK_K_SL___",
      "____K____K______",
      "____K____K______",
      "___KK____KK_____",
      "___KK____KK_____"
    ]
  },

  // --- マップ: 床 ---
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

  // --- マップ: 壁 ---
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

  // --- マップ: 階段 ---
  'stairs': {
    palette: C,
    grid: [
      "________________",
      "______KKKKKKKKKK",
      "_____KYYYYYYYYYY",
      "_____KYYYYYYYYYY",
      "____KYYYYYYYYYYY",
      "____KYYYYYYYYYYY",
      "___KYYYYYYYYYYYY",
      "___KYYYYYYYYYYYY",
      "__KYYYYYYYYYYYYY",
      "__KYYYYYYYYYYYYY",
      "_KYYYYYYYYYYYYYY",
      "_KYYYYYYYYYYYYYY",
      "KYYYYYYYYYYYYYYY",
      "KYYYYYYYYYYYYYYY",
      "KKKKKKKKKKKKKKKK",
      "KKKKKKKKKKKKKKKK"
    ]
  },

  // --- マップ: ボス部屋カーペット ---
  'carpet_red': {
    palette: C,
    grid: [
      "RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD",
      "RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC",
      "RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC",
      "RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC",
      "RC,RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RD,RC,RC,RC,RC,RD,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RD,RC,RC,RD,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RC,RD,RD,RC,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RC,RD,RD,RC,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RD,RC,RC,RD,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RD,RC,RC,RC,RC,RD,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC,RC",
      "RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC",
      "RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC",
      "RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD,RC",
      "RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RD"
    ].map(s => s.replace(/,/g, ''))
  },

  // --- 敵: ゴブリン ---
  'goblin': {
    palette: C,
    grid: [
      "________________",
      "______GG__GG____",
      "_____G_G__G_G___",
      "____GGGGGGGGGG__",
      "___G_G_KKKK_G_G_",
      "___G_G_KKKK_G_G_",
      "____GGGGGGGGGG__",
      "_____GGGGGGGG___",
      "______GGGGGG____",
      "______BRBRBR____",
      "_____BR_BR_BR___",
      "_____BR_BR_BR___",
      "_____BR____BR___",
      "____KK______KK__",
      "________________",
      "________________"
    ]
  },

  // --- 敵: スライム ---
  'slime': {
    palette: C,
    grid: [
      "________________",
      "________________",
      "________________",
      "______BBBB______",
      "_____BBBBBB_____",
      "____BB_BB_BB____",
      "____BB_BB_BB____",
      "___BBBBBBBBBB___",
      "___BBBBBBBBBB___",
      "__BBBBBBBBBBBB__",
      "__BBBBBBBBBBBB__",
      "__BBBBBBBBBBBB__",
      "_BB__________BB_",
      "________________",
      "________________",
      "________________"
    ]
  },

  // --- 敵: オーク ---
  'orc': {
    palette: C,
    grid: [
      "________________",
      "____KK__KK__KK__",
      "____GR__GR__GR__",
      "____GRGRGRGRGR__",
      "___GR_K____K_GR_",
      "___GR_K____K_GR_",
      "___GRGRGRGRGRGR_",
      "____GRGRGRGRGR__",
      "_____BRBRBRBR___",
      "_____BR_BR_BR___",
      "_____BR_BR_BR___",
      "_____BR____BR___",
      "____KK______KK__",
      "________________",
      "________________",
      "________________"
    ]
  },

  // --- 敵: ボス ---
  'boss': {
    palette: C,
    grid: [
      "_____R_RR_R_____",
      "____RRRRRRRR____",
      "____K_KRRK_K____",
      "___K_K_RR_K_K___",
      "___K_K_RR_K_K___",
      "____K_KRRK_K____",
      "____RRRRRRRR____",
      "____RRRRRRRR____",
      "_____KKKKKK_____",
      "_____K_KK_K_____",
      "_____K_KK_K_____",
      "____KK_KK_KK____",
      "____K______K____",
      "________________",
      "________________",
      "________________"
    ]
  },

  // --- スキルアイコン (簡易的に12x12を中央配置または拡張) ---
  // ※既存の12x12データもレンダラーは描画できるが、統一感を出すために16x16枠にする
  'skill_sword': {
    palette: C,
    grid: [
      "________SL______",
      "_______SLSL_____",
      "______SLSL______",
      "_____SLSL_______",
      "____SLSL________",
      "___SLSL__WW_____",
      "__SLSL__WWWW____",
      "_BR____WWWWWW___",
      "__BR____WWWW____",
      "___BR____WW_____",
      "____BR__________",
      "_____BR_________",
      "________________",
      "________________",
      "________________",
      "________________"
    ]
  },
  // 他のスキルは省略（既存の12x12でも動作はするが、余白ができる）
  'skill_round': { palette: C, grid: ["________________", "________________", "____WWWW____", "__WW____WW__", "_W________W_", "_W___SL___W_", "W___SLSL___W", "W____SL____W", "W____BR____W", "_W________W_", "_W________W_", "__WW____WW__", "____WWWW____", "____________", "________________", "________________"] },
  'skill_fire': { palette: C, grid: ["________________", "________________", "_____R______", "____ROR_____", "___ROROR____", "__ROROROR___", "__OROYORO___", "__ROYOYOR___", "___ROROR____", "____ROR_____", "_____R______", "____________", "____________", "____________", "________________", "________________"] },
  'skill_heal': { palette: C, grid: ["________________", "________________", "____________", "_____G______", "____GGG_____", "___GGGGG____", "__GG_G_GG___", "__G_GGG_G___", "____GGG_____", "____GGG_____", "____GGG_____", "____GGG_____", "____________", "____________", "________________", "________________"] },
  'skill_bow': { palette: C, grid: ["________________", "________________", "__BR____BR__", "_BR______BR_", "BR___SL___BR", "BR___SL___BR", "BR___SL___BR", "BR___SL___BR", "_BR__SL__BR_", "__BR_SL_BR__", "___BRSLBR___", "____BRBR____", "_____BR_____", "____________", "________________", "________________"] },

  'effect_slash': { palette: C, grid: ["W_______________", "_W______________", "__W____W________", "___W__W_________", "____WW__________", "____WW__________", "___W__W_________", "__W____W________", "_W______________", "W_______________", "________________", "________________", "________________", "________________", "________________", "________________"] },
  'effect_fire': { palette: C, grid: ["____R_R_________", "___ROROR________", "__RORRROR_______", "__OROYORO_______", "__ROROROR_______", "___ROROR________", "____R_R_________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________"] },
  'effect_heal': { palette: C, grid: ["____GG__________", "___GWWG_________", "___GW G_________", "__G WW G________", "__G    G________", "___G  G_________", "____GG__________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________", "________________"] }
};
