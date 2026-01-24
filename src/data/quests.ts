import { Quest } from '../types/quest';

/**
 * クエストデータ定義
 * ID命名規則: mq_{chapter}_{subChapter}
 */
export const quests: Quest[] = [
  // ==========================================
  // 第1章：駆け出し冒険者の洗礼
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

  // ==========================================
  // 第2章：背中を預ける絆
  // ==========================================
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
    requirements: { questCompleted: ['mq_2_5'], minLevel: 12 },
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
    targetId: 'orc',
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
    targetId: 'chimera_golem',
    targetAmount: 1,
    rewardGold: 4000,
    rewardExp: 3000,
    rewardItems: [{ itemId: 'hero_badge', amount: 1 }],
    requirements: { minLevel: 15, questCompleted: ['mq_3_4'] },
    recommendedLevel: 16
  },

  // ==========================================
  // 第4章：決戦前夜
  // ==========================================
  {
    id: 'mq_4_1',
    category: 'main',
    chapter: 4,
    subChapter: 1,
    title: 'CH4-1: 緊急招集',
    description: 'ギルドから全ファミリアへ緊急招集がかかった。ダンジョンからの魔物の流出「スタンピード」の予兆があるという。',
    type: 'reach',
    targetAmount: 1,
    rewardGold: 500,
    rewardExp: 500,
    requirements: { questCompleted: ['mq_3_5'] },
    recommendedLevel: 17
  },
  {
    id: 'mq_4_2',
    category: 'main',
    chapter: 4,
    subChapter: 2,
    title: 'CH4-2: 前線の防衛',
    description: '地下16階〜17階にかけて、深層から魔物が溢れ出している。防衛ラインを維持するため、敵を掃討せよ。',
    type: 'hunt',
    targetId: 'minotaur',
    targetAmount: 3,
    rewardGold: 2500,
    rewardExp: 2000,
    requirements: { questCompleted: ['mq_4_1'] },
    recommendedLevel: 17
  },
  {
    id: 'mq_4_3',
    category: 'main',
    chapter: 4,
    subChapter: 3,
    title: 'CH4-3: 闇の軍勢',
    description: '魔物の中に統率された動きを見せる「骸骨兵」の部隊が確認された。指揮系統を乱すため、スケルトン兵を排除せよ。',
    type: 'hunt',
    targetId: 'skeleton_soldier',
    targetAmount: 10,
    rewardGold: 3000,
    rewardExp: 2200,
    requirements: { questCompleted: ['mq_4_2'] },
    recommendedLevel: 18
  },
  {
    id: 'mq_4_4',
    category: 'main',
    chapter: 4,
    subChapter: 4,
    title: 'CH4-4: 決戦準備',
    description: '敵の本隊との決戦が近い。鍛冶師が「対魔装備」を作るために必要な素材を集めてきてほしい。',
    type: 'collect',
    targetId: 'magic_stone_small',
    targetAmount: 20,
    rewardGold: 4000,
    rewardExp: 2500,
    requirements: { questCompleted: ['mq_4_3'] },
    recommendedLevel: 19
  },
  {
    id: 'mq_4_5',
    category: 'main',
    chapter: 4,
    subChapter: 5,
    title: 'CH4-5: 深淵の指揮官',
    description: '【ボス討伐】魔物の軍勢を率いる指揮官の居場所を突き止めた。街への侵攻を阻止するため、「深淵の指揮官」を討て！',
    type: 'hunt',
    targetId: 'abyss_commander',
    targetAmount: 1,
    rewardGold: 10000,
    rewardExp: 5000,
    rewardItems: [{ itemId: 'elixir', amount: 3 }],
    requirements: { minLevel: 20, questCompleted: ['mq_4_4'] },
    recommendedLevel: 20
  },

  // ==========================================
  // 第5章：神々の真実（最終決戦）
  // ==========================================
  {
    id: 'mq_5_1',
    category: 'main',
    chapter: 5,
    subChapter: 1,
    title: 'CH5-1: 最深層へ',
    description: '街の危機は去った。しかし、ダンジョンの最深部にはまだ何かが眠っている。地下25階を目指し、真実を確かめろ。',
    type: 'reach',
    targetAmount: 25,
    rewardGold: 5000,
    rewardExp: 4000,
    requirements: { questCompleted: ['mq_4_5'], minLevel: 22 },
    recommendedLevel: 22
  },
  {
    id: 'mq_5_2',
    category: 'main',
    chapter: 5,
    subChapter: 2,
    title: 'CH5-2: 塔の守護者',
    description: '「無限の塔」への入り口を守る強力なガーディアンが行く手を阻んでいる。彼らを突破し、先へ進め。',
    type: 'hunt',
    targetId: 'tower_sentinel',
    targetAmount: 5,
    rewardGold: 6000,
    rewardExp: 5000,
    requirements: { questCompleted: ['mq_5_1'] },
    recommendedLevel: 23
  },
  {
    id: 'mq_5_3',
    category: 'main',
    chapter: 5,
    subChapter: 3,
    title: 'CH5-3: 過去の遺恨',
    description: 'ダンジョン内で「古竜の幼体」を発見。かつて神々に封印された厄災の一部が漏れ出しているようだ。',
    type: 'hunt',
    targetId: 'ancient_dragon_whelp',
    targetAmount: 3,
    rewardGold: 8000,
    rewardExp: 6000,
    requirements: { questCompleted: ['mq_5_2'] },
    recommendedLevel: 24
  },
  {
    id: 'mq_5_4',
    category: 'main',
    chapter: 5,
    subChapter: 4,
    title: 'CH5-4: 閉ざされた扉',
    description: 'ついに最下層の扉の前まで到達した。扉を開くには、各階層のボスが持っていた魔力が必要だ。準備を整えよ。',
    type: 'reach',
    targetAmount: 30, // 便宜上30階
    rewardGold: 10000,
    rewardExp: 8000,
    requirements: { questCompleted: ['mq_5_3'] },
    recommendedLevel: 25
  },
  {
    id: 'mq_5_5',
    category: 'main',
    chapter: 5,
    subChapter: 5,
    title: 'CH5-5: 神々の真実',
    description: '【最終決戦】塔の扉の前に立つのは、かつてこの街を救おうとして堕ちた英雄の成れの果てだった。彼を解放し、新たな伝説を始めよう。',
    type: 'hunt',
    targetId: 'fallen_hero',
    targetAmount: 1,
    rewardGold: 50000,
    rewardExp: 20000,
    rewardItems: [{ itemId: 'hero_badge', amount: 1 }],
    requirements: { minLevel: 25, questCompleted: ['mq_5_4'] },
    recommendedLevel: 25
  },

  // ==========================================
  // エンドコンテンツ：無限の塔 (クリア後)
  // ==========================================
  {
    id: 'ex_tower_1',
    category: 'main', // または 'challenge'
    chapter: 6, // 便宜上6章扱い
    title: 'EX: 無限の塔への挑戦',
    description: '【高難易度・繰り返し可】未知の領域へ足を踏み入れた。己の限界に挑み、地下50階を目指せ。',
    type: 'reach',
    targetAmount: 50,
    rewardGold: 30000,
    rewardExp: 10000,
    requirements: { questCompleted: ['mq_5_5'] }, // ラスボス撃破後
    recommendedLevel: 30
  },

  // ==========================================
  // サブクエスト (レベル上げ・資金稼ぎ用)
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
    requirements: { minLevel: 1 },
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
    requirements: { minLevel: 2 },
    recommendedLevel: 2
  },
  // --- 中盤用サブクエスト ---
  {
    id: 'sq_ch3_hunt',
    category: 'sub',
    title: '骸骨狩り',
    description: '【Lv12以上推奨】増えすぎたスケルトン兵を間引いてほしい。中層攻略の良い訓練になるだろう。',
    type: 'hunt',
    targetId: 'skeleton_soldier',
    targetAmount: 8,
    rewardGold: 1200,
    rewardExp: 800,
    requirements: { minLevel: 12, questCompleted: ['mq_2_5'] },
    recommendedLevel: 12
  },
  {
    id: 'sq_ch4_supply',
    category: 'sub',
    title: '防衛物資の調達',
    description: '【Lv18以上推奨】前線基地で魔石が不足している。ミノタウロスなどの強敵を倒し、質の良い魔石を集めてくれ。',
    type: 'collect',
    targetId: 'magic_stone_small', // 本当は上位素材がいいが既存流用
    targetAmount: 10,
    rewardGold: 3000,
    rewardExp: 2000,
    requirements: { minLevel: 18, questCompleted: ['mq_4_1'] },
    recommendedLevel: 18
  }
];
