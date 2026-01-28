import React, { useState } from 'react';
import { PlayerState, PlayerStats } from '../types/gameState';
import { calculatePlayerStats } from '../utils/stats';
import { StatIcon } from '../utils/statusIcons'; // 仮: アイコン用コンポーネント

interface Props {
  player: PlayerState;
  onUpgrade: (stat: keyof PlayerStats, amount: number) => void;
  onClose: () => void;
}

export const StatusUpgradeMenu: React.FC<Props> = ({ player, onUpgrade, onClose }) => {
  // UI内での一時的な割り振り状態を管理
  // 確定ボタンを押すまでは実際のステータスには反映しない（キャンセル可能にするため）
  const [allocated, setAllocated] = useState({
    str: 0,
    vit: 0,
    dex: 0,
    agi: 0,
    int: 0,
    wis: 0
  });

  const remainingPoints = player.statPoints - Object.values(allocated).reduce((a, b) => a + b, 0);

  // プレビュー用の仮プレイヤーオブジェクトを作成して計算
  const getPreviewStats = () => {
    const previewPlayer = {
      ...player,
      str: player.str + allocated.str,
      vit: player.vit + allocated.vit,
      dex: player.dex + allocated.dex,
      agi: player.agi + allocated.agi,
      int: player.int + allocated.int,
      wis: player.wis + allocated.wis,
    };
    return calculatePlayerStats(previewPlayer);
  };

  const currentStats = player.stats;
  const previewStats = getPreviewStats();

  const handleAllocate = (stat: keyof typeof allocated, amount: number) => {
    if (amount > 0 && remainingPoints <= 0) return;
    if (amount < 0 && allocated[stat] <= 0) return;
    setAllocated(prev => ({ ...prev, [stat]: prev[stat] + amount }));
  };

  const handleConfirm = () => {
    // まとめて反映
    Object.entries(allocated).forEach(([key, amount]) => {
      if (amount > 0) {
        onUpgrade(key as keyof PlayerStats, amount);
      }
    });
    // リセット
    setAllocated({ str: 0, vit: 0, dex: 0, agi: 0, int: 0, wis: 0 });
  };

  const StatRow = ({ label, statKey, description }: { label: string, statKey: keyof typeof allocated, description: string }) => {
    const baseVal = player[statKey];
    const addVal = allocated[statKey];
    
    return (
      <div className="flex items-center justify-between bg-slate-800 p-2 rounded mb-2 border border-slate-700">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-yellow-500">{label}</span>
            <span className="text-white text-lg">{baseVal + addVal}</span>
            {addVal > 0 && <span className="text-green-400 text-sm">(+{addVal})</span>}
          </div>
          <div className="text-xs text-slate-400">{description}</div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 rounded p-1">
          <button 
            className={`w-8 h-8 rounded flex items-center justify-center font-bold ${addVal > 0 ? 'bg-red-900 text-red-200 hover:bg-red-700' : 'bg-slate-700 text-slate-500'}`}
            onClick={() => handleAllocate(statKey, -1)}
            disabled={addVal <= 0}
          >
            -
          </button>
          <button 
            className={`w-8 h-8 rounded flex items-center justify-center font-bold ${remainingPoints > 0 ? 'bg-green-700 text-green-100 hover:bg-green-600' : 'bg-slate-700 text-slate-500'}`}
            onClick={() => handleAllocate(statKey, 1)}
            disabled={remainingPoints <= 0}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  // 派生ステータスの変化を表示
  const DerivedStat = ({ label, current, preview }: { label: string, current: number, preview: number }) => {
    const diff = preview - current;
    return (
      <div className="flex justify-between text-sm py-1 border-b border-slate-800 last:border-0">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono">
          {preview}
          {diff > 0 && <span className="text-green-400 ml-1">▲{diff}</span>}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-slate-600 rounded-lg w-full max-w-4xl h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* 左側: ポイント割り振り */}
        <div className="flex-1 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">ステータス強化</h2>
          <div className="bg-slate-800/50 p-3 rounded mb-4 text-center">
            <span className="text-slate-300">残りポイント: </span>
            <span className={`text-2xl font-bold ${remainingPoints > 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-500'}`}>
              {remainingPoints}
            </span>
          </div>

          <div className="space-y-1">
            <StatRow label="STR (筋力)" statKey="str" description="物理攻撃力、所持重量" />
            <StatRow label="VIT (体力)" statKey="vit" description="最大HP、物理防御力" />
            <StatRow label="DEX (器用)" statKey="dex" description="命中率、クリティカル率" />
            <StatRow label="AGI (敏捷)" statKey="agi" description="回避率、行動速度" />
            <StatRow label="INT (知力)" statKey="int" description="魔法攻撃力" />
            <StatRow label="WIS (精神)" statKey="wis" description="最大MP、魔法防御力" />
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded font-bold transition-colors"
              onClick={onClose}
            >
              閉じる
            </button>
            <button 
              className={`flex-1 py-3 rounded font-bold transition-colors ${Object.values(allocated).some(v => v > 0) ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500'}`}
              onClick={handleConfirm}
              disabled={!Object.values(allocated).some(v => v > 0)}
            >
              確定する
            </button>
          </div>
        </div>

        {/* 右側: 結果プレビュー */}
        <div className="w-full md:w-80 bg-slate-950 p-6 flex flex-col overflow-y-auto">
          <h3 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">能力値プレビュー</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-yellow-600 text-xs font-bold uppercase mb-1">Combat</h4>
              <DerivedStat label="HP" current={currentStats.maxHp} preview={previewStats.maxHp} />
              <DerivedStat label="MP" current={currentStats.maxMp} preview={previewStats.maxMp} />
              <DerivedStat label="Attack" current={currentStats.attack} preview={previewStats.attack} />
              <DerivedStat label="Defense" current={currentStats.defense} preview={previewStats.defense} />
              <DerivedStat label="M.Attack" current={currentStats.magicAttack} preview={previewStats.magicAttack} />
              <DerivedStat label="M.Defense" current={currentStats.magicDefense} preview={previewStats.magicDefense} />
            </div>

            <div>
              <h4 className="text-blue-500 text-xs font-bold uppercase mb-1">Utility</h4>
              <DerivedStat label="Speed" current={currentStats.speed} preview={previewStats.speed} />
              <DerivedStat label="Hit Rate" current={currentStats.hitRate} preview={previewStats.hitRate} />
              <DerivedStat label="Evasion" current={currentStats.evasion} preview={previewStats.evasion} />
              <DerivedStat label="Crit Rate" current={currentStats.critRate} preview={previewStats.critRate} />
            </div>
            
            <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-800 text-xs text-slate-500">
              <p>ステータスを上げると、戦闘能力が大幅に向上します。装備の要求ステータスを満たすためにも重要です。</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
