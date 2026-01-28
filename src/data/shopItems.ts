import { ALL_ITEMS } from './items';
import { Item } from '../types/item';

// ALL_ITEMSからIDで抽出してショップリストを作成することでデータを一元管理する
const getShopItem = (id: string): Item => {
  const item = ALL_ITEMS.find(i => i.id === id);
  if (!item) {
    console.warn(`Shop item not found: ${id}`);
    // フォールバック（エラー回避用ダミー）
    return {
      id: 'error_item',
      name: 'Unknown Item',
      type: 'material',
      rarity: 'common',
      description: 'データが見つかりません',
      value: 0
    };
  }
  return item;
};

// ショップのラインナップ
export const SHOP_ITEMS: Item[] = [
  // Consumables
  getShopItem('potion_small'),
  getShopItem('potion_medium'),
  getShopItem('mana_potion_small'),
  getShopItem('antidote'),
  getShopItem('return_stone'),
  
  // Weapons
  getShopItem('iron_sword'),
  getShopItem('iron_axe'),
  getShopItem('short_bow'),
  getShopItem('apprentice_staff'),
  
  // Armor
  getShopItem('leather_armor'),
  getShopItem('chainmail'),
  getShopItem('wooden_shield'),
  
  // Accessories
  getShopItem('amulet_of_protection'),
];
