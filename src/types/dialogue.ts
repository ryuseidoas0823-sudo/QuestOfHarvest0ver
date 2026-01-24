// 会話を行うNPCのID
export type SpeakerId = 'goddess' | 'guild_receptionist' | 'shopkeeper' | 'unknown';

// 会話が発生する条件
export interface DialogueRequirements {
  // 特定のクエストに関連する条件
  questId?: string;
  // そのクエストの状態（'active':受注中, 'completed':完了済(未報告), 'finished':報告完了, 'can_accept':受注可能）
  questStatus?: 'active' | 'completed' | 'finished' | 'can_accept';
  
  // 進行度（章）
  chapter?: number;
  
  // プレイヤーレベルなど
  minLevel?: number;
}

export interface Dialogue {
  id: string;
  speakerId: SpeakerId;
  text: string; // 表示されるメッセージ
  
  // 条件（指定がない場合はデフォルトのセリフとして扱う）
  requirements?: DialogueRequirements;
  
  // 優先度（条件が重複した場合、数値が高い方を優先表示する）
  priority: number;
}

// 以下、ビルドエラー修正のために追加した型定義

export interface DialogueChoice {
  text: string;
  nextId: string | null; // nullなら会話終了
  action?: string; // 選択時に実行するアクションID
}

export interface DialogueNode {
  id: string;
  speakerId: SpeakerId;
  text: string;
  choices?: DialogueChoice[]; // 選択肢がない場合は「次へ」ボタンまたは終了
  nextId?: string | null; // 選択肢がない場合の遷移先
}

export interface DialogueTree {
  id: string;
  rootNodeId: string;
  nodes: { [key: string]: DialogueNode };
}
