import { useCallback } from 'react';
import { GameState, Position } from '../types';
import { SKILLS, JOB_SKILL_TREE } from '../data/skills';
import { calculateDamage } from '../utils/battle'; // 既存の戦闘計算を利用
import { Skill, SkillEffect } from '../types/skill';

export const useSkillSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (message: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {

  // マスタリーレベル上昇
  const increaseMastery = useCallback((jobId: string) => {
    setGameState(prev => {
      const currentLevel = prev.player.jobState.masteryLevels[jobId] || 0;
      // 最大レベル制限などはここでチェック
      if (currentLevel >= 50) return prev; // 仮の上限

      // SP消費ロジックがあればここに追加

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

  // スキル習得
  const learnSkill = useCallback((skillId: string) => {
    setGameState(prev => {
      const skill = SKILLS[skillId];
      if (!skill) return prev;

      // 習得条件チェック（マスタリーレベルなど）
      // ...（省略）

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

  // アクティブスキル使用（範囲攻撃・地点指定対応版）
  const useActiveSkill = useCallback(async (skillId: string, targetId?: string, targetPos?: Position) => {
    setGameState(prev => {
      const skill = SKILLS[skillId];
      if (!skill) return prev;

      const player = prev.player;
      
      // MPチェック
      if (skill.mpCost && player.stats.mp < skill.mpCost) {
        addLog('MPが足りない！', 'warning');
        return prev;
      }

      // クールダウンチェック (簡易実装)
      // ...

      // --- Modifierスキルの適用チェック ---
      // 習得済みのスキルの中から、このスキルを親に持つModifierを探す
      // 例: 'power_strike' 使用時に 'impact' (Modifier) を持っているか
      let modifiedSkill = { ...skill };
      const learnedSkills = (player as any).skills || {};
      
      Object.keys(learnedSkills).forEach(learnedId => {
        const modSkill = SKILLS[learnedId];
        if (modSkill.type === 'modifier' && modSkill.parentSkillId === skillId && learnedSkills[learnedId] > 0) {
           // Modifierの効果を適用（簡易的なハードコード例）
           // 本来はModifierデータに効果定義を持たせて動的に計算するのが望ましい
           if (modSkill.id === 'impact') {
               // インパクト: 単体攻撃を範囲攻撃化
               modifiedSkill.targetType = 'area';
               modifiedSkill.areaRadius = (modifiedSkill.areaRadius || 0) + 1;
               addLog('インパクト効果発動！', 'info');
           }
        }
      });

      // --- ターゲットと影響範囲の決定 ---
      let centerPos: Position | null = null;
      
      // 1. 座標指定があればそれを優先 (地点指定スキル)
      if (targetPos) {
        centerPos = targetPos;
      } 
      // 2. ターゲットIDがあればその敵の座標を使用 (ターゲット指定スキル)
      else if (targetId) {
        const targetEnemy = prev.enemies.find(e => e.id === targetId);
        if (targetEnemy) centerPos = targetEnemy.position;
      }
      // 3. 自分自身 (バフなど)
      else if (modifiedSkill.targetType === 'self') {
        centerPos = player.position;
      }

      // ターゲット不成立
      if (!centerPos && modifiedSkill.targetType !== 'none') {
        addLog('対象が見つかりません。', 'warning');
        return prev;
      }

      // --- 効果適用対象の検索 ---
      let targets: typeof prev.enemies = [];
      
      if (modifiedSkill.targetType === 'self') {
        // 自分への効果（回復・バフ）
        // ここでは敵リストに入れない
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
            // 範囲0の地点指定攻撃（そのマスの敵のみ）
            targets = prev.enemies.filter(enemy => 
                enemy.position.x === targetPos.x && enemy.position.y === targetPos.y
            );
        }
      }

      // --- ダメージ計算と状態更新 ---
      let newEnemies = [...prev.enemies];
      let newPlayer = { ...player, stats: { ...player.stats, mp: player.stats.mp - (modifiedSkill.mpCost || 0) } };
      let logMessages: string[] = [`${modifiedSkill.name}を発動！`];

      // 敵へのダメージ処理
      targets.forEach(target => {
          // ダメージ計算 (battle.tsのロジックを流用または独自計算)
          // ここでは簡易計算: 攻撃力 * スキル倍率
          // クリティカル判定などは calculateDamage に任せるのが理想だが、
          // スキル倍率を渡すために簡易実装する
          
          const baseDamage = player.stats.attack; // 基礎攻撃力
          const skillMultiplier = modifiedSkill.baseEffect?.value || 1.0;
          
          // 乱数と防御力（簡易）
          const defense = 0; // 敵の防御力データが必要
          let damage = Math.floor((baseDamage * skillMultiplier) - defense);
          damage = Math.max(1, damage + Math.floor(Math.random() * 5 - 2));

          // 状態異常付与
          if (modifiedSkill.baseEffect?.status) {
              // TODO: 状態異常ロジック
              logMessages.push(`${target.name}に${modifiedSkill.baseEffect.status}を与えた！`);
          }

          // 敵HP更新
          newEnemies = newEnemies.map(e => {
              if (e.id === target.id) {
                  return {
                      ...e,
                      hp: Math.max(0, e.hp - damage)
                  };
              }
              return e;
          });

          logMessages.push(`${target.name}に${damage}のダメージ！`);
          
          // ダメージ表示エフェクト用のログ（今回はテキストログのみ）
      });
      
      // 敵死亡判定
      const deadEnemies = newEnemies.filter(e => e.hp <= 0);
      newEnemies = newEnemies.filter(e => e.hp > 0);
      
      deadEnemies.forEach(e => {
          logMessages.push(`${e.name}を倒した！`);
          // 経験値取得などの処理
          // newPlayer.exp += e.exp...
      });

      // 自分への効果（回復など）
      if (modifiedSkill.baseEffect?.type === 'heal_hp') {
          const healAmount = modifiedSkill.baseEffect.value || 0;
          newPlayer.stats.hp = Math.min(newPlayer.stats.maxHp, newPlayer.stats.hp + healAmount);
          logMessages.push(`HPが${healAmount}回復した。`);
      }

      // ログ出力
      logMessages.forEach(msg => addLog(msg));

      return {
        ...prev,
        player: newPlayer,
        enemies: newEnemies
      };
    });
  }, [setGameState, addLog]);

  return {
    increaseMastery,
    learnSkill,
    useActiveSkill
  };
};
