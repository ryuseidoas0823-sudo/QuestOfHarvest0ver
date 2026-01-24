import { Quest } from '../types/quest';

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_main_001',
    title: '新人狩りの噂',
    description: '浅層で冒険者が行方不明になる事件が多発している。ギルドからの依頼で調査に向かい、原因を排除せよ。',
    rank: 'F',
    reward: {
      gold: 500,
      experience: 100
    },
    isKeyQuest: true, // シナリオ分岐に関わる重要クエスト
    requiredLevel: 1
  },
  {
    id: 'q_sub_001',
    title: '薬草の採取依頼',
    description: 'ポーションの材料となる薬草が不足している。ダンジョン内で採取してきてほしい。',
    rank: 'F',
    reward: {
      gold: 200,
      experience: 50
    },
    requiredLevel: 1
  },
  {
    id: 'q_sub_002',
    title: 'ゴブリンの掃討',
    description: '繁殖期を迎えたゴブリンが増えすぎている。10体ほど間引いてくれ。',
    rank: 'E',
    reward: {
      gold: 800,
      experience: 150
    },
    requiredLevel: 2
  },
  {
    id: 'q_adv_001',
    title: '希少鉱石の探索',
    description: '武具の強化に必要な鉱石が見つかったとの噂がある。鍛冶師ドランのために確保せよ。',
    rank: 'D',
    reward: {
      gold: 1500,
      experience: 300
    },
    requiredLevel: 5
  }
];
