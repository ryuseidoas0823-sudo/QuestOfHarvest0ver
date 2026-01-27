import { Job } from '../types/job';

export const JOBS: Record<string, Job> = {
  soldier: {
    id: 'soldier',
    name: '戦士 (Soldier)',
    description: '攻守のバランスに優れた近接戦闘のスペシャリスト。HPと物理防御が高い。',
    icon: '🛡️',
    growth: {
      hp: 10, mp: 0,
      str: 0.5, vit: 0.5, dex: 0.3, agi: 0.2, mag: 0, luc: 0.1
    },
    initialStats: {
      str: 5, vit: 5, maxHp: 30
    }
  },
  rogue: {
    id: 'rogue',
    name: '盗賊 (Rogue)',
    description: '素早い動きと高いクリティカル率で敵を翻弄する。二刀流や毒が得意。',
    icon: '🗡️',
    growth: {
      hp: 6, mp: 2,
      str: 0.3, vit: 0.2, dex: 0.6, agi: 0.5, mag: 0.1, luc: 0.3
    },
    initialStats: {
      dex: 5, agi: 5, luc: 3
    }
  },
  arcanist: {
    id: 'arcanist',
    name: '魔導士 (Arcanist)',
    description: '強力な魔法攻撃を操るが、打たれ弱い。MPと魔力が大きく伸びる。',
    icon: '🔮',
    growth: {
      hp: 4, mp: 8,
      str: 0.1, vit: 0.1, dex: 0.2, agi: 0.2, mag: 0.8, luc: 0.2
    },
    initialStats: {
      mag: 8, maxMp: 20
    }
  },
  ranger: {
    id: 'ranger',
    name: '狩人 (Ranger)',
    description: '遠距離攻撃に長け、敵を近づけさせない立ち回りが可能。',
    icon: '🏹',
    growth: {
      hp: 7, mp: 3,
      str: 0.3, vit: 0.2, dex: 0.5, agi: 0.4, mag: 0.2, luc: 0.2
    },
    initialStats: {
      dex: 6, agi: 3
    }
  },
  monk: {
    id: 'monk',
    name: '武闘家 (Monk)',
    description: '自身の肉体を武器とする。回避能力と手数に優れる。',
    icon: '👊',
    growth: {
      hp: 8, mp: 4,
      str: 0.4, vit: 0.3, dex: 0.3, agi: 0.6, mag: 0.2, luc: 0.1
    },
    initialStats: {
      str: 3, agi: 6
    }
  }
};

export const getJob = (id: string): Job | undefined => {
  return JOBS[id];
};
