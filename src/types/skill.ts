/**
 * スキルの効果タイプ
 */
export type SkillEffectType = 
  | 'damage'      // 直接ダメージ
  | 'heal'        // HP回復
  | 'buff_atk'    // 攻撃力アップ
  | 'buff_def'    // 防御力アップ
  | 'dash'        // 高速移動
  | 'projectile'; // 遠距離攻撃（弾発射）

/**
 * スキルの定義データ
 */
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  
  // クールダウン（ミリ秒）
  cooldown: number;
  
  // 消費コスト（MPやSPなどを想定、現在は仮置き）
  cost: number;
  
  // 射程距離（グリッド数）
  range: number;
  
  // 効果の種類
  effectType: SkillEffectType;
  
  // 効果量（ダメージ倍率や回復量など）
  value: number;
  
  // エフェクトアニメーションのキー
  animationKey: string;

  // ターゲットタイプ
  target: 'enemy' | 'self' | 'ally' | 'area';
}
