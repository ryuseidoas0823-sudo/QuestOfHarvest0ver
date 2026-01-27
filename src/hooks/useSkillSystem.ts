import { useCallback } from 'react';
import { GameState, PlayerState } from '../types/gameState';
import { EnemyInstance } from '../types/enemy';
import { Skill, SkillEffect } from '../types/skill';
import { StatusEffect } from '../types/combat';

export const useSkillSystem = (
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
) => {
  
  // 状態異常付与のヘルパー関数
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

  // スキル効果の適用ロジック（抜粋）
  const applySkillEffect = useCallback((user: PlayerState | EnemyInstance, target: PlayerState | EnemyInstance, skill: Skill) => {
    const effects: StatusEffect[] = [];
    let damage = 0;
    let message = '';

    // ダメージ計算ロジック（省略）...
    
    // 追加効果（状態異常）の処理
    if (skill.effects) {
      skill.effects.forEach(effect => {
        if (effect.type === 'status') {
           // 確率判定
           if (Math.random() < (effect.chance || 1.0)) {
             let statusType: StatusEffect['type'] = 'debuff';
             let statusName = 'Debuff';
             let duration = effect.duration || 3;

             // スキルデータに基づいてStatusTypeをマッピング
             if (effect.value === 'poison') { statusType = 'poison'; statusName = '毒'; }
             else if (effect.value === 'burn') { statusType = 'burn'; statusName = '燃焼'; }
             else if (effect.value === 'stun') { statusType = 'stun'; statusName = 'スタン'; duration = 1; }
             else if (effect.value === 'regen') { statusType = 'regen'; statusName = '再生'; }
             
             const newStatus = createStatusEffect(statusType, statusName, duration);
             
             // 既存の同種効果がないか確認（重複しない場合）
             const existingIdx = target.statusEffects.findIndex(s => s.type === statusType);
             if (existingIdx >= 0) {
               // 上書き（期間更新）
               target.statusEffects[existingIdx] = newStatus;
               message += ` ${statusName}の効果時間が更新された！`;
             } else {
               target.statusEffects.push(newStatus);
               message += ` ${statusName}を与えた！`;
             }
           }
        }
      });
    }

    return { damage, message };
  }, []);

  return {
    applySkillEffect,
    createStatusEffect
  };
};
