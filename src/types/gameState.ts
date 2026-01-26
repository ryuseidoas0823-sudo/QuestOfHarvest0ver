export type GameScreen = 
  | 'title' 
  | 'name_input' // 追加
  | 'job_select' 
  | 'god_select' 
  | 'tutorial'
  | 'town' 
  | 'dungeon' 
  | 'battle' 
  | 'result' 
  | 'shop'
  | 'status_upgrade'
  | 'inventory';

export interface GameState {
  screen: GameScreen;
  // 他に必要な状態があれば追加
}
