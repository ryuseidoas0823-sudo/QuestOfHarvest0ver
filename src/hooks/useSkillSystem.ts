import { useCallback } from 'react';
import { GameState, Position } from '../types';
import { SKILLS, JOB_SKILL_TREE } from '../data/skills';
import { calculateDamage } from '../utils/battle'; 
import { Skill, SkillEffect, PlayerSkillState } from '../types/skill';

export const useSkillSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {

  // Modifier適用ロジック
  // ベーススキルに対し、習得済みのModifierの効果を適用して新しいSkillオブジェクトを返す
  const applyModifiers = useCallback((baseSkill: Skill, learnedSkills: PlayerSkillState): { skill: Skill, logMessages: string[] } => {
    let modifiedSkill = { ...baseSkill };
    let baseEffect = { ...(baseSkill.baseEffect || {}) };
    let logMessages: string[] = [];

    // このスキルの親IDを持つModifierスキルを探す
    // NOTE: 効率化のため、本来は関連マップを持つべきだが、ここでは全スキル走査(数が少ないため許容)
    // または JOB_SKILL_TREE から探す手もある
    Object.keys(learnedSkills).forEach(learnedId => {
        const level = learnedSkills[learnedId];
        if (level <= 0) return;

        const modDef = SKILLS[learnedId];
        if (modDef && modDef.type === 'modifier' && modDef.parentSkillId === baseSkill.id) {
            
            // --- Modifierごとの効果定義 (Switch case for implementation) ---
            switch (modDef.id) {
                case 'impact': // Power Strike -> 範囲攻撃化
                    modifiedSkill.targetType = 'area';
                    modifiedSkill.areaRadius = (modifiedSkill.areaRadius || 0) + 1;
                    baseEffect.value = (baseEffect.value || 1.0) * 0.9; // 範囲化する代わりに倍率少し低下
                    logMessages.push('衝撃波が拡散する！(Impact)');
                    break;

                case 'ignite': // Fireball -> 範囲拡大 + 燃焼
                    modifiedSkill.areaRadius = (modifiedSkill.areaRadius || 0) + 1;
                    baseEffect.status = 'burn'; // 燃焼付与
                    baseEffect.value = (baseEffect.value || 1.0) * 1.2; // 威力アップ
                    modifiedSkill.mpCost = (modifiedSkill.mpCost || 0) + 4; // コスト増
                    logMessages.push('炎が激しく燃え上がる！(Ignite)');
                    break;

                // 今後追加されるModifier...
            }
        }
    });

    modifiedSkill.baseEffect = baseEffect;
    return { skill: modifiedSkill, logMessages };
  }, []);


  const increaseMastery = useCallback((jobId: string) => {
    setGameState(prev => {
      const currentLevel = prev.player.jobState.masteryLevels[jobId] || 0;
      if (currentLevel >= 50) return prev; 

      return {
        ...prev,
        player: {
          ...prev.player,
          jobState: {
            ...prev.player.jobState,
            masteryLevels: {
              ...prev.player.jobState.masteryLevels,
              [jobId]: currentLevel + 1
            }
          }
        }
      };
    });
  }, [setGameState]);

  const learnSkill = useCallback((skillId: string) => {
    setGameState(prev => {
      const skill = SKILLS[skillId];
      if (!skill) return prev;

      const currentLevel = (prev.player as any).skills?.[skillId] || 0;
      if (currentLevel >= skill.maxLevel) return prev;

      return {
        ...prev,
        player: {
          ...prev.player,
          skills: {
            ...(prev.player as any).skills,
            [skillId]: currentLevel + 1
          }
        }
      };
    });
  }, [setGameState]);

  // アクティブスキル使用
  const useActiveSkill = useCallback(async (skillId: string, targetId?: string, targetPos?: Position) => {
    setGameState(prev => {
      const originalSkill = SKILLS[skillId];
      if (!originalSkill) return prev;

      const player = prev.player;
      const learnedSkills = (player as any).skills || {};

      // 1. Modifierの適用
      const { skill: modifiedSkill, logMessages: modLogs } = applyModifiers(originalSkill, learnedSkills);
      
      // MPチェック
      if (modifiedSkill.mpCost && player.stats.mp < modifiedSkill.mpCost) {
        addLog('MPが足りない！', 'warning');
        return prev;
      }

      // --- ターゲットと影響範囲の決定 ---
      let centerPos: Position | null = null;
      
      if (targetPos) {
        centerPos = targetPos;
      } else if (targetId) {
        const targetEnemy = prev.enemies.find(e => e.id === targetId);
        if (targetEnemy) centerPos = targetEnemy.position;
      } else if (modifiedSkill.targetType === 'self') {
        centerPos = player.position;
      }

      if (!centerPos && modifiedSkill.targetType !== 'none') {
        addLog('対象が見つかりません。', 'warning');
        return prev;
      }

      // --- 効果適用対象の検索 ---
      let targets: typeof prev.enemies = [];
      
      if (modifiedSkill.targetType === 'self') {
        // 自分自身への処理は後述
      } else {
        const radius = modifiedSkill.areaRadius || 0;

        if (radius > 0 && centerPos) {
          // 範囲攻撃
          targets = prev.enemies.filter(enemy => {
             const dist = Math.abs(enemy.position.x - centerPos!.x) + Math.abs(enemy.position.y - centerPos!.y);
             return dist <= radius;
          });
        } else if (targetId) {
          // 単体指定
          const t = prev.enemies.find(e => e.id === targetId);
          if (t) targets = [t];
        } else if (targetPos && radius === 0) {
           // 地点指定 (1マス)
           targets = prev.enemies.filter(enemy => 
             enemy.position.x === targetPos.x && enemy.position.y === targetPos.y
           );
        }
      }

      // --- 実行処理 (状態更新) ---
      let newEnemies = [...prev.enemies];
      let newPlayer = { 
          ...player, 
          stats: { ...player.stats, mp: player.stats.mp - (modifiedSkill.mpCost || 0) } 
      };
      
      const skillName = modifiedSkill.name + (modLogs.length > 0 ? '+' : '');
      const actionLogs: string[] = [`${skillName}を発動！`, ...modLogs];

      // 敵への効果
      if (targets.length > 0) {
          targets.forEach(target => {
              const baseDamage = player.stats.attack;
              const skillMultiplier = modifiedSkill.baseEffect?.value || 1.0;
              const defense = 0; // 簡易防御

              let damage = Math.floor((baseDamage * skillMultiplier) - defense);
              damage = Math.max(1, damage + Math.floor(Math.random() * 5 - 2));

              // 状態異常ログ
              if (modifiedSkill.baseEffect?.status) {
                  actionLogs.push(`${target.name}は${modifiedSkill.baseEffect.status}状態になった！`);
                  // TODO: 実際のステータス異常付与処理は Enemy型に statusEffects 配列などを追加して管理する
              }

              newEnemies = newEnemies.map(e => {
                  if (e.id === target.id) {
                      return { ...e, hp: Math.max(0, e.hp - damage) };
                  }
                  return e;
              });

              actionLogs.push(`${target.name}に${damage}のダメージ！`);
          });
      } else if (modifiedSkill.targetType !== 'self') {
          actionLogs.push('効果範囲に敵がいなかった。');
      }

      // 自分への効果 (回復・バフ)
      if (modifiedSkill.baseEffect?.type === 'heal_hp') {
          const healAmount = modifiedSkill.baseEffect.value || 0;
          newPlayer.stats.hp = Math.min(newPlayer.stats.maxHp, newPlayer.stats.hp + healAmount);
          actionLogs.push(`HPが${healAmount}回復した。`);
      }
      if (modifiedSkill.baseEffect?.type === 'buff') {
          // TODO: バフ管理の実装
          actionLogs.push(`${modifiedSkill.baseEffect.status}の効果を得た！`);
      }

      // 敵死亡処理
      const deadEnemies = newEnemies.filter(e => e.hp <= 0);
      newEnemies = newEnemies.filter(e => e.hp > 0);
      deadEnemies.forEach(e => {
          actionLogs.push(`${e.name}を倒した！`);
          // 経験値処理など
      });

      // ログ出力
      actionLogs.forEach(msg => addLog(msg));

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies
      };
    });
  }, [setGameState, addLog, applyModifiers]);

  return {
    increaseMastery,
    learnSkill,
    useActiveSkill
  };
};
