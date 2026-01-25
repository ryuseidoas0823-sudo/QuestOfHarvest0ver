import { useState, useCallback, useRef, useEffect } from 'react';
import { EnemyInstance } from '../types/enemy';
import { DungeonMap } from '../types';
import { decideAction } from '../utils/ai';
import { visualManager } from '../utils/visualManager';
import { audioManager } from '../utils/audioManager';

interface UseTurnSystemProps {
  playerPos: { x: number; y: number };
  dungeon: DungeonMap | null;
  onLog: (msg: string) => void;
  onGameOver: () => void;
  setPlayerHp: React.Dispatch<React.SetStateAction<number>>;
}

export const useTurnSystem = ({
  playerPos,
  dungeon,
  onLog,
  onGameOver,
  setPlayerHp
}: UseTurnSystemProps) => {
  const [enemies, setEnemies] = useState<EnemyInstance[]>([]);
  const playerPosRef = useRef(playerPos);

  // playerPosはレンダリングごとに変わるため、Refで最新を保持してAI計算に使う
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  const applyDamageToEnemy = useCallback((targetId: string, damage: number, onDefeat?: (enemy: EnemyInstance) => void) => {
    audioManager.playSeAttack();
    setEnemies(prev => {
      const next = prev.map(e => {
        if (e.uniqueId === targetId) {
          visualManager.addEffect(e.x, e.y, 'slash');
          visualManager.addPopup(e.x, e.y, `${damage}`, '#ffffff');
          return { ...e, hp: e.hp - damage };
        }
        return e;
      }).filter(e => e.hp > 0);

      if (next.length < prev.length) {
        const dead = prev.find(p => !next.find(n => n.uniqueId === p.uniqueId));
        if (dead) {
          onLog(`${dead.name}を倒した！`);
          if (onDefeat) onDefeat(dead);
        }
      }
      return next;
    });
  }, [onLog]);

  const processEnemyTurn = useCallback(() => {
    if (!dungeon) return;

    setEnemies(prevEnemies => {
      let nextEnemies = prevEnemies.map(e => ({ ...e }));
      const currentPlayerPos = playerPosRef.current;

      nextEnemies.forEach((actor, idx) => {
        if (actor.hp <= 0) return;
        if (actor.aiType === 'stationary') return;

        const decision = decideAction(actor, prevEnemies, currentPlayerPos, dungeon);

        if (decision.type === 'move') {
          const { x, y } = decision;
          // 他の敵やプレイヤーとの衝突判定
          const isBlocked = nextEnemies.some((e, i) => i !== idx && e.hp > 0 && e.x === x && e.y === y) ||
                            (currentPlayerPos.x === x && currentPlayerPos.y === y);
          
          if (!isBlocked) {
            nextEnemies[idx].x = x;
            nextEnemies[idx].y = y;
          }
        } else if (decision.type === 'attack') {
          const { targetId } = decision;
          if (targetId === 'player') {
            const dmg = Math.max(1, actor.attack - 5); // プレイヤー防御力は簡易計算
            setPlayerHp(prev => {
              const next = prev - dmg;
              if (next <= 0) {
                onGameOver();
              }
              return next;
            });
            onLog(`${actor.name}の攻撃！ ${dmg}ダメージ`);
            audioManager.playSeDamage();
            visualManager.addEffect(currentPlayerPos.x, currentPlayerPos.y, 'slash');
            visualManager.addPopup(currentPlayerPos.x, currentPlayerPos.y, `${dmg}`, '#ff0000');
          } else {
            // 敵対勢力同士の攻撃（NPC vs モンスター）
            const targetIdx = nextEnemies.findIndex(e => e.uniqueId === targetId);
            if (targetIdx !== -1) {
              const dmg = Math.max(1, actor.attack - nextEnemies[targetIdx].defense);
              nextEnemies[targetIdx].hp -= dmg;
              onLog(`${actor.name}の攻撃！ ${nextEnemies[targetIdx].name}に${dmg}ダメージ`);
              audioManager.playSeAttack();
              visualManager.addEffect(nextEnemies[targetIdx].x, nextEnemies[targetIdx].y, 'slash');
              visualManager.addPopup(nextEnemies[targetIdx].x, nextEnemies[targetIdx].y, `${dmg}`, '#cccccc');
            }
          }
        }
      });

      return nextEnemies.filter(e => e.hp > 0);
    });
  }, [dungeon, onLog, onGameOver, setPlayerHp]);

  return {
    enemies,
    setEnemies,
    processEnemyTurn,
    applyDamageToEnemy
  };
};
