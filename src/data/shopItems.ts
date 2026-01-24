export interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'potion', name: 'ポーション', price: 100, description: 'HPを50回復する' },
  { id: 'hi_potion', name: 'ハイポーション', price: 300, description: 'HPを150回復する' },
  { id: 'torch', name: '松明', price: 50, description: 'フロアの視界を広げる' },
  { id: 'return_scroll', name: '帰還の巻物', price: 500, description: 'ダンジョンから瞬時に脱出する' },
];
