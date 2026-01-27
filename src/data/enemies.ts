import { Enemy, EnemyRace, ElementType } from '../types/enemy';

// スポーン時に使用するベース定義
export type EnemyDefinition = Omit<Enemy, 'id' | 'position' | 'statusEffects'>;

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  // ==========================================
  // 第1層〜5層: 森林・洞窟エリア (Forest & Cave)
  // ==========================================
  
  'slime': {
    name: 'スライム',
    symbol: 'S',
    color: '#3b82f6', // Blue
    hp: 15,
    maxHp: 15,
    attack: 4,
    defense: 1,
    exp: 3,
    aiType: 'random', // 不規則に動く
    race: 'slime',
    resistances: { 'physical': 0.2 }, // 物理20%カット
    weaknesses: { 'fire': 1.5, 'thunder': 1.5 } // 魔法に弱い
  },
  'goblin': {
    name: 'ゴブリン',
    symbol: 'G',
    color: '#16a34a', // Green
    hp: 25,
    maxHp: 25,
    attack: 6,
    defense: 2,
    exp: 5,
    aiType: 'chase', // プレイヤーを追う
    race: 'humanoid',
    // 亜人は標準的なステータス
  },
  'goblin_archer': { // 追加: 遠距離攻撃型
    name: 'ゴブリン射手',
    symbol: 'g',
    color: '#86efac', // Light Green
    hp: 18,
    maxHp: 18,
    attack: 5,
    defense: 1,
    exp: 6,
    aiType: 'ranged', // 距離を取る
    race: 'humanoid',
  },
  'wolf': {
    name: 'ウルフ',
    symbol: 'W',
    color: '#9ca3af', // Gray
    hp: 20,
    maxHp: 20,
    attack: 9,
    defense: 1,
    exp: 6,
    aiType: 'chase',
    race: 'beast',
    weaknesses: { 'fire': 1.2 } // 獣は火を恐れる
  },
  'baby_dragon': { // Area Boss (Floor 5)
    name: 'ベビー・ドラゴン',
    symbol: 'D',
    color: '#ef4444', // Red
    hp: 120,
    maxHp: 120,
    attack: 15,
    defense: 5,
    exp: 100,
    aiType: 'chase', // 将来的にブレスAI
    race: 'dragon',
    resistances: { 'fire': 0.8 },
    weaknesses: { 'ice': 1.5 }
  },

  // ==========================================
  // 第6層〜10層: 遺跡・墓地エリア (Ruins & Graveyard)
  // ==========================================

  'skeleton': {
    name: 'スケルトン',
    symbol: '💀',
    color: '#e5e7eb', // White
    hp: 35,
    maxHp: 35,
    attack: 12,
    defense: 3,
    exp: 10,
    aiType: 'chase',
    race: 'undead',
    resistances: { 'poison': 1.0, 'dark': 0.5 }, // 毒無効、闇半減
    weaknesses: { 'holy': 2.0, 'fire': 1.2 } // 聖・火・打撃に弱い
  },
  'zombie': {
    name: 'ゾンビ',
    symbol: 'Z',
    color: '#4b5563', // Dark Gray
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
    color: '#a5f3fc', // Cyan Light
    hp: 15,
    maxHp: 15,
    attack: 10,
    defense: 20, // 物理防御極高（物理耐性と合わせて表現）
    exp: 15,
    aiType: 'random', // 不規則な動き
    race: 'undead',
    resistances: { 'physical': 0.9, 'poison': 1.0 }, // 物理9割カット
    weaknesses: { 'holy': 2.5, 'fire': 1.5, 'thunder': 1.5 } // 魔法全般に弱い
  },
  'goliath': { // Area Boss (Floor 10)
    name: 'ゴライアス',
    symbol: '🗿',
    color: '#57534e', // Stone
    hp: 400,
    maxHp: 400,
    attack: 25,
    defense: 15,
    exp: 300,
    aiType: 'boss_goliath',
    race: 'construct',
    resistances: { 'physical': 0.5, 'fire': 0.5, 'poison': 1.0 }, // 硬い
    weaknesses: { 'thunder': 1.5 } // 内部破壊・雷に弱い
  },

  // ==========================================
  // 第11層〜15層: 樹海・湿地エリア (Deep Forest & Swamp)
  // ==========================================

  'poison_flower': {
    name: 'ポイズンフラワー',
    symbol: '🌻',
    color: '#a855f7', // Purple
    hp: 50,
    maxHp: 50,
    attack: 10,
    defense: 2,
    exp: 18,
    aiType: 'stationary', // 動かない
    race: 'plant',
    resistances: { 'ice': 0.5, 'thunder': 0.5 },
    weaknesses: { 'fire': 2.0, 'physical': 1.2 } // 斬撃(physical)に弱い
  },
  'lizardman': {
    name: 'リザードマン',
    symbol: '🦎',
    color: '#065f46', // Dark Green
    hp: 80,
    maxHp: 80,
    attack: 16,
    defense: 8,
    exp: 25,
    aiType: 'chase',
    race: 'humanoid', // 亜人・竜 複合イメージ
    resistances: { 'fire': 0.3 },
    weaknesses: { 'ice': 1.5 }
  },
  'harpy': { // 追加: 回避高い飛行敵
    name: 'ハーピー',
    symbol: '🦅',
    color: '#fcd34d', // Yellow
    hp: 45,
    maxHp: 45,
    attack: 14,
    defense: 3,
    exp: 22,
    aiType: 'chase',
    race: 'beast',
    resistances: { 'physical': 0.1 }, // 回避高いイメージ
    weaknesses: { 'thunder': 1.5, 'ice': 1.2 } // 翼
  },
  'amphisbaena': { // Area Boss (Floor 15)
    name: 'アンフィスバエナ',
    symbol: '🐉',
    color: '#0d9488', // Teal
    hp: 800,
    maxHp: 800,
    attack: 35,
    defense: 10,
    exp: 600,
    aiType: 'boss_minotaur', // 仮のボスAI
    race: 'dragon',
    resistances: { 'poison': 1.0, 'water': 0.8 },
    weaknesses: { 'fire': 1.5, 'thunder': 1.2 }
  },

  // ==========================================
  // 第16層〜: 深層・迷宮核心 (Deep Labyrinth)
  // ==========================================

  'minotaur': { // Normal Mob in deep floors
    name: 'ミノタウロス',
    symbol: '🐮',
    color: '#7f1d1d', // Dark Red
    hp: 150,
    maxHp: 150,
    attack: 25,
    defense: 10,
    exp: 50,
    aiType: 'chase',
    race: 'beast', 
    weaknesses: { 'poison': 1.2 } // 状態異常に若干弱い
  },
  'dark_knight': { // 追加: 物理強敵
    name: 'ダークナイト',
    symbol: '♞',
    color: '#1e293b', // Slate 800
    hp: 200,
    maxHp: 200,
    attack: 30,
    defense: 20,
    exp: 60,
    aiType: 'chase',
    race: 'undead', // 堕ちた騎士
    resistances: { 'dark': 0.8, 'physical': 0.3 },
    weaknesses: { 'holy': 2.0, 'thunder': 1.2 } // 鎧に雷
  },
  'arch_demon': { // 追加: 魔法強敵
    name: 'アークデーモン',
    symbol: '👿',
    color: '#dc2626', // Red 600
    hp: 180,
    maxHp: 180,
    attack: 40,
    defense: 15,
    exp: 80,
    aiType: 'ranged', // 魔法攻撃イメージ
    race: 'demon',
    resistances: { 'fire': 1.0, 'dark': 0.8 },
    weaknesses: { 'holy': 2.0, 'ice': 1.5 }
  },

  // ==========================================
  // Raid Boss / Unique
  // ==========================================

  'asterios': { // Raid Boss
    name: 'アステリオス',
    symbol: '♉',
    color: '#000000', // Black
    hp: 3000,
    maxHp: 3000,
    attack: 70,
    defense: 30,
    exp: 10000,
    aiType: 'boss_minotaur',
    race: 'beast',
    resistances: { 'fire': 0.3, 'ice': 0.3, 'physical': 0.2 },
    weaknesses: { 'holy': 1.2 }
  }
};
