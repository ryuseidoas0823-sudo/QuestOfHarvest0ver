import { Dialogue } from '../types/dialogue';

/**
 * NPC会話データ
 * クエストの進行状況に合わせて、街の人々のセリフを定義します。
 * priority: 
 * 0: デフォルト
 * 10: 章の進行
 * 20: 特定クエスト受注可能
 * 30: 特定クエスト受注中
 * 40: 特定クエスト完了（報告前）
 */
export const dialogues: Dialogue[] = [
  // ==========================================
  // 女神 (Goddess) - ファミリアホーム
  // ==========================================
  {
    id: 'god_default',
    speakerId: 'goddess',
    text: 'おかえりなさい。怪我はない？ 無理だけはしないでね。',
    priority: 0
  },
  // 第1章 オープニング
  {
    id: 'god_ch1_start',
    speakerId: 'goddess',
    text: 'さあ、冒険の始まりね。まずはギルドで登録を済ませて、バベルの空気を肌で感じてきなさい。',
    priority: 10,
    requirements: { chapter: 1, questId: 'mq_1_1', questStatus: 'can_accept' }
  },
  // ボス戦前 (不穏な気配)
  {
    id: 'god_ch1_boss_pre',
    speakerId: 'goddess',
    text: '……ダンジョンの奥から、嫌な気配を感じるわ。十分に準備をしてから挑みなさい。決して命を粗末にしてはダメよ。',
    priority: 30,
    requirements: { questId: 'mq_1_5', questStatus: 'active' }
  },
  // ボス撃破後 (救助成功)
  {
    id: 'god_ch1_boss_post',
    speakerId: 'goddess',
    text: 'よく戻ったわね！ あの子も無事よ。……あなたのその勇気、私は誇りに思うわ。',
    priority: 40,
    requirements: { questId: 'mq_1_5', questStatus: 'completed' }
  },

  // ==========================================
  // ギルド受付 (Guild Receptionist) - 冒険者ギルド
  // ==========================================
  {
    id: 'guild_default',
    speakerId: 'guild_receptionist',
    text: '本日はどのようなご用件でしょうか？ クエストの受注はこちらで承ります。',
    priority: 0
  },
  
  // --- CH1-1: 冒険の始まり ---
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

  // --- CH1-2: 準備を整えよ (魔石収集) ---
  {
    id: 'guild_mq1_2_accept',
    speakerId: 'guild_receptionist',
    text: 'ダンジョン探索には資金が必要です。魔石を集めて換金し、装備を整えることを覚えましょう。',
    priority: 20,
    requirements: { questId: 'mq_1_2', questStatus: 'can_accept' }
  },
  
  // --- CH1-3: 未知なる深層へ (B3F到達) ---
  {
    id: 'guild_mq1_3_accept',
    speakerId: 'guild_receptionist',
    text: '少し慣れてきたようですね。次は地下3階への到達目標です。敵も強くなりますから、ポーションの準備を忘れずに。',
    priority: 20,
    requirements: { questId: 'mq_1_3', questStatus: 'can_accept' }
  },

  // --- CH1-4: 不穏な影 (オーク討伐) ---
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

  // --- CH1-5: 凶刃との遭遇 (ボス戦) ---
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
    priority: 40, // 優先度高め
    requirements: { questId: 'mq_1_5', questStatus: 'active' }
  },

  // ==========================================
  // ショップ店員 (Shopkeeper) - 市場
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
