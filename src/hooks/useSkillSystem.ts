import { useCallback } from 'react';
import { GameState, PlayerState, Position } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { Skill, SkillEffect } from '../types/skill';
import { StatusEffect } from '../types/combat';
import { SKILLS } from '../data/skills';
import { calculateDamage } from '../utils/battle'; // 修正: ダメージ計算をインポート

export const useSkillSystem = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {
  
  // 状態異常付与のヘルパー
  const createStatusEffect = (
    type: StatusEffect['type'], 
    name: string, 
    duration: number, 
    value?: number
  ): StatusEffect => {
    return {
      id: crypto.randomUUID(),
      type,
      name,
      duration,
      value
    };
  };

  // マスタリー上昇
  const increaseMastery = useCallback((jobId: string) => {
      setGameState(prev => {
          const player = { ...prev.player };
          if (player.skillPoints <= 0) {
              addLog('スキルポイントが足りません', 'warning');
              return prev;
          }
          
          const current = player.mastery[jobId] || 0;
          if (current >= 50) return prev;

          player.mastery[jobId] = current + 1;
          player.skillPoints -= 1;
          
          // ステータスボーナス加算（ジョブ定義に基づく）は省略、本来はここでstatsも増やす
          addLog(`${jobId}のマスタリーが ${current + 1} に上がった！`, 'success');
          
          return { ...prev, player };
      });
  }, [setGameState, addLog]);

  // スキル習得・強化
  const learnSkill = useCallback((skillId: string) => {
      setGameState(prev => {
          const player = { ...prev.player };
          const skill = SKILLS[skillId];
          if (!skill) return prev;

          if (player.skillPoints <= 0) {
              addLog('スキルポイントが足りません', 'warning');
              return prev;
          }

          const currentLevel = player.skills[skillId] || 0;
          if (currentLevel >= skill.maxLevel) return prev;

          // 前提条件チェックなどはUI側で済んでいる想定だが、念の為
          // ...

          player.skills[skillId] = currentLevel + 1;
          player.skillPoints -= 1;
          addLog(`${skill.name} (Lv.${currentLevel + 1}) を習得した！`, 'success');

          return { ...prev, player };
      });
  }, [setGameState, addLog]);

  // アクティブスキル使用
  const useActiveSkill = useCallback(async (skillId: string, targetId?: string, targetPos?: Position) => {
      // ※ asyncにしているのはターン処理待ちなどを入れる余地のためだが、今回は即時更新
      
      setGameState(prev => {
          const player = { ...prev.player };
          const skill = SKILLS[skillId];
          if (!skill) return prev;

          // MPチェック
          if (player.mp < (skill.mpCost || 0)) {
              addLog('MPが足りません！', 'warning');
              return prev;
          }

          // 消費
          player.mp -= (skill.mpCost || 0);
          addLog(`${skill.name}を発動！`, 'info');

          // --- ユニーク効果: 無限の魔導書 (Infinite Grimoire) ---
          // MP消費0はStats計算(mpCostReduction)で処理されるが、
          // 「魔法を唱えるたびにランダムな状態異常」はここで処理
          const hasInfiniteGrimoire = player.equipment.mainHand?.id === 'unique_infinite_grimoire';
          
          // 魔導書かつ、スキルが魔法っぽい場合（Arcanistスキルなど）
          // 簡易的に全てのActiveスキルで発動する仕様とする
          if (hasInfiniteGrimoire) {
              const badEffects: {type: StatusEffect['type'], name: string}[] = [
                  { type: 'poison', name: '猛毒' },
                  { type: 'stun', name: '混乱' }, // stunで代用
                  { type: 'burn', name: '魔力焼け' }
              ];
              const randomEffect = badEffects[Math.floor(Math.random() * badEffects.length)];
              
              player.statusEffects.push(createStatusEffect(randomEffect.type, randomEffect.name, 3));
              addLog(`禁忌の代償... ${randomEffect.name}にかかった！`, 'danger');
          }
          // ----------------------------------------------------

          // 効果処理（簡易版：ダメージまたは自己バフ）
          let newEnemies = [...prev.enemies];

          if (skill.targetType === 'self') {
              if (skill.baseEffect?.type === 'buff') {
                  const buffName = skill.baseEffect.status === 'berserk' ? 'バーサーク' : 
                                   skill.baseEffect.status === 'guardian' ? '守護' : 'バフ';
                  player.statusEffects.push(createStatusEffect('buff', buffName, 5)); // 仮の5ターン
                  addLog(`${buffName}状態になった！`, 'success');
              }
              if (skill.baseEffect?.type === 'heal_hp') {
                  const heal = skill.baseEffect.value || 0; // 固定値または割合
                  player.hp = Math.min(player.maxHp, player.hp + heal);
                  addLog(`HPが回復した！`, 'success');
              }
          } else if (targetId) {
              // 単体攻撃
              const targetIndex = newEnemies.findIndex(e => e.id === targetId);
              if (targetIndex !== -1) {
                  const target = newEnemies[targetIndex];
                  const dmgMult = skill.baseEffect?.type === 'damage' ? (skill.baseEffect.value || 1) : 1;
                  
                  // スキル倍率を乗せてダメージ計算
                  const result = calculateDamage(player, target, dmgMult, true); // true=魔法扱いと仮定（本来はスキル属性による）
                  
                  const newTarget = { ...target, stats: { ...target.stats, hp: target.stats.hp - result.damage } };
                  addLog(`${target.name}に${result.damage}のダメージ！`, 'success');

                  if (newTarget.stats.hp <= 0) {
                      addLog(`${target.name}を倒した！`, 'info');
                      newEnemies.splice(targetIndex, 1);
                      // ドロップ処理などはuseTurnSystem側と重複するため、ここでは簡易化（あるいは共通関数化すべき）
                  } else {
                      newEnemies[targetIndex] = newTarget;
                  }
              }
          } else if (skill.targetType === 'area' && targetPos) {
              // 範囲攻撃（簡易実装: 指定座標にある敵のみ、あるいは全敵対象にするなど）
              // ここでは「指定座標にいる敵」のみヒットさせる
              const hitEnemies = newEnemies.filter(e => e.position.x === targetPos.x && e.position.y === targetPos.y);
              hitEnemies.forEach(target => {
                  const dmgMult = skill.baseEffect?.type === 'damage' ? (skill.baseEffect.value || 1) : 1;
                  const result = calculateDamage(player, target, dmgMult, true);
                  
                  target.stats.hp -= result.damage;
                  addLog(`${target.name}に${result.damage}のダメージ！`, 'success');
              });
              
              // 死亡処理
              newEnemies = newEnemies.filter(e => e.stats.hp > 0);
          }

          return {
              ...prev,
              player,
              enemies: newEnemies
          };
      });

      // 敵ターンへ遷移するかはアプリの設計次第だが、通常スキル使用も1ターン消費する
      // ここで processTurnCycle を呼び出す必要があるが、useTurnSystemから渡す必要がある
      // 今回は setGameState 内で完結させているため、親コンポーネントでターン進行をトリガーする必要がある
      // (App.tsxの実装を見ると、useActiveSkillの後に何か呼ぶ必要がある)
      
  }, [setGameState, addLog]);

  return {
    increaseMastery,
    learnSkill,
    useActiveSkill,
    applySkillEffect: () => {}, // 既存互換用
    createStatusEffect
  };
};
