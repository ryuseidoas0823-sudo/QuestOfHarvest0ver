import { useCallback } from 'react';
import { GameState, LogMessage } from '../types/gameState';
import { JobId } from '../types/job';
import { SKILLS, JOB_SKILL_TREE } from '../data/skills';
import { JOBS } from '../data/jobs';
import { calculatePhysicalAttack } from '../utils/battle'; // 追加
import { Enemy } from '../types/enemy'; // 追加
import { CombatEntity } from '../types/combat'; // 追加
import { calculateTotalStats } from '../utils/stats'; // 追加
import { ITEMS } from '../data/items'; // 追加

// プレイヤー変換ヘルパー (useTurnSystemと重複するため、本来はutilsに切り出すべきだが今回はここに再定義)
const playerToEntity = (player: any): CombatEntity => {
    const totalStats = calculateTotalStats(player);
    let weaponBonusStr = 0;
    if (player.equipment?.mainHand) {
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
            str: totalStats.str + weaponBonusStr,
            hp: player.hp,
            maxHp: totalStats.maxHp,
            mp: player.mp,
            maxMp: totalStats.maxMp, // 追加
            level: player.level
        },
        ct: player.ct
    };
};

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
    },
    ct: enemy.ct
});


export const useSkillSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: LogMessage['type']) => void
) => {

  const increaseMastery = useCallback((jobId: JobId) => {
    setGameState(prev => {
      const { player } = prev;
      if (player.skillPoints <= 0) return prev;
      const currentMastery = player.jobState.mastery[jobId] || 0;
      if (currentMastery >= 50) return prev;

      return {
        ...prev,
        player: {
          ...player,
          skillPoints: player.skillPoints - 1,
          jobState: {
            ...player.jobState,
            mastery: { ...player.jobState.mastery, [jobId]: currentMastery + 1 }
          }
        }
      };
    });
  }, [setGameState]);

  const learnSkill = useCallback((skillId: string) => {
    setGameState(prev => {
      const { player } = prev;
      const skill = SKILLS[skillId];
      if (!skill || player.skillPoints <= 0) return prev;

      let ownerJobId: JobId | undefined;
      Object.entries(JOB_SKILL_TREE).forEach(([jId, skills]) => {
        if (skills.includes(skillId)) ownerJobId = jId as JobId;
      });
      if (!ownerJobId) return prev;

      const masteryLevel = player.jobState.mastery[ownerJobId] || 0;
      if (masteryLevel < skill.tier) return prev;

      if (skill.parentSkillId) {
        const parentLevel = (player as any).skills?.[skill.parentSkillId] || 0;
        if (parentLevel <= 0) return prev;
      }

      const newSkills = { ...((player as any).skills || {}) };
      const currentLevel = newSkills[skillId] || 0;
      if (currentLevel >= skill.maxLevel) return prev;
      
      newSkills[skillId] = currentLevel + 1;

      return {
        ...prev,
        player: {
          ...player,
          skillPoints: player.skillPoints - 1,
          // @ts-ignore
          skills: newSkills
        }
      };
    });
  }, [setGameState]);

  /**
   * スキルを使用する (戦闘アクション)
   */
  const useActiveSkill = useCallback(async (skillId: string, targetEnemyId?: string) => {
    // 非同期処理が必要な場合（アニメーションウェイトなど）のためにasync
    // 実際にはsetGameState内で完結させるか、呼び出し元で制御する
    
    // この関数は「プレイヤーのターン消費アクション」として振る舞う必要があるため、
    // useTurnSystem との連携が必要。
    // 今回は、stateを更新しつつ、ターン経過フラグを立てるような処理を行う。
    // しかし、useTurnSystem の handlePlayerAttack のように、
    // 攻撃処理 -> ターン経過 -> 敵ターン という流れを作るには、
    // この関数を useTurnSystem 側に組み込むか、
    // useGameCore で統合する必要がある。
    
    // ここでは「計算結果を返す」または「Stateを更新して結果を通知する」に留め、
    // 実際のターン進行は呼び出し元(useGameCore等)で行うのが綺麗だが、
    // 既存の handlePlayerAttack に倣って実装する。
    
    let success = false;

    setGameState(prev => {
        const player = prev.player;
        const skill = SKILLS[skillId];
        const skillLevel = (player as any).skills?.[skillId] || 0;

        // チェック: 習得済みか
        if (skillLevel <= 0) {
            addLog('スキルを習得していません', 'warning');
            return prev;
        }

        // チェック: MP不足
        if (skill.mpCost && player.mp < skill.mpCost) {
            addLog('MPが足りません', 'warning');
            return prev;
        }

        // チェック: クールダウン (今回は未実装、常にOKとする)

        let newPlayer = { ...player };
        let newEnemies = [...prev.enemies];
        let actionLog = '';

        // MP消費
        if (skill.mpCost) {
            newPlayer.mp -= skill.mpCost;
        }

        // 効果発動
        if (skill.type === 'active') {
            if (skill.baseEffect?.type === 'damage') {
                // 敵単体攻撃の場合
                if (!targetEnemyId) {
                    // ターゲット指定がない場合、目の前の敵を自動選択するか、エラー
                    // 簡易的に「一番近い敵」または「向いている方向の敵」を探す
                    // ここではターゲット必須とする（呼び出し元で指定）
                    addLog('対象がいません', 'warning');
                    return prev; // MP消費もキャンセルすべきだが、簡易実装
                }

                const enemyIndex = newEnemies.findIndex(e => e.id === targetEnemyId);
                if (enemyIndex === -1) return prev;

                const enemy = newEnemies[enemyIndex];
                const playerEntity = playerToEntity(newPlayer);
                const enemyEntity = enemyToEntity(enemy);

                // Modifierの適用 (impact等)
                // 親スキルIDを持つ習得済みスキルを探し、効果を合成する処理が必要
                // 今回は簡易的に baseEffect のみ使用

                const result = calculatePhysicalAttack(playerEntity, enemyEntity, skill.baseEffect);
                
                actionLog = `${skill.name}！ ${result.message}`;
                
                const newEnemyHp = Math.max(0, enemy.hp - result.damage);
                if (newEnemyHp <= 0) {
                    addLog(`${enemy.name}を倒した！`, 'success');
                    // 経験値処理は省略 (useTurnSystem側でやるべきだが...)
                    newEnemies = newEnemies.filter(e => e.id !== targetEnemyId);
                } else {
                    newEnemies[enemyIndex] = { ...enemy, hp: newEnemyHp };
                }
            } else if (skill.baseEffect?.type === 'buff') {
                // 自己バフなど
                actionLog = `${skill.name}を使用！ (バフ効果は未実装)`;
            }
        }

        if (actionLog) addLog(actionLog, 'info');
        success = true;

        // ターン経過 (CT消費)
        // newPlayer.ct -= 100; // これはuseTurnSystemで管理すべき

        return {
            ...prev,
            player: newPlayer,
            enemies: newEnemies,
            turn: prev.turn + 1 // 暫定
        };
    });

    return success;
  }, [setGameState, addLog]);

  return {
    increaseMastery,
    learnSkill,
    useActiveSkill
  };
};
