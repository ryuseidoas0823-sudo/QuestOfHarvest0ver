import { storyQuests } from './quests/story';
import { subQuests } from './quests/sub';
import { Quest } from '../types/quest';

/**
 * 全クエストデータの統合
 * プロジェクトの他の部分は引き続き '../data/quests' から 'quests' をインポートできます。
 */
export const quests: Quest[] = [
  ...storyQuests,
  ...subQuests
];
