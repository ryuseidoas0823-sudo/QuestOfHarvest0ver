import { ReactNode } from 'react';
// 既存のアセットファイルをインポート
// ※実際のexport形式に合わせて調整が必要ですが、ここでは一般的と思われる形式で記述します
import * as SwordsmanAsset from './swordsman';
import * as WarriorAsset from './warrior';
import * as MageAsset from './mage';
import * as ArcherAsset from './archer';
// import * as RogueAsset from './rogue'; // 未実装の場合はスキップ
// import * as ClericAsset from './cleric';

/**
 * アセットキーに対応するアセットデータを返すマップ
 * ここでは、描画コンポーネントやSVGパスなどを保持することを想定
 */
export const ASSET_REGISTRY: Record<string, any> = {
  // 職業用アセット
  'hero_swordsman': SwordsmanAsset,
  'hero_warrior': WarriorAsset,
  'hero_mage': MageAsset,
  'hero_archer': ArcherAsset,
  
  // 敵用アセット (必要に応じて追加)
  'monster_slime': null, // 仮
  'monster_goblin': null,
  'monster_orc': null,

  // アイテム用アセット (必要に応じて追加)
  'icon_sword_rusty': null,
  'icon_potion_red': null,
};

/**
 * キーからアセットを取得するヘルパー関数
 */
export const getAsset = (key: string) => {
  return ASSET_REGISTRY[key] || null;
};
