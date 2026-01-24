// クエストの種類（討伐、収集、到達、会話など）
export type QuestType = 'hunt' | 'collect' | 'reach';

// クエストのカテゴリ（メインストーリー、サブ、イベントなど）
// 拡張性: 今後 'event' や 'character'（キャラクエ）などを追加可能
export type QuestCategory = 'main' | 'sub' | 'daily';

export interface Quest {
  id: string;
  title: string;
  description: string;
  
  // --- シナリオ管理用フィールド ---
  category: QuestCategory; // クエストの分類
  chapter?: number;        // メインクエストの場合の章番号 (例: 1)
  subChapter?: number;     // メインクエストの場合の節番号 (例: 5)
  // ---------------------------

  type: QuestType;
  targetId?: string; // Enemy ID or Item ID
  targetAmount?: number;
  
  // 報酬
  rewardGold: number;
  rewardExp: number;
  rewardItems?: { itemId: string; amount: number }[];
  
  // 受注条件
  requirements?: {
    minLevel?: number;
    questCompleted?: string[]; // 前提クエストID
    // 将来的な拡張: specificJob?: JobId[] など
  };

  // UI表示用: 推奨レベルなど
  recommendedLevel?: number;
}
