import { GameEvent } from '../types/event';

export const randomEvents: GameEvent[] = [
  {
    id: 'fountain_of_healing',
    title: '癒やしの泉',
    description: '透き通った水を湛える泉を見つけた。神聖な気配がする。',
    choices: [
      { text: '水を飲む', effect: 'heal', value: 999 },
      { text: '立ち去る', effect: 'leave' }
    ]
  },
  {
    id: 'suspicious_chest',
    title: '怪しい宝箱',
    description: '古びた宝箱が置かれている。罠が仕掛けられているかもしれない。',
    choices: [
      { text: '無理やり開ける', effect: 'item', itemId: 'potion_high', successRate: 0.7 }, // 30%で失敗してダメージ等の処理が必要だが今回は簡易化
      { text: '慎重に調べる', effect: 'item', itemId: 'potion', successRate: 1.0 },
      { text: '無視する', effect: 'leave' }
    ]
  },
  {
    id: 'wandering_merchant',
    title: '行商人の落とし物',
    description: '荷車が襲われた跡がある。散らばった荷物の中に使えそうなものがある。',
    choices: [
      { text: '拾う', effect: 'item', itemId: 'return_scroll' },
      { text: '祈りを捧げる', effect: 'heal', value: 20 }
    ]
  },
  {
    id: 'trap_pit',
    title: '落とし穴',
    description: '足元の床が抜け落ちた！',
    choices: [
      { text: '痛ッ！', effect: 'damage', value: 30 }
    ]
  }
];
