import { Dialogue } from '../../types/dialogue';

export const storyDialogues: Dialogue[] = [
  // --- 第1章 ---
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
  // --- 第2章 ---
  {
    id: 'god_ch2_start',
    speakerId: 'goddess',
    text: '助けた冒険者さん、エリアス君と言ったかしら。彼、あなたに随分感謝していたわよ。たまには二人で潜るのも良い経験になるわ。',
    priority: 10,
    requirements: { chapter: 2 }
  },
  // --- 第3章 ---
  {
    id: 'god_ch3_start',
    speakerId: 'goddess',
    text: '……最近、ダンジョンの震動が激しくなっているわ。バベルの地下で、何かが目覚めようとしているのかもしれない。',
    priority: 10,
    requirements: { chapter: 3 }
  },
  {
    id: 'god_ch3_black_stone',
    speakerId: 'goddess',
    text: '「黒い魔石」……？ 見せて。……これは、ただの魔石じゃない。神の恩恵を拒絶するような、呪われた力を感じるわ。',
    priority: 30,
    requirements: { questId: 'mq_3_3', questStatus: 'active' }
  },
  // --- 第4章 ---
  {
    id: 'god_ch4_start',
    speakerId: 'goddess',
    text: 'ギルドから緊急招集……？ ついに恐れていたことが起きたのかもしれないわ。行ってらっしゃい、でも生きて帰ると約束して。',
    priority: 20,
    requirements: { chapter: 4 }
  },
  {
    id: 'god_ch4_final_battle',
    speakerId: 'goddess',
    text: '敵の指揮官が見つかったのね。……この戦いが終われば、バベルの運命が変わる。あなたの剣に、私の全ての祈りを込めるわ。',
    priority: 40,
    requirements: { questId: 'mq_4_5', questStatus: 'active' }
  },
  // --- 第5章 ---
  {
    id: 'god_ch5_start',
    speakerId: 'goddess',
    text: '街は救われた。でも、貴方はまだ満足していない顔をしているわね。……ええ、わかっているわ。貴方の目指す場所は、もっと深くにあるのよね。',
    priority: 20,
    requirements: { chapter: 5 }
  },
  {
    id: 'god_ch5_end',
    speakerId: 'goddess',
    text: 'まさか、あの「堕ちた英雄」を解放するなんて……。貴方はもう、立派な英雄ね。さあ、この先の「無限の塔」へ。私達の冒険は、まだ終わらないわ！',
    priority: 50,
    requirements: { questId: 'mq_5_5', questStatus: 'completed' }
  },

  // --- ギルド受付嬢 (ストーリー関連) ---
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
  // Ch2
  {
    id: 'guild_ch2_start',
    speakerId: 'guild_receptionist',
    text: '先日助けた冒険者エリアス様が、貴方とのパーティ結成を希望されています。「パーティ編成」が可能になりましたよ。',
    priority: 20,
    requirements: { chapter: 2 }
  },
  // Ch3
  {
    id: 'guild_ch3_mh_warning',
    speakerId: 'guild_receptionist',
    text: '【警告】現在、地下12階付近で「モンスターハウス」の発生率が異常上昇しています。単独行動は避け、パーティでの探索を強く推奨します。',
    priority: 30,
    requirements: { questId: 'mq_3_2', questStatus: 'active' }
  },
  {
    id: 'guild_ch3_report',
    speakerId: 'guild_receptionist',
    text: '無事の帰還、何よりです……。黒い魔石の調査結果が出るまで、ギルドとしても警戒レベルを引き上げることになりました。',
    priority: 40,
    requirements: { questId: 'mq_3_3', questStatus: 'completed' }
  },
  // Ch4
  {
    id: 'guild_ch4_emergency',
    speakerId: 'guild_receptionist',
    text: '冒険者の皆様、聞いてください！ ダンジョンからの魔物流出「スタンピード」の予兆が確認されました。これは街の存亡に関わる事態です！',
    priority: 20,
    requirements: { chapter: 4, questId: 'mq_4_1', questStatus: 'can_accept' }
  },
  {
    id: 'guild_ch4_defense',
    speakerId: 'guild_receptionist',
    text: '現在、主要ファミリアと連携し、地下17階に防衛ラインを構築中です。貴方にも前線の維持をお願いします！',
    priority: 30,
    requirements: { questId: 'mq_4_2', questStatus: 'active' }
  },
  {
    id: 'guild_ch4_boss',
    speakerId: 'guild_receptionist',
    text: '敵の指揮官「深淵の指揮官」を確認……！ これを討てば、敵の統率は崩壊するはずです。バベルの未来を、お願いします！',
    priority: 40,
    requirements: { questId: 'mq_4_5', questStatus: 'active' }
  },
  // Ch5
  {
    id: 'guild_ch5_tower',
    speakerId: 'guild_receptionist',
    text: '最深層へのルートが開通しました！ ですが、そこは未知の領域……「無限の塔」と呼ばれる場所です。十分に気をつけてください。',
    priority: 20,
    requirements: { chapter: 5 }
  },
  {
    id: 'guild_ch5_clear',
    speakerId: 'guild_receptionist',
    text: '信じられません……伝説の英雄と渡り合うなんて。貴方は間違いなく、このバベル最強の冒険者です！',
    priority: 50,
    requirements: { questId: 'mq_5_5', questStatus: 'completed' }
  }
];
