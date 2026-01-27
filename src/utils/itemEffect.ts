import { PlayerState } from '../types/gameState';
import { Item, ItemEffect } from '../types/item';

interface ItemUseResult {
  success: boolean;
  message: string;
  updatedPlayer: PlayerState;
}

/**
 * アイテム効果をプレイヤーに適用する
 */
export const applyItemEffect = (player: PlayerState, item: Item): ItemUseResult => {
  if (!item.effects || item.effects.length === 0) {
    return {
      success: false,
      message: '効果がないようだ。',
      updatedPlayer: player
    };
  }

  let updatedPlayer = { ...player, stats: { ...player.stats } };
  let effectApplied = false;
  const messages: string[] = [];

  for (const effect of item.effects) {
    switch (effect.type) {
      case 'heal_hp':
        if (updatedPlayer.hp < updatedPlayer.maxHp) {
          const healAmount = Math.min(updatedPlayer.maxHp - updatedPlayer.hp, effect.value);
          updatedPlayer.hp += healAmount;
          // statsの方も同期（念のため）
          updatedPlayer.stats.hp = updatedPlayer.hp;
          messages.push(`HPが${healAmount}回復した`);
          effectApplied = true;
        }
        break;

      case 'heal_mp':
        if (updatedPlayer.mp < updatedPlayer.maxMp) {
          const healAmount = Math.min(updatedPlayer.maxMp - updatedPlayer.mp, effect.value);
          updatedPlayer.mp += healAmount;
          updatedPlayer.stats.mp = updatedPlayer.mp;
          messages.push(`MPが${healAmount}回復した`);
          effectApplied = true;
        }
        break;

      // バフ系は本来バフ管理配列に追加するが、
      // 簡易的にステータス直接加算（永続）または今回は「一時的」を表現できないため
      // メッセージだけ出して実装は別途「バフシステム」が必要
      case 'buff_str':
        messages.push(`力がみなぎってきた！（※バフシステム未実装のため効果なし）`);
        effectApplied = true; 
        break;
        
      default:
        break;
    }
  }

  if (!effectApplied) {
    return {
      success: false,
      message: 'これ以上回復する必要はないようだ。', // HP満タン時など
      updatedPlayer: player
    };
  }

  return {
    success: true,
    message: messages.join('、') + '。',
    updatedPlayer
  };
};
