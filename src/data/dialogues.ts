import { storyDialogues } from './dialogues/story';
import { commonDialogues } from './dialogues/common';
import { Dialogue, SpeakerId } from '../types/dialogue';

export const dialogues: Dialogue[] = [
  ...storyDialogues,
  ...commonDialogues
];

// ビルドエラー修正: SPEAKERS定数の追加
export const SPEAKERS: Record<SpeakerId, { name: string; title?: string; color?: string }> = {
  goddess: {
    name: '女神',
    title: '我が主神',
    color: 'text-yellow-400'
  },
  guild_receptionist: {
    name: 'エイナ',
    title: 'ギルド受付嬢',
    color: 'text-green-400'
  },
  shopkeeper: {
    name: '店主',
    title: '武器屋',
    color: 'text-red-400'
  },
  unknown: {
    name: '？？？',
    color: 'text-gray-400'
  }
};
