export type ItemType = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'material' | 'key_item';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// 効果タイプの定義を拡張
export type ItemEffectType = 'heal_hp' | 'heal_sp' | 'heal_mp' | 'heal_full' | 'buff_atk' | 'buff_def';

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  duration?: number; // ターン数など
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  rarity?: ItemRarity; // 追加
  effect?: ItemEffect;
  equipStats?: {
    attack?: number;
    defense?: number;
    maxHp?: number;
    maxSp?: number; // maxMp -> maxSp に統一または併用
    [key: string]: number | undefined;
  };
  icon?: string;
  maxStack?: number;
}

export type Item = ItemDefinition;
