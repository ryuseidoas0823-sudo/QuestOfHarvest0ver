import { Dialogue } from '../types/dialogue';

export const dialogues: Dialogue[] = [
  // ==========================================
  // 女神 (Goddess)
  // ==========================================
  {
    id: 'god_default',
    speakerId: 'goddess',
    text: 'おかえりなさい。怪我はない？ 無理だけはしないでね。',
    priority: 0
  },
  {
    id: 'god_ch1_start',
    speakerId: 'goddess',
    text: 'さあ、冒険の始まりね。まずはギルドで登録を済ませて、バベルの空気を肌で感じてきなさい。',
    priority: 10,
    requirements: { chapter: 1, questId: 'mq_1_1', questStatus: 'can_accept' }
  },
  {
    id: 'god_ch1_boss_pre',
    speakerId: 'goddess',
    text: '……ダンジョンの奥から、嫌な気配を感じるわ。十分に準備をしてから挑みなさい。決して命を粗末にしてはダメよ。',
    priority: 30,
    requirements: { questId: 'mq_1_5', questStatus: 'active' }
  },
  {
    id: 'god_ch1_boss_post',
    speakerId: 'goddess',
    text: 'よく戻ったわね！ あの子も無事よ。……あなたのその勇気、私は誇りに思うわ。',
    priority: 40,
    requirements: { questId: 'mq_1_5', questStatus: 'completed' }
  },
  // 第2章
  {
    id: 'god_ch2_start',
    speakerId: 'goddess',
    text: '助けた冒険者さん、エリアス君と言ったかしら。彼、あなたに随分感謝していたわよ。たまには二人で潜るのも良い経験になるわ。',
    priority: 10,
    requirements: { chapter: 2 }
  },

  // ==========================================
  // ギルド受付 (Guild Receptionist)
  // ==========================================
  {
    id: 'guild_default',
    speakerId: 'guild_receptionist',
    text: '本日はどのようなご用件でしょうか？ クエストの受注はこちらで承ります。',
    priority: 0
  },
  {
    id: 'guild_mq1_1_accept',
    speakerId: 'guild_receptionist',
    text: '新人さんですね？ まずは浅層でゴブリン退治をお願いします。基本を学ぶには最適の相手ですよ。',
    priority: 20,
    requirements: { questId: 'mq_1_1', questStatus: 'can_accept' }
  },
  {
    id: 'guild_mq1_1_active',
    speakerId: 'guild_receptionist',
    text: 'ゴブリンは集団で襲ってくることがあります。囲まれないように注意してくださいね。',
    priority: 30,
    requirements: { questId: 'mq_1_1', questStatus: 'active' }
  },
  {
    id: 'guild_mq1_1_report',
    speakerId: 'guild_receptionist',
    text: 'お疲れ様でした！ 初仕事、見事なものです。報酬を受け取ってください。',
    priority: 40,
    requirements: { questId: 'mq_1_1', questStatus: 'completed' }
  },
  {
    id: 'guild_mq1_2_accept',
    speakerId: 'guild_receptionist',
    text: 'ダンジョン探索には資金が必要です。魔石を集めて換金し、装備を整えることを覚えましょう。',
    priority: 20,
    requirements: { questId: 'mq_1_2', questStatus: 'can_accept' }
  },
  {
    id: 'guild_mq1_3_accept',
    speakerId: 'guild_receptionist',
    text: '少し慣れてきたようですね。次は地下3階への到達目標です。敵も強くなりますから、ポーションの準備を忘れずに。',
    priority: 20,
    requirements: { questId: 'mq_1_3', questStatus: 'can_accept' }
  },
  {
    id: 'guild_mq1_4_accept',
    speakerId: 'guild_receptionist',
    text: '……少々妙ですね。浅層に強力な魔物の反応があります。斥候と思われる個体を排除してください。',
    priority: 20,
    requirements: { questId: 'mq_1_4', questStatus: 'can_accept' }
  },
  {
    id: 'guild_mq1_4_active',
    speakerId: 'guild_receptionist',
    text: 'くれぐれも無理はしないでください。危険だと感じたら、すぐに帰還を。',
    priority: 30,
    requirements: { questId: 'mq_1_4', questStatus: 'active' }
  },
  {
    id: 'guild_mq1_5_accept',
    speakerId: 'guild_receptionist',
    text: '【緊急依頼】です！ 深層からのイレギュラー、「オーク・ジェネラル」を確認しました。他の冒険者の安否も不明です。至急、討伐に向かってください！',
    priority: 30,
    requirements: { questId: 'mq_1_5', questStatus: 'can_accept' }
  },
  {
    id: 'guild_mq1_5_active',
    speakerId: 'guild_receptionist',
    text: 'ご武運を……！ 生還者の情報があれば、救助もお願いします！',
    priority: 40,
    requirements: { questId: 'mq_1_5', questStatus: 'active' }
  },
  {
    id: 'guild_mq1_5_report',
    speakerId: 'guild_receptionist',
    text: '無事でしたか！ 救助された方も命に別状はないようです。……貴方は、この街の英雄になるかもしれませんね。',
    priority: 50,
    requirements: { questId: 'mq_1_5', questStatus: 'completed' }
  },
  // 第2章
  {
    id: 'guild_ch2_start',
    speakerId: 'guild_receptionist',
    text: '先日助けた冒険者エリアス様が、貴方とのパーティ結成を希望されています。「パーティ編成」が可能になりましたよ。',
    priority: 20,
    requirements: { chapter: 2 }
  },

  // ==========================================
  // ショップ店員 (Shopkeeper)
  // ==========================================
  {
    id: 'shop_default',
    speakerId: 'shopkeeper',
    text: 'いらっしゃい！ 冒険に役立つアイテム、揃ってるよ！',
    priority: 0
  },
  {
    id: 'shop_poor',
    speakerId: 'shopkeeper',
    text: 'お金がないなら、ダンジョンで魔石を拾ってくるといい。この街じゃ魔石が金になるからな。',
    priority: 10,
    requirements: { chapter: 1, questId: 'mq_1_2', questStatus: 'active' }
  },
  {
    id: 'shop_boss_prep',
    speakerId: 'shopkeeper',
    text: 'デカい山に挑むんだって？ ポーションは多めに持っていきな。命あっての物種だぜ。',
    priority: 30,
    requirements: { questId: 'mq_1_5', questStatus: 'active' }
  }
];
