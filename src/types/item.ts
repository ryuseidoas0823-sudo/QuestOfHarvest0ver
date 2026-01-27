export type ItemType = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'key';
export type ItemEffectType = 'heal_hp' | 'heal_mp' | 'buff_str' | 'buff_vit' | 'buff_dex' | 'buff_agi' | 'cure_status';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 装備スロット定義
export type EquipmentSlot = 'mainHand' | 'offHand' | 'body' | 'accessory';

// 武器種定義
export type WeaponType = 'dagger' | 'sword' | 'axe' | 'staff' | 'bow' | 'unarmed';

// 装備ステータス詳細
export interface EquipmentStats {
  slot: EquipmentSlot;
  // 武器用
  attackPower?: number; // 物理攻撃力
  magicPower?: number; // 魔法攻撃力
  weaponType?: WeaponType;
  // 防具用
  defense?: number; // 物理防御
  magicDefense?: number; // 魔法防御
  // 共通補正
  str?: number;
  vit?: number;
  dex?: number;
  agi?: number;
  mag?: number;
  luc?: number;
}

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  duration?: number; // ターン数（即時効果の場合はundefined）
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  rarity: ItemRarity;
  icon?: string;
  effects?: ItemEffect[]; // 消費アイテム等の効果
  isConsumable: boolean;
  equipmentStats?: EquipmentStats; // 装備アイテムとしての性能
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}
