import { useState, useEffect, useCallback } from 'react';
import { Job } from './types/job';
import { Quest } from './types/quest';
import { skills as skillData } from './data/skills';
import { enemies as enemyData } from './data/enemies';
import { audioManager } from './utils/audioManager';
import { visualManager } from './utils/visualManager';
import { getDistance } from './utils';
import { EnemyInstance } from './types/enemy';

// Hooks
import { useDungeon } from './hooks/useDungeon';
import { useTurnSystem } from './hooks/useTurnSystem';
import { useEventSystem } from './hooks/useEventSystem'; // 追加

export const useGameLogic = (
  playerJob: Job,
  chapter: number,
  activeQuests: Quest[],
  onQuestUpdate: (questId: string, amount: number) => void,
  onGameOver: () => void,
  onAddItem: (itemId: string) => void // 追加: インベントリ操作用コールバック
) => {
  // --- State ---
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(playerJob.baseStats.maxHp);
  const [skillCooldowns, setSkillCooldowns] = useState<{ [key: string]: number }>({});

  const playerMaxHp = playerJob.baseStats.maxHp;
  const playerAttack = playerJob.baseStats.attack;

  const addLog = useCallback((msg: string) => {
    setMessageLog(prev => [msg, ...prev].slice(0, 5));
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // --- Custom Hooks ---
  const { 
    dungeon, 
    setDungeon, 
    floor, 
    playerPos, 
    setPlayerPos, 
    initFloor, 
    updateVisibility 
  } = useDungeon(chapter);

  const { 
    enemies, 
    setEnemies, 
    processEnemyTurn, 
    applyDamageToEnemy 
  } = useTurnSystem({
    playerPos,
    dungeon,
    onLog: addLog,
    onGameOver: () => { setGameOver(true); onGameOver(); },
    setPlayerHp
  });

  const {
    currentEvent,
    checkRandomEvent,
    handleEventChoice
  } = useEventSystem({
    onLog: addLog,
    setPlayerHp,
    addItem: onAddItem,
    playerMaxHp
  });

  // --- Floor Initialization Wrapper ---
  const startFloor = useCallback((floorNum: number) => {
    const { newMap, generatedEnemies } = initFloor(floorNum, activeQuests, playerJob);
    
    const finalEnemies = [...generatedEnemies];

    if (chapter >= 2) {
      const allyData = enemyData.find(e => e.id === 'elias_ally');
      if (allyData) {
        finalEnemies.push({ 
            ...allyData, 
            uniqueId: 'ally_elias', 
            hp: allyData.maxHp, 
            x: newMap.playerStart.x + 1, 
            y: newMap.playerStart.y, 
            stats: { ...playerJob.baseStats, hp: allyData.maxHp, maxHp: allyData.maxHp }
        } as EnemyInstance);
      }
    }

    if (floorNum === 5 && activeQuests.some(q => q.id === 'mq_1_5') && newMap.floorType === 'boss') {
        const npcData = enemyData.find(e => e.id === 'injured_adventurer');
        const room = newMap.rooms[0];
        if (npcData && room) finalEnemies.push({ 
            ...npcData, 
            uniqueId: 'npc_quest', 
            x: room.x + 2, 
            y: room.y + 2, 
            hp: npcData.maxHp,
            stats: { ...playerJob.baseStats, hp: npcData.maxHp } 
        } as EnemyInstance);
    }

    setEnemies(finalEnemies);
  }, [initFloor, chapter, activeQuests, playerJob, setEnemies]);

  useEffect(() => {
    startFloor(1);
  }, []);

  // --- Player Actions ---

  const handleEnemyDefeat = (deadEnemy: EnemyInstance) => {
    if (deadEnemy.type === 'boss') {
       if (deadEnemy.id === 'orc_general') onQuestUpdate('mq_1_5', 1);
       if (deadEnemy.id === 'cerberus') onQuestUpdate('mq_2_5', 1);
       if (deadEnemy.id === 'chimera_golem') onQuestUpdate('mq_3_5', 1);
       if (deadEnemy.id === 'abyss_commander') onQuestUpdate('mq_4_5', 1);
       if (deadEnemy.id === 'fallen_hero') onQuestUpdate('mq_5_5', 1);
    }
    activeQuests.forEach(q => {
      if (q.type === 'hunt' && q.targetId === deadEnemy.id) {
        onQuestUpdate(q.id, 1);
      }
    });
  };

  const processTurn = () => {
    if (isPaused || currentEvent) return; // イベント中もターン停止
    
    setSkillCooldowns(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => { if (next[key] > 0) next[key]--; });
      return next;
    });

    processEnemyTurn();
  };

  const useSkill = useCallback((skillId: string) => {
    if (gameOver || !dungeon || isPaused || currentEvent) return;
    if ((skillCooldowns[skillId] || 0) > 0) {
      addLog(`スキル準備中... (あと${skillCooldowns[skillId]}ターン)`);
      return;
    }
    const skill = skillData.find(s => s.id === skillId);
    if (!skill) return;
    
    let performed = false;
    const effectType = skillId.includes('fire') ? 'fire' : 'slash';

    if (skill.target === 'self') {
      if (skill.type === 'heal') {
        const healAmount = skill.power;
        setPlayerHp(prev => Math.min(playerMaxHp, prev + healAmount));
        addLog(`${skill.name}！ HPが${healAmount}回復した。`);
        audioManager.playSeSelect();
        visualManager.addEffect(playerPos.x, playerPos.y, 'heal');
        visualManager.addPopup(playerPos.x, playerPos.y, `+${healAmount}`, '#00ff00');
        performed = true;
      }
    } else if (skill.type === 'attack') {
      if (skill.target === 'single') {
        const target = enemies
          .filter(e => e.hp > 0 && e.faction === 'monster')
          .map(e => ({ ...e, dist: getDistance(playerPos.x, playerPos.y, e.x, e.y) }))
          .filter(e => e.dist <= skill.range)
          .sort((a, b) => a.dist - b.dist)[0];
          
        if (target) {
          const damage = Math.floor(playerAttack * skill.power); 
          addLog(`${skill.name}！ ${target.name}に${damage}の大ダメージ！`);
          applyDamageToEnemy(target.uniqueId, damage, handleEnemyDefeat);
          visualManager.addEffect(target.x, target.y, effectType);
          visualManager.addPopup(target.x, target.y, `${damage}`, '#ffff00');
          performed = true;
        } else { 
            addLog("対象が範囲内にいない！"); 
            return; 
        }
      } else if (skill.target === 'area') {
        const targets = enemies.filter(e => e.hp > 0 && e.faction === 'monster' && getDistance(playerPos.x, playerPos.y, e.x, e.y) <= skill.range);
        if (targets.length > 0) {
          addLog(`${skill.name}！ 周囲の敵を薙ぎ払った！`);
          targets.forEach(t => {
            const damage = Math.floor(playerAttack * skill.power);
            applyDamageToEnemy(t.uniqueId, damage, handleEnemyDefeat);
            visualManager.addEffect(t.x, t.y, effectType);
            visualManager.addPopup(t.x, t.y, `${damage}`, '#ffff00');
          });
          audioManager.playSeAttack();
          performed = true;
        } else { 
            addLog("近くに敵がいない！"); 
            return; 
        }
      }
    }
    
    if (performed) {
      setSkillCooldowns(prev => ({ ...prev, [skillId]: skill.cooldown }));
      processTurn();
    }
  }, [dungeon, enemies, playerPos, playerMaxHp, playerAttack, skillCooldowns, gameOver, addLog, isPaused, processEnemyTurn, applyDamageToEnemy, currentEvent]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameOver || !dungeon || isPaused || currentEvent) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (dungeon.tiles[newY][newX] === 'wall') return;

    const targetEnemy = enemies.find(e => e.x === newX && e.y === newY);
    if (targetEnemy) {
      if (targetEnemy.faction === 'monster') {
        const damage = Math.max(1, playerAttack - targetEnemy.defense);
        addLog(`攻撃！ ${targetEnemy.name}に${damage}ダメージ`);
        applyDamageToEnemy(targetEnemy.uniqueId, damage, handleEnemyDefeat);
      } else if (targetEnemy.faction === 'player_ally') {
        setPlayerPos({ x: newX, y: newY });
        setEnemies(prev => prev.map(e => 
          e.uniqueId === targetEnemy.uniqueId ? { ...e, x: playerPos.x, y: playerPos.y } : e
        ));
        return;
      }
      processTurn();
      return;
    }

    setPlayerPos({ x: newX, y: newY });
    updateVisibility(dungeon, { x: newX, y: newY });

    if (dungeon.tiles[newY][newX] === 'stairs_down') {
      addLog('階段を降りた。');
      audioManager.playSeSelect();
      startFloor(floor + 1);
      return;
    }

    // 移動後にランダムイベント判定
    if (checkRandomEvent()) {
      return; // イベント発生時はターン進行を中断（イベント終了後に再開するかは設計次第だが、今回は即停止）
    }

    processTurn();
  }, [dungeon, enemies, playerPos, gameOver, playerAttack, floor, addLog, startFloor, isPaused, processEnemyTurn, applyDamageToEnemy, currentEvent, checkRandomEvent]);

  return {
    dungeon,
    playerPos,
    enemies,
    floor,
    gameOver,
    isPaused,
    togglePause,
    currentEvent, // エクスポート
    handleEventChoice, // エクスポート
    messageLog,
    movePlayer,
    useSkill,
    skillCooldowns,
    playerHp,
    playerMaxHp
  };
};
