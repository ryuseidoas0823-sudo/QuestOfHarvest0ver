import { GameState, PlayerState } from '../types/gameState';
import { Item, ItemEffect } from '../types/item';

// アイテム使用時の結果
interface UseItemResult {
  success: boolean;
  message: string;
  newPlayerState?: PlayerState;
  shouldReturnTown?: boolean;
}

export const useItemEffect = (
  gameState: GameState, 
  item: Item
): UseItemResult => {
  const { player } = gameState;
  const effect = item.effect;

  if (!effect) {
    return { success: false, message: '効果がありません。' };
  }

  const newPlayer = { ...player };
  let message = '';
  let success = false;
  let shouldReturnTown = false;

  switch (effect.type) {
    case 'heal_hp':
      if (player.hp >= player.maxHp) {
        return { success: false, message: 'HPは既に満タンです。' };
      }
      const healAmount = effect.value;
      const prevHp = newPlayer.hp;
      newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + healAmount);
      const actualHeal = newPlayer.hp - prevHp;
      message = `HPが ${actualHeal} 回復しました。`;
      success = true;
      break;

    case 'heal_mp':
      if (player.mp >= player.maxMp) {
        return { success: false, message: 'MPは既に満タンです。' };
      }
      const healMpAmount = effect.value;
      const prevMp = newPlayer.mp;
      newPlayer.mp = Math.min(newPlayer.maxMp, newPlayer.mp + healMpAmount);
      const actualMpHeal = newPlayer.mp - prevMp;
      message = `MPが ${actualMpHeal} 回復しました。`;
      success = true;
      break;

    case 'cure_poison':
      // 状態異常の型定義変更に伴い、typeチェックを行う
      const hasPoison = newPlayer.statusEffects.some(e => e.type === 'poison');
      if (!hasPoison) {
        return { success: false, message: '毒には侵されていません。' };
      }
      newPlayer.statusEffects = newPlayer.statusEffects.filter(e => e.type !== 'poison');
      message = '毒が消えました！';
      success = true;
      break;

    case 'return_town':
      if (gameState.state === 'town') {
        return { success: false, message: '既に街にいます。' };
      }
      message = '街へ帰還します...';
      success = true;
      shouldReturnTown = true;
      break;

    case 'buff_str':
      // バフのロジック: ステータス上昇効果を付与
      const buffId = crypto.randomUUID();
      newPlayer.statusEffects.push({
        id: buffId,
        type: 'buff',
        name: '剛力',
        duration: effect.duration || 10,
        value: effect.value,
        sourceId: item.id
      });
      message = `力がみなぎってきた！ (STR +${effect.value})`;
      success = true;
      break;

    // 他のバフも同様に追加可能...
    
    default:
      return { success: false, message: '効果が発動しませんでした。' };
  }

  return { success, message, newPlayerState: newPlayer, shouldReturnTown };
};
