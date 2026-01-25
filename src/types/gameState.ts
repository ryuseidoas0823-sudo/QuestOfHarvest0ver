// 画面状態の型定義
export type GameScreen = 
  | 'title'         // タイトル画面
  | 'job_select'    // 職業選択画面
  | 'god_select'    // 神選択画面
  | 'town'          // 街（拠点）
  | 'dungeon'       // ダンジョン探索中
  | 'result'        // リザルト（ゲームオーバー/クリア）
  | 'tutorial';     // チュートリアル

// ゲームの進行状況などを管理する型
export interface GameState {
  currentScreen: GameScreen;
  isPaused: boolean;
  floorDepth: number;
}
