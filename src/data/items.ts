import { Item } from '../types/item';

export const ITEMS: Record<string, Item> = {
  // 消費アイテム
  'potion_low': {
    id: 'potion_low',
    name: 'ポーション',
    type: 'consumable',
    description: 'HPを50回復する基本的な回復薬。',
    price: 50,
    rarity: 'common',
    icon: '🧪',
    isConsumable: true,
    effects: [{ type: 'heal_hp', value: 50 }]
  },
  'potion_high': {
    id: 'potion_high',
    name: 'ハイポーション',
    type: 'consumable',
    description: 'HPを200回復する高品質な回復薬。',
    price: 200,
    rarity: 'rare',
    icon: '⚗️',
    isConsumable: true,
    effects: [{ type: 'heal_hp', value: 200 }]
  },
  'ether_low': {
    id: 'ether_low',
    name: 'エーテル',
    type: 'consumable',
    description: 'MPを30回復する精神感応液。',
    price: 150,
    rarity: 'common',
    icon: '💧',
    isConsumable: true,
    effects: [{ type: 'heal_mp', value: 30 }]
  },
  'power_drug': {
    id: 'power_drug',
    name: '力の水薬',
    type: 'consumable',
    description: '一時的にSTR(力)を上昇させる。',
    price: 500,
    rarity: 'rare',
    icon: '💪',
    isConsumable: true,
    effects: [{ type: 'buff_str', value: 5, duration: 20 }]
  },

  // 武器: 短剣
  'dagger_novice': {
    id: 'dagger_novice',
    name: '冒険者のナイフ',
    type: 'weapon',
    description: '扱いやすい小型のナイフ。',
    price: 100,
    rarity: 'common',
    icon: '🗡️',
    isConsumable: false,
    equipmentStats: {
      slot: 'mainHand',
      weaponType: 'dagger',
      attackPower: 5,
      dex: 1
    }
  },
  // 武器: 直剣
  'sword_iron': {
    id: 'sword_iron',
    name: '鉄の剣',
    type: 'weapon',
    description: '標準的な鉄製の剣。',
    price: 250,
    rarity: 'common',
    icon: '⚔️',
    isConsumable: false,
    equipmentStats: {
      slot: 'mainHand',
      weaponType: 'sword',
      attackPower: 12
    }
  },
  // 武器: 杖
  'staff_oak': {
    id: 'staff_oak',
    name: '樫の杖',
    type: 'weapon',
    description: '魔力を微かに帯びた木の杖。',
    price: 200,
    rarity: 'common',
    icon: '🪄',
    isConsumable: false,
    equipmentStats: {
      slot: 'mainHand',
      weaponType: 'staff',
      attackPower: 2,
      magicPower: 8,
      mag: 2
    }
  },
  // 武器: 弓
  'bow_short': {
    id: 'bow_short',
    name: 'ショートボウ',
    type: 'weapon',
    description: '小型の弓。遠くの敵を狙える。',
    price: 220,
    rarity: 'common',
    icon: '🏹',
    isConsumable: false,
    equipmentStats: {
      slot: 'mainHand',
      weaponType: 'bow',
      attackPower: 8,
      dex: 2
    }
  },

  // 防具: 盾
  'shield_wood': {
    id: 'shield_wood',
    name: '木の盾',
    type: 'armor',
    description: '木製の簡易的な盾。',
    price: 80,
    rarity: 'common',
    icon: '🛡️',
    isConsumable: false,
    equipmentStats: {
      slot: 'offHand',
      defense: 3
    }
  },

  // 防具: 胴
  'armor_leather': {
    id: 'armor_leather',
    name: '革の鎧',
    type: 'armor',
    description: '動きやすい革製の鎧。',
    price: 150,
    rarity: 'common',
    icon: '🦺',
    isConsumable: false,
    equipmentStats: {
      slot: 'body',
      defense: 5,
      agi: 1
    }
  },
  'robe_novice': {
    id: 'robe_novice',
    name: '見習いのローブ',
    type: 'armor',
    description: '魔法使い向けの布服。',
    price: 120,
    rarity: 'common',
    icon: '🧥',
    isConsumable: false,
    equipmentStats: {
      slot: 'body',
      defense: 2,
      magicDefense: 5,
      maxMp: 10
    }
  },
  
  // アクセサリ
  'ring_strength': {
    id: 'ring_strength',
    name: '力の指輪',
    type: 'accessory',
    description: '力が湧いてくる指輪。',
    price: 500,
    rarity: 'rare',
    icon: '💍',
    isConsumable: false,
    equipmentStats: {
      slot: 'accessory',
      str: 3
    }
  }
};

export const getItem = (id: string): Item | undefined => {
  return ITEMS[id];
};
