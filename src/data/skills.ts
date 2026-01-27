import { Skill } from '../types/skill';
import { JobId } from '../types/job';

// スキルの定義（今回は型枠組みのみ）
export const SKILLS: Record<string, Skill> = {
  // 戦士スキル
  'smash': {
    id: 'smash',
    name: '強打',
    description: '渾身の力で敵を叩く。',
    mpCost: 3,
    cooldown: 0,
    effect: { type: 'damage', value: 1.5 }, // 1.5倍ダメージ
    icon: '💥'
  },
  // 盗賊スキル
  'poison_edge': {
    id: 'poison_edge',
    name: '毒刃',
    description: '武器に毒を塗り、敵を毒状態にする。',
    mpCost: 4,
    cooldown: 2,
    effect: { type: 'status', status: 'poison' },
    icon: '☠️'
  }
};

// ジョブごとのスキルツリー定義（マスタリーLvに応じて習得可能）
export const JOB_SKILL_TREE: Record<JobId, { level: number; skillId: string }[]> = {
  soldier: [
    { level: 5, skillId: 'smash' }
  ],
  rogue: [
    { level: 5, skillId: 'poison_edge' }
  ],
  arcanist: [],
  ranger: [],
  monk: []
};
