import { Quest } from '../../types/quest';

export const subQuests: Quest[] = [
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
    targetId: 'magic_stone_small',
    targetAmount: 10,
    rewardGold: 3000,
    rewardExp: 2000,
    requirements: { minLevel: 18, questCompleted: ['mq_4_1'] },
    recommendedLevel: 18
  }
];
