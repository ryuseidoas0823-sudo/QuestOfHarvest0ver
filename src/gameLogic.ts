// ... existing imports ...
import { audioManager } from './utils/audioManager'; // 追加

// ... (imports and interface GameState omitted for brevity) ...

export const useGameLogic = (
  playerJob: Job,
  chapter: number,
  activeQuests: Quest[],
  onQuestUpdate: (questId: string, progress: number) => void,
  onPlayerDeath: () => void
) => {
  // ... (useState definitions omitted) ...
  const [dungeon, setDungeon] = useState<DungeonMap | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [enemies, setEnemies] = useState<EnemyInstance[]>([]);
  const [floor, setFloor] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(playerJob.baseStats.maxHp); 
  const playerMaxHp = playerJob.baseStats.maxHp;
  const playerAttack = playerJob.baseStats.attack;
  const [skillCooldowns, setSkillCooldowns] = useState<{ [key: string]: number }>({});
  const playerPosRef = useRef({ x: 0, y: 0 });
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);

  const addLog = useCallback((msg: string) => {
    setMessageLog(prev => [msg, ...prev].slice(0, 5));
  }, []);

  // ... (initFloor omitted) ...
  // ダンジョン初期化
  const initFloor = useCallback((floorNum: number) => {
    const newDungeon = generateDungeon(floorNum);
    setDungeon(newDungeon);
    setPlayerPos(newDungeon.playerStart);
    setFloor(floorNum);
    const newEnemies: EnemyInstance[] = [];
    const isBossFloor = floorNum % 5 === 0;
    
    if (chapter >= 2) {
      const allyData = enemyData.find(e => e.id === 'elias_ally');
      if (allyData) {
        newEnemies.push({
          ...allyData,
          uniqueId: 'ally_elias',
          hp: allyData.maxHp,
          x: newDungeon.playerStart.x + 1,
          y: newDungeon.playerStart.y,
          faction: 'player_ally',
          aiType: 'aggressive'
        });
      }
    }

    if (isBossFloor) {
      const bossData = enemyData.find(e => e.type === 'boss') || enemyData[0];
      let currentBoss = bossData;
      if (floorNum === 5) currentBoss = enemyData.find(e => e.id === 'orc_general') || bossData;
      if (floorNum === 10) currentBoss = enemyData.find(e => e.id === 'cerberus') || bossData;
      if (floorNum === 15) currentBoss = enemyData.find(e => e.id === 'chimera_golem') || bossData;
      if (floorNum === 20) currentBoss = enemyData.find(e => e.id === 'abyss_commander') || bossData;
      if (floorNum === 25) currentBoss = enemyData.find(e => e.id === 'fallen_hero') || bossData;

      const room = newDungeon.rooms[0];
      newEnemies.push({
        ...currentBoss,
        uniqueId: `boss_${floorNum}`,
        hp: currentBoss.maxHp,
        x: Math.floor(room.x + room.w / 2),
        y: Math.floor(room.y + room.h / 2),
        faction: 'monster'
      });
    } else {
      newDungeon.rooms.forEach(room => {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
          const validEnemies = enemyData.filter(e => e.faction === 'monster' && e.type !== 'boss');
          const data = validEnemies[Math.floor(Math.random() * validEnemies.length)];
          newEnemies.push({
            ...data,
            uniqueId: `e_${room.x}_${room.y}_${i}`,
            hp: data.maxHp,
            x: Math.floor(room.x + Math.random() * room.w),
            y: Math.floor(room.y + Math.random() * room.h),
            faction: 'monster'
          });
        }
      });
    }
    setEnemies(newEnemies);
  }, [chapter]);

  useEffect(() => {
    initFloor(1);
  }, []);

  const applyDamageToEnemy = (targetId: string, damage: number) => {
    // 攻撃音
    audioManager.playSeAttack(); 

    setEnemies(prev => {
      const next = prev.map(e => {
        if (e.uniqueId === targetId) return { ...e, hp: e.hp - damage };
        return e;
      }).filter(e => e.hp > 0);

      if (next.length < prev.length) {
        const dead = prev.find(p => !next.find(n => n.uniqueId === p.uniqueId));
        if (dead) {
          addLog(`${dead.name}を倒した！`);
          // 撃破音（今回は攻撃音で代用するが、別に作っても良い）
          if (dead.type === 'boss') {
             if (dead.id === 'orc_general') onQuestUpdate('mq_1_5', 1);
             if (dead.id === 'cerberus') onQuestUpdate('mq_2_5', 1);
             if (dead.id === 'chimera_golem') onQuestUpdate('mq_3_5', 1);
             if (dead.id === 'abyss_commander') onQuestUpdate('mq_4_5', 1);
             if (dead.id === 'fallen_hero') onQuestUpdate('mq_5_5', 1);
          }
          activeQuests.forEach(q => {
            if (q.type === 'hunt' && q.targetId === dead.id) {
              onQuestUpdate(q.id, 1);
            }
          });
        }
      }
      return next;
    });
  };

  const processTurn = () => {
    setSkillCooldowns(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] > 0) next[key]--;
      });
      return next;
    });

    if (!dungeon) return;

    setEnemies(prevEnemies => {
      let nextEnemies = prevEnemies.map(e => ({ ...e }));
      const currentPlayerPos = playerPosRef.current;

      nextEnemies.forEach((actor, idx) => {
        if (actor.hp <= 0) return;
        if (actor.aiType === 'stationary') return;

        const myState = nextEnemies[idx];
        let newX = myState.x;
        let newY = myState.y;

        if (actor.faction === 'player_ally') {
          // ... (Ally AI logic omitted, same as before) ...
          const targets = nextEnemies
            .filter(e => e.faction === 'monster' && e.hp > 0)
            .map(e => ({
              id: e.uniqueId,
              x: e.x,
              y: e.y,
              dist: getDistance(myState.x, myState.y, e.x, e.y)
            })).sort((a, b) => a.dist - b.dist);
          
          const target = targets[0];
          if (target && target.dist <= 1.5) {
             const targetIdx = nextEnemies.findIndex(e => e.uniqueId === target.id);
             if (targetIdx !== -1) {
               const dmg = Math.max(1, actor.attack - nextEnemies[targetIdx].defense);
               nextEnemies[targetIdx].hp -= dmg;
               addLog(`${actor.name}の攻撃！ ${nextEnemies[targetIdx].name}に${dmg}ダメージ`);
               audioManager.playSeAttack(); // 味方の攻撃音
             }
          } else if (target && target.dist <= 5) {
             if (target.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
             else if (target.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
             else if (target.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
             else if (target.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
          } else {
             if (currentPlayerPos.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
             else if (currentPlayerPos.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
             else if (currentPlayerPos.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
             else if (currentPlayerPos.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
          }
        }
        else if (actor.faction === 'monster') {
           const distToPlayer = getDistance(myState.x, myState.y, currentPlayerPos.x, currentPlayerPos.y);
           if (distToPlayer <= 1.5) {
             const dmg = Math.max(1, actor.attack - 5);
             setPlayerHp(prev => {
               const next = prev - dmg;
               if (next <= 0) {
                 setGameOver(true);
                 onPlayerDeath();
               }
               return next;
             });
             addLog(`${actor.name}の攻撃！ ${dmg}ダメージ`);
             audioManager.playSeDamage(); // プレイヤー被弾音
           } else {
             if (currentPlayerPos.x > myState.x && dungeon.tiles[myState.y][myState.x + 1] !== 'wall') newX++;
             else if (currentPlayerPos.x < myState.x && dungeon.tiles[myState.y][myState.x - 1] !== 'wall') newX--;
             else if (currentPlayerPos.y > myState.y && dungeon.tiles[myState.y + 1][myState.x] !== 'wall') newY++;
             else if (currentPlayerPos.y < myState.y && dungeon.tiles[myState.y - 1][myState.x] !== 'wall') newY--;
           }
        }

        const isBlocked = nextEnemies.some((e, i) => i !== idx && e.hp > 0 && e.x === newX && e.y === newY) ||
                          (currentPlayerPos.x === newX && currentPlayerPos.y === newY);
        
        if (!isBlocked) {
          nextEnemies[idx].x = newX;
          nextEnemies[idx].y = newY;
        }
      });

      return nextEnemies.filter(e => e.hp > 0);
    });
  };

  const useSkill = (skillId: string) => {
    if (gameOver || !dungeon) return;
    
    if ((skillCooldowns[skillId] || 0) > 0) {
      addLog(`スキル準備中... (あと${skillCooldowns[skillId]}ターン)`);
      // audioManager.playSeCancel();
      return;
    }

    const skill = skillData.find(s => s.id === skillId);
    if (!skill) return;

    let performed = false;

    if (skill.target === 'self') {
      if (skill.type === 'heal') {
        const healAmount = skill.power;
        setPlayerHp(prev => Math.min(playerMaxHp, prev + healAmount));
        addLog(`${skill.name}！ HPが${healAmount}回復した。`);
        audioManager.playSeSelect(); // 回復音（選択音で代用）
        performed = true;
      }
    } 
    else if (skill.type === 'attack') {
      if (skill.target === 'single') {
        const target = enemies
          .filter(e => e.hp > 0 && e.faction === 'monster')
          .map(e => ({ ...e, dist: getDistance(playerPos.x, playerPos.y, e.x, e.y) }))
          .filter(e => e.dist <= skill.range)
          .sort((a, b) => a.dist - b.dist)[0];

        if (target) {
          const damage = Math.floor(playerAttack * skill.power); 
          addLog(`${skill.name}！ ${target.name}に${damage}の大ダメージ！`);
          applyDamageToEnemy(target.uniqueId, damage);
          // スキル攻撃音
          audioManager.playSeAttack(); // 必要なら別の音にする
          performed = true;
        } else {
          addLog("対象が範囲内にいない！");
          return;
        }
      } else if (skill.target === 'area') {
        const targets = enemies.filter(e => 
          e.hp > 0 && 
          e.faction === 'monster' && 
          getDistance(playerPos.x, playerPos.y, e.x, e.y) <= skill.range
        );
        
        if (targets.length > 0) {
          addLog(`${skill.name}！ 周囲の敵を薙ぎ払った！`);
          targets.forEach(t => {
            const damage = Math.floor(playerAttack * skill.power);
            applyDamageToEnemy(t.uniqueId, damage);
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
  };

  const movePlayer = (dx: number, dy: number) => {
    if (gameOver || !dungeon) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (dungeon.tiles[newY][newX] === 'wall') return;

    const targetEnemy = enemies.find(e => e.x === newX && e.y === newY);
    if (targetEnemy) {
        if (targetEnemy.faction === 'monster') {
            const damage = Math.max(1, playerAttack - targetEnemy.defense);
            addLog(`攻撃！ ${targetEnemy.name}に${damage}ダメージ`);
            applyDamageToEnemy(targetEnemy.uniqueId, damage);
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
    if (newX === dungeon.stairs.x && newY === dungeon.stairs.y) {
        addLog('階段を降りた。');
        audioManager.playSeSelect(); // 階段音
        initFloor(floor + 1);
    }
    processTurn();
  };

  return {
    dungeon,
    playerPos,
    enemies,
    floor,
    gameOver,
    messageLog,
    movePlayer,
    useSkill,
    skillCooldowns,
    playerHp,
    playerMaxHp
  };
};
