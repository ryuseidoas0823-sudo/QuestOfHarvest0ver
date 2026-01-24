import { Quest } from '../types/quest';

/**
 * クエストデータ定義
 * ID命名規則: mq_{chapter}_{subChapter}
 */
export const quests: Quest[] = [
  // ... existing Chapter 1 & 2 quests ...
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
    requirements: { minLevel: 1 },
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
    targetId: 'magic_stone_small',
    targetAmount: 5,
    rewardGold: 200,
    rewardExp: 80,
    requirements: { questCompleted: ['mq_1_1'] },
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
    targetAmount: 3,
    rewardGold: 300,
    rewardExp: 150,
    requirements: { minLevel: 3, questCompleted: ['mq_1_2'] },
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
    targetId: 'orc',
    targetAmount: 1,
    rewardGold: 500,
    rewardExp: 300,
    requirements: { questCompleted: ['mq_1_3'] },
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
    targetId: 'orc_general',
    targetAmount: 1,
    rewardGold: 1000,
    rewardExp: 1000,
    rewardItems: [{ itemId: 'potion_high', amount: 3 }],
    requirements: { minLevel: 5, questCompleted: ['mq_1_4'] },
    recommendedLevel: 5
  },
  {
    id: 'mq_2_1',
    category: 'main',
    chapter: 2,
    subChapter: 1,
    title: 'CH2-1: 二人の連携',
    description: '救出した冒険者「エリアス」が恩返しに協力してくれるそうだ。彼と共にダンジョンへ潜り、連携の感覚を掴め。',
    type: 'hunt',
    targetId: 'slime', 
    targetAmount: 5,
    rewardGold: 300,
    rewardExp: 200,
    requirements: { questCompleted: ['mq_1_5'], minLevel: 6 },
    recommendedLevel: 6
  },
  {
    id: 'mq_2_2',
    category: 'main',
    chapter: 2,
    subChapter: 2,
    title: 'CH2-2: 死角なき行軍',
    description: '中層への道が開かれた。エリアスと共に地下6階を目指し、新たな素材を持ち帰れ。',
    type: 'reach',
    targetAmount: 6,
    rewardGold: 500,
    rewardExp: 300,
    requirements: { questCompleted: ['mq_2_1'] },
    recommendedLevel: 7
  },
  {
    id: 'mq_2_3',
    category: 'main',
    chapter: 2,
    subChapter: 3,
    title: 'CH2-3: 中層への挑戦',
    description: '地下7階からは環境がガラリと変わる。状態異常攻撃を行うモンスターも現れるため、慎重に進め。',
    type: 'reach',
    targetAmount: 9,
    rewardGold: 600,
    rewardExp: 400,
    requirements: { questCompleted: ['mq_2_2'] },
    recommendedLevel: 8
  },
  {
    id: 'mq_2_4',
    category: 'main',
    chapter: 2,
    subChapter: 4,
    title: 'CH2-4: ライバルの嘲笑',
    description: '他のファミリアの団員たちと小競り合いになった。実力を示し、彼らを黙らせるためにオーク・リーダーを討伐せよ。',
    type: 'hunt',
    targetId: 'orc',
    targetAmount: 5,
    rewardGold: 800,
    rewardExp: 500,
    requirements: { questCompleted: ['mq_2_3'] },
    recommendedLevel: 9
  },
  {
    id: 'mq_2_5',
    category: 'main',
    chapter: 2,
    subChapter: 5,
    title: 'CH2-5: 双頭の番犬',
    description: '【ボス討伐】第2章クライマックス。中層の門番「ケルベロス」が立ちはだかる。仲間との連携で活路を開け！',
    type: 'hunt',
    targetId: 'cerberus',
    targetAmount: 1,
    rewardGold: 2000,
    rewardExp: 1500,
    rewardItems: [{ itemId: 'elixir', amount: 1 }],
    requirements: { minLevel: 10, questCompleted: ['mq_2_4'] },
    recommendedLevel: 10
  },

  // ==========================================
  // 第3章：深淵からの呼び声
  // ==========================================
  {
    id: 'mq_3_1',
    category: 'main',
    chapter: 3,
    subChapter: 1,
    title: 'CH3-1: 異変の予兆',
    description: '中層よりさらに深く、地下11階付近で「ありえない現象」が報告されている。調査に向かえ。',
    type: 'reach',
    targetAmount: 11,
    rewardGold: 1000,
    rewardExp: 800,
    requirements: { 
      questCompleted: ['mq_2_5'],
      minLevel: 12 
    },
    recommendedLevel: 12
  },
  {
    id: 'mq_3_2',
    category: 'main',
    chapter: 3,
    subChapter: 2,
    title: 'CH3-2: 絶望の宴',
    description: '【危険】調査隊からの連絡が途絶えた。地下12階で「モンスターハウス」の発生が疑われる。準備を万全にして生存者を捜索せよ。',
    type: 'hunt',
    targetId: 'orc', // 大量発生する敵の代表
    targetAmount: 10,
    rewardGold: 1500,
    rewardExp: 1200,
    requirements: { questCompleted: ['mq_3_1'] },
    recommendedLevel: 13
  },
  {
    id: 'mq_3_3',
    category: 'main',
    chapter: 3,
    subChapter: 3,
    title: 'CH3-3: 黒い石の謎',
    description: 'モンスターハウスの跡地から、見たこともない「黒い魔石」が見つかった。分析のため、サンプルを5つ持ち帰れ。',
    type: 'collect',
    targetId: 'black_magic_stone',
    targetAmount: 5,
    rewardGold: 2000,
    rewardExp: 1500,
    requirements: { questCompleted: ['mq_3_2'] },
    recommendedLevel: 14
  },
  {
    id: 'mq_3_4',
    category: 'main',
    chapter: 3,
    subChapter: 4,
    title: 'CH3-4: 暴走する迷宮',
    description: 'ダンジョン自体が生きているかのように構造を変えている。深層へ続く道を探し出し、地下15階へ到達せよ。',
    type: 'reach',
    targetAmount: 15,
    rewardGold: 2500,
    rewardExp: 2000,
    requirements: { questCompleted: ['mq_3_3'] },
    recommendedLevel: 15
  },
  {
    id: 'mq_3_5',
    category: 'main',
    chapter: 3,
    subChapter: 5,
    title: 'CH3-5: 融合する異形',
    description: '【ボス討伐】異変の元凶と思われる反応がある。機械と生物が融合した「キメラ・ゴーレム」を破壊せよ。',
    type: 'hunt',
    targetId: 'chimera_golem', // 第3章ボス
    targetAmount: 1,
    rewardGold: 4000,
    rewardExp: 3000,
    rewardItems: [{ itemId: 'hero_badge', amount: 1 }],
    requirements: { minLevel: 15, questCompleted: ['mq_3_4'] },
    recommendedLevel: 16
  }
];
