import { Skill } from '../types/skill';

export const skills: Skill[] = [
  {
    id: 'heavy_slash',
    name: '強撃',
    description: '渾身の力で武器を振り下ろす強烈な一撃。',
    type: 'attack',
    target: 'single',
    power: 2.5,
    cost: 0,
    cooldown: 5,
    range: 1.5,
    assetKey: 'skill_sword'
  },
  {
    id: 'round_slash',
    name: '回転斬り',
    description: '周囲の敵をまとめて薙ぎ払う範囲攻撃。',
    type: 'attack',
    target: 'area',
    power: 1.2,
    cost: 0,
    cooldown: 8,
    range: 1.5,
    assetKey: 'skill_round'
  },
  {
    id: 'fireball',
    name: 'ファイアボルト',
    description: '遠くの敵を焼き払う火球を放つ。',
    type: 'attack',
    target: 'single',
    power: 1.8,
    cost: 5,
    cooldown: 4,
    range: 4,
    assetKey: 'skill_fire'
  },
  {
    id: 'heal',
    name: 'ヒール',
    description: '傷を癒やす魔法。HPを回復する。',
    type: 'heal',
    target: 'self',
    power: 50,
    cost: 10,
    cooldown: 15,
    range: 0,
    assetKey: 'skill_heal'
  },
  {
    id: 'snipe',
    name: '狙い撃ち',
    description: '急所を狙った正確な射撃。',
    type: 'attack',
    target: 'single',
    power: 2.2,
    cost: 0,
    cooldown: 4,
    range: 5,
    assetKey: 'skill_bow'
  }
];
