import { useCallback } from 'react';
import { GameState, Position, Enemy } from '../types/gameState';
import { SKILLS } from '../data/skills';
import { Skill, PlayerSkillState } from '../types/skill';
import { StatusEffect } from '../types/combat';

export const useSkillSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {

  // --- Modifier適用ロジック ---
  // ベーススキルに対し、習得済みのModifierの効果を適用して新しいSkillオブジェクトを返す
  const applyModifiers = useCallback((baseSkill: Skill, learnedSkills: PlayerSkillState) => {
    let modifiedSkill = { ...baseSkill };
    let baseEffect = { ...(baseSkill.baseEffect || {}) };
    let logMessages: string[] = [];

    // 習得済みスキルを走査し、このスキルのModifierがあれば適用
    Object.keys(learnedSkills).forEach(learnedId => {
        const level = learnedSkills[learnedId];
        if (level <= 0) return;

        const modDef = SKILLS[learnedId];
        if (modDef && modDef.type === 'modifier' && modDef.parentSkillId === baseSkill.id) {
            
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
                
                // 将来的なModifierはここに追加
            }
        }
    });

    modifiedSkill.baseEffect = baseEffect;
    return { skill: modifiedSkill, logMessages };
  }, []);


  // --- マスタリーレベル上昇 ---
  const increaseMastery = useCallback((jobId: string) => {
    setGameState(prev => {
      const currentLevel = prev.player.jobState.masteryLevels[jobId] || 0;
      // 仮の上限: 50
      if (currentLevel >= 50) return prev; 

      // 将来的にはSP消費などのコストが必要
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


  // --- スキル習得 ---
  const learnSkill = useCallback((skillId: string) => {
    setGameState(prev => {
      const skill = SKILLS[skillId];
      if (!skill) return prev;

      // 前提条件チェック（マスタリーレベル、前提スキル、SPなど）はUI側またはここで実装
      // ...

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


  // --- アクティブスキル使用 ---
  const useActiveSkill = useCallback(async (skillId: string, targetId?: string, targetPos?: Position) => {
    setGameState(prev => {
      const originalSkill = SKILLS[skillId];
      if (!originalSkill) return prev;

      const player = prev.player;
      const learnedSkills = (player as any).skills || {};

      // 1. Modifierの適用
      const { skill: modifiedSkill, logMessages: modLogs } = applyModifiers(originalSkill, learnedSkills);
      
      // 2. クールダウンチェック
      const currentCD = player.cooldowns?.[skillId] || 0;
      if (currentCD > 0) {
        addLog(`${modifiedSkill.name}はまだ使えない (あと${currentCD}ターン)`, 'warning');
        return prev;
      }

      // 3. MPチェック
      if (modifiedSkill.mpCost && player.stats.mp < modifiedSkill.mpCost) {
        addLog('MPが足りない！', 'warning');
        return prev;
      }

      // 4. 排他スキル(Exclusive)の処理
      // 起動しようとしているスキルと排他関係にあるスキルが既にActiveなら解除する
      // また、自分が既にActiveなら解除する（トグル動作）
      let newStatusEffects = [...(player.statusEffects || [])];
      
      if (modifiedSkill.type === 'exclusive') {
          // 既に自分が発動中かチェック -> 発動中なら解除して終了
          const selfIndex = newStatusEffects.findIndex(e => e.id === skillId);
          if (selfIndex >= 0) {
              newStatusEffects.splice(selfIndex, 1);
              addLog(`${modifiedSkill.name}を解除した。`, 'info');
              // トグルOFFの場合はここでリターン（クールダウンは発生しない、あるいは短縮するなど）
              return {
                  ...prev,
                  player: { ...prev.player, statusEffects: newStatusEffects }
              };
          }

          // 排他関係にある他スキルを強制解除
          if (modifiedSkill.mutuallyExclusiveWith) {
              modifiedSkill.mutuallyExclusiveWith.forEach(exId => {
                  const exIndex = newStatusEffects.findIndex(e => e.id === exId);
                  if (exIndex >= 0) {
                      const exSkillName = SKILLS[exId]?.name || exId;
                      newStatusEffects.splice(exIndex, 1);
                      addLog(`${exSkillName}の効果が切れた。`, 'info');
                  }
              });
          }
      }

      // 5. ターゲット中心座標の決定
      let centerPos: Position | null = null;
      
      if (targetPos) {
        centerPos = targetPos;
      } else if (targetId) {
        const targetEnemy = prev.enemies.find(e => e.id === targetId);
        if (targetEnemy) centerPos = targetEnemy.position;
      } else if (modifiedSkill.targetType === 'self') {
        centerPos = player.position;
      }

      // ターゲット不成立チェック (ターゲット不要スキル以外)
      if (!centerPos && modifiedSkill.targetType !== 'none') {
        addLog('対象が見つかりません。', 'warning');
        return prev;
      }

      // 6. 効果適用対象の検索
      let targets: Enemy[] = [];
      
      if (modifiedSkill.targetType === 'self') {
          // 自分自身への効果は後続の処理で行う
      } else {
        const radius = modifiedSkill.areaRadius || 0;

        if (radius > 0 && centerPos) {
          // 範囲攻撃: 中心座標から radius 以内の敵を全て対象にする
          targets = prev.enemies.filter(enemy => {
             const dist = Math.abs(enemy.position.x - centerPos!.x) + Math.abs(enemy.position.y - centerPos!.y);
             return dist <= radius;
          });
        } else if (targetId) {
          // 単体攻撃
          const t = prev.enemies.find(e => e.id === targetId);
          if (t) targets = [t];
        } else if (targetPos && radius === 0) {
           // 地点指定 (1マス)
           targets = prev.enemies.filter(enemy => 
             enemy.position.x === targetPos.x && enemy.position.y === targetPos.y
           );
        }
      }

      // --- 実行と状態更新 ---
      
      let newEnemies = [...prev.enemies];
      let newPlayer = { 
          ...player, 
          statusEffects: newStatusEffects,
          stats: { ...player.stats, mp: player.stats.mp - (modifiedSkill.mpCost || 0) },
          cooldowns: { 
              ...(player.cooldowns || {}), 
              [skillId]: modifiedSkill.cooldown || 0 // クールダウン設定
          }
      };
      
      const skillName = modifiedSkill.name + (modLogs.length > 0 ? '+' : '');
      const actionLogs: string[] = [`${skillName}を発動！`, ...modLogs];

      // A. 敵へのダメージ＆デバフ処理
      if (targets.length > 0) {
          targets.forEach(target => {
              const baseDamage = player.stats.attack;
              const skillMultiplier = modifiedSkill.baseEffect?.value || 1.0;
              // 簡易ダメージ計算 (乱数あり)
              let damage = Math.floor(baseDamage * skillMultiplier);
              damage = Math.max(1, damage + Math.floor(Math.random() * 5 - 2));

              let targetNewEffects = [...(target.statusEffects || [])];

              // 状態異常付与 (Burn, Poison, Stun...)
              if (modifiedSkill.baseEffect?.status) {
                  const statusType = modifiedSkill.baseEffect.status;
                  
                  // 同じIDの状態異常があれば更新、なければ追加
                  const existingIdx = targetNewEffects.findIndex(e => e.id === skillId);
                  
                  const newEffect: StatusEffect = {
                      id: skillId,
                      type: statusType as any,
                      name: statusType.toUpperCase(),
                      duration: 3, // TODO: スキルデータにduration定義を持たせる
                      value: Math.floor(baseDamage * 0.2), // DoT威力 (例: 攻撃力の20%)
                      sourceId: 'player'
                  };

                  if (existingIdx >= 0) targetNewEffects[existingIdx] = newEffect;
                  else targetNewEffects.push(newEffect);
                  
                  actionLogs.push(`${target.name}に${statusType}を与えた！`);
              }

              // 敵の状態更新
              newEnemies = newEnemies.map(e => {
                  if (e.id === target.id) {
                      return { 
                          ...e, 
                          hp: Math.max(0, e.hp - damage),
                          statusEffects: targetNewEffects
                      };
                  }
                  return e;
              });

              actionLogs.push(`${target.name}に${damage}のダメージ！`);
          });
      } else if (modifiedSkill.targetType !== 'self' && modifiedSkill.targetType !== 'none') {
          actionLogs.push('効果範囲に敵がいなかった。');
      }

      // B. 自分への効果 (回復・バフ・排他スキル)
      if (modifiedSkill.targetType === 'self' || modifiedSkill.baseEffect?.type === 'buff') {
          // HP回復
          if (modifiedSkill.baseEffect?.type === 'heal_hp') {
              const healAmount = modifiedSkill.baseEffect.value || 0;
              newPlayer.stats.hp = Math.min(newPlayer.stats.maxHp, newPlayer.stats.hp + healAmount);
              actionLogs.push(`HPが${healAmount}回復した。`);
          }
          
          // バフ付与 (Exclusiveスキル含む)
          if (modifiedSkill.baseEffect?.status) {
             const statusType = modifiedSkill.baseEffect.status;
             
             // Exclusiveバフは通常永続(999ターン)で、トグル操作で解除する運用
             const duration = modifiedSkill.type === 'exclusive' ? 999 : (modifiedSkill.baseEffect.duration || 5);

             const newEffect: StatusEffect = {
                  id: skillId,
                  type: statusType as any,
                  name: modifiedSkill.name,
                  duration: duration,
                  value: modifiedSkill.baseEffect.value,
                  sourceId: 'player'
             };
             
             newPlayer.statusEffects.push(newEffect);
             actionLogs.push(`${modifiedSkill.name}の状態になった！`);
          }
      }

      // 敵死亡処理
      const deadEnemies = newEnemies.filter(e => e.hp <= 0);
      newEnemies = newEnemies.filter(e => e.hp > 0);
      deadEnemies.forEach(e => {
          actionLogs.push(`${e.name}を倒した！`);
          // 経験値取得ロジックなどはここに
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
