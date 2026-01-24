// ... existing code ...
import { dialogues } from './data/dialogues';
import { Dialogue, SpeakerId } from './types/dialogue';
import { Quest } from './types/quest';

/**
 * 経験値計算などの既存関数...
 */

// ... existing code ...

/**
 * 現在の状態に基づいて、最も優先度の高い会話データを取得する
 * @param speakerId 話者のID
 * @param chapter 現在の章
 * @param activeQuests 受注中のクエストリスト
 * @param completedQuestIds 完了（報告済み）のクエストIDリスト
 * @param availableQuestIds 受注可能なクエストIDリスト
 * @param readyToReportQuestIds 報告待ち（条件達成済み）のクエストIDリスト
 */
export const getBestDialogue = (
  speakerId: SpeakerId,
  chapter: number,
  activeQuests: Quest[],
  completedQuestIds: string[],
  availableQuestIds: string[],
  readyToReportQuestIds: string[] = []
): Dialogue | null => {
  // 指定された話者の会話のみを抽出
  const speakerDialogues = dialogues.filter(d => d.speakerId === speakerId);

  // 条件を満たす会話をフィルタリング
  const validDialogues = speakerDialogues.filter(d => {
    // 条件がない場合は常にOK（デフォルト会話など）
    if (!d.requirements) return true;

    const { questId, questStatus, chapter: reqChapter } = d.requirements;

    // 章の条件: 指定がある場合、現在の章と一致すること
    if (reqChapter !== undefined && chapter !== reqChapter) {
        return false;
    }

    // クエスト条件
    if (questId && questStatus) {
        const isActive = activeQuests.some(q => q.id === questId);
        const isFinished = completedQuestIds.includes(questId);
        const isCanAccept = availableQuestIds.includes(questId);
        const isReadyToReport = readyToReportQuestIds.includes(questId);

        // 'finished': 報告まで完了している状態
        if (questStatus === 'finished' && !isFinished) return false;
        
        // 'can_accept': クエストボードに出現中
        if (questStatus === 'can_accept' && !isCanAccept) return false;
        
        // 'active': 受注中（進行中〜報告待ちを含む）
        if (questStatus === 'active' && !isActive) return false;

        // 'completed': 条件達成して報告待ちの状態（未報告）
        // ※activeかつreadyToReportであること
        if (questStatus === 'completed' && !isReadyToReport) return false;
    }

    return true;
  });

  // 優先度が高い順にソート (降順)
  validDialogues.sort((a, b) => b.priority - a.priority);

  // 最も優先度の高い会話を返す
  return validDialogues.length > 0 ? validDialogues[0] : null;
};
