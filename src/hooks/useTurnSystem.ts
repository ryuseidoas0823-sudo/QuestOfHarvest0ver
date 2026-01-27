import { useState, useCallback } from 'react';
import { PlayerState, GameState, LogMessage } from '../types/gameState';
import { Enemy } from '../types/enemy';
import { calculatePhysicalAttack } from '../utils/battle';
import { CombatEntity } from '../types/combat';

// ターンシステムの状態管理用フック
export const useTurnSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: LogMessage['type']) => void
) => {
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  // プレイヤーからCombatEntityへの変換ヘルパー
  const playerToEntity = (player: PlayerState): CombatEntity => ({
    name: player.name || '冒険者',
    level: player.level,
    stats: {
      hp: player.hp,
      maxHp: player.maxHp,
      str: player.stats.str,
      vit: player.stats.vit,
      dex: player.stats.dex,
      agi: player.stats.agi,
      mag: player.stats.mag,
      luc: player.stats.luc,
      level: player.level // stats内にも参照用に入れておく
    }
  });

  // 敵からCombatEntityへの変換ヘルパー
  const enemyToEntity = (enemy: Enemy): CombatEntity => ({
    name: enemy.name,
    level: enemy.level,
    stats: {
      hp: enemy.hp,
      maxHp: enemy.maxHp,
      str: enemy.stats.str,
      vit: enemy.stats.vit,
      dex: enemy.stats.dex,
      agi: enemy.stats.agi,
      mag: enemy.stats.mag,
      luc: enemy.stats.luc,
      level: enemy.level
    }
  });

  // プレイヤーの攻撃処理
  const handlePlayerAttack = useCallback((enemyId: string) => {
    setGameState(prev => {
      const enemyIndex = prev.enemies.findIndex(e => e.id === enemyId);
      if (enemyIndex === -1) return prev;

      const enemy = prev.enemies[enemyIndex];
      const playerEntity = playerToEntity(prev.player);
      const enemyEntity = enemyToEntity(enemy);

      // 戦闘計算の実行
      const result = calculatePhysicalAttack(playerEntity, enemyEntity);

      // ログ出力
      addLog(result.message, result.critical ? 'warning' : 'info');

      // ダメージ適用
      let newEnemies = [...prev.enemies];
      let newPlayer = { ...prev.player };
      
      const newEnemyHp = Math.max(0, enemy.hp - result.damage);
      
      if (newEnemyHp <= 0) {
        // 敵撃破処理
        addLog(`${enemy.name}を倒した！`, 'success');
        // 経験値獲得 (簡易計算: 敵レベル * 10)
        const expGain = enemy.level * 10;
        addLog(`${expGain}の経験値を獲得！`, 'info');
        
        newPlayer.exp += expGain;
        // ※レベルアップ処理は別途実装予定
        
        // 敵をリストから削除
        newEnemies = newEnemies.filter(e => e.id !== enemyId);
      } else {
        // 敵HP更新
        newEnemies[enemyIndex] = {
          ...enemy,
          hp: newEnemyHp
        };
      }

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies,
        turn: prev.turn + 1 // ターン経過
      };
    });
  }, [setGameState, addLog]);

  // 敵のターン処理
  const processEnemyTurn = useCallback(() => {
    setIsProcessingTurn(true);

    // 少し遅延を入れて演出を見やすくする
    setTimeout(() => {
      setGameState(prev => {
        let newPlayer = { ...prev.player };
        const newEnemies = prev.enemies.map(enemy => {
          // プレイヤーとの距離を計算
          const dx = Math.abs(enemy.position.x - prev.player.position.x);
          const dy = Math.abs(enemy.position.y - prev.player.position.y);
          const distance = dx + dy; // マンハッタン距離

          // 隣接していれば攻撃
          if (distance <= 1) {
            const enemyEntity = enemyToEntity(enemy);
            const playerEntity = playerToEntity(newPlayer);

            const result = calculatePhysicalAttack(enemyEntity, playerEntity);
            
            // ログ出力 (敵の攻撃は赤色などで目立たせる場合があるが、ここではwarning/danger等を想定)
            addLog(result.message, 'danger');

            if (result.hit) {
              newPlayer.hp = Math.max(0, newPlayer.hp - result.damage);
            }
            
            return enemy; // 攻撃したので移動しない
          } 
          
          // 隣接していなければプレイヤーに向かって移動 (簡易AI)
          // ※本来はマップの壁判定なども必要だが、ここでは簡易的に座標だけ更新するロジックを想定
          // (実際の移動ロジックはuseDungeonやgameLogic側にある可能性が高いが、
          //  ここでは戦闘ロジックの統合にフォーカスするため、既存の移動ロジックがあればそれを維持すべき)
          //  今回は「攻撃のみ」をここで処理し、移動は別途既存のAIロジックが動く前提か、
          //  あるいはここで簡易移動を行うか。既存コードを壊さないよう、攻撃処理のみに集中する。
          
          return enemy;
        });

        if (newPlayer.hp <= 0) {
          addLog('プレイヤーは力尽きた...', 'danger');
          // ゲームオーバー処理へのトリガーが必要ならここで
        }

        setIsProcessingTurn(false);
        return {
          ...prev,
          player: newPlayer,
          enemies: newEnemies
        };
      });
    }, 500); // 500ms待機
  }, [setGameState, addLog]);

  return {
    handlePlayerAttack,
    processEnemyTurn,
    isProcessingTurn
  };
};
