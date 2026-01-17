import React from 'react';
import { PlayerEntity, MenuType, Biome, Attributes, Item } from '../types';
import { ShoppingBag, User, Settings, Compass, Save, X, Monitor, Loader } from 'lucide-react';
import { BIOME_NAMES_JP } from '../App';

interface GameHUDProps {
  uiState: PlayerEntity;
  worldInfo: {x:number, y:number, biome:Biome};
  toggleMenu: (m: MenuType) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ uiState, worldInfo, toggleMenu }) => (
  <>
    <div className="absolute top-4 right-20 flex gap-4 text-white pointer-events-none">
       <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex items-center gap-2">
          <Compass size={16} className="text-yellow-500" />
          <span className="font-mono">{BIOME_NAMES_JP[worldInfo.biome] || worldInfo.biome} ({worldInfo.x}, {worldInfo.y})</span>
       </div>
    </div>

    <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-white w-64 shadow-lg pointer-events-auto">
        <div className="flex justify-between items-center mb-2"><span className="font-bold text-yellow-500">{uiState.job} Lv.{uiState.level}</span><span className="text-xs text-slate-400">GOLD: {uiState.gold}</span></div>
        <div className="mb-2 space-y-1 text-xs text-slate-300">
           <div className="flex justify-between"><span>攻撃: {uiState.attack}</span><span>防御: {uiState.defense}</span></div>
           <div className="flex justify-between"><span>速度: {uiState.speed.toFixed(1)}</span></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span>HP</span><span>{uiState.hp}/{uiState.maxHp}</span></div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(uiState.hp/uiState.maxHp)*100}%` }}></div></div>
        </div>
         <div>
          <div className="flex justify-between text-xs mb-0.5"><span>XP</span><span>{uiState.xp}/{uiState.nextLevelXp}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(uiState.xp/uiState.nextLevelXp)*100}%` }}></div></div>
        </div>
      </div>
    </div>

    <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
      <button onClick={() => toggleMenu('inventory')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><ShoppingBag size={20} />{uiState?.inventory.length ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> : null}</button>
      <button onClick={() => toggleMenu('stats')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><User size={20} />{uiState && uiState.statPoints > 0 ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span> : null}</button>
      <button onClick={() => toggleMenu('status')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600"><Settings size={20} /></button>
    </div>
  </>
);

interface InventoryMenuProps {
  uiState: PlayerEntity;
  onEquip: (item: Item) => void;
  onUnequip: (slot: keyof PlayerEntity['equipment']) => void;
  onClose: () => void;
}

export const InventoryMenu: React.FC<InventoryMenuProps> = ({ uiState, onEquip, onUnequip, onClose }) => (
  <div className="bg-slate-900 border border-slate-600 rounded-lg w-full max-w-4xl h-[600px] flex text-white overflow-hidden shadow-2xl">
    <div className="w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-yellow-500 mb-2 border-b border-slate-700 pb-2">装備</h3>
      {[{ slot: 'mainHand', label: '右手', icon: '⚔️' }, { slot: 'offHand', label: '左手', icon: '🛡️' }, { slot: 'helm', label: '頭', icon: '🪖' }, { slot: 'armor', label: '体', icon: '🛡️' }, { slot: 'boots', label: '足', icon: '👢' }].map((s: any) => {
        const item = uiState.equipment[s.slot as keyof PlayerEntity['equipment']];
        return (
          <div key={s.slot} className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 relative group">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded">{item ? item.icon : s.icon}</div>
            <div className="flex-1"><div className="text-xs text-slate-400 uppercase">{s.label}</div><div className={`font-bold text-sm ${item ? '' : 'text-slate-600'}`} style={{ color: item?.color }}>{item ? item.name : 'なし'}</div></div>
            {item && (<button onClick={() => onUnequip(s.slot)} className="absolute right-2 top-2 p-1 hover:bg-red-900 rounded text-slate-400 hover:text-red-200"><X size={14} /></button>)}
          </div>
        );
      })}
    </div>
    <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
      <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">持ち物 ({uiState.inventory.length})</h3><button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X /></button></div>
      <div className="grid grid-cols-2 gap-3">
        {uiState.inventory.map((item) => (
          <div key={item.id} onClick={() => onEquip(item)} className="flex gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500 rounded cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate" style={{ color: item.color }}>{item.name}</div>
              <div className="text-xs text-slate-400">{item.type} {item.subType ? `(${item.subType})` : ''}</div>
              <div className="text-xs mt-1 grid grid-cols-2 gap-x-2 text-slate-300">
                {item.stats.attack > 0 && <span>攻撃 +{item.stats.attack}</span>} {item.stats.defense > 0 && <span>防御 +{item.stats.defense}</span>}
              </div>
            </div>
          </div>
        ))}
        {uiState.inventory.length === 0 && (<div className="col-span-2 text-center text-slate-500 py-10">アイテムがありません。</div>)}
      </div>
    </div>
  </div>
);

interface SettingsMenuProps {
  isSaving: boolean;
  saveGame: () => void;
  setScreen: (s: any) => void;
  setActiveMenu: (m: MenuType) => void;
  resolution: any;
  setResolution: (r: any) => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isSaving, saveGame, setScreen, setActiveMenu, resolution, setResolution }) => (
    <div className="bg-slate-800 p-8 rounded-lg border border-slate-600 min-w-[300px] text-white">
        <h2 className="text-2xl font-bold mb-6 text-center border-b border-slate-600 pb-2">メニュー</h2>
        
        <div className="mb-6">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
            <Monitor size={14} /> Screen Size
        </label>
        <div className="grid grid-cols-2 gap-2">
            {[
            { label: 'AUTO', val: 'auto' }, 
            { label: 'SVGA (800x600)', val: '800x600' },
            { label: 'XGA (1024x768)', val: '1024x768' },
            { label: 'HD (1280x720)', val: '1280x720' }
            ].map(opt => (
            <button 
                key={opt.val}
                onClick={() => setResolution(opt.val)}
                className={`px-3 py-2 text-xs rounded border transition-colors ${
                resolution === opt.val 
                    ? 'bg-yellow-600 border-yellow-500 text-white' 
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
            >
                {opt.label}
            </button>
            ))}
        </div>
        </div>

        <div className="space-y-3">
        <button onClick={saveGame} disabled={isSaving} className="w-full py-3 bg-blue-700 hover:bg-blue-600 rounded font-bold flex items-center justify-center gap-2">{isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}{isSaving ? '保存中...' : 'ゲームを保存'}</button>
        <button onClick={() => { setScreen('title'); setActiveMenu('none'); }} className="w-full py-3 bg-red-900/50 hover:bg-red-900 rounded border border-red-800 text-red-100 mt-8">タイトルに戻る</button>
        <button onClick={() => setActiveMenu('none')} className="w-full py-2 text-slate-400 hover:text-white mt-2">閉じる</button>
        </div>
    </div>
);

interface StatsMenuProps {
    uiState: PlayerEntity;
    increaseStat: (attr: keyof Attributes) => void;
    setActiveMenu: (m: MenuType) => void;
}

export const StatsMenu: React.FC<StatsMenuProps> = ({ uiState, increaseStat, setActiveMenu }) => (
    <div className="bg-slate-900 border border-slate-600 rounded-lg w-[500px] p-6 text-white shadow-2xl relative">
        <button onClick={() => setActiveMenu('none')} className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded"><X /></button>
        <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center gap-2"><User /> ステータス</h2>
        <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-4"><div><div className="text-3xl font-bold">{uiState.job}</div><div className="text-slate-400">レベル {uiState.level}</div></div><div className="text-right"><div className="text-sm text-slate-400">残りポイント</div><div className="text-3xl font-bold text-yellow-400">{uiState.statPoints}</div></div></div>
        <div className="space-y-4 mb-6">
        {[ { key: 'vitality', label: '体力', desc: '最大HPが増加' }, { key: 'strength', label: '筋力', desc: '物理攻撃力が増加' }, { key: 'dexterity', label: '器用さ', desc: '攻撃速度が増加' }, { key: 'intelligence', label: '知力', desc: '最大MPと魔法攻撃力が増加' }, { key: 'endurance', label: '耐久', desc: '防御力が増加' }, ].map((stat) => (
            <div key={stat.key} className="flex items-center justify-between bg-slate-800 p-3 rounded">
            <div><div className="font-bold text-lg">{stat.label}</div><div className="text-xs text-slate-500">{stat.desc}</div></div>
            <div className="flex items-center gap-4"><span className="text-2xl font-mono">{uiState.attributes[stat.key as keyof Attributes]}</span><button onClick={() => increaseStat(stat.key as keyof Attributes)} disabled={uiState.statPoints <= 0} className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xl ${uiState.statPoints > 0 ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>+</button></div>
            </div>
        ))}
        </div>
    </div>
);
