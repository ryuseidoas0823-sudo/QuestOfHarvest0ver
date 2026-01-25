import { SpeakerId, Dialogue } from './types/dialogue';
import { Quest } from './types/quest';
import { dialogues } from './data/dialogues';

export const calculateLevel = (exp: number): number => {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
};

export const calculateExpForLevel = (level: number): number => {
  return 100 * (level - 1) * (level - 1);
};

// 距離計算関数 (追加)
export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// 会話優先度ロジック
// 1. 報告可能なクエスト完了 (priority 100)
// 2. 進行中のクエスト (priority 80)
// 3. 受注可能なクエスト (priority 60)
// 4. 現在の章の会話 (priority 40)
// 5. その他 (priority 0)
export const getBestDialogue = (
  speakerId: SpeakerId,
  chapter: number,
  activeQuests: Quest[],
  completedQuestIds: string[],
  availableQuestIds: string[],
  readyToReportQuestIds: string[]
): Dialogue | null => {
  
  const relevantDialogues = dialogues.filter(d => d.speakerId === speakerId);

  // 優先度スコア付きの候補リストを作成
  const candidates = relevantDialogues.map(d => {
    let score = d.priority; // 基本優先度

    // クエスト要件のチェック
    if (d.requirements?.questId) {
      const qId = d.requirements.questId;
      const status = d.requirements.questStatus;

      if (status === 'finished' && readyToReportQuestIds.includes(qId)) {
        score += 100;
      } else if (status === 'active' && activeQuests.some(q => q.id === qId)) {
        score += 80;
      } else if (status === 'completed' && completedQuestIds.includes(qId)) {
        // 完了済み後の会話なら
        score += 20;
      } else if (status === 'can_accept' && availableQuestIds.includes(qId)) {
        score += 60;
      } else {
        // 条件不一致
        return { dialogue: d, score: -1 };
      }
    }

    // 章要件のチェック
    if (d.requirements?.chapter) {
      if (d.requirements.chapter === chapter) {
        score += 40;
      } else if (d.requirements.chapter > chapter) {
        return { dialogue: d, score: -1 };
      }
    }

    // レベル要件 (ここでは簡易的に省略、必要なら引数に追加)
    
    return { dialogue: d, score };
  });

  // スコアが高い順にソートし、有効なもの（スコア >= 0）の先頭を返す
  const best = candidates
    .filter(c => c.score >= 0)
    .sort((a, b) => b.score - a.score)[0];

  return best ? best.dialogue : null;
};
