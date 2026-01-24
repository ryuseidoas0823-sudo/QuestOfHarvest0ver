import { Dialogue } from '../../types/dialogue';

export const commonDialogues: Dialogue[] = [
  // ==========================================
  // 女神 (Goddess)
  // ==========================================
  {
    id: 'god_default',
    speakerId: 'goddess',
    text: 'おかえりなさい。怪我はない？ 無理だけはしないでね。',
    priority: 0
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
