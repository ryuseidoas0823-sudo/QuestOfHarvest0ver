import { GodDefinition, GodId } from '../types';

export const GODS: Record<GodId, GodDefinition> = {
  war: {
    id: 'war',
    name: '戦いの神',
    description: '物理攻撃と戦闘技術を司る神。好戦的な眷属が集まる。',
    bonuses: {
      attack: 5,
      critRate: 0.05
    }
  },
  blacksmith: {
    id: 'blacksmith',
    name: '鍛冶の神',
    description: '武具の扱いに長けた神。アイテムドロップ率や耐久度にボーナス。',
    bonuses: {
      defense: 3,
      dropRate: 1.2
    }
  },
  wine: {
    id: 'wine',
    name: '酒の神',
    description: '祝祭と狂乱の神。HPが高くなり、状態異常に強くなる。',
    bonuses: {
      maxHp: 20,
      expRate: 1.1
    }
  }
};
