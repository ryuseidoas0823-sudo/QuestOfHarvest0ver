export interface DialogueSpeaker {
  id: string;
  name: string;
  title?: string;
  color?: string; // 名前の表示色
}

export interface DialogueChoice {
  text: string;
  nextId: string | null; // nullの場合は会話終了
  action?: string; // 特殊アクション（例: 'accept_quest'）
}

export interface DialogueNode {
  id: string;
  speakerId: string;
  text: string;
  nextId: string | null; // 次のノードID（nullなら終了または選択肢待ち）
  choices?: DialogueChoice[];
}

export interface DialogueTree {
  id: string;
  rootNodeId: string;
  nodes: Record<string, DialogueNode>;
}
