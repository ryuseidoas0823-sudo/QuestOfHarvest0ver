export type SkillType = 'attack' | 'heal' | 'buff';
export type TargetType = 'single' | 'area' | 'self';

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  target: TargetType;
  power: number; // 攻撃倍率 または 回復量
  cost: number; // 消費MP (今回は簡易実装のため未使用だが定義しておく)
  cooldown: number; // クールダウンに必要なターン数
  range: number; // 射程距離
  assetKey?: string; // アイコン用アセットキー
}
