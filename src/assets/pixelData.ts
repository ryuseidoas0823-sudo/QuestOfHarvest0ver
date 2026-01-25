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
  // エフェクト用
  CY: '#00FFFF', // シアン
  MG: '#FF00FF', // マゼンタ
  // カーペット用
  RC: '#C0392B', // 濃い赤
  RD: '#922B21', // さらに濃い赤
};

// 12x12 ピクセルアート定義
export const pixelArtData: Record<string, { palette: any, grid: string[] }> = {
  // ... (既存データ) ...
  // ※既存の定義はそのまま残し、以下を追加/上書きしてください

  'player': {
    palette: C,
    grid: [
      "____KKKK____",
      "___KYYYYK___",
      "___KYKKYK___",
      "___KYYYYK___",
      "___KKSKK____",
      "__KKBLBLKK__",
      "_K_KBLBLK_K_",
      "_K_KBLBLK_K_",
      "___KKKKKK___",
      "___K_KK_K___",
      "___K____K___",
      "__KK____KK__"
    ]
  },
  'wall': {
    palette: C,
    grid: [
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,DR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR",
      "BR,DR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "DR,DR,DR,DR,BR,DR,DR,BR,DR,DR,DR,DR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,DR,DR,BR,DR,DR,DR,DR,BR,DR,DR,DR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR",
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR"
    ].map(s => s.replace(/,/g, ''))
  },
  'floor': {
    palette: C,
    grid: [
      "GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,ST,GR,GR,GR,GR,GR,GR,GR,ST,GR,GR",
      "GR,GR,GR,GR,ST,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,ST,GR,GR,GR,GR,GR,GR,ST,GR",
      "GR,GR,GR,GR,GR,GR,ST,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,ST,GR,GR,GR,GR,ST,GR",
      "GR,GR,ST,GR,GR,GR,GR,GR,GR,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,ST,GR,GR,GR",
      "GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR,GR"
    ].map(s => s.replace(/,/g, ''))
  },
  'stairs': {
    palette: C,
    grid: [
      "____________",
      "____________",
      "____KKKKKKKK",
      "___KYYYYYYYY",
      "___KYYYYYYYY",
      "__KYYYYYYYYY",
      "__KYYYYYYYYY",
      "_KYYYYYYYYYY",
      "_KYYYYYYYYYY",
      "KYYYYYYYYYYY",
      "KYYYYYYYYYYY",
      "KKKKKKKKKKKK"
    ]
  },
  'goblin': {
    palette: C,
    grid: [
      "____________",
      "___GG__GG___",
      "__G_G__G_G__",
      "__GGGGGGGG__",
      "_G_G_KK_G_G_",
      "_G_G_KK_G_G_",
      "__GGGGGGGG__",
      "___GGGGGG___",
      "____BRBR____",
      "___BR__BR___",
      "___BR__BR___",
      "__KK____KK__"
    ]
  },
  'slime': {
    palette: C,
    grid: [
      "____________",
      "____________",
      "____BBBB____",
      "___BBBBBB___",
      "__BB_BB_BB__",
      "__BB_BB_BB__",
      "__BBBBBBBB__",
      "_BBBBBBBBBB_",
      "BBBBBBBBBBBB",
      "BBBBBBBBBBBB",
      "_BB______BB_",
      "____________"
    ]
  },
  'orc': {
    palette: C,
    grid: [
      "____________",
      "__KK_KK_KK__",
      "__GR_GR_GR__",
      "__GRGRGRGR__",
      "_GR_K__K_GR_",
      "_GR_K__K_GR_",
      "_GRGRGRGRGR_",
      "__GRGRGRGR__",
      "___BRBRBR___",
      "___BR__BR___",
      "___BR__BR___",
      "__KK____KK__"
    ]
  },
  'boss': {
    palette: C,
    grid: [
      "___R_RR_R___",
      "__RRRRRRRR__",
      "__K_KRRK_K__",
      "_K_K_RR_K_K_",
      "_K_K_RR_K_K_",
      "__K_KRRK_K__",
      "__RRRRRRRR__",
      "__RRRRRRRR__",
      "___KKKKKK___",
      "___K_KK_K___",
      "___K_KK_K___",
      "__KK_KK_KK__"
    ]
  },
  'ally': {
    palette: C,
    grid: [
      "____KKKK____",
      "___KGGGGK___",
      "___KGGGGK___",
      "___KKKKKK___",
      "___KKSKK____",
      "__KKGGGGKK__",
      "_K_KGGGGK_K_",
      "_K_KGGGGK_K_",
      "___KKKKKK___",
      "___K_KK_K___",
      "___K____K___",
      "__KK____KK__"
    ]
  },
  // --- 新規追加 ---
  'carpet_red': {
    palette: C,
    grid: [
      "RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC",
      "RC,RD,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC",
      "RC,RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RD,RC,RC,RC,RC,RC,RC,RD,RC",
      "RC,RC,RC,RC,RC,RC,RD,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC",
      "RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RD,RC,RC,RC,RC,RD,RC",
      "RC,RC,RD,RC,RC,RC,RC,RC,RC,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RC,RC,RD,RC,RC,RC",
      "RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC,RC"
    ].map(s => s.replace(/,/g, ''))
  },
  'chest': {
    palette: C,
    grid: [
      "____________",
      "____KKKK____",
      "___KYKKKY___",
      "__KYYYYYYK__",
      "_KYYYYYYYYK_",
      "KKKKKKKKKKKK",
      "KRRRRRRRRRRK",
      "KRRRRKRRRRRK",
      "KRRRRKRRRRRK",
      "KRRRRRRRRRRK",
      "KKKKKKKKKKKK",
      "____________"
    ]
  },
  // ... (Skill, Effectは既存のまま) ...
  'skill_sword': {
    palette: C,
    grid: [
      "_____SL_____",
      "____SLSL____",
      "___SLSL_____",
      "__SLSL______",
      "_SLSL_______",
      "SLSL__WW____",
      "LSL__WWWW___",
      "BR__WWWWWW__",
      "_BR__WWWW___",
      "__BR__WW____",
      "___BR_______",
      "____BR______"
    ]
  },
  'skill_round': {
    palette: C,
    grid: [
      "____WWWW____",
      "__WW____WW__",
      "_W________W_",
      "_W___SL___W_",
      "W___SLSL___W",
      "W____SL____W",
      "W____BR____W",
      "_W________W_",
      "_W________W_",
      "__WW____WW__",
      "____WWWW____",
      "____________"
    ]
  },
  'skill_fire': {
    palette: C,
    grid: [
      "_____R______",
      "____ROR_____",
      "___ROROR____",
      "__ROROROR___",
      "__OROYORO___",
      "__ROYOYOR___",
      "___ROROR____",
      "____ROR_____",
      "_____R______",
      "____________",
      "____________",
      "____________"
    ]
  },
  'skill_heal': {
    palette: C,
    grid: [
      "____________",
      "_____G______",
      "____GGG_____",
      "___GGGGG____",
      "__GG_G_GG___",
      "__G_GGG_G___",
      "____GGG_____",
      "____GGG_____",
      "____GGG_____",
      "____GGG_____",
      "____________",
      "____________"
    ]
  },
  'skill_bow': {
    palette: C,
    grid: [
      "__BR____BR__",
      "_BR______BR_",
      "BR___SL___BR",
      "BR___SL___BR",
      "BR___SL___BR",
      "BR___SL___BR",
      "_BR__SL__BR_",
      "__BR_SL_BR__",
      "___BRSLBR___",
      "____BRBR____",
      "_____BR_____",
      "____________"
    ]
  },
  'effect_slash': {
    palette: C,
    grid: [
      "W___________",
      "_W__________",
      "__W____W____",
      "___W__W_____",
      "____WW______",
      "____WW______",
      "___W__W_____",
      "__W____W____",
      "_W__________",
      "W___________",
      "____________",
      "____________"
    ]
  },
  'effect_fire': {
    palette: C,
    grid: [
      "____R_R_____",
      "___ROROR____",
      "__RORRROR___",
      "__OROYORO___",
      "__ROROROR___",
      "___ROROR____",
      "____R_R_____",
      "____________",
      "____________",
      "____________",
      "____________",
      "____________"
    ]
  },
  'effect_heal': {
    palette: C,
    grid: [
      "____GG______",
      "___GWWG_____",
      "___GW G_____",
      "__G WW G____",
      "__G    G____",
      "___G  G_____",
      "____GG______",
      "____________",
      "____________",
      "____________",
      "____________",
      "____________"
    ]
  }
};
