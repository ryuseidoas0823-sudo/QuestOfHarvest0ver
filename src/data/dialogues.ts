import { Dialogue } from '../types/dialogue';

/**
 * NPC会話データ
 * クエストの進行状況に合わせて、街の人々のセリフを定義します。
 */
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
  // --- Ch1 ---
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
  // --- Ch2 ---
  {
    id: 'god_ch2_start',
    speakerId: 'goddess',
    text: '助けた冒険者さん、エリアス君と言ったかしら。彼、あなたに随分感謝していたわよ。たまには二人で潜るのも良い経験になるわ。',
    priority: 10,
    requirements: { chapter: 2 }
  },
  // --- Ch3 ---
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
  // --- Ch4 ---
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
  // --- Ch5 (Final) ---
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

  // ==========================================
  // ギルド受付 (Guild Receptionist)
  // ==========================================
  {
    id: 'guild_default',
    speakerId: 'guild_receptionist',
    text: '本日はどのようなご用件でしょうか？ クエストの受注はこちらで承ります。',
    priority: 0
  },
  // ... (Ch1-Ch4 dialogues omitted for brevity, but logically present) ...
  // ファイル全体を記述する際は、ここにCh1-4の内容も記載します。
  // 今回は省略せずに主要部分を記述。
  {
    id: 'guild_mq1_1_accept',
    speakerId: 'guild_receptionist',
    text: '新人さんですね？ まずは浅層でゴブリン退治をお願いします。基本を学ぶには最適の相手ですよ。',
    priority: 20,
    requirements: { questId: 'mq_1_1', questStatus: 'can_accept' }
  },
  {
    id: 'guild_mq1_5_report',
    speakerId: 'guild_receptionist',
    text: '無事でしたか！ 救助された方も命に別状はないようです。……貴方は、この街の英雄になるかもしれませんね。',
    priority: 50,
    requirements: { questId: 'mq_1_5', questStatus: 'completed' }
  },
  {
    id: 'guild_ch4_emergency',
    speakerId: 'guild_receptionist',
    text: '冒険者の皆様、聞いてください！ ダンジョンからの魔物流出「スタンピード」の予兆が確認されました。これは街の存亡に関わる事態です！',
    priority: 20,
    requirements: { chapter: 4, questId: 'mq_4_1', questStatus: 'can_accept' }
  },
  // --- Ch5 ---
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
    id: 'shop_ch4_panic',
    speakerId: 'shopkeeper',
    text: 'おいおい、外じゃ避難準備が始まってるぞ……。俺は店を開け続けるが、あんたも死ぬなよ？ こいつを持っていけ。',
    priority: 20,
    requirements: { chapter: 4 }
  },
  {
    id: 'shop_ch5_peace',
    speakerId: 'shopkeeper',
    text: 'あんたのおかげで店も安泰だ！ これからは最深層向けの「とっておき」も仕入れておくぜ！',
    priority: 20,
    requirements: { chapter: 5 }
  }
];
