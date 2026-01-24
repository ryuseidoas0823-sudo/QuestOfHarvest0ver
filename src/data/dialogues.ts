import { DialogueSpeaker, DialogueTree } from '../types/dialogue';

export const SPEAKERS: Record<string, DialogueSpeaker> = {
  milia: { id: 'milia', name: 'ミリア', title: 'ギルド受付嬢', color: 'text-yellow-400' },
  doran: { id: 'doran', name: 'ドラン', title: '鍛冶師', color: 'text-orange-400' },
  god: { id: 'god', name: '主神', title: 'ファミリアの主', color: 'text-indigo-400' },
  system: { id: 'system', name: 'System', color: 'text-gray-400' },
};

export const DIALOGUES: Record<string, DialogueTree> = {
  // ギルド：最初の挨拶
  'guild_welcome': {
    id: 'guild_welcome',
    rootNodeId: 'start',
    nodes: {
      'start': {
        id: 'start',
        speakerId: 'milia',
        text: 'ようこそ、迷宮都市バベルの冒険者ギルドへ！\n貴方が新しく登録された冒険者さんですね。',
        nextId: 'intro_2'
      },
      'intro_2': {
        id: 'intro_2',
        speakerId: 'milia',
        text: '私は担当のミリアです。ダンジョン探索のサポートをさせていただきます。\nまずは掲示板の「新人向けクエスト」を受けてみてください。',
        nextId: null
      }
    }
  },
  // ギルド：会話コマンド
  'guild_talk': {
    id: 'guild_talk',
    rootNodeId: 'root',
    nodes: {
      'root': {
        id: 'root',
        speakerId: 'milia',
        text: '何か知りたいことはありますか？',
        nextId: null,
        choices: [
          { text: 'この街について', nextId: 'about_town' },
          { text: 'ダンジョンの噂', nextId: 'rumor' },
          { text: 'なんでもない', nextId: null }
        ]
      },
      'about_town': {
        id: 'about_town',
        speakerId: 'milia',
        text: 'この街はダンジョンの真上に作られた「迷宮都市」です。\n多くの神々が降臨し、冒険者たちと契約を結んで「ファミリア」を作っています。',
        nextId: 'root'
      },
      'rumor': {
        id: 'rumor',
        speakerId: 'milia',
        text: '最近、浅層で「新人狩り」が出るという噂があります……。\n他の冒険者と遭遇しても、安易に信用しない方がいいかもしれません。',
        nextId: 'root'
      }
    }
  },
  // ホーム：会話
  'home_talk': {
    id: 'home_talk',
    rootNodeId: 'start',
    nodes: {
      'start': {
        id: 'start',
        speakerId: 'god',
        text: 'おお、我が愛しき眷属よ。無事の帰還、何よりだ。\n今日の収穫はどうだった？',
        nextId: null
      }
    }
  }
};
