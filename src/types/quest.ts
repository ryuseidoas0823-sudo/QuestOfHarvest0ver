export type QuestRank = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface QuestReward {
  gold: number;
  items?: string[]; // アイテムID
  experience: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rank: QuestRank;
  reward: QuestReward;
  isKeyQuest?: boolean; // メインシナリオの分岐に関わる重要クエストか
  requiredLevel?: number;
  // 分岐ルートのタグ（例: 'law', 'chaos' など）は将来的に拡張
}

export type QuestStatus = 'available' | 'accepted' | 'completed' | 'failed';

export interface PlayerQuestState {
  questId: string;
  status: QuestStatus;
}
