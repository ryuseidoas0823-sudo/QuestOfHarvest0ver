import { ItemDefinition } from '../types/item';

export const items: ItemDefinition[] = [
  {
    id: 'potion_hp_s',
    name: 'HPポーション(小)',
    type: 'consumable',
    price: 50,
    description: 'HPを50回復する',
    effect: { type: 'heal_hp', value: 50 }
  },
  {
    id: 'potion_hp_m',
    name: 'HPポーション(中)',
    type: 'consumable',
    price: 150,
    description: 'HPを150回復する',
    effect: { type: 'heal_hp', value: 150 }
  },
  {
    id: 'sword_iron',
    name: '鉄の剣',
    type: 'weapon',
    price: 200,
    description: '一般的な冒険者が使う鉄製の剣',
    equipStats: { attack: 5 }
  },
  {
    id: 'armor_leather',
    name: '革の鎧',
    type: 'armor',
    price: 150,
    description: '動きやすい革製の鎧',
    equipStats: { defense: 3 }
  },
  {
    id: 'ring_vit',
    name: '体力の指輪',
    type: 'accessory',
    price: 500,
    description: '最大HPが少し増える指輪',
    equipStats: { maxHp: 20 }
  }
];
