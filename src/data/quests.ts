import { Quest } from '../types/quest';

/**
 * クエストデータ定義
 * ID命名規則:
 * - メインクエスト: mq_{chapter}_{subChapter} (例: mq_1_1)
 * - サブクエスト: sq_{region}_{number} (例: sq_forest_01)
 * - デイリー/他: dq_{number}, ev_{eventName}_{number}
 */
export const quests: Quest[] = [
  // ==========================================
  // 第1章：駆け出し冒険者の洗礼 (Main Quest)
  // ==========================================
  {
    id: 'mq_1_1',
    category: 'main',
    chapter: 1,
    subChapter: 1,
    title: 'CH1-1: 冒険の始まり',
    description: '冒険者登録を済ませた。まずは浅層でゴブリンを討伐し、冒険者としての第一歩を踏み出そう。',
    type: 'hunt',
    targetId: 'goblin',
    targetAmount: 3,
    rewardGold: 100,
    rewardExp: 50,
    requirements: {
      minLevel: 1
    },
    recommendedLevel: 1
  },
  {
    id: 'mq_1_2',
    category: 'main',
    chapter: 1,
    subChapter: 2,
    title: 'CH1-2: 準備を整えよ',
    description: 'ダンジョンは危険だ。魔石を少し集めて換金し、装備やアイテムを整える資金にしよう。',
    type: 'collect',
    targetId: 'magic_stone_small', // 雑魚敵からドロップする汎用アイテムを想定
    targetAmount: 5,
    rewardGold: 200,
    rewardExp: 80,
    requirements: {
      questCompleted: ['mq_1_1']
    },
    recommendedLevel: 2
  },
  {
    id: 'mq_1_3',
    category: 'main',
    chapter: 1,
    subChapter: 3,
    title: 'CH1-3: 未知なる深層へ',
    description: '少し腕が立ってきたようだ。地下3階（B3F）まで到達し、より強いモンスターの生態を確認せよ。',
    type: 'reach',
    targetAmount: 3, // 階層数 (B3F)
    rewardGold: 300,
    rewardExp: 150,
    requirements: {
      minLevel: 3,
      questCompleted: ['mq_1_2']
    },
    recommendedLevel: 3
  },
  {
    id: 'mq_1_4',
    category: 'main',
    chapter: 1,
    subChapter: 4,
    title: 'CH1-4: 不穏な影',
    description: '浅層にはいないはずの強力なオークが目撃されている。斥候（スカウト）を倒し、脅威を排除せよ。',
    type: 'hunt',
    targetId: 'orc', // 通常より少し強い敵を設定
    targetAmount: 1,
    rewardGold: 500,
    rewardExp: 300,
    requirements: {
      questCompleted: ['mq_1_3']
    },
    recommendedLevel: 4
  },
  {
    id: 'mq_1_5',
    category: 'main',
    chapter: 1,
    subChapter: 5,
    title: 'CH1-5: 凶刃との遭遇',
    description: '【ボス討伐】不穏な気配の元凶を見つけた。奥地で待ち構える「オーク・ジェネラル」を討伐せよ。生存者がいるかもしれない、注意して進め。',
    type: 'hunt',
    targetId: 'orc_general', // 第1章ボス
    targetAmount: 1,
    rewardGold: 1000,
    rewardExp: 1000,
    rewardItems: [
      { itemId: 'potion_high', amount: 3 }
    ],
    requirements: {
      minLevel: 5,
      questCompleted: ['mq_1_4']
    },
    recommendedLevel: 5
  },

  // ==========================================
  // サブクエスト (Sub Quest) - 拡張の余地
  // ==========================================
  {
    id: 'sq_town_1',
    category: 'sub',
    title: '害獣駆除の依頼',
    description: '街の食料庫を荒らす大ネズミを退治してほしい。',
    type: 'hunt',
    targetId: 'rat',
    targetAmount: 5,
    rewardGold: 50,
    rewardExp: 20,
    requirements: {
      minLevel: 1
    },
    recommendedLevel: 1
  },
  {
    id: 'sq_collect_1',
    category: 'sub',
    title: '薬草の納品',
    description: 'ポーションの材料となる薬草が不足している。スライムなどが落とす薬草を集めてくれ。',
    type: 'collect',
    targetId: 'herb',
    targetAmount: 3,
    rewardGold: 80,
    rewardExp: 30,
    requirements: {
      minLevel: 2
    },
    recommendedLevel: 2
  }
];
