import { useState, useCallback, useRef } from 'react';
import { PlayerState, GameState, LogMessage } from '../types/gameState';
import { Enemy } from '../types/enemy';
import { calculatePhysicalAttack } from '../utils/battle';
import { gainExperience } from '../utils/level';
import { CombatEntity } from '../types/combat';
import { calculateTotalStats } from '../utils/stats'; // 追加
import { ITEMS } from '../data/items'; // 追加

const CT_THRESHOLD = 100;
const BASE_SPEED_MODIFIER = 0.5;

export const useTurnSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: LogMessage['type']) => void
) => {
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const processingRef = useRef(false);

  // プレイヤー -> CombatEntity (装備補正込み)
  const playerToEntity = (player: PlayerState): CombatEntity => {
    // 装備補正込みのステータスを計算
    const totalStats = calculateTotalStats(player);

    // 武器攻撃力をSTR換算で上乗せする簡易ハック
    // (本来はCombatEntityにweaponPowerを持たせるべきだが、既存ロジック str*2 を活かすため)
    // 武器攻撃力 10 -> STR+5 相当として計算に含める、あるいはダメージ計算式側を変えるか。
    // ここでは calculatePhysicalAttack が STR*2 なので、
    // 武器攻撃力分を STR に (Power / 2) として加算しておくと計算が合う。
    // 例: 鉄の剣(攻12) -> STR+6相当 -> ダメージ+12
    let weaponBonusStr = 0;
    if (player.equipment.mainHand) {
        const weapon = ITEMS[player.equipment.mainHand];
        if (weapon?.equipmentStats?.attackPower) {
            weaponBonusStr += weapon.equipmentStats.attackPower / 2;
        }
    }

    return {
        name: player.name,
        level: player.level,
        stats: {
            ...totalStats,
            str: totalStats.str + weaponBonusStr, // 武器威力分をSTRに加算
            hp: player.hp, // 現在HPはそのまま
            mp: player.mp
        },
        ct: player.ct
    };
  };

  // 敵 -> CombatEntity (変更なし)
  const enemyToEntity = (enemy: Enemy): CombatEntity => ({
    name: enemy.name,
    level: enemy.level,
    stats: {
      hp: enemy.stats.hp || enemy.hp, // hpプロパティの揺れ吸収
      maxHp: enemy.stats.maxHp || enemy.maxHp,
      str: enemy.stats.str,
      vit: enemy.stats.vit,
      dex: enemy.stats.dex,
      agi: enemy.stats.agi,
      mag: enemy.stats.mag,
      luc: enemy.stats.luc,
      level: enemy.level
    },
    ct: enemy.ct
  });

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // ... (executeEnemyAction, processTurnCycle はロジック変更なし、toEntity呼び出し部分のみ変更) ...
  // toEntity関数を上記 playerToEntity / enemyToEntity に置き換える必要があるが
  // 引数の型で分岐するヘルパーにする

  const toEntity = (source: PlayerState | Enemy): CombatEntity => {
      if ('inventory' in source) {
          return playerToEntity(source as PlayerState);
      } else {
          return enemyToEntity(source as Enemy);
      }
  };

  const executeEnemyAction = async (enemyId: string) => {
    let actionLog: string | null = null;
    let logType: LogMessage['type'] = 'info';

    setGameState(prev => {
      const enemyIndex = prev.enemies.findIndex(e => e.id === enemyId);
      if (enemyIndex === -1) return prev;

      const enemy = prev.enemies[enemyIndex];
      let newPlayer = { ...prev.player };
      
      const dx = Math.abs(enemy.position.x - prev.player.position.x);
      const dy = Math.abs(enemy.position.y - prev.player.position.y);
      const distance = dx + dy;

      if (distance <= 1) {
        const enemyEntity = toEntity(enemy);
        const playerEntity = toEntity(newPlayer); // 防御側も装備反映(VIT等)
        const result = calculatePhysicalAttack(enemyEntity, playerEntity);
        
        actionLog = result.message;
        logType = result.hit ? 'danger' : 'info';

        if (result.hit) {
          newPlayer.hp = Math.max(0, newPlayer.hp - result.damage);
        }
      } else {
        actionLog = `${enemy.name}は様子を伺っている...`;
      }

      const newEnemies = [...prev.enemies];
      newEnemies[enemyIndex] = {
        ...enemy,
        ct: (enemy.ct || 0) - CT_THRESHOLD
      };

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies
      };
    });

    if (actionLog) {
      addLog(actionLog, logType);
    }
    
    await wait(300);
  };

  // ... processTurnCycle ... (変更なし)
  const processTurnCycle = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessingTurn(true);

    let playerTurn = false;
    let loopGuard = 0;

    while (!playerTurn && loopGuard < 1000) {
      loopGuard++;

      const nextAction = await new Promise<'player' | 'enemy' | 'tick'>((resolve) => {
        setGameState(current => {
          const readyEnemy = current.enemies.find(e => (e.ct || 0) >= CT_THRESHOLD);
          if (readyEnemy) {
            resolve('enemy');
            return current;
          }
          if ((current.player.ct || 0) >= CT_THRESHOLD) {
            resolve('player');
            return current;
          }
          
          // 素早さによるCT加算 (ここでも装備補正AGIを使うべき)
          const playerStats = calculateTotalStats(current.player);
          const newPlayer = { ...current.player, ct: (current.player.ct || 0) + (playerStats.agi * BASE_SPEED_MODIFIER) };
          
          const newEnemies = current.enemies.map(e => ({
            ...e,
            ct: (e.ct || 0) + (e.stats.agi * BASE_SPEED_MODIFIER)
          }));
          
          resolve('tick');
          return { ...current, player: newPlayer, enemies: newEnemies };
        });
      });

      if (nextAction === 'player') playerTurn = true;
      else if (nextAction === 'enemy') {
        let readyEnemyId: string | null = null;
        setGameState(prev => {
          const e = prev.enemies.find(en => (en.ct || 0) >= CT_THRESHOLD);
          if (e) readyEnemyId = e.id;
          return prev;
        });
        if (readyEnemyId) await executeEnemyAction(readyEnemyId);
        else playerTurn = false;
      }
    }
    processingRef.current = false;
    setIsProcessingTurn(false);
  }, [setGameState, addLog]);

  const handlePlayerAttack = useCallback(async (enemyId: string) => {
    if (processingRef.current) return;
    
    let enemyDefeated = false;
    
    setGameState(prev => {
      if ((prev.player.ct || 0) < CT_THRESHOLD) return prev;

      const enemyIndex = prev.enemies.findIndex(e => e.id === enemyId);
      if (enemyIndex === -1) return prev;

      const enemy = prev.enemies[enemyIndex];
      const playerEntity = toEntity(prev.player);
      const enemyEntity = toEntity(enemy);

      const result = calculatePhysicalAttack(playerEntity, enemyEntity);
      addLog(result.message, result.critical ? 'warning' : 'info');

      let newEnemies = [...prev.enemies];
      let newPlayer = { ...prev.player };
      
      const newEnemyHp = Math.max(0, enemy.hp - result.damage);
      
      if (newEnemyHp <= 0) {
        addLog(`${enemy.name}を倒した！`, 'success');
        const expGain = enemy.level * 10 + Math.floor(Math.random() * 5);
        addLog(`${expGain}の経験値を獲得！`, 'info');
        
        const { updatedPlayer, leveledUp, statGrowth } = gainExperience(newPlayer, expGain);
        newPlayer = updatedPlayer;

        if (leveledUp && statGrowth) {
           addLog(`ランクアップ！ Lv${newPlayer.level} になった！`, 'success');
           addLog(`全回復しました！`, 'info');
        }

        newEnemies = newEnemies.filter(e => e.id !== enemyId);
        enemyDefeated = true;
      } else {
        newEnemies[enemyIndex] = { ...enemy, hp: newEnemyHp };
      }

      newPlayer.ct = (newPlayer.ct || 0) - CT_THRESHOLD;

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies,
        turn: prev.turn + 1
      };
    });

    if (enemyDefeated) await wait(200);
    processTurnCycle();

  }, [setGameState, addLog, processTurnCycle]);

  const handlePlayerMove = useCallback(async () => {
     setGameState(prev => ({
       ...prev,
       player: { ...prev.player, ct: (prev.player.ct || 0) - CT_THRESHOLD },
       turn: prev.turn + 1
     }));
     processTurnCycle();
  }, [setGameState, processTurnCycle]);
  
  return {
    handlePlayerAttack,
    handlePlayerMove,
    isProcessingTurn,
    processTurnCycle
  };
};
