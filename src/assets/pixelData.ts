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
  DR: '#34495E', // ダークグレー（壁など）
  SK: '#FFCC80', // 肌色
  BL: '#3498DB', // プレイヤーの服
  ST: '#7F8C8D', // 石
};

// 12x12 ピクセルアート定義
// キー文字に対応する色が描画されます
export const pixelArtData: Record<string, { palette: any, grid: string[] }> = {
  // --- プレイヤー ---
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
  
  // --- マップチップ ---
  'wall': {
    palette: C,
    grid: [
      "BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR", // カンマ区切りではないが便宜上
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
    ].map(s => s.replace(/,/g, '')) // 文字列調整
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

  // --- モンスター ---
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
  // ボス汎用（大きく表示されるので少し細かく見える）
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
  // 味方
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
  // 宝箱
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
  }
};
