import { useCallback } from 'react';
import { GameState, Player, Enemy } from '../types/gameState'; // パスは環境に合わせて
import { StatusEffect, CooldownState } from '../types/combat';

// ユーティリティ: 状態異常の処理（1ターン経過分）
// 戻り値: { newStatusEffects, damageTaken, messages }
const processStatusEffects = (
  entityName: string,
  effects: StatusEffect[]
): { nextEffects: StatusEffect[], damage: number, logs: string[] } => {
  let damage = 0;
  const logs: string[] = [];
  const nextEffects: StatusEffect[] = [];

  effects.forEach(effect => {
    // 継続ダメージ処理
    if (effect.type === 'poison') {
      const dmg = effect.value || 1;
      damage += dmg;
      logs.push(`${entityName}は毒で${dmg}のダメージを受けた！`);
    } else if (effect.type === 'burn') {
      const dmg = effect.value || 3;
      damage += dmg;
      logs.push(`${entityName}は燃焼で${dmg}のダメージを受けた！`);
    } else if (effect.type === 'regen') {
        // 回復はダメージをマイナスにする（呼び出し元で吸収）
        const heal = effect.value || 1;
        damage -= heal; 
        logs.push(`${entityName}は再生効果で${heal}回復した。`);
    }

    // ターン減少
    if (effect.duration > 1) {
      nextEffects.push({ ...effect, duration: effect.duration - 1 });
    } else {
      logs.push(`${entityName}の${effect.name}効果が切れた。`);
    }
  });

  return { nextEffects, damage, logs };
};

// ユーティリティ: クールダウン減少
const processCooldowns = (cooldowns: CooldownState): CooldownState => {
  const nextCD: CooldownState = {};
  Object.keys(cooldowns).forEach(key => {
    if (cooldowns[key] > 0) {
      nextCD[key] = Math.max(0, cooldowns[key] - 1);
    }
  });
  return nextCD;
};


export const useTurnSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: any) => void
) => {

  const processTurn = useCallback(() => {
    setGameState(prev => {
      // 1. プレイヤーの状態異常・CD処理
      const pEffectResult = processStatusEffects(prev.player.name, prev.player.statusEffects || []);
      const nextPlayerCD = processCooldowns(prev.player.cooldowns || {});

      // プレイヤーHP変動 (ダメージ or 回復)
      let newPlayerHp = prev.player.stats.hp - pEffectResult.damage;
      newPlayerHp = Math.min(prev.player.stats.maxHp, Math.max(0, newPlayerHp));

      // ログ出力
      pEffectResult.logs.forEach(msg => addLog(msg));
      
      if (newPlayerHp <= 0) {
        // ゲームオーバー処理
        return {
          ...prev,
          player: {
            ...prev.player,
            stats: { ...prev.player.stats, hp: 0 },
            statusEffects: pEffectResult.nextEffects,
            cooldowns: nextPlayerCD
          },
          isGameOver: true,
          messages: [...prev.messages, { text: 'あなたは力尽きた...', type: 'danger' }]
        };
      }

      // 2. 敵のAI行動 & 状態異常処理
      let newEnemies = prev.enemies.map(enemy => {
        // 敵の状態異常処理
        const eEffectResult = processStatusEffects(enemy.name, enemy.statusEffects || []);
        
        let newEnemyHp = enemy.hp - eEffectResult.damage;
        newEnemyHp = Math.min(enemy.maxHp, Math.max(0, newEnemyHp));

        eEffectResult.logs.forEach(msg => addLog(msg)); // 戦闘ログが流れるので要調整

        // 敵の行動（簡易AI: プレイヤーに近づく）
        // ※ 本来はここで攻撃処理などが入る
        // ※ Stun状態なら行動スキップ
        const isStunned = eEffectResult.nextEffects.some(e => e.type === 'stun');
        let newPos = enemy.position;

        if (!isStunned && newEnemyHp > 0) {
            // 移動ロジック (useDungeon/useGameCoreにあるものを簡易再現)
            // 実際にはmoveEnemy関数などを利用する
            const dx = prev.player.position.x - enemy.position.x;
            const dy = prev.player.position.y - enemy.position.y;
            
            // 隣接していなければ移動
            if (Math.abs(dx) + Math.abs(dy) > 1) {
                const stepX = dx !== 0 ? Math.sign(dx) : 0;
                const stepY = dy !== 0 ? Math.sign(dy) : 0;
                // 斜め移動なし、X優先の簡易ロジック
                if (Math.abs(dx) >= Math.abs(dy)) {
                   newPos = { x: enemy.position.x + stepX, y: enemy.position.y };
                } else {
                   newPos = { x: enemy.position.x, y: enemy.position.y + stepY };
                }
                // 壁判定省略（本来は必要）
            } else {
                // 攻撃
                // addLog(`${enemy.name}の攻撃！`, 'warning');
                // newPlayerHp -= ...
            }
        }

        return {
          ...enemy,
          position: newPos,
          hp: newEnemyHp,
          statusEffects: eEffectResult.nextEffects
        };
      });

      // 死亡した敵を除去
      const deadEnemies = newEnemies.filter(e => e.hp <= 0);
      deadEnemies.forEach(e => addLog(`${e.name}は倒れた。`));
      newEnemies = newEnemies.filter(e => e.hp > 0);

      return {
        ...prev,
        player: {
          ...prev.player,
          stats: { ...prev.player.stats, hp: newPlayerHp },
          statusEffects: pEffectResult.nextEffects,
          cooldowns: nextPlayerCD
        },
        enemies: newEnemies,
        turn: prev.turn + 1
      };
    });
  }, [setGameState, addLog]);

  return { processTurn };
};
