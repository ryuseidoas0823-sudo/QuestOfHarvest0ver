import { Enemy, EnemyRace, ElementType } from '../types/enemy';

// スポーン時に使用するベース定義
export type EnemyDefinition = Omit<Enemy, 'id' | 'position' | 'statusEffects' | 'cooldowns'>;

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  // ... (既存の敵データは変更なしのため省略、ボスのみ更新) ...
  'slime': {
    name: 'スライム',
    symbol: 'S',
    color: '#3b82f6',
    hp: 15,
    maxHp: 15,
    attack: 4,
    defense: 1,
    exp: 3,
    aiType: 'random',
    race: 'slime',
    resistances: { 'physical': 0.2 },
    weaknesses: { 'fire': 1.5, 'thunder': 1.5 }
  },
  'goblin': {
    name: 'ゴブリン',
    symbol: 'G',
    color: '#16a34a', 
    hp: 25,
    maxHp: 25,
    attack: 6,
    defense: 2,
    exp: 5,
    aiType: 'chase',
    race: 'humanoid',
  },
  'goblin_archer': {
    name: 'ゴブリン射手',
    symbol: 'g',
    color: '#86efac',
    hp: 18,
    maxHp: 18,
    attack: 5,
    defense: 1,
    exp: 6,
    aiType: 'ranged',
    race: 'humanoid',
  },
  'wolf': {
    name: 'ウルフ',
    symbol: 'W',
    color: '#9ca3af',
    hp: 20,
    maxHp: 20,
    attack: 9,
    defense: 1,
    exp: 6,
    aiType: 'chase',
    race: 'beast',
    weaknesses: { 'fire': 1.2 }
  },
  'skeleton': {
    name: 'スケルトン',
    symbol: '💀',
    color: '#e5e7eb',
    hp: 35,
    maxHp: 35,
    attack: 12,
    defense: 3,
    exp: 10,
    aiType: 'chase',
    race: 'undead',
    resistances: { 'poison': 1.0, 'dark': 0.5 },
    weaknesses: { 'holy': 2.0, 'fire': 1.2 }
  },
  'zombie': {
    name: 'ゾンビ',
    symbol: 'Z',
    color: '#4b5563',
    hp: 60,
    maxHp: 60,
    attack: 8,
    defense: 0,
    exp: 12,
    aiType: 'chase',
    race: 'undead',
    resistances: { 'poison': 1.0, 'ice': 0.5 },
    weaknesses: { 'holy': 2.0, 'fire': 1.5 }
  },
  'ghost': {
    name: 'ゴースト',
    symbol: '👻',
    color: '#a5f3fc',
    hp: 15,
    maxHp: 15,
    attack: 10,
    defense: 20,
    exp: 15,
    aiType: 'random',
    race: 'undead',
    resistances: { 'physical': 0.9, 'poison': 1.0 },
    weaknesses: { 'holy': 2.5, 'fire': 1.5, 'thunder': 1.5 }
  },
  'poison_flower': {
    name: 'ポイズンフラワー',
    symbol: '🌻',
    color: '#a855f7',
    hp: 50,
    maxHp: 50,
    attack: 10,
    defense: 2,
    exp: 18,
    aiType: 'stationary',
    race: 'plant',
    resistances: { 'ice': 0.5, 'thunder': 0.5 },
    weaknesses: { 'fire': 2.0, 'physical': 1.2 },
    // スキル例: 毒胞子
    skills: [
        {
            id: 'poison_spore',
            name: '毒胞子',
            type: 'attack',
            range: 3,
            damageMult: 0.5,
            statusEffect: 'poison',
            cooldown: 3,
            prob: 0.4,
            message: 'は毒の胞子を撒き散らした！'
        }
    ]
  },
  'lizardman': {
    name: 'リザードマン',
    symbol: '🦎',
    color: '#065f46',
    hp: 80,
    maxHp: 80,
    attack: 16,
    defense: 8,
    exp: 25,
    aiType: 'chase',
    race: 'humanoid',
    resistances: { 'fire': 0.3 },
    weaknesses: { 'ice': 1.5 }
  },
  'harpy': {
    name: 'ハーピー',
    symbol: '🦅',
    color: '#fcd34d',
    hp: 45,
    maxHp: 45,
    attack: 14,
    defense: 3,
    exp: 22,
    aiType: 'chase',
    race: 'beast',
    resistances: { 'physical': 0.1 },
    weaknesses: { 'thunder': 1.5, 'ice': 1.2 }
  },
  'minotaur': {
    name: 'ミノタウロス',
    symbol: '🐮',
    color: '#7f1d1d',
    hp: 150,
    maxHp: 150,
    attack: 25,
    defense: 10,
    exp: 50,
    aiType: 'chase',
    race: 'beast', 
    weaknesses: { 'poison': 1.2 }
  },
  'dark_knight': {
    name: 'ダークナイト',
    symbol: '♞',
    color: '#1e293b',
    hp: 200,
    maxHp: 200,
    attack: 30,
    defense: 20,
    exp: 60,
    aiType: 'chase',
    race: 'undead',
    resistances: { 'dark': 0.8, 'physical': 0.3 },
    weaknesses: { 'holy': 2.0, 'thunder': 1.2 }
  },
  'arch_demon': {
    name: 'アークデーモン',
    symbol: '👿',
    color: '#dc2626',
    hp: 180,
    maxHp: 180,
    attack: 40,
    defense: 15,
    exp: 80,
    aiType: 'ranged',
    race: 'demon',
    resistances: { 'fire': 1.0, 'dark': 0.8 },
    weaknesses: { 'holy': 2.0, 'ice': 1.5 }
  },

  // --- Bosses ---

  'baby_dragon': { 
    name: 'ベビー・ドラゴン',
    symbol: 'D',
    color: '#ef4444', 
    hp: 120,
    maxHp: 120,
    attack: 15,
    defense: 5,
    exp: 100,
    aiType: 'chase',
    race: 'dragon',
    resistances: { 'fire': 0.8 },
    weaknesses: { 'ice': 1.5 },
    skills: [
        {
            id: 'fire_breath',
            name: 'ファイアブレス',
            type: 'attack',
            range: 4,
            areaRadius: 1, // 範囲攻撃
            damageMult: 1.5,
            statusEffect: 'burn',
            cooldown: 4,
            prob: 0.3,
            message: 'は激しい炎を吐いた！'
        }
    ]
  },
  'goliath': { 
    name: 'ゴライアス',
    symbol: '🗿',
    color: '#57534e',
    hp: 400,
    maxHp: 400,
    attack: 25,
    defense: 15,
    exp: 300,
    aiType: 'boss_goliath',
    race: 'construct',
    resistances: { 'physical': 0.5, 'fire': 0.5, 'poison': 1.0 },
    weaknesses: { 'thunder': 1.5 },
    skills: [
        {
            id: 'rock_throw',
            name: '岩投げ',
            type: 'attack',
            range: 6,
            damageMult: 1.2,
            cooldown: 3,
            prob: 0.4,
            message: 'は巨大な岩を投げつけた！'
        },
        {
            id: 'regeneration',
            name: '自己修復',
            type: 'heal',
            range: 0,
            damageMult: 0, // 回復量として計算ロジック側で処理
            cooldown: 8,
            prob: 0.2,
            message: 'は壁を喰らって再生した！'
        }
    ]
  },
  'amphisbaena': {
    name: 'アンフィスバエナ',
    symbol: '🐉',
    color: '#0d9488',
    hp: 800,
    maxHp: 800,
    attack: 35,
    defense: 10,
    exp: 600,
    aiType: 'boss_minotaur', // 仮
    race: 'dragon',
    resistances: { 'poison': 1.0, 'water': 0.8 },
    weaknesses: { 'fire': 1.5, 'thunder': 1.2 }
  },
  'asterios': { // Raid Boss
    name: 'アステリオス',
    symbol: '♉',
    color: '#000000',
    hp: 3000,
    maxHp: 3000,
    attack: 70,
    defense: 30,
    exp: 10000,
    aiType: 'boss_minotaur',
    race: 'beast',
    resistances: { 'fire': 0.3, 'ice': 0.3, 'physical': 0.2 },
    weaknesses: { 'holy': 1.2 },
    skills: [
        {
            id: 'war_cry',
            name: '咆哮',
            type: 'debuff', // 全体スタン
            range: 10,
            damageMult: 0,
            statusEffect: 'stun',
            cooldown: 8,
            prob: 0.2,
            message: 'は天を揺るがす咆哮をあげた！(全体スタン)'
        },
        {
            id: 'ground_smash',
            name: '地ならし',
            type: 'attack',
            range: 2,
            areaRadius: 2, // 周囲2マス
            damageMult: 1.8,
            cooldown: 5,
            prob: 0.3,
            message: 'は戦斧を地面に叩きつけた！'
        }
    ]
  }
};
